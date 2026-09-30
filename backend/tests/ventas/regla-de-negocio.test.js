import { describe, it, expect, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import {
  contarFilas,
  detalle,
  idDeUnProductoBorrado,
  prepararVentas,
  registrarVentaPorApi,
} from './ayudas-registrar-venta.js';
import { ARCHIVO_SQL } from '../base-de-datos/ayudas-sp-registrar-venta.js';

const require = createRequire(import.meta.url);
const ErrorApi = require('../../src/errors/ErrorApi.js');
const sequelize = require('../../src/database.js');
const { registrarVenta, MENSAJES_DE_LAS_REGLAS } = require('../../src/services/ventas.js');

// Necesita MySQL levantado y la base de prueba migrada (npm run migrar:prueba).
// El 422 de POST /api/ventas (criterio 3 de V-03): cuando el procedimiento rechaza la venta con SQLSTATE 45000,
// la API responde 422 con el código de la regla y un mensaje en español para el cajero, y no guarda nada.
const contexto = prepararVentas({ productos: 3 });
afterEach(() => vi.restoreAllMocks());

// Los mensajes para el cajero de la tabla de la spec ("Respuestas", 422).
const MENSAJES = {
  VENTA_SIN_DETALLES: 'La venta no tiene productos. Agrega al menos uno.',
  DEMASIADOS_DETALLES: 'Una venta puede tener como máximo 100 productos.',
  DETALLE_INVALIDO: 'Un producto de la venta tiene datos inválidos.',
  CANTIDAD_FUERA_DE_RANGO: 'La cantidad debe ser un número entero de 1 a 999.',
  PRECIO_FUERA_DE_RANGO: 'El precio aplicado debe estar entre 0 y 99 999.99.',
  PRODUCTO_REPETIDO: 'Un producto aparece dos veces en la venta.',
  PRODUCTO_NO_EXISTE: 'Un producto de la venta ya no existe. Revisa la venta actual.',
};
const MENSAJE_GENERICO = 'La venta no cumple una regla de negocio.';

describe('POST /api/ventas con un producto que ya no existe', () => {
  it('responde 422 PRODUCTO_NO_EXISTE con su mensaje y sin detalles, y no guarda nada', async () => {
    const borrado = await idDeUnProductoBorrado();
    const antes = await contarFilas();

    const respuesta = await registrarVentaPorApi({
      detalles: [
        detalle(contexto.productoIds[0], { cantidad: 2 }),
        detalle(borrado),
        detalle(contexto.productoIds[1]),
      ],
    });

    expect(respuesta.status).toBe(422);
    expect(respuesta.headers['content-type']).toMatch(/application\/json/);
    expect(respuesta.body).toEqual({
      error: { codigo: 'PRODUCTO_NO_EXISTE', mensaje: MENSAJES.PRODUCTO_NO_EXISTE },
    });
    expect(await contarFilas()).toEqual(antes);
  });

  it('también con el producto borrado como único detalle', async () => {
    const respuesta = await registrarVentaPorApi({
      detalles: [detalle(await idDeUnProductoBorrado())],
    });
    expect(respuesta.status).toBe(422);
    expect(respuesta.body.error.codigo).toBe('PRODUCTO_NO_EXISTE');
  });

  it('el cuerpo del 422 no cuenta nada de MySQL: ni el SQLSTATE, ni el procedimiento, ni el SQL (RNF-04)', async () => {
    const respuesta = await registrarVentaPorApi({
      detalles: [detalle(await idDeUnProductoBorrado())],
    });
    expect(respuesta.status).toBe(422);
    expect(respuesta.text).not.toMatch(
      /SQLSTATE|45000|errno|sp_registrar_venta|CALL|sequelize|mysql/i,
    );
  });
});

describe('el servicio traduce cada código del procedimiento a un 422 con su mensaje', () => {
  // Cada caso arma su lista al correr, y llama al servicio saltándose el validador: es lo que pasaría si alguien
  // llamara a registrarVenta sin pasar por la API. Los rechaza el procedimiento de verdad.
  const CASOS = [
    ['VENTA_SIN_DETALLES', async () => []],
    [
      'DEMASIADOS_DETALLES',
      async () => Array.from({ length: 101 }, (_, i) => detalle(contexto.productoIds[0] + i)),
    ],
    ['DETALLE_INVALIDO', async () => [5]],
    ['CANTIDAD_FUERA_DE_RANGO', async () => [detalle(contexto.productoIds[0], { cantidad: 0 })]],
    [
      'PRECIO_FUERA_DE_RANGO',
      async () => [detalle(contexto.productoIds[0], { precioAplicado: '10.999' })],
    ],
    [
      'PRODUCTO_REPETIDO',
      async () => [detalle(contexto.productoIds[0]), detalle(contexto.productoIds[0])],
    ],
    ['PRODUCTO_NO_EXISTE', async () => [detalle(await idDeUnProductoBorrado())]],
  ];

  it.each(CASOS)(
    '%s: lanza un ErrorApi 422 con el código y el mensaje, y no guarda nada',
    async (codigo, armarDetalles) => {
      const detalles = await armarDetalles();
      const antes = await contarFilas();

      const error = await registrarVenta(detalles).catch((err) => err);

      expect(error).toBeInstanceOf(ErrorApi);
      expect(error).toMatchObject({ estado: 422, codigo, message: MENSAJES[codigo] });
      expect(error.detalles).toBeUndefined();
      expect(await contarFilas()).toEqual(antes);
    },
  );

  it('la tabla de mensajes tiene justo los códigos que el procedimiento puede lanzar', () => {
    // El .sql y el servicio no se pueden separar: un código nuevo en uno sin el otro rompe esta prueba.
    const sql = fs.readFileSync(ARCHIVO_SQL, 'utf8');
    const codigos = [...sql.matchAll(/MESSAGE_TEXT\s*=\s*'([A-Z][A-Z0-9_]*)'/g)].map((m) => m[1]);
    expect(codigos.length).toBeGreaterThan(0);
    expect(Object.keys(MENSAJES_DE_LAS_REGLAS).sort()).toEqual([...new Set(codigos)].sort());
  });
});

describe('un rechazo con un código que el servicio no conoce', () => {
  // El error tal como lo arma Sequelize cuando el procedimiento hace SIGNAL SQLSTATE '45000': el original de
  // mysql2 va en `parent`, con errno 1644 y el código de la regla en sqlMessage.
  const rechazoDelProcedimiento = (sqlMessage) =>
    Object.assign(new Error('rechazo del procedimiento'), {
      parent: { errno: 1644, sqlState: '45000', sqlMessage },
    });

  it.each([
    ['un código nuevo bien escrito (REGLA_NUEVA)', 'REGLA_NUEVA'],
    ['un texto en minúsculas', 'la venta no sirve'],
    ['un texto que empieza con un dígito', '1_REGLA'],
    ['un texto vacío', ''],
    ['ningún mensaje', undefined],
  ])('con %s usa REGLA_DE_NEGOCIO y el mensaje genérico', async (_caso, sqlMessage) => {
    vi.spyOn(sequelize, 'query').mockRejectedValueOnce(rechazoDelProcedimiento(sqlMessage));

    const error = await registrarVenta([detalle(contexto.productoIds[0])]).catch((err) => err);

    expect(error).toBeInstanceOf(ErrorApi);
    expect(error).toMatchObject({
      estado: 422,
      codigo: 'REGLA_DE_NEGOCIO',
      message: MENSAJE_GENERICO,
    });
  });

  it('por HTTP sale como 422 REGLA_DE_NEGOCIO, sin el texto original de MySQL', async () => {
    vi.spyOn(sequelize, 'query').mockRejectedValueOnce(rechazoDelProcedimiento('REGLA_NUEVA'));

    const respuesta = await registrarVentaPorApi({
      detalles: [detalle(contexto.productoIds[0])],
    });

    expect(respuesta.status).toBe(422);
    expect(respuesta.body).toEqual({
      error: { codigo: 'REGLA_DE_NEGOCIO', mensaje: MENSAJE_GENERICO },
    });
  });
});
