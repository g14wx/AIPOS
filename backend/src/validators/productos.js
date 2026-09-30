'use strict';

const { validarTexto, validarDinero, exigirDatosValidos } = require('./comunes');

const MENSAJE_DEL_PRODUCTO = 'Los datos del producto no son válidos. Revisa los campos marcados.';

// Los largos de RN-04: los mismos de las columnas de la tabla productos.
const LARGO_DEL_NOMBRE = 120;
const LARGO_DEL_CODIGO_DE_BARRAS = 50;

// Un cuerpo que falta (petición sin Content-Type: application/json: en Express 5, req.body llega undefined) o que
// no es un objeto se trata como un cuerpo vacío: el 400 sale con los tres campos obligatorios y no como un error de
// JavaScript, que sería un 500. Un arreglo tampoco es un cuerpo de producto.
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

module.exports = { validarProductoNuevo };
