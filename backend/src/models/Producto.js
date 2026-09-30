'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../database');

// La tabla productos (migración crear-productos). El modelo no tiene reglas de negocio ni validaciones:
// la API valida y MySQL protege (NOT NULL, CHECK e índice único). Por eso ningún atributo lleva allowNull.
// Nadie llama a sequelize.sync(): el esquema sale solo de la migración.
const Producto = sequelize.define(
  'Producto',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(120) },
    // DECIMAL(10,2): mysql2 lo devuelve como texto ("25.00") y aquí se queda como texto.
    precio: { type: DataTypes.DECIMAL(10, 2) },
    codigoBarras: { type: DataTypes.STRING(50), field: 'codigo_barras' },
  },
  { tableName: 'productos', freezeTableName: true, underscored: true, timestamps: false },
);

module.exports = Producto;
