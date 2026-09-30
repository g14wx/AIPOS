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
const nombres = fs
  .readdirSync(carpetaMigraciones)
  .filter((nombre) => !nombre.startsWith('.'))
  .sort();
const buscar = (patron) => nombres.find((nombre) => patron.test(nombre));
const archivoProductos = buscar(/^\d{14}-crear-productos\.c?js$/);
const archivoVentas = buscar(/^\d{14}-crear-ventas\.c?js$/);
const archivoDetalles = buscar(/^\d{14}-crear-detalles-venta\.c?js$/);

// Lo que MySQL dice de una tabla, leído de information_schema.
async function leer(sql, tabla) {
  const [filas] = await sequelize.query(sql, { replacements: { tabla } });
  return filas;
}

const columnas = (tabla) =>
  leer(
    `SELECT column_name AS nombre, column_type AS tipo, is_nullable AS admiteNulo,
            column_default AS porDefecto, extra AS extra
       FROM information_schema.columns
      WHERE table_schema = DATABASE() AND table_name = :tabla
      ORDER BY ordinal_position`,
    tabla,
  );

const indices = (tabla) =>
  leer(
    `SELECT index_name AS nombre, non_unique AS noEsUnico, seq_in_index AS posicion,
            column_name AS columna
       FROM information_schema.statistics
      WHERE table_schema = DATABASE() AND table_name = :tabla
      ORDER BY index_name, seq_in_index`,
    tabla,
  );

const llavesForaneas = (tabla) =>
  leer(
    `SELECT kcu.constraint_name AS nombre, kcu.column_name AS columna,
            kcu.referenced_table_name AS tablaReferenciada,
            kcu.referenced_column_name AS columnaReferenciada, rc.delete_rule AS alBorrar
       FROM information_schema.key_column_usage kcu
       JOIN information_schema.referential_constraints rc
         ON rc.constraint_schema = kcu.constraint_schema
        AND rc.constraint_name = kcu.constraint_name AND rc.table_name = kcu.table_name
      WHERE kcu.table_schema = DATABASE() AND kcu.table_name = :tabla
        AND kcu.referenced_table_name IS NOT NULL
      ORDER BY kcu.constraint_name`,
    tabla,
  );

const restriccionesCheck = (tabla) =>
  leer(
    `SELECT tc.constraint_name AS nombre, tc.enforced AS activa, cc.check_clause AS clausula
       FROM information_schema.table_constraints tc
       JOIN information_schema.check_constraints cc
         ON cc.constraint_schema = tc.constraint_schema AND cc.constraint_name = tc.constraint_name
      WHERE tc.table_schema = DATABASE() AND tc.table_name = :tabla AND tc.constraint_type = 'CHECK'
      ORDER BY tc.constraint_name`,
    tabla,
  );

const motorYOrden = async (tabla) =>
  (
    await leer(
      `SELECT engine AS motor, table_collation AS orden
         FROM information_schema.tables
        WHERE table_schema = DATABASE() AND table_name = :tabla`,
      tabla,
    )
  )[0];

// Todo lo que MySQL sabe de una tabla, para comparar antes y después de deshacer y rehacer.
async function estructura(tabla) {
  return {
    columnas: await columnas(tabla),
    indices: await indices(tabla),
    llavesForaneas: await llavesForaneas(tabla),
    checks: await restriccionesCheck(tabla),
    tabla: await motorYOrden(tabla),
  };
}

async function tablasSinElRegistro() {
  return (await tablasDeLaBase(sequelize)).filter((nombre) => nombre !== 'SequelizeMeta');
}

async function migracionesEjecutadas() {
  const [filas] = await sequelize.query('SELECT name FROM `SequelizeMeta` ORDER BY name');
  return filas.map((fila) => fila.name);
}

describe('los archivos de las migraciones de ventas', () => {
  it('existen db/migrations/AAAAMMDDHHMMSS-crear-ventas.js y ...-crear-detalles-venta.js, en CommonJS, con up y down', () => {
    expect(archivoVentas, 'falta db/migrations/AAAAMMDDHHMMSS-crear-ventas.js').toBeDefined();
    expect(
      archivoDetalles,
      'falta db/migrations/AAAAMMDDHHMMSS-crear-detalles-venta.js',
    ).toBeDefined();
    for (const archivo of [archivoVentas, archivoDetalles]) {
      const migracion = require(path.join(carpetaMigraciones, archivo));
      expect(typeof migracion.up, `${archivo}: up`).toBe('function');
      expect(typeof migracion.down, `${archivo}: down`).toBe('function');
    }
  });

  it('corren después de la de productos, y la de detalles_venta después de la de ventas', () => {
    expect(archivoProductos).toBeDefined();
    expect(nombres.indexOf(archivoProductos)).toBeLessThan(nombres.indexOf(archivoVentas));
    expect(nombres.indexOf(archivoVentas)).toBeLessThan(nombres.indexOf(archivoDetalles));
  });

  it('dicen de forma explícita el motor, el juego de caracteres y el orden (no los heredan de la base)', () => {
    for (const archivo of [archivoVentas, archivoDetalles]) {
      expect(archivo, 'falta una migración de ventas').toBeDefined();
      const texto = fs.readFileSync(path.join(carpetaMigraciones, archivo), 'utf8');
      expect(texto, archivo).toContain('InnoDB');
      expect(texto, archivo).toMatch(/utf8mb4(?!_)/);
      expect(texto, archivo).toContain('utf8mb4_0900_ai_ci');
    }
  });
});

describe('las tablas ventas y detalles_venta después de migrar', () => {
  beforeAll(() => {
    correrCli('db:migrate:undo:all', '--env', 'test');
  }, TIEMPO);

  afterAll(() => {
    correrCli('db:migrate', '--env', 'test');
  }, TIEMPO);

  it(
    'desde cero, migrar:prueba crea productos, ventas y detalles_venta y anota sus tres migraciones',
    async () => {
      correrNpm('migrar:prueba');
      expect(await tablasSinElRegistro()).toEqual(
        expect.arrayContaining(['productos', 'ventas', 'detalles_venta']),
      );
      expect(await migracionesEjecutadas()).toEqual(
        expect.arrayContaining([archivoProductos, archivoVentas, archivoDetalles]),
      );
    },
    TIEMPO,
  );

  it('ventas tiene id, fecha y total, con su tipo, y todo es NOT NULL', async () => {
    expect(await columnas('ventas')).toEqual([
      { nombre: 'id', tipo: 'int', admiteNulo: 'NO', porDefecto: null, extra: 'auto_increment' },
      {
        nombre: 'fecha',
        tipo: 'datetime',
        admiteNulo: 'NO',
        porDefecto: 'CURRENT_TIMESTAMP',
        extra: 'DEFAULT_GENERATED',
      },
      { nombre: 'total', tipo: 'decimal(12,2)', admiteNulo: 'NO', porDefecto: null, extra: '' },
    ]);
  });

  it('detalles_venta tiene id, venta_id, producto_id, cantidad, precio_aplicado y subtotal, con su tipo, y todo es NOT NULL', async () => {
    const sinDefecto = { admiteNulo: 'NO', porDefecto: null, extra: '' };
    expect(await columnas('detalles_venta')).toEqual([
      { nombre: 'id', tipo: 'int', admiteNulo: 'NO', porDefecto: null, extra: 'auto_increment' },
      { nombre: 'venta_id', tipo: 'int', ...sinDefecto },
      { nombre: 'producto_id', tipo: 'int', ...sinDefecto },
      { nombre: 'cantidad', tipo: 'int', ...sinDefecto },
      { nombre: 'precio_aplicado', tipo: 'decimal(10,2)', ...sinDefecto },
      { nombre: 'subtotal', tipo: 'decimal(12,2)', ...sinDefecto },
    ]);
  });

  it('ventas no tiene más índice que la llave primaria, ni CHECK ni llaves foráneas', async () => {
    expect(await indices('ventas')).toEqual([
      { nombre: 'PRIMARY', noEsUnico: 0, posicion: 1, columna: 'id' },
    ]);
    expect(await restriccionesCheck('ventas')).toEqual([]);
    expect(await llavesForaneas('ventas')).toEqual([]);
  });

  it('detalles_venta tiene el índice único uq_detalles_venta_venta_producto sobre venta_id y producto_id', async () => {
    const encontrados = await indices('detalles_venta');
    expect(
      encontrados.filter((indice) => indice.nombre === 'uq_detalles_venta_venta_producto'),
    ).toEqual([
      {
        nombre: 'uq_detalles_venta_venta_producto',
        noEsUnico: 0,
        posicion: 1,
        columna: 'venta_id',
      },
      {
        nombre: 'uq_detalles_venta_venta_producto',
        noEsUnico: 0,
        posicion: 2,
        columna: 'producto_id',
      },
    ]);
    // Además de la llave primaria, MySQL crea solo el índice de la llave foránea de producto_id: la de
    // venta_id ya la sirve el índice único, que empieza por venta_id.
    expect(encontrados.map((indice) => indice.nombre)).toEqual([
      'fk_detalles_venta_producto',
      'PRIMARY',
      'uq_detalles_venta_venta_producto',
      'uq_detalles_venta_venta_producto',
    ]);
  });

  it('las llaves foráneas apuntan a ventas.id y a productos.id, con ON DELETE RESTRICT (RN-13)', async () => {
    expect(await llavesForaneas('detalles_venta')).toEqual([
      {
        nombre: 'fk_detalles_venta_producto',
        columna: 'producto_id',
        tablaReferenciada: 'productos',
        columnaReferenciada: 'id',
        alBorrar: 'RESTRICT',
      },
      {
        nombre: 'fk_detalles_venta_venta',
        columna: 'venta_id',
        tablaReferenciada: 'ventas',
        columnaReferenciada: 'id',
        alBorrar: 'RESTRICT',
      },
    ]);
  });

  it('detalles_venta tiene los dos CHECK con nombre fijo, activos y con los límites de RN-05 y RN-06', async () => {
    const encontrados = await restriccionesCheck('detalles_venta');
    expect(encontrados.map((check) => [check.nombre, check.activa])).toEqual([
      ['chk_detalles_venta_cantidad', 'YES'],
      ['chk_detalles_venta_precio_aplicado', 'YES'],
    ]);
    const clausula = (nombre) => encontrados.find((check) => check.nombre === nombre).clausula;
    expect(clausula('chk_detalles_venta_cantidad')).toMatch(
      /`cantidad`\s+between\s+1\s+and\s+999/i,
    );
    expect(clausula('chk_detalles_venta_precio_aplicado')).toMatch(
      /`precio_aplicado`\s+between\s+0\s+and\s+99999\.99/i,
    );
  });

  it('las dos tablas usan InnoDB y utf8mb4_0900_ai_ci', async () => {
    const esperado = { motor: 'InnoDB', orden: 'utf8mb4_0900_ai_ci' };
    expect(await motorYOrden('ventas')).toEqual(esperado);
    expect(await motorYOrden('detalles_venta')).toEqual(esperado);
  });

  it('no insertan filas: las ventas de ejemplo no van en las migraciones', async () => {
    for (const tabla of ['ventas', 'detalles_venta']) {
      const [{ total }] = await leer(`SELECT COUNT(*) AS total FROM ${tabla}`);
      expect(Number(total), tabla).toBe(0);
    }
  });
});

describe('deshacer y rehacer las tablas de ventas', () => {
  const estructuras = async () => ({
    ventas: await estructura('ventas'),
    detallesVenta: await estructura('detalles_venta'),
  });

  beforeAll(() => {
    correrCli('db:migrate:undo:all', '--env', 'test');
    correrNpm('migrar:prueba');
  }, TIEMPO);

  afterAll(() => {
    correrCli('db:migrate', '--env', 'test');
  }, TIEMPO);

  it(
    'deshacer borra detalles_venta antes que ventas, y migrar las vuelve a crear iguales',
    async () => {
      const antes = await estructuras();
      correrCli('db:migrate:undo', '--name', archivoDetalles, '--env', 'test');
      const sinDetalles = await tablasSinElRegistro();
      expect(sinDetalles).toEqual(expect.arrayContaining(['productos', 'ventas']));
      expect(sinDetalles).not.toContain('detalles_venta');
      correrCli('db:migrate:undo', '--name', archivoVentas, '--env', 'test');
      const sinVentas = await tablasSinElRegistro();
      expect(sinVentas).toContain('productos');
      expect(sinVentas).not.toContain('ventas');
      correrNpm('migrar:prueba');
      expect(await estructuras()).toEqual(antes);
    },
    TIEMPO,
  );

  it(
    'no se puede deshacer ventas mientras exista detalles_venta: la llave foránea lo impide',
    async () => {
      expect(() =>
        correrCli('db:migrate:undo', '--name', archivoVentas, '--env', 'test'),
      ).toThrow();
      expect(await tablasSinElRegistro()).toEqual(
        expect.arrayContaining(['ventas', 'detalles_venta']),
      );
    },
    TIEMPO,
  );

  it(
    'rehacer:prueba las borra y las vuelve a crear sin error, con la misma estructura',
    async () => {
      const antes = await estructuras();
      correrNpm('rehacer:prueba');
      expect(await estructuras()).toEqual(antes);
    },
    TIEMPO,
  );

  it(
    'deshacerlo todo borra las dos tablas, y migrar las crea otra vez',
    async () => {
      correrCli('db:migrate:undo:all', '--env', 'test');
      expect(await tablasSinElRegistro()).toEqual([]);
      correrNpm('migrar:prueba');
      expect(await tablasSinElRegistro()).toEqual(
        expect.arrayContaining(['productos', 'ventas', 'detalles_venta']),
      );
    },
    TIEMPO,
  );
});
