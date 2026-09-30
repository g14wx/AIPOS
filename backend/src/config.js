'use strict';

const path = require('node:path');
const dotenv = require('dotenv');

// El único archivo del backend que lee process.env.

const OBLIGATORIAS = ['MYSQL_DATABASE', 'MYSQL_USER', 'MYSQL_PASSWORD', 'CORS_ORIGIN'];

// El .env vive en la raíz del proyecto. Una variable que ya está en el entorno gana sobre el archivo.
function cargarArchivoEnv() {
  dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: false, quiet: true });
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

// El navegador manda `Origin` como esquema://servidor[:puerto], en minúsculas y sin el puerto por defecto.
// Si `new URL` no devuelve el mismo texto (sin esquema, con ruta, con usuario, con mayúsculas o con el
// puerto por defecto), ese origen nunca coincidiría con el de la pantalla y el navegador la bloquearía.
function esUnOrigen(valor) {
  try {
    return new URL(valor).origin === valor;
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
        'CORS_ORIGIN debe ser un origen como http://localhost:5173: esquema, servidor y puerto, ' +
          'en minúsculas, sin ruta y sin escribir el puerto por defecto (80 o 443). ' +
          `Vale "${origen}".`,
      );
    }
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

cargarArchivoEnv();

module.exports = { config: cargarConfig(process.env), cargarConfig, cargarArchivoEnv };
