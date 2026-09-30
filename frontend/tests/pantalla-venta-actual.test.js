// Spec armar-venta-actual, "App.vue: une la búsqueda con la venta actual (V-04)" y criterios 2, 6, 7, 8, 9, 11, 12 y 14 de V-04:
// App.vue es el mediador entre BuscadorProductos y VentaActual (no se conocen) y el único que guarda la venta actual: al
// recibir producto-elegido llama a agregarAVentaActual, la guarda en el navegador y marca la fila recién agregada; avisa
// cuando la venta no cambió (999 de cantidad o 100 detalles); ignora todo mientras V-08 registra la venta. La API se
// sustituye con vi.mock, los temporizadores con vi.useFakeTimers y lottie-web con la ruta exacta que importa AnimacionLottie.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

const { loadAnimation } = vi.hoisted(() => ({
  loadAnimation: vi.fn(() => ({ destroy() {}, goToAndStop() {}, totalFrames: 40 })),
}));

vi.mock('lottie-web/build/player/lottie_light', () => ({ default: { loadAnimation } }));
vi.mock('../src/api/productos.js', () => ({ buscarProductos: vi.fn(), crearProducto: vi.fn() }));

import { buscarProductos, crearProducto } from '../src/api/productos.js';
import vuetify from '../src/plugins/vuetify.js';
import App from '../src/App.vue';
import BuscadorProductos from '../src/components/BuscadorProductos.vue';
import VentaActual from '../src/components/VentaActual.vue';

// La llave y los tiempos de la spec, escritos otra vez a propósito: si cambian en el código, esta prueba avisa.
const LLAVE = 'aipos.ventaActual';
const AVISO_MS = 4000;
const RESALTADO_MS = 2000;

const leche = { id: 1, nombre: 'Leche entera 1 L', codigoBarras: '7501055300075', precio: '25.00' };
const pan = { id: 2, nombre: 'Pan de caja', codigoBarras: '7501000111206', precio: '3.50' };
const detalle = (producto, cantidad = 1, precioAplicado = producto.precio) => ({
  productoId: producto.id,
  nombre: producto.nombre,
  precioAplicado,
  cantidad,
});
const cienDetalles = (cantidad = 1) =>
  Array.from({ length: 100 }, (_, i) => ({
    productoId: i + 1,
    nombre: `Producto ${i + 1}`,
    precioAplicado: '1.00',
    cantidad,
  }));

let wrapper;
let contenedor;
let consola;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  localStorage.clear();
  contenedor = document.createElement('div');
  contenedor.setAttribute('data-app', 'true');
  document.body.appendChild(contenedor);
  consola = [vi.spyOn(console, 'error'), vi.spyOn(console, 'warn')];
  consola.forEach((espia) => espia.mockImplementation(() => {}));
  buscarProductos.mockReset();
  crearProducto.mockReset();
});

afterEach(() => {
  wrapper?.destroy();
  wrapper = null;
  contenedor.remove();
  vi.useRealTimers();
  vi.restoreAllMocks();
  localStorage.clear();
  const avisos = consola.flatMap((espia) => espia.mock.calls.map((llamada) => llamada.join(' ')));
  expect(avisos).toEqual([]);
});

function abrir() {
  const lugar = contenedor.appendChild(document.createElement('div'));
  wrapper = mount(App, { vuetify, attachTo: lugar });
  return wrapper;
}

// Lo que hay guardado en el navegador antes de abrir la pantalla.
const dejarGuardado = (detalles) =>
  localStorage.setItem(LLAVE, JSON.stringify({ version: 1, detalles }));
const guardado = () => JSON.parse(localStorage.getItem(LLAVE));

const zonaVenta = () => wrapper.find('[data-zona="venta-actual"]');
const filas = () => zonaVenta().findAll('tbody tr').wrappers;
// Un campo de la tabla (la cantidad, V-06) muestra su valor en el input y no como texto de la celda.
const celdas = (fila) =>
  fila.findAll('td').wrappers.map((celda) => {
    const campo = celda.find('input');
    return campo.exists() ? campo.element.value : celda.text();
  });
const total = () => zonaVenta().find('[data-total]').text();
const avisoVisible = () => wrapper.find('[role="alert"]');
const ventaActual = () => wrapper.findComponent(VentaActual);
const botonRegistrar = () =>
  zonaVenta()
    .findAll('button')
    .wrappers.find((boton) => boton.text() === 'Registrar venta');

// El cajero elige un producto en la búsqueda: BuscadorProductos emite producto-elegido y App.vue reacciona.
async function elegir(producto) {
  wrapper.findComponent(BuscadorProductos).vm.$emit('producto-elegido', producto);
  await wrapper.vm.$nextTick();
}

describe('conectar la elección de la búsqueda con la venta actual (criterio 6)', () => {
  it('un producto elegido en la búsqueda entra a la venta actual: una fila, el total y lo guardado en el navegador', async () => {
    abrir();
    expect(total()).toBe('0.00');
    await elegir(leche);
    expect(filas()).toHaveLength(1);
    expect(celdas(filas()[0]).slice(0, 4)).toEqual(['Leche entera 1 L', '25.00', '1', '25.00']);
    expect(total()).toBe('25.00');
    expect(guardado()).toEqual({ version: 1, detalles: [detalle(leche)] });
  });

  it('de punta a punta: escribe en el campo de búsqueda, elige el resultado y entra a la venta actual', async () => {
    buscarProductos.mockResolvedValue([leche, pan]);
    abrir();
    const campo = wrapper.find('[data-zona="busqueda"] input');
    await campo.setValue('lech');
    await vi.advanceTimersByTimeAsync(300);
    await wrapper.vm.$nextTick();
    expect(buscarProductos).toHaveBeenCalledTimes(1);
    const resultado = wrapper
      .findAll('[data-zona="busqueda"] li button')
      .wrappers.find((boton) => boton.text().includes('Leche entera 1 L'));
    await resultado.trigger('click');
    expect(celdas(filas()[0]).slice(0, 4)).toEqual(['Leche entera 1 L', '25.00', '1', '25.00']);
    expect(total()).toBe('25.00');
  });

  it('criterio 2: elegir la leche otra vez deja una sola fila con cantidad 2 y subtotal 50.00', async () => {
    abrir();
    await elegir(leche);
    await elegir(leche);
    expect(filas()).toHaveLength(1);
    expect(celdas(filas()[0]).slice(0, 4)).toEqual(['Leche entera 1 L', '25.00', '2', '50.00']);
    expect(total()).toBe('50.00');
  });

  it('criterio 7: cada cambio actualiza el total al momento y con 2 decimales: leche y pan suman 28.50', async () => {
    abrir();
    await elegir(leche);
    await elegir(pan);
    expect(filas()).toHaveLength(2);
    expect(total()).toBe('28.50');
    await elegir(pan);
    expect(total()).toBe('32.00');
  });

  it('la venta actual vacía tiene «Registrar venta» deshabilitado, y con un producto se habilita', async () => {
    abrir();
    expect(botonRegistrar().attributes('disabled')).toBeDefined();
    await elegir(leche);
    expect(botonRegistrar().attributes('disabled')).toBeUndefined();
  });

  it('agregar no llama a la API: lo que arma el cajero vive en la pantalla hasta registrar la venta', async () => {
    abrir();
    await elegir(leche);
    await elegir(pan);
    expect(buscarProductos).not.toHaveBeenCalled();
    expect(crearProducto).not.toHaveBeenCalled();
  });

  it('BuscadorProductos no sabe nada de la venta actual: solo emite producto-elegido', () => {
    const fuente = readFileSync(
      resolve(import.meta.dirname, '../src/components/BuscadorProductos.vue'),
      'utf8',
    );
    expect(fuente).not.toMatch(/from\s+['"][^'"]*(ventaActual|VentaActual|almacenamiento)/);
    expect(fuente).toMatch(/\$emit\(\s*['"]producto-elegido['"]/);
  });
});

describe('guardar la venta actual en el navegador y recuperarla al recargar (criterios 8, 9 y 12)', () => {
  it('se guarda después de cada cambio: agregar un producto nuevo y subir la cantidad de uno que ya está', async () => {
    abrir();
    await elegir(leche);
    expect(guardado().detalles).toEqual([detalle(leche, 1)]);
    await elegir(leche);
    expect(guardado().detalles).toEqual([detalle(leche, 2)]);
    await elegir(pan);
    expect(guardado().detalles).toEqual([detalle(leche, 2), detalle(pan, 1)]);
  });

  it('criterio 8: al recargar la pantalla sigue igual, con sus detalles, precios aplicados y cantidades', async () => {
    dejarGuardado([detalle(leche, 2, '22.00'), detalle(pan, 1)]);
    abrir();
    expect(filas()).toHaveLength(2);
    expect(celdas(filas()[0]).slice(0, 4)).toEqual(['Leche entera 1 L', '22.00', '2', '44.00']);
    expect(celdas(filas()[1]).slice(0, 4)).toEqual(['Pan de caja', '3.50', '1', '3.50']);
    expect(total()).toBe('47.50');
    expect(botonRegistrar().attributes('disabled')).toBeUndefined();
  });

  it('recargar dos veces seguidas deja la misma venta actual: abrir no cambia lo guardado', async () => {
    abrir();
    await elegir(leche);
    await elegir(pan);
    const antes = localStorage.getItem(LLAVE);
    wrapper.destroy();
    abrir();
    expect(total()).toBe('28.50');
    expect(localStorage.getItem(LLAVE)).toBe(antes);
    wrapper.destroy();
    abrir();
    expect(filas()).toHaveLength(2);
  });

  it('después de recargar se puede seguir agregando: la cantidad guardada sube en 1', async () => {
    dejarGuardado([detalle(leche, 2, '22.00')]);
    abrir();
    await elegir(leche);
    expect(celdas(filas()[0]).slice(0, 4)).toEqual(['Leche entera 1 L', '22.00', '3', '66.00']);
  });

  it('cada update:ventaActual de VentaActual reemplaza la venta actual entera y la guarda', async () => {
    abrir();
    await elegir(leche);
    const nueva = { detalles: [detalle(pan, 4, '3.00')], errores: {} };
    ventaActual().vm.$emit('update:ventaActual', nueva);
    await wrapper.vm.$nextTick();
    expect(filas()).toHaveLength(1);
    expect(celdas(filas()[0]).slice(0, 4)).toEqual(['Pan de caja', '3.00', '4', '12.00']);
    expect(guardado().detalles).toEqual([detalle(pan, 4, '3.00')]);
  });

  it('una venta actual con un error no guarda el error: al recargar el detalle vuelve a su último valor válido', async () => {
    abrir();
    await elegir(leche);
    const errores = { 1: { cantidad: 'La cantidad debe ser un número entero de 1 a 999.' } };
    ventaActual().vm.$emit('update:ventaActual', { detalles: [detalle(leche, 1)], errores });
    await wrapper.vm.$nextTick();
    expect(botonRegistrar().attributes('disabled')).toBeDefined();
    expect(localStorage.getItem(LLAVE)).not.toMatch(/errores|La cantidad debe/);
    wrapper.destroy();
    abrir();
    expect(botonRegistrar().attributes('disabled')).toBeUndefined();
    expect(total()).toBe('25.00');
  });

  it('criterio 3 de V-07: al vaciar la venta actual se borra lo guardado y al recargar sigue vacía', async () => {
    abrir();
    await elegir(leche);
    ventaActual().vm.$emit('update:ventaActual', { detalles: [], errores: {} });
    await wrapper.vm.$nextTick();
    expect(localStorage.getItem(LLAVE)).toBeNull();
    expect(zonaVenta().text()).toContain('Busca un producto para empezar la venta');
    wrapper.destroy();
    abrir();
    expect(filas()).toHaveLength(0);
    expect(zonaVenta().text()).toContain('Busca un producto para empezar la venta');
  });

  describe.each([
    ['un JSON cortado', '{'],
    ['otra versión', JSON.stringify({ version: 2, detalles: [] })],
    ['un detalle con cantidad 0', JSON.stringify({ version: 1, detalles: [detalle(leche, 0)] })],
  ])('criterio 12: con lo guardado dañado (%s)', (_nombre, valor) => {
    it('la pantalla abre con la venta actual vacía y sin errores, y sigue funcionando', async () => {
      localStorage.setItem(LLAVE, valor);
      abrir();
      expect(zonaVenta().text()).toContain('Busca un producto para empezar la venta');
      expect(total()).toBe('0.00');
      await elegir(leche);
      expect(guardado()).toEqual({ version: 1, detalles: [detalle(leche)] });
    });
  });

  it('criterio 9: si el navegador no deja guardar, la pantalla sigue funcionando y la venta actual vive en memoria', async () => {
    const espia = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('El almacenamiento está lleno', 'QuotaExceededError');
    });
    abrir();
    await elegir(leche);
    await elegir(leche);
    await elegir(pan);
    expect(espia).toHaveBeenCalled();
    expect(celdas(filas()[0]).slice(0, 4)).toEqual(['Leche entera 1 L', '25.00', '2', '50.00']);
    expect(total()).toBe('53.50');
    expect(localStorage.getItem(LLAVE)).toBeNull();
  });

  it('la pantalla no avisa que no pudo guardar: sigue como si nada', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Acceso denegado', 'SecurityError');
    });
    abrir();
    await elegir(leche);
    expect(avisoVisible().exists()).toBe(false);
    expect(wrapper.text()).not.toMatch(/guardar|almacenamiento|navegador/i);
  });

  it('si el navegador ni siquiera deja leer, abre con la venta actual vacía', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Acceso denegado', 'SecurityError');
    });
    abrir();
    expect(zonaVenta().text()).toContain('Busca un producto para empezar la venta');
  });
});

describe('avisos cuando la venta actual no cambió (criterios 11 y 14)', () => {
  const producto101 = { id: 101, nombre: 'Producto 101', codigoBarras: '101', precio: '1.00' };

  it('criterio 11: con la cantidad en 999 no la sube y avisa «La cantidad máxima de un producto es 999.»', async () => {
    dejarGuardado([detalle(leche, 999)]);
    abrir();
    await elegir(leche);
    expect(celdas(filas()[0])[2]).toBe('999');
    expect(avisoVisible().text()).toBe('La cantidad máxima de un producto es 999.');
    expect(guardado().detalles[0].cantidad).toBe(999);
  });

  it('criterio 14: con 100 detalles no agrega un producto nuevo y avisa «Una venta puede tener como máximo 100 productos.»', async () => {
    dejarGuardado(cienDetalles());
    abrir();
    await elegir(producto101);
    expect(filas()).toHaveLength(100);
    expect(avisoVisible().text()).toBe('Una venta puede tener como máximo 100 productos.');
    expect(guardado().detalles).toHaveLength(100);
    expect(guardado().detalles.some((d) => d.productoId === 101)).toBe(false);
    expect(botonRegistrar().attributes('disabled')).toBeUndefined();
  });

  it('con 100 detalles, un producto que ya está sí sube su cantidad y no avisa', async () => {
    dejarGuardado(cienDetalles());
    abrir();
    await elegir({ id: 7, nombre: 'Producto 7', codigoBarras: '7', precio: '1.00' });
    expect(celdas(filas()[6])[2]).toBe('2');
    expect(avisoVisible().exists()).toBe(false);
  });

  it('agregar el detalle número 100 se puede, y con el 101 ya avisa', async () => {
    dejarGuardado(cienDetalles().slice(0, 99));
    abrir();
    await elegir(producto101);
    expect(filas()).toHaveLength(100);
    expect(avisoVisible().exists()).toBe(false);
    await elegir({ ...producto101, id: 102, nombre: 'Producto 102' });
    expect(filas()).toHaveLength(100);
    expect(avisoVisible().exists()).toBe(true);
  });

  it('el aviso es una franja con role alert (la alerta de error de Vuetify, no un texto rojo suelto)', async () => {
    dejarGuardado([detalle(leche, 999)]);
    abrir();
    await elegir(leche);
    expect(avisoVisible().classes()).toContain('v-alert');
    expect(avisoVisible().attributes('role')).toBe('alert');
  });

  it('se quita sola a los 4 segundos, no antes', async () => {
    dejarGuardado([detalle(leche, 999)]);
    abrir();
    await elegir(leche);
    await vi.advanceTimersByTimeAsync(AVISO_MS - 1);
    expect(avisoVisible().exists()).toBe(true);
    await vi.advanceTimersByTimeAsync(1);
    await wrapper.vm.$nextTick();
    expect(avisoVisible().exists()).toBe(false);
  });

  it('un aviso nuevo reinicia los 4 segundos: el primer temporizador no quita el segundo aviso', async () => {
    dejarGuardado([detalle(leche, 999)]);
    abrir();
    await elegir(leche);
    await vi.advanceTimersByTimeAsync(3000);
    await elegir(leche);
    await vi.advanceTimersByTimeAsync(3000);
    expect(avisoVisible().exists()).toBe(true);
    await vi.advanceTimersByTimeAsync(1000);
    await wrapper.vm.$nextTick();
    expect(avisoVisible().exists()).toBe(false);
  });

  it('cuando hay 100 detalles y el producto ya estaba en 999, el aviso es el de la cantidad', async () => {
    dejarGuardado(cienDetalles(999));
    abrir();
    await elegir({ id: 3, nombre: 'Producto 3', codigoBarras: '3', precio: '1.00' });
    expect(avisoVisible().text()).toBe('La cantidad máxima de un producto es 999.');
  });
});

describe('detalle recién agregado', () => {
  it('marca la fila del producto agregado y la quita a los 2 segundos', async () => {
    abrir();
    await elegir(leche);
    expect(ventaActual().props('resaltarId')).toBe(1);
    expect(filas()[0].classes()).toContain('detalle-resaltado');
    await vi.advanceTimersByTimeAsync(RESALTADO_MS - 1);
    expect(ventaActual().props('resaltarId')).toBe(1);
    await vi.advanceTimersByTimeAsync(1);
    await wrapper.vm.$nextTick();
    expect(ventaActual().props('resaltarId')).toBeNull();
    expect(filas()[0].classes()).not.toContain('detalle-resaltado');
  });

  it('subir la cantidad de un producto que ya está también lo marca', async () => {
    dejarGuardado([detalle(leche), detalle(pan)]);
    abrir();
    await elegir(pan);
    expect(ventaActual().props('resaltarId')).toBe(2);
  });

  it('agregar otro producto mueve la marca y reinicia los 2 segundos', async () => {
    abrir();
    await elegir(leche);
    await vi.advanceTimersByTimeAsync(1500);
    await elegir(pan);
    expect(ventaActual().props('resaltarId')).toBe(2);
    await vi.advanceTimersByTimeAsync(1500);
    expect(ventaActual().props('resaltarId')).toBe(2);
    await vi.advanceTimersByTimeAsync(500);
    await wrapper.vm.$nextTick();
    expect(ventaActual().props('resaltarId')).toBeNull();
  });

  it('un producto que no se pudo agregar (999 o 100 detalles) no se marca', async () => {
    dejarGuardado([detalle(leche, 999)]);
    abrir();
    await elegir(leche);
    expect(ventaActual().props('resaltarId')).toBeNull();
  });
});

describe('mientras V-08 registra la venta (enviando)', () => {
  it('ignora producto-elegido: la venta actual no cambia, no se guarda, no se marca nada y no avisa', async () => {
    abrir();
    await elegir(leche);
    await vi.advanceTimersByTimeAsync(RESALTADO_MS);
    const antes = localStorage.getItem(LLAVE);
    ventaActual().vm.$emit('update:enviando', true);
    await wrapper.vm.$nextTick();
    expect(ventaActual().props('enviando')).toBe(true);
    await elegir(pan);
    expect(filas()).toHaveLength(1);
    expect(localStorage.getItem(LLAVE)).toBe(antes);
    expect(ventaActual().props('resaltarId')).toBeNull();
    expect(avisoVisible().exists()).toBe(false);
  });

  it('cuando termina de enviar, vuelve a aceptar productos', async () => {
    abrir();
    await elegir(leche);
    ventaActual().vm.$emit('update:enviando', true);
    await wrapper.vm.$nextTick();
    ventaActual().vm.$emit('update:enviando', false);
    await wrapper.vm.$nextTick();
    expect(ventaActual().props('enviando')).toBe(false);
    await elegir(pan);
    expect(filas()).toHaveLength(2);
  });

  it('ignora también el producto que habría dejado un aviso', async () => {
    dejarGuardado([detalle(leche, 999)]);
    abrir();
    ventaActual().vm.$emit('update:enviando', true);
    await wrapper.vm.$nextTick();
    await elegir(leche);
    expect(avisoVisible().exists()).toBe(false);
  });
});

describe('temporizadores', () => {
  it('se cancelan al destruir la pantalla (beforeDestroy): no queda ninguno pendiente', async () => {
    dejarGuardado([detalle(leche, 999)]);
    abrir();
    await elegir(leche);
    await elegir(pan);
    expect(avisoVisible().exists()).toBe(true);
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    wrapper.destroy();
    expect(vi.getTimerCount()).toBe(0);
  });
});
