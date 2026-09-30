'use strict';

const { validarBusqueda } = require('../validators/productos');
const servicio = require('../services/productos');

// GET /api/productos?busqueda=<texto>: valida el texto, busca los productos y responde con la lista, que puede
// estar vacía. Sin coincidencias no es un error. Un texto inválido lanza un 400 antes de tocar la base de datos.
async function buscarProductos(req, res) {
  const texto = validarBusqueda(req.query.busqueda);
  res.json(await servicio.buscarProductos(texto));
}

module.exports = { buscarProductos };
