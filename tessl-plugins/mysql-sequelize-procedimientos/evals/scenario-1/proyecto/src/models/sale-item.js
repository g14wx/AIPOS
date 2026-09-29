'use strict';
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const SaleItem = sequelize.define('SaleItem', {
  saleId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, { tableName: 'sale_items', underscored: true });

module.exports = { SaleItem };
