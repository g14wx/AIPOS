import { describe, it, expect, afterEach, vi } from 'vitest';
import { createRequire } from 'node:module';
import {
  RUTA,
  api,
  contarFilas,
  detalle,
  prepararVentas,
  registrarVentaPorApi,
} from './ayudas-registrar-venta.js';

const require = createRequire(import.meta.url);
const sequelize = require('../../src/database.js');

// Necesita MySQL levantado y la base de prueba migrada (npm run migrar:prueba).
// El 400 de POST /api/ventas (criterio 2 de V-03): la API valida todo antes de tocar la base de datos, dice el
// campo y el motivo de cada problema, y no guarda nada (RN-05, RN-06, RN-07, RN-10 y RN-14).
const contexto = prepararVentas({ productos: 3 });
afterEach(() => vi.restoreAllMocks());

const MENSAJE_DEL_400 = 'Los datos de la venta no son válidos. Revisa los campos marcados.';
const RANGO_DEL_ID = 'Debe ser un entero de 1 a 2147483647.';
const RANGO_DE_LA_CANTIDAD = 'Debe ser un entero de 1 a 999.';
const PRECIO_COMO_TEXTO = 'Debe enviarse como texto, por ejemplo "25.50".';
const PRECIO_CON_PUNTO = 'Debe ser un número con punto decimal, por ejemplo 25.50.';

// Dos detalles válidos (los dos primeros productos de prueba) con un cambio en el detalle de esa posición.
function conCambio(cambios, posicion = 0) {
  const [primero, segundo] = contexto.productoIds;
  const detalles = [
    detalle(primero, { cantidad: 2, precioAplicado: '22.00' }),
    detalle(segundo, { precioAplicado: '3.50' }),
  ];
  Object.assign(detalles[posicion], cambios);
  return { detalles };
}

// Cada caso arma su cuerpo al correr (los productos de prueba se crean antes de las pruebas del archivo).
const CASOS = [
  ['un cuerpo sin detalles', () => ({}), 'detalles', 'Es obligatorio.'],
  [
    'detalles que no es una lista',
    () => ({ detalles: { productoId: 1 } }),
    'detalles',
    'Debe ser una lista de detalles de venta.',
  ],
  ['una lista vacía (RN-10)', () => ({ detalles: [] }), 'detalles', 'Agrega al menos un producto.'],
  [
    'un detalle que no es un objeto',
    () => ({ detalles: [5] }),
    'detalles[0]',
    'Debe ser un objeto con productoId, cantidad y precioAplicado.',
  ],
  [
    'un productoId de texto ("3")',
    () => conCambio({ productoId: '3' }),
    'detalles[0].productoId',
    RANGO_DEL_ID,
  ],
  [
    'un productoId menor que 1',
    () => conCambio({ productoId: 0 }),
    'detalles[0].productoId',
    RANGO_DEL_ID,
  ],
  [
    'una cantidad 0 (RN-06)',
    () => conCambio({ cantidad: 0 }),
    'detalles[0].cantidad',
    RANGO_DE_LA_CANTIDAD,
  ],
  [
    'una cantidad 1000',
    () => conCambio({ cantidad: 1000 }, 1),
    'detalles[1].cantidad',
    RANGO_DE_LA_CANTIDAD,
  ],
  [
    'una cantidad de texto ("2")',
    () => conCambio({ cantidad: '2' }),
    'detalles[0].cantidad',
    RANGO_DE_LA_CANTIDAD,
  ],
  [
    'una cantidad decimal (1.5)',
    () => conCambio({ cantidad: 1.5 }),
    'detalles[0].cantidad',
    RANGO_DE_LA_CANTIDAD,
  ],
  [
    'un precio aplicado que es un número JSON (22.5)',
    () => conCambio({ precioAplicado: 22.5 }),
    'detalles[0].precioAplicado',
    PRECIO_COMO_TEXTO,
  ],
  [
    'un precio aplicado con 3 decimales ("10.999", RN-05)',
    () => conCambio({ precioAplicado: '10.999' }),
    'detalles[0].precioAplicado',
    'No puede tener más de 2 decimales.',
  ],
  [
    'un precio aplicado negativo ("-1")',
    () => conCambio({ precioAplicado: '-1' }),
    'detalles[0].precioAplicado',
    PRECIO_CON_PUNTO,
  ],
  [
    'un precio aplicado mayor que 99999.99 ("100000")',
    () => conCambio({ precioAplicado: '100000' }),
    'detalles[0].precioAplicado',
    'No puede ser mayor que 99999.99.',
  ],
  [
    'un precio aplicado que no es un número ("abc")',
    () => conCambio({ precioAplicado: 'abc' }),
    'detalles[0].precioAplicado',
    PRECIO_CON_PUNTO,
  ],
  [
    'un producto repetido (RN-07)',
    () => ({
      detalles: [
        detalle(contexto.productoIds[0]),
        detalle(contexto.productoIds[0], { cantidad: 4 }),
      ],
    }),
    'detalles[1].productoId',
    'Este producto ya está en la venta.',
  ],
  [
    '101 detalles (RN-14)',
    () => ({
      detalles: Array.from({ length: 101 }, (_, i) => detalle(contexto.productoIds[0] + i)),
    }),
    'detalles',
    'Una venta puede tener como máximo 100 productos.',
  ],
];

describe('POST /api/ventas con datos inválidos', () => {
  it.each(CASOS)(
    'con %s responde 400 DATOS_INVALIDOS con el campo y el motivo, y no guarda nada',
    async (_caso, armarCuerpo, campo, mensaje) => {
      const antes = await contarFilas();

      const respuesta = await registrarVentaPorApi(armarCuerpo());

      expect(respuesta.status).toBe(400);
      expect(respuesta.body).toEqual({
        error: {
          codigo: 'DATOS_INVALIDOS',
          mensaje: MENSAJE_DEL_400,
          detalles: [{ campo, mensaje }],
        },
      });
      expect(await contarFilas()).toEqual(antes);
    },
  );
});

describe('la validación junta todos los problemas y corre antes de tocar MySQL', () => {
  it('reúne los campos con problema de todos los detalles en una sola respuesta', async () => {
    const [primero, segundo] = contexto.productoIds;
    const antes = await contarFilas();

    const respuesta = await registrarVentaPorApi({
      detalles: [
        { productoId: 'x', cantidad: 0, precioAplicado: 5 },
        detalle(segundo),
        { productoId: segundo, cantidad: 1000, precioAplicado: '10.999' },
        detalle(primero),
      ],
    });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error.detalles.map((detalleDelError) => detalleDelError.campo)).toEqual([
      'detalles[0].productoId',
      'detalles[0].cantidad',
      'detalles[0].precioAplicado',
      'detalles[2].productoId',
      'detalles[2].cantidad',
      'detalles[2].precioAplicado',
    ]);
    expect(await contarFilas()).toEqual(antes);
  });

  it('un 400 no llega a MySQL: el validador corre antes del servicio (Input Validation)', async () => {
    const consulta = vi.spyOn(sequelize, 'query');
    const respuesta = await registrarVentaPorApi(conCambio({ cantidad: 0 }));
    expect(respuesta.status).toBe(400);
    expect(consulta).not.toHaveBeenCalled();
  });
});

describe('un cuerpo que no se puede leer', () => {
  const enviarTexto = (texto) =>
    api().post(RUTA).set('Content-Type', 'application/json').send(texto);
  const DETALLES_OBLIGATORIOS = {
    error: {
      codigo: 'DATOS_INVALIDOS',
      mensaje: MENSAJE_DEL_400,
      detalles: [{ campo: 'detalles', mensaje: 'Es obligatorio.' }],
    },
  };

  it('una petición sin cuerpo responde 400 DATOS_INVALIDOS: detalles es obligatorio', async () => {
    const respuesta = await registrarVentaPorApi();
    expect(respuesta.status).toBe(400);
    expect(respuesta.body).toEqual(DETALLES_OBLIGATORIOS);
  });

  it('un arreglo en vez de un objeto responde 400 DATOS_INVALIDOS: detalles es obligatorio', async () => {
    const respuesta = await registrarVentaPorApi([detalle(contexto.productoIds[0])]);
    expect(respuesta.status).toBe(400);
    expect(respuesta.body).toEqual(DETALLES_OBLIGATORIOS);
  });

  it('con otro Content-Type el cuerpo no se lee: 400 DATOS_INVALIDOS, detalles es obligatorio', async () => {
    const respuesta = await api()
      .post(RUTA)
      .set('Content-Type', 'text/plain')
      .send('{"detalles":[]}');
    expect(respuesta.status).toBe(400);
    expect(respuesta.body).toEqual(DETALLES_OBLIGATORIOS);
  });

  it('un JSON mal escrito responde 400 JSON_INVALIDO y no guarda nada', async () => {
    const antes = await contarFilas();
    const respuesta = await enviarTexto('{"detalles":[');
    expect(respuesta.status).toBe(400);
    expect(respuesta.body).toEqual({
      error: { codigo: 'JSON_INVALIDO', mensaje: 'El cuerpo de la petición no es un JSON válido.' },
    });
    expect(await contarFilas()).toEqual(antes);
  });

  it.each(['null', '5', '"x"', 'true'])(
    'un JSON que no es un objeto ni un arreglo (%s) lo rechaza el lector de Express: 400 JSON_INVALIDO',
    async (texto) => {
      const respuesta = await enviarTexto(texto);
      expect(respuesta.status).toBe(400);
      expect(respuesta.body.error.codigo).toBe('JSON_INVALIDO');
    },
  );

  it('un cuerpo de más de 100 kb responde 400 CUERPO_MUY_GRANDE y no guarda nada', async () => {
    const antes = await contarFilas();
    const respuesta = await enviarTexto(
      JSON.stringify({ detalles: [], relleno: 'a'.repeat(120 * 1024) }),
    );
    expect(respuesta.status).toBe(400);
    expect(respuesta.body).toEqual({
      error: {
        codigo: 'CUERPO_MUY_GRANDE',
        mensaje: 'El cuerpo de la petición es demasiado grande.',
      },
    });
    expect(await contarFilas()).toEqual(antes);
  });
});
