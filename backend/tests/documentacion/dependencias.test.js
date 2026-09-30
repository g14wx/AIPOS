import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const backend = path.resolve(import.meta.dirname, '../..');
const leerJson = (...partes) => JSON.parse(fs.readFileSync(path.join(backend, ...partes), 'utf8'));
const paquete = leerJson('package.json');
const lock = leerJson('package-lock.json');

// La tabla de "Dependencias" de la spec de documentación de la API.
const EN_DEPENDENCIES = {
  'swagger-ui-express': '5.0.1',
  'swagger-ui-dist': '5.33.0',
  yaml: '2.9.1',
};
const EN_DEV_DEPENDENCIES = { '@apidevtools/swagger-parser': '13.1.0' };

describe('package.json', () => {
  it('lleva swagger-ui-express, swagger-ui-dist y yaml en dependencies, con versión fija', () => {
    for (const [nombre, version] of Object.entries(EN_DEPENDENCIES)) {
      expect(paquete.dependencies[nombre], nombre).toBe(version);
    }
  });

  it('lleva @apidevtools/swagger-parser en devDependencies, con versión fija', () => {
    for (const [nombre, version] of Object.entries(EN_DEV_DEPENDENCIES)) {
      expect(paquete.devDependencies[nombre], nombre).toBe(version);
      expect(paquete.dependencies).not.toHaveProperty(nombre);
    }
  });

  it('apaga las estadísticas de instalación de @scarf/scarf', () => {
    expect(paquete.scarfSettings).toEqual({ enabled: false });
  });

  it('no usa swagger-jsdoc: el documento es la única fuente', () => {
    const todas = { ...paquete.dependencies, ...paquete.devDependencies };
    expect(Object.keys(todas)).not.toContain('swagger-jsdoc');
  });
});

describe('package-lock.json', () => {
  it('fija las mismas versiones', () => {
    for (const [nombre, version] of Object.entries({
      ...EN_DEPENDENCIES,
      ...EN_DEV_DEPENDENCIES,
    })) {
      expect(lock.packages[`node_modules/${nombre}`]?.version, nombre).toBe(version);
    }
  });

  it('tiene una sola copia de swagger-ui-dist, la que fija package.json', () => {
    const copias = Object.keys(lock.packages).filter((ruta) => ruta.endsWith('swagger-ui-dist'));
    expect(copias).toEqual(['node_modules/swagger-ui-dist']);
  });
});

describe('después de npm ci', () => {
  it('quedan instaladas las versiones de la spec', () => {
    for (const [nombre, version] of Object.entries({
      ...EN_DEPENDENCIES,
      ...EN_DEV_DEPENDENCIES,
    })) {
      const instalado = leerJson('node_modules', ...nombre.split('/'), 'package.json');
      expect(instalado.version, nombre).toBe(version);
    }
  });
});
