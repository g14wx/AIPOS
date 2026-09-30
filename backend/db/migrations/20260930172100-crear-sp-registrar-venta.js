'use strict';

const fs = require('node:fs');
const path = require('node:path');

// Crea el procedimiento sp_registrar_venta (spec registrar-venta, tarjeta V-02). Va después de las migraciones de
// ventas y detalles_venta, porque el procedimiento usa esas dos tablas y la de productos.
//
// La fuente es db/procedimientos/sp_registrar_venta.sql, el mismo archivo que corre el cliente mysql. Esta migración
// saca de él solo el bloque CREATE PROCEDURE ... END (lo que está entre la línea DELIMITER y su cierre) y lo manda
// después del DROP. DELIMITER es un comando del cliente mysql: por mysql2 daría el error 1064. El bloque es una sola
// sentencia, así que no hace falta activar el modo de varias sentencias.
//
// Para cambiar el procedimiento después de entregarlo se agrega una migración nueva que lo borra y lo crea otra vez.
// Esta no se edita.
const NOMBRE = 'sp_registrar_venta';
const ARCHIVO = path.resolve(__dirname, '..', 'procedimientos', `${NOMBRE}.sql`);

// El bloque CREATE PROCEDURE ... END del .sql, sin la línea DELIMITER ni el cierre.
function leerCreate() {
  const texto = fs.readFileSync(ARCHIVO, 'utf8');
  const bloque = texto.match(/^[ \t]*DELIMITER[ \t]+\$\$[ \t]*\r?\n([\s\S]*?)\$\$[ \t]*\r?$/im);
  if (!bloque) throw new Error(`${ARCHIVO} no tiene un bloque DELIMITER $$ ... $$`);
  return bloque[1].trim();
}

module.exports = {
  async up(queryInterface) {
    // DROP y CREATE van en dos llamadas separadas. El CREATE se manda sin replacements ni opciones: con
    // replacements, Sequelize cambiaría cualquier :nombre que hubiera en el cuerpo.
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS ${NOMBRE}`);
    await queryInterface.sequelize.query(leerCreate());
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS ${NOMBRE}`);
  },
};
