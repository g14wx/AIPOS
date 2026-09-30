// Spec registrar-venta, "Pantalla: botón «Registrar venta» (V-08) > Qué hace > Envío": registrarVenta(detalles) manda
// POST /ventas (http.js ya antepone /api) con { detalles: [{ productoId, cantidad, precioAplicado }] }, solo esos tres
// campos de cada detalle, y devuelve { ventaId, total }: lo que contestó la API, sin recalcular nada (RN-09). Los errores
// llegan como los deja el interceptor de http.js (status, codigo, mensaje y detalles del error). Sin red: se sustituye
// el adaptador de axios, como en crear-producto.test.js.
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { AxiosError } from 'axios';

const URL_DE_LA_API = 'http://localhost:3124';

// Carga http.js y ventas.js con la misma copia de los módulos, para poder sustituir el adaptador de axios.
async function cargar() {
  vi.resetModules();
  const { default: http } = await import('../../src/api/http.js');
  const { registrarVenta } = await import('../../src/api/ventas.js');
  return { http, registrarVenta };
}

// Adaptador que responde lo que le pidas, como si el servidor lo hubiera dicho, y guarda cada petición.
function responderCon(http, { estado, datos, error }) {
  const peticiones = [];
  http.defaults.adapter = async (config) => {
    peticiones.push(config);
    if (error) throw error;
    const respuesta = { status: estado, statusText: '', headers: {}, config, data: datos };
    if (estado >= 200 && estado < 300) return respuesta;
    throw new AxiosError('Request failed', AxiosError.ERR_BAD_REQUEST, config, null, respuesta);
  };
  return peticiones;
}

const detalles = [
  { productoId: 1, cantidad: 2, precioAplicado: '22.00' },
  { productoId: 2, cantidad: 1, precioAplicado: '3.50' },
];
const errorDeLaApi = (codigo, mensaje, detallesDelError) => ({
  error: { codigo, mensaje, ...(detallesDelError ? { detalles: detallesDelError } : {}) },
});

beforeEach(() => {
  vi.stubEnv('VITE_API_URL', URL_DE_LA_API);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('registrarVenta: lo que manda', () => {
  it('manda POST /ventas, relativo a la dirección de la API, con { detalles } en JSON', async () => {
    const { http, registrarVenta } = await cargar();
    const peticiones = responderCon(http, { estado: 201, datos: { ventaId: 15, total: '47.50' } });
    await registrarVenta(detalles);
    expect(peticiones).toHaveLength(1);
    expect(peticiones[0].method).toBe('post');
    expect(peticiones[0].url).toBe('/ventas');
    expect(peticiones[0].baseURL).toBe(`${URL_DE_LA_API}/api`);
    expect(JSON.parse(peticiones[0].data)).toEqual({ detalles });
  });

  it('manda solo productoId, cantidad y precioAplicado de cada detalle: el nombre y lo demás se quedan en la pantalla', async () => {
    const { http, registrarVenta } = await cargar();
    const peticiones = responderCon(http, { estado: 201, datos: { ventaId: 15, total: '47.50' } });
    await registrarVenta([
      {
        productoId: 1,
        nombre: 'Leche entera 1 L',
        cantidad: 2,
        precioAplicado: '22.00',
        subtotal: '44.00',
      },
      { productoId: 2, nombre: 'Pan de caja', cantidad: 1, precioAplicado: '3.50', errores: {} },
    ]);
    const enviados = JSON.parse(peticiones[0].data).detalles;
    expect(enviados).toEqual(detalles);
    for (const detalle of enviados) {
      expect(Object.keys(detalle)).toEqual(['productoId', 'cantidad', 'precioAplicado']);
    }
  });

  it('no manda un total ni un subtotal: el que vale lo calcula MySQL (RN-09)', async () => {
    const { http, registrarVenta } = await cargar();
    const peticiones = responderCon(http, { estado: 201, datos: { ventaId: 15, total: '47.50' } });
    await registrarVenta(detalles);
    expect(Object.keys(JSON.parse(peticiones[0].data))).toEqual(['detalles']);
    expect(peticiones[0].data).not.toMatch(/total|subtotal/i);
  });

  it('conserva el orden, la cantidad como número entero y el precio aplicado como texto de 2 decimales', async () => {
    const { http, registrarVenta } = await cargar();
    const peticiones = responderCon(http, { estado: 201, datos: { ventaId: 1, total: '0.00' } });
    await registrarVenta([
      { productoId: 9, cantidad: 999, precioAplicado: '0.00' },
      { productoId: 3, cantidad: 1, precioAplicado: '99999.99' },
    ]);
    const enviados = JSON.parse(peticiones[0].data).detalles;
    expect(enviados.map((detalle) => detalle.productoId)).toEqual([9, 3]);
    expect(enviados[0].cantidad).toBe(999);
    expect(enviados[0].precioAplicado).toBe('0.00');
    expect(enviados[1].precioAplicado).toBe('99999.99');
  });

  it('no cambia los detalles que recibe', async () => {
    const { http, registrarVenta } = await cargar();
    responderCon(http, { estado: 201, datos: { ventaId: 15, total: '47.50' } });
    const congelados = Object.freeze(
      detalles.map((detalle) => Object.freeze({ ...detalle, nombre: 'Leche' })),
    );
    await expect(registrarVenta(congelados)).resolves.toBeDefined();
    expect(congelados).toHaveLength(2);
    expect(congelados[0].nombre).toBe('Leche');
  });
});

describe('registrarVenta: lo que devuelve', () => {
  it('devuelve { ventaId, total } con los valores que contestó la API, el total como texto', async () => {
    const { http, registrarVenta } = await cargar();
    responderCon(http, { estado: 201, datos: { ventaId: 15, total: '47.50' } });
    await expect(registrarVenta(detalles)).resolves.toEqual({ ventaId: 15, total: '47.50' });
  });

  it('no recalcula: devuelve el total de la API aunque no sea la suma de los detalles', async () => {
    const { http, registrarVenta } = await cargar();
    responderCon(http, { estado: 201, datos: { ventaId: 16, total: '51.00' } });
    await expect(registrarVenta(detalles)).resolves.toEqual({ ventaId: 16, total: '51.00' });
  });

  it('devuelve solo ventaId y total, aunque la API agregue otra cosa', async () => {
    const { http, registrarVenta } = await cargar();
    responderCon(http, { estado: 201, datos: { ventaId: 15, total: '47.50', fecha: 'hoy' } });
    const venta = await registrarVenta(detalles);
    expect(Object.keys(venta)).toEqual(['ventaId', 'total']);
  });

  it('con el total más grande (100 detalles de 999 × 99999.99) no pierde centavos', async () => {
    const { http, registrarVenta } = await cargar();
    responderCon(http, { estado: 201, datos: { ventaId: 1, total: '9989999001.00' } });
    const venta = await registrarVenta(detalles);
    expect(venta.total).toBe('9989999001.00');
  });
});

describe('registrarVenta: los errores', () => {
  it('un 400 llega como Error con status, codigo, mensaje y los detalles del error de cada campo', async () => {
    const { http, registrarVenta } = await cargar();
    const detallesDelError = [
      { campo: 'detalles[1].cantidad', mensaje: 'Debe ser un entero de 1 a 999.' },
    ];
    responderCon(http, {
      estado: 400,
      datos: errorDeLaApi(
        'DATOS_INVALIDOS',
        'Los datos de la venta no son válidos.',
        detallesDelError,
      ),
    });
    const error = await registrarVenta(detalles).catch((e) => e);
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(400);
    expect(error.codigo).toBe('DATOS_INVALIDOS');
    expect(error.mensaje).toBe('Los datos de la venta no son válidos.');
    expect(error.detalles).toEqual(detallesDelError);
  });

  it('un 422 llega con el código de la regla y su mensaje para el cajero', async () => {
    const { http, registrarVenta } = await cargar();
    const mensaje = 'Un producto de la venta ya no existe. Revisa la venta actual.';
    responderCon(http, { estado: 422, datos: errorDeLaApi('PRODUCTO_NO_EXISTE', mensaje) });
    const error = await registrarVenta(detalles).catch((e) => e);
    expect(error.status).toBe(422);
    expect(error.codigo).toBe('PRODUCTO_NO_EXISTE');
    expect(error.mensaje).toBe(mensaje);
    expect(error.detalles).toEqual([]);
  });

  it('un 500 llega con ERROR_INTERNO y el mensaje de la API', async () => {
    const { http, registrarVenta } = await cargar();
    const mensaje = 'Ocurrió un error inesperado. Intenta de nuevo.';
    responderCon(http, { estado: 500, datos: errorDeLaApi('ERROR_INTERNO', mensaje) });
    const error = await registrarVenta(detalles).catch((e) => e);
    expect(error.status).toBe(500);
    expect(error.codigo).toBe('ERROR_INTERNO');
    expect(error.mensaje).toBe(mensaje);
  });

  it('una respuesta que no es de la API (el HTML de un 502) deja su status y un mensaje genérico', async () => {
    const { http, registrarVenta } = await cargar();
    responderCon(http, { estado: 502, datos: '<html><body>Bad Gateway nginx/1.27</body></html>' });
    const error = await registrarVenta(detalles).catch((e) => e);
    expect(error.status).toBe(502);
    expect(error.codigo).toBe('ERROR_INTERNO');
    expect(error.mensaje).toBe('Ocurrió un error inesperado. Intenta de nuevo.');
    expect(error.mensaje).not.toMatch(/nginx|html|gateway/i);
  });

  it('sin respuesta (servidor apagado o sin red) el error trae status 0 y SIN_CONEXION', async () => {
    const { http, registrarVenta } = await cargar();
    responderCon(http, { error: new AxiosError('Network Error', AxiosError.ERR_NETWORK) });
    const error = await registrarVenta(detalles).catch((e) => e);
    expect(error.status).toBe(0);
    expect(error.codigo).toBe('SIN_CONEXION');
  });

  it('pasado el tiempo máximo de 10 segundos también es SIN_CONEXION, y el mensaje no muestra la dirección', async () => {
    const { http, registrarVenta } = await cargar();
    responderCon(http, {
      error: new AxiosError('timeout of 10000ms exceeded', AxiosError.ECONNABORTED),
    });
    const error = await registrarVenta(detalles).catch((e) => e);
    expect(error.status).toBe(0);
    expect(error.codigo).toBe('SIN_CONEXION');
    expect(error.mensaje).not.toContain(URL_DE_LA_API);
    expect(error.mensaje).not.toMatch(/timeout|axios/i);
  });

  it('un error no se reintenta solo: cada llamada manda una sola petición', async () => {
    const { http, registrarVenta } = await cargar();
    const peticiones = responderCon(http, {
      error: new AxiosError('Network Error', AxiosError.ERR_NETWORK),
    });
    await registrarVenta(detalles).catch(() => {});
    expect(peticiones).toHaveLength(1);
  });
});
