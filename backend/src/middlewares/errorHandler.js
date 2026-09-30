'use strict';

const ErrorApi = require('../errors/ErrorApi');
const desdeBaseDeDatos = require('../errors/desdeBaseDeDatos');
const aFormatoDeError = require('../errors/aFormatoDeError');

// Señales propias del lector de JSON de Express (body-parser). Los errores que él lanza traen `status` 4xx
// y un `type` como entity.parse.failed. Un cuerpo comprimido que no se puede descomprimir no trae `type`:
// trae el `code` de zlib (Z_DATA_ERROR en gzip y deflate) o el de brotli (ERR__ERROR_FORMAT_*).
// Un error 4xx que no trae ninguna de las dos no es del lector: puede ser un fallo del servidor con un
// `status` casual, y sigue como 500, con su stack en el log.
const TIPO_DEL_LECTOR = /^(entity|encoding|charset|request|stream)\./;
const CODIGO_DE_DESCOMPRESION = /^(Z_[A-Z_]+|ERR__ERROR_[A-Z0-9_]+)$/;

function esDelLector(err) {
  if (!(err.status >= 400 && err.status < 500)) return false;
  return TIPO_DEL_LECTOR.test(err.type ?? '') || CODIGO_DE_DESCOMPRESION.test(err.code ?? '');
}

function desdeElCuerpo(err) {
  if (!err || !esDelLector(err)) return null;
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
  const errorApi = aErrorApi(err);
  return res.status(errorApi.estado).json(aFormatoDeError(errorApi));
}

module.exports = errorHandler;
