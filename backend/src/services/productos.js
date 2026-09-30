'use strict';

const { Op } = require('sequelize');
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

module.exports = { RESULTADOS_MAXIMOS, escaparParaLike, buscarProductos };
