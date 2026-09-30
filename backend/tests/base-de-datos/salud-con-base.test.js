import { describe, it, expect, afterEach, vi } from 'vitest';
import request from 'supertest';
import net from 'node:net';
import { execFile, execFileSync, spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { promisify } from 'node:util';
import { createRequire } from 'node:module';
import { carpetaBackend, crearProxyCongelable } from './ayudas.js';

const require = createRequire(import.meta.url);
const sequelize = require('../../src/database.js');
const app = require('../../src/app.js');

// GET /api/salud con MySQL arriba (necesita MySQL levantado) y con MySQL abajo.
afterEach(() => {
  vi.restoreAllMocks();
});

describe('GET /api/salud con la base de datos arriba', () => {
  it('responde 200 con { estado: "ok", baseDeDatos: "ok" }', async () => {
    const respuesta = await request(app).get('/api/salud');
    expect(respuesta.status).toBe(200);
    expect(respuesta.headers['content-type']).toMatch(/application\/json/);
    expect(respuesta.body).toEqual({ estado: 'ok', baseDeDatos: 'ok' });
  });

  it('pregunta a MySQL con sequelize.authenticate() en cada llamada', async () => {
    const espia = vi.spyOn(sequelize, 'authenticate');
    await request(app).get('/api/salud');
    await request(app).get('/api/salud');
    expect(espia).toHaveBeenCalledTimes(2);
  });

  it('no pide nada en la petición: un parámetro de más no cambia la respuesta', async () => {
    const respuesta = await request(app).get('/api/salud?baseDeDatos=falla&x=1');
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ estado: 'ok', baseDeDatos: 'ok' });
  });

  it('no cambia nada en la base: dos llamadas dan lo mismo y no crean tablas', async () => {
    const [antes] = await sequelize.query('SHOW TABLES');
    const primera = await request(app).get('/api/salud');
    const segunda = await request(app).get('/api/salud');
    const [despues] = await sequelize.query('SHOW TABLES');
    expect(segunda.body).toEqual(primera.body);
    expect(despues).toEqual(antes);
  });
});

describe('GET /api/salud con la base de datos abajo', () => {
  it('si authenticate() falla, responde 500 con el formato de error y sin detalles internos', async () => {
    const fallo = Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:3306'), {
      code: 'ECONNREFUSED',
    });
    vi.spyOn(sequelize, 'authenticate').mockRejectedValue(fallo);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const respuesta = await request(app).get('/api/salud');
    expect(respuesta.status).toBe(500);
    expect(respuesta.headers['content-type']).toMatch(/application\/json/);
    expect(respuesta.body).toEqual({
      error: { codigo: 'ERROR_INTERNO', mensaje: expect.any(String) },
    });
    expect(JSON.stringify(respuesta.body)).not.toMatch(/ECONNREFUSED|127\.0\.0\.1|3306/);
  });

  it('no inventa un estado nuevo: la respuesta caída no lleva estado ni baseDeDatos', async () => {
    vi.spyOn(sequelize, 'authenticate').mockRejectedValue(new Error('caída'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const respuesta = await request(app).get('/api/salud');
    expect(respuesta.body).not.toHaveProperty('estado');
    expect(respuesta.body).not.toHaveProperty('baseDeDatos');
  });

  it('con un MySQL que de verdad no está en ese puerto, responde 500 y la API sigue viva', async () => {
    const puertoLibre = await new Promise((resolve) => {
      const servidor = net.createServer();
      servidor.listen(0, '127.0.0.1', () => {
        const { port } = servidor.address();
        servidor.close(() => resolve(port));
      });
    });
    // Un proceso aparte, con MYSQL_PORT apuntando a un puerto donde no escucha nadie.
    const programa = `
      const request = require('supertest');
      const app = require('./src/app.js');
      const sequelize = require('./src/database.js');
      (async () => {
        const respuesta = await request(app).get('/api/salud');
        const noExiste = await request(app).get('/api/no-existe');
        console.log(JSON.stringify({ estado: respuesta.status, cuerpo: respuesta.body, otra: noExiste.status }));
        await sequelize.close();
      })();
    `;
    const salida = execFileSync('node', ['-e', programa], {
      cwd: carpetaBackend,
      env: { ...process.env, MYSQL_HOST: '127.0.0.1', MYSQL_PORT: String(puertoLibre) },
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const resultado = JSON.parse(salida.trim().split('\n').pop());
    expect(resultado.estado).toBe(500);
    expect(resultado.cuerpo.error.codigo).toBe('ERROR_INTERNO');
    expect(JSON.stringify(resultado.cuerpo)).not.toContain(String(puertoLibre));
    expect(resultado.otra).toBe(404);
  }, 30_000);
});

// Issue #39: con MySQL congelado (acepta la conexión pero no contesta), authenticate() esperaba sin fin
// y GET /api/salud se quedaba colgada. Ahora espera lo justo y responde 500.
describe('GET /api/salud si MySQL acepta la conexión pero no contesta', () => {
  const { consultarSalud } = require('../../src/services/salud.js');
  const correr = promisify(execFile);

  afterEach(() => {
    vi.useRealTimers();
  });

  it('consultarSalud rechaza cuando pasa el tiempo que se le da, en vez de esperar sin fin', async () => {
    vi.spyOn(sequelize, 'authenticate').mockReturnValue(new Promise(() => {}));
    const inicio = Date.now();
    await expect(consultarSalud(50)).rejects.toThrow(/no contest/i);
    expect(Date.now() - inicio).toBeLessThan(2000);
  }, 5_000);

  it('cuando MySQL contesta a tiempo no deja un temporizador pendiente', async () => {
    vi.useFakeTimers();
    vi.spyOn(sequelize, 'authenticate').mockResolvedValue(undefined);
    await expect(consultarSalud()).resolves.toEqual({ estado: 'ok', baseDeDatos: 'ok' });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('con un MySQL callado de verdad, responde 500 en pocos segundos y la API sigue viva', async () => {
    // Un servidor TCP que acepta la conexión y no escribe nada: para el cliente es un MySQL congelado.
    const conexiones = [];
    const callado = net.createServer((socket) => conexiones.push(socket));
    const puerto = await new Promise((resolve) => {
      callado.listen(0, '127.0.0.1', () => resolve(callado.address().port));
    });
    const programa = `
      const request = require('supertest');
      const app = require('./src/app.js');
      (async () => {
        const inicio = Date.now();
        const respuesta = await request(app).get('/api/salud');
        const milisegundos = Date.now() - inicio;
        const otra = await request(app).get('/api/no-existe');
        console.log(JSON.stringify({ estado: respuesta.status, cuerpo: respuesta.body, milisegundos, otra: otra.status }));
        process.exit(0);
      })();
    `;
    try {
      const { stdout } = await correr('node', ['-e', programa], {
        cwd: carpetaBackend,
        env: { ...process.env, MYSQL_HOST: '127.0.0.1', MYSQL_PORT: String(puerto) },
        encoding: 'utf8',
        timeout: 25_000,
      });
      const resultado = JSON.parse(stdout.trim().split('\n').pop());
      expect(resultado.estado).toBe(500);
      expect(resultado.cuerpo.error.codigo).toBe('ERROR_INTERNO');
      expect(JSON.stringify(resultado.cuerpo)).not.toContain(String(puerto));
      expect(resultado.milisegundos).toBeLessThan(6000);
      expect(resultado.otra).toBe(404);
    } finally {
      conexiones.forEach((socket) => socket.destroy());
      callado.close();
    }
  }, 30_000);

  // Issue #54: al vencer el tope, la API respondía 500 pero la consulta seguía pendiente y su conexión
  // ocupada. Aquí la API abre su conexión con MySQL a través de un intermediario que después se congela:
  // la segunda petición usa esa conexión abierta y MySQL no contesta.
  it('con la conexión ya abierta y MySQL congelado, corta la consulta y libera la conexión del pool', async () => {
    const proxy = await crearProxyCongelable(sequelize.config.host, Number(sequelize.config.port));
    const programa = `
      const request = require('supertest');
      const readline = require('node:readline');
      const app = require('./src/app.js');
      const sequelize = require('./src/database.js');
      const escribir = (objeto) => console.log(JSON.stringify(objeto));
      const esperarOrden = () => new Promise((resolve) => {
        const lector = readline.createInterface({ input: process.stdin });
        lector.once('line', () => { lector.close(); resolve(); });
      });
      (async () => {
        const primera = await request(app).get('/api/salud');
        escribir({ fase: 'abierta', estado: primera.status });
        await esperarOrden();
        const inicio = Date.now();
        const segunda = await request(app).get('/api/salud');
        const milisegundos = Date.now() - inicio;
        await new Promise((resolve) => setTimeout(resolve, 500));
        const enUso = sequelize.connectionManager.pool.using;
        escribir({ fase: 'fin', estado: segunda.status, milisegundos, enUso });
        await sequelize.close();
      })();
    `;
    const hijo = spawn('node', ['-e', programa], {
      cwd: carpetaBackend,
      env: { ...process.env, MYSQL_HOST: '127.0.0.1', MYSQL_PORT: String(proxy.puerto) },
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    hijo.stdin.on('error', () => {});
    const hijoTermino = new Promise((resolve) =>
      hijo.once('exit', (codigo, senal) => resolve({ codigo, senal })),
    );
    const lineas = createInterface({ input: hijo.stdout })[Symbol.asyncIterator]();
    const siguienteMensaje = async () => {
      for (;;) {
        const { value, done } = await lineas.next();
        if (done) throw new Error('El programa hijo cerró su salida antes de tiempo.');
        if (value.startsWith('{')) return JSON.parse(value);
      }
    };
    let plazo;
    try {
      expect(await siguienteMensaje()).toEqual({ fase: 'abierta', estado: 200 });
      proxy.congelar();
      hijo.stdin.write('seguir\n');
      const resultado = await siguienteMensaje();
      expect(resultado.estado).toBe(500);
      // Respondió el tope de 3 s, no un fallo rápido.
      expect(resultado.milisegundos).toBeGreaterThanOrEqual(2900);
      // La consulta de salud ya no ocupa una conexión del pool.
      expect(resultado.enUso).toBe(0);
      // Sin consultas colgadas, sequelize.close() termina y el programa se cierra solo (sin process.exit).
      const seColgo = new Promise((resolve) => {
        plazo = setTimeout(() => resolve('colgado'), 10_000);
      });
      expect(await Promise.race([hijoTermino, seColgo])).toEqual({ codigo: 0, senal: null });
    } finally {
      clearTimeout(plazo);
      hijo.kill('SIGKILL');
      await proxy.cerrar();
    }
  }, 30_000);
});
