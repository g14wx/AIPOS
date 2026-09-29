'use strict';
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING(120), allowNull: false },
  barcode: { type: DataTypes.STRING(32), allowNull: false, unique: true },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, { tableName: 'products', underscored: true });

module.exports = { Product };
