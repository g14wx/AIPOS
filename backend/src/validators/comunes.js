'use strict';

const ErrorApi = require('../errors/ErrorApi');

// Piezas de validación que comparten todos los recursos (spec de arquitectura, "Validación"). Ninguna lanza:
// devuelven { valor } con el dato limpio o { detalleDelError: { campo, mensaje } }, para que el validador de cada
// recurso junte todos los campos con problema y no solo el primero. exigirDatosValidos los junta y lanza el 400.

function conProblema(campo, mensaje) {
  return { detalleDelError: { campo, mensaje } };
}

// Cuenta caracteres como CHAR_LENGTH de MySQL: un emoji cuenta 1, y no 2 como length (unidades de UTF-16).
function contarCaracteres(texto) {
  return [...texto].length;
}

// Quita los espacios de los extremos y revisa que no quede vacío ni pase del largo máximo. Recorta con trim() de
// JavaScript, que quita más que el espacio normal (el CHECK de MySQL solo ve ese). Un valor que no es texto no se
// convierte. Sin `maximo`, solo revisa que no quede vacío.
function validarTexto(valor, campo, { maximo } = {}) {
  if (valor === undefined || valor === null) return conProblema(campo, 'Es obligatorio.');
  if (typeof valor !== 'string') return conProblema(campo, 'Debe ser un texto.');
  const texto = valor.trim();
  if (texto === '') return conProblema(campo, 'Es obligatorio.');
  if (maximo !== undefined && contarCaracteres(texto) > maximo) {
    return conProblema(campo, `No puede pasar de ${maximo} caracteres.`);
  }
  return { valor: texto };
}

// Si algún resultado trae un problema, lanza un solo 400 DATOS_INVALIDOS con el detalle de cada campo con
// problema, en el mismo orden. Si todos son buenos, no hace nada.
function exigirDatosValidos(mensaje, resultados) {
  const detalles = resultados
    .filter((resultado) => resultado.detalleDelError)
    .map((resultado) => resultado.detalleDelError);
  if (detalles.length > 0) throw new ErrorApi(400, 'DATOS_INVALIDOS', mensaje, detalles);
}

module.exports = { validarTexto, exigirDatosValidos };
