import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { createRequire } from 'node:module';
import SwaggerParser from '@apidevtools/swagger-parser';

const require = createRequire(import.meta.url);
const { cargarDocumentacionApi } = require('../../src/documentacion.js');

const archivo = path.resolve(import.meta.dirname, '../../docs/openapi.yaml');

describe('backend/docs/openapi.yaml es un documento OpenAPI 3 válido', () => {
  it('SwaggerParser.validate no lanza error', async () => {
    const documento = await SwaggerParser.validate(archivo);
    expect(documento.openapi).toMatch(/^3\.0\./);
  });

  it('no depende de la red: todos los $ref apuntan dentro del mismo documento', () => {
    const referencias = JSON.stringify(cargarDocumentacionApi()).match(/"\$ref":"[^"]*"/g) ?? [];
    expect(referencias.length).toBeGreaterThan(0);
    for (const referencia of referencias) expect(referencia).toMatch(/"\$ref":"#\//);
  });
});

// Sin estas pruebas no se sabría si el validador de verdad rechaza un documento roto.
describe('el validador no aprueba cualquier cosa: copias rotas a propósito', () => {
  function copiaRota(romper) {
    const copia = structuredClone(cargarDocumentacionApi());
    romper(copia);
    return copia;
  }

  it('rechaza una respuesta sin description', async () => {
    const roto = copiaRota((d) => delete d.paths['/api/salud'].get.responses['200'].description);
    await expect(SwaggerParser.validate(roto)).rejects.toThrow(/description/);
  });

  it('rechaza un $ref que no existe', async () => {
    const roto = copiaRota((d) => {
      d.paths['/api/salud'].get.responses['500'] = { $ref: '#/components/responses/NoExiste' };
    });
    await expect(SwaggerParser.validate(roto)).rejects.toThrow(/NoExiste/);
  });

  it('rechaza un documento sin la versión de OpenAPI', async () => {
    const roto = copiaRota((d) => delete d.openapi);
    await expect(SwaggerParser.validate(roto)).rejects.toThrow();
  });

  it('rechaza un documento sin info', async () => {
    const roto = copiaRota((d) => delete d.info);
    await expect(SwaggerParser.validate(roto)).rejects.toThrow(/info/);
  });
});
