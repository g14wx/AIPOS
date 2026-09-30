'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../database');

// La tabla detalles_venta (migración crear-detalles-venta). Sirve para consultar y para las pruebas: la escritura
// de una venta con sus detalles la hace el procedimiento sp_registrar_venta. No tiene reglas de negocio ni
// validaciones: la API valida y MySQL protege (CHECK, llaves foráneas e índice único), por eso ningún atributo
// lleva allowNull. Nadie llama a sequelize.sync(): el esquema sale solo de las migraciones.
//
// ventaId y productoId se declaran aquí, cada uno con su columna, y sus relaciones (models/index.js) usan esos
// mismos atributos como llave foránea. Así Sequelize no inventa VentaId ni ProductoId.
const DetalleVenta = sequelize.define(
  'DetalleVenta',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ventaId: { type: DataTypes.INTEGER, field: 'venta_id' },
    productoId: { type: DataTypes.INTEGER, field: 'producto_id' },
    cantidad: { type: DataTypes.INTEGER },
    // DECIMAL(10,2): mysql2 lo devuelve como texto ("22.00") y aquí se queda como texto.
    precioAplicado: { type: DataTypes.DECIMAL(10, 2), field: 'precio_aplicado' },
    // DECIMAL(12,2): el subtotal más grande es 99 899 990.01 (999 × 99 999.99).
    subtotal: { type: DataTypes.DECIMAL(12, 2) },
  },
  { tableName: 'detalles_venta', freezeTableName: true, underscored: true, timestamps: false },
);

module.exports = DetalleVenta;
