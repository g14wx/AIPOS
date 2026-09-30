'use strict';

const { validarTexto, validarDinero, exigirDatosValidos } = require('./comunes');

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

const MENSAJE_DEL_PRODUCTO = 'Los datos del producto no son válidos. Revisa los campos marcados.';

// Los largos de RN-04: los mismos de las columnas de la tabla productos.
const LARGO_DEL_NOMBRE = 120;
const LARGO_DEL_CODIGO_DE_BARRAS = 50;

// Un cuerpo que falta (petición sin Content-Type: application/json: en Express 5, req.body llega undefined) o que
// es un arreglo se trata como un cuerpo vacío: el 400 sale con los tres campos obligatorios y no como un error de
// JavaScript, que sería un 500. Por la API no llega un JSON que no sea objeto ni arreglo (null, 5, "x"): el lector de
// Express lo rechaza antes como 400 JSON_INVALIDO (spec crear-producto, "Contrato"). Si otro código llama al
// validador con uno, también se trata como un cuerpo vacío.
function comoObjeto(cuerpo) {
  return cuerpo !== null && typeof cuerpo === 'object' && !Array.isArray(cuerpo) ? cuerpo : {};
}

// Revisa el cuerpo de POST /api/productos antes de tocar la base de datos (RN-01 a RN-04) y devuelve solo los tres
// datos limpios, o lanza un ErrorApi 400 con todos los campos con problema, en el orden nombre, precio y código de
// barras. Los campos que sobran se ignoran: el id lo pone MySQL. El precio se devuelve tal cual: no se recorta,
// " 25" es un 400. Los nombres y los códigos de barras sí se recortan (trim de JavaScript, no el TRIM de MySQL).
function validarProductoNuevo(cuerpo) {
  const datos = comoObjeto(cuerpo);
  const nombre = validarTexto(datos.nombre, 'nombre', { maximo: LARGO_DEL_NOMBRE });
  const precio = validarDinero(datos.precio, 'precio');
  const codigoBarras = validarTexto(datos.codigoBarras, 'codigoBarras', {
    maximo: LARGO_DEL_CODIGO_DE_BARRAS,
  });
  exigirDatosValidos(MENSAJE_DEL_PRODUCTO, [nombre, precio, codigoBarras]);
  return { nombre: nombre.valor, precio: precio.valor, codigoBarras: codigoBarras.valor };
}

module.exports = { validarBusqueda, validarProductoNuevo };
