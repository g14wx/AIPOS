import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createRequire } from 'node:module';
import {
  compararRutas,
  encontrarRutasFueraDeMontajes,
  listarRutasDocumentadas,
  listarRutasRegistradas,
  mensajesDeLaComparacion,
} from './rutas.js';

// Todo se carga con require, para que la app, `montajes` y el router de docs sean los mismos objetos.
const require = createRequire(import.meta.url);
const { Router } = require('express');
const { crearApp } = require('../../src/app.js');
const { montajes } = require('../../src/routes/index.js');
const docs = require('../../src/routes/docs.js');
const { cargarDocumentacionApi } = require('../../src/documentacion.js');

const documento = cargarDocumentacionApi();
const documentadas = listarRutasDocumentadas(documento);

function routerCon(configurar) {
  const router = Router();
  configurar(router);
  return router;
}

describe('compararRutas', () => {
  it('no ve diferencias cuando las dos listas son iguales', () => {
    const rutas = ['GET /api/salud', 'POST /api/productos'];
    expect(compararRutas(rutas, [...rutas].reverse())).toEqual({ sinDocumentar: [], sinRuta: [] });
  });

  it('pone en sinDocumentar la ruta de Express que el documento no tiene', () => {
    const resultado = compararRutas(['GET /api/salud', 'POST /api/ventas'], ['GET /api/salud']);
    expect(resultado).toEqual({ sinDocumentar: ['POST /api/ventas'], sinRuta: [] });
  });

  it('pone en sinRuta la ruta del documento que Express ya no tiene', () => {
    const resultado = compararRutas(['GET /api/salud'], ['GET /api/salud', 'GET /api/viejo']);
    expect(resultado).toEqual({ sinDocumentar: [], sinRuta: ['GET /api/viejo'] });
  });

  it('el método cuenta: GET y POST de la misma ruta son dos entradas', () => {
    const resultado = compararRutas(
      ['GET /api/productos', 'POST /api/productos'],
      ['GET /api/productos'],
    );
    expect(resultado.sinDocumentar).toEqual(['POST /api/productos']);
  });
});

describe('mensajesDeLaComparacion', () => {
  it('dice qué ruta falta y dónde agregarla', () => {
    const mensajes = mensajesDeLaComparacion({ sinDocumentar: ['POST /api/ventas'], sinRuta: [] });
    expect(mensajes).toEqual([
      'Ruta sin documentar: `POST /api/ventas`. Agrégala a `backend/docs/openapi.yaml`.',
    ]);
  });

  it('dice qué ruta documentada no existe en Express', () => {
    const mensajes = mensajesDeLaComparacion({ sinDocumentar: [], sinRuta: ['GET /api/viejo'] });
    expect(mensajes).toEqual(['Ruta documentada que no existe en Express: `GET /api/viejo`.']);
  });

  it('no dice nada cuando no hay diferencias', () => {
    expect(mensajesDeLaComparacion({ sinDocumentar: [], sinRuta: [] })).toEqual([]);
  });
});

describe('listarRutasRegistradas', () => {
  it('escribe cada ruta como MÉTODO /api/ruta con los parámetros como {id}', () => {
    const router = routerCon((r) => {
      r.get('/', (req, res) => res.end());
      r.post('/', (req, res) => res.end());
      r.get('/:id', (req, res) => res.end());
    });
    const lista = listarRutasRegistradas([{ ruta: '/productos', router }]);
    expect(lista).toEqual(['GET /api/productos', 'GET /api/productos/{id}', 'POST /api/productos']);
  });

  it('las rutas reales de la app son las que dice `montajes`', () => {
    expect(listarRutasRegistradas(montajes)).toContain('GET /api/salud');
  });

  it.each([
    ['un comodín', (r) => r.get('/*resto', (req, res) => res.end())],
    ['un parámetro opcional', (r) => r.get('/buscar{/:id}', (req, res) => res.end())],
    ['una expresión regular', (r) => r.get(/^\/ab+c$/, (req, res) => res.end())],
    ['all()', (r) => r.all('/', (req, res) => res.end())],
  ])('falla con un mensaje claro si una ruta usa %s', (nombre, configurar) => {
    const montajesConRuta = [{ ruta: '/rara', router: routerCon(configurar) }];
    expect(() => listarRutasRegistradas(montajesConRuta)).toThrow(
      /la prueba no la entiende|sintaxis/,
    );
  });

  it('falla si el router tiene algo que no es una ruta', () => {
    const router = routerCon((r) => r.use((req, res, next) => next()));
    expect(() => listarRutasRegistradas([{ ruta: '/rara', router }])).toThrow(/no es una ruta/);
  });
});

// Sin estas pruebas no se sabría si la comparación de verdad falla cuando debe.
describe('la comparación se prueba a sí misma con apps falsas', () => {
  it('una ruta de Express que el documento no tiene sale en sinDocumentar', async () => {
    const extra = routerCon((r) => r.get('/', (req, res) => res.json({ extra: true })));
    const montajesFalsos = [...montajes, { ruta: '/extra', router: extra }];
    const app = crearApp(undefined, { montajes: montajesFalsos });

    expect((await request(app).get('/api/extra')).status).toBe(200);
    expect(encontrarRutasFueraDeMontajes(app, montajesFalsos, docs)).toEqual([]);

    const resultado = compararRutas(listarRutasRegistradas(montajesFalsos), documentadas);
    expect(resultado).toEqual({ sinDocumentar: ['GET /api/extra'], sinRuta: [] });
    expect(mensajesDeLaComparacion(resultado)).toEqual([
      'Ruta sin documentar: `GET /api/extra`. Agrégala a `backend/docs/openapi.yaml`.',
    ]);
  });

  it('una ruta del documento que Express no tiene sale en sinRuta', async () => {
    const sinSalud = montajes.filter((montaje) => montaje.ruta !== '/salud');
    const app = crearApp(undefined, { montajes: sinSalud });

    expect((await request(app).get('/api/salud')).status).toBe(404);

    const resultado = compararRutas(listarRutasRegistradas(sinSalud), documentadas);
    expect(resultado.sinDocumentar).toEqual([]);
    expect(resultado.sinRuta).toContain('GET /api/salud');
    expect(mensajesDeLaComparacion(resultado)).toContain(
      'Ruta documentada que no existe en Express: `GET /api/salud`.',
    );
  });

  it('una ruta puesta en la app real, como está hoy, no tiene diferencias', () => {
    const app = crearApp(undefined, { montajes });
    expect(compararRutas(listarRutasRegistradas(montajes), documentadas)).toEqual({
      sinDocumentar: [],
      sinRuta: [],
    });
    expect(encontrarRutasFueraDeMontajes(app, montajes, docs)).toEqual([]);
  });
});
