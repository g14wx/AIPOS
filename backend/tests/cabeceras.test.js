import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('cabeceras de seguridad (helmet)', () => {
  it('quita X-Powered-By', async () => {
    const respuesta = await request(app).get('/api/salud');
    expect(respuesta.headers).not.toHaveProperty('x-powered-by');
  });

  it('pone las cabeceras de seguridad estándar', async () => {
    const respuesta = await request(app).get('/api/salud');
    expect(respuesta.headers['x-content-type-options']).toBe('nosniff');
    expect(respuesta.headers).toHaveProperty('content-security-policy');
    expect(respuesta.headers).toHaveProperty('strict-transport-security');
  });

  it('también las pone en un error 404', async () => {
    const respuesta = await request(app).get('/api/no-existe');
    expect(respuesta.status).toBe(404);
    expect(respuesta.headers['x-content-type-options']).toBe('nosniff');
  });
});
