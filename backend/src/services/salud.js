'use strict';

const sequelize = require('../database');

// Dice si la API está viva y si MySQL responde. Health Check: solo lee, no cambia nada en la base.
// Si authenticate() falla, el error sigue de largo hasta el manejador de errores, que responde 500
// con el formato de error y sin el texto de MySQL.
async function consultarSalud() {
  await sequelize.authenticate();
  return { estado: 'ok', baseDeDatos: 'ok' };
}

module.exports = { consultarSalud };
