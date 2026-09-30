import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { conTransaccionDescartada, errorDeMySQL } from './ayudas-productos.js';

const require = createRequire(import.meta.url);
const sequelize = require('../../src/database.js');
const modelos = require('../../src/models/index.js');

const { Producto } = modelos;
const carpetaSrc = path.resolve(import.meta.dirname, '..', '..', 'src');

const leche = { nombre: 'Leche entera 1 L', precio: '25.00', codigoBarras: '0012345' };

describe('la definición del modelo Producto (no necesita MySQL)', () => {
  it('src/models/index.js lo registra y src/models/Producto.js exporta el mismo modelo', () => {
    expect(Producto, 'src/models/index.js no exporta Producto').toBeDefined();
    expect(modelos.sequelize).toBe(sequelize);
    expect(sequelize.models.Producto).toBe(Producto);
    expect(require('../../src/models/Producto.js')).toBe(Producto);
  });

  it('usa la tabla productos con nombre fijo, columnas en snake_case y sin timestamps', () => {
    expect(Producto.tableName).toBe('productos');
    expect(Producto.options.freezeTableName).toBe(true);
    expect(Producto.options.underscored).toBe(true);
    expect(Producto.options.timestamps).toBe(false);
  });

  it('tiene los atributos id, nombre, precio y codigoBarras, y ninguna fecha', () => {
    expect(Object.keys(Producto.getAttributes())).toEqual([
      'id',
      'nombre',
      'precio',
      'codigoBarras',
    ]);
  });

  it('cada atributo tiene su tipo y su columna', () => {
    const atributos = Producto.getAttributes();
    expect(atributos.id).toMatchObject({ primaryKey: true, autoIncrement: true, field: 'id' });
    expect(atributos.id.type.toSql()).toBe('INTEGER');
    expect(atributos.nombre.type.toSql()).toBe('VARCHAR(120)');
    expect(atributos.precio.type.toSql()).toBe('DECIMAL(10,2)');
    expect(atributos.codigoBarras.type.toSql()).toBe('VARCHAR(50)');
    expect(atributos.codigoBarras.field).toBe('codigo_barras');
  });

  it('no tiene reglas de negocio: ni allowNull, ni validaciones, ni ganchos', () => {
    for (const nombre of ['nombre', 'precio', 'codigoBarras']) {
      const atributo = Producto.getAttributes()[nombre];
      expect(atributo.allowNull, `${nombre}.allowNull`).not.toBe(false);
      expect(atributo.validate, `${nombre}.validate`).toBeUndefined();
    }
    expect(Producto.options.validate).toEqual({});
    expect(Producto.options.hooks).toEqual({});
  });

  it('nadie llama a sequelize.sync(): el esquema sale solo de la migración', () => {
    const archivos = fs
      .readdirSync(carpetaSrc, { recursive: true })
      .filter((n) => n.endsWith('.js'));
    expect(archivos.length).toBeGreaterThan(0);
    for (const archivo of archivos) {
      const codigo = fs.readFileSync(path.join(carpetaSrc, archivo), 'utf8');
      expect(codigo, archivo).not.toMatch(/\.sync\s*\(/);
    }
  });
});

// Necesita MySQL levantado y la base de prueba migrada. Cada prueba corre en una transacción que se descarta.
describe('Producto contra MySQL', () => {
  it('create y findByPk devuelven el precio como texto de 2 decimales y el código con sus ceros', async () => {
    await conTransaccionDescartada(async ({ transaccion }) => {
      const creado = await Producto.create(leche, { transaction: transaccion });
      expect(creado.precio).toBe('25.00');
      expect(typeof creado.precio).toBe('string');

      const leido = await Producto.findByPk(creado.id, { transaction: transaccion });
      expect(leido.get({ plain: true })).toEqual({ id: creado.id, ...leche });
      expect(typeof leido.precio).toBe('string');
      expect(leido.codigoBarras).toBe('0012345');
    });
  });

  it('un precio "25" sale como "25.00" al releer la fila guardada (Sequelize no lo normaliza al crear)', async () => {
    await conTransaccionDescartada(async ({ transaccion }) => {
      const creado = await Producto.create(
        { ...leche, precio: '25' },
        { transaction: transaccion },
      );
      await creado.reload({ transaction: transaccion });
      expect(creado.precio).toBe('25.00');
      const leido = await Producto.findByPk(creado.id, { transaction: transaccion });
      expect(leido.precio).toBe('25.00');
    });
  });

  it('guarda codigoBarras en la columna codigo_barras y no agrega otras columnas', async () => {
    await conTransaccionDescartada(async ({ consultar, transaccion }) => {
      const creado = await Producto.create(leche, { transaction: transaccion });
      const [fila] = await consultar('SELECT * FROM productos WHERE id = :id', { id: creado.id });
      expect(fila).toEqual({
        id: creado.id,
        nombre: leche.nombre,
        precio: '25.00',
        codigo_barras: '0012345',
      });
    });
  });

  it('un código repetido llega como el error 1062 del índice uq_productos_codigo_barras', async () => {
    await conTransaccionDescartada(async ({ transaccion }) => {
      await Producto.create(leche, { transaction: transaccion });
      const error = await errorDeMySQL(
        Producto.create({ ...leche, nombre: 'Otra leche' }, { transaction: transaccion }),
      );
      expect(error?.errno).toBe(1062);
      expect(error.mensaje).toContain('uq_productos_codigo_barras');
    });
  });

  it('el modelo no valida: un precio de 0 y un nombre nulo los rechaza MySQL (3819 y 1048)', async () => {
    await conTransaccionDescartada(async ({ transaccion }) => {
      const precioEnCero = await errorDeMySQL(
        Producto.create({ ...leche, precio: '0' }, { transaction: transaccion }),
      );
      expect(precioEnCero?.errno).toBe(3819);
      const sinNombre = await errorDeMySQL(
        Producto.create({ ...leche, nombre: null }, { transaction: transaccion }),
      );
      expect(sinNombre?.errno).toBe(1048);
    });
  });
});
