'use strict';
const { sequelize } = require('../db');

async function registrarVenta(lineas) {
  const filas = await sequelize.query('CALL sp_registrar_venta(:lineas)', {
    replacements: { lineas: JSON.stringify(lineas) },
  });
  return filas[0];
}

module.exports = { registrarVenta };
