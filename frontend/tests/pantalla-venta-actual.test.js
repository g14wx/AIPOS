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
vi.mock('../src/api/ventas.js', () => ({ registrarVenta: vi.fn() }));

import { buscarProductos, crearProducto } from '../src/api/productos.js';
import { registrarVenta } from '../src/api/ventas.js';
import { leerVentaActual } from '../src/ventaActual/almacenamiento.js';
import vuetify from '../src/plugins/vuetify.js';
import App from '../src/App.vue';
import BuscadorProductos from '../src/components/BuscadorProductos.vue';
import VentaActual from '../src/components/VentaActual.vue';
import CampoPrecioAplicado from '../src/components/CampoPrecioAplicado.vue';
import { cambiarPrecioAplicado } from '../src/ventaActual/ventaActual.js';

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
  registrarVenta.mockReset();
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
// Lo que muestra cada celda: el valor de su campo si lo tiene o su texto. El precio aplicado (V-05) y la cantidad (V-06)
// son campos y muestran su valor en el input, no como texto de la celda.
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

// V-05, "CampoPrecioAplicado.vue" y criterios 1 a 5 de V-05 (RF-05): el cajero edita el precio aplicado de un detalle en su
// campo. VentaActual pasa lo que escribe a cambiarPrecioAplicado y emite la venta actual nueva, y App.vue la guarda. El
// precio del producto no cambia y la pantalla no llama a la API para esto.
describe('editar el precio aplicado (V-05, criterios 1 a 5)', () => {
  const FORMATO = 'El precio aplicado debe ser un número de 0 a 99 999.99, como 22.00.';
  const etiqueta = (producto) => `Precio aplicado de ${producto.nombre}`;
  const entradaDe = (producto) =>
    zonaVenta()
      .findAll('.v-input')
      .wrappers.find(
        (entrada) => entrada.find('input').attributes('aria-label') === etiqueta(producto),
      );
  const campoDe = (producto) => entradaDe(producto).find('input');
  const mensajeDe = (producto) => entradaDe(producto).find('.v-messages__message');
  const subtotalDe = (fila) => celdas(filas()[fila])[3];

  // El cajero entra al campo y escribe, con el foco de verdad, como con un clic o con Tab.
  async function escribirPrecio(producto, texto) {
    campoDe(producto).element.focus();
    await campoDe(producto).setValue(texto);
  }
  // Salir del campo: Vuetify avisa el blur un turno después, y el campo se vuelve a pintar en otro.
  async function salirDelPrecio(producto) {
    campoDe(producto).element.blur();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
  }

  it('criterio 1: la leche a 25.00 pasa a 22.00, se recalculan el subtotal y el total, y queda guardado', async () => {
    abrir();
    await elegir(leche);
    await escribirPrecio(leche, '22');
    expect(subtotalDe(0)).toBe('22.00');
    expect(total()).toBe('22.00');
    expect(guardado().detalles).toEqual([detalle(leche, 1, '22.00')]);
  });

  it('el subtotal sale también de la cantidad: 2 leches a 22.00 valen 44.00', async () => {
    abrir();
    await elegir(leche);
    await elegir(leche);
    await escribirPrecio(leche, '22');
    expect(celdas(filas()[0]).slice(2, 4)).toEqual(['2', '44.00']);
    expect(total()).toBe('44.00');
  });

  it('criterio 1: al buscar la leche otra vez su precio sigue en 25.00, y cambiar el precio aplicado no llama a la API', async () => {
    buscarProductos.mockResolvedValue([leche]);
    abrir();
    await elegir(leche);
    await escribirPrecio(leche, '22');
    expect(buscarProductos).not.toHaveBeenCalled();
    expect(crearProducto).not.toHaveBeenCalled();
    await wrapper.find('[data-zona="busqueda"] input').setValue('lech');
    await vi.advanceTimersByTimeAsync(300);
    await wrapper.vm.$nextTick();
    expect(buscarProductos).toHaveBeenCalledTimes(1);
    expect(wrapper.find('[data-zona="busqueda"] .resultado__precio').text()).toBe('25.00');
    expect(leche.precio).toBe('25.00');
    expect(subtotalDe(0)).toBe('22.00');
  });

  it('el precio del producto no aparece como campo: solo hay un precio aplicado por detalle', async () => {
    abrir();
    await elegir(leche);
    await elegir(pan);
    const etiquetas = zonaVenta()
      .findAll('input')
      .wrappers.map((entrada) => entrada.attributes('aria-label'));
    expect(etiquetas.filter((texto) => /^Precio/.test(texto))).toEqual([
      etiqueta(leche),
      etiqueta(pan),
    ]);
  });

  it('cada fila tiene un CampoPrecioAplicado con su precio aplicado, su error, su nombre y disabled', async () => {
    dejarGuardado([detalle(leche, 2, '22.00'), detalle(pan)]);
    abrir();
    const campos = wrapper.findAllComponents(CampoPrecioAplicado).wrappers;
    expect(campos.map((campo) => campo.props())).toEqual([
      { value: '22.00', error: '', nombre: 'Leche entera 1 L', disabled: false },
      { value: '3.50', error: '', nombre: 'Pan de caja', disabled: false },
    ]);
  });

  // #85: la franja de abajo (el total y «Registrar venta») es sticky y la barra de arriba es fija, y el navegador lleva el
  // campo con foco de teclado al borde de la ventana sin contarlas. El margen de desplazamiento lo da una sola regla de
  // VentaActual.vue, `.detalles input` (#80 y #81, probada en VentaActual-eliminar.test.js y CampoCantidad.test.js), y cubre
  // el campo del precio aplicado porque es un input dentro de la tabla de detalles. Que el foco queda a la vista con muchas
  // filas se prueba en el navegador.
  it('el campo del precio aplicado es un input dentro de la tabla de detalles: lo cubre la regla de desplazamiento de las filas (#85)', async () => {
    abrir();
    await elegir(leche);
    const tabla = zonaVenta().find('.detalles');
    expect(tabla.exists()).toBe(true);
    expect(
      tabla.find('tbody input[aria-label="Precio aplicado de Leche entera 1 L"]').exists(),
    ).toBe(true);
  });

  it.each(['-1', 'abc'])(
    'criterio 2: con «%s» el campo muestra el error, conserva lo escrito y «Registrar venta» queda deshabilitado',
    async (texto) => {
      abrir();
      await elegir(leche);
      await escribirPrecio(leche, texto);
      expect(mensajeDe(leche).text()).toBe(FORMATO);
      expect(campoDe(leche).element.value).toBe(texto);
      expect(campoDe(leche).attributes('aria-invalid')).toBe('true');
      expect(botonRegistrar().attributes('disabled')).toBeDefined();
    },
  );

  // El campo es de texto y no type="number", que aceptaría 1e3 y cambiaría el valor con la rueda del ratón: el «1e3» se
  // escribe como texto y lo rechaza la regla RN-05.
  it('«1e3» (notación científica) es un error: se escribe como texto, se conserva y «Registrar venta» queda deshabilitado', async () => {
    abrir();
    await elegir(leche);
    await escribirPrecio(leche, '1e3');
    expect(mensajeDe(leche).text()).toBe(FORMATO);
    expect(campoDe(leche).element.value).toBe('1e3');
    expect(subtotalDe(0)).toBe('25.00');
    expect(botonRegistrar().attributes('disabled')).toBeDefined();
  });

  it('mientras el texto no sirve, el detalle conserva su último precio aplicado válido: subtotal y total no cambian', async () => {
    dejarGuardado([detalle(leche, 2, '22.00'), detalle(pan)]);
    abrir();
    await escribirPrecio(leche, 'abc');
    expect(subtotalDe(0)).toBe('44.00');
    expect(total()).toBe('47.50');
    expect(guardado().detalles[0].precioAplicado).toBe('22.00');
  });

  it.each([
    ['22.999', 'Usa hasta 2 decimales.'],
    ['100000', FORMATO],
    ['', 'Escribe un precio aplicado.'],
  ])('criterio 4: con «%s» el campo muestra «%s»', async (texto, mensaje) => {
    abrir();
    await elegir(leche);
    await escribirPrecio(leche, texto);
    expect(mensajeDe(leche).text()).toBe(mensaje);
    expect(botonRegistrar().attributes('disabled')).toBeDefined();
  });

  it('criterio 3: el 0 es válido, sin error: el subtotal es 0.00, el total es 0.00 y «Registrar venta» sigue habilitado', async () => {
    abrir();
    await elegir(leche);
    await escribirPrecio(leche, '0');
    expect(mensajeDe(leche).exists()).toBe(false);
    expect(subtotalDe(0)).toBe('0.00');
    expect(total()).toBe('0.00');
    expect(botonRegistrar().attributes('disabled')).toBeUndefined();
  });

  it('criterio 5: con un error, al corregirlo el error se va y «Registrar venta» se habilita', async () => {
    abrir();
    await elegir(leche);
    await escribirPrecio(leche, 'abc');
    expect(botonRegistrar().attributes('disabled')).toBeDefined();
    await escribirPrecio(leche, '21.5');
    expect(mensajeDe(leche).exists()).toBe(false);
    expect(campoDe(leche).attributes('aria-invalid')).toBeUndefined();
    expect(botonRegistrar().attributes('disabled')).toBeUndefined();
    expect(subtotalDe(0)).toBe('21.50');
    expect(total()).toBe('21.50');
  });

  it('al salir del campo, un texto válido se muestra con 2 decimales: «22» pasa a «22.00»', async () => {
    abrir();
    await elegir(leche);
    await escribirPrecio(leche, '22');
    expect(campoDe(leche).element.value).toBe('22');
    await salirDelPrecio(leche);
    expect(campoDe(leche).element.value).toBe('22.00');
  });

  it('con Enter también, y el campo conserva el foco para seguir', async () => {
    abrir();
    await elegir(leche);
    await escribirPrecio(leche, '22.5');
    await campoDe(leche).trigger('keydown.enter');
    await wrapper.vm.$nextTick();
    expect(campoDe(leche).element.value).toBe('22.50');
    expect(document.activeElement).toBe(campoDe(leche).element);
  });

  it('un texto que no sirve se queda como está al salir, con su error y con «Registrar venta» deshabilitado', async () => {
    abrir();
    await elegir(leche);
    await escribirPrecio(leche, '22.999');
    await salirDelPrecio(leche);
    expect(campoDe(leche).element.value).toBe('22.999');
    expect(mensajeDe(leche).text()).toBe('Usa hasta 2 decimales.');
    expect(botonRegistrar().attributes('disabled')).toBeDefined();
  });

  it('el error de un campo del detalle no se guarda: al recargar el detalle vuelve a su último valor válido', async () => {
    abrir();
    await elegir(leche);
    await escribirPrecio(leche, '22');
    await escribirPrecio(leche, 'abc');
    expect(localStorage.getItem(LLAVE)).not.toMatch(/errores|abc|El precio aplicado/);
    wrapper.destroy();
    abrir();
    expect(campoDe(leche).element.value).toBe('22.00');
    expect(mensajeDe(leche).exists()).toBe(false);
    expect(botonRegistrar().attributes('disabled')).toBeUndefined();
  });

  it('cada detalle tiene su propio error: con el de la leche sin corregir, editar el pan no habilita «Registrar venta»', async () => {
    abrir();
    await elegir(leche);
    await elegir(pan);
    await escribirPrecio(leche, '-1');
    await escribirPrecio(pan, '3');
    expect(mensajeDe(pan).exists()).toBe(false);
    expect(mensajeDe(leche).text()).toBe(FORMATO);
    expect(botonRegistrar().attributes('disabled')).toBeDefined();
    await escribirPrecio(leche, '24');
    expect(botonRegistrar().attributes('disabled')).toBeUndefined();
    expect(total()).toBe('27.00');
  });

  it('editar el precio aplicado de un detalle no toca los otros ni el orden', async () => {
    dejarGuardado([detalle(leche, 2, '22.00'), detalle(pan, 3)]);
    abrir();
    await escribirPrecio(pan, '4');
    expect(celdas(filas()[0]).slice(0, 4)).toEqual(['Leche entera 1 L', '22.00', '2', '44.00']);
    expect(celdas(filas()[1])[0]).toBe('Pan de caja');
    expect(subtotalDe(1)).toBe('12.00');
    expect(total()).toBe('56.00');
  });

  it('VentaActual emite update:ventaActual con la venta actual nueva que devuelve cambiarPrecioAplicado', async () => {
    abrir();
    await elegir(leche);
    const antes = ventaActual().props('ventaActual');
    await escribirPrecio(leche, '22');
    const emitidos = ventaActual().emitted('update:ventaActual');
    expect(emitidos.at(-1)).toEqual([cambiarPrecioAplicado(antes, 1, '22')]);
  });

  it('agregar otra vez un producto con un error de precio aplicado sube la cantidad y el error se queda', async () => {
    abrir();
    await elegir(leche);
    await escribirPrecio(leche, 'abc');
    await elegir(leche);
    expect(celdas(filas()[0])[2]).toBe('2');
    expect(mensajeDe(leche).text()).toBe(FORMATO);
    expect(botonRegistrar().attributes('disabled')).toBeDefined();
  });

  it('mientras V-08 registra la venta (enviando) el campo está deshabilitado, y se habilita cuando termina', async () => {
    abrir();
    await elegir(leche);
    ventaActual().vm.$emit('update:enviando', true);
    await wrapper.vm.$nextTick();
    expect(campoDe(leche).attributes('disabled')).toBeDefined();
    ventaActual().vm.$emit('update:enviando', false);
    await wrapper.vm.$nextTick();
    expect(campoDe(leche).attributes('disabled')).toBeUndefined();
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

// V-07: la pantalla entera (App y VentaActual) con el botón «Eliminar» de cada fila.
describe('eliminar un detalle de la venta actual (V-07, criterios 1, 2 y 3)', () => {
  const huevos = { id: 3, nombre: 'Huevos x 12', codigoBarras: '7501000222303', precio: '4.25' };
  const botonEliminar = (producto) =>
    zonaVenta()
      .findAll('button')
      .wrappers.find(
        (boton) =>
          boton.attributes('aria-label') === `Eliminar ${producto.nombre} de la venta actual`,
      );
  const eliminar = (producto) => botonEliminar(producto).trigger('click');
  const idsGuardados = () => guardado().detalles.map((d) => d.productoId);

  it('criterio 1: con leche y pan, eliminar el pan deja la leche, recalcula el total y lo guarda en el navegador', async () => {
    dejarGuardado([detalle(leche, 2, '22.00'), detalle(pan)]);
    abrir();
    expect(total()).toBe('47.50');
    await eliminar(pan);
    expect(filas()).toHaveLength(1);
    expect(celdas(filas()[0]).slice(0, 4)).toEqual(['Leche entera 1 L', '22.00', '2', '44.00']);
    expect(total()).toBe('44.00');
    expect(guardado()).toEqual({ version: 1, detalles: [detalle(leche, 2, '22.00')] });
  });

  it('criterios 2 y 3: con un solo detalle, al eliminarlo la venta actual queda vacía, sin nada guardado, y al recargar sigue vacía', async () => {
    abrir();
    await elegir(leche);
    await eliminar(leche);
    expect(filas()).toHaveLength(0);
    expect(zonaVenta().text()).toContain('Busca un producto para empezar la venta');
    expect(total()).toBe('0.00');
    expect(botonRegistrar().attributes('disabled')).toBeDefined();
    expect(localStorage.getItem(LLAVE)).toBeNull();
    wrapper.destroy();
    abrir();
    expect(filas()).toHaveLength(0);
    expect(zonaVenta().text()).toContain('Busca un producto para empezar la venta');
    expect(localStorage.getItem(LLAVE)).toBeNull();
  });

  it('se guarda después de cada eliminación, y al recargar la venta actual sigue sin ese detalle', async () => {
    dejarGuardado([detalle(leche), detalle(pan), detalle(huevos)]);
    abrir();
    await eliminar(pan);
    expect(idsGuardados()).toEqual([1, 3]);
    wrapper.destroy();
    abrir();
    expect(filas().map((fila) => celdas(fila)[0])).toEqual(['Leche entera 1 L', 'Huevos x 12']);
    await eliminar(leche);
    expect(idsGuardados()).toEqual([3]);
  });

  it('un producto eliminado y agregado otra vez empieza de nuevo con cantidad 1 y el precio del producto', async () => {
    dejarGuardado([detalle(pan, 4, '2.00')]);
    abrir();
    await eliminar(pan);
    await elegir(pan);
    expect(celdas(filas()[0]).slice(0, 4)).toEqual(['Pan de caja', '3.50', '1', '3.50']);
    expect(guardado().detalles).toEqual([detalle(pan, 1, '3.50')]);
  });

  it('«Registrar venta» se deshabilita al quedar vacía la venta actual y se habilita con el siguiente producto', async () => {
    abrir();
    await elegir(leche);
    expect(botonRegistrar().attributes('disabled')).toBeUndefined();
    await eliminar(leche);
    expect(botonRegistrar().attributes('disabled')).toBeDefined();
    await elegir(pan);
    expect(botonRegistrar().attributes('disabled')).toBeUndefined();
  });

  it('un detalle con un error escrito: al eliminarlo se van el detalle y su error, y «Registrar venta» se habilita', async () => {
    abrir();
    await elegir(leche);
    await elegir(pan);
    const errores = { 2: { cantidad: 'La cantidad debe ser un número entero de 1 a 999.' } };
    ventaActual().vm.$emit('update:ventaActual', {
      detalles: [detalle(leche), detalle(pan)],
      errores,
    });
    await wrapper.vm.$nextTick();
    expect(botonRegistrar().attributes('disabled')).toBeDefined();
    await eliminar(pan);
    expect(ventaActual().props('ventaActual').errores).toEqual({});
    expect(botonRegistrar().attributes('disabled')).toBeUndefined();
    expect(total()).toBe('25.00');
  });

  // #79: el segundo clic de un doble clic cae sobre el botón de la fila que subió a ocupar el lugar del detalle eliminado.
  it('un doble clic elimina un solo detalle (#79): el segundo clic no elimina el que subió', async () => {
    const clic = (producto, detail) =>
      botonEliminar(producto).element.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, detail }),
      );
    dejarGuardado([detalle(leche), detalle(pan), detalle(huevos)]);
    abrir();
    clic(leche, 1);
    await wrapper.vm.$nextTick();
    clic(pan, 2);
    await wrapper.vm.$nextTick();
    expect(filas().map((fila) => celdas(fila)[0])).toEqual(['Pan de caja', 'Huevos x 12']);
    expect(idsGuardados()).toEqual([2, 3]);
  });

  it('eliminar no llama a la API: la venta actual vive en la pantalla hasta registrar la venta', async () => {
    abrir();
    await elegir(leche);
    await elegir(pan);
    await eliminar(pan);
    await eliminar(leche);
    expect(buscarProductos).not.toHaveBeenCalled();
    expect(crearProducto).not.toHaveBeenCalled();
  });

  it('mientras V-08 registra la venta (enviando) el botón está deshabilitado y la venta actual no cambia', async () => {
    abrir();
    await elegir(leche);
    ventaActual().vm.$emit('update:enviando', true);
    await wrapper.vm.$nextTick();
    expect(botonEliminar(leche).attributes('disabled')).toBeDefined();
    await eliminar(leche);
    expect(filas()).toHaveLength(1);
    expect(guardado().detalles).toEqual([detalle(leche)]);
    ventaActual().vm.$emit('update:enviando', false);
    await wrapper.vm.$nextTick();
    await eliminar(leche);
    expect(filas()).toHaveLength(0);
  });

  it('con 100 detalles, eliminar uno deja lugar: el producto 101 se agrega y no hay aviso (RN-14)', async () => {
    const producto101 = { id: 101, nombre: 'Producto 101', codigoBarras: '101', precio: '1.00' };
    dejarGuardado(cienDetalles());
    abrir();
    await elegir(producto101);
    expect(avisoVisible().text()).toBe('Una venta puede tener como máximo 100 productos.');
    await vi.advanceTimersByTimeAsync(AVISO_MS);
    await eliminar({ nombre: 'Producto 50' });
    expect(filas()).toHaveLength(99);
    await elegir(producto101);
    expect(filas()).toHaveLength(100);
    expect(avisoVisible().exists()).toBe(false);
    expect(idsGuardados()).not.toContain(50);
    expect(idsGuardados().at(-1)).toBe(101);
  });

  it('si el navegador no deja borrar lo guardado, eliminar el último detalle funciona igual y no avisa', async () => {
    abrir();
    await elegir(leche);
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('Acceso denegado', 'SecurityError');
    });
    await eliminar(leche);
    expect(zonaVenta().text()).toContain('Busca un producto para empezar la venta');
    expect(total()).toBe('0.00');
    expect(avisoVisible().exists()).toBe(false);
  });

  it('el foco pasa a la fila que ocupó su lugar y, si no queda ninguna, al título «Venta actual»', async () => {
    dejarGuardado([detalle(leche), detalle(pan)]);
    abrir();
    botonEliminar(leche).element.focus();
    await eliminar(leche);
    await wrapper.vm.$nextTick();
    expect(document.activeElement).toBe(botonEliminar(pan).element);
    await eliminar(pan);
    await wrapper.vm.$nextTick();
    expect(document.activeElement).toBe(zonaVenta().find('h2').element);
  });

  it('eliminar el detalle recién agregado no deja nada colgado: el resaltado se quita a su hora y los temporizadores se cancelan', async () => {
    abrir();
    await elegir(leche);
    await elegir(pan);
    await eliminar(pan);
    expect(filas()).toHaveLength(1);
    expect(filas()[0].classes()).not.toContain('detalle-resaltado');
    await vi.advanceTimersByTimeAsync(RESALTADO_MS);
    expect(ventaActual().props('resaltarId')).toBeNull();
    await elegir(pan);
    wrapper.destroy();
    expect(vi.getTimerCount()).toBe(0);
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

// V-08, criterios 1, 3 y 4 de la tarjeta y 1 de la spec registrar-venta: la pantalla entera (App.vue, VentaActual.vue y
// RegistrarVenta.vue) con la API de ventas sustituida. Registrar con un 201 deja la venta actual vacía también en el
// navegador; un error, del tipo que sea, no la toca (RNF-05); el doble clic manda una sola venta.
describe('registrar la venta desde la pantalla (V-08)', () => {
  const PETICION = [
    { productoId: 1, cantidad: 2, precioAplicado: '22.00' },
    { productoId: 2, cantidad: 1, precioAplicado: '3.50' },
  ];
  // La venta del ejemplo de la spec: 2 leches a 22.00 y 1 pan a 3.50, que suman 47.50.
  const armarLaVenta = () => dejarGuardado([detalle(leche, 2, '22.00'), detalle(pan)]);
  const franjaDeEstado = () => zonaVenta().find('[role="status"]');
  const asentar = async () => {
    for (let vuelta = 0; vuelta < 6; vuelta += 1) await wrapper.vm.$nextTick();
  };
  const registrar = async () => {
    await botonRegistrar().trigger('click');
    await asentar();
  };

  describe('éxito (criterio 1)', () => {
    beforeEach(() => {
      registrarVenta.mockResolvedValue({ ventaId: 15, total: '47.50' });
    });

    it('manda los detalles de la venta actual y muestra «Venta 15 registrada · Total 47.50»', async () => {
      armarLaVenta();
      abrir();
      expect(total()).toBe('47.50');
      await registrar();
      expect(registrarVenta).toHaveBeenCalledTimes(1);
      expect(registrarVenta).toHaveBeenCalledWith(PETICION);
      expect(franjaDeEstado().text()).toBe('Venta 15 registrada · Total 47.50');
    });

    it('la venta actual queda vacía: sin filas, con su mensaje, el total en 0.00 y «Registrar venta» deshabilitado', async () => {
      armarLaVenta();
      abrir();
      await registrar();
      expect(filas()).toHaveLength(0);
      expect(zonaVenta().text()).toContain('Busca un producto para empezar la venta');
      expect(total()).toBe('0.00');
      expect(botonRegistrar().attributes('disabled')).toBeDefined();
    });

    it('queda vacía también en el navegador: la llave ya no existe y, al recargar, la venta actual sigue vacía', async () => {
      armarLaVenta();
      abrir();
      expect(guardado().detalles).toHaveLength(2);
      await registrar();
      expect(localStorage.getItem(LLAVE)).toBeNull();
      expect(leerVentaActual()).toEqual({ detalles: [], errores: {} });
      wrapper.destroy();
      abrir();
      expect(filas()).toHaveLength(0);
      expect(total()).toBe('0.00');
      expect(franjaDeEstado().text()).toBe('');
    });

    it('el mensaje sigue a la vista con la venta actual ya vacía: vive en la franja de abajo, junto al total', async () => {
      armarLaVenta();
      abrir();
      await registrar();
      const pie = zonaVenta().find('.venta-actual__pie');
      expect(pie.find('[role="status"]').text()).toBe('Venta 15 registrada · Total 47.50');
      expect(pie.find('[data-total]').text()).toBe('0.00');
    });

    it('muestra el total que devolvió la API, no el que calculó la pantalla', async () => {
      registrarVenta.mockResolvedValue({ ventaId: 16, total: '50.00' });
      armarLaVenta();
      abrir();
      expect(total()).toBe('47.50');
      await registrar();
      expect(franjaDeEstado().text()).toBe('Venta 16 registrada · Total 50.00');
    });

    it('la venta más grande (100 detalles) también se registra, con sus 100 detalles', async () => {
      registrarVenta.mockResolvedValue({ ventaId: 99, total: '100.00' });
      dejarGuardado(cienDetalles());
      abrir();
      expect(botonRegistrar().attributes('disabled')).toBeUndefined();
      await registrar();
      expect(registrarVenta.mock.calls[0][0]).toHaveLength(100);
      expect(franjaDeEstado().text()).toBe('Venta 99 registrada · Total 100.00');
      expect(filas()).toHaveLength(0);
    });

    it('después de registrar se empieza una venta nueva: el producto entra con cantidad 1 y el precio del producto', async () => {
      armarLaVenta();
      abrir();
      await registrar();
      await elegir(leche);
      expect(celdas(filas()[0]).slice(0, 4)).toEqual(['Leche entera 1 L', '25.00', '1', '25.00']);
      expect(guardado()).toEqual({ version: 1, detalles: [detalle(leche)] });
      expect(franjaDeEstado().text()).toBe('Venta 15 registrada · Total 47.50');
    });

    it('registrar no llama a la búsqueda ni a crear un producto', async () => {
      armarLaVenta();
      abrir();
      await registrar();
      expect(buscarProductos).not.toHaveBeenCalled();
      expect(crearProducto).not.toHaveBeenCalled();
    });
  });

  describe('doble clic (criterio 2)', () => {
    it('dos clics seguidos registran una sola venta: una petición, una franja y la venta actual vacía', async () => {
      registrarVenta.mockResolvedValue({ ventaId: 15, total: '47.50' });
      armarLaVenta();
      abrir();
      const boton = botonRegistrar();
      boton.trigger('click');
      boton.trigger('click');
      await asentar();
      expect(registrarVenta).toHaveBeenCalledTimes(1);
      expect(franjaDeEstado().text()).toBe('Venta 15 registrada · Total 47.50');
      expect(filas()).toHaveLength(0);
      expect(localStorage.getItem(LLAVE)).toBeNull();
    });
  });

  describe('mientras se envía', () => {
    let resolver;
    beforeEach(() => {
      registrarVenta.mockReturnValue(new Promise((alResolver) => (resolver = alResolver)));
    });

    it('la pantalla sabe que se está enviando (enviando sube hasta App.vue) y el botón queda deshabilitado', async () => {
      armarLaVenta();
      abrir();
      await botonRegistrar().trigger('click');
      expect(ventaActual().props('enviando')).toBe(true);
      expect(botonRegistrar().attributes('disabled')).toBeDefined();
      resolver({ ventaId: 15, total: '47.50' });
      await asentar();
      expect(ventaActual().props('enviando')).toBe(false);
    });

    it('la venta actual no cambia a la mitad del envío: ignora producto-elegido y no toca lo guardado', async () => {
      armarLaVenta();
      abrir();
      const antes = localStorage.getItem(LLAVE);
      await botonRegistrar().trigger('click');
      await elegir(leche);
      await elegir({ id: 3, nombre: 'Huevos', codigoBarras: '3', precio: '4.00' });
      expect(filas()).toHaveLength(2);
      expect(localStorage.getItem(LLAVE)).toBe(antes);
      expect(registrarVenta.mock.calls[0][0]).toEqual(PETICION);
      resolver({ ventaId: 15, total: '47.50' });
      await asentar();
    });

    it('el botón «Eliminar» de cada detalle queda deshabilitado', async () => {
      armarLaVenta();
      abrir();
      await botonRegistrar().trigger('click');
      const eliminar = zonaVenta().findAll('.detalle__eliminar').wrappers;
      expect(eliminar).toHaveLength(2);
      for (const boton of eliminar) expect(boton.attributes('disabled')).toBeDefined();
      resolver({ ventaId: 15, total: '47.50' });
      await asentar();
    });

    it('al terminar, la pantalla vuelve a aceptar productos', async () => {
      armarLaVenta();
      abrir();
      await botonRegistrar().trigger('click');
      resolver({ ventaId: 15, total: '47.50' });
      await asentar();
      await elegir(pan);
      expect(filas()).toHaveLength(1);
    });
  });
});

// V-08, criterios 3 y 4 de la tarjeta y 4, 5 y 6 de la spec registrar-venta, con la pantalla entera: un error de la API
// (422, 400 o 500) o la falta de respuesta muestran el motivo y dejan la venta actual como estaba, en pantalla y en el
// navegador (RNF-05). El botón se habilita otra vez y el cajero puede corregir y volver a intentar.
describe('registrar la venta: un error no toca la venta actual (V-08)', () => {
  const armarLaVenta = () => dejarGuardado([detalle(leche, 2, '22.00'), detalle(pan)]);
  const franjaDeEstado = () => zonaVenta().find('[role="status"]');
  const franjaDeError = () => zonaVenta().find('[role="alert"]');
  const asentar = async () => {
    for (let vuelta = 0; vuelta < 6; vuelta += 1) await wrapper.vm.$nextTick();
  };
  const registrar = async () => {
    await botonRegistrar().trigger('click');
    await asentar();
  };
  const errorDeLaApi = (status, codigo, mensaje, detallesDelError = []) =>
    Object.assign(new Error(mensaje), { status, codigo, mensaje, detalles: detallesDelError });
  const fallos = [
    [
      '422 (un producto que ya no existe)',
      () =>
        errorDeLaApi(
          422,
          'PRODUCTO_NO_EXISTE',
          'Un producto de la venta ya no existe. Revisa la venta actual.',
        ),
      'Un producto de la venta ya no existe. Revisa la venta actual.',
    ],
    [
      '400',
      () =>
        errorDeLaApi(400, 'DATOS_INVALIDOS', 'Los datos de la venta no son válidos.', [
          { campo: 'detalles[0].cantidad', mensaje: 'Debe ser un entero de 1 a 999.' },
        ]),
      'Detalle 1, cantidad: Debe ser un entero de 1 a 999.',
    ],
    [
      '500',
      () => errorDeLaApi(500, 'ERROR_INTERNO', 'Ocurrió un error inesperado. Intenta de nuevo.'),
      'Ocurrió un error inesperado. Intenta de nuevo.',
    ],
    [
      'falta de respuesta (la API no responde)',
      () =>
        errorDeLaApi(0, 'SIN_CONEXION', 'No se pudo conectar con el servidor. Intenta de nuevo.'),
      'No se pudo conectar con el servidor. Tu venta sigue aquí: intenta de nuevo.',
    ],
  ];

  describe.each(fallos)('con un %s', (_nombre, crear, texto) => {
    beforeEach(() => {
      registrarVenta.mockRejectedValue(crear());
    });

    it('muestra el motivo en una franja de error y no dice que la venta se registró', async () => {
      armarLaVenta();
      abrir();
      await registrar();
      expect(franjaDeError().text()).toContain(texto);
      expect(franjaDeEstado().text()).toBe('');
    });

    it('la venta actual conserva todos sus detalles, el total y lo guardado en el navegador', async () => {
      armarLaVenta();
      abrir();
      const antes = localStorage.getItem(LLAVE);
      await registrar();
      expect(filas()).toHaveLength(2);
      expect(celdas(filas()[0]).slice(0, 4)).toEqual(['Leche entera 1 L', '22.00', '2', '44.00']);
      expect(celdas(filas()[1]).slice(0, 4)).toEqual(['Pan de caja', '3.50', '1', '3.50']);
      expect(total()).toBe('47.50');
      expect(localStorage.getItem(LLAVE)).toBe(antes);
      expect(leerVentaActual().detalles).toHaveLength(2);
    });

    it('el botón se habilita otra vez y la pantalla vuelve a aceptar cambios', async () => {
      armarLaVenta();
      abrir();
      await registrar();
      expect(botonRegistrar().attributes('disabled')).toBeUndefined();
      expect(ventaActual().props('enviando')).toBe(false);
      await elegir(pan);
      expect(celdas(filas()[1])[2]).toBe('2');
    });
  });

  it('criterio 3: tras el 422 el cajero elimina el detalle que falló y registra el resto', async () => {
    registrarVenta
      .mockRejectedValueOnce(
        errorDeLaApi(
          422,
          'PRODUCTO_NO_EXISTE',
          'Un producto de la venta ya no existe. Revisa la venta actual.',
        ),
      )
      .mockResolvedValueOnce({ ventaId: 16, total: '44.00' });
    armarLaVenta();
    abrir();
    await registrar();
    await zonaVenta().findAll('.detalle__eliminar').at(1).trigger('click');
    expect(filas()).toHaveLength(1);
    await registrar();
    expect(registrarVenta.mock.calls[1][0]).toEqual([
      { productoId: 1, cantidad: 2, precioAplicado: '22.00' },
    ]);
    expect(franjaDeEstado().text()).toBe('Venta 16 registrada · Total 44.00');
    expect(franjaDeError().exists()).toBe(false);
    expect(localStorage.getItem(LLAVE)).toBeNull();
  });

  it('criterio 4: si la API no responde y luego vuelve, el mismo clic registra la venta con los mismos detalles', async () => {
    registrarVenta
      .mockRejectedValueOnce(errorDeLaApi(0, 'SIN_CONEXION', 'No se pudo conectar.'))
      .mockResolvedValueOnce({ ventaId: 15, total: '47.50' });
    armarLaVenta();
    abrir();
    await registrar();
    expect(franjaDeError().exists()).toBe(true);
    await registrar();
    expect(registrarVenta).toHaveBeenCalledTimes(2);
    expect(registrarVenta.mock.calls[1][0]).toEqual(registrarVenta.mock.calls[0][0]);
    expect(franjaDeEstado().text()).toBe('Venta 15 registrada · Total 47.50');
    expect(franjaDeError().exists()).toBe(false);
    expect(filas()).toHaveLength(0);
  });

  it('con un error de un campo del detalle «Registrar venta» está deshabilitado y no manda nada', async () => {
    armarLaVenta();
    abrir();
    const errores = { 2: { cantidad: 'La cantidad debe ser un número entero de 1 a 999.' } };
    ventaActual().vm.$emit('update:ventaActual', {
      detalles: [detalle(leche, 2, '22.00'), detalle(pan)],
      errores,
    });
    await wrapper.vm.$nextTick();
    expect(botonRegistrar().attributes('disabled')).toBeDefined();
    await botonRegistrar().trigger('click');
    expect(registrarVenta).not.toHaveBeenCalled();
  });
});

describe('quién hace qué al registrar la venta (V-08): RegistrarVenta manda, VentaActual vacía y App guarda', () => {
  const leerFuente = (ruta) => readFileSync(resolve(import.meta.dirname, ruta), 'utf8');

  it('App.vue no conoce la API de ventas: solo guarda la venta actual que le llega de VentaActual', () => {
    const fuente = leerFuente('../src/App.vue');
    expect(fuente).not.toMatch(/api\/ventas|registrarVenta|RegistrarVenta/);
    expect(fuente).toMatch(/guardarVentaActual/);
  });

  it('VentaActual.vue no llama a la API: muestra RegistrarVenta y, al registrarse, emite la venta actual vacía', () => {
    const fuente = leerFuente('../src/components/VentaActual.vue');
    expect(fuente).not.toMatch(/from\s+['"][^'"]*api\//);
    expect(fuente).toMatch(/import RegistrarVenta from '\.\/RegistrarVenta\.vue'/);
    expect(fuente).toMatch(/vaciarVentaActual\(\)/);
    expect(fuente).not.toMatch(/localStorage|almacenamiento/);
  });
});

// Spec armar-venta-actual, "CampoCantidad.vue (V-06)" y criterios 1, 3, 4 y 5 de V-06 (RF-06, RN-06 y RN-08), con la
// pantalla entera montada: el cajero cambia la cantidad de un detalle con los botones «+» y «−» o escribiéndola, el
// subtotal y el total se recalculan al momento, y un valor escrito que no sirve se marca en el campo y deshabilita
// «Registrar venta» sin cambiar el detalle ni guardarse en el navegador.
describe('cambiar la cantidad de un detalle (V-06)', () => {
  const NOMBRE = 'Leche entera 1 L';
  const MENSAJE_INVALIDA = 'La cantidad debe ser un número entero de 1 a 999.';
  const MENSAJE_VACIA = 'Escribe una cantidad.';

  const campoDe = (nombre) => zonaVenta().find(`input[aria-label="Cantidad de ${nombre}"]`);
  const masDe = (nombre) =>
    zonaVenta().find(`button[aria-label="Aumentar la cantidad de ${nombre}"]`);
  const menosDe = (nombre) =>
    zonaVenta().find(`button[aria-label="Disminuir la cantidad de ${nombre}"]`);
  // El mensaje de error del campo de un detalle, o null si no tiene.
  const mensajeDe = (nombre) => {
    const alerta = campoDe(nombre)
      .element.closest('.campo-cantidad')
      .querySelector('[role="alert"]');
    return alerta ? alerta.textContent.trim() : null;
  };
  const escribir = (nombre, texto) => campoDe(nombre).setValue(texto);
  const salirDelCampo = async (nombre) => {
    campoDe(nombre).element.focus();
    campoDe(nombre).element.blur();
    await wrapper.vm.$nextTick();
  };
  const estaDeshabilitado = (elemento) => elemento.attributes('disabled') !== undefined;
  const registrarDeshabilitado = () => estaDeshabilitado(botonRegistrar());
  const conLecheYPan = (cantidadDeLeche = 2) =>
    dejarGuardado([detalle(leche, cantidadDeLeche, '22.00'), detalle(pan)]);

  describe('los botones «+» y «−» (criterios 1, 2 y 4)', () => {
    it('criterio 1: con la leche en 2, «+» la pasa a 3 y se recalculan el subtotal y el total', async () => {
      conLecheYPan(2);
      abrir();
      expect(total()).toBe('47.50');
      await masDe(NOMBRE).trigger('click');
      expect(celdas(filas()[0]).slice(0, 4)).toEqual([NOMBRE, '22.00', '3', '66.00']);
      expect(total()).toBe('69.50');
      expect(registrarDeshabilitado()).toBe(false);
    });

    it('«−» baja la cantidad en 1 y recalcula el subtotal y el total', async () => {
      conLecheYPan(3);
      abrir();
      await menosDe(NOMBRE).trigger('click');
      expect(celdas(filas()[0]).slice(0, 4)).toEqual([NOMBRE, '22.00', '2', '44.00']);
      expect(total()).toBe('47.50');
    });

    it('cada clic parte de la cantidad nueva: tres clics en «+» suben de 2 a 5', async () => {
      conLecheYPan(2);
      abrir();
      for (let i = 0; i < 3; i += 1) await masDe(NOMBRE).trigger('click');
      expect(celdas(filas()[0])[2]).toBe('5');
      expect(total()).toBe('113.50');
    });

    it('se guarda en el navegador después de cada cambio', async () => {
      conLecheYPan(2);
      abrir();
      await masDe(NOMBRE).trigger('click');
      expect(guardado().detalles[0].cantidad).toBe(3);
      await menosDe(NOMBRE).trigger('click');
      await menosDe(NOMBRE).trigger('click');
      expect(guardado().detalles).toEqual([detalle(leche, 1, '22.00'), detalle(pan)]);
    });

    it('criterio 2: con la cantidad 1, «−» está deshabilitado y presionarlo no cambia nada', async () => {
      conLecheYPan(1);
      abrir();
      expect(estaDeshabilitado(menosDe(NOMBRE))).toBe(true);
      const antes = localStorage.getItem(LLAVE);
      await menosDe(NOMBRE).trigger('click');
      expect(celdas(filas()[0])[2]).toBe('1');
      expect(total()).toBe('25.50');
      expect(localStorage.getItem(LLAVE)).toBe(antes);
    });

    it('bajar con «−» hasta 1 lo deshabilita, y «+» lo habilita otra vez', async () => {
      conLecheYPan(2);
      abrir();
      expect(estaDeshabilitado(menosDe(NOMBRE))).toBe(false);
      await menosDe(NOMBRE).trigger('click');
      expect(estaDeshabilitado(menosDe(NOMBRE))).toBe(true);
      await masDe(NOMBRE).trigger('click');
      expect(estaDeshabilitado(menosDe(NOMBRE))).toBe(false);
    });

    it('criterio 4: con la cantidad 999, «+» está deshabilitado y «−» no', async () => {
      conLecheYPan(999);
      abrir();
      expect(estaDeshabilitado(masDe(NOMBRE))).toBe(true);
      expect(estaDeshabilitado(menosDe(NOMBRE))).toBe(false);
      await masDe(NOMBRE).trigger('click');
      expect(celdas(filas()[0])[2]).toBe('999');
    });

    it('subir con «+» hasta 999 lo deshabilita', async () => {
      conLecheYPan(998);
      abrir();
      await masDe(NOMBRE).trigger('click');
      expect(celdas(filas()[0])[2]).toBe('999');
      expect(estaDeshabilitado(masDe(NOMBRE))).toBe(true);
    });
  });

  // La tarjeta V-06 lista «0», «1.5» y «abc»; «1000» viene de RF-06 y de la pregunta abierta 4; vacío es de la spec.
  describe.each([
    ['0', MENSAJE_INVALIDA],
    ['1000', MENSAJE_INVALIDA],
    ['1.5', MENSAJE_INVALIDA],
    ['abc', MENSAJE_INVALIDA],
    ['', MENSAJE_VACIA],
  ])('criterio 3: con «%s» escrito en la cantidad', (texto, mensaje) => {
    it('el campo muestra el error y conserva lo escrito, y «Registrar venta» queda deshabilitado', async () => {
      conLecheYPan(2);
      abrir();
      expect(mensajeDe(NOMBRE)).toBeNull();
      await escribir(NOMBRE, texto);
      expect(campoDe(NOMBRE).element.value).toBe(texto);
      expect(mensajeDe(NOMBRE)).toBe(mensaje);
      expect(campoDe(NOMBRE).attributes('aria-invalid')).toBe('true');
      expect(registrarDeshabilitado()).toBe(true);
    });

    it('el detalle conserva su última cantidad válida: el subtotal y el total no cambian', async () => {
      conLecheYPan(2);
      abrir();
      await escribir(NOMBRE, texto);
      expect(celdas(filas()[0]).slice(1, 4)).toEqual(['22.00', texto, '44.00']);
      expect(total()).toBe('47.50');
    });

    it('no se guarda el error ni lo escrito: lo guardado sigue con la última cantidad válida', async () => {
      conLecheYPan(2);
      abrir();
      await escribir(NOMBRE, texto);
      expect(guardado().detalles).toEqual([detalle(leche, 2, '22.00'), detalle(pan)]);
      expect(localStorage.getItem(LLAVE)).not.toMatch(/errores|La cantidad debe|Escribe una/);
    });

    it('«+» usa la cantidad válida y no el texto: pasa a 3, el error se va y el campo muestra 3', async () => {
      conLecheYPan(2);
      abrir();
      await escribir(NOMBRE, texto);
      await masDe(NOMBRE).trigger('click');
      expect(campoDe(NOMBRE).element.value).toBe('3');
      expect(mensajeDe(NOMBRE)).toBeNull();
      expect(registrarDeshabilitado()).toBe(false);
      expect(total()).toBe('69.50');
    });
  });

  describe('corregir lo escrito y escribir cantidades válidas', () => {
    it('al corregir una cantidad con error, el error se va y «Registrar venta» se habilita', async () => {
      conLecheYPan(2);
      abrir();
      await escribir(NOMBRE, 'abc');
      expect(registrarDeshabilitado()).toBe(true);
      await escribir(NOMBRE, '5');
      expect(mensajeDe(NOMBRE)).toBeNull();
      expect(registrarDeshabilitado()).toBe(false);
      expect(celdas(filas()[0]).slice(1, 4)).toEqual(['22.00', '5', '110.00']);
      expect(total()).toBe('113.50');
    });

    it('mientras escribe, el subtotal y el total se recalculan al momento con cada cifra', async () => {
      conLecheYPan(2);
      abrir();
      await escribir(NOMBRE, '1');
      expect(total()).toBe('25.50');
      await escribir(NOMBRE, '12');
      expect(total()).toBe('267.50');
      await escribir(NOMBRE, '123');
      expect(celdas(filas()[0])[3]).toBe('2706.00');
      expect(total()).toBe('2709.50');
      expect(guardado().detalles[0].cantidad).toBe(123);
    });

    it('escribir «1000» marca error y al borrar el último cero vuelve a ser válido', async () => {
      conLecheYPan(2);
      abrir();
      await escribir(NOMBRE, '1000');
      expect(mensajeDe(NOMBRE)).toBe(MENSAJE_INVALIDA);
      await escribir(NOMBRE, '100');
      expect(mensajeDe(NOMBRE)).toBeNull();
      expect(celdas(filas()[0])[2]).toBe('100');
    });

    it('«999» es válida y deshabilita «+»; «1» deshabilita «−»', async () => {
      conLecheYPan(2);
      abrir();
      await escribir(NOMBRE, '999');
      expect(mensajeDe(NOMBRE)).toBeNull();
      expect(estaDeshabilitado(masDe(NOMBRE))).toBe(true);
      await escribir(NOMBRE, '1');
      expect(estaDeshabilitado(menosDe(NOMBRE))).toBe(true);
      expect(estaDeshabilitado(masDe(NOMBRE))).toBe(false);
    });

    it('al salir del campo con un texto válido lo normaliza: «007» pasa a «7»', async () => {
      conLecheYPan(2);
      abrir();
      // El cajero escribe con el foco puesto en el campo: mientras escribe, no se le cambia lo escrito.
      campoDe(NOMBRE).element.focus();
      await escribir(NOMBRE, '007');
      expect(celdas(filas()[0])[2]).toBe('007');
      await salirDelCampo(NOMBRE);
      expect(celdas(filas()[0]).slice(1, 4)).toEqual(['22.00', '7', '154.00']);
      expect(guardado().detalles[0].cantidad).toBe(7);
    });

    it('al salir del campo con un texto inválido deja lo escrito y su error', async () => {
      conLecheYPan(2);
      abrir();
      await escribir(NOMBRE, 'abc');
      await salirDelCampo(NOMBRE);
      expect(campoDe(NOMBRE).element.value).toBe('abc');
      expect(mensajeDe(NOMBRE)).toBe(MENSAJE_INVALIDA);
    });
  });

  describe('varios detalles, recargar y lo que pasa a su alrededor', () => {
    it('cada detalle tiene su propio campo: cambiar el de la leche no toca el del pan', async () => {
      conLecheYPan(2);
      abrir();
      await masDe(NOMBRE).trigger('click');
      expect(celdas(filas()[0])[2]).toBe('3');
      expect(celdas(filas()[1])[2]).toBe('1');
      await masDe('Pan de caja').trigger('click');
      await masDe('Pan de caja').trigger('click');
      expect(celdas(filas()[0])[2]).toBe('3');
      expect(celdas(filas()[1]).slice(2, 4)).toEqual(['3', '10.50']);
      expect(total()).toBe('76.50');
    });

    it('el error de un detalle deshabilita «Registrar venta» hasta corregirlo, aunque el otro cambie bien', async () => {
      conLecheYPan(2);
      abrir();
      await escribir(NOMBRE, 'abc');
      await masDe('Pan de caja').trigger('click');
      expect(mensajeDe(NOMBRE)).toBe(MENSAJE_INVALIDA);
      expect(mensajeDe('Pan de caja')).toBeNull();
      expect(registrarDeshabilitado()).toBe(true);
      await escribir(NOMBRE, '4');
      expect(registrarDeshabilitado()).toBe(false);
    });

    it('dos detalles con error tienen cada uno su mensaje, y «Registrar venta» espera a que se corrijan los dos', async () => {
      conLecheYPan(2);
      abrir();
      await escribir(NOMBRE, '0');
      await escribir('Pan de caja', '');
      expect(mensajeDe(NOMBRE)).toBe(MENSAJE_INVALIDA);
      expect(mensajeDe('Pan de caja')).toBe(MENSAJE_VACIA);
      await escribir(NOMBRE, '2');
      expect(registrarDeshabilitado()).toBe(true);
      await escribir('Pan de caja', '2');
      expect(registrarDeshabilitado()).toBe(false);
    });

    it('elegir otra vez un producto que tiene una cantidad con error sube la cantidad válida y quita el error', async () => {
      conLecheYPan(2);
      abrir();
      await escribir(NOMBRE, 'abc');
      await elegir(leche);
      expect(campoDe(NOMBRE).element.value).toBe('3');
      expect(mensajeDe(NOMBRE)).toBeNull();
      expect(registrarDeshabilitado()).toBe(false);
      expect(total()).toBe('69.50');
    });

    it('al recargar la pantalla, una cantidad con error sin corregir vuelve a su último valor válido', async () => {
      conLecheYPan(2);
      abrir();
      await escribir(NOMBRE, 'abc');
      expect(registrarDeshabilitado()).toBe(true);
      wrapper.destroy();
      abrir();
      expect(campoDe(NOMBRE).element.value).toBe('2');
      expect(mensajeDe(NOMBRE)).toBeNull();
      expect(registrarDeshabilitado()).toBe(false);
      expect(total()).toBe('47.50');
    });

    it('al recargar, la cantidad que se había cambiado sigue igual', async () => {
      conLecheYPan(2);
      abrir();
      await masDe(NOMBRE).trigger('click');
      await escribir('Pan de caja', '12');
      wrapper.destroy();
      abrir();
      expect(celdas(filas()[0])[2]).toBe('3');
      expect(celdas(filas()[1])[2]).toBe('12');
      expect(total()).toBe('108.00');
    });

    it('cambiar la cantidad no llama a la API, no marca la fila y no muestra el aviso de un límite', async () => {
      conLecheYPan(2);
      abrir();
      await masDe(NOMBRE).trigger('click');
      await escribir(NOMBRE, 'abc');
      expect(buscarProductos).not.toHaveBeenCalled();
      expect(crearProducto).not.toHaveBeenCalled();
      expect(ventaActual().props('resaltarId')).toBeNull();
      expect(wrapper.find('.v-alert').exists()).toBe(false);
    });

    it('cada cambio sale de VentaActual como update:ventaActual con la venta actual nueva entera', async () => {
      conLecheYPan(2);
      abrir();
      await masDe(NOMBRE).trigger('click');
      const emitidos = ventaActual().emitted('update:ventaActual');
      expect(emitidos).toHaveLength(1);
      expect(emitidos[0][0].detalles.map((d) => d.cantidad)).toEqual([3, 1]);
      await escribir(NOMBRE, 'abc');
      const ultimo = ventaActual().emitted('update:ventaActual').at(-1)[0];
      expect(ultimo.errores).toEqual({ 1: { cantidad: MENSAJE_INVALIDA } });
    });
  });

  describe('mientras V-08 registra la venta (enviando)', () => {
    it('los campos y los botones de cantidad no se pueden usar, y la venta actual no cambia', async () => {
      conLecheYPan(2);
      abrir();
      ventaActual().vm.$emit('update:enviando', true);
      await wrapper.vm.$nextTick();
      const antes = localStorage.getItem(LLAVE);
      for (const nombre of [NOMBRE, 'Pan de caja']) {
        expect(estaDeshabilitado(campoDe(nombre))).toBe(true);
        expect(estaDeshabilitado(masDe(nombre))).toBe(true);
        expect(estaDeshabilitado(menosDe(nombre))).toBe(true);
      }
      await masDe(NOMBRE).trigger('click');
      await campoDe(NOMBRE).setValue('9');
      // setValue deja el texto en el input aunque esté deshabilitado, pero no dispara el evento: la venta actual sigue igual.
      expect(celdas(filas()[0])[3]).toBe('44.00');
      expect(total()).toBe('47.50');
      expect(guardado().detalles[0].cantidad).toBe(2);
      expect(localStorage.getItem(LLAVE)).toBe(antes);
    });

    it('cuando termina de enviar, los campos vuelven a poder usarse', async () => {
      conLecheYPan(2);
      abrir();
      ventaActual().vm.$emit('update:enviando', true);
      await wrapper.vm.$nextTick();
      ventaActual().vm.$emit('update:enviando', false);
      await wrapper.vm.$nextTick();
      expect(estaDeshabilitado(campoDe(NOMBRE))).toBe(false);
      await masDe(NOMBRE).trigger('click');
      expect(celdas(filas()[0])[2]).toBe('3');
    });

    it('un campo con error se deshabilita también y conserva su mensaje', async () => {
      conLecheYPan(2);
      abrir();
      await escribir(NOMBRE, 'abc');
      ventaActual().vm.$emit('update:enviando', true);
      await wrapper.vm.$nextTick();
      expect(estaDeshabilitado(campoDe(NOMBRE))).toBe(true);
      expect(mensajeDe(NOMBRE)).toBe(MENSAJE_INVALIDA);
      expect(campoDe(NOMBRE).element.value).toBe('abc');
    });
  });

  describe('el campo sigue siendo el mismo mientras el cajero escribe', () => {
    it('escribir varias cifras seguidas no vuelve a crear el campo: conserva el mismo input', async () => {
      conLecheYPan(2);
      abrir();
      const antes = campoDe(NOMBRE).element;
      for (const texto of ['1', '12', '123', '12a', '12']) {
        await escribir(NOMBRE, texto);
        expect(campoDe(NOMBRE).element).toBe(antes);
      }
      expect(antes.value).toBe('12');
    });

    it('agregar otro producto mientras hay un texto escrito no borra lo escrito en el campo de otro detalle', async () => {
      conLecheYPan(2);
      abrir();
      await escribir(NOMBRE, 'abc');
      await elegir({ id: 3, nombre: 'Huevos x12', codigoBarras: '750', precio: '4.25' });
      expect(filas()).toHaveLength(3);
      expect(campoDe(NOMBRE).element.value).toBe('abc');
      expect(mensajeDe(NOMBRE)).toBe(MENSAJE_INVALIDA);
    });

    it('en cada fila los controles van en este orden: «−», el campo y «+»', async () => {
      conLecheYPan(2);
      abrir();
      const celda = campoDe(NOMBRE).element.closest('td');
      const controles = [...celda.querySelectorAll('button, input')];
      expect(controles.map((c) => c.getAttribute('aria-label'))).toEqual([
        `Disminuir la cantidad de ${NOMBRE}`,
        `Cantidad de ${NOMBRE}`,
        `Aumentar la cantidad de ${NOMBRE}`,
      ]);
    });
  });

  describe('con 100 detalles (RN-14)', () => {
    it('se puede cambiar la cantidad del último y el total la suma', async () => {
      dejarGuardado(cienDetalles());
      abrir();
      expect(filas()).toHaveLength(100);
      expect(total()).toBe('100.00');
      await masDe('Producto 100').trigger('click');
      await escribir('Producto 1', '10');
      expect(celdas(filas()[99])[2]).toBe('2');
      expect(celdas(filas()[0])[2]).toBe('10');
      expect(total()).toBe('110.00');
      expect(registrarDeshabilitado()).toBe(false);
    });
  });
});
