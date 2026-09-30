import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const raiz = path.resolve(import.meta.dirname, '../../..');
const backend = path.join(raiz, 'backend');
const src = path.join(backend, 'src');

const leer = (ruta) => fs.readFileSync(ruta, 'utf8');

function archivosJs(carpeta) {
  return fs.readdirSync(carpeta, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = path.join(carpeta, entrada.name);
    if (entrada.isDirectory()) return archivosJs(ruta);
    return ruta.endsWith('.js') ? [ruta] : [];
  });
}

describe('los archivos de la documentación de la API', () => {
  it.each([
    'backend/docs/openapi.yaml',
    'backend/src/documentacion.js',
    'backend/src/routes/docs.js',
    'backend/tests/documentacion/rutas.js',
    'tests/documentacion/glosario-y-alcance.test.sh',
  ])('existe %s', (archivo) => {
    expect(fs.existsSync(path.join(raiz, archivo)), archivo).toBe(true);
  });

  it('backend/docs/ es una carpeta nueva, junto a db/ y src/, y el documento no va en src/', () => {
    for (const carpeta of ['docs', 'db', 'src']) {
      expect(fs.statSync(path.join(backend, carpeta)).isDirectory(), carpeta).toBe(true);
    }
    expect(fs.existsSync(path.join(src, 'docs'))).toBe(false);
    expect(fs.existsSync(path.join(src, 'openapi.yaml'))).toBe(false);
  });

  it('el documento es YAML y no JSON', () => {
    const texto = leer(path.join(backend, 'docs/openapi.yaml'));
    expect(() => JSON.parse(texto)).toThrow();
    expect(texto.trimStart().startsWith('{')).toBe(false);
  });

  it('los textos del documento usan las palabras del glosario, sin "Swagger" a secas', () => {
    const texto = leer(path.join(backend, 'docs/openapi.yaml'));
    expect(texto).not.toMatch(/\bSwagger\b(?! UI)/);
    expect(texto).not.toMatch(/\bdoc de la API\b/i);
  });
});

describe('documentacion.js', () => {
  const { cargarDocumentacionApi } = require('../../src/documentacion.js');

  it('exporta cargarDocumentacionApi', () => {
    expect(typeof cargarDocumentacionApi).toBe('function');
  });

  it('resuelve el archivo con __dirname, para no depender de desde dónde se arranque', () => {
    const codigo = leer(path.join(src, 'documentacion.js'));
    expect(codigo).toContain("path.resolve(__dirname, '../docs/openapi.yaml')");
  });

  it('es el único lugar de src/ que nombra openapi.yaml', () => {
    const quienes = archivosJs(src).filter((ruta) => leer(ruta).includes('openapi.yaml'));
    expect(quienes.map((ruta) => path.relative(src, ruta))).toEqual(['documentacion.js']);
  });

  it('lee el documento aunque se arranque desde otra carpeta', () => {
    const modulo = path.join(src, 'documentacion.js');
    const salida = execFileSync(
      process.execPath,
      ['-e', `console.log(require(${JSON.stringify(modulo)}).cargarDocumentacionApi().openapi)`],
      { cwd: os.tmpdir(), encoding: 'utf8' },
    );
    expect(salida.trim()).toBe('3.0.3');
  });
});

describe('routes/docs.js', () => {
  it('no tiene controller ni servicio: no es un recurso del negocio', () => {
    expect(fs.existsSync(path.join(src, 'controllers/docs.js'))).toBe(false);
    expect(fs.existsSync(path.join(src, 'services/docs.js'))).toBe(false);
    const cargas = [
      ...leer(path.join(src, 'routes/docs.js')).matchAll(/require\(\s*['"]([^'"]+)['"]/g),
    ];
    for (const [, carga] of cargas)
      expect(carga).not.toMatch(/controllers|services|models|sequelize|database/);
  });

  it('es un router de Express', () => {
    const docs = require('../../src/routes/docs.js');
    expect(typeof docs).toBe('function');
    expect(Array.isArray(docs.stack)).toBe(true);
  });
});

describe('no hay una segunda fuente de la verdad', () => {
  it('ningún archivo de src/ trae comentarios @swagger ni usa swagger-jsdoc', () => {
    for (const ruta of archivosJs(src)) {
      const codigo = leer(ruta);
      expect(codigo, ruta).not.toContain('@swagger');
      expect(codigo, ruta).not.toContain('swagger-jsdoc');
    }
  });
});
