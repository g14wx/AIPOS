import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const express = require('express');
const { crearApp } = require('../src/app.js');
const ErrorApi = require('../src/errors/ErrorApi.js');
const desdeBaseDeDatos = require('../src/errors/desdeBaseDeDatos.js');

function errorDeMysql(errno, sqlMessage = 'mensaje del servidor') {
  const err = new Error(`SQL: SELECT * FROM productos -> ${sqlMessage}`);
  err.name = 'SequelizeDatabaseError';
  err.parent = { errno, sqlMessage, sql: 'SELECT * FROM productos' };
  return err;
}

describe('ErrorApi', () => {
  it('guarda estado, código, mensaje y detalles', () => {
    const detalles = [{ campo: 'precio', mensaje: 'No puede tener más de 2 decimales.' }];
    const err = new ErrorApi(400, 'DATOS_INVALIDOS', 'El precio no es válido.', detalles);
    expect(err).toBeInstanceOf(Error);
    expect(err).toMatchObject({ estado: 400, codigo: 'DATOS_INVALIDOS', detalles });
    expect(err.message).toBe('El precio no es válido.');
  });

  it('solo acepta los cinco estados de RNF-05', () => {
    for (const estado of [400, 404, 409, 422, 500]) {
      expect(() => new ErrorApi(estado, 'X', 'x')).not.toThrow();
    }
    for (const estado of [200, 401, 403, 405, 418, 503]) {
      expect(() => new ErrorApi(estado, 'X', 'x')).toThrow(/estado/i);
    }
  });
});

describe('desdeBaseDeDatos', () => {
  it('1644 (SIGNAL) con código en mayúsculas es un 422 con ese código', () => {
    const err = desdeBaseDeDatos(errorDeMysql(1644, 'VENTA_SIN_DETALLES'));
    expect(err).toBeInstanceOf(ErrorApi);
    expect(err).toMatchObject({ estado: 422, codigo: 'VENTA_SIN_DETALLES' });
  });

  it('1644 con un texto que no es un código usa REGLA_DE_NEGOCIO', () => {
    const err = desdeBaseDeDatos(errorDeMysql(1644, 'Venta sin detalles en la tabla productos'));
    expect(err).toMatchObject({ estado: 422, codigo: 'REGLA_DE_NEGOCIO' });
    expect(err.mensaje ?? err.message).not.toMatch(/tabla productos/);
  });

  it('1062 (duplicado) es un 409 CONFLICTO', () => {
    expect(desdeBaseDeDatos(errorDeMysql(1062))).toMatchObject({
      estado: 409,
      codigo: 'CONFLICTO',
    });
  });

  it('1452 (llave foránea que no existe) es un 404 NO_ENCONTRADO', () => {
    expect(desdeBaseDeDatos(errorDeMysql(1452))).toMatchObject({
      estado: 404,
      codigo: 'NO_ENCONTRADO',
    });
  });

  it('3140 (JSON inválido) y 3819 (CHECK) son un 400 DATOS_INVALIDOS', () => {
    for (const errno of [3140, 3819]) {
      expect(desdeBaseDeDatos(errorDeMysql(errno))).toMatchObject({
        estado: 400,
        codigo: 'DATOS_INVALIDOS',
      });
    }
  });

  it('no traduce nada más: devuelve null', () => {
    expect(desdeBaseDeDatos(errorDeMysql(1146))).toBeNull();
    expect(desdeBaseDeDatos(new Error('cualquiera'))).toBeNull();
    expect(desdeBaseDeDatos(null)).toBeNull();
  });

  it('ningún mensaje deja pasar el texto del SQL ni el mensaje de MySQL', () => {
    for (const errno of [1644, 1062, 1452, 3140, 3819]) {
      const err = desdeBaseDeDatos(errorDeMysql(errno, 'SECRETO_DE_MYSQL'));
      expect(JSON.stringify(err.mensaje ?? err.message)).not.toMatch(/SELECT|productos|mysql/i);
    }
  });
});

function appConRuta(controlador) {
  const router = express.Router();
  router.get('/falla', controlador);
  return crearApp(undefined, { montajes: [{ ruta: '/prueba', router }] });
}

describe('manejador de errores único', () => {
  afterEach(() => vi.restoreAllMocks());

  it('un ErrorApi sale con estado, código, mensaje y detalles', async () => {
    const detalles = [{ campo: 'precio', mensaje: 'Falta.' }];
    const app = appConRuta(async () => {
      throw new ErrorApi(400, 'DATOS_INVALIDOS', 'Faltan datos.', detalles);
    });
    const respuesta = await request(app).get('/api/prueba/falla');
    expect(respuesta.status).toBe(400);
    expect(respuesta.body).toEqual({
      error: { codigo: 'DATOS_INVALIDOS', mensaje: 'Faltan datos.', detalles },
    });
  });

  it('sin detalles, la respuesta no trae la clave detalles', async () => {
    const app = appConRuta(async () => {
      throw new ErrorApi(409, 'CONFLICTO', 'Ya existe.');
    });
    const respuesta = await request(app).get('/api/prueba/falla');
    expect(respuesta.status).toBe(409);
    expect(respuesta.body.error).not.toHaveProperty('detalles');
  });

  it('el error de una función async llega solo al manejador (Express 5)', async () => {
    const app = appConRuta(async () => {
      await Promise.resolve();
      throw new ErrorApi(422, 'VENTA_SIN_DETALLES', 'La venta no tiene detalles.');
    });
    const respuesta = await request(app).get('/api/prueba/falla');
    expect(respuesta.status).toBe(422);
    expect(respuesta.body.error.codigo).toBe('VENTA_SIN_DETALLES');
  });

  it('un error de MySQL se traduce con desdeBaseDeDatos', async () => {
    const app = appConRuta(async () => {
      throw errorDeMysql(1644, 'VENTA_SIN_DETALLES');
    });
    const respuesta = await request(app).get('/api/prueba/falla');
    expect(respuesta.status).toBe(422);
    expect(respuesta.body.error.codigo).toBe('VENTA_SIN_DETALLES');
  });

  it('un error inesperado es un 500 sin stack, sin SQL y sin el mensaje original', async () => {
    const registro = vi.spyOn(console, 'error').mockImplementation(() => {});
    const original = errorDeMysql(1146, 'Table aipos.productos no existe');
    const app = appConRuta(async () => {
      throw original;
    });
    const respuesta = await request(app).get('/api/prueba/falla');
    expect(respuesta.status).toBe(500);
    expect(respuesta.body).toEqual({
      error: {
        codigo: 'ERROR_INTERNO',
        mensaje: 'Ocurrió un error inesperado. Intenta de nuevo.',
      },
    });
    const texto = JSON.stringify(respuesta.body) + respuesta.text;
    expect(texto).not.toMatch(/SELECT|productos|stack|\.js:\d+|node_modules/i);
    expect(registro).toHaveBeenCalledWith(original);
  });

  it('un error síncrono que no es Error también es un 500', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const app = appConRuta(() => {
      throw 'texto suelto';
    });
    const respuesta = await request(app).get('/api/prueba/falla');
    expect(respuesta.status).toBe(500);
    expect(respuesta.body.error.codigo).toBe('ERROR_INTERNO');
  });

  it('un cuerpo que dice ir comprimido y no lo está es un 400 DATOS_INVALIDOS, no un 500', async () => {
    const registro = vi.spyOn(console, 'error').mockImplementation(() => {});
    const app = appConRuta(async () => {});
    for (const codificacion of ['gzip', 'deflate', 'br']) {
      const respuesta = await request(app)
        .post('/api/prueba/falla')
        .set('Content-Type', 'application/json')
        .set('Content-Encoding', codificacion)
        .send('{"hola":"mundo"}');
      expect(respuesta.status, codificacion).toBe(400);
      expect(respuesta.body.error.codigo, codificacion).toBe('DATOS_INVALIDOS');
      expect(typeof respuesta.body.error.mensaje).toBe('string');
    }
    // Es un error del cliente: no se cuenta como error del servidor ni llena el log.
    expect(registro).not.toHaveBeenCalled();
  });

  it('un error 4xx con el code de zlib o de brotli, o con el type del lector, es un 400', async () => {
    const registro = vi.spyOn(console, 'error').mockImplementation(() => {});
    const delLector = [
      { code: 'Z_DATA_ERROR' },
      { code: 'Z_BUF_ERROR' },
      { code: 'ERR__ERROR_FORMAT_PADDING_2' },
      { type: 'encoding.unsupported', status: 415 },
      { type: 'request.aborted' },
    ];
    for (const propiedades of delLector) {
      const app = appConRuta(async () => {
        throw Object.assign(new Error('x'), { status: 400, ...propiedades });
      });
      const respuesta = await request(app).get('/api/prueba/falla');
      expect(respuesta.status, JSON.stringify(propiedades)).toBe(400);
      expect(respuesta.body.error.codigo).toBe('DATOS_INVALIDOS');
    }
    expect(registro).not.toHaveBeenCalled();
  });

  it('un error con status 4xx que no trae ninguna señal del lector es un 500 y se escribe en el log', async () => {
    const registro = vi.spyOn(console, 'error').mockImplementation(() => {});
    const noEsDelLector = [
      { status: 400 },
      { status: 404, expose: true },
      { status: 400, code: 'ECONNRESET' },
      { status: 400, type: 'CardError' },
      { status: 503, code: 'Z_DATA_ERROR' },
    ];
    for (const propiedades of noEsDelLector) {
      const app = appConRuta(async () => {
        throw Object.assign(new Error('Falló otra cosa'), propiedades);
      });
      const respuesta = await request(app).get('/api/prueba/falla');
      expect(respuesta.status, JSON.stringify(propiedades)).toBe(500);
      expect(respuesta.body.error.codigo).toBe('ERROR_INTERNO');
    }
    expect(registro).toHaveBeenCalledTimes(noEsDelLector.length);
  });

  it('una ruta que no existe es un 404 NO_ENCONTRADO con el mismo formato', async () => {
    const app = appConRuta(async () => {});
    for (const ruta of ['/api/no-existe', '/otra-cosa']) {
      const respuesta = await request(app).get(ruta);
      expect(respuesta.status).toBe(404);
      expect(respuesta.body.error.codigo).toBe('NO_ENCONTRADO');
      expect(typeof respuesta.body.error.mensaje).toBe('string');
    }
  });

  it('la API solo responde con 200, 400, 404, 409, 422 y 500 en estos casos', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const casos = [
      [400, new ErrorApi(400, 'DATOS_INVALIDOS', 'x')],
      [404, new ErrorApi(404, 'NO_ENCONTRADO', 'x')],
      [409, new ErrorApi(409, 'CONFLICTO', 'x')],
      [422, new ErrorApi(422, 'REGLA', 'x')],
      [500, new Error('boom')],
    ];
    for (const [estado, err] of casos) {
      const app = appConRuta(async () => {
        throw err;
      });
      expect((await request(app).get('/api/prueba/falla')).status).toBe(estado);
    }
  });
});
