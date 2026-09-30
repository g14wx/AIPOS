'use strict';

const { validarVentaNueva } = require('../validators/ventas');
const servicio = require('../services/ventas');

// POST /api/ventas. Valida el cuerpo antes de tocar la base de datos, registra la venta con todos sus detalles
// (el procedimiento sp_registrar_venta, desde el servicio) y responde 201 con el número de la venta y el total que
// calculó MySQL. Sin la cabecera Location: no hay una ruta para pedir una sola venta.
// Un error del validador (400) o del servicio (422 o 500) llega solo al manejador de errores (Express 5).
async function registrarVenta(req, res) {
  const { detalles } = validarVentaNueva(req.body);
  const venta = await servicio.registrarVenta(detalles);
  res.status(201).json(venta);
}

module.exports = { registrarVenta };
