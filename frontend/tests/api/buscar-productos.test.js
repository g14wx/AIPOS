// Spec buscar-producto, "Pantalla (P-05)": buscarProductos(texto) de src/api/productos.js llama a GET /productos de
// src/api/http.js con params: { busqueda: texto } y devuelve la lista. Axios codifica el texto. Un error llega como el
// Error con status, codigo, mensaje y detalles del error que arma http.js. Sin red: se sustituye el adaptador de axios,
// como en http.test.js y en crear-producto.test.js.
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { AxiosError } from 'axios';

const URL_DE_LA_API = 'http://localhost:3124';

// Carga http.js y productos.js con la misma copia de los módulos, para poder sustituir el adaptador de axios.
async function cargar() {
  vi.resetModules();
  const { default: http } = await import('../../src/api/http.js');
  const productos = await import('../../src/api/productos.js');
  return { http, ...productos };
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

const leche = { id: 1, nombre: 'Leche entera 1 L', codigoBarras: '7501055300075', precio: '25.00' };

beforeEach(() => {
  vi.stubEnv('VITE_API_URL', URL_DE_LA_API);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('buscarProductos', () => {
  it('manda GET /productos, relativo a la dirección de la API, con params { busqueda } y sin cuerpo', async () => {
    const { http, buscarProductos } = await cargar();
    const peticiones = responderCon(http, { estado: 200, datos: [leche] });
    await buscarProductos('lech');
    expect(peticiones).toHaveLength(1);
    expect(peticiones[0].method).toBe('get');
    expect(peticiones[0].url).toBe('/productos');
    expect(peticiones[0].baseURL).toBe(`${URL_DE_LA_API}/api`);
    expect(peticiones[0].params).toEqual({ busqueda: 'lech' });
    expect(peticiones[0].data).toBeUndefined();
  });

  it('devuelve la lista que contesta la API: id, nombre, código de barras y precio con 2 decimales', async () => {
    const { http, buscarProductos } = await cargar();
    responderCon(http, { estado: 200, datos: [leche] });
    await expect(buscarProductos('lech')).resolves.toEqual([leche]);
  });

  it('devuelve la lista vacía cuando no hay coincidencias: no es un error', async () => {
    const { http, buscarProductos } = await cargar();
    responderCon(http, { estado: 200, datos: [] });
    await expect(buscarProductos('zzzz')).resolves.toEqual([]);
  });

  it('manda el texto tal cual lo recibe: recortarlo es cosa de la pantalla', async () => {
    const { http, buscarProductos } = await cargar();
    const peticiones = responderCon(http, { estado: 200, datos: [] });
    await buscarProductos('  lech  ');
    expect(peticiones[0].params.busqueda).toBe('  lech  ');
  });

  it('vive junto a crearProducto en el mismo archivo: las dos funciones se conservan', async () => {
    const modulo = await cargar();
    expect(typeof modulo.buscarProductos).toBe('function');
    expect(typeof modulo.crearProducto).toBe('function');
  });
});

// Axios codifica el texto: lo que la dirección lleva se lee igual del otro lado, y nada de lo escrito se cuela como
// otro parámetro ni como parte de la dirección (RNF-04).
describe('el texto viaja codificado en la dirección', () => {
  const textos = [
    '50%',
    'a_b',
    "' OR 1=1 --",
    'a\\',
    'a&busqueda=otro&extra=1',
    'lech#uno',
    'ñandú',
    'leche entera',
    '7501055300075',
  ];

  it.each(textos)('%s se lee igual en la dirección y no agrega parámetros', async (texto) => {
    const { http, buscarProductos } = await cargar();
    const peticiones = responderCon(http, { estado: 200, datos: [] });
    await buscarProductos(texto);
    const direccion = new URL(http.getUri(peticiones[0]));
    expect(direccion.origin + direccion.pathname).toBe(`${URL_DE_LA_API}/api/productos`);
    expect([...direccion.searchParams.keys()]).toEqual(['busqueda']);
    expect(direccion.searchParams.get('busqueda')).toBe(texto);
    expect(direccion.hash).toBe('');
  });
});

// Un error llega como el Error que arma el interceptor de http.js: status, codigo, mensaje y detalles del error.
describe('los errores de buscarProductos', () => {
  it('un 400 llega con status, código de error, mensaje y los detalles del error del campo busqueda', async () => {
    const { http, buscarProductos } = await cargar();
    const detalles = [{ campo: 'busqueda', mensaje: 'Escribe al menos 2 caracteres.' }];
    responderCon(http, {
      estado: 400,
      datos: {
        error: {
          codigo: 'DATOS_INVALIDOS',
          mensaje: 'El texto de búsqueda debe tener entre 2 y 120 caracteres.',
          detalles,
        },
      },
    });
    const error = await buscarProductos('a').catch((e) => e);
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(400);
    expect(error.codigo).toBe('DATOS_INVALIDOS');
    expect(error.detalles).toEqual(detalles);
  });

  it('un 500 llega con el mensaje genérico de la API, sin el SQL', async () => {
    const { http, buscarProductos } = await cargar();
    responderCon(http, {
      estado: 500,
      datos: {
        error: {
          codigo: 'ERROR_INTERNO',
          mensaje: 'Ocurrió un error inesperado. Intenta de nuevo.',
        },
      },
    });
    const error = await buscarProductos('lech').catch((e) => e);
    expect(error.status).toBe(500);
    expect(error.codigo).toBe('ERROR_INTERNO');
    expect(error.detalles).toEqual([]);
  });

  it('sin respuesta, el error trae status 0 y el mensaje de no poder conectar', async () => {
    const { http, buscarProductos } = await cargar();
    responderCon(http, { error: new AxiosError('Network Error', AxiosError.ERR_NETWORK) });
    const error = await buscarProductos('lech').catch((e) => e);
    expect(error.status).toBe(0);
    expect(error.codigo).toBe('SIN_CONEXION');
    expect(error.mensaje).toBe('No se pudo conectar con el servidor. Intenta de nuevo.');
  });

  it('una respuesta que no es de la API (el HTML de un 502) no se muestra tal cual', async () => {
    const { http, buscarProductos } = await cargar();
    responderCon(http, { estado: 502, datos: '<html><body>Bad Gateway</body></html>' });
    const error = await buscarProductos('lech').catch((e) => e);
    expect(error.status).toBe(502);
    expect(error.codigo).toBe('ERROR_INTERNO');
    expect(error.mensaje).not.toContain('Bad Gateway');
  });
});
