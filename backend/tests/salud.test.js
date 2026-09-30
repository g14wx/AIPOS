import { describe, it, expect } from 'vitest';
import { pedir } from './servidor-de-prueba.js';
import app from '../src/app.js';

describe('GET /api/salud', () => {
  // Desde B-03 la respuesta suma baseDeDatos: "ok" (ver base-de-datos/salud-con-base.test.js) y npm test necesita MySQL.
  it('responde 200 con { estado: "ok", baseDeDatos: "ok" }', async () => {
    const respuesta = await pedir(app, (api) => api.get('/api/salud'));
    expect(respuesta.status).toBe(200);
    expect(respuesta.headers['content-type']).toMatch(/application\/json/);
    expect(respuesta.body).toEqual({ estado: 'ok', baseDeDatos: 'ok' });
  });

  it('no cambia nada: dos llamadas dan lo mismo', async () => {
    const primera = await pedir(app, (api) => api.get('/api/salud'));
    const segunda = await pedir(app, (api) => api.get('/api/salud'));
    expect(segunda.body).toEqual(primera.body);
  });

  it('no acepta POST: responde 404 con el formato de error', async () => {
    const respuesta = await pedir(app, (api) => api.post('/api/salud').send({}));
    expect(respuesta.status).toBe(404);
    expect(respuesta.body.error.codigo).toBe('NO_ENCONTRADO');
  });
});
