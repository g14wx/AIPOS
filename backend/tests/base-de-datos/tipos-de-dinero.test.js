import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import { conTransaccionDescartada, errorDeMySQL } from './ayudas-productos.js';
import {
  ER_WARN_DATA_OUT_OF_RANGE,
  insertarDetalle,
  insertarProductos,
  insertarProductoYVenta,
  insertarVenta,
} from './ayudas-ventas.js';

const require = createRequire(import.meta.url);
const sequelize = require('../../src/database.js');

// Necesita MySQL levantado y la base de prueba migrada, con las tres tablas (productos, ventas y
// detalles_venta). Revisa los tipos de la tabla de "Dinero" de la spec de arquitectura y que los
// límites de la venta caben en ellos: un subtotal llega a 99 899 990.01 (99 999.99 × 999) y, con 100
// detalles (RN-14), el total llega a 9 989 999 001.00. Cada prueba que escribe corre en una
// transacción que se descarta.

const SUBTOTAL_MAXIMO = '99899990.01';
const TOTAL_MAXIMO = '9989999001.00';

// La tabla de "Dinero": dónde va cada tipo.
const tiposDeLaSpec = [
  ['productos', 'precio', 'decimal(10,2)'],
  ['detalles_venta', 'precio_aplicado', 'decimal(10,2)'],
  ['detalles_venta', 'cantidad', 'int'],
  ['detalles_venta', 'subtotal', 'decimal(12,2)'],
  ['ventas', 'total', 'decimal(12,2)'],
];

describe('los tipos del dinero en MySQL', () => {
  it.each(tiposDeLaSpec)('%s.%s es %s', async (tabla, columna, tipo) => {
    const [filas] = await sequelize.query(
      `SELECT column_type AS tipo FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = :tabla AND column_name = :columna`,
      { replacements: { tabla, columna } },
    );
    expect(filas).toEqual([{ tipo }]);
  });

  it('ninguna columna de la base es FLOAT, DOUBLE ni DECIMAL sin decimales (que pierde los centavos)', async () => {
    const [filas] = await sequelize.query(
      `SELECT table_name AS tabla, column_name AS columna, column_type AS tipo
         FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND (data_type IN ('float', 'double', 'real') OR (data_type = 'decimal' AND numeric_scale = 0))`,
    );
    expect(filas).toEqual([]);
  });
});

describe('el dinero llega como texto', () => {
  it('mysql2 devuelve el precio, el precio aplicado, el subtotal y el total como texto de 2 decimales, y la cantidad como número', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const { ventaId, productoId } = await insertarProductoYVenta(consultar);
      await consultar("UPDATE ventas SET total = '44' WHERE id = :ventaId", { ventaId });
      await insertarDetalle(consultar, {
        ventaId,
        productoId,
        cantidad: 2,
        precioAplicado: '22',
        subtotal: '44',
      });
      const [fila] = await consultar(
        `SELECT p.precio, d.precio_aplicado, d.cantidad, d.subtotal, v.total
           FROM ventas v
           JOIN detalles_venta d ON d.venta_id = v.id
           JOIN productos p ON p.id = d.producto_id
          WHERE v.id = :ventaId`,
        { ventaId },
      );
      expect(fila).toEqual({
        precio: '25.00',
        precio_aplicado: '22.00',
        cantidad: 2,
        subtotal: '44.00',
        total: '44.00',
      });
    });
  });

  it('el subtotal y el total se calculan en SQL, sin decimales de JavaScript: 2 × 22.00 + 1 × 3.50 = "47.50"', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const [leche, pan] = await insertarProductos(consultar, 2);
      const ventaId = await insertarVenta(consultar);
      await insertarDetalle(consultar, {
        ventaId,
        productoId: leche,
        cantidad: 2,
        precioAplicado: '22.00',
        subtotal: '0',
      });
      await insertarDetalle(consultar, {
        ventaId,
        productoId: pan,
        cantidad: 1,
        precioAplicado: '3.50',
        subtotal: '0',
      });
      await consultar(
        'UPDATE detalles_venta SET subtotal = ROUND(precio_aplicado * cantidad, 2) WHERE venta_id = :ventaId',
        { ventaId },
      );
      await consultar(
        'UPDATE ventas SET total = (SELECT SUM(subtotal) FROM detalles_venta WHERE venta_id = :ventaId) WHERE id = :ventaId',
        { ventaId },
      );
      const subtotales = await consultar(
        'SELECT subtotal FROM detalles_venta WHERE venta_id = :ventaId ORDER BY producto_id',
        { ventaId },
      );
      expect(subtotales).toEqual([{ subtotal: '44.00' }, { subtotal: '3.50' }]);
      const [{ total }] = await consultar('SELECT total FROM ventas WHERE id = :ventaId', {
        ventaId,
      });
      expect(total).toBe('47.50');
    });
  });
});

describe('los límites de una venta caben en los tipos (RN-14)', () => {
  // Guarda `cuantos` productos y una venta con un detalle de 999 × 99999.99 por cada producto, con un
  // solo INSERT. El subtotal se calcula en SQL, como lo hará el procedimiento.
  async function ventaConDetallesMaximos(consultar, cuantos) {
    await insertarProductos(consultar, cuantos);
    const ventaId = await insertarVenta(consultar);
    await consultar(
      `INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio_aplicado, subtotal)
       SELECT :ventaId, id, 999, 99999.99, ROUND(99999.99 * 999, 2)
         FROM productos WHERE codigo_barras LIKE 'MASIVO-%'`,
      { ventaId },
    );
    return ventaId;
  }

  // Pone en la venta la suma de sus subtotales y devuelve el error de MySQL (o null).
  const guardarTotal = (consultar, ventaId) =>
    errorDeMySQL(
      consultar(
        `UPDATE ventas SET total = (SELECT SUM(subtotal) FROM detalles_venta WHERE venta_id = :ventaId)
          WHERE id = :ventaId`,
        { ventaId },
      ),
    );

  it('el subtotal más grande (999 × 99999.99) es "99899990.01" y cabe en detalles_venta.subtotal', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const ventaId = await ventaConDetallesMaximos(consultar, 1);
      const [fila] = await consultar(
        'SELECT subtotal, ROUND(precio_aplicado * cantidad, 2) AS calculado FROM detalles_venta WHERE venta_id = :ventaId',
        { ventaId },
      );
      expect(fila).toEqual({ subtotal: SUBTOTAL_MAXIMO, calculado: SUBTOTAL_MAXIMO });
    });
  });

  it('con 100 detalles del subtotal más grande, el total es "9989999001.00" y cabe en ventas.total', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const ventaId = await ventaConDetallesMaximos(consultar, 100);
      expect(await guardarTotal(consultar, ventaId)).toBeNull();
      const [fila] = await consultar('SELECT total FROM ventas WHERE id = :ventaId', { ventaId });
      expect(fila.total).toBe(TOTAL_MAXIMO);
    });
  });

  it('con 101 detalles el total se desborda: MySQL lo rechaza con el error 1264 (por eso el máximo es 100)', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const ventaId = await ventaConDetallesMaximos(consultar, 101);
      const error = await guardarTotal(consultar, ventaId);
      expect(error?.errno).toBe(ER_WARN_DATA_OUT_OF_RANGE);
      expect(error.mensaje).toContain("'total'");
    });
  });

  it('los dos tipos de DECIMAL(12,2) llegan hasta 9999999999.99 y no más', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const { ventaId, productoId } = await insertarProductoYVenta(consultar);
      const lleno = '9999999999.99';
      expect(
        await errorDeMySQL(consultar('UPDATE ventas SET total = :lleno', { lleno })),
      ).toBeNull();
      expect(
        await errorDeMySQL(insertarDetalle(consultar, { ventaId, productoId, subtotal: lleno })),
      ).toBeNull();
      const desbordado = '10000000000.00';
      const enTotal = await errorDeMySQL(
        consultar('UPDATE ventas SET total = :desbordado', { desbordado }),
      );
      expect(enTotal?.errno).toBe(ER_WARN_DATA_OUT_OF_RANGE);
      const enSubtotal = await errorDeMySQL(
        consultar('UPDATE detalles_venta SET subtotal = :desbordado', { desbordado }),
      );
      expect(enSubtotal?.errno).toBe(ER_WARN_DATA_OUT_OF_RANGE);
    });
  });
});
