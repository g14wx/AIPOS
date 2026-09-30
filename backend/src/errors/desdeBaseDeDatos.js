'use strict';

const ErrorApi = require('./ErrorApi');

const CODIGO_DE_REGLA = /^[A-Z][A-Z0-9_]*$/;

// Traduce el error de MySQL (por err.parent.errno) a un ErrorApi.
// Devuelve null si no lo reconoce: entonces sigue como 500. Nunca copia el texto del SQL ni el de MySQL.
function desdeBaseDeDatos(err) {
  const original = err && (err.parent || err.original);
  if (!original || typeof original.errno !== 'number') return null;

  switch (original.errno) {
    case 1644: {
      const codigo = CODIGO_DE_REGLA.test(original.sqlMessage)
        ? original.sqlMessage
        : 'REGLA_DE_NEGOCIO';
      return new ErrorApi(422, codigo, 'La petición no cumple una regla del negocio.');
    }
    case 1062:
      return new ErrorApi(409, 'CONFLICTO', 'Ya existe un registro con ese dato.');
    case 1452:
      return new ErrorApi(404, 'NO_ENCONTRADO', 'No se encontró un dato que la petición nombra.');
    case 3140:
    case 3819:
      return new ErrorApi(400, 'DATOS_INVALIDOS', 'Los datos de la petición no son válidos.');
    default:
      return null;
  }
}

module.exports = desdeBaseDeDatos;
