// Spec armar-venta-actual, "`CampoCantidad.vue` (V-06)" y criterios 1, 2, 4 y 5 de V-06: el botón «−», un campo de texto
// y el botón «+», en una fila. Recibe la cantidad válida del detalle (value) y el mensaje de error (error), y emite input
// con lo que escribió el cajero o con el número nuevo al presionar «+» o «−». No decide nada de la venta actual: eso lo
// hace VentaActual.vue con cambiarCantidad. Se prueba con Vuetify montado de verdad, porque los botones y el campo son
// suyos.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import vuetify from '../../src/plugins/vuetify.js';
import CampoCantidad from '../../src/components/CampoCantidad.vue';

const MENSAJE_INVALIDA = 'La cantidad debe ser un número entero de 1 a 999.';

let wrapper;
let contenedor;
let consola;

beforeEach(() => {
  contenedor = document.createElement('div');
  contenedor.setAttribute('data-app', 'true');
  document.body.appendChild(contenedor);
  consola = [vi.spyOn(console, 'error'), vi.spyOn(console, 'warn')];
  consola.forEach((espia) => espia.mockImplementation(() => {}));
});

afterEach(() => {
  wrapper?.destroy();
  wrapper = null;
  contenedor.remove();
  const avisos = consola.flatMap((espia) => espia.mock.calls.map((llamada) => llamada.join(' ')));
  consola.forEach((espia) => espia.mockRestore());
  expect(avisos).toEqual([]);
});

function montar(propsData = {}) {
  const lugar = contenedor.appendChild(document.createElement('div'));
  wrapper = mount(CampoCantidad, {
    vuetify,
    propsData: { value: 2, nombre: 'Leche entera 1 L', ...propsData },
    attachTo: lugar,
  });
  return wrapper;
}

const campo = () => wrapper.find('input');
const mas = () => wrapper.find('button[aria-label^="Aumentar la cantidad de"]');
const menos = () => wrapper.find('button[aria-label^="Disminuir la cantidad de"]');
const mensaje = () => wrapper.find('[role="alert"]');
const estaDeshabilitado = (elemento) => elemento.attributes('disabled') !== undefined;
const emitidos = () => wrapper.emitted('input') ?? [];
// Lo que hay escrito en el campo, como lo ve el cajero.
const escrito = () => campo().element.value;

// El cajero escribe en el campo: el campo emite input en cada cambio.
async function escribir(texto) {
  await campo().setValue(texto);
}

// El cajero sale del campo: con el foco puesto de verdad, como en el navegador.
async function salirDelCampo() {
  campo().element.focus();
  campo().element.blur();
  await wrapper.vm.$nextTick();
}

describe('la estructura: el botón «−», un campo de texto y el botón «+», en una fila', () => {
  it('tiene un solo elemento raíz con sus tres controles en este orden: «−», el campo y «+»', () => {
    montar();
    expect(wrapper.classes()).toContain('campo-cantidad');
    const controles = wrapper.findAll('button, input').wrappers.map((control) => control.element);
    expect(controles).toEqual([menos().element, campo().element, mas().element]);
  });

  it('declara las cuatro propiedades de la spec: value, error, nombre y disabled', () => {
    expect(Object.keys(CampoCantidad.props).sort()).toEqual([
      'disabled',
      'error',
      'nombre',
      'value',
    ]);
  });

  it('por defecto no hay error y no está deshabilitado', () => {
    montar();
    expect(wrapper.props('error')).toBe('');
    expect(wrapper.props('disabled')).toBe(false);
  });

  it('muestra la cantidad del detalle en el campo', () => {
    montar({ value: 7 });
    expect(escrito()).toBe('7');
  });

  it('solo emite input: no tiene otros eventos propios', async () => {
    montar();
    await mas().trigger('click');
    await escribir('5');
    await salirDelCampo();
    const propios = Object.keys(wrapper.emitted()).filter((nombre) => !nombre.startsWith('hook:'));
    expect(propios).toEqual(['input']);
  });
});

describe('los botones «+» y «−»', () => {
  it('se llaman «Aumentar la cantidad de <nombre>» y «Disminuir la cantidad de <nombre>»', () => {
    montar();
    expect(mas().attributes('aria-label')).toBe('Aumentar la cantidad de Leche entera 1 L');
    expect(menos().attributes('aria-label')).toBe('Disminuir la cantidad de Leche entera 1 L');
  });

  it('llevan los íconos mdi-plus y mdi-minus, que son decorativos', () => {
    montar();
    expect(mas().find('.mdi-plus').exists()).toBe(true);
    expect(menos().find('.mdi-minus').exists()).toBe(true);
    expect(mas().find('.v-icon').attributes('aria-hidden')).toBe('true');
    expect(menos().find('.v-icon').attributes('aria-hidden')).toBe('true');
  });

  it('no llevan texto: cada uno se nombra con su aria-label', () => {
    montar();
    expect(mas().text()).toBe('');
    expect(menos().text()).toBe('');
  });

  it('cada uno mide al menos 44 × 44 px: se usan con el dedo', () => {
    montar();
    for (const boton of [mas(), menos()]) {
      expect(parseFloat(boton.element.style.height)).toBeGreaterThanOrEqual(44);
      expect(parseFloat(boton.element.style.minWidth)).toBeGreaterThanOrEqual(44);
    }
  });

  it('son botones de formulario que no envían nada: type button', () => {
    montar();
    expect(mas().attributes('type')).toBe('button');
    expect(menos().attributes('type')).toBe('button');
  });

  it('el nombre del producto se usa como texto en la etiqueta, nunca como HTML (RNF-04)', () => {
    const peligroso = '<img src=x onerror="window.__xss = 1"> "Leche" & más';
    montar({ nombre: peligroso });
    expect(mas().attributes('aria-label')).toBe(`Aumentar la cantidad de ${peligroso}`);
    expect(campo().attributes('aria-label')).toBe(`Cantidad de ${peligroso}`);
    expect(wrapper.find('img').exists()).toBe(false);
    expect(window.__xss).toBeUndefined();
  });
});

describe('«−» y «+» se deshabilitan en los límites (criterios 2 y 4)', () => {
  it('criterio 2: con la cantidad 1, «−» está deshabilitado y «+» no', () => {
    montar({ value: 1 });
    expect(estaDeshabilitado(menos())).toBe(true);
    expect(estaDeshabilitado(mas())).toBe(false);
  });

  it('criterio 4: con la cantidad 999, «+» está deshabilitado y «−» no', () => {
    montar({ value: 999 });
    expect(estaDeshabilitado(mas())).toBe(true);
    expect(estaDeshabilitado(menos())).toBe(false);
  });

  it('con una cantidad de en medio los dos se pueden usar', async () => {
    montar({ value: 2 });
    expect(estaDeshabilitado(menos())).toBe(false);
    expect(estaDeshabilitado(mas())).toBe(false);
    await wrapper.setProps({ value: 998 });
    expect(estaDeshabilitado(mas())).toBe(false);
    expect(estaDeshabilitado(menos())).toBe(false);
  });

  it('un botón deshabilitado no emite nada al presionarlo', async () => {
    montar({ value: 1 });
    await menos().trigger('click');
    expect(emitidos()).toHaveLength(0);
    wrapper.destroy();
    montar({ value: 999 });
    await mas().trigger('click');
    expect(emitidos()).toHaveLength(0);
  });

  it('se deshabilitan según la cantidad válida, no según lo que se escribe en el campo', async () => {
    montar({ value: 1, error: MENSAJE_INVALIDA });
    await escribir('abc');
    expect(estaDeshabilitado(menos())).toBe(true);
    await wrapper.setProps({ value: 5 });
    await escribir('1');
    expect(estaDeshabilitado(menos())).toBe(false);
  });

  it('cuando la cantidad cambia, el estado de los botones cambia con ella', async () => {
    montar({ value: 1 });
    expect(estaDeshabilitado(menos())).toBe(true);
    await wrapper.setProps({ value: 2 });
    expect(estaDeshabilitado(menos())).toBe(false);
    await wrapper.setProps({ value: 999 });
    expect(estaDeshabilitado(mas())).toBe(true);
  });
});

describe('presionar «+» o «−» (criterios 1 y 5)', () => {
  it('criterio 1: «+» emite input con la cantidad del detalle más 1', async () => {
    montar({ value: 2 });
    await mas().trigger('click');
    expect(emitidos()).toEqual([[3]]);
  });

  it('«−» emite input con la cantidad del detalle menos 1', async () => {
    montar({ value: 2 });
    await menos().trigger('click');
    expect(emitidos()).toEqual([[1]]);
  });

  it('emite un número, no un texto, y una sola vez por clic', async () => {
    montar({ value: 41 });
    await mas().trigger('click');
    expect(emitidos()).toHaveLength(1);
    expect(typeof emitidos()[0][0]).toBe('number');
    expect(emitidos()[0][0]).toBe(42);
  });

  it('cada clic parte de la cantidad del detalle: si quien lo usa no la actualiza, sigue siendo la misma más 1', async () => {
    montar({ value: 5 });
    await mas().trigger('click');
    await mas().trigger('click');
    expect(emitidos()).toEqual([[6], [6]]);
  });

  it('con la cantidad nueva que manda quien lo usa, el campo la muestra', async () => {
    montar({ value: 2 });
    await mas().trigger('click');
    await wrapper.setProps({ value: 3 });
    expect(escrito()).toBe('3');
    await menos().trigger('click');
    await wrapper.setProps({ value: 2 });
    expect(escrito()).toBe('2');
  });

  it('llega hasta 999 y hasta 1 con los botones', async () => {
    montar({ value: 998 });
    await mas().trigger('click');
    expect(emitidos()).toEqual([[999]]);
    wrapper.destroy();
    montar({ value: 2 });
    await menos().trigger('click');
    expect(emitidos()).toEqual([[1]]);
  });

  it('criterio 5: con una cantidad inválida escrita, «+» emite la cantidad válida más 1 y el campo la muestra', async () => {
    montar({ value: 2, error: MENSAJE_INVALIDA });
    await escribir('abc');
    await mas().trigger('click');
    expect(emitidos().at(-1)).toEqual([3]);
    expect(escrito()).toBe('3');
    // Quien lo usa quita el error y sube la cantidad: el campo sigue mostrando el valor válido.
    await wrapper.setProps({ value: 3, error: '' });
    expect(escrito()).toBe('3');
    expect(mensaje().exists()).toBe(false);
  });

  it('con una cantidad inválida escrita, «−» emite la cantidad válida menos 1 y el campo la muestra', async () => {
    montar({ value: 5, error: MENSAJE_INVALIDA });
    await escribir('1000');
    await menos().trigger('click');
    expect(emitidos().at(-1)).toEqual([4]);
    expect(escrito()).toBe('4');
  });

  // «0», «1000», «1.5» y «abc» son los valores de la tarjeta y de RF-06.
  it.each(['0', '1000', '1.5', 'abc', '', '-3', '1e2'])(
    'con «%s» escrito, «+» y «−» siguen usando la cantidad válida del detalle y no el texto',
    async (texto) => {
      montar({ value: 5, error: MENSAJE_INVALIDA });
      await escribir(texto);
      await mas().trigger('click');
      expect(emitidos().at(-1)).toEqual([6]);
      await escribir(texto);
      await menos().trigger('click');
      expect(emitidos().at(-1)).toEqual([4]);
    },
  );

  it('un texto válido escrito todavía no cambia la cantidad del detalle: «+» parte de lo que dice value', async () => {
    montar({ value: 5 });
    await escribir('20');
    await mas().trigger('click');
    expect(emitidos().at(-1)).toEqual([6]);
  });
});

describe('el campo de texto', () => {
  it('es de texto con inputmode numeric y no type number: las reglas de RN-06 se validan sobre texto', () => {
    montar();
    expect(campo().attributes('type')).toBe('text');
    expect(campo().attributes('inputmode')).toBe('numeric');
    expect(campo().attributes('autocomplete')).toBe('off');
  });

  it('se llama «Cantidad de <nombre>»', () => {
    montar();
    expect(campo().attributes('aria-label')).toBe('Cantidad de Leche entera 1 L');
  });

  it('emite input en cada cambio con lo que escribió el cajero, tal cual y como texto', async () => {
    montar({ value: 2 });
    await escribir('1');
    await escribir('12');
    await escribir('007');
    await escribir(' 7 ');
    expect(emitidos()).toEqual([['1'], ['12'], ['007'], [' 7 ']]);
  });

  it('emite también cuando lo escrito no sirve: «0», «1000», «1.5», «abc» y vacío', async () => {
    montar({ value: 2 });
    for (const texto of ['0', '1000', '1.5', 'abc']) await escribir(texto);
    await escribir('');
    expect(emitidos()).toEqual([['0'], ['1000'], ['1.5'], ['abc'], ['']]);
  });

  it('conserva lo escrito aunque no sirva: no lo cambia por la cantidad válida', async () => {
    montar({ value: 2, error: MENSAJE_INVALIDA });
    for (const texto of ['0', '1000', '1.5', 'abc', '']) {
      await escribir(texto);
      expect(escrito()).toBe(texto);
    }
  });

  it('conserva lo escrito aunque quien lo usa vuelva a dibujar el campo con el mismo value', async () => {
    montar({ value: 2 });
    await escribir('abc');
    await wrapper.setProps({ error: MENSAJE_INVALIDA });
    await wrapper.setProps({ nombre: 'Leche entera 1 L' });
    expect(escrito()).toBe('abc');
  });
});

describe('el error del campo (criterio 3 de V-06)', () => {
  it('sin error no hay mensaje ni marca de error', () => {
    montar();
    expect(mensaje().exists()).toBe(false);
    expect(campo().attributes('aria-invalid')).toBeUndefined();
    expect(campo().attributes('aria-describedby')).toBeUndefined();
    expect(wrapper.find('.v-input').classes()).not.toContain('error--text');
  });

  it('con error muestra el mensaje debajo, tal cual lo dice la propiedad', async () => {
    montar({ value: 2, error: MENSAJE_INVALIDA });
    expect(mensaje().text()).toBe(MENSAJE_INVALIDA);
    const posicion = campo().element.compareDocumentPosition(mensaje().element);
    expect(posicion & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await wrapper.setProps({ error: 'Escribe una cantidad.' });
    expect(mensaje().text()).toBe('Escribe una cantidad.');
  });

  it('con error el campo se marca: borde de error, aria-invalid y el mensaje ligado con aria-describedby', () => {
    montar({ value: 2, error: MENSAJE_INVALIDA });
    expect(wrapper.find('.v-input').classes()).toContain('error--text');
    expect(campo().attributes('aria-invalid')).toBe('true');
    const id = campo().attributes('aria-describedby');
    expect(id).toBeTruthy();
    expect(mensaje().attributes('id')).toBe(id);
  });

  it('el mensaje se anuncia al aparecer (role alert) y lleva un ícono de error, que es decorativo', () => {
    montar({ value: 2, error: MENSAJE_INVALIDA });
    expect(mensaje().attributes('role')).toBe('alert');
    const icono = mensaje().find('.v-icon');
    expect(icono.exists()).toBe(true);
    expect(icono.classes()).toContain('error--text');
    expect(icono.attributes('aria-hidden')).toBe('true');
  });

  it('el mensaje se va cuando quien lo usa quita el error, y el campo deja de estar marcado', async () => {
    montar({ value: 2, error: MENSAJE_INVALIDA });
    await wrapper.setProps({ error: '' });
    expect(mensaje().exists()).toBe(false);
    expect(campo().attributes('aria-invalid')).toBeUndefined();
    expect(campo().attributes('aria-describedby')).toBeUndefined();
    expect(wrapper.find('.v-input').classes()).not.toContain('error--text');
  });

  it('el mensaje ocupa el ancho de los tres controles, no solo el del campo', () => {
    montar({ value: 2, error: MENSAJE_INVALIDA });
    expect(mensaje().element.parentElement).toBe(wrapper.element);
  });

  it('el mensaje es texto: nada se pinta como HTML (RNF-04)', () => {
    montar({ value: 2, error: '<b>negrita</b><img src=x>' });
    expect(mensaje().text()).toBe('<b>negrita</b><img src=x>');
    expect(mensaje().find('b').exists()).toBe(false);
    expect(wrapper.find('img').exists()).toBe(false);
  });

  it('dos campos con error tienen mensajes con ids distintos', () => {
    montar({ value: 2, error: MENSAJE_INVALIDA });
    const primero = mensaje().attributes('id');
    const otra = mount(CampoCantidad, {
      vuetify,
      propsData: { value: 3, nombre: 'Pan de caja', error: MENSAJE_INVALIDA },
      attachTo: contenedor.appendChild(document.createElement('div')),
    });
    const segundo = otra.find('[role="alert"]').attributes('id');
    otra.destroy();
    expect(primero).not.toBe(segundo);
  });
});

describe('al salir del campo', () => {
  it('con un texto válido muestra la cantidad normalizada: «007» pasa a «7»', async () => {
    montar({ value: 2 });
    await escribir('007');
    await salirDelCampo();
    expect(escrito()).toBe('7');
  });

  it.each([
    [' 12 ', '12'],
    ['0999', '999'],
    ['\t5', '5'],
    ['1', '1'],
    ['000042', '42'],
  ])('«%s» válido se ve como «%s»', async (texto, normalizada) => {
    montar({ value: 2 });
    await escribir(texto);
    await salirDelCampo();
    expect(escrito()).toBe(normalizada);
  });

  it('con un texto inválido deja lo escrito, con su error', async () => {
    montar({ value: 2, error: MENSAJE_INVALIDA });
    for (const texto of ['0', '1000', '1.5', 'abc', '', '  ']) {
      await escribir(texto);
      await salirDelCampo();
      expect(escrito()).toBe(texto);
    }
    expect(mensaje().text()).toBe(MENSAJE_INVALIDA);
  });

  it('no emite nada al salir: normalizar lo que se ve no cambia la cantidad', async () => {
    montar({ value: 2 });
    await escribir('007');
    const antes = emitidos().length;
    await salirDelCampo();
    expect(emitidos()).toHaveLength(antes);
  });

  it('mientras el cajero escribe, el campo no cambia lo que escribe: «007» se ve «007» hasta que sale', async () => {
    montar({ value: 2 });
    campo().element.focus();
    await escribir('007');
    await wrapper.setProps({ value: 7 });
    expect(escrito()).toBe('007');
    campo().element.blur();
    await wrapper.vm.$nextTick();
    expect(escrito()).toBe('7');
  });
});

describe('con disabled (mientras se envía la venta)', () => {
  it('el campo y los dos botones no se pueden usar', () => {
    montar({ value: 2, disabled: true });
    expect(estaDeshabilitado(campo())).toBe(true);
    expect(estaDeshabilitado(mas())).toBe(true);
    expect(estaDeshabilitado(menos())).toBe(true);
  });

  it('no emite nada aunque se intente presionar o escribir', async () => {
    montar({ value: 2, disabled: true });
    await mas().trigger('click');
    await menos().trigger('click');
    await escribir('9');
    expect(emitidos()).toHaveLength(0);
  });

  it('sin disabled, o al quitarlo, todo se puede usar de nuevo', async () => {
    montar({ value: 2, disabled: true });
    await wrapper.setProps({ disabled: false });
    expect(estaDeshabilitado(campo())).toBe(false);
    expect(estaDeshabilitado(mas())).toBe(false);
    expect(estaDeshabilitado(menos())).toBe(false);
  });

  it('un campo con error también se deshabilita y conserva su mensaje', () => {
    montar({ value: 2, disabled: true, error: MENSAJE_INVALIDA });
    expect(estaDeshabilitado(campo())).toBe(true);
    expect(mensaje().text()).toBe(MENSAJE_INVALIDA);
  });
});

describe('cuando la cantidad cambia desde afuera', () => {
  it('si el campo no tiene el foco, muestra la cantidad nueva', async () => {
    montar({ value: 2 });
    await wrapper.setProps({ value: 5 });
    expect(escrito()).toBe('5');
  });

  it('si tenía un texto inválido escrito y el campo no tiene el foco, vuelve a mostrar la cantidad válida', async () => {
    montar({ value: 2, error: MENSAJE_INVALIDA });
    await escribir('abc');
    await wrapper.setProps({ value: 3, error: '' });
    expect(escrito()).toBe('3');
  });

  it('si el cajero está escribiendo (el campo tiene el foco), no le cambia lo que escribe', async () => {
    montar({ value: 2 });
    campo().element.focus();
    await escribir('1');
    await wrapper.setProps({ value: 1 });
    await escribir('12');
    await wrapper.setProps({ value: 12 });
    expect(escrito()).toBe('12');
    await wrapper.setProps({ value: 99 });
    expect(escrito()).toBe('12');
  });

  it('un campo deshabilitado no está escribiendo nadie, aunque tuviera el foco: sigue la cantidad', async () => {
    montar({ value: 2 });
    campo().element.focus();
    await wrapper.setProps({ disabled: true });
    await wrapper.setProps({ value: 8 });
    expect(escrito()).toBe('8');
  });

  it('con la misma cantidad otra vez no toca lo escrito', async () => {
    montar({ value: 2, error: MENSAJE_INVALIDA });
    await escribir('abc');
    await wrapper.setProps({ value: 2 });
    expect(escrito()).toBe('abc');
  });
});

// jsdom no calcula estilos: como hace VentaActual.test.js, se revisa el texto de los estilos del componente.
describe('estilos del campo (skill impeccable, DESIGN.md)', () => {
  const fuente = readFileSync(
    resolve(import.meta.dirname, '../../src/components/CampoCantidad.vue'),
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

  it('la cantidad va centrada y en cifras tabulares, para que no baile al subir o bajar', () => {
    expect(declara('input', 'text-align', 'center')).toBe(true);
    expect(declara('input', 'font-variant-numeric', 'tabular-nums')).toBe(true);
  });

  it('el campo mide 44 px de alto, como los botones, para que los tres se alineen y se usen con el dedo', () => {
    expect(declara('.v-input__slot', 'min-height', '2.75rem')).toBe(true);
  });

  it('los botones llevan el borde del campo en reposo: la tinta al 55 % (3.4 de contraste sobre blanco)', () => {
    expect(
      declara(
        '.campo-cantidad__boton',
        'border-color',
        'color-mix(in srgb, var(--v-secondary-base) 55%, transparent)',
      ),
    ).toBe(true);
  });

  it('el mensaje no ensancha la celda de la tabla: toma el ancho de los tres controles y baja de línea', () => {
    expect(declara('.campo-cantidad__error', 'width', '0')).toBe(true);
    expect(declara('.campo-cantidad__error', 'min-width', '100%')).toBe(true);
  });

  it('el texto del mensaje no se pinta de rojo: ni un color propio ni un hexadecimal', () => {
    const reglasDelMensaje = reglas.filter(({ selectores }) =>
      selectores.some((s) => s.includes('.campo-cantidad__error')),
    );
    for (const { cuerpo } of reglasDelMensaje) {
      expect(cuerpo).not.toMatch(/(^|[;\s])color\s*:/);
    }
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  it('nada se mueve: sin animaciones ni transiciones propias', () => {
    expect(css).not.toMatch(/@keyframes|animation\s*:|transition\s*:/);
  });

  it('los colores salen de las variables del tema, no de valores propios', () => {
    expect(css).toMatch(/var\(--v-secondary-base\)/);
    expect(css).not.toMatch(/rgba?\(/);
  });
});
