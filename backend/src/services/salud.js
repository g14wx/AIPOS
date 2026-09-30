'use strict';

// Dice si la API está viva. B-03 le suma la revisión de la conexión a MySQL.
async function consultarSalud() {
  return { estado: 'ok' };
}

module.exports = { consultarSalud };
