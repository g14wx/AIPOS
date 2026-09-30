import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('GET /api/salud', () => {
  it('responde 200 con { estado: "ok" }', async () => {
    const respuesta = await request(app).get('/api/salud');
    expect(respuesta.status).toBe(200);
    expect(respuesta.headers['content-type']).toMatch(/application\/json/);
    expect(respuesta.body).toEqual({ estado: 'ok' });
  });

  it('no cambia nada: dos llamadas dan lo mismo', async () => {
    const primera = await request(app).get('/api/salud');
    const segunda = await request(app).get('/api/salud');
    expect(segunda.body).toEqual(primera.body);
  });

  it('no acepta POST: responde 404 con el formato de error', async () => {
    const respuesta = await request(app).post('/api/salud').send({});
    expect(respuesta.status).toBe(404);
    expect(respuesta.body.error.codigo).toBe('NO_ENCONTRADO');
  });
});
