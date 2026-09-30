'use strict';

const { Op } = require('sequelize');
const ErrorApi = require('../errors/ErrorApi');
const { sequelize, Producto } = require('../models');

// Cuántos productos devuelve una búsqueda como máximo (pregunta abierta 3 de los requerimientos).
const RESULTADOS_MAXIMOS = 20;

// Antepone \ a cada \, % y _ para que el LIKE de MySQL los tome como texto normal y no como comodines (RNF-04).
// MySQL usa \ como carácter de escape del LIKE por defecto. Es una función pura: no toca la base de datos.
// Sin esto, buscar "50%" devolvería todos los productos con "50" en el nombre.
function escaparParaLike(texto) {
  return texto.replace(/[\\%_]/g, '\\$&');
}

// Busca productos por una parte del nombre (sin importar mayúsculas ni tildes: lo da la comparación por defecto de
// MySQL, utf8mb4_0900_ai_ci) o por el código de barras exacto. Recibe el texto ya validado y recortado, y devuelve
// la lista con id, nombre, codigoBarras y precio (el precio como texto de 2 decimales, como lo devuelve MySQL).
// Solo lee. El texto del cajero nunca se pega en el SQL: va en el patrón del LIKE, en Op.eq y en replacements.
async function buscarProductos(texto) {
  return Producto.findAll({
    attributes: ['id', 'nombre', 'codigoBarras', 'precio'],
    where: {
      [Op.or]: [
        { nombre: { [Op.like]: `%${escaparParaLike(texto)}%` } },
        { codigoBarras: { [Op.eq]: texto } },
      ],
    },
    // Primero el producto cuyo código de barras es igual al texto, para que nunca quede fuera de los 20; después
    // por nombre de la A a la Z y, si empatan, por id. Así el mismo texto siempre da la misma lista.
    order: [
      [sequelize.literal('codigo_barras = :texto'), 'DESC'],
      ['nombre', 'ASC'],
      ['id', 'ASC'],
    ],
    limit: RESULTADOS_MAXIMOS,
    replacements: { texto },
    raw: true,
  });
}

const MENSAJE_DEL_DUPLICADO = 'Ya existe un producto con ese código de barras.';

// MySQL 8.4 dice qué índice rechazó la fila al final del mensaje del error 1062:
// "Duplicate entry '<valor>' for key 'productos.uq_productos_codigo_barras'". Se mira solo el final: el valor va
// antes y lo escribe el cajero, así que un código de barras con ese texto no puede engañar a la comparación.
const FINAL_DEL_INDICE_DEL_CODIGO_DE_BARRAS = /for key '(?:[^'.]+\.)?uq_productos_codigo_barras'$/;

// Es el error del índice único del código de barras (error 1062 con el nombre fijo del índice). Como es el único
// índice único además de la llave primaria, que se llena sola, ese error es siempre un código de barras repetido.
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

module.exports = { RESULTADOS_MAXIMOS, escaparParaLike, buscarProductos, crearProducto };
