'use strict';

const ErrorApi = require('../errors/ErrorApi');

// Las piezas de validación que usan todos los recursos (spec de arquitectura, "Validación" y "Dinero").
// Ninguna lanza por un dato malo: devuelven { valor } con el dato limpio, o { detalleDelError: { campo, mensaje } }.
// Así el validador de un recurso las llama todas y junta los campos con problema en vez de cortar en el primero
// (Validation Pattern), y exigirDatosValidos lanza el 400 una sola vez.

const FORMA_DEL_DINERO = /^\d+(\.\d+)?$/;
const SOLO_CEROS = /^0+(\.0+)?$/;

const bueno = (valor) => ({ valor });
const conProblema = (campo, mensaje) => ({ detalleDelError: { campo, mensaje } });

// Un texto del cajero: le quita los espacios de los extremos y revisa que no quede vacío ni pase del máximo.
// trim() de JavaScript quita más que el espacio normal (tabulador, salto de línea, espacio no separable...) y el
// CHECK de MySQL solo ve el espacio normal: por eso el recorte es de la API, no de la base.
function validarTexto(valor, campo, { maximo = Infinity } = {}) {
  if (valor === undefined || valor === null) return conProblema(campo, 'Es obligatorio.');
  if (typeof valor !== 'string') return conProblema(campo, 'Debe ser un texto.');
  const limpio = valor.trim();
  if (limpio === '') return conProblema(campo, 'Es obligatorio.');
  // El largo se cuenta en caracteres, como lo cuenta MySQL, y no en unidades de UTF-16: un emoji cuenta 1.
  // Solo se separa en caracteres cuando las unidades de UTF-16 ya pasan del máximo.
  if (limpio.length > maximo && [...limpio].length > maximo) {
    return conProblema(campo, `No puede pasar de ${maximo} caracteres.`);
  }
  return bueno(limpio);
}

// Un dinero que llega como texto con la forma ^\d{1,5}(\.\d{1,2})?$ (hasta 99999.99). Sin permiteCero tiene que ser
// mayor que 0, como el precio de un producto (RN-02). Devuelve el texto tal cual: el backend no formatea dinero,
// y MySQL redondea sin avisar cuando le llegan más de 2 decimales, así que la API los rechaza aquí.
// Se dice solo el primer problema, en este orden: falta, no es un texto, la forma, los decimales, los enteros y el cero.
function validarDinero(valor, campo, { permiteCero = false } = {}) {
  if (valor === undefined || valor === null || valor === '') {
    return conProblema(campo, 'Es obligatorio.');
  }
  if (typeof valor !== 'string') {
    return conProblema(campo, 'Debe enviarse como texto, por ejemplo "25.50".');
  }
  if (!FORMA_DEL_DINERO.test(valor)) {
    return conProblema(campo, 'Debe ser un número con punto decimal, por ejemplo 25.50.');
  }
  const [enteros, decimales = ''] = valor.split('.');
  if (decimales.length > 2) return conProblema(campo, 'No puede tener más de 2 decimales.');
  if (enteros.length > 5) return conProblema(campo, 'No puede ser mayor que 99999.99.');
  if (!permiteCero && SOLO_CEROS.test(valor)) return conProblema(campo, 'Debe ser mayor que 0.');
  return bueno(valor);
}

// Si algún resultado trae un detalle del error, lanza un 400 DATOS_INVALIDOS con los detalles del error de todos los
// campos con problema, en el orden en que llegaron los resultados.
function exigirDatosValidos(mensaje, resultados) {
  const detalles = resultados
    .filter((resultado) => resultado.detalleDelError)
    .map((resultado) => resultado.detalleDelError);
  if (detalles.length > 0) throw new ErrorApi(400, 'DATOS_INVALIDOS', mensaje, detalles);
}

module.exports = { validarTexto, validarDinero, exigirDatosValidos };
