// Spec crear-producto, "P-03 > Los componentes": crearProducto({ nombre, precio, codigoBarras }) manda POST /productos
// con esos tres campos y devuelve el producto. Los errores llegan como los deja el interceptor de http.js
// (status, codigo, mensaje y detalles del error). Sin red: se sustituye el adaptador de axios, como en http.test.js.
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { AxiosError } from 'axios';

const URL_DE_LA_API = 'http://localhost:3124';

// Carga http.js y productos.js con la misma copia de los módulos, para poder sustituir el adaptador de axios.
async function cargar() {
  vi.resetModules();
  const { default: http } = await import('../../src/api/http.js');
  const { crearProducto } = await import('../../src/api/productos.js');
  return { http, crearProducto };
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

const producto = { nombre: 'Leche entera 1 L', precio: '25.00', codigoBarras: '7501055300075' };

beforeEach(() => {
  vi.stubEnv('VITE_API_URL', URL_DE_LA_API);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('crearProducto', () => {
  it('manda POST /productos, relativo a la dirección de la API, con el cuerpo en JSON', async () => {
    const { http, crearProducto } = await cargar();
    const peticiones = responderCon(http, { estado: 201, datos: { id: 1, ...producto } });
    await crearProducto(producto);
    expect(peticiones).toHaveLength(1);
    expect(peticiones[0].method).toBe('post');
    expect(peticiones[0].url).toBe('/productos');
    expect(peticiones[0].baseURL).toBe(`${URL_DE_LA_API}/api`);
    expect(JSON.parse(peticiones[0].data)).toEqual(producto);
  });

  it('manda solo los tres campos: el resto se ignora', async () => {
    const { http, crearProducto } = await cargar();
    const peticiones = responderCon(http, { estado: 201, datos: { id: 1, ...producto } });
    await crearProducto({ ...producto, id: 99, descuento: '5.00' });
    expect(Object.keys(JSON.parse(peticiones[0].data))).toEqual([
      'nombre',
      'precio',
      'codigoBarras',
    ]);
  });

  it('manda el precio como texto y el código de barras con sus ceros de la izquierda', async () => {
    const { http, crearProducto } = await cargar();
    const peticiones = responderCon(http, { estado: 201, datos: { id: 1 } });
    await crearProducto({ nombre: 'Pan', precio: '9.5', codigoBarras: '0012345' });
    expect(JSON.parse(peticiones[0].data)).toEqual({
      nombre: 'Pan',
      precio: '9.5',
      codigoBarras: '0012345',
    });
  });

  it('devuelve el producto que contesta la API, con su id y el precio de 2 decimales', async () => {
    const { http, crearProducto } = await cargar();
    responderCon(http, { estado: 201, datos: { id: 7, ...producto } });
    await expect(crearProducto(producto)).resolves.toEqual({ id: 7, ...producto });
  });

  it('un 409 llega como Error con status, codigo, mensaje y detalles del error', async () => {
    const { http, crearProducto } = await cargar();
    const detalles = [
      { campo: 'codigoBarras', mensaje: 'Ya existe un producto con ese código de barras.' },
    ];
    responderCon(http, {
      estado: 409,
      datos: {
        error: { codigo: 'CODIGO_BARRAS_DUPLICADO', mensaje: 'Código repetido.', detalles },
      },
    });
    const error = await crearProducto(producto).catch((e) => e);
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(409);
    expect(error.codigo).toBe('CODIGO_BARRAS_DUPLICADO');
    expect(error.detalles).toEqual(detalles);
  });

  it('un 400 llega con los detalles del error de cada campo', async () => {
    const { http, crearProducto } = await cargar();
    const detalles = [{ campo: 'precio', mensaje: 'No puede tener más de 2 decimales.' }];
    responderCon(http, {
      estado: 400,
      datos: { error: { codigo: 'DATOS_INVALIDOS', mensaje: 'Datos no válidos.', detalles } },
    });
    const error = await crearProducto(producto).catch((e) => e);
    expect(error.status).toBe(400);
    expect(error.detalles).toEqual(detalles);
  });

  it('sin respuesta, el error trae status 0 y el mensaje de no poder conectar', async () => {
    const { http, crearProducto } = await cargar();
    responderCon(http, { error: new AxiosError('Network Error', AxiosError.ERR_NETWORK) });
    const error = await crearProducto(producto).catch((e) => e);
    expect(error.status).toBe(0);
    expect(error.mensaje).toBe('No se pudo conectar con el servidor. Intenta de nuevo.');
  });
});
