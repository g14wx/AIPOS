'use strict';

const path = require('node:path');
const dotenv = require('dotenv');

// El único archivo del backend que lee process.env.

const OBLIGATORIAS = ['MYSQL_DATABASE', 'MYSQL_USER', 'MYSQL_PASSWORD', 'CORS_ORIGIN'];

// El .env vive en la raíz del proyecto. Una variable que ya está en el entorno gana sobre el archivo.
// La ruta se puede cambiar para probarlo con un .env de mentira.
function cargarArchivoEnv(ruta = path.resolve(__dirname, '../../.env')) {
  dotenv.config({ path: ruta, override: false, quiet: true });
}

function texto(env, nombre) {
  const valor = env[nombre];
  return typeof valor === 'string' ? valor.trim() : '';
}

function entero(env, nombre, porDefecto, { minimo, maximo }) {
  const valor = texto(env, nombre);
  if (valor === '') return porDefecto;
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero < minimo || numero > maximo) {
    throw new Error(`${nombre} debe ser un entero entre ${minimo} y ${maximo}, y vale "${valor}".`);
  }
  return numero;
}

// La pantalla se abre con http o https, y el navegador manda `Origin` como esquema://servidor[:puerto],
// en minúsculas y sin el puerto por defecto. Si `new URL` no devuelve el mismo texto (sin esquema, con
// ruta, con usuario, con mayúsculas o con el puerto por defecto), o el esquema no es http ni https, ese
// origen nunca coincidiría con el de la pantalla y el navegador la bloquearía.
function esUnOrigen(valor) {
  try {
    const url = new URL(valor);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.origin === valor;
  } catch {
    return false;
  }
}

function leerOrigenes(env) {
  const origenes = texto(env, 'CORS_ORIGIN')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);
  for (const origen of origenes) {
    if (origen === '*') {
      throw new Error('CORS_ORIGIN no puede ser *: pon el origen de la pantalla.');
    }
    if (origen.endsWith('/')) {
      throw new Error(`CORS_ORIGIN no lleva barra final: "${origen}".`);
    }
    if (!esUnOrigen(origen)) {
      throw new Error(
        'CORS_ORIGIN debe ser un origen como http://localhost:5173: esquema http o https, servidor ' +
          'y puerto, en minúsculas, sin ruta y sin escribir el puerto por defecto (80 o 443). ' +
          `Vale "${origen}".`,
      );
    }
  }
  // Un valor como "," pasa la revisión de variables obligatorias y deja la lista vacía.
  if (origenes.length === 0) {
    throw new Error(
      'CORS_ORIGIN no tiene ningún origen: pon el de la pantalla, como http://localhost:5173.',
    );
  }
  return origenes;
}

function nombreDeLaBase(env, entorno) {
  const desarrollo = texto(env, 'MYSQL_DATABASE');
  if (entorno !== 'test') return desarrollo;
  const prueba = texto(env, 'MYSQL_TEST_DATABASE');
  if (prueba === '') throw new Error('Falta la variable de entorno MYSQL_TEST_DATABASE.');
  if (prueba === desarrollo) {
    throw new Error('MYSQL_TEST_DATABASE no puede ser igual a MYSQL_DATABASE.');
  }
  return prueba;
}

function cargarConfig(env) {
  const faltan = OBLIGATORIAS.filter((nombre) => texto(env, nombre) === '');
  if (faltan.length > 0) {
    throw new Error(`Faltan variables de entorno obligatorias: ${faltan.join(', ')}.`);
  }
  const entorno = texto(env, 'NODE_ENV') || 'development';
  return {
    entorno,
    puerto: entero(env, 'PORT', 3000, { minimo: 1, maximo: 65535 }),
    corsOrigenes: leerOrigenes(env),
    baseDeDatos: {
      host: texto(env, 'MYSQL_HOST') || '127.0.0.1',
      puerto: entero(env, 'MYSQL_PORT', 3306, { minimo: 1, maximo: 65535 }),
      nombre: nombreDeLaBase(env, entorno),
      usuario: texto(env, 'MYSQL_USER'),
      clave: env.MYSQL_PASSWORD,
    },
  };
}

// La configuración de un entorno concreto, para sequelize-cli (db/config.js) y para el script que crea la
// base de prueba: así process.env se sigue leyendo solo en este archivo.
function cargarConfigDeEntorno(entorno) {
  return cargarConfig({ ...process.env, NODE_ENV: entorno });
}

// La clave de root solo la usa el script que crea la base de prueba (npm run preparar-prueba). La API
// nunca entra a MySQL como root: la clave no forma parte de `config` y no es obligatoria para arrancar.
function cargarClaveRoot(env = process.env) {
  const clave = texto(env, 'MYSQL_ROOT_PASSWORD');
  if (clave === '') {
    throw new Error(
      'Falta la variable de entorno MYSQL_ROOT_PASSWORD: sin ella no se crea la base de prueba.',
    );
  }
  return clave;
}

cargarArchivoEnv();

module.exports = {
  config: cargarConfig(process.env),
  cargarConfig,
  cargarConfigDeEntorno,
  cargarClaveRoot,
  cargarArchivoEnv,
};
