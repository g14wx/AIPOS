import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { crearApp } = require('../src/app.js');
const express = require('express');

// Una ruta de mentira que devuelve el cuerpo, para probar el límite sin depender de una ruta real.
const eco = express.Router();
eco.post('/', (req, res) => res.json({ recibido: req.body }));
const app = crearApp(undefined, { montajes: [{ ruta: '/eco', router: eco }] });

describe('límite del cuerpo JSON (100kb)', () => {
  it('acepta un cuerpo chico', async () => {
    const respuesta = await request(app).post('/api/eco').send({ hola: 'mundo' });
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ recibido: { hola: 'mundo' } });
  });

  it('acepta un cuerpo de 90kb', async () => {
    const respuesta = await request(app)
      .post('/api/eco')
      .send({ texto: 'a'.repeat(90 * 1024) });
    expect(respuesta.status).toBe(200);
  });

  it('un cuerpo de más de 100kb es un 400 CUERPO_MUY_GRANDE', async () => {
    const respuesta = await request(app)
      .post('/api/eco')
      .send({ texto: 'a'.repeat(101 * 1024) });
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error.codigo).toBe('CUERPO_MUY_GRANDE');
    expect(typeof respuesta.body.error.mensaje).toBe('string');
  });

  it('un JSON mal escrito es un 400 JSON_INVALIDO', async () => {
    const respuesta = await request(app)
      .post('/api/eco')
      .set('Content-Type', 'application/json')
      .send('{"hola": ');
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error.codigo).toBe('JSON_INVALIDO');
  });
});
