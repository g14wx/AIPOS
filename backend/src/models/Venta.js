'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../database');

// La tabla ventas (migración crear-ventas). Registrar una venta lo hace el procedimiento sp_registrar_venta:
// este modelo sirve para consultar (una venta con sus detalles) y para las pruebas. No tiene reglas de negocio
// ni validaciones: la API valida y MySQL protege. Por eso ningún atributo lleva allowNull, y la fecha no lleva
// valor por defecto: la pone MySQL al registrar la venta (RN-12). Nadie llama a sequelize.sync(): el esquema
// sale solo de las migraciones. Las relaciones con DetalleVenta están en models/index.js.
const Venta = sequelize.define(
  'Venta',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // DATETIME en UTC: Sequelize la devuelve como Date.
    fecha: { type: DataTypes.DATE },
    // DECIMAL(12,2): mysql2 lo devuelve como texto ("47.50") y aquí se queda como texto.
    total: { type: DataTypes.DECIMAL(12, 2) },
  },
  { tableName: 'ventas', freezeTableName: true, underscored: true, timestamps: false },
);

module.exports = Venta;
