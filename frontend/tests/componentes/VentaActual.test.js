// Spec armar-venta-actual, "VentaActual.vue (V-04)" y criterios 1, 3, 4 y 5 de V-04: el componente recibe la venta actual
// y la muestra. Con detalles, una tabla de Vuetify con el nombre, el precio aplicado, la cantidad, el subtotal y las
// acciones, y siempre el total a la vista con 2 decimales y el botón «Registrar venta» (provisional hasta V-08). Sin
// detalles, la animación venta-vacia y «Busca un producto para empezar la venta». lottie-web no dibuja en jsdom: se
// sustituye con la ruta exacta que importa AnimacionLottie.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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

import vuetify from '../../src/plugins/vuetify.js';
import ventaVacia from '../../src/assets/animaciones/venta-vacia.json';
import VentaActual from '../../src/components/VentaActual.vue';

const leche = { productoId: 1, nombre: 'Leche entera 1 L', precioAplicado: '22.00', cantidad: 2 };
const pan = { productoId: 2, nombre: 'Pan de caja', precioAplicado: '3.50', cantidad: 1 };
const venta = (...detalles) => ({ detalles, errores: {} });
const ventaConDetalles = (cuantos) =>
  venta(
    ...Array.from({ length: cuantos }, (_, i) => ({
      productoId: i + 1,
      nombre: `Producto ${i + 1}`,
      precioAplicado: '1.00',
      cantidad: 1,
    })),
  );

let wrapper;
let contenedor;
let consola;

beforeEach(() => {
  contenedor = document.createElement('div');
  contenedor.setAttribute('data-app', 'true');
  document.body.appendChild(contenedor);
  consola = [vi.spyOn(console, 'error'), vi.spyOn(console, 'warn')];
  consola.forEach((espia) => espia.mockImplementation(() => {}));
  loadAnimation.mockClear();
  instancias.length = 0;
});

afterEach(() => {
  wrapper?.destroy();
  wrapper = null;
  contenedor.remove();
  vi.unstubAllGlobals();
  const avisos = consola.flatMap((espia) => espia.mock.calls.map((llamada) => llamada.join(' ')));
  consola.forEach((espia) => espia.mockRestore());
  expect(avisos).toEqual([]);
});

function montar(propsData = {}) {
  const lugar = contenedor.appendChild(document.createElement('div'));
  wrapper = mount(VentaActual, { vuetify, propsData, attachTo: lugar });
  return wrapper;
}

const filas = () => wrapper.findAll('tbody tr').wrappers;
// Lo que muestra cada celda: el valor de su campo si lo tiene (el precio aplicado es un campo desde V-05) o su texto.
const celdas = (fila) =>
  fila.findAll('td').wrappers.map((celda) => {
    const campo = celda.find('input');
    return campo.exists() ? campo.element.value : celda.text();
  });
const botonRegistrar = () =>
  wrapper.findAll('button').wrappers.find((boton) => boton.text() === 'Registrar venta');
const estaDeshabilitado = (boton) => boton.attributes('disabled') !== undefined;
const total = () => wrapper.find('[data-total]').text();

describe('venta actual vacía (criterio 4)', () => {
  it('sin propiedades es una venta actual vacía: nunca hace falta preguntar si existe', () => {
    montar();
    expect(wrapper.text()).toContain('Busca un producto para empezar la venta');
    expect(total()).toBe('0.00');
  });

  it('muestra el mensaje «Busca un producto para empezar la venta» y no muestra ninguna tabla', () => {
    montar({ ventaActual: venta() });
    expect(wrapper.text()).toContain('Busca un producto para empezar la venta');
    expect(wrapper.find('table').exists()).toBe(false);
    expect(filas()).toHaveLength(0);
  });

  it('muestra el total 0.00 y el botón «Registrar venta» deshabilitado', () => {
    montar({ ventaActual: venta() });
    expect(total()).toBe('0.00');
    expect(estaDeshabilitado(botonRegistrar())).toBe(true);
  });

  it('cambia el ícono por la animación venta-vacia.json, que es decorativa', () => {
    montar({ ventaActual: venta() });
    expect(loadAnimation).toHaveBeenCalledTimes(1);
    expect(loadAnimation.mock.calls[0][0].animationData).toEqual(ventaVacia);
    expect(loadAnimation.mock.calls[0][0].renderer).toBe('svg');
    expect(wrapper.find('.animacion-lottie').attributes('aria-hidden')).toBe('true');
    expect(wrapper.find('.mdi-barcode-scan').exists()).toBe(false);
  });

  it('el título es un h2 «Venta actual» y la sección se nombra con él', () => {
    montar();
    const titulo = wrapper.find('h2');
    expect(titulo.text()).toBe('Venta actual');
    expect(wrapper.find('section').attributes('aria-labelledby')).toBe(titulo.attributes('id'));
  });

  it('con detalles ya no muestra el mensaje ni la animación', () => {
    montar({ ventaActual: venta(leche) });
    expect(wrapper.text()).not.toContain('Busca un producto para empezar la venta');
    expect(loadAnimation).not.toHaveBeenCalled();
    expect(wrapper.find('.animacion-lottie').exists()).toBe(false);
  });

  it('al eliminar el último detalle vuelve el mensaje con la animación, y el total vuelve a 0.00', async () => {
    montar({ ventaActual: venta(leche) });
    await wrapper.setProps({ ventaActual: venta() });
    expect(wrapper.text()).toContain('Busca un producto para empezar la venta');
    expect(loadAnimation).toHaveBeenCalledTimes(1);
    expect(total()).toBe('0.00');
  });
});

describe('con detalles (criterios 1, 3 y 5)', () => {
  it('criterio 5: muestra una fila por detalle con su nombre, precio aplicado, cantidad y subtotal', () => {
    montar({ ventaActual: venta(leche, pan) });
    expect(filas()).toHaveLength(2);
    expect(celdas(filas()[0]).slice(0, 4)).toEqual(['Leche entera 1 L', '22.00', '2', '44.00']);
    expect(celdas(filas()[1]).slice(0, 4)).toEqual(['Pan de caja', '3.50', '1', '3.50']);
  });

  it('las columnas se llaman Producto, Precio aplicado, Cantidad, Subtotal y Acciones', () => {
    montar({ ventaActual: venta(leche) });
    const encabezados = wrapper.findAll('thead th').wrappers.map((celda) => celda.text());
    expect(encabezados).toEqual([
      'Producto',
      'Precio aplicado',
      'Cantidad',
      'Subtotal',
      'Acciones',
    ]);
  });

  it('cada fila tiene una celda de acciones: V-05, V-06 y V-07 ponen ahí lo suyo', () => {
    montar({ ventaActual: venta(leche, pan) });
    expect(wrapper.findAll('.detalle__acciones')).toHaveLength(2);
    for (const fila of filas()) expect(fila.findAll('td')).toHaveLength(5);
  });

  it('criterio 1: la leche a 25.00 con cantidad 1 tiene subtotal 25.00 y el total es 25.00', () => {
    montar({ ventaActual: venta({ ...leche, precioAplicado: '25.00', cantidad: 1 }) });
    expect(celdas(filas()[0]).slice(0, 4)).toEqual(['Leche entera 1 L', '25.00', '1', '25.00']);
    expect(total()).toBe('25.00');
  });

  it('criterio 3: 2 leches a 22.00 y 1 pan a 3.50 suman 47.50', () => {
    montar({ ventaActual: venta(leche, pan) });
    expect(total()).toBe('47.50');
  });

  it('los detalles salen en el orden en que se agregaron', () => {
    montar({ ventaActual: venta(pan, leche) });
    expect(filas().map((fila) => celdas(fila)[0])).toEqual(['Pan de caja', 'Leche entera 1 L']);
  });

  it('el subtotal y el total tienen siempre 2 decimales y no pierden centavos en el caso más grande', () => {
    const grande = { productoId: 9, nombre: 'Caro', precioAplicado: '99999.99', cantidad: 999 };
    montar({ ventaActual: venta({ ...pan, precioAplicado: '0.00', cantidad: 5 }, grande) });
    expect(celdas(filas()[0])[3]).toBe('0.00');
    expect(celdas(filas()[1])[3]).toBe('99899990.01');
    expect(total()).toBe('99899990.01');
  });

  it('sin símbolo de moneda ni separador de miles', () => {
    montar({ ventaActual: venta(leche) });
    expect(wrapper.text()).not.toMatch(/[$€£]/);
  });

  it('muestra los 100 detalles, sin paginación ni pie: la tabla de Vuetify trae 10 por página si no se le dice', () => {
    montar({ ventaActual: ventaConDetalles(100) });
    expect(filas()).toHaveLength(100);
    expect(wrapper.find('.v-data-footer').exists()).toBe(false);
    expect(total()).toBe('100.00');
  });

  it('usa una tabla de Vuetify 2 con la clave productoId, sin ordenar y sin paginar', () => {
    montar({ ventaActual: venta(leche, pan) });
    const tabla = wrapper.findComponent({ name: 'v-data-table' });
    expect(tabla.exists()).toBe(true);
    expect(tabla.props('itemKey')).toBe('productoId');
    expect(tabla.props('disablePagination')).toBe(true);
    expect(tabla.props('hideDefaultFooter')).toBe(true);
    expect(tabla.props('disableSort')).toBe(true);
  });

  it('cuando la venta actual cambia, la tabla y el total se actualizan al momento', async () => {
    montar({ ventaActual: venta(leche) });
    await wrapper.setProps({ ventaActual: venta(leche, pan) });
    expect(filas()).toHaveLength(2);
    expect(total()).toBe('47.50');
    await wrapper.setProps({ ventaActual: venta({ ...leche, cantidad: 3 }, pan) });
    expect(celdas(filas()[0]).slice(1, 4)).toEqual(['22.00', '3', '66.00']);
    expect(total()).toBe('69.50');
  });
});

describe('«Registrar venta» provisional (V-08 lo reemplaza)', () => {
  it('con una venta actual válida está habilitado', () => {
    montar({ ventaActual: venta(leche, pan) });
    expect(estaDeshabilitado(botonRegistrar())).toBe(false);
  });

  it('con solo productos a 0.00 está habilitado y el total es 0.00', () => {
    montar({ ventaActual: venta({ ...pan, precioAplicado: '0.00' }) });
    expect(estaDeshabilitado(botonRegistrar())).toBe(false);
    expect(total()).toBe('0.00');
  });

  it('criterio 14: con 100 detalles válidos sigue habilitado', () => {
    montar({ ventaActual: ventaConDetalles(100) });
    expect(estaDeshabilitado(botonRegistrar())).toBe(false);
  });

  it('con un error de un campo del detalle queda deshabilitado, y con la venta actual corregida se habilita', async () => {
    const errores = { 2: { cantidad: 'La cantidad debe ser un número entero de 1 a 999.' } };
    montar({ ventaActual: { detalles: [leche, pan], errores } });
    expect(estaDeshabilitado(botonRegistrar())).toBe(true);
    await wrapper.setProps({ ventaActual: venta(leche, pan) });
    expect(estaDeshabilitado(botonRegistrar())).toBe(false);
  });

  it('una fila con un valor escrito que no se aceptó sigue mostrando el último valor válido y el total lo suma', () => {
    const errores = { 1: { precioAplicado: 'Escribe un precio aplicado.' } };
    montar({ ventaActual: { detalles: [leche, pan], errores } });
    expect(celdas(filas()[0]).slice(1, 4)).toEqual(['22.00', '2', '44.00']);
    expect(total()).toBe('47.50');
  });

  it('todavía no manda nada a ningún lado: no emite eventos al presionarlo', async () => {
    montar({ ventaActual: venta(leche) });
    await botonRegistrar().trigger('click');
    // Vue Test Utils también anota los eventos internos del ciclo de vida (hook:created y demás).
    expect(Object.keys(wrapper.emitted()).filter((nombre) => !nombre.startsWith('hook:'))).toEqual(
      [],
    );
  });
});

describe('total siempre a la vista', () => {
  it('se anuncia a los lectores de pantalla: región viva educada y atómica', () => {
    montar({ ventaActual: venta(leche) });
    const franja = wrapper.find('[data-total]').element.closest('[aria-live]');
    expect(franja.getAttribute('aria-live')).toBe('polite');
    expect(franja.getAttribute('aria-atomic')).toBe('true');
    expect(franja.textContent).toContain('Total');
  });

  it('está con la venta actual vacía, con detalles y con muchos detalles', () => {
    for (const actual of [venta(), venta(leche), ventaConDetalles(100)]) {
      montar({ ventaActual: actual });
      expect(wrapper.find('[data-total]').exists()).toBe(true);
      wrapper.destroy();
    }
  });

  it('el botón «Registrar venta» está en la misma franja de abajo que el total', () => {
    montar({ ventaActual: venta(leche) });
    const pie = wrapper.find('[data-total]').element.closest('.venta-actual__pie');
    expect(pie).not.toBeNull();
    expect(pie.textContent).toContain('Registrar venta');
  });
});

describe('detalle recién agregado', () => {
  const resaltadas = () => filas().map((fila) => fila.classes().includes('detalle-resaltado'));

  afterEach(() => {
    delete Element.prototype.scrollIntoView;
  });

  it('la fila del resaltarId lleva la marca y las demás no', () => {
    montar({ ventaActual: venta(leche, pan), resaltarId: 2 });
    expect(resaltadas()).toEqual([false, true]);
  });

  it('sin resaltarId (null, el valor por defecto) ninguna fila se resalta', () => {
    montar({ ventaActual: venta(leche, pan) });
    expect(resaltadas()).toEqual([false, false]);
  });

  it('la marca se mueve cuando cambia resaltarId y se quita cuando vuelve a null', async () => {
    montar({ ventaActual: venta(leche, pan), resaltarId: 1 });
    expect(resaltadas()).toEqual([true, false]);
    await wrapper.setProps({ resaltarId: 2 });
    expect(resaltadas()).toEqual([false, true]);
    await wrapper.setProps({ resaltarId: null });
    expect(resaltadas()).toEqual([false, false]);
  });

  it('un resaltarId que no está en la venta actual no marca nada ni falla', () => {
    montar({ ventaActual: venta(leche), resaltarId: 99 });
    expect(resaltadas()).toEqual([false]);
  });

  it('deja la fila a la vista con scrollIntoView y block nearest, sin animación de movimiento', async () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    montar({ ventaActual: venta(leche) });
    await wrapper.setProps({ ventaActual: venta(leche, pan), resaltarId: 2 });
    await wrapper.vm.$nextTick();
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
    expect(scrollIntoView.mock.contexts[0]).toBe(filas()[1].element);
  });

  it('no hace scroll cuando resaltarId vuelve a null', async () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    montar({ ventaActual: venta(leche), resaltarId: 1 });
    await wrapper.setProps({ resaltarId: null });
    await wrapper.vm.$nextTick();
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('si el navegador no trae scrollIntoView (como jsdom) no pasa nada', async () => {
    expect(Element.prototype.scrollIntoView).toBeUndefined();
    montar({ ventaActual: venta(leche) });
    await wrapper.setProps({ ventaActual: venta(leche, pan), resaltarId: 2 });
    await wrapper.vm.$nextTick();
    expect(resaltadas()).toEqual([false, true]);
  });
});

describe('nombre del producto (RNF-04)', () => {
  it('se muestra como texto: Vue lo escapa y nunca se pinta como HTML', () => {
    const peligroso = '<img src=x onerror="window.__xss = 1"><b>negrita</b>';
    montar({ ventaActual: venta({ ...leche, nombre: peligroso }) });
    expect(celdas(filas()[0])[0]).toBe(peligroso);
    expect(wrapper.find('tbody img').exists()).toBe(false);
    expect(wrapper.find('tbody b').exists()).toBe(false);
    expect(window.__xss).toBeUndefined();
  });

  it('un nombre largo sin espacios se muestra entero', () => {
    const largo = 'Superlargo'.repeat(12);
    montar({ ventaActual: venta({ ...leche, nombre: largo }) });
    expect(celdas(filas()[0])[0]).toBe(largo);
  });
});

describe('propiedades', () => {
  it('acepta enviando (true mientras V-08 registra la venta) sin quejarse', () => {
    montar({ ventaActual: venta(leche), enviando: true, resaltarId: null });
    expect(wrapper.props('enviando')).toBe(true);
    expect(filas()).toHaveLength(1);
  });

  it('por defecto enviando es false y resaltarId es null', () => {
    montar();
    expect(wrapper.props('enviando')).toBe(false);
    expect(wrapper.props('resaltarId')).toBeNull();
  });

  it('no cambia la venta actual que recibe: solo la muestra', () => {
    const recibida = Object.freeze({
      detalles: Object.freeze([Object.freeze({ ...leche })]),
      errores: Object.freeze({}),
    });
    expect(() => montar({ ventaActual: recibida })).not.toThrow();
    expect(wrapper.props('ventaActual')).toBe(recibida);
  });
});

// Vuetify apila las filas con el ancho de la ventana, pero la tarjeta de la venta actual puede ser angosta aunque la
// ventana no lo sea (desde 960 px hay dos columnas y la tarjeta mide unos 400 px). El componente mide su propia tarjeta:
// si no caben las cinco columnas, apila las filas con la etiqueta de cada columna.
describe('filas apiladas cuando la tarjeta es angosta', () => {
  function observadorFalso() {
    const observadores = [];
    class ResizeObserverFalso {
      constructor(alCambiar) {
        this.alCambiar = alCambiar;
        this.observe = vi.fn();
        this.disconnect = vi.fn();
        observadores.push(this);
      }
    }
    vi.stubGlobal('ResizeObserver', ResizeObserverFalso);
    const medir = async (ancho) => {
      observadores.forEach((o) => o.alCambiar([{ contentRect: { width: ancho } }]));
      await wrapper.vm.$nextTick();
    };
    return { observadores, medir };
  }
  const apiladas = () => wrapper.findAll('tbody tr.v-data-table__mobile-table-row').length;

  it('sin medida (jsdom no trae ResizeObserver) sigue la regla de Vuetify: con 1024 px de ventana es una tabla', () => {
    montar({ ventaActual: venta(leche, pan) });
    expect(apiladas()).toBe(0);
    expect(wrapper.findAll('thead th')).toHaveLength(5);
  });

  it('con una tarjeta de 400 px apila las filas, y cada valor lleva la etiqueta de su columna', async () => {
    const { medir } = observadorFalso();
    montar({ ventaActual: venta(leche, pan) });
    await medir(400);
    expect(apiladas()).toBe(2);
    const etiquetas = wrapper
      .findAll('tbody tr')
      .at(0)
      .findAll('.v-data-table__mobile-row__header')
      .wrappers.map((etiqueta) => etiqueta.text());
    expect(etiquetas).toEqual(['Producto', 'Precio aplicado', 'Cantidad', 'Subtotal', 'Acciones']);
    expect(total()).toBe('47.50');
  });

  it('con una tarjeta ancha (900 px) es una tabla, aunque la ventana sea angosta', async () => {
    const { medir } = observadorFalso();
    montar({ ventaActual: venta(leche, pan) });
    await medir(400);
    await medir(900);
    expect(apiladas()).toBe(0);
    expect(wrapper.findAll('thead th')).toHaveLength(5);
  });

  it('observa la tarjeta entera y deja de observarla al destruirse', () => {
    const { observadores } = observadorFalso();
    montar({ ventaActual: venta(leche) });
    expect(observadores).toHaveLength(1);
    expect(observadores[0].observe).toHaveBeenCalledWith(wrapper.find('section').element);
    wrapper.destroy();
    expect(observadores[0].disconnect).toHaveBeenCalled();
  });

  it('mide la tarjeta al montarse, sin esperar al observador', async () => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get: () => 400,
    });
    try {
      montar({ ventaActual: venta(leche, pan) });
      await wrapper.vm.$nextTick();
      expect(apiladas()).toBe(2);
    } finally {
      delete HTMLElement.prototype.clientWidth;
    }
  });
});

// jsdom no calcula estilos: como hace tema.test.js, se revisa el texto de los estilos del componente.
describe('estilos de la venta actual (skill impeccable, jerarquía y total)', () => {
  const fuente = readFileSync(
    resolve(import.meta.dirname, '../../src/components/VentaActual.vue'),
    'utf8',
  );
  const css = [...fuente.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
    .map(([, bloque]) => bloque)
    .join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  const reglas = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selectores, cuerpo]) => ({
    selectores: selectores.split(',').map((s) => s.trim().replace(/\s+/g, ' ')),
    cuerpo,
  }));
  const escapar = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const declara = (fragmento, propiedad, valor) =>
    reglas.some(
      ({ selectores, cuerpo }) =>
        selectores.some((s) => s.includes(fragmento)) &&
        new RegExp(`(^|[;\\s])${propiedad}\\s*:\\s*${escapar(valor)}\\s*(;|$)`).test(cuerpo),
    );

  it('la franja de abajo (total y botón) se queda pegada al borde de abajo: position sticky con bottom 0', () => {
    expect(declara('.venta-actual__pie', 'position', 'sticky')).toBe(true);
    expect(declara('.venta-actual__pie', 'bottom', '0')).toBe(true);
  });

  it('la tarjeta no recorta su contenido (overflow hidden rompería el sticky)', () => {
    const propia = reglas.filter(({ selectores }) => selectores.includes('.venta-actual'));
    expect(propia.length).toBeGreaterThan(0);
    for (const { cuerpo } of propia) expect(cuerpo).not.toMatch(/overflow(-y)?\s*:\s*hidden/);
  });

  it('el total es lo más grande de la zona: 2rem (32 px), en negrita y con cifras tabulares', () => {
    expect(declara('.venta-actual__total', 'font-size', '2rem')).toBe(true);
    expect(declara('.venta-actual__total', 'font-weight', '700')).toBe(true);
    expect(declara('.venta-actual__total', 'font-variant-numeric', 'tabular-nums')).toBe(true);
  });

  it('el total va sobre la franja de acento, en tinta', () => {
    expect(declara('.venta-actual__franja-total', 'background', 'var(--v-accent-base)')).toBe(true);
  });

  it('la fila recién agregada se pinta con el acento y el texto en tinta, sin animación', () => {
    // Con !important: las reglas de Vuetify para el puntero sobre una fila pesan más que una regla normal.
    expect(declara('.detalle-resaltado', 'background', 'var(--v-accent-base) !important')).toBe(
      true,
    );
    expect(declara('.detalle-resaltado', 'color', 'var(--v-secondary-base)')).toBe(true);
    expect(css).not.toMatch(/@keyframes|animation\s*:|transition\s*:/);
  });

  it('los precios aplicados y los subtotales llevan cifras tabulares, para que los decimales queden en columna', () => {
    expect(declara('.detalle__precio-aplicado', 'font-variant-numeric', 'tabular-nums')).toBe(true);
    expect(declara('.detalle__subtotal', 'font-variant-numeric', 'tabular-nums')).toBe(true);
  });

  it('un nombre largo pasa a otra línea y no rompe la tabla', () => {
    expect(declara('.detalle__nombre', 'overflow-wrap', 'anywhere')).toBe(true);
  });

  // #74: con una cuadrícula de tres columnas fijas, el subtotal más grande se salía de su columna y se pegaba a la
  // cantidad (999 y 99899990.01 se leían 99999899990.01). Lo que no cabe pasa a otra línea.
  it('las filas apiladas pasan a otra línea lo que no cabe: flex con wrap, no una cuadrícula de columnas fijas (#74)', () => {
    expect(declara('.v-data-table__mobile-table-row', 'display', 'flex')).toBe(true);
    expect(declara('.v-data-table__mobile-table-row', 'flex-wrap', 'wrap')).toBe(true);
    expect(css).not.toMatch(/grid-template-columns/);
  });
});
