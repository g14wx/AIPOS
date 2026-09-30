import { describe, it, expect } from 'vitest';
import { conTransaccionDescartada, errorDeMySQL, insertarProducto } from './ayudas-productos.js';
import {
  ER_BAD_NULL_ERROR,
  ER_CHECK_CONSTRAINT_VIOLATED,
  ER_DUP_ENTRY,
  ER_NO_DEFAULT_FOR_FIELD,
  ER_NO_REFERENCED_ROW,
  ER_ROW_IS_REFERENCED,
  insertarDetalle,
  insertarProductoYVenta,
  insertarVenta,
} from './ayudas-ventas.js';

// Necesita MySQL levantado y la base de prueba migrada (npm run migrar:prueba).
// Prueba lo que MySQL protege por sí solo en ventas y detalles_venta, sin la API ni el procedimiento
// (RNF-03): los CHECK (RN-05 y RN-06), las llaves foráneas (RN-13), el índice único (RN-07), NOT NULL y
// la fecha (RN-12). Cada prueba corre en una transacción que se descarta.

// Inserta un producto y una venta, intenta insertar un detalle con los campos que se cambian y devuelve
// el error de MySQL (o null si lo aceptó).
async function intentarDetalle(consultar, campos = {}) {
  const { ventaId, productoId } = await insertarProductoYVenta(consultar);
  return errorDeMySQL(insertarDetalle(consultar, { ventaId, productoId, ...campos }));
}

// Inserta un detalle válido con los campos que se cambian y devuelve la fila que quedó en detalles_venta.
async function insertarYLeer(consultar, campos) {
  const { ventaId, productoId } = await insertarProductoYVenta(consultar);
  await insertarDetalle(consultar, { ventaId, productoId, ...campos });
  const [fila] = await consultar(
    'SELECT cantidad, precio_aplicado, subtotal FROM detalles_venta WHERE venta_id = :ventaId',
    { ventaId },
  );
  return fila;
}

describe('el CHECK chk_detalles_venta_cantidad (RN-06)', () => {
  it.each([0, -1, 1000, 5000])('rechaza la cantidad %i con el error 3819', async (cantidad) => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const error = await intentarDetalle(consultar, { cantidad });
      expect(error?.errno).toBe(ER_CHECK_CONSTRAINT_VIOLATED);
      expect(error.mensaje).toContain('chk_detalles_venta_cantidad');
    });
  });

  it.each([1, 2, 999])('acepta la cantidad %i y la guarda tal cual', async (cantidad) => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const fila = await insertarYLeer(consultar, { cantidad });
      expect(fila.cantidad).toBe(cantidad);
    });
  });
});

describe('el CHECK chk_detalles_venta_precio_aplicado (RN-05)', () => {
  it.each(['-1', '-0.01', '100000', '100000.00', '99999.995'])(
    'rechaza el precio aplicado %s con el error 3819',
    async (precioAplicado) => {
      await conTransaccionDescartada(async ({ consultar }) => {
        const error = await intentarDetalle(consultar, { precioAplicado });
        expect(error?.errno).toBe(ER_CHECK_CONSTRAINT_VIOLATED);
        expect(error.mensaje).toContain('chk_detalles_venta_precio_aplicado');
      });
    },
  );

  it.each([
    ['0', '0.00'],
    ['0.00', '0.00'],
    ['0.01', '0.01'],
    ['25.5', '25.50'],
    ['99999.99', '99999.99'],
  ])('acepta el precio aplicado %s y lo guarda como "%s"', async (precioAplicado, guardado) => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const fila = await insertarYLeer(consultar, { precioAplicado });
      expect(fila.precio_aplicado).toBe(guardado);
    });
  });

  it('con 3 decimales MySQL no da error: redondea 10.999 a 11.00 (por eso la API y el procedimiento lo rechazan antes)', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const fila = await insertarYLeer(consultar, { precioAplicado: '10.999' });
      expect(fila.precio_aplicado).toBe('11.00');
    });
  });
});

describe('las llaves foráneas de detalles_venta', () => {
  it('rechaza un detalle de un producto que no existe con el error 1452', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const error = await intentarDetalle(consultar, { productoId: 999999999 });
      expect(error?.errno).toBe(ER_NO_REFERENCED_ROW);
      expect(error.mensaje).toContain('fk_detalles_venta_producto');
    });
  });

  it('rechaza un detalle de una venta que no existe con el error 1452', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const error = await intentarDetalle(consultar, { ventaId: 999999999 });
      expect(error?.errno).toBe(ER_NO_REFERENCED_ROW);
      expect(error.mensaje).toContain('fk_detalles_venta_venta');
    });
  });

  it('un rechazo no deja ningún detalle en la tabla', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      await intentarDetalle(consultar, { productoId: 999999999 });
      const [{ total }] = await consultar('SELECT COUNT(*) AS total FROM detalles_venta');
      expect(Number(total)).toBe(0);
    });
  });
});

describe('ON DELETE RESTRICT (RN-13)', () => {
  const borrar = (consultar, tabla, id) =>
    errorDeMySQL(consultar(`DELETE FROM ${tabla} WHERE id = :id`, { id }));

  it('un producto que está en una venta no se puede borrar: error 1451, y el producto y el detalle siguen', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const { ventaId, productoId } = await insertarProductoYVenta(consultar);
      await insertarDetalle(consultar, { ventaId, productoId });
      const error = await borrar(consultar, 'productos', productoId);
      expect(error?.errno).toBe(ER_ROW_IS_REFERENCED);
      expect(error.mensaje).toContain('fk_detalles_venta_producto');
      const [{ productos }] = await consultar('SELECT COUNT(*) AS productos FROM productos');
      const [{ detalles }] = await consultar('SELECT COUNT(*) AS detalles FROM detalles_venta');
      expect([Number(productos), Number(detalles)]).toEqual([1, 1]);
    });
  });

  it('una venta con detalles no se puede borrar: error 1451, y la venta y su detalle siguen', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const { ventaId, productoId } = await insertarProductoYVenta(consultar);
      await insertarDetalle(consultar, { ventaId, productoId });
      const error = await borrar(consultar, 'ventas', ventaId);
      expect(error?.errno).toBe(ER_ROW_IS_REFERENCED);
      expect(error.mensaje).toContain('fk_detalles_venta_venta');
      const [{ ventas }] = await consultar('SELECT COUNT(*) AS ventas FROM ventas');
      const [{ detalles }] = await consultar('SELECT COUNT(*) AS detalles FROM detalles_venta');
      expect([Number(ventas), Number(detalles)]).toEqual([1, 1]);
    });
  });

  it('solo protege lo que tiene detalles: un producto que no está en ninguna venta sí se borra', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const productoId = await insertarProducto(consultar, {
        nombre: 'Pan',
        precio: '3.50',
        codigoBarras: 'PAN-1',
      });
      expect(await borrar(consultar, 'productos', productoId)).toBeNull();
    });
  });

  it('cuando el detalle ya no existe, la venta y el producto se pueden borrar', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const { ventaId, productoId } = await insertarProductoYVenta(consultar);
      await insertarDetalle(consultar, { ventaId, productoId });
      await consultar('DELETE FROM detalles_venta WHERE venta_id = :ventaId', { ventaId });
      expect(await borrar(consultar, 'ventas', ventaId)).toBeNull();
      expect(await borrar(consultar, 'productos', productoId)).toBeNull();
    });
  });
});

describe('el índice único uq_detalles_venta_venta_producto (RN-07)', () => {
  it('rechaza un segundo detalle con el mismo producto en la misma venta: error 1062 y el nombre del índice', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const { ventaId, productoId } = await insertarProductoYVenta(consultar);
      await insertarDetalle(consultar, { ventaId, productoId, cantidad: 2 });
      const error = await errorDeMySQL(insertarDetalle(consultar, { ventaId, productoId }));
      expect(error?.errno).toBe(ER_DUP_ENTRY);
      expect(error.mensaje).toContain('uq_detalles_venta_venta_producto');
      const filas = await consultar(
        'SELECT cantidad FROM detalles_venta WHERE venta_id = :ventaId',
        {
          ventaId,
        },
      );
      expect(filas).toEqual([{ cantidad: 2 }]);
    });
  });

  it('el mismo producto puede estar en dos ventas distintas', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const { ventaId, productoId } = await insertarProductoYVenta(consultar);
      const otraVentaId = await insertarVenta(consultar);
      await insertarDetalle(consultar, { ventaId, productoId });
      expect(
        await errorDeMySQL(insertarDetalle(consultar, { ventaId: otraVentaId, productoId })),
      ).toBeNull();
    });
  });

  it('dos productos distintos pueden estar en la misma venta', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const { ventaId, productoId } = await insertarProductoYVenta(consultar);
      const otroProductoId = await insertarProducto(consultar, {
        nombre: 'Pan',
        precio: '3.50',
        codigoBarras: 'PAN-1',
      });
      await insertarDetalle(consultar, { ventaId, productoId });
      expect(
        await errorDeMySQL(insertarDetalle(consultar, { ventaId, productoId: otroProductoId })),
      ).toBeNull();
    });
  });
});

describe('NOT NULL', () => {
  const columnas = [
    ['venta_id', 'ventaId'],
    ['producto_id', 'productoId'],
    ['cantidad', 'cantidad'],
    ['precio_aplicado', 'precioAplicado'],
    ['subtotal', 'subtotal'],
  ];

  it.each(columnas)(
    'detalles_venta.%s: un NULL explícito da el error 1048',
    async (columna, campo) => {
      await conTransaccionDescartada(async ({ consultar }) => {
        const error = await intentarDetalle(consultar, { [campo]: null });
        expect(error?.errno).toBe(ER_BAD_NULL_ERROR);
        expect(error.mensaje).toContain(`'${columna}'`);
      });
    },
  );

  it.each(columnas)(
    'detalles_venta.%s: si el INSERT no la trae, da el error 1364',
    async (columna) => {
      await conTransaccionDescartada(async ({ consultar }) => {
        const { ventaId, productoId } = await insertarProductoYVenta(consultar);
        const datos = {
          venta_id: ventaId,
          producto_id: productoId,
          cantidad: 1,
          precio_aplicado: '10.00',
          subtotal: '10.00',
        };
        const presentes = Object.keys(datos).filter((nombre) => nombre !== columna);
        const sql = `INSERT INTO detalles_venta (${presentes.join(', ')})
                     VALUES (${presentes.map((nombre) => `:${nombre}`).join(', ')})`;
        const error = await errorDeMySQL(consultar(sql, datos));
        expect(error?.errno).toBe(ER_NO_DEFAULT_FOR_FIELD);
        expect(error.mensaje).toContain(`'${columna}'`);
      });
    },
  );

  it('ventas.total: un NULL explícito da el error 1048 y, si el INSERT no lo trae, el 1364', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const conNulo = await errorDeMySQL(insertarVenta(consultar, { total: null }));
      expect(conNulo?.errno).toBe(ER_BAD_NULL_ERROR);
      expect(conNulo.mensaje).toContain("'total'");
      const sinTotal = await errorDeMySQL(consultar('INSERT INTO ventas (fecha) VALUES (NOW())'));
      expect(sinTotal?.errno).toBe(ER_NO_DEFAULT_FOR_FIELD);
      expect(sinTotal.mensaje).toContain("'total'");
    });
  });
});

describe('la fecha de la venta (RN-12)', () => {
  it('la pone MySQL: un INSERT sin fecha deja la hora actual del servidor, en UTC', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const ventaId = await insertarVenta(consultar);
      const [fila] = await consultar(
        'SELECT TIMESTAMPDIFF(SECOND, fecha, UTC_TIMESTAMP()) AS segundos FROM ventas WHERE id = :ventaId',
        { ventaId },
      );
      // Si la hora no fuera UTC, la diferencia sería de horas.
      expect(Math.abs(Number(fila.segundos))).toBeLessThanOrEqual(5);
    });
  });

  it('la fecha no puede faltar: un NULL explícito da el error 1048', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const error = await errorDeMySQL(
        consultar("INSERT INTO ventas (fecha, total) VALUES (NULL, '0.00')"),
      );
      expect(error?.errno).toBe(ER_BAD_NULL_ERROR);
      expect(error.mensaje).toContain("'fecha'");
    });
  });
});

describe('lo que se inserta es lo que se lee', () => {
  it('el dinero vuelve como texto con 2 decimales y la cantidad como número', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const { ventaId, productoId } = await insertarProductoYVenta(consultar);
      await consultar("UPDATE ventas SET total = '47.5' WHERE id = :ventaId", { ventaId });
      await insertarDetalle(consultar, {
        ventaId,
        productoId,
        cantidad: 2,
        precioAplicado: '22',
        subtotal: '44',
      });
      const [detalle] = await consultar(
        'SELECT cantidad, precio_aplicado, subtotal FROM detalles_venta WHERE venta_id = :ventaId',
        { ventaId },
      );
      expect(detalle).toEqual({ cantidad: 2, precio_aplicado: '22.00', subtotal: '44.00' });
      const [venta] = await consultar('SELECT total FROM ventas WHERE id = :ventaId', { ventaId });
      expect(venta).toEqual({ total: '47.50' });
    });
  });

  it('el id de la venta y el del detalle se llenan solos con un entero que sube', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const { ventaId, productoId } = await insertarProductoYVenta(consultar);
      const otraVentaId = await insertarVenta(consultar);
      const primero = await insertarDetalle(consultar, { ventaId, productoId });
      const segundo = await insertarDetalle(consultar, { ventaId: otraVentaId, productoId });
      expect(Number.isInteger(ventaId)).toBe(true);
      expect(otraVentaId).toBeGreaterThan(ventaId);
      expect(Number.isInteger(primero)).toBe(true);
      expect(segundo).toBeGreaterThan(primero);
    });
  });
});
