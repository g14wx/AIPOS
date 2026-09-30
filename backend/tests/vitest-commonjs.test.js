import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createRequire } from 'node:module';
import app from '../src/app.js';

const require = createRequire(import.meta.url);

// Tapa la trampa de S-01: Vitest 5 corre pruebas de un backend en CommonJS,
// se cargue con `import` o con `require`.
describe('Vitest con el backend en CommonJS', () => {
  it('carga la app con import y pide /api/salud', async () => {
    const respuesta = await request(app).get('/api/salud');
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ estado: 'ok' });
  });

  it('carga la app con require y pide /api/salud', async () => {
    const appConRequire = require('../src/app.js');
    const respuesta = await request(appConRequire).get('/api/salud');
    expect(respuesta.status).toBe(200);
  });

  it('las dos formas dan una app de Express con crearApp', () => {
    // Vitest carga el import con su propio cargador y require con el de Node: no son el mismo objeto.
    for (const carga of [app, require('../src/app.js')]) {
      expect(typeof carga).toBe('function');
      expect(typeof carga.crearApp).toBe('function');
    }
  });
});
