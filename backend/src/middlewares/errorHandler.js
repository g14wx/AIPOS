'use strict';

const ErrorApi = require('../errors/ErrorApi');
const desdeBaseDeDatos = require('../errors/desdeBaseDeDatos');

// Errores del cliente que lanza el lector de JSON de Express (body-parser): siempre traen `status` 4xx.
// Casi todos traen también `type`, pero no todos: un cuerpo comprimido que no se puede descomprimir
// trae `status` 400 y ningún `type`, y también es un error del cliente (no un 500).
function desdeElCuerpo(err) {
  if (!err || !(err.status >= 400 && err.status < 500)) return null;
  if (err.type === 'entity.too.large') {
    return new ErrorApi(400, 'CUERPO_MUY_GRANDE', 'El cuerpo de la petición es demasiado grande.');
  }
  if (err.type === 'entity.parse.failed') {
    return new ErrorApi(400, 'JSON_INVALIDO', 'El cuerpo de la petición no es un JSON válido.');
  }
  return new ErrorApi(400, 'DATOS_INVALIDOS', 'La petición no se pudo leer.');
}

function aErrorApi(err) {
  if (err instanceof ErrorApi) return err;
  const conocido = desdeElCuerpo(err) || desdeBaseDeDatos(err);
  if (conocido) return conocido;
  // Un 500 se escribe entero en el log del servidor y nunca sale al cliente.
  console.error(err);
  return new ErrorApi(500, 'ERROR_INTERNO', 'Ocurrió un error inesperado. Intenta de nuevo.');
}

// Express reconoce un manejador de errores por sus cuatro parámetros: no quitar `next`.
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const { estado, codigo, message, detalles } = aErrorApi(err);
  const cuerpo = { codigo, mensaje: message };
  if (detalles !== undefined) cuerpo.detalles = detalles;
  return res.status(estado).json({ error: cuerpo });
}

module.exports = errorHandler;
