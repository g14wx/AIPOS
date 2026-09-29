'use strict';
const { sequelize } = require('../db');

// Registra la venta y sus detalles con el procedimiento almacenado sp_registrar_venta.
async function registrarVenta(detalles) {
  const filas = await sequelize.query('CALL sp_registrar_venta(:detalles)', {
    replacements: { detalles: JSON.stringify(detalles) },
  });
  return filas[0];
}

module.exports = { registrarVenta };
