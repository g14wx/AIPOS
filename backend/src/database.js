'use strict';

const { Sequelize } = require('sequelize');
const { config } = require('./config');

const { host, puerto, nombre, usuario, clave } = config.baseDeDatos;

// Cuánto espera mysql2 a que MySQL conteste el saludo con el que empieza una conexión. Por defecto son 10 s.
// Igual que el tope de la salud (src/services/salud.js): si MySQL acepta la conexión y no saluda, el intento
// se corta a los 3 s y no queda pendiente, ocupando un lugar del pool, después de que la salud ya respondió 500.
const ESPERA_DEL_SALUDO_MS = 3000;

// La instancia se crea sin conectar: Sequelize abre la conexión con la primera consulta.
// No se activa decimalNumbers: mysql2 devuelve DECIMAL como texto y el dinero se queda como texto.
const sequelize = new Sequelize(nombre, usuario, clave, {
  host,
  port: puerto,
  dialect: 'mysql',
  timezone: '+00:00',
  dialectOptions: { connectTimeout: ESPERA_DEL_SALUDO_MS },
  logging: false,
});

module.exports = sequelize;
