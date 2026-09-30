'use strict';

// Crea la base de prueba (MYSQL_TEST_DATABASE) y le da todos los permisos al usuario de la app.
// Es lo único del backend que entra a MySQL como root, y lo único que usa MYSQL_ROOT_PASSWORD.
// No lee variables de entorno por su cuenta: la clave de root y la configuración se las pide a src/config.js.
// Se puede correr más de una vez. Nunca toca la base de desarrollo.

async function crearBaseDePrueba() {
  const { cargarClaveRoot, cargarConfigDeEntorno } = require('../src/config');
  const mysql = require('mysql2/promise');

  const rootClave = cargarClaveRoot();
  // Con el entorno test, la configuración toma MYSQL_TEST_DATABASE y falla si es igual a MYSQL_DATABASE.
  const { baseDeDatos } = cargarConfigDeEntorno('test');

  const conexion = await mysql.createConnection({
    host: baseDeDatos.host,
    port: baseDeDatos.puerto,
    user: 'root',
    password: rootClave,
  });
  try {
    const base = conexion.escapeId(baseDeDatos.nombre);
    // En un GRANT el guion bajo y el porcentaje del nombre son comodines: se escapan para que
    // el permiso valga solo para esta base y no para otras que se le parezcan.
    const basePatron = conexion.escapeId(baseDeDatos.nombre.replace(/[\\_%]/g, '\\$&'));
    const usuario = conexion.escape(baseDeDatos.usuario);
    await conexion.query(
      `CREATE DATABASE IF NOT EXISTS ${base} CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`,
    );
    await conexion.query(`GRANT ALL PRIVILEGES ON ${basePatron}.* TO ${usuario}@'%'`);
    console.log(
      `Base de prueba lista: ${baseDeDatos.nombre} (permisos para ${baseDeDatos.usuario}).`,
    );
  } finally {
    await conexion.end();
  }
}

crearBaseDePrueba().catch((error) => {
  console.error(`No se pudo crear la base de prueba: ${error.message}`);
  process.exitCode = 1;
});
