// Spec registrar-venta, "Pantalla: botón «Registrar venta» (V-08)" y criterios 1 a 8: RegistrarVenta.vue recibe los
// detalles y si la venta actual es válida, manda la venta con registrarVenta (src/api/ventas.js) y muestra el resultado:
// «Venta N registrada · Total X» con los valores de la API (201), o el motivo (400, 422, 500 o sin respuesta) sin tocar la
// venta actual. Emite registrada y update:enviando; quien la vacía es VentaActual.vue. La API se sustituye con vi.mock y
// lottie-web con la ruta exacta que importa AnimacionLottie, porque jsdom no dibuja.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

const { loadAnimation, instancias } = vi.hoisted(() => {
  const instancias = [];
  const loadAnimation = vi.fn((opciones) => {
    const instancia = { opciones, totalFrames: 46, destroy: vi.fn(), goToAndStop: vi.fn() };
    instancias.push(instancia);
    return instancia;
  });
  return { loadAnimation, instancias };
});

vi.mock('lottie-web/build/player/lottie_light', () => ({ default: { loadAnimation } }));
vi.mock('../../src/api/ventas.js', () => ({ registrarVenta: vi.fn() }));

import { registrarVenta } from '../../src/api/ventas.js';
import vuetify from '../../src/plugins/vuetify.js';
import ventaRegistrada from '../../src/assets/animaciones/venta-registrada.json';
import RegistrarVenta from '../../src/components/RegistrarVenta.vue';

const detalles = [
  { productoId: 1, cantidad: 2, precioAplicado: '22.00' },
  { productoId: 2, cantidad: 1, precioAplicado: '3.50' },
];
const cienDetalles = (cuantos) =>
  Array.from({ length: cuantos }, (_, i) => ({
    productoId: i + 1,
    cantidad: 1,
    precioAplicado: '1.00',
  }));
const MAXIMO = 'Una venta puede tener como máximo 100 productos.';
const SIN_CONEXION = 'No se pudo conectar con el servidor. Tu venta sigue aquí: intenta de nuevo.';
const INESPERADO = 'Ocurrió un error inesperado. Intenta de nuevo.';

// Un Error como los que deja http.js: status, codigo, mensaje y los detalles del error.
const errorDeLaApi = ({ status, codigo, mensaje, detalles: detallesDelError = [] }) =>
  Object.assign(new Error(mensaje), { status, codigo, mensaje, detalles: detallesDelError });
const noExiste = () =>
  errorDeLaApi({
    status: 422,
    codigo: 'PRODUCTO_NO_EXISTE',
    mensaje: 'Un producto de la venta ya no existe. Revisa la venta actual.',
  });
const sinRespuesta = () =>
  errorDeLaApi({
    status: 0,
    codigo: 'SIN_CONEXION',
    mensaje: 'No se pudo conectar. Intenta de nuevo.',
  });

// Una petición que termina cuando la prueba lo decide: así se ve el componente mientras envía.
function peticionPendiente() {
  let resolver;
  let rechazar;
  const promesa = new Promise((alResolver, alRechazar) => {
    resolver = alResolver;
    rechazar = alRechazar;
  });
  registrarVenta.mockReturnValueOnce(promesa);
  return { resolver, rechazar };
}

let wrapper;
let contenedor;
let consola;
// Los textos de consola que una prueba provoca a propósito (un fallo que no es de la API) y que por eso no cuentan.
const esperados = [];

beforeEach(() => {
  contenedor = document.createElement('div');
  contenedor.setAttribute('data-app', 'true');
  document.body.appendChild(contenedor);
  consola = [vi.spyOn(console, 'error'), vi.spyOn(console, 'warn')];
  consola.forEach((espia) => espia.mockImplementation(() => {}));
  registrarVenta.mockReset();
  loadAnimation.mockClear();
  instancias.length = 0;
  preferirMenosMovimiento(false);
});

afterEach(() => {
  wrapper?.destroy();
  wrapper = null;
  contenedor.remove();
  vi.useRealTimers();
  delete window.__xss;
  const avisos = consola.flatMap((espia) => espia.mock.calls.map((llamada) => llamada.join(' ')));
  consola.forEach((espia) => espia.mockRestore());
  // Lo único que la consola puede traer es el error que una prueba provoca a propósito y lo declara en `esperados`.
  expect(avisos.filter((aviso) => !esperados.some((texto) => aviso.includes(texto)))).toEqual([]);
  esperados.length = 0;
});

function preferirMenosMovimiento(reducir) {
  window.matchMedia = vi.fn((consulta) => ({
    matches: reducir && consulta.includes('prefers-reduced-motion'),
    media: consulta,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));
}

function montar(propsData = {}) {
  const lugar = contenedor.appendChild(document.createElement('div'));
  wrapper = mount(RegistrarVenta, {
    vuetify,
    propsData: { detalles, valida: true, ...propsData },
    attachTo: lugar,
  });
  return wrapper;
}

const boton = () =>
  wrapper.findAll('button').wrappers.find((candidato) => candidato.text() === 'Registrar venta');
const botonCerrar = () =>
  wrapper.findAll('button').wrappers.find((candidato) => candidato.text() === 'Cerrar');
const franjaDeEstado = () => wrapper.find('[role="status"]');
const franjaDeError = () => wrapper.find('[role="alert"]');
const estaDeshabilitado = (candidato) => candidato.attributes('disabled') !== undefined;
const emitidos = (nombre) => wrapper.emitted(nombre) ?? [];
// El componente espera a la API con await: unos cuantos ciclos dejan que termine y que Vue vuelva a pintar.
async function asentar() {
  for (let vuelta = 0; vuelta < 6; vuelta += 1) await wrapper.vm.$nextTick();
}
async function registrar() {
  await boton().trigger('click');
  await asentar();
}

describe('el botón «Registrar venta» (criterio 2)', () => {
  it('se llama «Registrar venta» y es el botón principal: lleva el color primario', () => {
    montar();
    expect(boton().exists()).toBe(true);
    expect(boton().classes()).toContain('primary');
  });

  it('con de 1 a 100 detalles y la venta actual válida está habilitado', () => {
    montar({ detalles: cienDetalles(1) });
    expect(estaDeshabilitado(boton())).toBe(false);
    wrapper.destroy();
    montar({ detalles: cienDetalles(100) });
    expect(estaDeshabilitado(boton())).toBe(false);
    expect(wrapper.text()).not.toContain(MAXIMO);
  });

  it('con la venta actual no válida (vacía o con un dato inválido) está deshabilitado', () => {
    montar({ valida: false });
    expect(estaDeshabilitado(boton())).toBe(true);
  });

  it('sin detalles está deshabilitado aunque valida diga que sí', () => {
    montar({ detalles: [], valida: true });
    expect(estaDeshabilitado(boton())).toBe(true);
  });

  it('con 101 detalles está deshabilitado aunque valida diga que sí, y avisa el máximo de 100 productos', () => {
    montar({ detalles: cienDetalles(101), valida: true });
    expect(estaDeshabilitado(boton())).toBe(true);
    expect(wrapper.text()).toContain(MAXIMO);
  });

  it('el aviso del máximo se explica al lector de pantalla: el botón lo nombra con aria-describedby', () => {
    montar({ detalles: cienDetalles(101) });
    const id = boton().attributes('aria-describedby');
    expect(id).toBeTruthy();
    expect(wrapper.find(`#${id}`).text()).toBe(MAXIMO);
  });

  it('el componente revisa el máximo por su cuenta: con 101 detalles no manda nada, aunque se le pida', async () => {
    montar({ detalles: cienDetalles(101), valida: true });
    await wrapper.vm.registrar();
    expect(registrarVenta).not.toHaveBeenCalled();
    expect(emitidos('update:enviando')).toHaveLength(0);
  });

  it('sin detalles válidos tampoco manda nada, aunque se le pida', async () => {
    montar({ valida: false });
    await wrapper.vm.registrar();
    expect(registrarVenta).not.toHaveBeenCalled();
  });

  it('sigue a la venta actual: se habilita y se deshabilita cuando cambian sus propiedades', async () => {
    montar({ valida: false });
    expect(estaDeshabilitado(boton())).toBe(true);
    await wrapper.setProps({ valida: true });
    expect(estaDeshabilitado(boton())).toBe(false);
    await wrapper.setProps({ detalles: cienDetalles(101) });
    expect(estaDeshabilitado(boton())).toBe(true);
    expect(wrapper.text()).toContain(MAXIMO);
    await wrapper.setProps({ detalles: cienDetalles(100) });
    expect(estaDeshabilitado(boton())).toBe(false);
    expect(wrapper.text()).not.toContain(MAXIMO);
  });
});

describe('enviar la venta (criterio 1)', () => {
  it('al presionarlo llama a registrarVenta una sola vez, con los detalles que recibe', async () => {
    registrarVenta.mockResolvedValue({ ventaId: 15, total: '47.50' });
    montar();
    await registrar();
    expect(registrarVenta).toHaveBeenCalledTimes(1);
    expect(registrarVenta).toHaveBeenCalledWith(detalles);
  });

  it('no cambia los detalles que recibe', async () => {
    registrarVenta.mockResolvedValue({ ventaId: 15, total: '47.50' });
    const congelados = Object.freeze(detalles.map((detalle) => Object.freeze({ ...detalle })));
    montar({ detalles: congelados });
    await registrar();
    expect(wrapper.props('detalles')).toBe(congelados);
  });

  it('mientras envía emite update:enviando con true, y el botón queda deshabilitado y cargando', async () => {
    peticionPendiente();
    montar();
    await boton().trigger('click');
    expect(emitidos('update:enviando')).toEqual([[true]]);
    expect(estaDeshabilitado(boton())).toBe(true);
    expect(boton().classes()).toContain('v-btn--loading');
  });

  it('al terminar emite update:enviando con false y el botón deja de cargar', async () => {
    const { resolver } = peticionPendiente();
    montar();
    await boton().trigger('click');
    resolver({ ventaId: 15, total: '47.50' });
    await asentar();
    expect(emitidos('update:enviando')).toEqual([[true], [false]]);
    expect(boton().classes()).not.toContain('v-btn--loading');
  });
});

describe('doble clic (criterio 3)', () => {
  it('dos clics seguidos mandan una sola petición, aun antes de que el botón se vuelva a pintar', async () => {
    const { resolver } = peticionPendiente();
    montar();
    const presionado = boton();
    presionado.trigger('click');
    presionado.trigger('click');
    await asentar();
    expect(registrarVenta).toHaveBeenCalledTimes(1);
    expect(emitidos('update:enviando')).toEqual([[true]]);
    resolver({ ventaId: 15, total: '47.50' });
    await asentar();
    expect(emitidos('registrada')).toHaveLength(1);
  });

  it('dos llamadas al método en el mismo instante también mandan una sola petición: la marca se pone antes de esperar', async () => {
    const { resolver } = peticionPendiente();
    montar();
    wrapper.vm.registrar();
    wrapper.vm.registrar();
    expect(registrarVenta).toHaveBeenCalledTimes(1);
    resolver({ ventaId: 15, total: '47.50' });
    await asentar();
    expect(emitidos('registrada')).toHaveLength(1);
  });

  it('un clic mientras la petición sigue en curso no manda otra', async () => {
    const { resolver } = peticionPendiente();
    montar();
    await boton().trigger('click');
    await boton().trigger('click');
    expect(registrarVenta).toHaveBeenCalledTimes(1);
    resolver({ ventaId: 15, total: '47.50' });
    await asentar();
  });

  it('tras un error se puede intentar otra vez: se manda una petición nueva y se registra una sola venta', async () => {
    registrarVenta
      .mockRejectedValueOnce(sinRespuesta())
      .mockResolvedValueOnce({ ventaId: 15, total: '47.50' });
    montar();
    await registrar();
    await registrar();
    expect(registrarVenta).toHaveBeenCalledTimes(2);
    expect(emitidos('registrada')).toEqual([[{ ventaId: 15, total: '47.50' }]]);
  });
});

describe('éxito: la API responde 201 (criterio 1)', () => {
  beforeEach(() => {
    registrarVenta.mockResolvedValue({ ventaId: 15, total: '47.50' });
  });

  it('la región de estado ya existe antes del primer envío, vacía: así el lector de pantalla anuncia la venta cuando llega', () => {
    montar();
    expect(franjaDeEstado().exists()).toBe(true);
    expect(franjaDeEstado().text()).toBe('');
  });

  it('muestra «Venta 15 registrada · Total 47.50» en una franja con role="status"', async () => {
    montar();
    await registrar();
    expect(franjaDeEstado().text()).toBe('Venta 15 registrada · Total 47.50');
  });

  it('usa los valores de la API, sin recalcular: si dice otro total, ese se ve', async () => {
    registrarVenta.mockResolvedValue({ ventaId: 16, total: '99.99' });
    montar();
    await registrar();
    expect(franjaDeEstado().text()).toBe('Venta 16 registrada · Total 99.99');
  });

  it('no pone símbolo de moneda ni separador de miles: el total más grande se ve como lo devuelve la API', async () => {
    registrarVenta.mockResolvedValue({ ventaId: 1234, total: '9989999001.00' });
    montar();
    await registrar();
    expect(franjaDeEstado().text()).toBe('Venta 1234 registrada · Total 9989999001.00');
    expect(wrapper.text()).not.toMatch(/[$€£]/);
  });

  it('emite registrada con { ventaId, total }, y al final update:enviando con false', async () => {
    const orden = [];
    montar();
    wrapper.vm.$on('registrada', (venta) => orden.push(['registrada', venta]));
    wrapper.vm.$on('update:enviando', (valor) => orden.push(['enviando', valor]));
    await registrar();
    expect(orden).toEqual([
      ['enviando', true],
      ['registrada', { ventaId: 15, total: '47.50' }],
      ['enviando', false],
    ]);
  });

  it('muestra la animación venta-registrada.json al lado del texto: decorativa y una sola vez', async () => {
    montar();
    expect(loadAnimation).not.toHaveBeenCalled();
    await registrar();
    expect(loadAnimation).toHaveBeenCalledTimes(1);
    const opciones = loadAnimation.mock.calls[0][0];
    expect(opciones.animationData).toEqual(ventaRegistrada);
    expect(opciones.renderer).toBe('svg');
    expect(opciones.loop).toBe(false);
    expect(wrapper.find('.animacion-lottie').attributes('aria-hidden')).toBe('true');
  });

  it('la franja se queda hasta que el cajero la cierra: no desaparece sola', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
    montar();
    await registrar();
    await vi.advanceTimersByTimeAsync(10 * 60 * 1000);
    expect(franjaDeEstado().text()).toBe('Venta 15 registrada · Total 47.50');
    expect(botonCerrar().exists()).toBe(true);
  });

  it('«Cerrar» quita la franja y su animación', async () => {
    montar();
    await registrar();
    await botonCerrar().trigger('click');
    expect(franjaDeEstado().text()).toBe('');
    expect(botonCerrar()).toBeUndefined();
    expect(wrapper.find('.animacion-lottie').exists()).toBe(false);
    expect(instancias[0].destroy).toHaveBeenCalled();
  });

  it('registrar otra venta quita la franja anterior en cuanto empieza a enviar', async () => {
    montar();
    await registrar();
    expect(franjaDeEstado().text()).not.toBe('');
    const { resolver } = peticionPendiente();
    await boton().trigger('click');
    expect(franjaDeEstado().text()).toBe('');
    resolver({ ventaId: 16, total: '3.50' });
    await asentar();
    expect(franjaDeEstado().text()).toBe('Venta 16 registrada · Total 3.50');
  });

  it('muestra el número y el total como texto: nada de lo que llegue se interpreta como HTML (RNF-04)', async () => {
    registrarVenta.mockResolvedValue({
      ventaId: '<b>15</b>',
      total: '<img src=x onerror="window.__xss = 1">',
    });
    montar();
    await registrar();
    expect(franjaDeEstado().find('b').exists()).toBe(false);
    expect(wrapper.find('img').exists()).toBe(false);
    expect(window.__xss).toBeUndefined();
  });
});

describe('errores: la venta actual se conserva (criterios 4, 5 y 6)', () => {
  const datosInvalidos = (detallesDelError) =>
    errorDeLaApi({
      status: 400,
      codigo: 'DATOS_INVALIDOS',
      mensaje: 'Los datos de la venta no son válidos. Revisa los campos marcados.',
      detalles: detallesDelError,
    });

  it('422 (criterio 4): muestra el motivo en una franja con role="alert" y no dice que la venta se registró', async () => {
    registrarVenta.mockRejectedValue(noExiste());
    montar();
    await registrar();
    expect(franjaDeError().text()).toContain(
      'Un producto de la venta ya no existe. Revisa la venta actual.',
    );
    expect(franjaDeEstado().text()).toBe('');
    expect(wrapper.text()).not.toContain('registrada');
  });

  it('400 (criterio 5): muestra el mensaje y, uno por línea, los detalles del error con su campo', async () => {
    registrarVenta.mockRejectedValue(
      datosInvalidos([
        { campo: 'detalles[1].cantidad', mensaje: 'Debe ser un entero de 1 a 999.' },
        { campo: 'detalles[0].precioAplicado', mensaje: 'No puede tener más de 2 decimales.' },
        { campo: 'detalles[2].productoId', mensaje: 'Este producto ya está en la venta.' },
      ]),
    );
    montar();
    await registrar();
    expect(franjaDeError().text()).toContain('Los datos de la venta no son válidos.');
    expect(
      franjaDeError()
        .findAll('li')
        .wrappers.map((linea) => linea.text()),
    ).toEqual([
      'Detalle 2, cantidad: Debe ser un entero de 1 a 999.',
      'Detalle 1, precio aplicado: No puede tener más de 2 decimales.',
      'Detalle 3, producto: Este producto ya está en la venta.',
    ]);
  });

  it('400 de la lista entera (detalles): la línea es el mensaje solo, sin un campo técnico delante', async () => {
    registrarVenta.mockRejectedValue(
      datosInvalidos([{ campo: 'detalles', mensaje: 'Agrega al menos un producto.' }]),
    );
    montar();
    await registrar();
    expect(
      franjaDeError()
        .findAll('li')
        .wrappers.map((linea) => linea.text()),
    ).toEqual(['Agrega al menos un producto.']);
  });

  it('400 con un campo que la pantalla no conoce: la línea es el mensaje, sin el nombre técnico', async () => {
    registrarVenta.mockRejectedValue(
      datosInvalidos([{ campo: 'cuerpo.raro', mensaje: 'No se pudo leer.' }]),
    );
    montar();
    await registrar();
    expect(
      franjaDeError()
        .findAll('li')
        .wrappers.map((linea) => linea.text()),
    ).toEqual(['No se pudo leer.']);
  });

  it('400 sin detalles del error, o con uno sin mensaje: muestra solo el mensaje y ninguna línea vacía', async () => {
    registrarVenta.mockRejectedValue(datosInvalidos([{ campo: 'detalles[0].cantidad' }, null]));
    montar();
    await registrar();
    expect(franjaDeError().text()).toContain('Los datos de la venta no son válidos.');
    expect(franjaDeError().findAll('li')).toHaveLength(0);
  });

  it('500: muestra «Ocurrió un error inesperado. Intenta de nuevo.»', async () => {
    registrarVenta.mockRejectedValue(
      errorDeLaApi({ status: 500, codigo: 'ERROR_INTERNO', mensaje: INESPERADO }),
    );
    montar();
    await registrar();
    expect(franjaDeError().text()).toContain(INESPERADO);
  });

  it('otro estado sin el formato de la API (un 502 de un proxy) muestra el mismo mensaje', async () => {
    registrarVenta.mockRejectedValue(
      errorDeLaApi({ status: 502, codigo: 'ERROR_INTERNO', mensaje: INESPERADO }),
    );
    montar();
    await registrar();
    expect(franjaDeError().text()).toContain(INESPERADO);
    expect(franjaDeError().text()).not.toMatch(/502|nginx|gateway/i);
  });

  it('sin respuesta (criterio 6): avisa que no se pudo conectar y que la venta sigue ahí', async () => {
    registrarVenta.mockRejectedValue(sinRespuesta());
    montar();
    await registrar();
    expect(franjaDeError().text()).toContain(SIN_CONEXION);
    expect(franjaDeError().text()).not.toContain('No se pudo conectar. Intenta de nuevo.');
  });

  it('un error de la API sin mensaje usa el mensaje genérico', async () => {
    registrarVenta.mockRejectedValue(errorDeLaApi({ status: 418, codigo: 'RARO', mensaje: '' }));
    montar();
    await registrar();
    expect(franjaDeError().text()).toContain(INESPERADO);
  });

  it('un fallo que no es un Error de la API (un TypeError) avisa con el mensaje genérico y queda en la consola', async () => {
    esperados.push('se rompió algo nuestro');
    registrarVenta.mockRejectedValue(new TypeError('se rompió algo nuestro'));
    montar();
    await registrar();
    expect(franjaDeError().text()).toContain(INESPERADO);
    expect(franjaDeError().text()).not.toContain('se rompió algo nuestro');
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('la franja de error es la alerta de Vuetify (borde e ícono coral, texto en tinta) y no un texto rojo suelto', async () => {
    registrarVenta.mockRejectedValue(noExiste());
    montar();
    await registrar();
    expect(franjaDeError().classes()).toContain('v-alert');
    expect(franjaDeError().classes()).toContain('error--text');
  });

  it('el mensaje de la API se muestra como texto: nada se interpreta como HTML (RNF-04)', async () => {
    registrarVenta.mockRejectedValue(
      datosInvalidos([
        { campo: 'detalles[0].cantidad', mensaje: '<img src=x onerror="window.__xss = 1">' },
      ]),
    );
    montar();
    await registrar();
    expect(franjaDeError().find('img').exists()).toBe(false);
    expect(franjaDeError().text()).toContain('<img src=x');
    expect(window.__xss).toBeUndefined();
  });
});

describe('la venta actual solo se vacía con un 201 (RNF-05)', () => {
  const fallos = [
    [
      '400',
      () =>
        errorDeLaApi({
          status: 400,
          codigo: 'DATOS_INVALIDOS',
          mensaje: 'Datos no válidos.',
          detalles: [{ campo: 'detalles[0].cantidad', mensaje: 'Debe ser un entero de 1 a 999.' }],
        }),
    ],
    ['422', noExiste],
    ['500', () => errorDeLaApi({ status: 500, codigo: 'ERROR_INTERNO', mensaje: INESPERADO })],
    ['502', () => errorDeLaApi({ status: 502, codigo: 'ERROR_INTERNO', mensaje: INESPERADO })],
    ['sin respuesta', sinRespuesta],
  ];

  it.each(fallos)(
    'con un %s no emite registrada y los detalles quedan como estaban',
    async (_nombre, crear) => {
      registrarVenta.mockRejectedValue(crear());
      montar();
      await registrar();
      expect(emitidos('registrada')).toHaveLength(0);
      expect(wrapper.props('detalles')).toEqual(detalles);
      expect(wrapper.props('valida')).toBe(true);
    },
  );

  it.each(fallos)(
    'con un %s el botón se habilita otra vez y update:enviando termina en false',
    async (_nombre, crear) => {
      registrarVenta.mockRejectedValue(crear());
      montar();
      await registrar();
      expect(estaDeshabilitado(boton())).toBe(false);
      expect(boton().classes()).not.toContain('v-btn--loading');
      expect(emitidos('update:enviando')).toEqual([[true], [false]]);
    },
  );

  it.each(fallos)(
    'con un %s el foco vuelve a «Registrar venta» para intentarlo otra vez',
    async (_nombre, crear) => {
      registrarVenta.mockRejectedValue(crear());
      montar();
      await registrar();
      expect(document.activeElement).toBe(boton().element);
    },
  );

  it('el error no se quita solo: se queda hasta el siguiente envío', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
    registrarVenta.mockRejectedValue(noExiste());
    montar();
    await registrar();
    await vi.advanceTimersByTimeAsync(10 * 60 * 1000);
    expect(franjaDeError().exists()).toBe(true);
  });

  it('el error anterior desaparece en cuanto empieza un nuevo envío', async () => {
    registrarVenta.mockRejectedValueOnce(noExiste());
    montar();
    await registrar();
    expect(franjaDeError().exists()).toBe(true);
    const { resolver } = peticionPendiente();
    await boton().trigger('click');
    expect(franjaDeError().exists()).toBe(false);
    resolver({ ventaId: 15, total: '47.50' });
    await asentar();
  });

  it('el error anterior desaparece al tener éxito', async () => {
    registrarVenta
      .mockRejectedValueOnce(sinRespuesta())
      .mockResolvedValueOnce({ ventaId: 15, total: '47.50' });
    montar();
    await registrar();
    expect(franjaDeError().exists()).toBe(true);
    await registrar();
    expect(franjaDeError().exists()).toBe(false);
    expect(franjaDeEstado().text()).toBe('Venta 15 registrada · Total 47.50');
  });

  it('un error nuevo reemplaza al anterior: nunca hay dos franjas de error', async () => {
    registrarVenta.mockRejectedValueOnce(noExiste()).mockRejectedValueOnce(sinRespuesta());
    montar();
    await registrar();
    await registrar();
    expect(wrapper.findAll('[role="alert"]')).toHaveLength(1);
    expect(franjaDeError().text()).toContain(SIN_CONEXION);
  });

  it('un reintento manda los mismos detalles', async () => {
    registrarVenta
      .mockRejectedValueOnce(sinRespuesta())
      .mockResolvedValueOnce({ ventaId: 15, total: '47.50' });
    montar();
    await registrar();
    await registrar();
    expect(registrarVenta.mock.calls[1][0]).toEqual(detalles);
  });
});

describe('la animación y el movimiento (criterio 7)', () => {
  beforeEach(() => {
    registrarVenta.mockResolvedValue({ ventaId: 15, total: '47.50' });
  });

  it('con menos movimiento la animación no se mueve: no se reproduce, no se repite y muestra el último cuadro', async () => {
    preferirMenosMovimiento(true);
    montar();
    await registrar();
    const opciones = loadAnimation.mock.calls[0][0];
    expect(opciones.animationData).toEqual(ventaRegistrada);
    expect(opciones.autoplay).toBe(false);
    expect(opciones.loop).toBe(false);
    expect(instancias[0].goToAndStop).toHaveBeenCalledWith(instancias[0].totalFrames - 1, true);
  });

  it('y el texto de al lado dice lo mismo que la animación: el número y el total siguen a la vista', async () => {
    preferirMenosMovimiento(true);
    montar();
    await registrar();
    expect(franjaDeEstado().text()).toBe('Venta 15 registrada · Total 47.50');
  });

  it('sin la preferencia, se anima una sola vez y no fija ningún cuadro', async () => {
    montar();
    await registrar();
    const opciones = loadAnimation.mock.calls[0][0];
    expect(opciones.autoplay).toBe(true);
    expect(opciones.loop).toBe(false);
    expect(instancias[0].goToAndStop).not.toHaveBeenCalled();
  });

  it('RegistrarVenta le pasa a AnimacionLottie la animación, sin repetirse: del movimiento se ocupa el adaptador', async () => {
    montar();
    await registrar();
    const adaptador = wrapper.findComponent({ name: 'AnimacionLottie' });
    expect(adaptador.props('animacion')).toEqual(ventaRegistrada);
    expect(adaptador.props('loop')).toBe(false);
    expect(adaptador.props('cuadroFijo')).toBe('ultimo');
  });
});

describe('estructura y seguridad (RNF-04, RNF-06 y criterio 8)', () => {
  const fuente = readFileSync(
    resolve(import.meta.dirname, '../../src/components/RegistrarVenta.vue'),
    'utf8',
  );
  const guion = fuente.match(/<script>([\s\S]*?)<\/script>/)[1];

  it('es un componente de Vue 2 con Options API y un solo elemento raíz', () => {
    montar();
    expect(wrapper.vm.$options.name).toBe('RegistrarVenta');
    expect(wrapper.element.nodeType).toBe(1);
    expect(guion).toMatch(/export default \{/);
    expect(fuente).not.toMatch(/<script setup|defineComponent|modelValue/);
  });

  it('solo llama a registrarVenta de src/api/ventas.js: no importa axios ni http.js ni escribe una URL (criterio 8)', () => {
    expect(guion).toMatch(/import \{ registrarVenta \} from '\.\.\/api\/ventas\.js'/);
    expect(fuente).not.toMatch(/axios|api\/http/);
    expect(fuente).not.toMatch(/https?:\/\//);
    expect(fuente).not.toMatch(/['"`]\/api\//);
  });

  it('no usa v-html ni innerHTML (RNF-04)', () => {
    expect(fuente).not.toMatch(/v-html|innerHTML/);
  });

  it('no toca el navegador ni la venta actual: quien la vacía es VentaActual.vue, y quien la guarda, App.vue', () => {
    expect(fuente).not.toMatch(/localStorage|sessionStorage|almacenamiento|vaciarVentaActual/);
    expect(guion).not.toMatch(/ventaActual\//);
  });

  it('no consulta prefers-reduced-motion ni llama a lottie: del movimiento se ocupa AnimacionLottie', () => {
    expect(guion).not.toMatch(/matchMedia|lottie/);
  });
});
