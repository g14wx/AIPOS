'use strict';

const { validarProductoNuevo } = require('../validators/productos');
const productos = require('../services/productos');

// POST /api/productos. Valida el cuerpo antes de tocar la base, guarda el producto y responde 201 con el
// producto guardado. Sin la cabecera Location: no hay una ruta para pedir un solo producto.
// Un error del validador o del servicio llega solo al manejador de errores (Express 5).
async function crearProducto(req, res) {
  const datos = validarProductoNuevo(req.body);
  const producto = await productos.crearProducto(datos);
  res.status(201).json(producto);
}

module.exports = { crearProducto };
