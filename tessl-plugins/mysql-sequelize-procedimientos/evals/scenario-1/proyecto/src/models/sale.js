'use strict';
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Sale = sequelize.define('Sale', {
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, { tableName: 'sales', underscored: true });

module.exports = { Sale };
