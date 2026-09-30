'use strict';

const { validarTexto, exigirDatosValidos } = require('./comunes');

// El texto de búsqueda se recorta y tiene de 2 a 120 caracteres. 120 es el largo máximo de un nombre (RN-04), y un
// código de barras (máximo 50) cabe dentro. Con menos de 2 caracteres se buscaría casi todo (RF-02).
const LARGO_MINIMO_DE_LA_BUSQUEDA = 2;
const LARGO_MAXIMO_DE_LA_BUSQUEDA = 120;
const MENSAJE_DE_LA_BUSQUEDA = `El texto de búsqueda debe tener entre ${LARGO_MINIMO_DE_LA_BUSQUEDA} y ${LARGO_MAXIMO_DE_LA_BUSQUEDA} caracteres.`;

// Recibe el valor crudo de req.query.busqueda y devuelve el texto limpio, o lanza un 400 DATOS_INVALIDOS con el
// campo busqueda en los detalles del error. Un valor que no es texto (por ejemplo la lista de ?busqueda=a&busqueda=b) es un 400:
// no se convierte. Es lo primero que corre: un texto inválido no llega a la base de datos (Input Validation).
function validarBusqueda(valor) {
  const texto = validarTexto(valor, 'busqueda', { maximo: LARGO_MAXIMO_DE_LA_BUSQUEDA });
  // validarTexto solo pide que no quede vacío: el mínimo de 2 lo comprueba esta función.
  const muyCorto =
    texto.valor !== undefined && [...texto.valor].length < LARGO_MINIMO_DE_LA_BUSQUEDA;
  const resultado = muyCorto
    ? {
        detalleDelError: {
          campo: 'busqueda',
          mensaje: `Escribe al menos ${LARGO_MINIMO_DE_LA_BUSQUEDA} caracteres.`,
        },
      }
    : texto;
  exigirDatosValidos(MENSAJE_DE_LA_BUSQUEDA, [resultado]);
  return resultado.valor;
}

module.exports = { validarBusqueda };
