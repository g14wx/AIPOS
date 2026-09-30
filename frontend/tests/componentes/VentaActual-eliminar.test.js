// Spec armar-venta-actual, "Botón «Eliminar» (V-07)" y criterios 1 y 2 de V-07: cada fila de la venta actual tiene un botón
// de ícono (mdi-delete, en el color de lo que borra) con el nombre del producto en su etiqueta accesible. Al presionarlo,
// VentaActual emite update:ventaActual con la venta actual sin ese detalle: no la guarda ni la conserva, la recibe y
// la emite, y App.vue la reemplaza. No pide confirmación. Con enviando queda deshabilitado. Después de eliminar, el foco pasa a
// la fila que ocupó su lugar o, si no queda ninguna, al título. Para que el foco sea de verdad, el componente se monta dentro
// del documento. lottie-web no dibuja en jsdom: se sustituye con la ruta exacta que importa AnimacionLottie.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

const { loadAnimation } = vi.hoisted(() => ({
  loadAnimation: vi.fn(() => ({ destroy() {}, goToAndStop() {}, totalFrames: 40 })),
}));

vi.mock('lottie-web/build/player/lottie_light', () => ({ default: { loadAnimation } }));

import vuetify from '../../src/plugins/vuetify.js';
import VentaActual from '../../src/components/VentaActual.vue';

const leche = { productoId: 1, nombre: 'Leche entera 1 L', precioAplicado: '22.00', cantidad: 2 };
const pan = { productoId: 2, nombre: 'Pan de caja', precioAplicado: '3.50', cantidad: 1 };
const huevos = { productoId: 3, nombre: 'Huevos x 12', precioAplicado: '4.25', cantidad: 1 };
const venta = (...detalles) => ({ detalles, errores: {} });
const errorDeCantidad = 'La cantidad debe ser un número entero de 1 a 999.';

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
});

afterEach(() => {
  wrapper?.destroy();
  wrapper = null;
  contenedor.remove();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
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
const celdas = (fila) => fila.findAll('td').wrappers.map((celda) => celda.text());
const total = () => wrapper.find('[data-total]').text();
const etiqueta = (nombre) => `Eliminar ${nombre} de la venta actual`;
const botones = () =>
  wrapper
    .findAll('button')
    .wrappers.filter((b) => b.attributes('aria-label')?.startsWith('Eliminar '));
const botonEliminar = (nombre) =>
  botones().find((boton) => boton.attributes('aria-label') === etiqueta(nombre));
const botonRegistrar = () =>
  wrapper.findAll('button').wrappers.find((boton) => boton.text() === 'Registrar venta');
const estaDeshabilitado = (boton) => boton.attributes('disabled') !== undefined;
const emitidas = () => wrapper.emitted('update:ventaActual') ?? [];

// Lo que hace App.vue: reemplaza la venta actual con la que emitió el componente.
async function reemplazarConLaEmitida() {
  await wrapper.setProps({ ventaActual: emitidas().at(-1)[0] });
  await wrapper.vm.$nextTick();
}

describe('el botón «Eliminar» de cada fila', () => {
  it('cada fila tiene su botón, con el nombre del producto en la etiqueta accesible', () => {
    montar({ ventaActual: venta(leche, pan) });
    expect(botones().map((boton) => boton.attributes('aria-label'))).toEqual([
      'Eliminar Leche entera 1 L de la venta actual',
      'Eliminar Pan de caja de la venta actual',
    ]);
    expect(filas()).toHaveLength(2);
  });

  it('es un botón de ícono mdi-delete en el color de las acciones que borran (error)', () => {
    montar({ ventaActual: venta(leche) });
    const boton = botonEliminar(leche.nombre);
    expect(boton.classes()).toEqual(expect.arrayContaining(['v-btn--icon', 'error--text']));
    expect(boton.attributes('type')).toBe('button');
    expect(boton.find('.v-icon').classes()).toContain('mdi-delete');
  });

  it('mide al menos 44 × 44 px: es el tamaño grande de Vuetify, el de los botones de la pantalla', () => {
    montar({ ventaActual: venta(leche) });
    expect(botonEliminar(leche.nombre).classes()).toContain('v-size--large');
  });

  it('está en la celda de acciones de su fila, la última, y es lo último en el orden del teclado', () => {
    montar({ ventaActual: venta(leche, pan) });
    for (const [indice, detalle] of [leche, pan].entries()) {
      const fila = filas()[indice];
      expect(fila.findAll('td').at(4).find('.detalle__acciones').exists()).toBe(true);
      expect(fila.findAll('td').at(4).findAll('button')).toHaveLength(1);
      const enfocables = fila.findAll('button, input, select, textarea, a[href], [tabindex]');
      expect(enfocables.at(-1).attributes('aria-label')).toBe(etiqueta(detalle.nombre));
    }
  });

  it('con la venta actual vacía no hay ningún botón «Eliminar»', () => {
    montar({ ventaActual: venta() });
    expect(botones()).toHaveLength(0);
  });

  it('el nombre del producto va como texto en la etiqueta: con comillas o HTML no rompe nada (RNF-04)', () => {
    const peligroso = '"><img src=x onerror="window.__xss = 1"><b>negrita</b>';
    montar({ ventaActual: venta({ ...leche, nombre: peligroso }) });
    expect(botones()[0].attributes('aria-label')).toBe(etiqueta(peligroso));
    expect(wrapper.find('tbody img').exists()).toBe(false);
    expect(window.__xss).toBeUndefined();
  });
});

describe('al presionar «Eliminar» (criterios 1 y 2)', () => {
  it('criterio 1: emite update:ventaActual con la venta actual sin ese detalle, y nada más', async () => {
    montar({ ventaActual: venta(leche, pan) });
    await botonEliminar(pan.nombre).trigger('click');
    expect(emitidas()).toEqual([[{ detalles: [leche], errores: {} }]]);
    const otros = Object.keys(wrapper.emitted()).filter((nombre) => !nombre.startsWith('hook:'));
    expect(otros).toEqual(['update:ventaActual']);
  });

  it('criterio 1: con la venta nueva como propiedad queda la leche y el total se recalcula', async () => {
    montar({ ventaActual: venta(leche, pan) });
    expect(total()).toBe('47.50');
    await botonEliminar(pan.nombre).trigger('click');
    await reemplazarConLaEmitida();
    expect(filas()).toHaveLength(1);
    expect(celdas(filas()[0]).slice(0, 4)).toEqual(['Leche entera 1 L', '22.00', '2', '44.00']);
    expect(total()).toBe('44.00');
  });

  it('criterio 2: con un solo detalle emite la venta actual vacía y se ve el estado vacío', async () => {
    montar({ ventaActual: venta(leche) });
    await botonEliminar(leche.nombre).trigger('click');
    expect(emitidas()).toEqual([[{ detalles: [], errores: {} }]]);
    await reemplazarConLaEmitida();
    expect(wrapper.text()).toContain('Busca un producto para empezar la venta');
    expect(wrapper.find('table').exists()).toBe(false);
    expect(total()).toBe('0.00');
    expect(estaDeshabilitado(botonRegistrar())).toBe(true);
  });

  it('elimina el detalle de la fila del botón y no el de otra: con tres detalles, el del medio', async () => {
    montar({ ventaActual: venta(leche, pan, huevos) });
    await botonEliminar(pan.nombre).trigger('click');
    expect(emitidas()[0][0].detalles).toEqual([leche, huevos]);
  });

  it('no cambia la venta actual que recibió: emite otra, y la propiedad sigue igual hasta que App.vue la reemplace', async () => {
    const recibida = Object.freeze({
      detalles: Object.freeze([Object.freeze({ ...leche }), Object.freeze({ ...pan })]),
      errores: Object.freeze({}),
    });
    montar({ ventaActual: recibida });
    await botonEliminar(pan.nombre).trigger('click');
    expect(emitidas()[0][0]).not.toBe(recibida);
    expect(wrapper.props('ventaActual')).toBe(recibida);
    expect(recibida.detalles).toHaveLength(2);
    expect(filas()).toHaveLength(2);
  });

  it('no pide confirmación: un solo clic basta y no se abre ninguna ventana', async () => {
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(true);
    montar({ ventaActual: venta(leche, pan) });
    await botonEliminar(pan.nombre).trigger('click');
    expect(emitidas()).toHaveLength(1);
    expect(confirmar).not.toHaveBeenCalled();
    expect(document.querySelector('[role="dialog"], .v-dialog')).toBeNull();
  });

  it('un detalle con un error escrito: al eliminarlo se van el detalle y su error, y «Registrar venta» se habilita', async () => {
    const errores = { 2: { cantidad: errorDeCantidad } };
    montar({ ventaActual: { detalles: [leche, pan], errores } });
    expect(estaDeshabilitado(botonRegistrar())).toBe(true);
    await botonEliminar(pan.nombre).trigger('click');
    expect(emitidas()[0][0]).toEqual({ detalles: [leche], errores: {} });
    await reemplazarConLaEmitida();
    expect(estaDeshabilitado(botonRegistrar())).toBe(false);
  });

  it('el botón de una fila distinta no cambia: cada uno emite lo suyo', async () => {
    montar({ ventaActual: venta(leche, pan) });
    await botonEliminar(leche.nombre).trigger('click');
    expect(emitidas().at(-1)[0].detalles).toEqual([pan]);
    await botonEliminar(pan.nombre).trigger('click');
    expect(emitidas().at(-1)[0].detalles).toEqual([leche]);
  });
});

describe('mientras V-08 registra la venta (enviando)', () => {
  it('todos los botones «Eliminar» están deshabilitados', () => {
    montar({ ventaActual: venta(leche, pan), enviando: true });
    expect(botones()).toHaveLength(2);
    for (const boton of botones()) {
      expect(estaDeshabilitado(boton)).toBe(true);
      expect(boton.classes()).toContain('v-btn--disabled');
    }
  });

  it('un clic no emite nada', async () => {
    montar({ ventaActual: venta(leche, pan), enviando: true });
    await botonEliminar(pan.nombre).trigger('click');
    botonEliminar(pan.nombre).element.click();
    await wrapper.vm.$nextTick();
    expect(emitidas()).toHaveLength(0);
  });

  it('cuando termina de enviar, los botones se habilitan y vuelven a eliminar', async () => {
    montar({ ventaActual: venta(leche, pan), enviando: true });
    await wrapper.setProps({ enviando: false });
    expect(botones().some(estaDeshabilitado)).toBe(false);
    await botonEliminar(pan.nombre).trigger('click');
    expect(emitidas()).toHaveLength(1);
  });

  it('sin enviando (el valor por defecto) los botones están habilitados', () => {
    montar({ ventaActual: venta(leche) });
    expect(estaDeshabilitado(botonEliminar(leche.nombre))).toBe(false);
  });
});

describe('el foco después de eliminar, para que quien usa el teclado no pierda su lugar', () => {
  const foco = () => document.activeElement;
  // Como un clic o un Enter de verdad: el foco está en el botón que se va a quitar de la pantalla.
  async function eliminarConElFocoEnElBoton(nombre) {
    botonEliminar(nombre).element.focus();
    expect(foco()).toBe(botonEliminar(nombre).element);
    await botonEliminar(nombre).trigger('click');
    await reemplazarConLaEmitida();
  }

  it('pasa al botón «Eliminar» de la fila que ocupó su lugar', async () => {
    montar({ ventaActual: venta(leche, pan, huevos) });
    await eliminarConElFocoEnElBoton(pan.nombre);
    expect(filas()).toHaveLength(2);
    expect(foco()).toBe(botonEliminar(huevos.nombre).element);
  });

  it('si era la primera fila, pasa al botón de la que ahora es la primera', async () => {
    montar({ ventaActual: venta(leche, pan, huevos) });
    await eliminarConElFocoEnElBoton(leche.nombre);
    expect(foco()).toBe(botonEliminar(pan.nombre).element);
  });

  it('si era la última fila, pasa al botón de la anterior', async () => {
    montar({ ventaActual: venta(leche, pan, huevos) });
    await eliminarConElFocoEnElBoton(huevos.nombre);
    expect(foco()).toBe(botonEliminar(pan.nombre).element);
  });

  it('si la venta actual quedó vacía, pasa al título «Venta actual»', async () => {
    montar({ ventaActual: venta(leche) });
    await eliminarConElFocoEnElBoton(leche.nombre);
    const titulo = wrapper.find('h2');
    expect(titulo.text()).toBe('Venta actual');
    expect(foco()).toBe(titulo.element);
  });

  it('el título lleva tabindex -1, con detalles y sin ellos: se enfoca con código y no entra en el orden de Tab', async () => {
    montar({ ventaActual: venta(leche) });
    expect(wrapper.find('h2').attributes('tabindex')).toBe('-1');
    await wrapper.setProps({ ventaActual: venta() });
    expect(wrapper.find('h2').attributes('tabindex')).toBe('-1');
  });

  it('eliminar con el puntero también deja el foco en un lugar con sentido: no se queda en el <body>', async () => {
    montar({ ventaActual: venta(leche, pan) });
    await botonEliminar(leche.nombre).trigger('click');
    await reemplazarConLaEmitida();
    expect(foco()).not.toBe(document.body);
    expect(foco()).toBe(botonEliminar(pan.nombre).element);
  });

  it('no mueve el foco si la venta actual nueva todavía tiene ese detalle: lo cambió otra cosa', async () => {
    montar({ ventaActual: venta(leche, pan) });
    botonEliminar(leche.nombre).element.focus();
    await botonEliminar(pan.nombre).trigger('click');
    await wrapper.setProps({ ventaActual: venta(leche, pan, huevos) });
    await wrapper.vm.$nextTick();
    expect(foco()).toBe(botonEliminar(leche.nombre).element);
  });

  it('no hace falta que la venta actual vuelva a cambiar para seguir funcionando: dos eliminaciones seguidas', async () => {
    montar({ ventaActual: venta(leche, pan, huevos) });
    await eliminarConElFocoEnElBoton(leche.nombre);
    await eliminarConElFocoEnElBoton(pan.nombre);
    expect(foco()).toBe(botonEliminar(huevos.nombre).element);
    await eliminarConElFocoEnElBoton(huevos.nombre);
    expect(foco()).toBe(wrapper.find('h2').element);
  });
});

describe('con las filas apiladas (la tarjeta es angosta)', () => {
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
    return async (ancho) => {
      observadores.forEach((o) => o.alCambiar([{ contentRect: { width: ancho } }]));
      await wrapper.vm.$nextTick();
    };
  }
  const apiladas = () => wrapper.findAll('tbody tr.v-data-table__mobile-table-row').length;

  it('cada fila apilada conserva su botón «Eliminar», y emite igual', async () => {
    const medir = observadorFalso();
    montar({ ventaActual: venta(leche, pan) });
    await medir(400);
    expect(apiladas()).toBe(2);
    expect(botones()).toHaveLength(2);
    await botonEliminar(pan.nombre).trigger('click');
    expect(emitidas()[0][0].detalles).toEqual([leche]);
  });

  it('el foco pasa a la fila que ocupó su lugar también con las filas apiladas', async () => {
    const medir = observadorFalso();
    montar({ ventaActual: venta(leche, pan, huevos) });
    await medir(400);
    botonEliminar(pan.nombre).element.focus();
    await botonEliminar(pan.nombre).trigger('click');
    await reemplazarConLaEmitida();
    expect(apiladas()).toBe(2);
    expect(document.activeElement).toBe(botonEliminar(huevos.nombre).element);
  });
});

// #79: con un doble clic, el primer clic elimina el detalle, la lista sube y el segundo clic cae sobre el botón «Eliminar»
// de la fila que ocupó su lugar. Un navegador de verdad numera los clics seguidos en event.detail: 1 el clic suelto, 2 el
// segundo de un doble clic, 3 el tercero y 0 el que sale del teclado (Enter o Espacio). Vue Test Utils no deja poner
// detail en trigger, así que el clic se arma con MouseEvent.
describe('un doble clic no elimina dos detalles (#79)', () => {
  async function clic(nombre, detail) {
    const evento = new MouseEvent('click', { bubbles: true, cancelable: true, detail });
    botonEliminar(nombre).element.dispatchEvent(evento);
    await wrapper.vm.$nextTick();
  }

  it('el segundo clic de un doble clic no elimina el detalle que subió a ocupar su lugar', async () => {
    montar({ ventaActual: venta(leche, pan, huevos) });
    await clic(leche.nombre, 1);
    await reemplazarConLaEmitida();
    await clic(pan.nombre, 2);
    expect(emitidas()).toHaveLength(1);
    expect(filas()).toHaveLength(2);
  });

  it('un tercer clic seguido (detail 3) tampoco elimina', async () => {
    montar({ ventaActual: venta(leche, pan, huevos) });
    await clic(leche.nombre, 3);
    expect(emitidas()).toHaveLength(0);
  });

  it('un clic suelto (detail 1) y las teclas Enter o Espacio (detail 0) sí eliminan', async () => {
    montar({ ventaActual: venta(leche, pan, huevos) });
    await clic(leche.nombre, 1);
    expect(emitidas()).toHaveLength(1);
    await clic(pan.nombre, 0);
    expect(emitidas()).toHaveLength(2);
    await botonEliminar(huevos.nombre).trigger('click');
    expect(emitidas()).toHaveLength(3);
  });

  it('el cajero que espera y vuelve a presionar (detail 1) elimina otra vez', async () => {
    montar({ ventaActual: venta(leche, pan, huevos) });
    await clic(leche.nombre, 1);
    await reemplazarConLaEmitida();
    await clic(pan.nombre, 1);
    await reemplazarConLaEmitida();
    expect(filas()).toHaveLength(1);
    expect(celdas(filas()[0])[0]).toBe('Huevos x 12');
  });
});

// jsdom no calcula estilos ni reparte el espacio de la ventana: como hace VentaActual.test.js, se revisa el texto de los
// estilos del componente. Que el foco quede a la vista con muchas filas se prueba en el navegador (prueba en local).
describe('estilos de los controles de las filas y del foco (skill impeccable)', () => {
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
  const cuerpoDe = (selector) =>
    reglas
      .filter(({ selectores }) => selectores.includes(selector))
      .map(({ cuerpo }) => cuerpo)
      .join(';');
  const enRem = (valor) => (valor === '0' ? 0 : parseFloat(valor));

  // #80: la barra de arriba mide 3 rem (48 px) y la franja de abajo, con el total y «Registrar venta», unos 9.3 rem (149 px).
  it('los botones y los campos de las filas dejan margen de desplazamiento para la barra de arriba y la franja de abajo (#80)', () => {
    for (const selector of ['.detalles ::v-deep button', '.detalles ::v-deep input']) {
      const margen = cuerpoDe(selector)
        .match(/scroll-margin\s*:\s*([^;]+)/)?.[1]
        .trim()
        .split(/\s+/);
      expect(margen, selector).toHaveLength(3);
      const [arriba, , abajo] = margen;
      expect(enRem(arriba), `${selector}: arriba`).toBeGreaterThanOrEqual(3);
      expect(enRem(abajo), `${selector}: abajo`).toBeGreaterThanOrEqual(9.5);
    }
  });
});
