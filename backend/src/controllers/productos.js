'use strict';

const { validarBusqueda, validarProductoNuevo } = require('../validators/productos');
const servicio = require('../services/productos');

// GET /api/productos?busqueda=<texto>: valida el texto, busca los productos y responde con la lista, que puede
// estar vacía. Sin coincidencias no es un error. Un texto inválido lanza un 400 antes de tocar la base de datos.
async function buscarProductos(req, res) {
  const texto = validarBusqueda(req.query.busqueda);
  res.json(await servicio.buscarProductos(texto));
}

// POST /api/productos. Valida el cuerpo antes de tocar la base, guarda el producto y responde 201 con el
// producto guardado. Sin la cabecera Location: no hay una ruta para pedir un solo producto.
// Un error del validador o del servicio llega solo al manejador de errores (Express 5).
async function crearProducto(req, res) {
  const datos = validarProductoNuevo(req.body);
  const producto = await servicio.crearProducto(datos);
  res.status(201).json(producto);
}

module.exports = { buscarProductos, crearProducto };
