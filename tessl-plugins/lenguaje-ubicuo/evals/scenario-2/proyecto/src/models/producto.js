'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Producto extends Model {}

  Producto.init(
    {
      nombre: { type: DataTypes.STRING(120), allowNull: false },
      precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      codigoBarras: { type: DataTypes.STRING(64), allowNull: false, unique: true, field: 'codigo_barras' },
    },
    { sequelize, modelName: 'Producto', tableName: 'productos', underscored: true }
  );

  return Producto;
};
