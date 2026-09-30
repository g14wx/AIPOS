'use strict';

const { cargarConfigDeEntorno, cargarArchivoEnv } = require('../src/config');

// Configuración de sequelize-cli. `--env test` no cambia NODE_ENV, así que cada entorno
// se arma con su propio NODE_ENV. Con getters solo se valida el entorno que se pide.
cargarArchivoEnv();

function paraElCli(entorno) {
  const { baseDeDatos } = cargarConfigDeEntorno(entorno);
  return {
    dialect: 'mysql',
    host: baseDeDatos.host,
    port: baseDeDatos.puerto,
    database: baseDeDatos.nombre,
    username: baseDeDatos.usuario,
    password: baseDeDatos.clave,
    timezone: '+00:00',
  };
}

module.exports = {
  get development() {
    return paraElCli('development');
  },
  get test() {
    return paraElCli('test');
  },
  get production() {
    return paraElCli('production');
  },
};
