// Spec buscar-producto, "Pantalla: campo de búsqueda y resultados (P-05)": BuscadorProductos es el campo "Buscar
// producto" con su lista de resultados. Espera 300 ms sin cambios y busca desde 2 caracteres, ignora las respuestas de
// búsquedas viejas, muestra uno solo de sus seis estados y avisa con el evento producto-elegido. La API se sustituye
// con vi.mock, la espera con vi.useFakeTimers y lottie-web (que jsdom no dibuja) con la ruta exacta que importa
// AnimacionLottie.
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

const { loadAnimation, instancias } = vi.hoisted(() => {
  const instancias = [];
  const loadAnimation = vi.fn((opciones) => {
    const instancia = { opciones, totalFrames: 40, destroy: vi.fn(), goToAndStop: vi.fn() };
    instancias.push(instancia);
    return instancia;
  });
  return { loadAnimation, instancias };
});

vi.mock('lottie-web/build/player/lottie_light', () => ({ default: { loadAnimation } }));
vi.mock('../../src/api/productos.js', () => ({ buscarProductos: vi.fn() }));

import { buscarProductos } from '../../src/api/productos.js';
import vuetify from '../../src/plugins/vuetify.js';
import buscando from '../../src/assets/animaciones/buscando.json';
import AnimacionLottie from '../../src/components/AnimacionLottie.vue';
import BuscadorProductos from '../../src/components/BuscadorProductos.vue';

// La espera de la spec, escrita otra vez a propósito: si cambia la constante del componente, esta prueba avisa.
const ESPERA_MS = 300;

const leche = { id: 1, nombre: 'Leche entera 1 L', codigoBarras: '7501055300075', precio: '25.00' };
const jugo = { id: 2, nombre: 'Jugo 50% fruta', codigoBarras: '111', precio: '18.50' };
const galletas = (cuantas) =>
  Array.from({ length: cuantas }, (_, i) => ({
    id: i + 1,
    nombre: `Galleta ${String(i + 1).padStart(2, '0')}`,
    codigoBarras: String(1000 + i),
    precio: '10.00',
  }));

let wrapper;
let contenedor;
let consola;

function preferirMenosMovimiento(reducir) {
  window.matchMedia = vi.fn((consulta) => ({
    matches: reducir && consulta.includes('prefers-reduced-motion'),
    media: consulta,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

// Una respuesta que la prueba entrega cuando quiere: sirve para hacer que una respuesta llegue tarde.
function diferida() {
  const cuando = {};
  cuando.promesa = new Promise((resolver, rechazar) => {
    cuando.resolver = resolver;
    cuando.rechazar = rechazar;
  });
  return cuando;
}

beforeEach(() => {
  // Solo se falsean setTimeout y clearTimeout: nextTick de Vue y las promesas siguen siendo de verdad.
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  contenedor = document.createElement('div');
  contenedor.setAttribute('data-app', 'true');
  document.body.appendChild(contenedor);
  consola = [vi.spyOn(console, 'error'), vi.spyOn(console, 'warn')];
  consola.forEach((espia) => espia.mockImplementation(() => {}));
  buscarProductos.mockReset();
  loadAnimation.mockClear();
  instancias.length = 0;
  preferirMenosMovimiento(false);
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

// Deja pasar las promesas pendientes y el dibujo de Vue.
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

// El cajero escribe y deja pasar la espera: la búsqueda sale y la respuesta llega (si ya está lista).
async function escribirYBuscar(texto) {
  await escribir(texto);
  await avanzar(ESPERA_MS);
}

describe('el campo de búsqueda', () => {
  it('tiene un solo elemento raíz, una búsqueda (role="search") y ningún texto guardado', async () => {
    await montar();
    expect(wrapper.element.nodeType).toBe(1);
    expect(wrapper.attributes('role')).toBe('search');
    expect(entrada().value).toBe('');
  });

  it('tiene la etiqueta "Buscar producto", la ayuda "Nombre o código de barras" y la lupa', async () => {
    await montar();
    expect(wrapper.find('label').text()).toBe('Buscar producto');
    expect(wrapper.text()).toContain('Nombre o código de barras');
    expect(wrapper.find('.mdi-magnify').exists()).toBe(true);
  });

  it('tiene el foco al abrir la pantalla: el cajero escribe o escanea sin tocar nada', async () => {
    await montar();
    expect(document.activeElement).toBe(entrada());
  });

  it('con el texto escrito ofrece un botón para borrar, con su nombre en español', async () => {
    await montar();
    await escribir('le');
    const borrar = wrapper.find('[aria-label="Borrar lo escrito en Buscar producto"]');
    expect(borrar.exists()).toBe(true);
  });
});

describe('estado inicial y pocos caracteres', () => {
  it('con el texto vacío no se ve ningún mensaje ni resultados, y no se llama a la API', async () => {
    await montar();
    await avanzar(1000);
    expect(zonaDeEstado().exists()).toBe(true);
    expect(textoDeEstado()).toBe('');
    expect(wrapper.find('ul').exists()).toBe(false);
    expect(buscarProductos).not.toHaveBeenCalled();
  });

  it('con solo espacios pasa lo mismo que con el texto vacío', async () => {
    await montar();
    await escribir('     ');
    await avanzar(1000);
    expect(textoDeEstado()).toBe('');
    expect(buscarProductos).not.toHaveBeenCalled();
  });

  it('con una sola letra se ve "Escribe al menos 2 caracteres" y no se llama a la API', async () => {
    await montar();
    await escribir('l');
    expect(textoDeEstado()).toBe('Escribe al menos 2 caracteres');
    await avanzar(1000);
    expect(buscarProductos).not.toHaveBeenCalled();
    expect(textoDeEstado()).toBe('Escribe al menos 2 caracteres');
  });

  it('el texto se recorta: una letra con espacios sigue siendo una sola letra', async () => {
    await montar();
    await escribir('   a ');
    await avanzar(1000);
    expect(textoDeEstado()).toBe('Escribe al menos 2 caracteres');
    expect(buscarProductos).not.toHaveBeenCalled();
  });

  it('los caracteres se cuentan como los cuenta la API: un emoji es uno solo', async () => {
    await montar();
    await escribir('😀');
    await avanzar(1000);
    expect(textoDeEstado()).toBe('Escribe al menos 2 caracteres');
    expect(buscarProductos).not.toHaveBeenCalled();
    buscarProductos.mockResolvedValue([]);
    await escribirYBuscar('😀😀');
    expect(buscarProductos).toHaveBeenCalledWith('😀😀');
  });
});

describe('la espera de 300 ms', () => {
  it('con 2 o más caracteres espera 300 ms sin cambios y llama con el texto ya recortado', async () => {
    buscarProductos.mockResolvedValue([leche]);
    await montar();
    await escribir('  lech  ');
    await avanzar(ESPERA_MS - 1);
    expect(buscarProductos).not.toHaveBeenCalled();
    await avanzar(1);
    expect(buscarProductos).toHaveBeenCalledTimes(1);
    expect(buscarProductos).toHaveBeenCalledWith('lech');
  });

  it('cada tecla nueva reinicia la espera: "le", "lec" y "lech" seguido hacen una sola llamada, con "lech"', async () => {
    buscarProductos.mockResolvedValue([leche]);
    await montar();
    await escribir('le');
    await avanzar(200);
    await escribir('lec');
    await avanzar(200);
    await escribir('lech');
    await avanzar(ESPERA_MS - 1);
    expect(buscarProductos).not.toHaveBeenCalled();
    await avanzar(1);
    expect(buscarProductos).toHaveBeenCalledTimes(1);
    expect(buscarProductos).toHaveBeenCalledWith('lech');
  });

  it('escribir y borrar dentro de la espera no llama a la API', async () => {
    await montar();
    await escribir('lech');
    await avanzar(200);
    await escribir('');
    await avanzar(1000);
    expect(buscarProductos).not.toHaveBeenCalled();
    expect(textoDeEstado()).toBe('');
  });

  it('dejar una sola letra dentro de la espera tampoco llama a la API', async () => {
    await montar();
    await escribir('lech');
    await avanzar(200);
    await escribir('l');
    await avanzar(1000);
    expect(buscarProductos).not.toHaveBeenCalled();
    expect(textoDeEstado()).toBe('Escribe al menos 2 caracteres');
  });

  it('un espacio al final no cambia el texto recortado: no reinicia la espera ni busca otra vez', async () => {
    buscarProductos.mockResolvedValue([leche]);
    await montar();
    await escribirYBuscar('lech');
    expect(buscarProductos).toHaveBeenCalledTimes(1);
    await escribir('lech ');
    await avanzar(1000);
    expect(buscarProductos).toHaveBeenCalledTimes(1);
    expect(filas()).toHaveLength(1);
  });
});

describe('buscando', () => {
  it('mientras espera la respuesta se ve la animación buscando con "Buscando…", y nada más', async () => {
    buscarProductos.mockReturnValue(diferida().promesa);
    await montar();
    await escribirYBuscar('lech');
    expect(buscarProductos).toHaveBeenCalledTimes(1);
    expect(textoDeEstado()).toBe('Buscando…');
    expect(wrapper.find('ul').exists()).toBe(false);
    const animacion = wrapper.findComponent(AnimacionLottie);
    expect(animacion.exists()).toBe(true);
    expect(animacion.props('animacion')).toEqual(buscando);
    expect(loadAnimation).toHaveBeenCalledTimes(1);
    expect(loadAnimation.mock.calls[0][0].animationData).toEqual(buscando);
  });

  it('la animación es decorativa: aria-hidden, y el texto de al lado dice lo mismo', async () => {
    buscarProductos.mockReturnValue(diferida().promesa);
    await montar();
    await escribirYBuscar('lech');
    expect(wrapper.findComponent(AnimacionLottie).attributes('aria-hidden')).toBe('true');
    expect(zonaDeEstado().find('[aria-hidden="true"]').exists()).toBe(true);
  });

  it('desde el segundo carácter ya se ve "Buscando…": la espera de 300 ms también es buscar', async () => {
    buscarProductos.mockReturnValue(diferida().promesa);
    await montar();
    await escribir('le');
    expect(buscarProductos).not.toHaveBeenCalled();
    expect(textoDeEstado()).toBe('Buscando…');
  });

  it('al llegar la respuesta la animación se quita y se destruye', async () => {
    const respuesta = diferida();
    buscarProductos.mockReturnValue(respuesta.promesa);
    await montar();
    await escribirYBuscar('lech');
    expect(wrapper.findComponent(AnimacionLottie).exists()).toBe(true);
    respuesta.resolver([leche]);
    await asentar();
    expect(wrapper.findComponent(AnimacionLottie).exists()).toBe(false);
    expect(instancias[0].destroy).toHaveBeenCalled();
    expect(textoDeEstado()).not.toContain('Buscando');
  });

  it('con menos movimiento la animación no se reproduce: queda un cuadro fijo', async () => {
    preferirMenosMovimiento(true);
    buscarProductos.mockReturnValue(diferida().promesa);
    await montar();
    await escribirYBuscar('lech');
    const opciones = loadAnimation.mock.calls[0][0];
    expect(opciones.autoplay).toBe(false);
    expect(opciones.loop).toBe(false);
    expect(instancias[0].goToAndStop).toHaveBeenCalledWith(instancias[0].totalFrames - 1, true);
  });

  it('con movimiento normal la animación se repite mientras dura la espera', async () => {
    buscarProductos.mockReturnValue(diferida().promesa);
    await montar();
    await escribirYBuscar('lech');
    const opciones = loadAnimation.mock.calls[0][0];
    expect(opciones.autoplay).toBe(true);
    expect(opciones.loop).toBe(true);
  });
});

describe('con resultados', () => {
  it('muestra una fila por producto: el nombre, el código de barras debajo y el precio a la derecha, sin símbolo de moneda', async () => {
    buscarProductos.mockResolvedValue([leche, jugo]);
    await montar();
    await escribirYBuscar('lech');
    expect(filas()).toHaveLength(2);
    const texto = filas().at(0).text();
    expect(texto).toMatch(/Leche entera 1 L\s*7501055300075\s*25\.00/);
    expect(filas().at(1).text()).toMatch(/Jugo 50% fruta\s*111\s*18\.50/);
    expect(wrapper.find('ul').text()).not.toMatch(/[$€£]/);
  });

  it('es una lista de verdad (ul con li), y no queda ni la animación ni un mensaje de búsqueda', async () => {
    buscarProductos.mockResolvedValue([leche, jugo]);
    await montar();
    await escribirYBuscar('lech');
    expect(wrapper.find('ul').exists()).toBe(true);
    expect(wrapper.findAll('ul > li')).toHaveLength(2);
    expect(wrapper.findComponent(AnimacionLottie).exists()).toBe(false);
    expect(textoDeEstado()).not.toContain('Buscando');
    expect(textoDeEstado()).not.toContain('Sin resultados');
  });

  it('cada fila es un botón de verdad: se alcanza con Tab y se elige con Enter o espacio', async () => {
    buscarProductos.mockResolvedValue([leche, jugo]);
    await montar();
    await escribirYBuscar('lech');
    for (const fila of filas().wrappers) {
      const boton = fila.find('button');
      expect(boton.exists()).toBe(true);
      expect(boton.attributes('type')).toBe('button');
      expect(boton.attributes('disabled')).toBeUndefined();
      expect(boton.attributes('tabindex')).toBeUndefined();
    }
  });

  it('un lector de pantalla oye el nombre, el código de barras y el precio de cada fila', async () => {
    buscarProductos.mockResolvedValue([leche]);
    await montar();
    await escribirYBuscar('lech');
    expect(filas().at(0).find('button').attributes('aria-label')).toBe(
      'Leche entera 1 L, código de barras 7501055300075, precio 25.00',
    );
  });

  it('anuncia cuántos resultados hay en la región de estado, sin dibujar la lista ahí', async () => {
    buscarProductos.mockResolvedValue([leche, jugo]);
    await montar();
    await escribirYBuscar('lech');
    expect(zonaDeEstado().text()).toBe('2 resultados');
    expect(zonaDeEstado().find('ul').exists()).toBe(false);
    buscarProductos.mockResolvedValue([leche]);
    await escribirYBuscar('leche');
    expect(zonaDeEstado().text()).toBe('1 resultado');
  });

  it('con 20 resultados agrega la nota "Se muestran los primeros 20. Escribe más para afinar la búsqueda"', async () => {
    buscarProductos.mockResolvedValue(galletas(20));
    await montar();
    await escribirYBuscar('galleta');
    expect(filas()).toHaveLength(20);
    expect(wrapper.text()).toContain(
      'Se muestran los primeros 20. Escribe más para afinar la búsqueda',
    );
  });

  it('con 19 resultados, o con uno, no hay nota', async () => {
    buscarProductos.mockResolvedValue(galletas(19));
    await montar();
    await escribirYBuscar('galleta');
    expect(filas()).toHaveLength(19);
    expect(wrapper.text()).not.toContain('Se muestran los primeros');
    buscarProductos.mockResolvedValue([leche]);
    await escribirYBuscar('leche');
    expect(wrapper.text()).not.toContain('Se muestran los primeros');
  });

  it('el nombre y el código de barras son texto: un nombre como <b>x</b> se ve con esas letras y sin negritas (RNF-04)', async () => {
    const producto = { id: 9, nombre: '<b>x</b>', codigoBarras: '<i>1</i>', precio: '5.00' };
    buscarProductos.mockResolvedValue([producto]);
    await montar();
    await escribirYBuscar('<b>');
    const fila = filas().at(0);
    expect(fila.text()).toContain('<b>x</b>');
    expect(fila.text()).toContain('<i>1</i>');
    expect(fila.find('b').exists()).toBe(false);
    expect(fila.find('i').exists()).toBe(false);
    expect(wrapper.find('ul b').exists()).toBe(false);
  });
});

describe('sin resultados', () => {
  it('con la lista vacía se ve "Sin resultados", sin lista ni nota', async () => {
    buscarProductos.mockResolvedValue([]);
    await montar();
    await escribirYBuscar('zzzz');
    expect(textoDeEstado()).toBe('Sin resultados');
    expect(wrapper.find('ul').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('Se muestran los primeros');
    expect(wrapper.findComponent(AnimacionLottie).exists()).toBe(false);
  });

  it('al escribir otro texto se quita el mensaje: no queda a la vista algo que ya no corresponde', async () => {
    buscarProductos.mockResolvedValue([]);
    await montar();
    await escribirYBuscar('zzzz');
    expect(textoDeEstado()).toBe('Sin resultados');
    buscarProductos.mockReturnValue(diferida().promesa);
    await escribir('zzz');
    expect(textoDeEstado()).toBe('Buscando…');
  });
});

describe('cuando la llamada falla', () => {
  const fallas = [
    [
      'sin respuesta',
      {
        status: 0,
        codigo: 'SIN_CONEXION',
        mensaje: 'No se pudo conectar con el servidor. Intenta de nuevo.',
      },
    ],
    [
      'un 400',
      {
        status: 400,
        codigo: 'DATOS_INVALIDOS',
        mensaje: 'El texto de búsqueda debe tener entre 2 y 120 caracteres.',
      },
    ],
    [
      'un 500',
      {
        status: 500,
        codigo: 'ERROR_INTERNO',
        mensaje: 'Ocurrió un error inesperado. Intenta de nuevo.',
      },
    ],
  ];

  it.each(fallas)(
    '%s: se ve "No se pudo buscar. Intenta de nuevo." con el botón "Reintentar"',
    async (_, datos) => {
      buscarProductos.mockRejectedValue(
        Object.assign(new Error(datos.mensaje), { ...datos, detalles: [] }),
      );
      await montar();
      await escribirYBuscar('lech');
      expect(textoDeEstado()).toContain('No se pudo buscar. Intenta de nuevo.');
      expect(botonDe('Reintentar')).toBeDefined();
      expect(zonaDeEstado().find('button').exists()).toBe(true);
      expect(wrapper.find('ul').exists()).toBe(false);
      expect(wrapper.findComponent(AnimacionLottie).exists()).toBe(false);
    },
  );

  it('el texto escrito no se pierde (RNF-05)', async () => {
    buscarProductos.mockRejectedValue(Object.assign(new Error('x'), { status: 0 }));
    await montar();
    await escribirYBuscar('lech');
    expect(entrada().value).toBe('lech');
  });

  it('la pantalla no muestra el mensaje interno del error', async () => {
    const interno = 'ER_PARSE_ERROR: SELECT * FROM productos WHERE nombre LIKE';
    buscarProductos.mockRejectedValue(
      Object.assign(new Error(interno), {
        status: 500,
        codigo: 'ERROR_INTERNO',
        mensaje: interno,
        detalles: [],
      }),
    );
    await montar();
    await escribirYBuscar('lech');
    expect(wrapper.text()).not.toContain('SELECT');
    expect(wrapper.text()).not.toContain('ER_PARSE_ERROR');
    expect(wrapper.text()).not.toContain('ERROR_INTERNO');
  });

  it('el mensaje y el botón están en la región de estado, para que un lector de pantalla los anuncie', async () => {
    buscarProductos.mockRejectedValue(Object.assign(new Error('x'), { status: 0 }));
    await montar();
    await escribirYBuscar('lech');
    expect(zonaDeEstado().attributes('aria-live')).toBe('polite');
    expect(zonaDeEstado().text()).toContain('No se pudo buscar. Intenta de nuevo.');
    expect(zonaDeEstado().text()).toContain('Reintentar');
  });

  it('"Reintentar" busca otra vez el mismo texto, sin esperar, y muestra los resultados (criterio 6)', async () => {
    buscarProductos.mockRejectedValueOnce(Object.assign(new Error('x'), { status: 0 }));
    await montar();
    await escribirYBuscar('lech');
    expect(buscarProductos).toHaveBeenCalledTimes(1);
    buscarProductos.mockResolvedValue([leche]);
    await botonDe('Reintentar').trigger('click');
    await asentar();
    expect(buscarProductos).toHaveBeenCalledTimes(2);
    expect(buscarProductos).toHaveBeenLastCalledWith('lech');
    expect(filas()).toHaveLength(1);
    expect(textoDeEstado()).not.toContain('No se pudo buscar');
    expect(entrada().value).toBe('lech');
  });

  it('mientras reintenta se ve "Buscando…", y si vuelve a fallar vuelve el mensaje', async () => {
    buscarProductos.mockRejectedValue(Object.assign(new Error('x'), { status: 0 }));
    await montar();
    await escribirYBuscar('lech');
    const otra = diferida();
    buscarProductos.mockReturnValue(otra.promesa);
    await botonDe('Reintentar').trigger('click');
    expect(textoDeEstado()).toBe('Buscando…');
    otra.rechazar(Object.assign(new Error('x'), { status: 500 }));
    await asentar();
    expect(textoDeEstado()).toContain('No se pudo buscar. Intenta de nuevo.');
  });

  it('una respuesta que no es una lista (por ejemplo un texto) se trata como un fallo', async () => {
    buscarProductos.mockResolvedValue('<html>no es la API</html>');
    await montar();
    await escribirYBuscar('lech');
    expect(textoDeEstado()).toContain('No se pudo buscar. Intenta de nuevo.');
    expect(wrapper.text()).not.toContain('no es la API');
  });
});

describe('las respuestas de búsquedas viejas', () => {
  const otro = { id: 3, nombre: 'Lechuga romana', codigoBarras: '333', precio: '12.00' };

  it('escribir rápido "le", "lec" y "lech" deja solo los resultados de "lech", con una sola llamada (criterio 1)', async () => {
    buscarProductos.mockResolvedValue([leche]);
    await montar();
    await escribir('le');
    await avanzar(100);
    await escribir('lec');
    await avanzar(100);
    await escribir('lech');
    await avanzar(ESPERA_MS);
    expect(buscarProductos).toHaveBeenCalledTimes(1);
    expect(buscarProductos).toHaveBeenCalledWith('lech');
    expect(filas()).toHaveLength(1);
    expect(filas().at(0).text()).toContain('Leche entera 1 L');
  });

  it('si la respuesta de "le" llega después que la de "lech", sigue la lista de "lech" (criterio 1)', async () => {
    const deLe = diferida();
    const deLech = diferida();
    buscarProductos.mockReturnValueOnce(deLe.promesa).mockReturnValueOnce(deLech.promesa);
    await montar();
    await escribirYBuscar('le');
    await escribir('lec');
    await escribirYBuscar('lech');
    expect(buscarProductos.mock.calls).toEqual([['le'], ['lech']]);
    deLech.resolver([leche]);
    await asentar();
    expect(filas()).toHaveLength(1);
    deLe.resolver([otro, jugo]);
    await asentar();
    expect(filas()).toHaveLength(1);
    expect(filas().at(0).text()).toContain('Leche entera 1 L');
    expect(wrapper.text()).not.toContain('Lechuga romana');
  });

  it('la respuesta vieja que llega antes de la llamada nueva tampoco se muestra: sigue "Buscando…"', async () => {
    const deLe = diferida();
    buscarProductos.mockReturnValueOnce(deLe.promesa);
    await montar();
    await escribirYBuscar('le');
    await escribir('lec');
    deLe.resolver([otro]);
    await asentar();
    expect(wrapper.find('ul').exists()).toBe(false);
    expect(textoDeEstado()).toBe('Buscando…');
  });

  it('una respuesta mala de una búsqueda vieja también se ignora: no aparece el mensaje de error', async () => {
    const deLe = diferida();
    buscarProductos.mockReturnValueOnce(deLe.promesa).mockResolvedValueOnce([leche]);
    await montar();
    await escribirYBuscar('le');
    await escribir('lech');
    await avanzar(ESPERA_MS);
    expect(filas()).toHaveLength(1);
    deLe.rechazar(Object.assign(new Error('x'), { status: 500 }));
    await asentar();
    expect(filas()).toHaveLength(1);
    expect(wrapper.text()).not.toContain('No se pudo buscar');
  });

  it('si el cajero borra el texto mientras espera, la respuesta que llega después se ignora: ni lista ni mensaje (criterio 7)', async () => {
    const respuesta = diferida();
    buscarProductos.mockReturnValue(respuesta.promesa);
    await montar();
    await escribirYBuscar('lech');
    await escribir('');
    expect(textoDeEstado()).toBe('');
    respuesta.resolver([leche]);
    await asentar();
    expect(textoDeEstado()).toBe('');
    expect(wrapper.find('ul').exists()).toBe(false);
  });

  it('lo mismo con el botón de borrar del campo, que deja el valor en null', async () => {
    const respuesta = diferida();
    buscarProductos.mockReturnValue(respuesta.promesa);
    await montar();
    await escribirYBuscar('lech');
    await wrapper.find('[aria-label="Borrar lo escrito en Buscar producto"]').trigger('click');
    await asentar();
    expect(entrada().value).toBe('');
    expect(textoDeEstado()).toBe('');
    respuesta.resolver([leche]);
    await asentar();
    expect(wrapper.find('ul').exists()).toBe(false);
    expect(textoDeEstado()).toBe('');
  });

  it('dejar una sola letra también invalida la búsqueda en curso: la respuesta se ignora', async () => {
    const respuesta = diferida();
    buscarProductos.mockReturnValue(respuesta.promesa);
    await montar();
    await escribirYBuscar('lech');
    await escribir('l');
    respuesta.resolver([leche]);
    await asentar();
    expect(wrapper.find('ul').exists()).toBe(false);
    expect(textoDeEstado()).toBe('Escribe al menos 2 caracteres');
  });

  it('una respuesta mala tras borrar el texto tampoco deja el mensaje de error', async () => {
    const respuesta = diferida();
    buscarProductos.mockReturnValue(respuesta.promesa);
    await montar();
    await escribirYBuscar('lech');
    await escribir('');
    respuesta.rechazar(Object.assign(new Error('x'), { status: 0 }));
    await asentar();
    expect(textoDeEstado()).toBe('');
  });
});

describe('elegir un resultado', () => {
  async function conResultados() {
    buscarProductos.mockResolvedValue([leche, jugo]);
    await montar();
    await escribirYBuscar('lech');
  }

  it('con clic emite producto-elegido con el producto: { id, nombre, codigoBarras, precio } (criterio 4)', async () => {
    await conResultados();
    await filas().at(0).find('button').trigger('click');
    await asentar();
    const emitidos = wrapper.emitted('producto-elegido');
    expect(emitidos).toHaveLength(1);
    expect(emitidos[0]).toHaveLength(1);
    expect(emitidos[0][0]).toEqual(leche);
  });

  it('elige el producto de la fila que se pulsó, no el primero', async () => {
    await conResultados();
    await filas().at(1).find('button').trigger('click');
    await asentar();
    expect(wrapper.emitted('producto-elegido')[0][0]).toEqual(jugo);
  });

  it('después se limpia el campo, se cierra la lista y el foco vuelve al campo (criterio 10)', async () => {
    await conResultados();
    await filas().at(0).find('button').trigger('click');
    await asentar();
    expect(entrada().value).toBe('');
    expect(wrapper.find('ul').exists()).toBe(false);
    expect(textoDeEstado()).toBe('');
    expect(document.activeElement).toBe(entrada());
  });

  it('el cajero busca el siguiente producto sin tocar el ratón: escribe y la búsqueda sale', async () => {
    await conResultados();
    await filas().at(0).find('button').trigger('click');
    await asentar();
    buscarProductos.mockResolvedValue([jugo]);
    await escribirYBuscar('jugo');
    expect(buscarProductos).toHaveBeenLastCalledWith('jugo');
    expect(filas()).toHaveLength(1);
  });

  it('elegir no llama a la API otra vez ni emite nada más', async () => {
    await conResultados();
    await filas().at(0).find('button').trigger('click');
    await avanzar(1000);
    expect(buscarProductos).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted('producto-elegido')).toHaveLength(1);
  });
});

describe('al cerrar la pantalla', () => {
  it('se cancela la espera pendiente: no se llama a la API', async () => {
    await montar();
    await escribir('lech');
    await avanzar(100);
    wrapper.destroy();
    wrapper = null;
    await vi.advanceTimersByTimeAsync(1000);
    expect(buscarProductos).not.toHaveBeenCalled();
  });

  it('una respuesta que llega después no rompe nada ni se muestra', async () => {
    const respuesta = diferida();
    buscarProductos.mockReturnValue(respuesta.promesa);
    await montar();
    await escribirYBuscar('lech');
    wrapper.destroy();
    wrapper = null;
    respuesta.resolver([leche]);
    for (let i = 0; i < 6; i += 1) await Promise.resolve();
    expect(buscarProductos).toHaveBeenCalledTimes(1);
  });
});
