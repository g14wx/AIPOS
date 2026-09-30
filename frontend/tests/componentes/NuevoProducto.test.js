// Spec crear-producto, "P-03 > Al crear el producto" y criterio 4 de P-03: NuevoProducto es el botón "Nuevo producto", el
// formulario en un modal y el aviso "Producto creado" con su animación. lottie-web no dibuja en jsdom: se sustituye.
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
vi.mock('../../src/api/productos.js', () => ({ crearProducto: vi.fn() }));

import { crearProducto } from '../../src/api/productos.js';
import vuetify from '../../src/plugins/vuetify.js';
import productoCreado from '../../src/assets/animaciones/producto-creado.json';
import NuevoProducto from '../../src/components/NuevoProducto.vue';

const esperar = () => new Promise((resolve) => setTimeout(resolve, 0));
const producto = {
  id: 7,
  nombre: 'Leche entera 1 L',
  precio: '25.50',
  codigoBarras: '7501055300075',
};

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

beforeEach(() => {
  contenedor = document.createElement('div');
  contenedor.setAttribute('data-app', 'true');
  document.body.appendChild(contenedor);
  consola = [vi.spyOn(console, 'error'), vi.spyOn(console, 'warn')];
  consola.forEach((espia) => espia.mockImplementation(() => {}));
  loadAnimation.mockClear();
  instancias.length = 0;
  crearProducto.mockReset();
  preferirMenosMovimiento(false);
});

afterEach(() => {
  wrapper?.destroy();
  wrapper = null;
  contenedor.remove();
  document.documentElement.classList.remove('overflow-y-hidden');
  const avisos = consola.flatMap((espia) => espia.mock.calls.map((llamada) => llamada.join(' ')));
  consola.forEach((espia) => espia.mockRestore());
  expect(avisos).toEqual([]);
});

async function montar() {
  const lugar = contenedor.appendChild(document.createElement('div'));
  wrapper = mount(NuevoProducto, { vuetify, attachTo: lugar });
  await esperar();
}

const dialogo = () => document.querySelector('[role="dialog"]');
const botonNuevo = () => wrapper.find('button');
const abierto = () => document.querySelector('.v-dialog--active') !== null;
const aviso = () => document.querySelector('.v-snack');
const avisoVisible = () => document.querySelector('.v-snack--active') !== null;
const boton = (texto) =>
  [...dialogo().querySelectorAll('button')].find((b) => b.textContent.includes(texto));
const entrada = (texto) => {
  const etiqueta = [...dialogo().querySelectorAll('label')].find(
    (e) => e.textContent.trim() === texto,
  );
  return document.getElementById(etiqueta.htmlFor);
};

async function escribir(texto, valor) {
  const campo = entrada(texto);
  campo.value = valor;
  campo.dispatchEvent(new Event('input', { bubbles: true }));
  await esperar();
}

async function abrirLlenarYGuardar() {
  await botonNuevo().trigger('click');
  await esperar();
  await escribir('Nombre', producto.nombre);
  await escribir('Precio', producto.precio);
  await escribir('Código de barras', producto.codigoBarras);
  boton('Guardar').click();
  await esperar();
}

describe('el botón "Nuevo producto"', () => {
  it('está a la vista con su texto, en primary, y con un solo elemento raíz', async () => {
    await montar();
    expect(botonNuevo().text()).toBe('Nuevo producto');
    expect(botonNuevo().classes()).toContain('primary');
    expect(botonNuevo().find('.mdi-plus').exists()).toBe(true);
    expect(wrapper.element.nodeType).toBe(1);
  });

  it('el modal empieza cerrado, y al presionarlo se abre con el foco en "Nombre"', async () => {
    await montar();
    expect(abierto()).toBe(false);
    await botonNuevo().trigger('click');
    await esperar();
    expect(abierto()).toBe(true);
    expect(document.activeElement).toBe(entrada('Nombre'));
  });

  it('el aviso empieza escondido: nadie creó nada todavía', async () => {
    await montar();
    expect(avisoVisible()).toBe(false);
    expect(loadAnimation).not.toHaveBeenCalled();
  });
});

describe('criterio 4: al crear un producto válido', () => {
  it('se cierra el modal y aparece "Producto creado"', async () => {
    crearProducto.mockResolvedValue(producto);
    await montar();
    await abrirLlenarYGuardar();
    expect(crearProducto).toHaveBeenCalledWith({
      nombre: producto.nombre,
      precio: producto.precio,
      codigoBarras: producto.codigoBarras,
    });
    expect(abierto()).toBe(false);
    expect(avisoVisible()).toBe(true);
    expect(aviso().querySelector('.v-snack__content').textContent.trim()).toBe('Producto creado');
  });

  it('el aviso dura 4 segundos y se anuncia a los lectores de pantalla con aria-live="polite"', async () => {
    await montar();
    expect(wrapper.findComponent({ name: 'v-snackbar' }).props('timeout')).toBe(4000);
    const contenido = aviso().querySelector('.v-snack__content');
    expect(contenido.getAttribute('aria-live')).toBe('polite');
    expect(contenido.getAttribute('role')).toBe('status');
  });

  it('lleva una animación corta de éxito: la palomita de producto-creado.json, decorativa y sin repetirse', async () => {
    crearProducto.mockResolvedValue(producto);
    await montar();
    await abrirLlenarYGuardar();
    expect(loadAnimation).toHaveBeenCalledTimes(1);
    const opciones = loadAnimation.mock.calls[0][0];
    expect(opciones.animationData).toEqual(productoCreado);
    expect(opciones.loop).toBe(false);
    expect(opciones.autoplay).toBe(true);
    expect(aviso().contains(opciones.container)).toBe(true);
    expect(opciones.container.getAttribute('aria-hidden')).toBe('true');
    expect(opciones.container.style.height).toBe('32px');
  });

  it('si el sistema pide menos movimiento, la animación no se reproduce y muestra el último cuadro', async () => {
    preferirMenosMovimiento(true);
    crearProducto.mockResolvedValue(producto);
    await montar();
    await abrirLlenarYGuardar();
    const opciones = loadAnimation.mock.calls[0][0];
    expect(opciones.autoplay).toBe(false);
    expect(opciones.loop).toBe(false);
    expect(instancias[0].goToAndStop).toHaveBeenCalledWith(39, true);
  });

  it('si se crea otro producto con el aviso a la vista, el aviso vuelve a empezar con su animación', async () => {
    crearProducto.mockResolvedValue(producto);
    await montar();
    await abrirLlenarYGuardar();
    await abrirLlenarYGuardar();
    expect(avisoVisible()).toBe(true);
    expect(loadAnimation).toHaveBeenCalledTimes(2);
    expect(instancias[0].destroy).toHaveBeenCalledTimes(1);
  });
});

describe('cuando no se crea nada', () => {
  it('"Cancelar" cierra el modal sin llamar a la API ni mostrar el aviso', async () => {
    await montar();
    await botonNuevo().trigger('click');
    await esperar();
    boton('Cancelar').click();
    await esperar();
    expect(abierto()).toBe(false);
    expect(crearProducto).not.toHaveBeenCalled();
    expect(avisoVisible()).toBe(false);
  });

  it('un error de la API deja el modal abierto y sin aviso', async () => {
    crearProducto.mockRejectedValue(
      Object.assign(new Error('x'), {
        status: 500,
        codigo: 'ERROR_INTERNO',
        mensaje: 'x',
        detalles: [],
      }),
    );
    await montar();
    await abrirLlenarYGuardar();
    expect(abierto()).toBe(true);
    expect(avisoVisible()).toBe(false);
  });
});

describe('el foco vuelve al botón "Nuevo producto" al cerrar el modal', () => {
  it('con "Cancelar"', async () => {
    await montar();
    await botonNuevo().trigger('click');
    await esperar();
    boton('Cancelar').click();
    await esperar();
    expect(document.activeElement).toBe(botonNuevo().element);
  });

  it('después de crear el producto', async () => {
    crearProducto.mockResolvedValue(producto);
    await montar();
    await abrirLlenarYGuardar();
    expect(document.activeElement).toBe(botonNuevo().element);
  });

  it('con la tecla Esc, cuando el formulario está vacío', async () => {
    await montar();
    await botonNuevo().trigger('click');
    await esperar();
    dialogo().dispatchEvent(new KeyboardEvent('keydown', { keyCode: 27, bubbles: true }));
    await esperar();
    expect(abierto()).toBe(false);
    expect(document.activeElement).toBe(botonNuevo().element);
  });
});
