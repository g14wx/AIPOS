'use strict';

const { Router } = require('express');
const salud = require('./salud');

// Cada recurso monta su router con su prefijo. La tarjeta que crea una ruta agrega su entrada aquí.
const montajes = [{ ruta: '/salud', router: salud }];

function crearRouterApi(lista = montajes) {
  const router = Router();
  for (const { ruta, router: hijo } of lista) router.use(ruta, hijo);
  return router;
}

module.exports = { montajes, crearRouterApi };
