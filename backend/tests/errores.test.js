import { describe, it, expect, vi, afterEach } from 'vitest';
import net from 'node:net';
import http from 'node:http';
import { once } from 'node:events';
import {
  abrirServidorDePrueba,
  cerrarServidorDePrueba,
  enviarCrudo,
  pedir,
} from './servidor-de-prueba.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const express = require('express');
const appReal = require('../src/app.js');
const { crearApp } = appReal;
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
    const respuesta = await pedir(app, (api) => api.get('/api/prueba/falla'));
    expect(respuesta.status).toBe(400);
    expect(respuesta.body).toEqual({
      error: { codigo: 'DATOS_INVALIDOS', mensaje: 'Faltan datos.', detalles },
    });
  });

  it('sin detalles, la respuesta no trae la clave detalles', async () => {
    const app = appConRuta(async () => {
      throw new ErrorApi(409, 'CONFLICTO', 'Ya existe.');
    });
    const respuesta = await pedir(app, (api) => api.get('/api/prueba/falla'));
    expect(respuesta.status).toBe(409);
    expect(respuesta.body.error).not.toHaveProperty('detalles');
  });

  it('el error de una función async llega solo al manejador (Express 5)', async () => {
    const app = appConRuta(async () => {
      await Promise.resolve();
      throw new ErrorApi(422, 'VENTA_SIN_DETALLES', 'La venta no tiene detalles.');
    });
    const respuesta = await pedir(app, (api) => api.get('/api/prueba/falla'));
    expect(respuesta.status).toBe(422);
    expect(respuesta.body.error.codigo).toBe('VENTA_SIN_DETALLES');
  });

  it('un error de MySQL se traduce con desdeBaseDeDatos', async () => {
    const app = appConRuta(async () => {
      throw errorDeMysql(1644, 'VENTA_SIN_DETALLES');
    });
    const respuesta = await pedir(app, (api) => api.get('/api/prueba/falla'));
    expect(respuesta.status).toBe(422);
    expect(respuesta.body.error.codigo).toBe('VENTA_SIN_DETALLES');
  });

  it('un error inesperado es un 500 sin stack, sin SQL y sin el mensaje original', async () => {
    const registro = vi.spyOn(console, 'error').mockImplementation(() => {});
    const original = errorDeMysql(1146, 'Table aipos.productos no existe');
    const app = appConRuta(async () => {
      throw original;
    });
    const respuesta = await pedir(app, (api) => api.get('/api/prueba/falla'));
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
    const respuesta = await pedir(app, (api) => api.get('/api/prueba/falla'));
    expect(respuesta.status).toBe(500);
    expect(respuesta.body.error.codigo).toBe('ERROR_INTERNO');
  });

  it('un cuerpo que dice ir comprimido y no lo está es un 400 DATOS_INVALIDOS, no un 500', async () => {
    const registro = vi.spyOn(console, 'error').mockImplementation(() => {});
    const app = appConRuta(async () => {});
    for (const codificacion of ['gzip', 'deflate', 'br']) {
      const respuesta = await pedir(app, (api) =>
        api
          .post('/api/prueba/falla')
          .set('Content-Type', 'application/json')
          .set('Content-Encoding', codificacion)
          .send('{"hola":"mundo"}'),
      );
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
      const respuesta = await pedir(app, (api) => api.get('/api/prueba/falla'));
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
      const respuesta = await pedir(app, (api) => api.get('/api/prueba/falla'));
      expect(respuesta.status, JSON.stringify(propiedades)).toBe(500);
      expect(respuesta.body.error.codigo).toBe('ERROR_INTERNO');
    }
    expect(registro).toHaveBeenCalledTimes(noEsDelLector.length);
  });

  it('una ruta que no existe es un 404 NO_ENCONTRADO con el mismo formato', async () => {
    const app = appConRuta(async () => {});
    for (const ruta of ['/api/no-existe', '/otra-cosa']) {
      const respuesta = await pedir(app, (api) => api.get(ruta));
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
      expect((await pedir(app, (api) => api.get('/api/prueba/falla'))).status).toBe(estado);
    }
  });
});

describe('aFormatoDeError', () => {
  it('arma { error: { codigo, mensaje } } con el código y el mensaje del ErrorApi', () => {
    const aFormatoDeError = require('../src/errors/aFormatoDeError.js');
    const cuerpo = aFormatoDeError(new ErrorApi(409, 'CONFLICTO', 'Ya existe.'));
    expect(cuerpo).toEqual({ error: { codigo: 'CONFLICTO', mensaje: 'Ya existe.' } });
    expect(cuerpo.error).not.toHaveProperty('detalles');
  });

  it('suma los detalles del error solo cuando los hay', () => {
    const aFormatoDeError = require('../src/errors/aFormatoDeError.js');
    const detalles = [{ campo: 'precio', mensaje: 'Falta.' }];
    const cuerpo = aFormatoDeError(new ErrorApi(400, 'DATOS_INVALIDOS', 'Faltan datos.', detalles));
    expect(cuerpo).toEqual({
      error: { codigo: 'DATOS_INVALIDOS', mensaje: 'Faltan datos.', detalles },
    });
  });
});

// Node lee la dirección y las cabeceras antes de que la petición llegue a Express. Con más de 16 KB (su límite) contesta
// un 431 sin cuerpo: ni helmet ni el manejador de errores lo ven, y la API respondería con un sexto estado y fuera del
// formato de error. Estas pruebas abren el servidor con crearServidor, el mismo que arranca servidor.js.
const RELLENO = 'a'.repeat(20_000);

describe('una dirección o unas cabeceras de más de 16 KB (issue #60)', () => {
  const MENSAJE = 'La dirección o las cabeceras de la petición son demasiado grandes.';

  function esElFormatoDeError(respuesta, ruta = '') {
    expect(respuesta.status).toBe(400);
    expect(respuesta.headers['content-type']).toMatch(/^application\/json/);
    expect(respuesta.body).toEqual({ error: { codigo: 'DATOS_INVALIDOS', mensaje: MENSAJE } });
    // El mensaje es el mismo para todos: no repite la dirección ni las cabeceras que mandó el cliente.
    expect(respuesta.text).not.toMatch(/aaaa|secreto/);
    if (ruta) expect(respuesta.text).not.toContain(ruta);
  }

  it.each(['/api/salud', '/api/productos', '/api/ventas', '/api/no-existe', '/fuera-de-api'])(
    'GET %s con una dirección de 20 000 caracteres es un 400 con el formato de error',
    async (ruta) => {
      const respuesta = await pedir(appReal, (api) => api.get(`${ruta}?secreto=${RELLENO}`));
      esElFormatoDeError(respuesta, ruta);
    },
  );

  it('POST /api/ventas con una dirección de más de 16 KB y un cuerpo también es un 400', async () => {
    const respuesta = await pedir(appReal, (api) =>
      api.post(`/api/ventas?secreto=${RELLENO}`).send({ detalles: [] }),
    );
    esElFormatoDeError(respuesta);
  });

  it.each([
    ['un encabezado de 20 000 caracteres', 'X-Relleno', RELLENO],
    ['una cookie de 20 000 caracteres', 'Cookie', `secreto=${RELLENO}`],
  ])('%s también es un 400 con el formato de error', async (_, nombre, valor) => {
    const respuesta = await pedir(appReal, (api) => api.get('/api/salud').set(nombre, valor));
    esElFormatoDeError(respuesta);
  });

  it('bajo el límite, una dirección de 15 000 caracteres llega a la ruta con normalidad', async () => {
    const app = appConRuta(async (req, res) => {
      res.json({ largo: req.originalUrl.length });
    });
    const direccion = `/api/prueba/falla?x=${'a'.repeat(15_000)}`;
    const respuesta = await pedir(app, (api) => api.get(direccion));
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ largo: direccion.length });
  });
});

// Lo mismo, pero leyendo los bytes que contesta el servidor, para lo que supertest no deja ver.
describe('la respuesta cruda a las cabeceras de más de 16 KB (issue #60)', () => {
  const PETICION_LARGA = `GET /api/salud?x=${RELLENO} HTTP/1.1\r\nHost: prueba\r\nConnection: close\r\n\r\n`;

  // Espera a que el cliente vea cerrarse el socket, sin que un ECONNRESET tumbe la prueba.
  function esperarElCierre(socket) {
    socket.on('error', () => {});
    return new Promise((resolver) => socket.on('close', resolver));
  }

  it('dice que cierra la conexión y trae un Content-Length que es el del cuerpo', async () => {
    const servidor = await abrirServidorDePrueba(appReal);
    try {
      const [cabecera, cuerpo] = (await enviarCrudo(servidor, PETICION_LARGA)).split('\r\n\r\n');
      expect(cabecera.split('\r\n')[0]).toBe('HTTP/1.1 400 Bad Request');
      expect(cabecera).toMatch(/^Connection: close$/im);
      expect(cabecera).toMatch(new RegExp(`^Content-Length: ${Buffer.byteLength(cuerpo)}$`, 'im'));
      expect(JSON.parse(cuerpo).error.codigo).toBe('DATOS_INVALIDOS');
    } finally {
      await cerrarServidorDePrueba(servidor);
    }
  });

  it('la API sigue atendiendo después de contestarlo', async () => {
    const servidor = await abrirServidorDePrueba(appReal);
    try {
      await enviarCrudo(servidor, PETICION_LARGA);
      const cruda = await enviarCrudo(
        servidor,
        'GET /api/no-existe HTTP/1.1\r\nHost: prueba\r\nConnection: close\r\n\r\n',
      );
      expect(cruda).toMatch(/^HTTP\/1\.1 404 Not Found/);
    } finally {
      await cerrarServidorDePrueba(servidor);
    }
  });

  it('en una conexión que ya atendió una petición, la siguiente con más de 16 KB recibe el 400', async () => {
    const app = appConRuta(async (req, res) => {
      res.json({ ok: true });
    });
    const servidor = await abrirServidorDePrueba(app);
    const socket = net.connect(servidor.address().port, '127.0.0.1');
    let recibido = '';
    socket.setEncoding('utf8');
    socket.on('data', (trozo) => {
      recibido += trozo;
    });
    const cerrado = esperarElCierre(socket);
    try {
      socket.write('GET /api/prueba/falla HTTP/1.1\r\nHost: prueba\r\n\r\n');
      await vi.waitFor(() => expect(recibido).toContain('{"ok":true}'));
      socket.write(`GET /api/prueba/falla?x=${RELLENO} HTTP/1.1\r\nHost: prueba\r\n\r\n`);
      await cerrado;
      expect(recibido).toMatch(/^HTTP\/1\.1 200 OK[\s\S]*HTTP\/1\.1 400 Bad Request/);
    } finally {
      socket.destroy();
      await cerrarServidorDePrueba(servidor);
    }
  });

  it('si una respuesta ya mandó sus cabeceras, no escribe el 400 en medio de ella: corta como Node', async () => {
    const app = express();
    app.get('/lenta', (req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.write('inicio');
      setTimeout(() => res.end('fin'), 300);
    });
    const servidor = await abrirServidorDePrueba(app);
    const socket = net.connect(servidor.address().port, '127.0.0.1');
    let recibido = '';
    socket.setEncoding('utf8');
    socket.on('data', (trozo) => {
      recibido += trozo;
    });
    const cerrado = esperarElCierre(socket);
    try {
      socket.write('GET /lenta HTTP/1.1\r\nHost: prueba\r\n\r\n');
      await vi.waitFor(() => expect(recibido).toContain('inicio'));
      // La respuesta sigue en curso (falta 'fin') y ya mandó sus cabeceras: un 400 aquí la corrompería.
      socket.write(`GET /lenta?x=${RELLENO} HTTP/1.1\r\nHost: prueba\r\n\r\n`);
      await cerrado;
      expect(recibido).toMatch(/^HTTP\/1\.1 200 OK/);
      expect(recibido).not.toMatch(/400 Bad Request|DATOS_INVALIDOS/);
      expect(recibido).not.toContain('fin');
    } finally {
      socket.destroy();
      await cerrarServidorDePrueba(servidor);
    }
  });
});

// Solo la cabecera de más de 16 KB cambia. Cualquier otro error del cliente lo contesta Node como siempre: sin cuerpo,
// con el estado que él elige. Cada caso se compara con un servidor de Node sin arreglos, byte por byte.
describe('los demás errores del cliente se contestan como los contesta Node (issue #60)', () => {
  const cerrar = 'Connection: close\r\n\r\n';
  it.each([
    ['un método que no existe', `GETT /api/salud HTTP/1.1\r\nHost: prueba\r\n${cerrar}`],
    [
      'una cabecera sin los dos puntos',
      `GET /api/salud HTTP/1.1\r\nHost: prueba\r\nRota\r\n${cerrar}`,
    ],
    ['un espacio en la dirección', `GET /api/sa lud HTTP/1.1\r\nHost: prueba\r\n${cerrar}`],
    ['una versión de HTTP que no existe', `GET /api/salud HTTP/9.9\r\nHost: prueba\r\n${cerrar}`],
  ])('%s', async (_, peticion) => {
    const deNode = http.createServer(appReal).listen(0, '127.0.0.1');
    await once(deNode, 'listening');
    const nuestro = await abrirServidorDePrueba(appReal);
    try {
      const esperada = await enviarCrudo(deNode, peticion);
      // Control: Node sí contesta algo, sin cuerpo, y no es el formato de error de la API.
      expect(esperada).toMatch(/^HTTP\/1\.1 4\d\d [A-Za-z ]+\r\nConnection: close\r\n\r\n$/);
      expect(await enviarCrudo(nuestro, peticion)).toBe(esperada);
    } finally {
      await Promise.all([cerrarServidorDePrueba(deNode), cerrarServidorDePrueba(nuestro)]);
    }
  });
});

describe('crearServidor', () => {
  it('devuelve un servidor de Node que todavía no escucha, para que quien lo pide elija dónde', () => {
    const crearServidor = require('../src/crearServidor.js');
    const servidor = crearServidor(appReal);
    expect(servidor).toBeInstanceOf(http.Server);
    expect(servidor.listening).toBe(false);
  });
});
