import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import { conTransaccionDescartada, errorDeMySQL } from './ayudas-productos.js';
import { ER_CHECK_CONSTRAINT_VIOLATED, ER_ROW_IS_REFERENCED } from './ayudas-ventas.js';

const require = createRequire(import.meta.url);
const sequelize = require('../../src/database.js');
const modelos = require('../../src/models/index.js');

const { Producto, Venta, DetalleVenta } = modelos;

describe('la definición de los modelos Venta y DetalleVenta (no necesita MySQL)', () => {
  it('src/models/index.js los registra y cada archivo exporta el mismo modelo', () => {
    expect(Venta, 'src/models/index.js no exporta Venta').toBeDefined();
    expect(DetalleVenta, 'src/models/index.js no exporta DetalleVenta').toBeDefined();
    expect(sequelize.models.Venta).toBe(Venta);
    expect(sequelize.models.DetalleVenta).toBe(DetalleVenta);
    expect(require('../../src/models/Venta.js')).toBe(Venta);
    expect(require('../../src/models/DetalleVenta.js')).toBe(DetalleVenta);
  });

  it('usan las tablas ventas y detalles_venta con nombre fijo, columnas en snake_case y sin timestamps', () => {
    for (const [modelo, tabla] of [
      [Venta, 'ventas'],
      [DetalleVenta, 'detalles_venta'],
    ]) {
      expect(modelo.tableName).toBe(tabla);
      expect(modelo.options.freezeTableName).toBe(true);
      expect(modelo.options.underscored).toBe(true);
      expect(modelo.options.timestamps).toBe(false);
    }
  });

  it('Venta tiene los atributos id, fecha y total, y nada más', () => {
    expect(Object.keys(Venta.getAttributes())).toEqual(['id', 'fecha', 'total']);
  });

  it('DetalleVenta tiene id, ventaId, productoId, cantidad, precioAplicado y subtotal, sin VentaId ni ProductoId', () => {
    expect(Object.keys(DetalleVenta.getAttributes())).toEqual([
      'id',
      'ventaId',
      'productoId',
      'cantidad',
      'precioAplicado',
      'subtotal',
    ]);
  });

  it('cada atributo de Venta tiene su tipo y su columna', () => {
    const atributos = Venta.getAttributes();
    expect(atributos.id).toMatchObject({ primaryKey: true, autoIncrement: true, field: 'id' });
    expect(atributos.id.type.toSql()).toBe('INTEGER');
    expect(atributos.fecha.type.toSql()).toBe('DATETIME');
    expect(atributos.fecha.field).toBe('fecha');
    expect(atributos.total.type.toSql()).toBe('DECIMAL(12,2)');
  });

  it('cada atributo de DetalleVenta tiene su tipo y su columna', () => {
    const atributos = DetalleVenta.getAttributes();
    expect(atributos.id).toMatchObject({ primaryKey: true, autoIncrement: true, field: 'id' });
    expect(atributos.id.type.toSql()).toBe('INTEGER');
    expect(atributos.ventaId.type.toSql()).toBe('INTEGER');
    expect(atributos.ventaId.field).toBe('venta_id');
    expect(atributos.productoId.type.toSql()).toBe('INTEGER');
    expect(atributos.productoId.field).toBe('producto_id');
    expect(atributos.cantidad.type.toSql()).toBe('INTEGER');
    expect(atributos.precioAplicado.type.toSql()).toBe('DECIMAL(10,2)');
    expect(atributos.precioAplicado.field).toBe('precio_aplicado');
    expect(atributos.subtotal.type.toSql()).toBe('DECIMAL(12,2)');
  });

  it('la fecha no tiene valor por defecto en el modelo: la pone MySQL (RN-12)', () => {
    expect(Venta.getAttributes().fecha.defaultValue).toBeUndefined();
  });

  it('no tienen reglas de negocio: ni allowNull en false, ni validaciones, ni ganchos', () => {
    for (const modelo of [Venta, DetalleVenta]) {
      for (const [nombre, atributo] of Object.entries(modelo.getAttributes())) {
        expect(atributo.allowNull, `${modelo.name}.${nombre}.allowNull`).not.toBe(false);
        expect(atributo.validate, `${modelo.name}.${nombre}.validate`).toBeUndefined();
      }
      expect(modelo.options.validate).toEqual({});
      expect(modelo.options.hooks).toEqual({});
    }
  });
});

describe('las relaciones entre Venta, DetalleVenta y Producto (no necesita MySQL)', () => {
  it('una venta tiene muchos detalles: Venta.detalles, con la llave foránea ventaId', () => {
    const relacion = Venta.associations.detalles;
    expect(relacion.associationType).toBe('HasMany');
    expect(relacion.target).toBe(DetalleVenta);
    expect(relacion.foreignKey).toBe('ventaId');
    expect(relacion.options.onDelete).toBe('RESTRICT');
  });

  it('cada detalle es de una venta: DetalleVenta.venta, con la llave foránea ventaId (sin alias Sequelize la llamaría Ventum)', () => {
    const relacion = DetalleVenta.associations.venta;
    expect(relacion.associationType).toBe('BelongsTo');
    expect(relacion.target).toBe(Venta);
    expect(relacion.foreignKey).toBe('ventaId');
    expect(relacion.options.onDelete).toBe('RESTRICT');
  });

  it('cada detalle es de un producto: DetalleVenta.producto, con la llave foránea productoId', () => {
    const relacion = DetalleVenta.associations.producto;
    expect(relacion.associationType).toBe('BelongsTo');
    expect(relacion.target).toBe(Producto);
    expect(relacion.foreignKey).toBe('productoId');
    expect(relacion.options.onDelete).toBe('RESTRICT');
  });

  it('un producto puede estar en muchos detalles: Producto.detalles, con la llave foránea productoId', () => {
    const relacion = Producto.associations.detalles;
    expect(relacion.associationType).toBe('HasMany');
    expect(relacion.target).toBe(DetalleVenta);
    expect(relacion.foreignKey).toBe('productoId');
    expect(relacion.options.onDelete).toBe('RESTRICT');
  });

  it('Sequelize no inventa columnas: ventaId es el único atributo que apunta a venta_id y productoId a producto_id', () => {
    const queApuntanA = (columna) =>
      Object.entries(DetalleVenta.getAttributes())
        .filter(([, atributo]) => atributo.field === columna)
        .map(([nombre]) => nombre);
    expect(queApuntanA('venta_id')).toEqual(['ventaId']);
    expect(queApuntanA('producto_id')).toEqual(['productoId']);
    expect(Object.keys(Venta.associations).sort()).toEqual(['detalles']);
    expect(Object.keys(DetalleVenta.associations).sort()).toEqual(['producto', 'venta']);
    expect(Object.keys(Producto.associations)).toEqual(['detalles']);
  });

  it('las llaves foráneas del modelo dicen ON DELETE RESTRICT y referencian ventas.id y productos.id', () => {
    const atributos = DetalleVenta.getAttributes();
    expect(atributos.ventaId.onDelete).toBe('RESTRICT');
    expect(atributos.ventaId.references).toMatchObject({ model: 'ventas', key: 'id' });
    expect(atributos.productoId.onDelete).toBe('RESTRICT');
    expect(atributos.productoId.references).toMatchObject({ model: 'productos', key: 'id' });
  });
});

// Necesita MySQL levantado y la base de prueba migrada. Cada prueba corre en una transacción que se descarta.
// Registrar una venta de verdad lo hace el procedimiento (V-02): aquí los modelos crean datos de ejemplo
// solo para probar que sirven para consultar.
describe('Venta y DetalleVenta contra MySQL', () => {
  // Dos productos, una venta de 47.50 y sus dos detalles: 2 leches a 22.00 y 1 pan a 3.50.
  async function prepararVentaDeEjemplo(transaccion) {
    const opciones = { transaction: transaccion };
    const leche = await Producto.create(
      { nombre: 'Leche entera 1 L', precio: '25.00', codigoBarras: 'LECHE-1' },
      opciones,
    );
    const pan = await Producto.create(
      { nombre: 'Pan de caja', precio: '3.50', codigoBarras: 'PAN-1' },
      opciones,
    );
    const venta = await Venta.create({ total: '47.50' }, opciones);
    await DetalleVenta.create(
      {
        ventaId: venta.id,
        productoId: leche.id,
        cantidad: 2,
        precioAplicado: '22.00',
        subtotal: '44.00',
      },
      opciones,
    );
    await DetalleVenta.create(
      {
        ventaId: venta.id,
        productoId: pan.id,
        cantidad: 1,
        precioAplicado: '3.50',
        subtotal: '3.50',
      },
      opciones,
    );
    return { venta, leche, pan };
  }

  it('una venta se consulta con sus detalles y el nombre de cada producto, con el dinero como texto', async () => {
    await conTransaccionDescartada(async ({ transaccion }) => {
      const { venta } = await prepararVentaDeEjemplo(transaccion);
      const leida = await Venta.findByPk(venta.id, {
        include: [{ association: 'detalles', include: ['producto'] }],
        order: [[{ model: DetalleVenta, as: 'detalles' }, 'id', 'ASC']],
        transaction: transaccion,
      });
      expect(leida.total).toBe('47.50');
      expect(typeof leida.total).toBe('string');
      expect(
        leida.detalles.map((d) => [d.producto.nombre, d.cantidad, d.precioAplicado, d.subtotal]),
      ).toEqual([
        ['Leche entera 1 L', 2, '22.00', '44.00'],
        ['Pan de caja', 1, '3.50', '3.50'],
      ]);
      expect(typeof leida.detalles[0].cantidad).toBe('number');
      expect(typeof leida.detalles[0].precioAplicado).toBe('string');
    });
  });

  it('un JOIN entre detalles_venta y productos muestra el nombre de cada producto (criterio de aceptación 1)', async () => {
    await conTransaccionDescartada(async ({ consultar, transaccion }) => {
      const { venta } = await prepararVentaDeEjemplo(transaccion);
      const filas = await consultar(
        `SELECT p.nombre, d.cantidad, d.precio_aplicado, d.subtotal
           FROM ventas v
           JOIN detalles_venta d ON d.venta_id = v.id
           JOIN productos p ON p.id = d.producto_id
          WHERE v.id = :ventaId
          ORDER BY d.id`,
        { ventaId: venta.id },
      );
      expect(filas).toEqual([
        { nombre: 'Leche entera 1 L', cantidad: 2, precio_aplicado: '22.00', subtotal: '44.00' },
        { nombre: 'Pan de caja', cantidad: 1, precio_aplicado: '3.50', subtotal: '3.50' },
      ]);
    });
  });

  it('un producto sabe en qué detalles está: Producto.detalles', async () => {
    await conTransaccionDescartada(async ({ transaccion }) => {
      const { venta, leche } = await prepararVentaDeEjemplo(transaccion);
      const leido = await Producto.findByPk(leche.id, {
        include: ['detalles'],
        transaction: transaccion,
      });
      expect(leido.detalles.map((detalle) => [detalle.ventaId, detalle.cantidad])).toEqual([
        [venta.id, 2],
      ]);
    });
  });

  it('la fecha la pone MySQL, en UTC: el modelo no la manda (RN-12)', async () => {
    await conTransaccionDescartada(async ({ consultar, transaccion }) => {
      const consultasSql = [];
      const venta = await Venta.create(
        { total: '0.00' },
        { transaction: transaccion, logging: (sql) => consultasSql.push(sql) },
      );
      expect(consultasSql.join('\n')).not.toMatch(/fecha/);
      await venta.reload({ transaction: transaccion });
      expect(venta.fecha).toBeInstanceOf(Date);
      const [fila] = await consultar(
        `SELECT TIMESTAMPDIFF(SECOND, fecha, UTC_TIMESTAMP()) AS segundos,
                DATE_FORMAT(fecha, '%Y-%m-%dT%H:%i:%s.000Z') AS iso
           FROM ventas WHERE id = :id`,
        { id: venta.id },
      );
      expect(Math.abs(Number(fila.segundos))).toBeLessThanOrEqual(5);
      // La Date de JavaScript es la misma hora que puso MySQL, sin correrla por zona horaria.
      expect(venta.fecha.toISOString()).toBe(fila.iso);
    });
  });

  it('el modelo no valida: una cantidad 0 y un precio aplicado negativo los rechaza MySQL (3819)', async () => {
    await conTransaccionDescartada(async ({ transaccion }) => {
      const { venta, leche } = await prepararVentaDeEjemplo(transaccion);
      const base = { ventaId: venta.id, productoId: leche.id, subtotal: '0.00' };
      const otro = await Producto.create(
        { nombre: 'Otro', precio: '1.00', codigoBarras: 'OTRO-1' },
        { transaction: transaccion },
      );
      const conCantidadEnCero = await errorDeMySQL(
        DetalleVenta.create(
          { ...base, productoId: otro.id, cantidad: 0, precioAplicado: '1.00' },
          { transaction: transaccion },
        ),
      );
      expect(conCantidadEnCero?.errno).toBe(ER_CHECK_CONSTRAINT_VIOLATED);
      const conPrecioNegativo = await errorDeMySQL(
        DetalleVenta.create(
          { ...base, productoId: otro.id, cantidad: 1, precioAplicado: '-1.00' },
          { transaction: transaccion },
        ),
      );
      expect(conPrecioNegativo?.errno).toBe(ER_CHECK_CONSTRAINT_VIOLATED);
    });
  });

  it('borrar con el modelo un producto que está en una venta también lo impide: error 1451 (RN-13)', async () => {
    await conTransaccionDescartada(async ({ transaccion }) => {
      const { leche } = await prepararVentaDeEjemplo(transaccion);
      const error = await errorDeMySQL(
        Producto.destroy({ where: { id: leche.id }, transaction: transaccion }),
      );
      expect(error?.errno).toBe(ER_ROW_IS_REFERENCED);
      expect(await Producto.findByPk(leche.id, { transaction: transaccion })).not.toBeNull();
    });
  });

  it('borrar con el modelo una venta que tiene detalles también lo impide: error 1451', async () => {
    await conTransaccionDescartada(async ({ transaccion }) => {
      const { venta } = await prepararVentaDeEjemplo(transaccion);
      const error = await errorDeMySQL(
        Venta.destroy({ where: { id: venta.id }, transaction: transaccion }),
      );
      expect(error?.errno).toBe(ER_ROW_IS_REFERENCED);
      expect(await Venta.findByPk(venta.id, { transaction: transaccion })).not.toBeNull();
    });
  });
});
