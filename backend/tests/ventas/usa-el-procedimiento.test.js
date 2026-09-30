import { describe, it, expect, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import {
  consultar,
  contarFilas,
  detalle,
  prepararVentas,
  registrarVentaPorApi,
} from './ayudas-registrar-venta.js';
import {
  ER_SP_DOES_NOT_EXIST,
  borrarVentas,
  verificarProcedimientoDelSql,
} from '../base-de-datos/ayudas-sp-registrar-venta.js';
import { carpetaBackend } from '../base-de-datos/ayudas.js';

const require = createRequire(import.meta.url);
const sequelize = require('../../src/database.js');
const { registrarVenta } = require('../../src/services/ventas.js');

// Necesita MySQL levantado y la base de prueba migrada (npm run migrar:prueba).
// La API usa el procedimiento (criterio 5 de V-03 y criterio de la tarjeta): registrar una venta es un CALL a
// sp_registrar_venta, no una copia de sus reglas en JavaScript. Si se borra el procedimiento, la venta falla.
const contexto = prepararVentas({ productos: 2 });
afterEach(() => vi.restoreAllMocks());

const ventaValida = () => ({
  detalles: [
    detalle(contexto.productoIds[0], { cantidad: 2, precioAplicado: '22.00' }),
    detalle(contexto.productoIds[1], { precioAplicado: '3.50' }),
  ],
});

// Crea el procedimiento con la misma migración que lo crea en la base: ella lee el mismo .sql y manda el DROP y
// el CREATE PROCEDURE en dos llamadas.
const carpetaDeMigraciones = path.join(carpetaBackend, 'db', 'migrations');
const archivoDeLaMigracion = fs
  .readdirSync(carpetaDeMigraciones)
  .find((archivo) => archivo.endsWith('-crear-sp-registrar-venta.js'));
const migracion = require(path.join(carpetaDeMigraciones, archivoDeLaMigracion));
const crearProcedimiento = () => migracion.up(sequelize.getQueryInterface());

describe('registrarVenta llama al procedimiento sp_registrar_venta', () => {
  it('con CALL sp_registrar_venta(:detalles) y los detalles como un solo parámetro JSON, sin transacción ni tipo de consulta', async () => {
    const consulta = vi.spyOn(sequelize, 'query');
    const cuerpo = ventaValida();

    const respuesta = await registrarVentaPorApi(cuerpo);

    expect(respuesta.status).toBe(201);
    expect(consulta).toHaveBeenCalledTimes(1);
    const [sql, opciones] = consulta.mock.calls[0];
    // Nada antes del CALL (ni un comentario) y sin parámetros OUT: Sequelize reconoce el CALL por cómo empieza.
    expect(sql).toBe('CALL sp_registrar_venta(:detalles)');
    expect(Object.keys(opciones)).toEqual(['replacements']);
    expect(Object.keys(opciones.replacements)).toEqual(['detalles']);
    expect(typeof opciones.replacements.detalles).toBe('string');
    expect(JSON.parse(opciones.replacements.detalles)).toEqual(cuerpo.detalles);
  });

  it('lee filas[0] y devuelve { ventaId, total }, con el total como texto tal como lo devuelve mysql2', async () => {
    const resultado = await registrarVenta([
      detalle(contexto.productoIds[0], { cantidad: 2, precioAplicado: '22.00' }),
    ]);

    expect(resultado).toEqual({ ventaId: expect.any(Number), total: '44.00' });
    expect(Object.keys(resultado)).toEqual(['ventaId', 'total']);
    expect(typeof resultado.total).toBe('string');
    await borrarVentas([resultado.ventaId]);
  });

  it('el servicio no calcula el dinero: el total que devuelve es el que dejó MySQL en la venta', async () => {
    const resultado = await registrarVenta([
      detalle(contexto.productoIds[0], { cantidad: 3, precioAplicado: '0.10' }),
      detalle(contexto.productoIds[1], { cantidad: 1, precioAplicado: '0.20' }),
    ]);

    const [venta] = await consultar('SELECT total FROM ventas WHERE id = :ventaId', {
      ventaId: resultado.ventaId,
    });
    expect(resultado.total).toBe(venta.total);
    expect(resultado.total).toBe('0.50');
    await borrarVentas([resultado.ventaId]);
  });
});

describe('la API usa el procedimiento de verdad, no una copia en JavaScript', () => {
  it('si se borra sp_registrar_venta, registrar una venta responde 500 y no guarda nada; al volver a crearlo, responde 201', async () => {
    const escribir = vi.spyOn(console, 'error').mockImplementation(() => {});
    const antes = await contarFilas();

    await consultar('DROP PROCEDURE sp_registrar_venta');
    let sinProcedimiento;
    try {
      sinProcedimiento = await registrarVentaPorApi(ventaValida());
      expect(await contarFilas()).toEqual(antes);
    } finally {
      // Pase lo que pase, la base de prueba vuelve a tener el procedimiento para las demás pruebas.
      await crearProcedimiento();
    }

    expect(sinProcedimiento.status).toBe(500);
    expect(sinProcedimiento.body).toEqual({
      error: { codigo: 'ERROR_INTERNO', mensaje: 'Ocurrió un error inesperado. Intenta de nuevo.' },
    });
    expect(sinProcedimiento.text).not.toMatch(/sp_registrar_venta|PROCEDURE|SQL|errno/i);
    // El 500 viene de MySQL, que dice que el procedimiento no existe: el error completo queda en el log.
    expect(escribir.mock.calls[0][0].parent.errno).toBe(ER_SP_DOES_NOT_EXIST);

    await verificarProcedimientoDelSql();
    const conProcedimiento = await registrarVentaPorApi(ventaValida());
    expect(conProcedimiento.status).toBe(201);
    expect(conProcedimiento.body.total).toBe('47.50');
  });
});
