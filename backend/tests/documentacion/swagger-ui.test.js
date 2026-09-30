import { describe, it, expect, vi, afterEach, afterAll } from 'vitest';
import { pedir } from '../servidor-de-prueba.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const app = require('../../src/app.js');
const { cargarDocumentacionApi } = require('../../src/documentacion.js');

afterEach(() => vi.restoreAllMocks());

describe('Swagger UI en GET /api/docs/', () => {
  it('muestra la página de Swagger UI con el título "API de AIPOS"', async () => {
    const respuesta = await pedir(app, (api) => api.get('/api/docs/'));
    expect(respuesta.status).toBe(200);
    expect(respuesta.headers['content-type']).toMatch(/text\/html/);
    expect(respuesta.text).toContain('<title>API de AIPOS</title>');
    expect(respuesta.text).toContain('swagger-ui');
  });

  it('el JavaScript de arranque trae la documentación con GET /api/salud', async () => {
    const respuesta = await pedir(app, (api) => api.get('/api/docs/swagger-ui-init.js'));
    expect(respuesta.status).toBe(200);
    expect(respuesta.headers['content-type']).toMatch(/javascript/);
    expect(respuesta.text).toContain('"/api/salud"');
    expect(respuesta.text).toContain('"operationId": "consultarSalud"');
  });

  it('apaga el validador en línea: la página no llama a un servicio externo', async () => {
    const respuesta = await pedir(app, (api) => api.get('/api/docs/swagger-ui-init.js'));
    expect(respuesta.text).toMatch(/"validatorUrl":\s*null/);
    expect(respuesta.text).not.toMatch(/validator\.swagger\.io/);
  });

  it('sirve los archivos de Swagger UI: CSS y JavaScript', async () => {
    const css = await pedir(app, (api) => api.get('/api/docs/swagger-ui.css'));
    expect(css.status).toBe(200);
    expect(css.headers['content-type']).toMatch(/text\/css/);
    const js = await pedir(app, (api) => api.get('/api/docs/swagger-ui-bundle.js'));
    expect(js.status).toBe(200);
    expect(js.headers['content-type']).toMatch(/javascript/);
  });

  it('va después de helmet: la página lleva las cabeceras de seguridad', async () => {
    const respuesta = await pedir(app, (api) => api.get('/api/docs/'));
    expect(respuesta.headers['x-content-type-options']).toBe('nosniff');
    expect(respuesta.headers).not.toHaveProperty('x-powered-by');
  });
});

describe('lo que no es GET /api/docs/ sigue el camino de una ruta que no existe', () => {
  it('GET /api/docs sin la barra final responde 301 hacia /api/docs/', async () => {
    const respuesta = await pedir(app, (api) => api.get('/api/docs'));
    expect(respuesta.status).toBe(301);
    expect(respuesta.headers.location).toBe('/api/docs/');
  });

  it('POST /api/docs/ responde 404 NO_ENCONTRADO con el formato de error', async () => {
    const respuesta = await pedir(app, (api) => api.post('/api/docs/').send({}));
    expect(respuesta.status).toBe(404);
    expect(respuesta.body).toEqual({
      error: { codigo: 'NO_ENCONTRADO', mensaje: 'La ruta no existe.' },
    });
  });

  it('GET /api/docs/nada responde 404 NO_ENCONTRADO con el formato de error', async () => {
    const respuesta = await pedir(app, (api) => api.get('/api/docs/nada'));
    expect(respuesta.status).toBe(404);
    expect(respuesta.headers['content-type']).toMatch(/application\/json/);
    expect(respuesta.body.error.codigo).toBe('NO_ENCONTRADO');
  });
});

describe('el documento se lee una vez, al arrancar', () => {
  it('pedir la página varias veces no vuelve a abrir openapi.yaml', async () => {
    const lectura = vi.spyOn(fs, 'readFileSync');
    for (const ruta of ['/api/docs/', '/api/docs/swagger-ui-init.js', '/api/docs/']) {
      await pedir(app, (api) => api.get(ruta));
    }
    const delDocumento = lectura.mock.calls.filter(([ruta]) =>
      String(ruta).endsWith('openapi.yaml'),
    );
    expect(delDocumento).toHaveLength(0);
  });

  it('cargarDocumentacionApi lee backend/docs/openapi.yaml y devuelve el documento', () => {
    const documento = cargarDocumentacionApi();
    expect(documento.openapi).toBe('3.0.3');
    expect(documento.paths).toHaveProperty('/api/salud');
  });

  describe('si el archivo falla, el mensaje nombra el archivo', () => {
    const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), 'aipos-docs-'));
    afterAll(() => fs.rmSync(carpeta, { recursive: true, force: true }));

    it('no existe', () => {
      const ruta = path.join(carpeta, 'no-existe', 'openapi.yaml');
      expect(() => cargarDocumentacionApi(ruta)).toThrow(/openapi\.yaml/);
    });

    it('no es YAML', () => {
      const ruta = path.join(carpeta, 'openapi.yaml');
      fs.writeFileSync(ruta, 'paths: [esto no cierra\n  otra: cosa: mala\n');
      expect(() => cargarDocumentacionApi(ruta)).toThrow(/openapi\.yaml/);
    });

    it('es YAML pero no es un documento (no es un objeto)', () => {
      const ruta = path.join(carpeta, 'openapi.yaml');
      fs.writeFileSync(ruta, '- uno\n- dos\n');
      expect(() => cargarDocumentacionApi(ruta)).toThrow(/openapi\.yaml/);
    });
  });
});

describe('la página de demostración de swagger-ui-dist no se sirve', () => {
  it.each([
    '/api/docs/index.html',
    '/api/docs/swagger-initializer.js',
    '/api/docs/oauth2-redirect.html',
  ])('GET %s responde 404 NO_ENCONTRADO con el formato de error', async (ruta) => {
    const respuesta = await pedir(app, (api) => api.get(ruta));
    expect(respuesta.status).toBe(404);
    expect(respuesta.headers['content-type']).toMatch(/application\/json/);
    expect(respuesta.body.error.codigo).toBe('NO_ENCONTRADO');
  });

  it('cada archivo que pide la página de AIPOS sigue respondiendo 200', async () => {
    const pagina = await pedir(app, (api) => api.get('/api/docs/'));
    const archivos = [...pagina.text.matchAll(/(?:href|src)="\.\/([^"]+)"/g)].map((m) => m[1]);
    expect(archivos).toEqual(expect.arrayContaining(['swagger-ui.css', 'swagger-ui-init.js']));
    for (const archivo of archivos) {
      const respuesta = await pedir(app, (api) => api.get(`/api/docs/${archivo}`));
      expect(respuesta.status, archivo).toBe(200);
    }
  });

  it('la página de AIPOS no menciona la página de demostración ni el documento Petstore', async () => {
    const pagina = await pedir(app, (api) => api.get('/api/docs/'));
    const inicio = await pedir(app, (api) => api.get('/api/docs/swagger-ui-init.js'));
    for (const texto of [pagina.text, inicio.text]) {
      expect(texto).not.toMatch(/petstore|swagger-initializer|index\.html/i);
    }
  });
});
