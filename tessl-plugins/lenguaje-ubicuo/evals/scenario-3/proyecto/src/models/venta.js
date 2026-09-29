'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Venta extends Model {}

  Venta.init(
    {
      total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    },
    { sequelize, modelName: 'Venta', tableName: 'ventas', underscored: true }
  );

  return Venta;
};
