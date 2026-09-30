// Spec crear-producto, "P-03 > El formulario" y criterios 1, 3, 5, 6, 7 y 8 de P-03: el modal con sus tres campos, los
// errores junto a cada campo, un solo envío a la vez y "Cancelar". La API se sustituye: no se llama a nadie.
// La prueba maneja el DOM como el cajero: busca los campos por su etiqueta y los botones por su texto.
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

vi.mock('../../src/api/productos.js', () => ({ crearProducto: vi.fn() }));

import { crearProducto } from '../../src/api/productos.js';
import vuetify from '../../src/plugins/vuetify.js';
import FormularioProducto from '../../src/components/FormularioProducto.vue';

const esperar = () => new Promise((resolve) => setTimeout(resolve, 0));

let wrapper;
let contenedor;
let consola;

beforeEach(() => {
  // El v-dialog manda su contenido a [data-app], como en la pantalla real.
  contenedor = document.createElement('div');
  contenedor.setAttribute('data-app', 'true');
  document.body.appendChild(contenedor);
  consola = [vi.spyOn(console, 'error'), vi.spyOn(console, 'warn')];
  consola.forEach((espia) => espia.mockImplementation(() => {}));
  crearProducto.mockReset();
});

afterEach(() => {
  wrapper?.destroy();
  wrapper = null;
  contenedor.remove();
  document.documentElement.classList.remove('overflow-y-hidden');
  // Ni Vue ni Vuetify avisan de nada: sin errores de propiedades, de llaves ni de componentes.
  const avisos = consola.flatMap((espia) => espia.mock.calls.map((llamada) => llamada.join(' ')));
  consola.forEach((espia) => espia.mockRestore());
  expect(avisos).toEqual([]);
});

function montar(propsData = { value: true }) {
  const lugar = contenedor.appendChild(document.createElement('div'));
  wrapper = mount(FormularioProducto, { vuetify, propsData, attachTo: lugar });
  return esperar();
}

const dialogo = () => document.querySelector('[role="dialog"]');
const etiquetaDe = (texto) =>
  [...dialogo().querySelectorAll('label')].find(
    (etiqueta) => etiqueta.textContent.trim() === texto,
  );
const entrada = (texto) => document.getElementById(etiquetaDe(texto).htmlFor);
const raizDe = (texto) => entrada(texto).closest('.v-input');
const mensajesDe = (texto) =>
  [...raizDe(texto).querySelectorAll('.v-messages__message')].map((m) => m.textContent.trim());
const boton = (texto) =>
  [...dialogo().querySelectorAll('button')].find((b) => b.textContent.includes(texto));
// Los mensajes de error de cada campo también llevan role="alert" en Vuetify: la franja es el v-alert.
const franja = () => dialogo().querySelector('.v-alert[role="alert"]');

async function escribir(texto, valor) {
  const campo = entrada(texto);
  campo.value = valor;
  campo.dispatchEvent(new Event('input', { bubbles: true }));
  await esperar();
}

async function llenarUnProductoValido() {
  await escribir('Nombre', 'Leche entera 1 L');
  await escribir('Precio', '25.50');
  await escribir('Código de barras', '7501055300075');
}

async function presionarGuardar() {
  boton('Guardar').click();
  await esperar();
}

const errorDeLaApi = ({ status, codigo, mensaje, detalles = [] }) =>
  Object.assign(new Error(mensaje), { status, codigo, mensaje, detalles });

describe('el modal', () => {
  it('tiene el título "Nuevo producto", enlazado al diálogo con aria-labelledby', async () => {
    await montar();
    const titulo = document.getElementById(dialogo().getAttribute('aria-labelledby'));
    expect(titulo).not.toBeNull();
    expect(titulo.textContent.trim()).toBe('Nuevo producto');
    expect(titulo.tagName).toBe('H2');
  });

  it('tiene tres campos con etiqueta visible, en este orden: Nombre, Precio y Código de barras', async () => {
    await montar();
    const etiquetas = [...dialogo().querySelectorAll('label')].map((e) => e.textContent.trim());
    expect(etiquetas).toEqual(['Nombre', 'Precio', 'Código de barras']);
    for (const etiqueta of etiquetas) expect(entrada(etiqueta).tagName).toBe('INPUT');
  });

  it('el foco entra al campo Nombre al abrir, y otra vez cada vez que se vuelve a abrir', async () => {
    await montar();
    expect(document.activeElement).toBe(entrada('Nombre'));
    await wrapper.setProps({ value: false });
    await esperar();
    await wrapper.setProps({ value: true });
    await esperar();
    expect(document.activeElement).toBe(entrada('Nombre'));
  });

  it('el precio es un campo de texto con inputmode decimal y su ayuda, sin símbolo de moneda', async () => {
    await montar();
    const precio = entrada('Precio');
    expect(precio.getAttribute('type')).toBe('text');
    expect(precio.getAttribute('inputmode')).toBe('decimal');
    expect(mensajesDe('Precio')).toEqual(['Con punto decimal, por ejemplo 25.50']);
    expect(raizDe('Precio').querySelector('.v-text-field__prefix')).toBeNull();
    expect(dialogo().textContent).not.toMatch(/[$€£]/);
  });

  it('muestra los contadores de 120 y 50 caracteres, pero ningún campo usa maxlength', async () => {
    await montar();
    const contador = (texto) => raizDe(texto).querySelector('.v-counter').textContent.trim();
    expect(contador('Nombre')).toBe('0 / 120');
    expect(contador('Código de barras')).toBe('0 / 50');
    for (const texto of ['Nombre', 'Precio', 'Código de barras']) {
      expect(entrada(texto).hasAttribute('maxlength'), texto).toBe(false);
    }
  });

  it('al abrir nada está marcado: sin errores junto a los campos ni franja de error', async () => {
    await montar();
    expect(mensajesDe('Nombre')).toEqual([]);
    expect(mensajesDe('Código de barras')).toEqual([]);
    expect(dialogo().querySelector('.error--text')).toBeNull();
    expect(franja()).toBeNull();
  });

  it('tiene "Cancelar", un botón de texto, a la izquierda de "Guardar", el botón principal', async () => {
    await montar();
    const botones = [...dialogo().querySelectorAll('button')];
    expect(botones.slice(-2).map((b) => b.textContent.trim())).toEqual(['Cancelar', 'Guardar']);
    expect(boton('Cancelar').classList.contains('v-btn--text')).toBe(true);
    expect(boton('Guardar').classList.contains('primary')).toBe(true);
    expect(boton('Guardar').getAttribute('type')).toBe('submit');
  });

  it('en una pantalla ancha mide 480 px como máximo, y en un teléfono ocupa toda la pantalla', async () => {
    await montar();
    expect(document.querySelector('.v-dialog').style.maxWidth).toBe('480px');
    expect(document.querySelector('.v-dialog--fullscreen')).toBeNull();
    wrapper.destroy();

    const anchoOriginal = window.innerWidth;
    window.innerWidth = 400;
    vuetify.framework.breakpoint.update();
    try {
      await montar();
      expect(document.querySelector('.v-dialog--fullscreen')).not.toBeNull();
    } finally {
      window.innerWidth = anchoOriginal;
      vuetify.framework.breakpoint.update();
    }
  });
});

describe('lo que el cajero escribe se revisa antes de llamar a la API', () => {
  it('criterio 1: con el formulario vacío, "Guardar" marca los tres campos y no llama a la API', async () => {
    await montar();
    await presionarGuardar();
    expect(mensajesDe('Nombre')).toEqual(['Es obligatorio.']);
    expect(mensajesDe('Precio')).toEqual(['Es obligatorio.']);
    expect(mensajesDe('Código de barras')).toEqual(['Es obligatorio.']);
    expect(crearProducto).not.toHaveBeenCalled();
  });

  it('con un campo con error, el foco va al primero, y su mensaje se sigue viendo con el foco puesto', async () => {
    await montar();
    await presionarGuardar();
    expect(document.activeElement).toBe(entrada('Nombre'));
    expect(mensajesDe('Nombre')).toEqual(['Es obligatorio.']);

    await escribir('Nombre', 'Pan');
    await escribir('Precio', '10.999');
    await escribir('Código de barras', '123');
    await presionarGuardar();
    expect(document.activeElement).toBe(entrada('Precio'));
    expect(mensajesDe('Precio')).toEqual(['No puede tener más de 2 decimales.']);
  });

  it.each([
    ['-5', 'Debe ser un número con punto decimal, por ejemplo 25.50.'],
    ['abc', 'Debe ser un número con punto decimal, por ejemplo 25.50.'],
    ['10.999', 'No puede tener más de 2 decimales.'],
    ['100000', 'No puede ser mayor que 99999.99.'],
    ['0', 'Debe ser mayor que 0.'],
    [' 25', 'Debe ser un número con punto decimal, por ejemplo 25.50.'],
  ])(
    'criterio 2: el precio "%s" se marca con su motivo y no llama a la API',
    async (precio, mensaje) => {
      await montar();
      await escribir('Nombre', 'Pan');
      await escribir('Precio', precio);
      await escribir('Código de barras', '123');
      await presionarGuardar();
      expect(mensajesDe('Precio')).toEqual([mensaje]);
      expect(mensajesDe('Nombre')).toEqual([]);
      expect(crearProducto).not.toHaveBeenCalled();
    },
  );

  it('un nombre de 121 caracteres o un código de barras de 51 se marcan, y uno de 120 y 50 no', async () => {
    await montar();
    await escribir('Nombre', 'a'.repeat(121));
    await escribir('Precio', '5');
    await escribir('Código de barras', '1'.repeat(51));
    expect(raizDe('Nombre').querySelector('.v-counter').textContent.trim()).toBe('121 / 120');
    await presionarGuardar();
    expect(mensajesDe('Nombre')).toEqual(['No puede pasar de 120 caracteres.']);
    expect(mensajesDe('Código de barras')).toEqual(['No puede pasar de 50 caracteres.']);
    expect(crearProducto).not.toHaveBeenCalled();

    await escribir('Nombre', 'a'.repeat(120));
    await escribir('Código de barras', '1'.repeat(50));
    crearProducto.mockResolvedValue({ id: 1 });
    await presionarGuardar();
    expect(crearProducto).toHaveBeenCalledTimes(1);
  });

  it('los campos no se marcan antes de "Guardar" ni mientras se escribe, sino al salir de ellos', async () => {
    await montar();
    await escribir('Precio', '10.');
    expect(mensajesDe('Precio')).toEqual(['Con punto decimal, por ejemplo 25.50']);

    entrada('Nombre').focus();
    entrada('Nombre').blur();
    await esperar();
    expect(mensajesDe('Nombre')).toEqual(['Es obligatorio.']);
    expect(mensajesDe('Código de barras')).toEqual([]);
  });

  it('manda los textos sin espacios en los extremos y el precio tal como se escribió', async () => {
    crearProducto.mockResolvedValue({ id: 1 });
    await montar();
    await escribir('Nombre', '  Leche  ');
    await escribir('Precio', '25.5');
    await escribir('Código de barras', ' 0012345 ');
    await presionarGuardar();
    expect(crearProducto).toHaveBeenCalledWith({
      nombre: 'Leche',
      precio: '25.5',
      codigoBarras: '0012345',
    });
  });

  it('enviar el formulario, que es lo que hace Enter en cualquier campo, también guarda', async () => {
    crearProducto.mockResolvedValue({ id: 1 });
    await montar();
    await llenarUnProductoValido();
    dialogo()
      .querySelector('form')
      .dispatchEvent(new Event('submit', { cancelable: true }));
    await esperar();
    expect(crearProducto).toHaveBeenCalledTimes(1);
  });
});

describe('mientras se guarda', () => {
  it('"Guardar" y "Cancelar" quedan deshabilitados y "Guardar" muestra el indicador de carga', async () => {
    let terminar;
    crearProducto.mockReturnValue(new Promise((resolver) => (terminar = resolver)));
    await montar();
    await llenarUnProductoValido();
    expect(boton('Guardar').disabled).toBe(false);
    await presionarGuardar();
    expect(boton('Guardar').disabled).toBe(true);
    expect(boton('Guardar').classList.contains('v-btn--loading')).toBe(true);
    expect(boton('Cancelar').disabled).toBe(true);
    terminar({ id: 1 });
    await esperar();
  });

  it('criterio 6: un doble clic en "Guardar" manda una sola petición, aun antes de volver a pintar el botón', async () => {
    crearProducto.mockReturnValue(new Promise(() => {}));
    await montar();
    await llenarUnProductoValido();
    const guardar = boton('Guardar');
    guardar.click();
    guardar.click();
    await esperar();
    expect(crearProducto).toHaveBeenCalledTimes(1);
  });

  it('un doble Enter tampoco manda dos peticiones', async () => {
    crearProducto.mockReturnValue(new Promise(() => {}));
    await montar();
    await llenarUnProductoValido();
    const formulario = dialogo().querySelector('form');
    formulario.dispatchEvent(new Event('submit', { cancelable: true }));
    formulario.dispatchEvent(new Event('submit', { cancelable: true }));
    await esperar();
    expect(crearProducto).toHaveBeenCalledTimes(1);
  });
});

describe('lo que la API o la red contesten no borra lo escrito', () => {
  async function guardarConError(error) {
    crearProducto.mockRejectedValue(error);
    await montar();
    await llenarUnProductoValido();
    await presionarGuardar();
  }

  function loEscritoSigueAhi() {
    expect(entrada('Nombre').value).toBe('Leche entera 1 L');
    expect(entrada('Precio').value).toBe('25.50');
    expect(entrada('Código de barras').value).toBe('7501055300075');
    expect(boton('Guardar').disabled).toBe(false);
    expect(boton('Cancelar').disabled).toBe(false);
    expect(wrapper.emitted('creado')).toBeUndefined();
    expect(wrapper.emitted('input')).toBeUndefined();
  }

  it('criterio 3: un 409 muestra "Ya existe un producto con ese código de barras" junto al campo, con el foco ahí', async () => {
    await guardarConError(
      errorDeLaApi({
        status: 409,
        codigo: 'CODIGO_BARRAS_DUPLICADO',
        mensaje: 'Ya existe un producto con ese código de barras.',
        detalles: [
          { campo: 'codigoBarras', mensaje: 'Ya existe un producto con ese código de barras.' },
        ],
      }),
    );
    expect(mensajesDe('Código de barras')).toEqual([
      'Ya existe un producto con ese código de barras.',
    ]);
    expect(mensajesDe('Nombre')).toEqual([]);
    expect(document.activeElement).toBe(entrada('Código de barras'));
    expect(franja()).toBeNull();
    loEscritoSigueAhi();
  });

  it('criterio 5: sin respuesta muestra la franja de error de red, y "Guardar" vuelve a estar habilitado', async () => {
    await guardarConError(
      errorDeLaApi({
        status: 0,
        codigo: 'SIN_CONEXION',
        mensaje: 'No se pudo conectar con el servidor. Intenta de nuevo.',
      }),
    );
    expect(franja().textContent.trim()).toContain(
      'No se pudo conectar con el servidor. Intenta de nuevo.',
    );
    expect(document.activeElement).toBe(boton('Guardar'));
    loEscritoSigueAhi();
  });

  it('un 500 muestra en la franja el mensaje de la API', async () => {
    await guardarConError(
      errorDeLaApi({
        status: 500,
        codigo: 'ERROR_INTERNO',
        mensaje: 'Ocurrió un error inesperado. Intenta de nuevo.',
      }),
    );
    expect(franja().textContent.trim()).toContain('Ocurrió un error inesperado. Intenta de nuevo.');
    loEscritoSigueAhi();
  });

  it('la franja es un v-alert con role="alert" y un ícono; el texto lo pinta el tema, no lleva HTML de la API', async () => {
    await guardarConError(
      errorDeLaApi({ status: 500, codigo: 'ERROR_INTERNO', mensaje: '<b>hola</b>' }),
    );
    expect(franja().classList.contains('v-alert')).toBe(true);
    expect(franja().querySelector('.v-icon')).not.toBeNull();
    expect(franja().querySelector('b')).toBeNull();
  });

  it('criterio 7: un 400 con un mensaje para el precio lo muestra junto a "Precio" y desaparece cuando el cajero lo edita', async () => {
    await guardarConError(
      errorDeLaApi({
        status: 400,
        codigo: 'DATOS_INVALIDOS',
        mensaje: 'Los datos del producto no son válidos. Revisa los campos marcados.',
        detalles: [
          { campo: 'precio', mensaje: 'No puede tener más de 2 decimales.' },
          { campo: 'nombre', mensaje: 'Es obligatorio.' },
        ],
      }),
    );
    expect(mensajesDe('Precio')).toEqual(['No puede tener más de 2 decimales.']);
    expect(mensajesDe('Nombre')).toEqual(['Es obligatorio.']);
    expect(document.activeElement).toBe(entrada('Nombre'));
    expect(franja()).toBeNull();

    await escribir('Precio', '25.5');
    expect(mensajesDe('Precio')).toEqual(['Con punto decimal, por ejemplo 25.50']);
    expect(mensajesDe('Nombre')).toEqual(['Es obligatorio.']);
  });

  it('criterio 7: el mensaje de un 400 se queda a la vista si el cajero sale del campo sin editarlo (#66)', async () => {
    await guardarConError(
      errorDeLaApi({
        status: 400,
        codigo: 'DATOS_INVALIDOS',
        mensaje: 'Los datos del producto no son válidos. Revisa los campos marcados.',
        detalles: [{ campo: 'precio', mensaje: 'No puede ser mayor que 99999.99.' }],
      }),
    );
    entrada('Precio').focus();
    entrada('Precio').blur();
    await esperar();
    expect(mensajesDe('Precio')).toEqual(['No puede ser mayor que 99999.99.']);
    expect(entrada('Precio').getAttribute('aria-invalid')).toBe('true');
    await escribir('Precio', '25.5');
    expect(mensajesDe('Precio')).toEqual(['Con punto decimal, por ejemplo 25.50']);
    expect(entrada('Precio').getAttribute('aria-invalid')).toBeNull();
  });

  it('criterio 3: el mensaje del 409 se queda a la vista, con el campo marcado, si el cajero sale del código de barras sin editarlo (#66)', async () => {
    await guardarConError(
      errorDeLaApi({
        status: 409,
        codigo: 'CODIGO_BARRAS_DUPLICADO',
        mensaje: 'Ya existe un producto con ese código de barras.',
      }),
    );
    entrada('Código de barras').blur();
    await esperar();
    expect(mensajesDe('Código de barras')).toEqual([
      'Ya existe un producto con ese código de barras.',
    ]);
    expect(entrada('Código de barras').getAttribute('aria-invalid')).toBe('true');
    await escribir('Código de barras', '7501055300076');
    expect(mensajesDe('Código de barras')).toEqual([]);
    expect(entrada('Código de barras').getAttribute('aria-invalid')).toBeNull();
  });

  it('un campo que la pantalla no conoce se muestra en la franja de error del modal', async () => {
    await guardarConError(
      errorDeLaApi({
        status: 400,
        codigo: 'DATOS_INVALIDOS',
        mensaje: 'x',
        detalles: [{ campo: 'descuento', mensaje: 'No puede ser negativo.' }],
      }),
    );
    expect(franja().textContent).toContain('No puede ser negativo.');
  });

  it('al reintentar, la franja anterior se quita mientras se guarda, y el reintento crea el producto', async () => {
    crearProducto.mockRejectedValueOnce(
      errorDeLaApi({ status: 0, codigo: 'SIN_CONEXION', mensaje: 'No se pudo conectar.' }),
    );
    await montar();
    await llenarUnProductoValido();
    await presionarGuardar();
    expect(franja()).not.toBeNull();

    let terminar;
    crearProducto.mockReturnValueOnce(new Promise((resolver) => (terminar = resolver)));
    await presionarGuardar();
    expect(franja()).toBeNull();
    terminar({ id: 3, nombre: 'Leche entera 1 L', precio: '25.50', codigoBarras: '7501055300075' });
    await esperar();
    expect(crearProducto).toHaveBeenCalledTimes(2);
    expect(wrapper.emitted('creado')).toHaveLength(1);
  });
});

describe('al crear el producto', () => {
  const creado = {
    id: 7,
    nombre: 'Leche entera 1 L',
    precio: '25.50',
    codigoBarras: '7501055300075',
  };

  it('cierra el modal, vacía el formulario y avisa con "creado" y el producto que devolvió la API', async () => {
    crearProducto.mockResolvedValue(creado);
    await montar();
    await llenarUnProductoValido();
    await presionarGuardar();
    expect(wrapper.emitted('creado')).toEqual([[creado]]);
    expect(wrapper.emitted('input').at(-1)).toEqual([false]);
    expect(entrada('Nombre').value).toBe('');
    expect(entrada('Precio').value).toBe('');
    expect(entrada('Código de barras').value).toBe('');
  });

  it('al volver a abrirlo, el formulario está vacío y sin errores', async () => {
    crearProducto.mockResolvedValue(creado);
    await montar();
    await llenarUnProductoValido();
    await presionarGuardar();
    await wrapper.setProps({ value: false });
    await esperar();
    await wrapper.setProps({ value: true });
    await esperar();
    expect(entrada('Nombre').value).toBe('');
    expect(mensajesDe('Nombre')).toEqual([]);
    expect(franja()).toBeNull();
    expect(boton('Guardar').disabled).toBe(false);
    expect(document.activeElement).toBe(entrada('Nombre'));
  });
});

describe('"Cancelar" y el cierre del modal', () => {
  it('criterio 8: "Cancelar" cierra el modal sin llamar a la API, y al abrirlo otra vez está vacío', async () => {
    await montar();
    await escribir('Nombre', 'Pan');
    await escribir('Precio', '10.999');
    await presionarGuardar();
    expect(mensajesDe('Precio')).toEqual(['No puede tener más de 2 decimales.']);

    boton('Cancelar').click();
    await esperar();
    expect(wrapper.emitted('input').at(-1)).toEqual([false]);
    expect(crearProducto).not.toHaveBeenCalled();
    expect(wrapper.emitted('creado')).toBeUndefined();

    await wrapper.setProps({ value: false });
    await esperar();
    await wrapper.setProps({ value: true });
    await esperar();
    expect(entrada('Nombre').value).toBe('');
    expect(entrada('Precio').value).toBe('');
    expect(mensajesDe('Precio')).toEqual(['Con punto decimal, por ejemplo 25.50']);
  });

  it('con el formulario vacío, la tecla Esc cierra el modal', async () => {
    await montar();
    dialogo().dispatchEvent(new KeyboardEvent('keydown', { keyCode: 27, bubbles: true }));
    await esperar();
    expect(wrapper.emitted('input')).toEqual([[false]]);
  });

  it('con texto escrito, Esc y un clic fuera no lo cierran: lo escrito no se pierde por un descuido', async () => {
    await montar();
    await escribir('Nombre', 'Pan');
    dialogo().dispatchEvent(new KeyboardEvent('keydown', { keyCode: 27, bubbles: true }));
    await esperar();
    expect(wrapper.emitted('input')).toBeUndefined();
    expect(wrapper.findComponent({ name: 'v-dialog' }).props('persistent')).toBe(true);
    expect(entrada('Nombre').value).toBe('Pan');
  });

  it('el modal es persistente con texto escrito o guardando, y no lo es con el formulario vacío', async () => {
    let terminar;
    crearProducto.mockReturnValue(new Promise((resolver) => (terminar = resolver)));
    await montar();
    const dialogoVuetify = () => wrapper.findComponent({ name: 'v-dialog' });
    expect(dialogoVuetify().props('persistent')).toBe(false);

    await escribir('Nombre', 'Pan');
    expect(dialogoVuetify().props('persistent')).toBe(true);
    await escribir('Nombre', '');
    expect(dialogoVuetify().props('persistent')).toBe(false);

    await llenarUnProductoValido();
    await presionarGuardar();
    expect(dialogoVuetify().props('persistent')).toBe(true);
    terminar({ id: 1 });
    await esperar();
  });
});

// Vuetify 2 devuelve el foco al modal solo cuando cae en un elemento de fuera, y un Tab desde el último botón cae
// primero en el navegador o en el cuerpo de la página. El modal da la vuelta por sí mismo, como pide la guía de ARIA.
describe('el foco da la vuelta dentro del modal', () => {
  const tabulador = (elemento, opciones = {}) => {
    const evento = new KeyboardEvent('keydown', {
      key: 'Tab',
      keyCode: 9,
      bubbles: true,
      cancelable: true,
      ...opciones,
    });
    elemento.dispatchEvent(evento);
    return evento;
  };

  it('Tab desde "Guardar", el último elemento, lleva el foco a "Nombre"', async () => {
    await montar();
    boton('Guardar').focus();
    const evento = tabulador(boton('Guardar'));
    expect(evento.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(entrada('Nombre'));
  });

  it('Shift+Tab desde "Nombre", el primero, lleva el foco a "Guardar"', async () => {
    await montar();
    entrada('Nombre').focus();
    const evento = tabulador(entrada('Nombre'), { shiftKey: true });
    expect(evento.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(boton('Guardar'));
  });

  it('Tab en un elemento del medio sigue su camino normal', async () => {
    await montar();
    entrada('Precio').focus();
    expect(tabulador(entrada('Precio')).defaultPrevented).toBe(false);
    expect(tabulador(entrada('Precio'), { shiftKey: true }).defaultPrevented).toBe(false);
    expect(tabulador(boton('Guardar'), { shiftKey: true }).defaultPrevented).toBe(false);
  });

  it('guardando, con los dos botones deshabilitados, da la vuelta entre los campos', async () => {
    crearProducto.mockReturnValue(new Promise(() => {}));
    await montar();
    await llenarUnProductoValido();
    await presionarGuardar();
    expect(boton('Guardar').disabled).toBe(true);
    entrada('Código de barras').focus();
    const evento = tabulador(entrada('Código de barras'));
    expect(evento.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(entrada('Nombre'));
  });
});

// Un lector de pantalla dice "no válido" de un campo solo si lo marca aria-invalid. El mensaje de Vuetify (role="alert")
// se anuncia cuando aparece, pero no queda atado al campo.
describe('los campos con error se marcan con aria-invalid', () => {
  const invalido = (etiqueta) => entrada(etiqueta).getAttribute('aria-invalid');

  it('ningún campo está marcado al abrir', async () => {
    await montar();
    for (const etiqueta of ['Nombre', 'Precio', 'Código de barras'])
      expect(invalido(etiqueta)).toBeNull();
  });

  it('"Guardar" con el formulario vacío marca los tres campos, y editar uno le quita la marca', async () => {
    await montar();
    await presionarGuardar();
    for (const etiqueta of ['Nombre', 'Precio', 'Código de barras'])
      expect(invalido(etiqueta)).toBe('true');
    await escribir('Precio', '25.50');
    expect(invalido('Precio')).toBeNull();
    expect(invalido('Nombre')).toBe('true');
  });

  it('salir de un campo vacío lo marca, igual que el mensaje que se ve', async () => {
    await montar();
    entrada('Nombre').focus();
    entrada('Nombre').blur();
    await esperar();
    expect(mensajesDe('Nombre')).toEqual(['Es obligatorio.']);
    expect(invalido('Nombre')).toBe('true');
    expect(invalido('Precio')).toBeNull();
  });

  it('el mensaje de un campo al que se salió sin llenar se queda a la vista al volver a enfocarlo, hasta que se edite', async () => {
    await montar();
    entrada('Nombre').focus();
    entrada('Nombre').blur();
    await esperar();
    entrada('Nombre').focus();
    await esperar();
    expect(mensajesDe('Nombre')).toEqual(['Es obligatorio.']);
    expect(invalido('Nombre')).toBe('true');
    await escribir('Nombre', 'P');
    expect(mensajesDe('Nombre')).toEqual([]);
    expect(invalido('Nombre')).toBeNull();
  });

  it('un campo que se llenó bien al salir no se marca', async () => {
    await montar();
    await escribir('Precio', '25.50');
    entrada('Precio').blur();
    await esperar();
    expect(mensajesDe('Precio')).toEqual(['Con punto decimal, por ejemplo 25.50']);
    expect(invalido('Precio')).toBeNull();
  });

  it('los tres campos se anuncian como obligatorios con aria-required', async () => {
    await montar();
    for (const etiqueta of ['Nombre', 'Precio', 'Código de barras']) {
      expect(entrada(etiqueta).getAttribute('aria-required'), etiqueta).toBe('true');
    }
  });

  it('el error de la API en el código de barras lo marca', async () => {
    crearProducto.mockRejectedValue(
      errorDeLaApi({ status: 409, codigo: 'CODIGO_BARRAS_DUPLICADO', mensaje: 'x' }),
    );
    await montar();
    await llenarUnProductoValido();
    await presionarGuardar();
    expect(invalido('Código de barras')).toBe('true');
    expect(invalido('Nombre')).toBeNull();
  });
});
