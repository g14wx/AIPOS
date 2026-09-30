import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
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
const app = require('../../src/app.js');
const { montajes } = require('../../src/routes/index.js');
const docs = require('../../src/routes/docs.js');
const { cargarDocumentacionApi } = require('../../src/documentacion.js');

const { crearApp } = app;
const carpetaDeRutas = path.resolve(import.meta.dirname, '../../src/routes');

function routerDeLaApi(laApp) {
  return laApp.router.stack.find((capa) => Array.isArray(capa.handle?.stack)).handle;
}

describe('las rutas de Express y las de la documentación de la API son las mismas', () => {
  const documentadas = listarRutasDocumentadas(cargarDocumentacionApi());

  it('cada ruta de Express está documentada y cada ruta documentada existe', () => {
    const resultado = compararRutas(listarRutasRegistradas(montajes), documentadas);
    const mensajes = mensajesDeLaComparacion(resultado);
    expect(mensajes, mensajes.join('\n')).toEqual([]);
  });

  it('la página /api/docs no se documenta a sí misma: es la única excepción', () => {
    expect(documentadas.filter((ruta) => /\s\/api\/docs(\/|$)/.test(ruta))).toEqual([]);
    expect(routerDeLaApi(app).stack.map((capa) => capa.handle)).toContain(docs);
    expect(montajes.map((montaje) => montaje.router)).not.toContain(docs);
  });

  it('cada archivo de src/routes, salvo index.js y docs.js, está en montajes', () => {
    const montados = montajes.map((montaje) => montaje.router);
    const archivos = fs
      .readdirSync(carpetaDeRutas)
      .filter((archivo) => archivo.endsWith('.js') && !['index.js', 'docs.js'].includes(archivo));
    expect(archivos.length).toBeGreaterThan(0);
    for (const archivo of archivos) {
      expect(montados, `${archivo} no está en montajes`).toContain(
        require(path.join(carpetaDeRutas, archivo)),
      );
    }
  });
});

describe('una ruta registrada por fuera de montajes rompe la prueba', () => {
  it('la app real no tiene rutas ni routers fuera de montajes', () => {
    const problemas = encontrarRutasFueraDeMontajes(app, montajes, docs);
    expect(problemas, problemas.join('\n')).toEqual([]);
  });

  it('falla si una ruta se registra directo en app', () => {
    const laApp = crearApp(undefined, { montajes });
    laApp.get('/api/atajo', (req, res) => res.end());
    const problemas = encontrarRutasFueraDeMontajes(laApp, montajes, docs);
    expect(problemas).toHaveLength(1);
    expect(problemas[0]).toMatch(/Ruta registrada directo en app: la ruta GET \/api\/atajo/);
  });

  it('falla si una ruta se registra directo en el router de /api', () => {
    const laApp = crearApp(undefined, { montajes });
    routerDeLaApi(laApp).get('/atajo', (req, res) => res.end());
    const problemas = encontrarRutasFueraDeMontajes(laApp, montajes, docs);
    expect(problemas).toHaveLength(1);
    expect(problemas[0]).toMatch(/router de \/api tiene la ruta GET \/atajo fuera de montajes/);
  });

  it('falla si la app monta otro router además del de /api', () => {
    const laApp = crearApp(undefined, { montajes });
    const otro = Router();
    otro.get('/', (req, res) => res.end());
    laApp.use('/otro', otro);
    const problemas = encontrarRutasFueraDeMontajes(laApp, montajes, docs);
    expect(problemas.join('\n')).toMatch(/app monta 2 routers y solo puede montar el de \/api/);
  });

  it('falla si el router de /api tiene un middleware suelto', () => {
    const laApp = crearApp(undefined, { montajes });
    routerDeLaApi(laApp).use(function sueltoEnLaApi(req, res, next) {
      next();
    });
    const problemas = encontrarRutasFueraDeMontajes(laApp, montajes, docs);
    expect(problemas.join('\n')).toMatch(/sueltoEnLaApi fuera de montajes/);
  });
});
