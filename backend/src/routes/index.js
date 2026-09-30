'use strict';

const { Router } = require('express');
const salud = require('./salud');
const productos = require('./productos');
const docs = require('./docs');

// Cada recurso monta su router con su prefijo. La tarjeta que crea una ruta agrega su entrada aquí y su ruta a la
// documentación de la API (backend/docs): la prueba de rutas documentadas falla si falta cualquiera de las dos.
const montajes = [
  { ruta: '/salud', router: salud },
  { ruta: '/productos', router: productos },
];

function crearRouterApi(lista = montajes) {
  const router = Router();
  for (const { ruta, router: hijo } of lista) router.use(ruta, hijo);
  // La página de la documentación no se describe a sí misma: va fuera de `montajes`, y esa prueba lo sabe.
  router.use('/docs', docs);
  return router;
}

module.exports = { montajes, crearRouterApi };
