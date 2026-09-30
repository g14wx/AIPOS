import { describe, it, expect, afterEach, vi } from 'vitest';
import request from 'supertest';
import net from 'node:net';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { carpetaBackend } from './ayudas.js';

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
