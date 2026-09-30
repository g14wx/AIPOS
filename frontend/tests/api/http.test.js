// Spec de arquitectura, sección "Servicio de API": src/api/http.js crea la instancia de axios con baseURL
// `${VITE_API_URL}/api`, tiempo máximo de 10 segundos y un interceptor que convierte todo error en un Error
// con status, codigo, mensaje y detalles. Sin red, se sustituye el adaptador de axios: no se llama a nadie.
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { AxiosError } from 'axios';

const URL_DE_LA_API = 'http://localhost:3124';

async function cargarHttp() {
  vi.resetModules();
  const modulo = await import('../../src/api/http.js');
  return modulo.default;
}

// Adaptador que responde lo que le pidas, como si el servidor lo hubiera dicho.
function responderCon(http, { estado, datos, error }) {
  const configuraciones = [];
  http.defaults.adapter = async (config) => {
    configuraciones.push(config);
    if (error) throw error;
    const respuesta = { status: estado, statusText: '', headers: {}, config, data: datos };
    if (estado >= 200 && estado < 300) return respuesta;
    throw new AxiosError('Request failed', AxiosError.ERR_BAD_REQUEST, config, null, respuesta);
  };
  return configuraciones;
}

beforeEach(() => {
  vi.stubEnv('VITE_API_URL', URL_DE_LA_API);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('configuración de http.js', () => {
  it('usa VITE_API_URL más /api como baseURL', async () => {
    const http = await cargarHttp();
    expect(http.defaults.baseURL).toBe(`${URL_DE_LA_API}/api`);
  });

  it('espera como máximo 10 segundos', async () => {
    const http = await cargarHttp();
    expect(http.defaults.timeout).toBe(10000);
  });

  it('las llamadas salen hacia baseURL con la ruta que pide la función', async () => {
    const http = await cargarHttp();
    const configuraciones = responderCon(http, { estado: 200, datos: [] });
    await http.get('/productos', { params: { q: 'leche' } });
    expect(configuraciones).toHaveLength(1);
    expect(configuraciones[0].baseURL).toBe(`${URL_DE_LA_API}/api`);
    expect(configuraciones[0].url).toBe('/productos');
  });

  it('falla al cargar si falta VITE_API_URL, con un mensaje que nombra la variable', async () => {
    vi.stubEnv('VITE_API_URL', '');
    await expect(cargarHttp()).rejects.toThrow(/VITE_API_URL/);
  });
});

describe('respuestas buenas', () => {
  it('dejan pasar la respuesta sin cambiarla', async () => {
    const http = await cargarHttp();
    responderCon(http, {
      estado: 201,
      datos: { id: 7, nombre: 'Leche entera 1 L', precio: '25.00' },
    });
    const respuesta = await http.post('/productos', {});
    expect(respuesta.status).toBe(201);
    expect(respuesta.data).toEqual({ id: 7, nombre: 'Leche entera 1 L', precio: '25.00' });
  });
});

describe('errores con el formato de error de la API', () => {
  it('un 400 con detalles llega como Error con status, codigo, mensaje y detalles', async () => {
    const http = await cargarHttp();
    const detalles = [{ campo: 'precio', mensaje: 'No puede tener más de 2 decimales.' }];
    responderCon(http, {
      estado: 400,
      datos: {
        error: {
          codigo: 'DATOS_INVALIDOS',
          mensaje: 'El precio no puede tener más de 2 decimales.',
          detalles,
        },
      },
    });
    const error = await http.post('/productos', {}).catch((e) => e);
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(400);
    expect(error.codigo).toBe('DATOS_INVALIDOS');
    expect(error.mensaje).toBe('El precio no puede tener más de 2 decimales.');
    expect(error.detalles).toEqual(detalles);
  });

  it('un 409 de código de barras repetido conserva su codigo y sus detalles', async () => {
    const http = await cargarHttp();
    const detalles = [{ campo: 'codigoBarras', mensaje: 'Ya existe un producto con ese código.' }];
    responderCon(http, {
      estado: 409,
      datos: {
        error: {
          codigo: 'CODIGO_BARRAS_DUPLICADO',
          mensaje: 'Código de barras repetido.',
          detalles,
        },
      },
    });
    const error = await http.post('/productos', {}).catch((e) => e);
    expect(error.status).toBe(409);
    expect(error.codigo).toBe('CODIGO_BARRAS_DUPLICADO');
    expect(error.detalles).toEqual(detalles);
  });

  it('un 422 lleva el codigo de la regla de negocio', async () => {
    const http = await cargarHttp();
    responderCon(http, {
      estado: 422,
      datos: { error: { codigo: 'VENTA_SIN_DETALLES', mensaje: 'La venta no tiene detalles.' } },
    });
    const error = await http.post('/ventas', {}).catch((e) => e);
    expect(error.status).toBe(422);
    expect(error.codigo).toBe('VENTA_SIN_DETALLES');
    expect(error.mensaje).toBe('La venta no tiene detalles.');
  });

  it('cuando la API no manda detalles, detalles es un arreglo vacío y se puede recorrer', async () => {
    const http = await cargarHttp();
    responderCon(http, {
      estado: 500,
      datos: {
        error: {
          codigo: 'ERROR_INTERNO',
          mensaje: 'Ocurrió un error inesperado. Intenta de nuevo.',
        },
      },
    });
    const error = await http.get('/productos').catch((e) => e);
    expect(error.status).toBe(500);
    expect(error.mensaje).toBe('Ocurrió un error inesperado. Intenta de nuevo.');
    expect(error.detalles).toEqual([]);
  });

  it('una respuesta de error sin el formato de la API (por ejemplo, HTML de un 502) da un mensaje genérico', async () => {
    const http = await cargarHttp();
    responderCon(http, { estado: 502, datos: '<html>Bad Gateway</html>' });
    const error = await http.get('/productos').catch((e) => e);
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(502);
    expect(error.codigo).toBe('ERROR_INTERNO');
    expect(error.mensaje).toBe('Ocurrió un error inesperado. Intenta de nuevo.');
    expect(error.mensaje).not.toContain('<html>');
  });
});

describe('errores sin respuesta', () => {
  const mensajeSinConexion = 'No se pudo conectar con el servidor. Intenta de nuevo.';

  it('con la red caída, status vale 0 y el mensaje dice que no se pudo conectar', async () => {
    const http = await cargarHttp();
    responderCon(http, { error: new AxiosError('Network Error', AxiosError.ERR_NETWORK) });
    const error = await http.get('/productos').catch((e) => e);
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(0);
    expect(error.codigo).toBe('SIN_CONEXION');
    expect(error.mensaje).toBe(mensajeSinConexion);
    expect(error.detalles).toEqual([]);
  });

  it('al pasar los 10 segundos, también status 0 y el mismo mensaje', async () => {
    const http = await cargarHttp();
    responderCon(http, {
      error: new AxiosError('timeout of 10000ms exceeded', AxiosError.ECONNABORTED),
    });
    const error = await http.get('/productos').catch((e) => e);
    expect(error.status).toBe(0);
    expect(error.mensaje).toBe(mensajeSinConexion);
  });

  it('el mensaje no muestra la dirección del servidor ni el texto de axios', async () => {
    const http = await cargarHttp();
    responderCon(http, { error: new AxiosError('Network Error', AxiosError.ERR_NETWORK) });
    const error = await http.get('/productos').catch((e) => e);
    expect(error.mensaje).not.toContain('localhost');
    expect(error.mensaje).not.toContain('Network Error');
  });
});
