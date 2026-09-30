'use strict';

// Arma el formato de error de la API, { "error": { "codigo", "mensaje", "detalles" } }, a partir de un ErrorApi.
// `detalles` solo va cuando el error los trae. Es el único lugar que arma ese cuerpo: lo usan el manejador de errores
// de Express y la respuesta de crearServidor a una petición que Node rechaza antes de que llegue a Express.
function aFormatoDeError({ codigo, message, detalles }) {
  const error = { codigo, mensaje: message };
  if (detalles !== undefined) error.detalles = detalles;
  return { error };
}

module.exports = aFormatoDeError;
