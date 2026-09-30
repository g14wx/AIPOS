'use strict';

const { consultarSalud } = require('../services/salud');

async function obtenerSalud(req, res) {
  res.json(await consultarSalud());
}

module.exports = { obtenerSalud };
