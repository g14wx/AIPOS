'use strict';

const sequelize = require('../database');
const Producto = require('./Producto');
const Venta = require('./Venta');
const DetalleVenta = require('./DetalleVenta');

// Las relaciones (spec registrar-venta, "Tablas y modelos"). Se arman aquí, donde ya están los tres modelos,
// y por eso el resto del backend importa los modelos desde este archivo y no desde cada uno:
// - La llave foránea va fijada a mano (ventaId y productoId, atributos de DetalleVenta): Sequelize no inventa
//   VentaId ni ProductoId.
// - `as` fija el nombre en español. Sin él, Sequelize singulariza y pluraliza en inglés y dice "Ventum" y
//   "DetalleVentas".
// - onDelete: 'RESTRICT' dice lo mismo que las llaves foráneas de la migración (RN-13). Sequelize solo lo usaría
//   al crear las tablas con sync(), y nadie lo llama: la base ya tiene sus llaves por la migración.
Venta.hasMany(DetalleVenta, { as: 'detalles', foreignKey: 'ventaId', onDelete: 'RESTRICT' });
DetalleVenta.belongsTo(Venta, { as: 'venta', foreignKey: 'ventaId', onDelete: 'RESTRICT' });
DetalleVenta.belongsTo(Producto, {
  as: 'producto',
  foreignKey: 'productoId',
  onDelete: 'RESTRICT',
});
Producto.hasMany(DetalleVenta, { as: 'detalles', foreignKey: 'productoId', onDelete: 'RESTRICT' });

module.exports = { sequelize, Producto, Venta, DetalleVenta };
