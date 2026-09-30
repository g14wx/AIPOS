'use strict';

const { Sequelize } = require('sequelize');
const { config } = require('./config');

const { host, puerto, nombre, usuario, clave } = config.baseDeDatos;

// La instancia se crea sin conectar: Sequelize abre la conexión con la primera consulta.
// No se activa decimalNumbers: mysql2 devuelve DECIMAL como texto y el dinero se queda como texto.
const sequelize = new Sequelize(nombre, usuario, clave, {
  host,
  port: puerto,
  dialect: 'mysql',
  timezone: '+00:00',
  logging: false,
});

module.exports = sequelize;
