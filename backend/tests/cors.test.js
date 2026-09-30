import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { crearApp } = require('../src/app.js');
const { cargarConfig } = require('../src/config.js');

const config = cargarConfig({
  CORS_ORIGIN: 'http://localhost:5173, https://pos.example.com',
  MYSQL_DATABASE: 'aipos',
  MYSQL_USER: 'aipos',
  MYSQL_PASSWORD: 'x',
});
const app = crearApp(config);

describe('CORS', () => {
  it('deja pasar el origen de la pantalla', async () => {
    const respuesta = await request(app).get('/api/salud').set('Origin', 'http://localhost:5173');
    expect(respuesta.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  it('deja pasar cada origen de la lista', async () => {
    const respuesta = await request(app).get('/api/salud').set('Origin', 'https://pos.example.com');
    expect(respuesta.headers['access-control-allow-origin']).toBe('https://pos.example.com');
  });

  it('un origen que no está en la lista no recibe Access-Control-Allow-Origin', async () => {
    const respuesta = await request(app).get('/api/salud').set('Origin', 'http://malo.example');
    expect(respuesta.headers).not.toHaveProperty('access-control-allow-origin');
  });

  it('nunca responde *', async () => {
    const respuesta = await request(app).get('/api/salud').set('Origin', 'http://malo.example');
    expect(respuesta.headers['access-control-allow-origin']).not.toBe('*');
  });

  it('la petición previa (OPTIONS) anuncia solo GET y POST', async () => {
    const respuesta = await request(app)
      .options('/api/salud')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST');
    expect(respuesta.status).toBe(204);
    expect(respuesta.headers['access-control-allow-methods']).toBe('GET,POST');
  });
});
