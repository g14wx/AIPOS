import { describe, it, expect } from 'vitest';
import {
  consultar,
  crearProductos,
  leerDetalles,
  leerVenta,
  prepararPrueba,
} from './ayudas-sp-registrar-venta.js';

// Necesita MySQL levantado y la base de prueba migrada (npm run migrar:prueba), que crea sp_registrar_venta.
// Prueba lo que el procedimiento guarda y devuelve (spec registrar-venta, "Procedimiento sp_registrar_venta"):
// los subtotales y el total que calcula MySQL (RN-08 y RN-09), la fecha que pone la base (RN-12) y el SELECT
// final. El procedimiento hace COMMIT: cada prueba borra lo que creó (ayudas-sp-registrar-venta.js).
const contexto = prepararPrueba({ productos: 3 });

const detalle = (productoId, cantidad, precioAplicado) => ({
  productoId,
  cantidad,
  precioAplicado,
});

describe('criterio 1: dos detalles (2 × 22.00 y 1 × 3.50)', () => {
  const llamarConDos = () => {
    const [leche, pan] = contexto.productoIds;
    return contexto.llamador.llamar([detalle(leche, 2, '22.00'), detalle(pan, 1, '3.50')]);
  };

  it('guarda 1 venta y 2 detalles, con los subtotales 44.00 y 3.50, y devuelve ventaId y el total 47.50', async () => {
    const [leche, pan] = contexto.productoIds;
    const antes = await contexto.llamador.contar();
    const resultado = await llamarConDos();
    expect(resultado).toEqual({ ventaId: expect.any(Number), total: '47.50' });
    expect(await contexto.llamador.contar()).toEqual({
      ventas: antes.ventas + 1,
      detalles: antes.detalles + 2,
    });
    expect(await leerDetalles(resultado.ventaId)).toEqual([
      { productoId: leche, cantidad: 2, precioAplicado: '22.00', subtotal: '44.00' },
      { productoId: pan, cantidad: 1, precioAplicado: '3.50', subtotal: '3.50' },
    ]);
  });

  it('el total que guarda la venta es el que devuelve, y es la suma de los subtotales de sus detalles', async () => {
    const { ventaId } = await llamarConDos();
    expect((await leerVenta(ventaId)).total).toBe('47.50');
    const [{ suma }] = await consultar(
      'SELECT SUM(subtotal) AS suma FROM detalles_venta WHERE venta_id = :ventaId',
      { ventaId },
    );
    expect(suma).toBe('47.50');
  });

  it('la fecha de la venta la pone MySQL (RN-12): es de hace unos segundos', async () => {
    const { ventaId } = await llamarConDos();
    const [{ segundos }] = await consultar(
      'SELECT TIMESTAMPDIFF(SECOND, fecha, NOW()) AS segundos FROM ventas WHERE id = :ventaId',
      { ventaId },
    );
    expect(segundos).toBeGreaterThanOrEqual(0);
    expect(segundos).toBeLessThan(10);
  });
});

describe('criterio 2: precio aplicado 0', () => {
  it.each([
    ['el texto "0"', '0'],
    ['el texto "0.00"', '0.00'],
    ['el número 0', 0],
  ])('con %s registra la venta con subtotal 0.00 y total 0.00', async (_nombre, precioAplicado) => {
    const [leche] = contexto.productoIds;
    const resultado = await contexto.llamador.llamar([detalle(leche, 3, precioAplicado)]);
    expect(resultado.total).toBe('0.00');
    expect(await leerDetalles(resultado.ventaId)).toEqual([
      { productoId: leche, cantidad: 3, precioAplicado: '0.00', subtotal: '0.00' },
    ]);
  });
});

describe('criterio 3: la cantidad y el precio aplicado más grandes', () => {
  it('999 × 99999.99 da el subtotal 99899990.01 y el total no se desborda', async () => {
    const [leche] = contexto.productoIds;
    const resultado = await contexto.llamador.llamar([detalle(leche, 999, '99999.99')]);
    expect(resultado.total).toBe('99899990.01');
    const [guardado] = await leerDetalles(resultado.ventaId);
    expect(guardado.subtotal).toBe('99899990.01');
  });

  it('con 100 detalles de 999 × 99999.99 la venta se registra y el total es 9989999001.00 (RN-14)', async () => {
    const productoIds = await crearProductos(100, 'CIEN');
    const antes = await contexto.llamador.contar();
    const resultado = await contexto.llamador.llamar(
      productoIds.map((productoId) => detalle(productoId, 999, '99999.99')),
    );
    expect(resultado.total).toBe('9989999001.00');
    expect(await contexto.llamador.contar()).toEqual({
      ventas: antes.ventas + 1,
      detalles: antes.detalles + 100,
    });
    const guardados = await leerDetalles(resultado.ventaId);
    expect(guardados.map((guardado) => guardado.subtotal)).toEqual(Array(100).fill('99899990.01'));
  }, 30_000);
});

describe('las formas de entrada', () => {
  it('acepta el precio y la cantidad como número JSON o como texto, si tienen la forma exacta', async () => {
    const [leche, pan, huevos] = contexto.productoIds;
    const resultado = await contexto.llamador.llamar([
      detalle(leche, '2', 22.5),
      detalle(pan, 3, '1.25'),
      detalle(huevos, '10', '0.5'),
    ]);
    expect(await leerDetalles(resultado.ventaId)).toEqual([
      { productoId: leche, cantidad: 2, precioAplicado: '22.50', subtotal: '45.00' },
      { productoId: pan, cantidad: 3, precioAplicado: '1.25', subtotal: '3.75' },
      { productoId: huevos, cantidad: 10, precioAplicado: '0.50', subtotal: '5.00' },
    ]);
    expect(resultado.total).toBe('53.75');
  });

  it('calcula el subtotal y el total en MySQL: ignora los que vengan en el JSON (RN-08 y RN-09)', async () => {
    const [leche, pan] = contexto.productoIds;
    const resultado = await contexto.llamador.llamar([
      {
        ...detalle(leche, 2, '22.00'),
        subtotal: '1.00',
        total: '1.00',
        fecha: '2000-01-01 00:00:00',
        nombre: 'Otro nombre',
      },
      { ...detalle(pan, 1, '3.50'), subtotal: '999.00' },
    ]);
    expect(resultado.total).toBe('47.50');
    const guardados = await leerDetalles(resultado.ventaId);
    expect(guardados.map((guardado) => guardado.subtotal)).toEqual(['44.00', '3.50']);
    const [{ anio }] = await consultar('SELECT YEAR(fecha) AS anio FROM ventas WHERE id = :id', {
      id: resultado.ventaId,
    });
    expect(anio).toBeGreaterThan(2000);
  });
});

describe('los precios escritos como número JSON', () => {
  // MySQL lee un número JSON con punto como DOUBLE y lo pasa a DECIMAL(10,2): los precios con 2 decimales
  // que en punto flotante no son exactos (1.15, 4.35, 0.07...) se tienen que guardar igual que se escribieron.
  const PRECIOS = [
    0.01, 0.07, 0.14, 0.29, 0.57, 1.1, 1.15, 4.35, 5.05, 8.2, 10.29, 19.99, 1234.56, 99999.99,
  ];

  it('se guardan exactos, sin errores de punto flotante', async () => {
    const productoIds = await crearProductos(PRECIOS.length, 'FLOTANTE');
    const resultado = await contexto.llamador.llamar(
      PRECIOS.map((precio, i) => detalle(productoIds[i], 1, precio)),
    );
    const guardados = await leerDetalles(resultado.ventaId);
    expect(guardados.map((guardado) => guardado.precioAplicado)).toEqual(
      PRECIOS.map((precio) => precio.toFixed(2)),
    );
    expect(guardados.map((guardado) => guardado.subtotal)).toEqual(
      PRECIOS.map((precio) => precio.toFixed(2)),
    );
  });

  it('un 1e2 escrito como número llega a MySQL ya convertido a 100.0 y se guarda como 100.00; como texto se rechaza', async () => {
    // MySQL no conserva cómo se escribió un número JSON, así que el procedimiento no puede ver la notación científica.
    const [leche] = contexto.productoIds;
    const resultado = await contexto.llamador.llamarCrudo(
      `[{"productoId": ${leche}, "cantidad": 1, "precioAplicado": 1e2}]`,
    );
    expect(resultado[0][0].total).toBe('100.00');
  });
});

describe('lo que devuelve', () => {
  it('un solo SELECT al final, con una fila y dos columnas: ventaId (número) y total (texto con 2 decimales)', async () => {
    const [leche] = contexto.productoIds;
    const resultados = await contexto.llamador.llamarCrudo(
      JSON.stringify([detalle(leche, 1, '5')]),
    );
    // mysql2 entrega un elemento por cada conjunto de resultados del CALL, y al final el paquete OK.
    // Un SELECT suelto de más sumaría un elemento.
    expect(resultados).toHaveLength(2);
    const [filas, paqueteOk] = resultados;
    expect(Array.isArray(filas)).toBe(true);
    expect(Array.isArray(paqueteOk)).toBe(false);
    expect(filas).toHaveLength(1);
    expect(Object.keys(filas[0])).toEqual(['ventaId', 'total']);
    expect(typeof filas[0].ventaId).toBe('number');
    expect(filas[0].total).toBe('5.00');
  });

  it('llamado desde Sequelize, como lo hará el servicio, la primera fila es { ventaId, total }', async () => {
    const [leche, pan] = contexto.productoIds;
    const fila = await contexto.llamarComoElServicio([
      detalle(leche, 2, '22.00'),
      detalle(pan, 1, '3.50'),
    ]);
    expect(fila).toEqual({ ventaId: expect.any(Number), total: '47.50' });
  });

  it('no tiene parámetros OUT: su único parámetro es p_detalles, de entrada y de tipo JSON', async () => {
    const parametros = await consultar(
      `SELECT parameter_mode AS modo, parameter_name AS nombre, data_type AS tipo
         FROM information_schema.parameters
        WHERE specific_schema = DATABASE() AND specific_name = 'sp_registrar_venta'
        ORDER BY ordinal_position`,
    );
    expect(parametros).toEqual([{ modo: 'IN', nombre: 'p_detalles', tipo: 'json' }]);
  });
});

describe('varias llamadas al mismo tiempo', () => {
  it('crean ventas distintas, cada una completa y con sus propios detalles', async () => {
    const [leche, pan, huevos] = contexto.productoIds;
    const entradas = [
      [detalle(leche, 1, '1.00')],
      [detalle(pan, 2, '2.00'), detalle(leche, 1, '4.00')],
      [detalle(huevos, 3, '3.00')],
      [detalle(leche, 4, '5.00'), detalle(pan, 1, '1.50'), detalle(huevos, 2, '2.25')],
    ];
    const resultados = await Promise.all(
      entradas.map((detalles) => contexto.llamarComoElServicio(detalles)),
    );
    expect(new Set(resultados.map((resultado) => resultado.ventaId)).size).toBe(entradas.length);
    expect(resultados.map((resultado) => resultado.total)).toEqual([
      '1.00',
      '8.00',
      '9.00',
      '26.00',
    ]);
    for (const [i, resultado] of resultados.entries()) {
      const guardados = await leerDetalles(resultado.ventaId);
      expect(guardados.map(({ productoId, cantidad }) => ({ productoId, cantidad }))).toEqual(
        entradas[i].map(({ productoId, cantidad }) => ({ productoId, cantidad })),
      );
    }
  });
});
