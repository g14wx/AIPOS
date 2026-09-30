// Spec armar-venta-actual, "cambiarPrecioAplicado y validarPrecioAplicado (V-05)" y criterios 1, 3 y 4 de V-05 (RF-05, RN-05):
// editar el precio aplicado de un detalle de la venta actual. validarPrecioAplicado dice si lo que escribió el cajero sirve
// (de 0 a 99 999.99, con 2 decimales como máximo) y devuelve el valor con 2 decimales o el mensaje; cambiarPrecioAplicado
// aplica ese resultado: el valor nuevo en el detalle, o el mensaje en `errores` con el detalle igual. Son funciones puras:
// la venta actual llega congelada (Object.freeze en todos los niveles) y ninguna la modifica.
import { describe, it, expect } from 'vitest';
import { formatearCentavos } from '../../src/dinero.js';
import {
  agregarAVentaActual,
  calcularSubtotal,
  calcularTotal,
  cambiarPrecioAplicado,
  ventaActualEsValida,
} from '../../src/ventaActual/ventaActual.js';
import { validarPrecioAplicado } from '../../src/ventaActual/validaciones.js';

const congelar = (valor) => {
  Object.values(valor).forEach(
    (hijo) => typeof hijo === 'object' && hijo !== null && congelar(hijo),
  );
  return Object.freeze(valor);
};

// Los mensajes de la spec, escritos otra vez a propósito: si cambian en el código, esta prueba avisa.
const MENSAJES = {
  vacio: 'Escribe un precio aplicado.',
  decimales: 'Usa hasta 2 decimales.',
  formato: 'El precio aplicado debe ser un número de 0 a 99 999.99, como 22.00.',
};

const leche = { productoId: 1, nombre: 'Leche entera 1 L', precioAplicado: '25.00', cantidad: 1 };
const pan = { productoId: 2, nombre: 'Pan de caja', precioAplicado: '3.50', cantidad: 1 };
const regalo = { productoId: 3, nombre: 'Bolsa', precioAplicado: '0.00', cantidad: 1 };
const venta = (...detalles) => ({ detalles, errores: {} });
const subtotal = (detalle) => formatearCentavos(calcularSubtotal(detalle));
const total = (actual) => formatearCentavos(calcularTotal(actual));

describe('validarPrecioAplicado: textos válidos (tabla de la spec)', () => {
  it.each([
    ['22', '22.00'],
    ['22.5', '22.50'],
    ['22.50', '22.50'],
    ['0', '0.00'],
    ['0.00', '0.00'],
    ['99999.99', '99999.99'],
    [' 22.50 ', '22.50'],
    ['00022', '22.00'],
  ])('«%s» es válido y queda como «%s»', (texto, valor) => {
    expect(validarPrecioAplicado(texto)).toStrictEqual({ valido: true, valor });
  });

  it.each([
    ['0.5', '0.50'],
    ['0.05', '0.05'],
    ['1.1', '1.10'],
    ['99999', '99999.00'],
    ['00000', '0.00'],
    ['0.0', '0.00'],
    ['\t22\n', '22.00'],
    [' 22.5 ', '22.50'],
  ])('también «%j», que queda como «%s»', (texto, valor) => {
    expect(validarPrecioAplicado(texto)).toStrictEqual({ valido: true, valor });
  });

  it('el valor siempre tiene 2 decimales y cabe en DECIMAL(10,2): hasta 5 enteros', () => {
    for (const texto of ['0', '7', '7.5', '12.34', '1000', '99999', '99999.9', '99999.99']) {
      expect(validarPrecioAplicado(texto).valor).toMatch(/^\d{1,5}\.\d{2}$/);
    }
  });
});

describe('validarPrecioAplicado: sin texto', () => {
  it.each(['', ' ', '   ', '\t', '\n', ' \t\n '])(
    '«%j» pide escribir un precio aplicado',
    (texto) => {
      expect(validarPrecioAplicado(texto)).toStrictEqual({
        valido: false,
        mensaje: MENSAJES.vacio,
      });
    },
  );
});

describe('validarPrecioAplicado: más de 2 decimales', () => {
  it.each(['22.999', '1.234', '0.001', '22.123456789', '99999.999', ' 22.505 '])(
    '«%s» dice que se usan hasta 2 decimales',
    (texto) => {
      expect(validarPrecioAplicado(texto)).toStrictEqual({
        valido: false,
        mensaje: MENSAJES.decimales,
      });
    },
  );

  it('con dos problemas dice primero el de los decimales, como el formulario de producto', () => {
    expect(validarPrecioAplicado('100000.999').mensaje).toBe(MENSAJES.decimales);
  });
});

describe('validarPrecioAplicado: lo que no es un precio aplicado', () => {
  it.each([
    '-1',
    'abc',
    '2,5',
    '1e3',
    '100000',
    '100000.00',
    '22.',
    '.5',
    '+5',
    '22 50',
    '2 2',
    '22.5.1',
    '22..5',
    '--1',
    '-0',
    '0x10',
    'Infinity',
    'NaN',
    '١٢',
    '１２',
    '22,50',
    '$22',
    '22.50 USD',
    '999999',
    '100000.5',
    ' - 1',
  ])('«%s» dice que debe ser un número de 0 a 99 999.99', (texto) => {
    expect(validarPrecioAplicado(texto)).toStrictEqual({
      valido: false,
      mensaje: MENSAJES.formato,
    });
  });

  it.each([
    ['un número', 22.5],
    ['el número cero', 0],
    ['NaN', NaN],
    ['null', null],
    ['undefined', undefined],
    ['un objeto', {}],
    ['una lista', ['22']],
    ['un booleano', true],
    ['un símbolo', Symbol('22')],
    ['un bigint', 22n],
  ])('%s no es texto: el mismo mensaje, sin lanzar un error', (_nombre, entrada) => {
    expect(validarPrecioAplicado(entrada)).toStrictEqual({
      valido: false,
      mensaje: MENSAJES.formato,
    });
  });

  it('un texto larguísimo se rechaza sin quedarse pensando', () => {
    expect(validarPrecioAplicado('9'.repeat(100000) + 'x').mensaje).toBe(MENSAJES.formato);
    expect(validarPrecioAplicado('9'.repeat(100000)).mensaje).toBe(MENSAJES.formato);
  });
});

describe('cambiarPrecioAplicado: un texto válido', () => {
  it('criterio 1: la leche a 25.00 pasa a 22.00 y se recalculan el subtotal y el total', () => {
    const nueva = cambiarPrecioAplicado(venta(leche), 1, '22.00');
    expect(nueva.detalles[0].precioAplicado).toBe('22.00');
    expect(subtotal(nueva.detalles[0])).toBe('22.00');
    expect(total(nueva)).toBe('22.00');
  });

  it('el subtotal sale del precio aplicado nuevo y de la cantidad: 3 leches a 22.00 valen 66.00', () => {
    const nueva = cambiarPrecioAplicado(venta({ ...leche, cantidad: 3 }, pan), 1, '22');
    expect(subtotal(nueva.detalles[0])).toBe('66.00');
    expect(total(nueva)).toBe('69.50');
  });

  it('guarda el valor con 2 decimales, como lo devuelve validarPrecioAplicado', () => {
    const con = (texto) => cambiarPrecioAplicado(venta(leche), 1, texto).detalles[0].precioAplicado;
    expect(con('22')).toBe('22.00');
    expect(con(' 22.5 ')).toBe('22.50');
    expect(con('00022')).toBe('22.00');
  });

  it('cambia el detalle que dice el productoId, aunque no sea el primero', () => {
    const nueva = cambiarPrecioAplicado(venta(leche, pan), 2, '4');
    expect(nueva.detalles.map((detalle) => detalle.precioAplicado)).toEqual(['25.00', '4.00']);
  });

  it('no cambia nada más: ni la cantidad, ni el nombre, ni el orden, ni los otros detalles', () => {
    const actual = venta({ ...leche, cantidad: 3 }, pan, regalo);
    const nueva = cambiarPrecioAplicado(actual, 1, '20');
    expect(nueva.detalles.map((detalle) => detalle.productoId)).toEqual([1, 2, 3]);
    expect(nueva.detalles[0]).toStrictEqual({ ...leche, cantidad: 3, precioAplicado: '20.00' });
    expect(nueva.detalles[1]).toBe(actual.detalles[1]);
    expect(nueva.detalles[2]).toBe(actual.detalles[2]);
  });

  it('devuelve una venta actual nueva: no es la que recibió ni comparte su lista de detalles', () => {
    const actual = venta(leche);
    const nueva = cambiarPrecioAplicado(actual, 1, '22');
    expect(nueva).not.toBe(actual);
    expect(nueva.detalles).not.toBe(actual.detalles);
    expect(actual.detalles[0].precioAplicado).toBe('25.00');
  });

  it('cambiar dos veces al mismo precio deja lo mismo', () => {
    const una = cambiarPrecioAplicado(venta(leche), 1, '22');
    expect(cambiarPrecioAplicado(una, 1, '22.00')).toStrictEqual(una);
  });

  it('quita el error de precio aplicado que hubiera; si era el único del detalle, su clave se va', () => {
    const actual = { detalles: [leche, pan], errores: { 1: { precioAplicado: MENSAJES.formato } } };
    expect(cambiarPrecioAplicado(actual, 1, '22').errores).toStrictEqual({});
  });

  it('quita solo el error de precio aplicado: el de cantidad del mismo detalle y los de otros se quedan', () => {
    const errorDeCantidad = 'La cantidad debe ser un número entero de 1 a 999.';
    const actual = {
      detalles: [leche, pan],
      errores: {
        1: { precioAplicado: MENSAJES.formato, cantidad: errorDeCantidad },
        2: { precioAplicado: MENSAJES.vacio },
      },
    };
    expect(cambiarPrecioAplicado(actual, 1, '22').errores).toStrictEqual({
      1: { cantidad: errorDeCantidad },
      2: { precioAplicado: MENSAJES.vacio },
    });
  });

  it('criterio 3: el 0 es válido, el subtotal es 0.00 y la venta actual sigue siendo válida', () => {
    const nueva = cambiarPrecioAplicado(venta({ ...leche, cantidad: 4 }), 1, '0');
    expect(nueva.detalles[0].precioAplicado).toBe('0.00');
    expect(subtotal(nueva.detalles[0])).toBe('0.00');
    expect(total(nueva)).toBe('0.00');
    expect(nueva.errores).toStrictEqual({});
    expect(ventaActualEsValida(nueva)).toBe(true);
  });

  it('el máximo, 99999.99, es válido y 999 unidades suman 99899990.01 sin perder centavos', () => {
    const nueva = cambiarPrecioAplicado(venta({ ...leche, cantidad: 999 }), 1, '99999.99');
    expect(subtotal(nueva.detalles[0])).toBe('99899990.01');
    expect(total(nueva)).toBe('99899990.01');
  });

  it('calcula en centavos: 0.10 × 3 + 0.20 da 0.50 y 1.15 × 3 da 3.45', () => {
    const actual = venta({ ...leche, cantidad: 3 }, { ...pan, precioAplicado: '0.20' });
    const nueva = cambiarPrecioAplicado(actual, 1, '0.10');
    expect(total(nueva)).toBe('0.50');
    expect(subtotal(cambiarPrecioAplicado(actual, 1, '1.15').detalles[0])).toBe('3.45');
  });
});

describe('cambiarPrecioAplicado: un texto que no sirve', () => {
  it.each([
    ['-1', MENSAJES.formato],
    ['abc', MENSAJES.formato],
    ['22.999', MENSAJES.decimales],
    ['100000', MENSAJES.formato],
    ['', MENSAJES.vacio],
    ['   ', MENSAJES.vacio],
    [null, MENSAJES.formato],
    [undefined, MENSAJES.formato],
    [22.5, MENSAJES.formato],
  ])('«%s»: el detalle no cambia y el mensaje queda en errores', (texto, mensaje) => {
    const actual = venta(leche, pan);
    const nueva = cambiarPrecioAplicado(actual, 1, texto);
    expect(nueva.detalles).toStrictEqual(actual.detalles);
    expect(nueva.detalles[0]).toBe(actual.detalles[0]);
    expect(nueva.errores).toStrictEqual({ 1: { precioAplicado: mensaje } });
    expect(ventaActualEsValida(nueva)).toBe(false);
  });

  it('conserva el último valor válido: el subtotal y el total siguen siendo los de antes', () => {
    const valido = cambiarPrecioAplicado(venta({ ...leche, cantidad: 2 }, pan), 1, '22');
    const nueva = cambiarPrecioAplicado(valido, 1, 'abc');
    expect(nueva.detalles[0].precioAplicado).toBe('22.00');
    expect(subtotal(nueva.detalles[0])).toBe('44.00');
    expect(total(nueva)).toBe('47.50');
  });

  it('un error nuevo reemplaza el mensaje anterior del mismo detalle', () => {
    const vacio = cambiarPrecioAplicado(venta(leche), 1, '');
    expect(vacio.errores).toStrictEqual({ 1: { precioAplicado: MENSAJES.vacio } });
    const letras = cambiarPrecioAplicado(vacio, 1, 'abc');
    expect(letras.errores).toStrictEqual({ 1: { precioAplicado: MENSAJES.formato } });
  });

  it('deja los errores de otros detalles y de otros campos como estaban', () => {
    const errorDeCantidad = 'La cantidad debe ser un número entero de 1 a 999.';
    const actual = {
      detalles: [leche, pan],
      errores: { 1: { cantidad: errorDeCantidad }, 2: { precioAplicado: MENSAJES.vacio } },
    };
    expect(cambiarPrecioAplicado(actual, 1, '-1').errores).toStrictEqual({
      1: { cantidad: errorDeCantidad, precioAplicado: MENSAJES.formato },
      2: { precioAplicado: MENSAJES.vacio },
    });
  });

  it('no cambia los otros detalles: siguen siendo los mismos objetos', () => {
    const actual = venta(leche, pan);
    const nueva = cambiarPrecioAplicado(actual, 1, 'abc');
    expect(nueva.detalles[1]).toBe(actual.detalles[1]);
    expect(nueva.detalles.map((detalle) => detalle.productoId)).toEqual([1, 2]);
  });

  it('criterio 5 del módulo: un valor válido corrige el error y la venta actual vuelve a ser válida', () => {
    const conError = cambiarPrecioAplicado(venta(leche), 1, 'abc');
    expect(ventaActualEsValida(conError)).toBe(false);
    const corregida = cambiarPrecioAplicado(conError, 1, '21.5');
    expect(corregida.errores).toStrictEqual({});
    expect(corregida.detalles[0].precioAplicado).toBe('21.50');
    expect(ventaActualEsValida(corregida)).toBe(true);
  });

  it('con dos detalles con error, corregir uno no habilita la venta actual hasta corregir el otro', () => {
    let actual = cambiarPrecioAplicado(venta(leche, pan), 1, 'abc');
    actual = cambiarPrecioAplicado(actual, 2, '-1');
    actual = cambiarPrecioAplicado(actual, 1, '20');
    expect(ventaActualEsValida(actual)).toBe(false);
    expect(Object.keys(actual.errores)).toEqual(['2']);
    actual = cambiarPrecioAplicado(actual, 2, '3');
    expect(ventaActualEsValida(actual)).toBe(true);
  });
});

describe('cambiarPrecioAplicado: un productoId que no está', () => {
  it.each(['22', 'abc', ''])('con «%s» devuelve la misma venta actual, sin error', (texto) => {
    const actual = venta(leche);
    expect(cambiarPrecioAplicado(actual, 99, texto)).toBe(actual);
  });

  it('una venta actual vacía también: el cajero pudo eliminar el detalle un instante antes', () => {
    const vacia = { detalles: [], errores: {} };
    expect(cambiarPrecioAplicado(vacia, 1, '22')).toBe(vacia);
  });
});

describe('cambiarPrecioAplicado: no modifica lo que recibe (criterio 13) ni toca el producto (RN-05)', () => {
  it('con la venta actual congelada no lanza y la deja como estaba', () => {
    const errores = { 1: { cantidad: 'x' }, 2: { precioAplicado: MENSAJES.vacio } };
    const actual = congelar({ detalles: [{ ...leche }, { ...pan }], errores });
    for (const [productoId, texto] of [
      [1, '22'],
      [1, 'abc'],
      [2, '3'],
      [2, ''],
      [99, '22'],
    ]) {
      expect(() => cambiarPrecioAplicado(actual, productoId, texto)).not.toThrow();
    }
    expect(actual).toStrictEqual({ detalles: [leche, pan], errores });
  });

  it('el detalle es una copia del producto: su precio en la búsqueda sigue en 25.00', () => {
    const producto = {
      id: 1,
      nombre: 'Leche entera 1 L',
      codigoBarras: '7501055300075',
      precio: '25.00',
    };
    const agregada = agregarAVentaActual({ detalles: [], errores: {} }, producto);
    const nueva = cambiarPrecioAplicado(agregada, 1, '22');
    expect(nueva.detalles[0].precioAplicado).toBe('22.00');
    expect(producto.precio).toBe('25.00');
  });
});
