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
const archivo = fs
  .readdirSync(carpetaMigraciones)
  .find((nombre) => /^\d{14}-crear-productos\.c?js$/.test(nombre));

// Lo que MySQL dice de la tabla productos, leído de information_schema.
async function leer(sql) {
  const [filas] = await sequelize.query(sql);
  return filas;
}

const columnas = () =>
  leer(`SELECT column_name AS nombre, column_type AS tipo, is_nullable AS admiteNulo, extra,
               column_key AS llave, character_set_name AS juego, collation_name AS orden
          FROM information_schema.columns
         WHERE table_schema = DATABASE() AND table_name = 'productos'
         ORDER BY ordinal_position`);

const indices = () =>
  leer(`SELECT index_name AS nombre, non_unique AS noEsUnico, seq_in_index AS posicion,
               column_name AS columna
          FROM information_schema.statistics
         WHERE table_schema = DATABASE() AND table_name = 'productos'
         ORDER BY index_name, seq_in_index`);

const restriccionesCheck = () =>
  leer(`SELECT tc.constraint_name AS nombre, tc.enforced AS activa, cc.check_clause AS clausula
          FROM information_schema.table_constraints tc
          JOIN information_schema.check_constraints cc
            ON cc.constraint_schema = tc.constraint_schema AND cc.constraint_name = tc.constraint_name
         WHERE tc.table_schema = DATABASE() AND tc.table_name = 'productos'
           AND tc.constraint_type = 'CHECK'
         ORDER BY tc.constraint_name`);

const tabla = async () =>
  (
    await leer(`SELECT engine AS motor, table_collation AS orden
                  FROM information_schema.tables
                 WHERE table_schema = DATABASE() AND table_name = 'productos'`)
  )[0];

describe('el archivo de la migración de productos', () => {
  it('existe db/migrations/AAAAMMDDHHMMSS-crear-productos.js, es CommonJS y trae up y down', () => {
    expect(archivo, 'falta db/migrations/AAAAMMDDHHMMSS-crear-productos.js').toBeDefined();
    const migracion = require(path.join(carpetaMigraciones, archivo));
    expect(typeof migracion.up).toBe('function');
    expect(typeof migracion.down).toBe('function');
  });

  it('dice de forma explícita el motor, el juego de caracteres y el orden (no los hereda de la base)', () => {
    expect(archivo, 'falta la migración crear-productos').toBeDefined();
    const texto = fs.readFileSync(path.join(carpetaMigraciones, archivo), 'utf8');
    expect(texto).toContain('InnoDB');
    expect(texto).toMatch(/utf8mb4(?!_)/);
    expect(texto).toContain('utf8mb4_0900_ai_ci');
  });
});

describe('la tabla productos después de migrar', () => {
  beforeAll(() => {
    correrCli('db:migrate:undo:all', '--env', 'test');
  }, TIEMPO);

  afterAll(() => {
    correrCli('db:migrate', '--env', 'test');
  }, TIEMPO);

  it(
    'rehacer:prueba y después migrar:prueba terminan sin errores y dejan la tabla productos',
    async () => {
      correrNpm('rehacer:prueba');
      correrNpm('migrar:prueba');
      expect(await tablasDeLaBase(sequelize)).toContain('productos');
    },
    TIEMPO,
  );

  it('tiene id, nombre, precio y codigo_barras, en ese orden, sin created_at ni updated_at', async () => {
    const encontradas = await columnas();
    expect(encontradas.map((columna) => columna.nombre)).toEqual([
      'id',
      'nombre',
      'precio',
      'codigo_barras',
    ]);
  });

  it('cada columna tiene su tipo, es NOT NULL y solo el id se llena solo', async () => {
    const utf8 = { juego: 'utf8mb4', orden: 'utf8mb4_0900_ai_ci' };
    const sinTexto = { juego: null, orden: null };
    expect(await columnas()).toEqual([
      {
        nombre: 'id',
        tipo: 'int',
        admiteNulo: 'NO',
        extra: 'auto_increment',
        llave: 'PRI',
        ...sinTexto,
      },
      { nombre: 'nombre', tipo: 'varchar(120)', admiteNulo: 'NO', extra: '', llave: '', ...utf8 },
      {
        nombre: 'precio',
        tipo: 'decimal(10,2)',
        admiteNulo: 'NO',
        extra: '',
        llave: '',
        ...sinTexto,
      },
      {
        nombre: 'codigo_barras',
        tipo: 'varchar(50)',
        admiteNulo: 'NO',
        extra: '',
        llave: 'UNI',
        ...utf8,
      },
    ]);
  });

  it('usa InnoDB y utf8mb4_0900_ai_ci', async () => {
    expect(await tabla()).toEqual({ motor: 'InnoDB', orden: 'utf8mb4_0900_ai_ci' });
  });

  it('tiene el índice único uq_productos_codigo_barras y ningún otro además de la llave primaria', async () => {
    expect(await indices()).toEqual([
      { nombre: 'PRIMARY', noEsUnico: 0, posicion: 1, columna: 'id' },
      { nombre: 'uq_productos_codigo_barras', noEsUnico: 0, posicion: 1, columna: 'codigo_barras' },
    ]);
  });

  it('tiene los tres CHECK con nombre fijo y activos', async () => {
    const encontrados = await restriccionesCheck();
    expect(encontrados.map((check) => [check.nombre, check.activa])).toEqual([
      ['chk_productos_codigo_barras', 'YES'],
      ['chk_productos_nombre', 'YES'],
      ['chk_productos_precio', 'YES'],
    ]);
    const clausula = (nombre) => encontrados.find((check) => check.nombre === nombre).clausula;
    expect(clausula('chk_productos_precio')).toMatch(/`precio`\s*>\s*0/);
    expect(clausula('chk_productos_precio')).toMatch(/`precio`\s*<=\s*99999\.99/);
    for (const [nombre, columna] of [
      ['chk_productos_nombre', 'nombre'],
      ['chk_productos_codigo_barras', 'codigo_barras'],
    ]) {
      expect(clausula(nombre), nombre).toMatch(
        new RegExp(`char_length\\(\`${columna}\`\\)\\s*>\\s*0`, 'i'),
      );
      expect(clausula(nombre), nombre).toMatch(
        new RegExp(`\`${columna}\`\\s*=\\s*trim\\(\`${columna}\`\\)`, 'i'),
      );
    }
  });

  it('no inserta filas: los productos de ejemplo no van en la migración', async () => {
    const [{ total }] = await leer('SELECT COUNT(*) AS total FROM productos');
    expect(Number(total)).toBe(0);
  });

  it(
    'deshacerlo todo borra la tabla productos y migrar la vuelve a crear igual',
    async () => {
      const antes = {
        columnas: await columnas(),
        indices: await indices(),
        checks: await restriccionesCheck(),
      };
      expect(antes.columnas, 'antes de deshacer, la tabla productos existe').toHaveLength(4);
      correrCli('db:migrate:undo:all', '--env', 'test');
      expect(await tablasDeLaBase(sequelize)).not.toContain('productos');
      correrNpm('migrar:prueba');
      expect({
        columnas: await columnas(),
        indices: await indices(),
        checks: await restriccionesCheck(),
      }).toEqual(antes);
    },
    TIEMPO,
  );
});
