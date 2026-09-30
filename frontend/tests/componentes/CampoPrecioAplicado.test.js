// Spec armar-venta-actual, "CampoPrecioAplicado.vue (V-05)" y criterio 2 de V-05: el campo donde el cajero edita el precio
// aplicado de un detalle. Es un campo de texto de Vuetify (inputmode decimal, no type number) que recibe el precio aplicado
// válido (value) y el mensaje de error (error), y solo emite lo que escribió el cajero (input): la regla RN-05 la aplica
// quien lo usa, con cambiarPrecioAplicado. Al salir del campo o con Enter muestra el valor válido con 2 decimales.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import vuetify from '../../src/plugins/vuetify.js';
import CampoPrecioAplicado from '../../src/components/CampoPrecioAplicado.vue';

const MENSAJE = 'El precio aplicado debe ser un número de 0 a 99 999.99, como 22.00.';

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
  wrapper = mount(CampoPrecioAplicado, {
    vuetify,
    attachTo: lugar,
    propsData: { value: '25.00', nombre: 'Leche entera 1 L', ...propsData },
  });
  return wrapper;
}

const campo = () => wrapper.find('input');
const textoDelCampo = () => campo().element.value;
const emitidos = () => (wrapper.emitted('input') ?? []).map(([texto]) => texto);
const mensaje = () => wrapper.find('.v-messages__message');
const tienePuestoElFoco = () => document.activeElement === campo().element;

// El cajero entra al campo, como con Tab o con un clic: el foco es de verdad, no un evento suelto.
async function enfocar() {
  campo().element.focus();
  await wrapper.vm.$nextTick();
}
const escribir = (texto) => campo().setValue(texto);
// Vuetify avisa el blur un turno después, y el campo se vuelve a pintar en otro.
async function salir() {
  campo().element.blur();
  await wrapper.vm.$nextTick();
  await wrapper.vm.$nextTick();
}

describe('el campo de texto', () => {
  it('es un v-text-field de Vuetify y es el único elemento raíz', () => {
    montar();
    const vuetifyCampo = wrapper.findComponent({ name: 'v-text-field' });
    expect(vuetifyCampo.exists()).toBe(true);
    expect(wrapper.element).toBe(vuetifyCampo.element);
    expect(wrapper.element.classList.contains('v-input')).toBe(true);
  });

  it('es de texto con inputmode decimal y no type number: 1e3 y la rueda del ratón no entran', () => {
    montar();
    expect(campo().attributes('type')).toBe('text');
    expect(campo().attributes('inputmode')).toBe('decimal');
    expect(campo().attributes('autocomplete')).toBe('off');
  });

  it('su etiqueta accesible dice «Precio aplicado de <nombre>»', () => {
    montar({ nombre: 'Pan de caja' });
    expect(campo().attributes('aria-label')).toBe('Precio aplicado de Pan de caja');
  });

  it('el nombre del producto es solo texto: con signos y etiquetas no rompe la etiqueta ni pinta HTML', () => {
    const peligroso = '<b>Leche</b> "entera" <img src=x onerror="window.__xss = 1">';
    montar({ nombre: peligroso });
    expect(campo().attributes('aria-label')).toBe(`Precio aplicado de ${peligroso}`);
    expect(wrapper.find('b').exists()).toBe(false);
    expect(wrapper.find('img').exists()).toBe(false);
    expect(window.__xss).toBeUndefined();
  });

  it('muestra el precio aplicado que recibe, con sus 2 decimales', () => {
    montar({ value: '22.50' });
    expect(textoDelCampo()).toBe('22.50');
  });

  it('no lleva etiqueta propia: el encabezado de la columna (o de la fila apilada) ya dice «Precio aplicado»', () => {
    montar();
    expect(wrapper.find('label').exists()).toBe(false);
  });

  it('por defecto no tiene error ni está deshabilitado', () => {
    montar();
    expect(wrapper.props('error')).toBe('');
    expect(wrapper.props('disabled')).toBe(false);
    expect(mensaje().exists()).toBe(false);
    expect(campo().attributes('disabled')).toBeUndefined();
  });
});

describe('al escribir', () => {
  it('emite input en cada cambio con lo que escribió el cajero, tal cual', async () => {
    montar();
    await enfocar();
    await escribir('2');
    await escribir('22');
    await escribir('22.');
    await escribir('22.5');
    expect(emitidos()).toEqual(['2', '22', '22.', '22.5']);
  });

  it('no recorta ni arregla el texto: lo valida quien lo usa', async () => {
    montar();
    await enfocar();
    await escribir(' 22,50 ');
    await escribir('abc');
    await escribir('');
    expect(emitidos()).toEqual([' 22,50 ', 'abc', '']);
  });

  it('muestra lo que escribe aunque quien lo usa todavía no le mande un value nuevo', async () => {
    montar();
    await enfocar();
    await escribir('22.');
    expect(textoDelCampo()).toBe('22.');
  });

  it('no emite nada al montarse, al enfocar ni al salir sin haber escrito', async () => {
    montar();
    await enfocar();
    await salir();
    expect(wrapper.emitted('input')).toBeUndefined();
  });

  it('conserva lo escrito cuando llega un error', async () => {
    montar();
    await enfocar();
    await escribir('abc');
    await wrapper.setProps({ error: MENSAJE });
    expect(textoDelCampo()).toBe('abc');
  });
});

describe('con un error (criterio 2)', () => {
  it('muestra el mensaje debajo del campo', () => {
    montar({ error: MENSAJE });
    expect(mensaje().exists()).toBe(true);
    expect(mensaje().text()).toBe(MENSAJE);
  });

  it('marca el campo en error: aria-invalid y la clase de error de Vuetify, que pinta el borde en coral', () => {
    montar({ error: MENSAJE });
    expect(campo().attributes('aria-invalid')).toBe('true');
    expect(wrapper.classes()).toContain('error--text');
  });

  it('sin error no hay mensaje, ni aria-invalid, ni aria-describedby', () => {
    montar();
    expect(mensaje().exists()).toBe(false);
    expect(campo().attributes('aria-invalid')).toBeUndefined();
    expect(campo().attributes('aria-describedby')).toBeUndefined();
    expect(wrapper.classes()).not.toContain('error--text');
  });

  it('el mensaje lleva un ícono decorativo además del color: el error no depende solo del color', () => {
    montar({ error: MENSAJE });
    const icono = wrapper.find('.v-messages .v-icon');
    expect(icono.exists()).toBe(true);
    expect(icono.classes()).toContain('mdi');
    expect(icono.attributes('aria-hidden')).toBe('true');
    expect(icono.classes()).toContain('error--text');
  });

  it('el campo se describe con el mensaje: aria-describedby apunta a él', () => {
    montar({ error: MENSAJE });
    const id = campo().attributes('aria-describedby');
    expect(id).toBeTruthy();
    expect(wrapper.find(`#${id}`).text()).toBe(MENSAJE);
  });

  it('cuando el error se va, se van el mensaje y las marcas', async () => {
    montar({ error: MENSAJE });
    await wrapper.setProps({ error: '' });
    expect(wrapper.find('.v-messages__message').exists()).toBe(false);
    expect(campo().attributes('aria-invalid')).toBeUndefined();
    expect(campo().attributes('aria-describedby')).toBeUndefined();
  });

  it('dos campos con error no comparten el id del mensaje', () => {
    montar({ error: MENSAJE });
    const primero = campo().attributes('aria-describedby');
    const otro = mount(CampoPrecioAplicado, {
      vuetify,
      attachTo: contenedor.appendChild(document.createElement('div')),
      propsData: { value: '3.50', nombre: 'Pan de caja', error: MENSAJE },
    });
    const segundo = otro.find('input').attributes('aria-describedby');
    otro.destroy();
    expect(segundo).toBeTruthy();
    expect(segundo).not.toBe(primero);
  });
});

describe('al salir del campo o con Enter', () => {
  it('con un texto válido muestra el valor con 2 decimales: «22» pasa a «22.00»', async () => {
    montar();
    await enfocar();
    await escribir('22');
    // Quien usa el campo ya validó «22» y le manda el valor con 2 decimales.
    await wrapper.setProps({ value: '22.00' });
    expect(textoDelCampo()).toBe('22');
    await salir();
    expect(textoDelCampo()).toBe('22.00');
  });

  it('con Enter hace lo mismo y el campo conserva el foco', async () => {
    montar();
    await enfocar();
    await escribir('22.5');
    await wrapper.setProps({ value: '22.50' });
    await campo().trigger('keydown.enter');
    await wrapper.vm.$nextTick();
    expect(textoDelCampo()).toBe('22.50');
    expect(tienePuestoElFoco()).toBe(true);
  });

  it('con un texto inválido deja lo escrito con su error', async () => {
    montar();
    await enfocar();
    await escribir('-1');
    await wrapper.setProps({ error: MENSAJE });
    await salir();
    expect(textoDelCampo()).toBe('-1');
    expect(mensaje().text()).toBe(MENSAJE);
  });

  it('con Enter y un texto inválido no cambia nada', async () => {
    montar();
    await enfocar();
    await escribir('abc');
    await wrapper.setProps({ error: MENSAJE });
    await campo().trigger('keydown.enter');
    await wrapper.vm.$nextTick();
    expect(textoDelCampo()).toBe('abc');
    expect(mensaje().text()).toBe(MENSAJE);
  });

  it('salir no emite input: el valor válido ya lo tiene quien usa el campo', async () => {
    montar();
    await enfocar();
    await escribir('22');
    await wrapper.setProps({ value: '22.00' });
    await salir();
    expect(emitidos()).toEqual(['22']);
  });

  it('un texto con espacios, « 22.5 », pasa a «22.50» al salir', async () => {
    montar();
    await enfocar();
    await escribir(' 22.5 ');
    await wrapper.setProps({ value: '22.50' });
    await salir();
    expect(textoDelCampo()).toBe('22.50');
  });

  it('si el valor válido no cambió (escribió «25» y ya valía 25.00), al salir muestra 25.00', async () => {
    montar();
    await enfocar();
    await escribir('25');
    await salir();
    expect(textoDelCampo()).toBe('25.00');
  });

  it('corregir un texto inválido quita el error, y al salir muestra el valor válido', async () => {
    montar();
    await enfocar();
    await escribir('abc');
    await wrapper.setProps({ error: MENSAJE });
    await escribir('21.5');
    await wrapper.setProps({ error: '', value: '21.50' });
    expect(mensaje().exists()).toBe(false);
    await salir();
    expect(textoDelCampo()).toBe('21.50');
  });
});

describe('cuando value cambia desde afuera', () => {
  it('sin el foco, el campo muestra el valor nuevo', async () => {
    montar();
    await wrapper.setProps({ value: '19.90' });
    expect(textoDelCampo()).toBe('19.90');
  });

  it('con el foco no pisa lo que está escribiendo el cajero: «22.5» no se interrumpe con «22.50»', async () => {
    montar();
    await enfocar();
    await escribir('22.');
    await wrapper.setProps({ value: '22.00' });
    expect(textoDelCampo()).toBe('22.');
    await escribir('22.5');
    await wrapper.setProps({ value: '22.50' });
    expect(textoDelCampo()).toBe('22.5');
  });

  it('cuando pierde el foco muestra el valor que le llegó, aunque haya cambiado por otro lado', async () => {
    montar();
    await enfocar();
    await escribir('22');
    await wrapper.setProps({ value: '18.00' });
    await salir();
    expect(textoDelCampo()).toBe('18.00');
  });
});

describe('disabled', () => {
  it('con disabled no se puede editar: el campo está deshabilitado y no emite nada', async () => {
    montar({ disabled: true });
    expect(campo().attributes('disabled')).toBeDefined();
    await escribir('22');
    expect(wrapper.emitted('input')).toBeUndefined();
  });

  it('sin disabled se puede editar, y vuelve a poder cuando termina el envío', async () => {
    montar({ disabled: true });
    await wrapper.setProps({ disabled: false });
    expect(campo().attributes('disabled')).toBeUndefined();
    await escribir('22');
    expect(emitidos()).toEqual(['22']);
  });

  // Chrome no avisa con blur cuando un campo con el foco se deshabilita (por ejemplo, al empezar V-08 a registrar la
  // venta): el campo no debe quedarse «enfocado» y dejar de mostrar el valor que le llegue.
  it('si se deshabilita mientras tiene el foco, sale del campo: muestra el valor válido y acepta el que le llegue después', async () => {
    montar();
    await enfocar();
    await escribir('22');
    await wrapper.setProps({ value: '22.00' });
    await wrapper.setProps({ disabled: true });
    expect(textoDelCampo()).toBe('22.00');
    await wrapper.setProps({ value: '18.00' });
    expect(textoDelCampo()).toBe('18.00');
  });

  it('deshabilitado sigue mostrando el precio aplicado y el error, si lo tiene', () => {
    montar({ disabled: true, error: MENSAJE, value: '22.00' });
    expect(textoDelCampo()).toBe('22.00');
    expect(mensaje().text()).toBe(MENSAJE);
  });
});

// jsdom no calcula estilos: como hacen VentaActual.test.js y tema.test.js, se revisa el texto de los estilos del componente.
function estilosDe(archivo) {
  const fuente = readFileSync(
    resolve(import.meta.dirname, '../../src/components', archivo),
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
  return { css, declara };
}

describe('estilos del campo (skill impeccable: cifras tabulares, zona táctil y alineación)', () => {
  const { css, declara } = estilosDe('CampoPrecioAplicado.vue');

  it('el precio aplicado se escribe en cifras del mismo ancho y alineado a la derecha, para que los decimales queden en columna', () => {
    expect(declara('input', 'font-variant-numeric', 'tabular-nums')).toBe(true);
    expect(declara('input', 'text-align', 'right')).toBe(true);
  });

  // #85: la franja de abajo (el total y «Registrar venta») es sticky y la barra de arriba es fija: el navegador lleva el campo
  // con foco de teclado al borde de la ventana sin contarlas y lo dejaba tapado. El margen debe cubrir la franja (unos 149 px).
  it('el campo con foco de teclado no queda tapado por la franja de abajo ni por la barra de arriba: scroll-margin (#85)', () => {
    expect(declara('input', 'scroll-margin-bottom', '10rem')).toBe(true);
    expect(declara('input', 'scroll-margin-top', '4rem')).toBe(true);
  });

  it('el campo mide al menos 44 px de alto: se usa con el dedo', () => {
    expect(declara('.v-input__slot', 'min-height', '2.75rem')).toBe(true);
  });

  it('el campo mide 7.5 rem y la raíz ocupa el ancho de su celda, para que el mensaje de error use ese ancho', () => {
    expect(declara('.v-input__slot', 'width', '7.5rem')).toBe(true);
    expect(declara('.campo-precio-aplicado', 'width', '100%')).toBe(true);
  });

  it('en la tabla ancha (celda text-end) el campo y su mensaje quedan a la derecha, bajo su encabezado', () => {
    expect(declara('td.text-end .campo-precio-aplicado ', 'margin-left', 'auto')).toBe(true);
    expect(
      declara('td.text-end .campo-precio-aplicado__mensaje', 'justify-content', 'flex-end'),
    ).toBe(true);
  });

  it('los colores salen de las variables del tema, sin hexadecimales', () => {
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  it('sin animaciones ni transiciones propias', () => {
    expect(css).not.toMatch(/@keyframes|animation\s*:|transition\s*:/);
  });
});

describe('estilos de la fila de VentaActual que dependen del campo (alineación)', () => {
  const { declara } = estilosDe('VentaActual.vue');

  it('las celdas de una fila apilada se alinean arriba: si el mensaje de error crece hacia abajo, las demás no se mueven', () => {
    expect(declara('.v-data-table__mobile-table-row', 'align-items', 'flex-start')).toBe(true);
  });

  it('la cantidad y el subtotal miden 44 px como los campos, con el texto centrado: sus cifras quedan a la altura de las del precio aplicado', () => {
    for (const clase of ['.detalle__cantidad', '.detalle__subtotal']) {
      expect(declara(clase, 'min-height', '2.75rem')).toBe(true);
      expect(declara(clase, 'align-items', 'center')).toBe(true);
    }
  });
});
