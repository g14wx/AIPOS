// Spec buscar-producto, "RF-12 opcional: Enter con un código de barras exacto": con Enter y 2 o más caracteres el
// componente cancela la espera de 300 ms y busca de inmediato. Si entre los resultados hay un producto cuyo código de
// barras es igual al texto recortado, letra por letra, emite producto-elegido con él y limpia el campo. Si no, se ve
// "No hay un producto con ese código de barras". Aplica la misma regla de las respuestas viejas. La API se sustituye
// con vi.mock, la espera con vi.useFakeTimers y lottie-web con la ruta exacta que importa AnimacionLottie.
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

const { loadAnimation } = vi.hoisted(() => ({
  loadAnimation: vi.fn(() => ({ destroy: vi.fn(), goToAndStop: vi.fn(), totalFrames: 40 })),
}));

vi.mock('lottie-web/build/player/lottie_light', () => ({ default: { loadAnimation } }));
vi.mock('../../src/api/productos.js', () => ({ buscarProductos: vi.fn() }));

import { buscarProductos } from '../../src/api/productos.js';
import vuetify from '../../src/plugins/vuetify.js';
import BuscadorProductos from '../../src/components/BuscadorProductos.vue';

const ESPERA_MS = 300;
const SIN_CODIGO = 'No hay un producto con ese código de barras';

const leche = { id: 1, nombre: 'Leche entera 1 L', codigoBarras: '7501055300075', precio: '25.00' };
const jugo = { id: 2, nombre: 'Jugo 500 ml', codigoBarras: '222', precio: '12.00' };
const cable = { id: 3, nombre: 'Cable 222 USB', codigoBarras: '333', precio: '40.00' };

let wrapper;
let contenedor;
let consola;

function diferida() {
  const cuando = {};
  cuando.promesa = new Promise((resolver, rechazar) => {
    cuando.resolver = resolver;
    cuando.rechazar = rechazar;
  });
  return cuando;
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  contenedor = document.createElement('div');
  contenedor.setAttribute('data-app', 'true');
  document.body.appendChild(contenedor);
  consola = [vi.spyOn(console, 'error'), vi.spyOn(console, 'warn')];
  consola.forEach((espia) => espia.mockImplementation(() => {}));
  buscarProductos.mockReset();
  window.matchMedia = vi.fn((consulta) => ({
    matches: false,
    media: consulta,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

afterEach(() => {
  wrapper?.destroy();
  wrapper = null;
  contenedor.remove();
  vi.useRealTimers();
  const avisos = consola.flatMap((espia) => espia.mock.calls.map((llamada) => llamada.join(' ')));
  consola.forEach((espia) => espia.mockRestore());
  expect(avisos).toEqual([]);
});

async function asentar() {
  for (let i = 0; i < 6; i += 1) await Promise.resolve();
  await wrapper.vm.$nextTick();
}

async function montar() {
  const lugar = contenedor.appendChild(document.createElement('div'));
  wrapper = mount(BuscadorProductos, { vuetify, attachTo: lugar });
  await asentar();
}

const entrada = () => wrapper.find('input').element;
const zonaDeEstado = () => wrapper.find('[role="status"]');
const textoDeEstado = () => zonaDeEstado().text();
const filas = () => wrapper.findAll('li');
const botonDe = (texto) => wrapper.findAll('button').wrappers.find((b) => b.text() === texto);
const elegidos = () => wrapper.emitted('producto-elegido') ?? [];

async function escribir(texto) {
  const campo = entrada();
  campo.value = texto;
  campo.dispatchEvent(new Event('input', { bubbles: true }));
  await wrapper.vm.$nextTick();
}

async function avanzar(ms) {
  await vi.advanceTimersByTimeAsync(ms);
  await asentar();
}

async function presionarEnter() {
  await wrapper.find('input').trigger('keydown.enter');
  await asentar();
}

describe('Enter con menos de 2 caracteres', () => {
  it('no hace nada: ni llama a la API ni agrega ni cambia el mensaje', async () => {
    await montar();
    await presionarEnter();
    expect(buscarProductos).not.toHaveBeenCalled();
    expect(textoDeEstado()).toBe('');
    await escribir('7');
    await presionarEnter();
    await avanzar(1000);
    expect(buscarProductos).not.toHaveBeenCalled();
    expect(elegidos()).toHaveLength(0);
    expect(textoDeEstado()).toBe('Escribe al menos 2 caracteres');
  });

  it('una letra con espacios sigue siendo una sola letra', async () => {
    await montar();
    await escribir('   7  ');
    await presionarEnter();
    expect(buscarProductos).not.toHaveBeenCalled();
  });
});

describe('Enter con un código de barras exacto', () => {
  it('cancela la espera de 300 ms y busca de inmediato, con el texto recortado, una sola vez', async () => {
    buscarProductos.mockResolvedValue([leche]);
    await montar();
    await escribir('  7501055300075 ');
    expect(buscarProductos).not.toHaveBeenCalled();
    await presionarEnter();
    expect(buscarProductos).toHaveBeenCalledTimes(1);
    expect(buscarProductos).toHaveBeenCalledWith('7501055300075');
    await avanzar(1000);
    expect(buscarProductos).toHaveBeenCalledTimes(1);
  });

  it('emite producto-elegido con el producto, sin pasar por la lista, y limpia el campo (RF-12, criterio 1)', async () => {
    buscarProductos.mockResolvedValue([leche]);
    await montar();
    await escribir('7501055300075');
    await presionarEnter();
    expect(elegidos()).toHaveLength(1);
    expect(elegidos()[0]).toEqual([leche]);
    expect(entrada().value).toBe('');
    expect(wrapper.find('ul').exists()).toBe(false);
    expect(textoDeEstado()).toBe('');
    expect(document.activeElement).toBe(entrada());
  });

  it('busca el código de barras exacto entre todos los resultados, no solo en el primero', async () => {
    buscarProductos.mockResolvedValue([cable, jugo]);
    await montar();
    await escribir('222');
    await presionarEnter();
    expect(elegidos()).toHaveLength(1);
    expect(elegidos()[0][0]).toEqual(jugo);
  });

  it('el cajero sigue con el siguiente producto: escribe y la búsqueda sale sin tocar el ratón', async () => {
    buscarProductos.mockResolvedValue([leche]);
    await montar();
    await escribir('7501055300075');
    await presionarEnter();
    buscarProductos.mockResolvedValue([jugo]);
    await escribir('222');
    await presionarEnter();
    expect(elegidos().map(([producto]) => producto)).toEqual([leche, jugo]);
  });
});

describe('Enter con un código de barras que no es exacto', () => {
  it('sin ningún producto con ese código de barras se ve el mensaje, y no se agrega nada (RF-12, criterio 2)', async () => {
    buscarProductos.mockResolvedValue([]);
    await montar();
    await escribir('0000');
    await presionarEnter();
    expect(textoDeEstado()).toBe(SIN_CODIGO);
    expect(elegidos()).toHaveLength(0);
    expect(entrada().value).toBe('0000');
  });

  it('si el texto no coincide con nada, el mensaje reemplaza a "Sin resultados"', async () => {
    buscarProductos.mockResolvedValue([]);
    await montar();
    await escribir('0000');
    await presionarEnter();
    expect(wrapper.text()).not.toContain('Sin resultados');
    expect(wrapper.find('ul').exists()).toBe(false);
  });

  it('si el texto además coincide con nombres, esos resultados se muestran debajo del mensaje y el cajero elige uno', async () => {
    buscarProductos.mockResolvedValue([cable]);
    await montar();
    await escribir('222');
    await presionarEnter();
    expect(textoDeEstado()).toContain(SIN_CODIGO);
    expect(textoDeEstado()).toContain('1 resultado');
    expect(filas()).toHaveLength(1);
    expect(wrapper.text().indexOf(SIN_CODIGO)).toBeLessThan(
      wrapper.text().indexOf('Cable 222 USB'),
    );
    expect(elegidos()).toHaveLength(0);
    await filas().at(0).find('button').trigger('click');
    await asentar();
    expect(elegidos()[0][0]).toEqual(cable);
    expect(entrada().value).toBe('');
    expect(wrapper.text()).not.toContain(SIN_CODIGO);
  });

  it('la comparación es exacta, letra por letra: un pedazo del código de barras no cuenta', async () => {
    buscarProductos.mockResolvedValue([leche]);
    await montar();
    await escribir('750105530007');
    await presionarEnter();
    expect(elegidos()).toHaveLength(0);
    expect(textoDeEstado()).toContain(SIN_CODIGO);
    expect(filas()).toHaveLength(1);
  });

  it('las mayúsculas cuentan: MySQL devuelve "ABC-1" para "abc-1", pero no es el mismo texto', async () => {
    const abc = { id: 4, nombre: 'Tornillo', codigoBarras: 'ABC-1', precio: '1.00' };
    buscarProductos.mockResolvedValue([abc]);
    await montar();
    await escribir('abc-1');
    await presionarEnter();
    expect(elegidos()).toHaveLength(0);
    expect(textoDeEstado()).toContain(SIN_CODIGO);
    expect(filas()).toHaveLength(1);
  });

  it('al seguir escribiendo se va el mensaje: vuelve la búsqueda normal', async () => {
    buscarProductos.mockResolvedValue([]);
    await montar();
    await escribir('0000');
    await presionarEnter();
    expect(textoDeEstado()).toBe(SIN_CODIGO);
    buscarProductos.mockResolvedValue([]);
    await escribir('00001');
    expect(textoDeEstado()).toBe('Buscando…');
    await avanzar(ESPERA_MS);
    expect(textoDeEstado()).toBe('Sin resultados');
  });
});

describe('Enter y las respuestas viejas', () => {
  it('si el cajero sigue escribiendo, la respuesta de un Enter anterior se ignora y no agrega nada', async () => {
    const respuesta = diferida();
    buscarProductos.mockReturnValue(respuesta.promesa);
    await montar();
    await escribir('7501055300075');
    await presionarEnter();
    await escribir('75010553000759');
    respuesta.resolver([leche]);
    await asentar();
    expect(elegidos()).toHaveLength(0);
    expect(entrada().value).toBe('75010553000759');
    expect(textoDeEstado()).toBe('Buscando…');
  });

  it('si el cajero borra el texto, la respuesta de un Enter anterior tampoco agrega nada', async () => {
    const respuesta = diferida();
    buscarProductos.mockReturnValue(respuesta.promesa);
    await montar();
    await escribir('7501055300075');
    await presionarEnter();
    await escribir('');
    respuesta.resolver([leche]);
    await asentar();
    expect(elegidos()).toHaveLength(0);
    expect(textoDeEstado()).toBe('');
  });

  it('un Enter repetido no agrega dos veces: solo cuenta la respuesta del último', async () => {
    const primera = diferida();
    const segunda = diferida();
    buscarProductos.mockReturnValueOnce(primera.promesa).mockReturnValueOnce(segunda.promesa);
    await montar();
    await escribir('7501055300075');
    await presionarEnter();
    await presionarEnter();
    expect(buscarProductos).toHaveBeenCalledTimes(2);
    primera.resolver([leche]);
    await asentar();
    expect(elegidos()).toHaveLength(0);
    segunda.resolver([leche]);
    await asentar();
    expect(elegidos()).toHaveLength(1);
  });
});

describe('Enter cuando la llamada falla', () => {
  it('se ve el error con "Reintentar", el texto sigue en el campo y no se agrega nada', async () => {
    buscarProductos.mockRejectedValue(Object.assign(new Error('x'), { status: 0 }));
    await montar();
    await escribir('7501055300075');
    await presionarEnter();
    expect(textoDeEstado()).toContain('No se pudo buscar. Intenta de nuevo.');
    expect(botonDe('Reintentar')).toBeDefined();
    expect(entrada().value).toBe('7501055300075');
    expect(elegidos()).toHaveLength(0);
  });

  it('"Reintentar" repite la búsqueda como Enter: si ahora hay un código de barras exacto, se agrega', async () => {
    buscarProductos.mockRejectedValueOnce(Object.assign(new Error('x'), { status: 0 }));
    await montar();
    await escribir('7501055300075');
    await presionarEnter();
    buscarProductos.mockResolvedValue([leche]);
    await botonDe('Reintentar').trigger('click');
    await asentar();
    expect(buscarProductos).toHaveBeenCalledTimes(2);
    expect(elegidos()).toHaveLength(1);
    expect(elegidos()[0][0]).toEqual(leche);
    expect(entrada().value).toBe('');
  });
});
