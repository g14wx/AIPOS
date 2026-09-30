import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ErrorApi = require('../../src/errors/ErrorApi.js');
const { validarVentaNueva } = require('../../src/validators/ventas.js');

// El validador de registrar venta (spec de registrar venta, "API: POST /api/ventas"): revisa todo antes de
// tocar la base de datos, junta todos los campos con problema y devuelve los datos limpios. No necesita MySQL.
// Las reglas son RN-05 (precio aplicado), RN-06 (cantidad), RN-07 (un detalle por producto), RN-10 (al menos
// un detalle) y RN-14 (como máximo 100 detalles).
const MENSAJE_DEL_400 = 'Los datos de la venta no son válidos. Revisa los campos marcados.';
const RANGO_DEL_ID = 'Debe ser un entero de 1 a 2147483647.';
const RANGO_DE_LA_CANTIDAD = 'Debe ser un entero de 1 a 999.';

const detalleValido = (cambios = {}) => ({
  productoId: 3,
  cantidad: 2,
  precioAplicado: '22.00',
  ...cambios,
});
const ventaValida = () => ({
  detalles: [
    detalleValido(),
    detalleValido({ productoId: 7, cantidad: 1, precioAplicado: '3.50' }),
  ],
});

// Corre el validador y devuelve lo que lanzó (o undefined si no lanzó nada).
function errorDe(cuerpo) {
  try {
    validarVentaNueva(cuerpo);
  } catch (err) {
    return err;
  }
  return undefined;
}

const detallesDe = (cuerpo) => errorDe(cuerpo)?.detalles;
const conDetalles = (detalles) => ({ detalles });
// `cantidad` productos distintos, todos válidos.
const variosDetalles = (cantidad) =>
  Array.from({ length: cantidad }, (_, i) => detalleValido({ productoId: i + 1 }));

describe('una venta válida', () => {
  it('devuelve los detalles, cada uno con solo productoId, cantidad y precioAplicado, en el mismo orden', () => {
    const limpia = validarVentaNueva(ventaValida());
    expect(limpia).toEqual(ventaValida());
    expect(Object.keys(limpia)).toEqual(['detalles']);
    for (const detalle of limpia.detalles) {
      expect(Object.keys(detalle)).toEqual(['productoId', 'cantidad', 'precioAplicado']);
    }
  });

  it('ignora los campos que sobran: la API no recibe un total ni un subtotal (RN-09)', () => {
    const cuerpo = {
      total: '1.00',
      id: 99,
      fecha: '2020-01-01',
      detalles: [{ ...detalleValido(), subtotal: '0.01', nombre: 'Leche', id: 5 }],
    };
    expect(validarVentaNueva(cuerpo)).toEqual({ detalles: [detalleValido()] });
  });

  it('no formatea el dinero: "22" sigue siendo "22" (los 2 decimales los pone MySQL)', () => {
    const limpia = validarVentaNueva(conDetalles([detalleValido({ precioAplicado: '22' })]));
    expect(limpia.detalles[0].precioAplicado).toBe('22');
  });

  it('no cambia el cuerpo que recibe', () => {
    const cuerpo = { total: '1.00', detalles: [{ ...detalleValido(), subtotal: '9.99' }] };
    const copia = structuredClone(cuerpo);
    validarVentaNueva(cuerpo);
    expect(cuerpo).toEqual(copia);
  });

  it.each(['0', '0.0', '0.00', '0.01', '99999.99', '00022', '7.5'])(
    'acepta el precio aplicado "%s" (RN-05: de 0 a 99999.99)',
    (precioAplicado) => {
      const limpia = validarVentaNueva(conDetalles([detalleValido({ precioAplicado })]));
      expect(limpia.detalles[0].precioAplicado).toBe(precioAplicado);
    },
  );

  it.each([1, 2, 998, 999])('acepta la cantidad %s (RN-06: de 1 a 999)', (cantidad) => {
    const limpia = validarVentaNueva(conDetalles([detalleValido({ cantidad })]));
    expect(limpia.detalles[0].cantidad).toBe(cantidad);
  });

  it.each([1, 2, 2147483647])('acepta el productoId %s (cabe en INT)', (productoId) => {
    const limpia = validarVentaNueva(conDetalles([detalleValido({ productoId })]));
    expect(limpia.detalles[0].productoId).toBe(productoId);
  });

  it('un número escrito como 3.0 o 1e0 en el JSON llega como el entero 3 o 1 y se acepta', () => {
    const cuerpo = JSON.parse(
      '{"detalles":[{"productoId":3.0,"cantidad":1e0,"precioAplicado":"1"}]}',
    );
    expect(validarVentaNueva(cuerpo).detalles[0]).toEqual({
      productoId: 3,
      cantidad: 1,
      precioAplicado: '1',
    });
  });

  it('acepta una venta con un solo detalle y una con 100 detalles (RN-14)', () => {
    expect(validarVentaNueva(conDetalles([detalleValido()])).detalles).toHaveLength(1);
    expect(validarVentaNueva(conDetalles(variosDetalles(100))).detalles).toHaveLength(100);
  });
});

describe('una venta inválida lanza un 400 con el formato de error', () => {
  it('es un ErrorApi 400 DATOS_INVALIDOS con el mensaje de la venta, sea cual sea el campo con problema', () => {
    const err = errorDe({});
    expect(err).toBeInstanceOf(ErrorApi);
    expect(err).toMatchObject({ estado: 400, codigo: 'DATOS_INVALIDOS' });
    expect(err.message).toBe(MENSAJE_DEL_400);
    expect(errorDe(conDetalles([detalleValido({ cantidad: 0 })])).message).toBe(MENSAJE_DEL_400);
  });

  it.each([
    ['falta (undefined)', undefined],
    ['es null', null],
    ['es un arreglo', []],
    ['es un arreglo con una venta adentro', [ventaValida()]],
    ['es un texto', 'detalles=1'],
    ['es un número', 5],
    ['es un booleano', true],
  ])('un cuerpo que %s se trata como un cuerpo vacío: detalles es obligatorio', (_caso, cuerpo) => {
    expect(detallesDe(cuerpo)).toEqual([{ campo: 'detalles', mensaje: 'Es obligatorio.' }]);
  });

  it('detalles en null o ausente dice que es obligatorio', () => {
    expect(detallesDe({ detalles: null })).toEqual([
      { campo: 'detalles', mensaje: 'Es obligatorio.' },
    ]);
    expect(detallesDe({ total: '1.00' })).toEqual([
      { campo: 'detalles', mensaje: 'Es obligatorio.' },
    ]);
  });

  it.each([
    ['un objeto', {}],
    ['un texto', 'x'],
    ['un número', 3],
    ['un booleano', false],
    ['un objeto con forma de lista', { 0: detalleValido(), length: 1 }],
  ])('detalles que es %s dice que debe ser una lista', (_caso, detalles) => {
    expect(detallesDe(conDetalles(detalles))).toEqual([
      { campo: 'detalles', mensaje: 'Debe ser una lista de detalles de venta.' },
    ]);
  });

  it('una lista vacía pide al menos un producto (RN-10)', () => {
    expect(detallesDe(conDetalles([]))).toEqual([
      { campo: 'detalles', mensaje: 'Agrega al menos un producto.' },
    ]);
  });

  it('con 101 detalles dice el máximo de 100 productos (RN-14) y no revisa cada detalle', () => {
    const esperado = [
      { campo: 'detalles', mensaje: 'Una venta puede tener como máximo 100 productos.' },
    ];
    expect(detallesDe(conDetalles(variosDetalles(101)))).toEqual(esperado);
    // Aunque cada elemento sea inválido, el único problema que dice es el máximo.
    expect(detallesDe(conDetalles(Array.from({ length: 101 }, () => ({}))))).toEqual(esperado);
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['un número', 5],
    ['un texto', 'x'],
    ['un arreglo', []],
    ['un booleano', true],
  ])(
    'un detalle que es %s dice que debe ser un objeto, sin revisar sus campos',
    (_caso, detalle) => {
      expect(detallesDe(conDetalles([detalleValido(), detalle]))).toEqual([
        {
          campo: 'detalles[1]',
          mensaje: 'Debe ser un objeto con productoId, cantidad y precioAplicado.',
        },
      ]);
    },
  );

  it.each([
    ['falta (undefined)', undefined, 'Es obligatorio.'],
    ['es null', null, 'Es obligatorio.'],
    ['es un texto con un entero ("3")', '3', RANGO_DEL_ID],
    ['es un decimal (3.5)', 3.5, RANGO_DEL_ID],
    ['es cero', 0, RANGO_DEL_ID],
    ['es negativo', -1, RANGO_DEL_ID],
    ['pasa de lo que cabe en INT', 2147483648, RANGO_DEL_ID],
    ['es un booleano', true, RANGO_DEL_ID],
  ])(
    'un productoId que %s es un 400 que apunta a detalles[0].productoId',
    (_caso, valor, mensaje) => {
      expect(detallesDe(conDetalles([detalleValido({ productoId: valor })]))).toEqual([
        { campo: 'detalles[0].productoId', mensaje },
      ]);
    },
  );

  it.each([
    ['falta (undefined)', undefined, 'Es obligatorio.'],
    ['es cero', 0, RANGO_DE_LA_CANTIDAD],
    ['es 1000', 1000, RANGO_DE_LA_CANTIDAD],
    ['es un texto ("2")', '2', RANGO_DE_LA_CANTIDAD],
    ['es un decimal (1.5)', 1.5, RANGO_DE_LA_CANTIDAD],
    ['es negativa', -3, RANGO_DE_LA_CANTIDAD],
  ])('una cantidad que %s es un 400 que apunta a detalles[1].cantidad', (_caso, valor, mensaje) => {
    const detalles = [detalleValido(), detalleValido({ productoId: 7, cantidad: valor })];
    expect(detallesDe(conDetalles(detalles))).toEqual([{ campo: 'detalles[1].cantidad', mensaje }]);
  });

  it.each([
    ['falta (undefined)', undefined, 'Es obligatorio.'],
    ['es un número JSON (22.5)', 22.5, 'Debe enviarse como texto, por ejemplo "25.50".'],
    ['tiene 3 decimales ("10.999")', '10.999', 'No puede tener más de 2 decimales.'],
    ['es negativo ("-1")', '-1', 'Debe ser un número con punto decimal, por ejemplo 25.50.'],
    ['pasa de 99999.99 ("100000")', '100000', 'No puede ser mayor que 99999.99.'],
    ['no es un número ("abc")', 'abc', 'Debe ser un número con punto decimal, por ejemplo 25.50.'],
  ])(
    'un precio aplicado que %s es un 400 que apunta a detalles[0].precioAplicado',
    (_caso, valor, mensaje) => {
      expect(detallesDe(conDetalles([detalleValido({ precioAplicado: valor })]))).toEqual([
        { campo: 'detalles[0].precioAplicado', mensaje },
      ]);
    },
  );
});

describe('un producto no puede repetirse en la venta (RN-07)', () => {
  const REPETIDO = 'Este producto ya está en la venta.';

  it('el segundo detalle con el mismo productoId es un 400 que apunta a él, no al primero', () => {
    const detalles = [
      detalleValido(),
      detalleValido({ productoId: 7 }),
      detalleValido({ cantidad: 5 }),
    ];
    expect(detallesDe(conDetalles(detalles))).toEqual([
      { campo: 'detalles[2].productoId', mensaje: REPETIDO },
    ]);
  });

  it('con el mismo producto tres veces marca el segundo y el tercero', () => {
    const detalles = [detalleValido(), detalleValido(), detalleValido()];
    expect(detallesDe(conDetalles(detalles))).toEqual([
      { campo: 'detalles[1].productoId', mensaje: REPETIDO },
      { campo: 'detalles[2].productoId', mensaje: REPETIDO },
    ]);
  });

  it('3 y 3.0 son el mismo producto: JSON no distingue un entero de un decimal sin parte fraccionaria', () => {
    const cuerpo = JSON.parse(
      '{"detalles":[{"productoId":3,"cantidad":1,"precioAplicado":"1"},' +
        '{"productoId":3.0,"cantidad":1,"precioAplicado":"1"}]}',
    );
    expect(detallesDe(cuerpo)).toEqual([{ campo: 'detalles[1].productoId', mensaje: REPETIDO }]);
  });

  it('dos productoId inválidos iguales no cuentan como repetidos: solo se dice que son inválidos', () => {
    const detalles = [detalleValido({ productoId: 'x' }), detalleValido({ productoId: 'x' })];
    expect(detallesDe(conDetalles(detalles))).toEqual([
      { campo: 'detalles[0].productoId', mensaje: RANGO_DEL_ID },
      { campo: 'detalles[1].productoId', mensaje: RANGO_DEL_ID },
    ]);
  });
});

describe('junta todos los campos con problema, en un orden fijo', () => {
  it('reúne los problemas de todos los detalles, no solo los del primero', () => {
    const detalles = [
      { productoId: 'x', cantidad: 0, precioAplicado: 5 },
      detalleValido({ productoId: 7 }),
      { productoId: 7, cantidad: 1000, precioAplicado: '10.999' },
    ];
    expect(detallesDe(conDetalles(detalles))).toEqual([
      { campo: 'detalles[0].productoId', mensaje: RANGO_DEL_ID },
      { campo: 'detalles[0].cantidad', mensaje: RANGO_DE_LA_CANTIDAD },
      {
        campo: 'detalles[0].precioAplicado',
        mensaje: 'Debe enviarse como texto, por ejemplo "25.50".',
      },
      { campo: 'detalles[2].productoId', mensaje: 'Este producto ya está en la venta.' },
      { campo: 'detalles[2].cantidad', mensaje: RANGO_DE_LA_CANTIDAD },
      { campo: 'detalles[2].precioAplicado', mensaje: 'No puede tener más de 2 decimales.' },
    ]);
  });

  it('dentro de cada detalle va productoId, cantidad y precioAplicado, aunque el cuerpo los escriba al revés', () => {
    const alReves = { precioAplicado: 'abc', cantidad: 0, productoId: 'x' };
    expect(detallesDe(conDetalles([alReves])).map((detalle) => detalle.campo)).toEqual([
      'detalles[0].productoId',
      'detalles[0].cantidad',
      'detalles[0].precioAplicado',
    ]);
  });

  it('un detalle sin ningún campo marca los tres como obligatorios', () => {
    expect(detallesDe(conDetalles([{}]))).toEqual([
      { campo: 'detalles[0].productoId', mensaje: 'Es obligatorio.' },
      { campo: 'detalles[0].cantidad', mensaje: 'Es obligatorio.' },
      { campo: 'detalles[0].precioAplicado', mensaje: 'Es obligatorio.' },
    ]);
  });

  it('el campo de cada detalle del error nombra la posición del detalle que falló', () => {
    const detalles = [...variosDetalles(9), detalleValido({ productoId: 10, cantidad: 0 })];
    expect(detallesDe(conDetalles(detalles))).toEqual([
      { campo: 'detalles[9].cantidad', mensaje: RANGO_DE_LA_CANTIDAD },
    ]);
  });
});
