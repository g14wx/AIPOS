import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { carpetaBackend, correrCli, correrNpm, tablasDeLaBase } from './ayudas.js';

const require = createRequire(import.meta.url);
const sequelize = require('../../src/database.js');

// Necesita MySQL levantado y la base de prueba creada. Estas pruebas deshacen y rehacen las migraciones
// de la base de prueba: al terminar la dejan migrada, como la encontró el globalSetup.
const TIEMPO = 120_000;
const carpetaMigraciones = path.join(carpetaBackend, 'db', 'migrations');
const archivos = fs.readdirSync(carpetaMigraciones).filter((nombre) => !nombre.startsWith('.'));

async function contarEjecutadas() {
  const [filas] = await sequelize.query('SELECT name FROM `SequelizeMeta` ORDER BY name');
  return filas.map((fila) => fila.name);
}

async function tablasSinElRegistro() {
  return (await tablasDeLaBase(sequelize)).filter((nombre) => nombre !== 'SequelizeMeta');
}

describe('los archivos de db/migrations', () => {
  it('son CommonJS, se llaman AAAAMMDDHHMMSS-nombre.js y traen up y down', () => {
    for (const nombre of archivos) {
      expect(nombre, nombre).toMatch(/^\d{14}-[a-z0-9-]+\.c?js$/);
      const migracion = require(path.join(carpetaMigraciones, nombre));
      expect(typeof migracion.up, `${nombre}: up`).toBe('function');
      expect(typeof migracion.down, `${nombre}: down`).toBe('function');
    }
  });

  it('nunca mandan DEFINER=, CREATE OR REPLACE PROCEDURE ni multipleStatements', () => {
    for (const nombre of archivos) {
      const texto = fs.readFileSync(path.join(carpetaMigraciones, nombre), 'utf8');
      expect(texto, nombre).not.toMatch(/DEFINER\s*=/i);
      expect(texto, nombre).not.toMatch(/CREATE\s+OR\s+REPLACE\s+PROCEDURE/i);
      expect(texto, nombre).not.toMatch(/multipleStatements/);
    }
  });

  it('no crean columnas createdAt ni updatedAt: la única fecha es ventas.fecha', () => {
    for (const nombre of archivos) {
      const texto = fs.readFileSync(path.join(carpetaMigraciones, nombre), 'utf8');
      expect(texto, nombre).not.toMatch(/\b(createdAt|updatedAt)\b/);
    }
  });
});

describe('migrar, deshacer y rehacer', () => {
  beforeAll(() => {
    correrCli('db:migrate:undo:all', '--env', 'test');
  }, TIEMPO);

  afterAll(() => {
    correrCli('db:migrate', '--env', 'test');
  }, TIEMPO);

  it(
    'desde cero, migrar:prueba corre todas las migraciones y las anota en SequelizeMeta',
    async () => {
      correrNpm('migrar:prueba');
      const ejecutadas = await contarEjecutadas();
      expect(ejecutadas).toEqual([...archivos].sort());
    },
    TIEMPO,
  );

  it(
    'migrar:prueba otra vez no cambia nada',
    async () => {
      const antes = { tablas: await tablasSinElRegistro(), ejecutadas: await contarEjecutadas() };
      correrNpm('migrar:prueba');
      expect({ tablas: await tablasSinElRegistro(), ejecutadas: await contarEjecutadas() }).toEqual(
        antes,
      );
    },
    TIEMPO,
  );

  it(
    'deshacer:prueba deshace solo la última migración',
    async () => {
      const antes = await contarEjecutadas();
      correrNpm('deshacer:prueba');
      const despues = await contarEjecutadas();
      expect(despues).toEqual(antes.slice(0, Math.max(antes.length - 1, 0)));
      correrNpm('migrar:prueba');
      expect(await contarEjecutadas()).toEqual(antes);
    },
    TIEMPO,
  );

  it(
    'rehacer:prueba deja las mismas tablas y las mismas migraciones que antes',
    async () => {
      const antes = { tablas: await tablasSinElRegistro(), ejecutadas: await contarEjecutadas() };
      correrNpm('rehacer:prueba');
      expect({ tablas: await tablasSinElRegistro(), ejecutadas: await contarEjecutadas() }).toEqual(
        antes,
      );
    },
    TIEMPO,
  );

  it(
    'deshacerlo todo deja la base de prueba sin tablas (solo SequelizeMeta) y se puede migrar otra vez',
    async () => {
      correrCli('db:migrate:undo:all', '--env', 'test');
      expect(await tablasSinElRegistro()).toEqual([]);
      expect(await contarEjecutadas()).toEqual([]);
      correrNpm('migrar:prueba');
      expect(await contarEjecutadas()).toEqual([...archivos].sort());
      correrCli('db:migrate:undo:all', '--env', 'test');
      expect(await tablasSinElRegistro()).toEqual([]);
    },
    TIEMPO,
  );

  it(
    'las migraciones de prueba no tocan la base de desarrollo',
    async () => {
      const [filas] = await sequelize.query(
        'SELECT COUNT(*) AS total FROM information_schema.tables WHERE table_schema = :base AND table_name = :tabla',
        { replacements: { base: process.env.MYSQL_DATABASE, tabla: 'SequelizeMeta' } },
      );
      const antes = Number(filas[0].total);
      correrNpm('rehacer:prueba');
      const [despues] = await sequelize.query(
        'SELECT COUNT(*) AS total FROM information_schema.tables WHERE table_schema = :base AND table_name = :tabla',
        { replacements: { base: process.env.MYSQL_DATABASE, tabla: 'SequelizeMeta' } },
      );
      expect(Number(despues[0].total)).toBe(antes);
    },
    TIEMPO,
  );
});

describe('globalSetup de Vitest', () => {
  async function cargarConfiguracion() {
    const modulo = await import('../../vitest.config.mjs');
    return modulo.default;
  }

  it('vitest.config.mjs declara un globalSetup que existe y corre un archivo a la vez', async () => {
    const { test } = await cargarConfiguracion();
    const entradas = [test.globalSetup].flat().filter(Boolean);
    expect(entradas).toHaveLength(1);
    expect(fs.existsSync(path.resolve(carpetaBackend, entradas[0]))).toBe(true);
    expect(test.fileParallelism).toBe(false);
  });

  it(
    'antes de correr, deja la base de prueba migrada (migrar:prueba)',
    async () => {
      correrCli('db:migrate:undo:all', '--env', 'test');
      const { test } = await cargarConfiguracion();
      const modulo = await import(path.resolve(carpetaBackend, [test.globalSetup].flat()[0]));
      const preparar = modulo.setup ?? modulo.default;
      expect(typeof preparar).toBe('function');
      await preparar();
      expect(await contarEjecutadas()).toEqual([...archivos].sort());
    },
    TIEMPO,
  );

  it('el globalSetup migra con el script migrar:prueba, que solo toca la base de prueba', async () => {
    const { test } = await cargarConfiguracion();
    const texto = fs.readFileSync(
      path.resolve(carpetaBackend, [test.globalSetup].flat()[0]),
      'utf8',
    );
    expect(texto).toContain('migrar:prueba');
  });
});
