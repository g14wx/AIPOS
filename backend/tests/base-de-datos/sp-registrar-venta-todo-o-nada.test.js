import { describe, it, expect, afterEach, beforeAll } from 'vitest';
import { createRequire } from 'node:module';
import {
  ER_LOCK_WAIT_TIMEOUT,
  ER_SIGNAL_EXCEPTION,
  consultar,
  errorDe,
  prepararPrueba,
} from './ayudas-sp-registrar-venta.js';
import { ER_CHECK_CONSTRAINT_VIOLATED } from './ayudas-ventas.js';

const require = createRequire(import.meta.url);
const mysql = require('mysql2/promise');
const { config } = require('../../src/config.js');

// Necesita MySQL levantado y la base de prueba migrada (npm run migrar:prueba), que crea sp_registrar_venta.
// Registrar una venta es todo o nada (RN-11): si algo falla, no queda ninguna venta ni ningún detalle nuevo, y el
// error original llega al cliente. La cuenta de filas se hace en la misma sesión que hizo la llamada: si faltara el
// ROLLBACK, esa sesión vería las filas sin confirmar (las de otra sesión no).
const contexto = prepararPrueba({ productos: 3 });

const detalle = (productoId, cantidad, precioAplicado) => ({
  productoId,
  cantidad,
  precioAplicado,
});

describe('un producto que no existe entre productos válidos', () => {
  it('responde PRODUCTO_NO_EXISTE y no queda ninguna venta ni ningún detalle nuevo', async () => {
    const [leche, pan] = contexto.productoIds;
    const antes = await contexto.llamador.contar();
    const error = await errorDe(
      contexto.llamador.llamar([
        detalle(leche, 2, '22.00'),
        detalle(999999999, 1, '1.00'),
        detalle(pan, 1, '3.50'),
      ]),
    );
    expect(error).toEqual({
      errno: ER_SIGNAL_EXCEPTION,
      estado: '45000',
      mensaje: 'PRODUCTO_NO_EXISTE',
    });
    expect(await contexto.llamador.contar()).toEqual(antes);
  });
});

describe('un error que no es una regla: una restricción CHECK', () => {
  // La validación del procedimiento y los CHECK de la tabla dicen lo mismo, así que ninguna entrada los separa.
  // La prueba agrega un CHECK temporal que el procedimiento no conoce (la cantidad 7 no vale): la validación
  // deja pasar el detalle y es MySQL quien lo rechaza al insertarlo, cuando la venta ya está insertada.
  const CHECK_DE_PRUEBA = 'chk_prueba_sp_registrar_venta';

  async function quitarElCheckDePrueba() {
    const [existe] = await consultar(
      `SELECT constraint_name AS nombre FROM information_schema.table_constraints
        WHERE table_schema = DATABASE() AND table_name = 'detalles_venta'
          AND constraint_name = :nombre`,
      { nombre: CHECK_DE_PRUEBA },
    );
    if (existe) await consultar(`ALTER TABLE detalles_venta DROP CHECK ${CHECK_DE_PRUEBA}`);
  }
  beforeAll(quitarElCheckDePrueba); // por si una corrida anterior se cortó
  afterEach(quitarElCheckDePrueba);

  it('el error llega tal cual (3819), no queda nada guardado y la sesión sigue sirviendo', async () => {
    await consultar(
      `ALTER TABLE detalles_venta ADD CONSTRAINT ${CHECK_DE_PRUEBA} CHECK (cantidad <> 7)`,
    );
    const [leche, pan, huevos] = contexto.productoIds;
    const antes = await contexto.llamador.contar();
    const error = await errorDe(
      contexto.llamador.llamar([
        detalle(leche, 1, '22.00'),
        detalle(pan, 7, '3.50'),
        detalle(huevos, 2, '5.00'),
      ]),
    );
    expect(error?.errno).toBe(ER_CHECK_CONSTRAINT_VIOLATED);
    expect(error.mensaje).toContain(CHECK_DE_PRUEBA);
    expect(await contexto.llamador.contar(), 'quedó algo guardado').toEqual(antes);

    // La sesión no quedó con una transacción abierta: la llamada siguiente guarda una sola venta.
    const resultado = await contexto.llamador.llamar([detalle(leche, 1, '22.00')]);
    expect(resultado.total).toBe('22.00');
    expect(await contexto.llamador.contar()).toEqual({
      ventas: antes.ventas + 1,
      detalles: antes.detalles + 1,
    });
  });
});

describe('un error de MySQL en medio de la venta: el tiempo de espera de un bloqueo', () => {
  // Otra sesión bloquea la fila de un producto con SELECT ... FOR UPDATE. El INSERT de los detalles espera a
  // esa fila (la llave foránea pide leerla) y, pasado el tiempo de espera, MySQL lo rechaza con el error 1205.
  // InnoDB solo deshace esa sentencia, y la venta insertada antes seguiría en la transacción abierta: es el
  // ROLLBACK del manejador de errores el que la deshace.
  it('el error llega tal cual (1205) y la venta que ya estaba insertada se deshace', async () => {
    const [leche, pan] = contexto.productoIds;
    const { host, puerto, nombre, usuario, clave } = config.baseDeDatos;
    const bloqueador = await mysql.createConnection({
      host,
      port: puerto,
      user: usuario,
      password: clave,
      database: nombre,
    });
    const { conexion } = contexto.llamador;
    try {
      await bloqueador.query('START TRANSACTION');
      await bloqueador.query('SELECT id FROM productos WHERE id = ? FOR UPDATE', [pan]);
      await conexion.query('SET SESSION innodb_lock_wait_timeout = 1');
      const antes = await contexto.llamador.contar();
      const error = await errorDe(
        contexto.llamador.llamar([detalle(leche, 2, '22.00'), detalle(pan, 1, '3.50')]),
      );
      expect(error?.errno).toBe(ER_LOCK_WAIT_TIMEOUT);
      expect(await contexto.llamador.contar(), 'quedó algo guardado').toEqual(antes);
    } finally {
      await bloqueador.query('ROLLBACK');
      await bloqueador.end();
      await conexion.query('SET SESSION innodb_lock_wait_timeout = DEFAULT');
    }
  }, 20_000);
});

describe('una llamada que falla al mismo tiempo que otra que sale bien', () => {
  it('no afecta a la otra: solo queda la venta completa de la que salió bien', async () => {
    const [leche, pan] = contexto.productoIds;
    const antes = await contexto.llamador.contar();
    const [bien, mal] = await Promise.allSettled([
      contexto.llamarComoElServicio([detalle(leche, 1, '2.00')]),
      contexto.llamarComoElServicio([detalle(pan, 3, '1.00'), detalle(999999999, 1, '1.00')]),
    ]);
    expect(bien.status).toBe('fulfilled');
    expect(bien.value.total).toBe('2.00');
    expect(mal.status).toBe('rejected');
    expect(mal.reason.parent.sqlMessage).toBe('PRODUCTO_NO_EXISTE');
    expect(await contexto.llamador.contar()).toEqual({
      ventas: antes.ventas + 1,
      detalles: antes.detalles + 1,
    });
  });
});
