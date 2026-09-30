import { describe, it, expect, afterEach, vi } from 'vitest';
import { createRequire } from 'node:module';
import {
  contarFilas,
  detalle,
  prepararVentas,
  registrarVentaPorApi,
} from './ayudas-registrar-venta.js';

const require = createRequire(import.meta.url);
const sequelize = require('../../src/database.js');
const { registrarVenta } = require('../../src/services/ventas.js');

// Necesita MySQL levantado y la base de prueba migrada (npm run migrar:prueba).
// El 500 de POST /api/ventas (criterio 4 de V-03): un error que la ruta no espera sale como ERROR_INTERNO, sin
// el SQL ni el stack, y el detalle se escribe solo en el log del servidor (console.error) (RNF-04 y RNF-05).
const contexto = prepararVentas({ productos: 2 });
afterEach(() => vi.restoreAllMocks());

const ventaValida = () => ({ detalles: [detalle(contexto.productoIds[0], { cantidad: 2 })] });
const CUERPO_DEL_500 = {
  error: { codigo: 'ERROR_INTERNO', mensaje: 'Ocurrió un error inesperado. Intenta de nuevo.' },
};

// Un error real de MySQL, no inventado: se le pide una tabla que no existe (error 1146) y se guarda lo que lanza
// Sequelize.
async function errorDeTablaInexistente() {
  try {
    await sequelize.query('SELECT id FROM tabla_que_no_existe');
  } catch (error) {
    return error;
  }
  throw new Error('MySQL tenía que rechazar una tabla que no existe.');
}

// Un error como el que arma Sequelize: el original de mysql2 va en `parent`.
const errorDeMySQL = (descripcion, parent) => Object.assign(new Error(descripcion), { parent });

// Lo que no puede salir nunca en una respuesta: el SQL, el procedimiento, el stack ni el texto de MySQL.
function sinDetallesInternos(respuesta) {
  const dicho = JSON.stringify(respuesta.body) + respuesta.text;
  expect(dicho).not.toMatch(/tabla_que_no_existe|SELECT|doesn't exist|errno|sequelize|mysql/i);
  expect(dicho).not.toMatch(/sp_registrar_venta|CALL|SQLSTATE|lock wait|deadlock|ECONNREFUSED/i);
  expect(dicho).not.toMatch(/stack|node_modules|\.js:\d+|at .*\(.*:\d+:\d+\)/i);
}

describe('un error inesperado de MySQL (por ejemplo, la tabla no existe)', () => {
  it('responde 500 ERROR_INTERNO sin el SQL ni el stack, y console.error escribe el detalle', async () => {
    const original = await errorDeTablaInexistente();
    expect(original.parent.errno).toBe(1146);
    const escribir = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(sequelize, 'query').mockRejectedValueOnce(original);

    const respuesta = await registrarVentaPorApi(ventaValida());

    expect(respuesta.status).toBe(500);
    expect(respuesta.body).toEqual(CUERPO_DEL_500);
    sinDetallesInternos(respuesta);
    expect(escribir).toHaveBeenCalledWith(original);
  });

  it('la API sigue viva: la siguiente venta válida responde 201 y se guarda', async () => {
    const original = await errorDeTablaInexistente();
    // Se cuentan las filas antes de armar el espía: contarFilas también llama a sequelize.query y se comería el error.
    const antes = await contarFilas();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(sequelize, 'query').mockRejectedValueOnce(original);

    expect((await registrarVentaPorApi(ventaValida())).status).toBe(500);
    const siguiente = await registrarVentaPorApi(ventaValida());

    expect(siguiente.status).toBe(201);
    expect(await contarFilas()).toEqual({ ventas: antes.ventas + 1, detalles: antes.detalles + 1 });
  });

  it.each([
    [
      'una conexión rechazada (ECONNREFUSED)',
      () =>
        Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:3306'), {
          name: 'SequelizeConnectionRefusedError',
          parent: { code: 'ECONNREFUSED', errno: -61 },
        }),
    ],
    [
      'el tiempo de espera de un bloqueo (1205)',
      () =>
        errorDeMySQL('Lock wait timeout', {
          errno: 1205,
          sqlState: 'HY000',
          sqlMessage: 'Lock wait timeout exceeded; try restarting transaction',
        }),
    ],
    [
      'un interbloqueo (1213)',
      () =>
        errorDeMySQL('Deadlock', {
          errno: 1213,
          sqlState: '40001',
          sqlMessage: 'Deadlock found when trying to get lock; try restarting transaction',
        }),
    ],
    ['un error de JavaScript que no es de MySQL', () => new TypeError('algo salió mal por dentro')],
  ])('%s responde 500 ERROR_INTERNO sin detalles internos', async (_caso, armarError) => {
    const original = armarError();
    const escribir = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(sequelize, 'query').mockRejectedValueOnce(original);

    const respuesta = await registrarVentaPorApi(ventaValida());

    expect(respuesta.status).toBe(500);
    expect(respuesta.body).toEqual(CUERPO_DEL_500);
    sinDetallesInternos(respuesta);
    expect(escribir).toHaveBeenCalledWith(original);
  });
});

describe('el servicio no traduce por adivinar', () => {
  it('un error que no es el rechazo del procedimiento (errno 1644 con SQLSTATE 45000) sigue como venía', async () => {
    const otros = [
      await errorDeTablaInexistente(),
      // Otro SIGNAL, con otro SQLSTATE: no es una regla del procedimiento.
      errorDeMySQL('otro SIGNAL', {
        errno: 1644,
        sqlState: '23000',
        sqlMessage: 'PRODUCTO_NO_EXISTE',
      }),
      errorDeMySQL('llave foránea', { errno: 1452, sqlState: '23000', sqlMessage: 'child row' }),
      errorDeMySQL('JSON inválido', { errno: 3140, sqlState: '22032', sqlMessage: 'Invalid JSON' }),
      new TypeError('no es de MySQL'),
    ];
    for (const original of otros) {
      vi.spyOn(sequelize, 'query').mockRejectedValueOnce(original);
      await expect(registrarVenta([detalle(contexto.productoIds[0])])).rejects.toBe(original);
    }
  });
});

describe('los otros errores de MySQL que el manejador de errores sabe traducir', () => {
  it('una llave foránea que no existe (1452), si un producto desaparece entre la revisión y el INSERT, responde 404 NO_ENCONTRADO', async () => {
    vi.spyOn(sequelize, 'query').mockRejectedValueOnce(
      errorDeMySQL('llave foránea', {
        errno: 1452,
        sqlState: '23000',
        sqlMessage: 'Cannot add or update a child row: a foreign key constraint fails',
      }),
    );

    const respuesta = await registrarVentaPorApi(ventaValida());

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.error.codigo).toBe('NO_ENCONTRADO');
    sinDetallesInternos(respuesta);
  });

  it('un JSON que MySQL no puede leer (3140) responde 400 DATOS_INVALIDOS', async () => {
    vi.spyOn(sequelize, 'query').mockRejectedValueOnce(
      errorDeMySQL('JSON inválido', {
        errno: 3140,
        sqlState: '22032',
        sqlMessage: 'Invalid JSON text in argument 1 to function sp_registrar_venta',
      }),
    );

    const respuesta = await registrarVentaPorApi(ventaValida());

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error.codigo).toBe('DATOS_INVALIDOS');
    sinDetallesInternos(respuesta);
  });
});
