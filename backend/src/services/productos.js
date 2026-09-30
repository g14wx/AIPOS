'use strict';

const ErrorApi = require('../errors/ErrorApi');
const { Producto } = require('../models');

const MENSAJE_DEL_DUPLICADO = 'Ya existe un producto con ese código de barras.';

// MySQL 8.4 dice qué índice rechazó la fila al final del mensaje del error 1062:
// "Duplicate entry '<valor>' for key 'productos.uq_productos_codigo_barras'". Se mira solo el final: el valor va
// antes y lo escribe el cajero, así que un código de barras con ese texto no puede engañar a la comparación.
const FINAL_DEL_INDICE_DEL_CODIGO_DE_BARRAS = /for key '(?:[^'.]+\.)?uq_productos_codigo_barras'$/;

// Es el error del índice único del código de barras (error 1062 con el nombre fijo del índice). Como es el único
// índice único además de la llave primaria, que se llena sola, un 1062 con ese nombre es siempre un código repetido.
// Cualquier otro error no se reconoce aquí: no se traduce por adivinar.
function esCodigoDeBarrasRepetido(err) {
  const original = err && (err.parent || err.original);
  return (
    Boolean(original) &&
    original.errno === 1062 &&
    typeof original.sqlMessage === 'string' &&
    FINAL_DEL_INDICE_DEL_CODIGO_DE_BARRAS.test(original.sqlMessage)
  );
}

function errorDeCodigoDeBarrasRepetido() {
  return new ErrorApi(409, 'CODIGO_BARRAS_DUPLICADO', MENSAJE_DEL_DUPLICADO, [
    { campo: 'codigoBarras', mensaje: MENSAJE_DEL_DUPLICADO },
  ]);
}

// Guarda un producto con los datos que el validador ya limpió y devuelve el producto guardado.
// No hay una consulta previa de "¿ya existe?": dos peticiones iguales al mismo tiempo pasarían las dos. Decide el
// índice único de MySQL, y el error de la que llega segunda se traduce a un 409. Después se lee la fila guardada
// (reload) para devolver el precio con 2 decimales, como lo guarda MySQL: el backend no formatea dinero.
async function crearProducto({ nombre, precio, codigoBarras }) {
  let producto;
  try {
    producto = await Producto.create({ nombre, precio, codigoBarras });
  } catch (err) {
    throw esCodigoDeBarrasRepetido(err) ? errorDeCodigoDeBarrasRepetido() : err;
  }
  await producto.reload();
  return {
    id: producto.id,
    nombre: producto.nombre,
    precio: producto.precio,
    codigoBarras: producto.codigoBarras,
  };
}

module.exports = { crearProducto };
