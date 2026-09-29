'use strict';
const { Op } = require('sequelize');
const { Producto } = require('../db');

const escaparLike = (s) => s.replace(/[\\%_]/g, '\\$&');

async function buscarProductos(texto) {
  return Producto.findAll({
    where: { [Op.or]: [{ codigoBarras: texto }, { nombre: { [Op.like]: `%${escaparLike(texto)}%` } }] },
    limit: 20,
  });
}

async function agregarProducto({ nombre, precio, codigoBarras }) {
  return Producto.create({ nombre, precio, codigoBarras });
}

module.exports = { buscarProductos, agregarProducto };
