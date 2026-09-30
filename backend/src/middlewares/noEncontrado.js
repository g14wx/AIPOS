'use strict';

const ErrorApi = require('../errors/ErrorApi');

// Cae aquí toda ruta que ninguna otra atendió.
function noEncontrado(req, res, next) {
  next(new ErrorApi(404, 'NO_ENCONTRADO', 'La ruta no existe.'));
}

module.exports = noEncontrado;
