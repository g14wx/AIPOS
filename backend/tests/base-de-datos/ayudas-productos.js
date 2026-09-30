import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sequelize = require('../../src/database.js');

// Ayudas de las pruebas de la tabla productos. No es un archivo de pruebas: Vitest solo corre *.test.js.

// Test Fixture: corre `trabajo` dentro de una transacción que siempre se descarta (rollback), así una
// prueba no deja filas en `productos`, ni siquiera cuando falla. `consultar(sql, replacements)` corre SQL
// dentro de esa transacción: devuelve las filas de un SELECT o el id nuevo de un INSERT.
export async function conTransaccionDescartada(trabajo) {
  const transaccion = await sequelize.transaction();
  const consultar = async (sql, replacements) => {
    const [resultado] = await sequelize.query(sql, { replacements, transaction: transaccion });
    return resultado;
  };
  try {
    return await trabajo({ consultar, transaccion });
  } finally {
    await transaccion.rollback();
  }
}

// Guarda un producto con SQL directo, sin pasar por el modelo ni por la API.
export function insertarProducto(consultar, { nombre, precio, codigoBarras }) {
  return consultar(
    'INSERT INTO productos (nombre, precio, codigo_barras) VALUES (:nombre, :precio, :codigoBarras)',
    { nombre, precio, codigoBarras },
  );
}

// Espera una promesa que MySQL puede rechazar. Si la rechaza, devuelve el número y el texto del error
// (lo mismo que la API lee en err.parent); si no la rechaza, devuelve null.
export async function errorDeMySQL(promesa) {
  try {
    await promesa;
  } catch (error) {
    const original = error.parent ?? error.original;
    return { errno: original?.errno, mensaje: original?.sqlMessage ?? error.message };
  }
  return null;
}
