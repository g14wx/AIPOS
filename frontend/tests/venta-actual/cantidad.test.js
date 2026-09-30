// Spec armar-venta-actual, "`cambiarCantidad` y `validarCantidad` (V-06)" y criterios 3, 4 y 5 de V-06 (RF-06, RN-06 y
// RN-08): cambiar la cantidad de un detalle de la venta actual con los botones «+» y «−» o escribiéndola. La cantidad es
// un número entero de 1 a 999. Un valor escrito que no sirve no cambia el detalle: queda como error de un campo del
// detalle y «Registrar venta» se deshabilita. Son funciones puras: la venta actual llega congelada (Object.freeze en
// todos los niveles) y, si la función intenta modificarla, lanza un error y la prueba falla.
import { describe, it, expect } from 'vitest';
import { formatearCentavos } from '../../src/dinero.js';
import {
  CANTIDAD_MAXIMA,
  calcularSubtotal,
  calcularTotal,
  cambiarCantidad,
  detallesParaRegistrar,
  ventaActualEsValida,
} from '../../src/ventaActual/ventaActual.js';
import { validarCantidad } from '../../src/ventaActual/validaciones.js';

// Los mensajes de la spec, escritos otra vez a propósito: si cambian en el código, esta prueba avisa.
const MENSAJE_VACIA = 'Escribe una cantidad.';
const MENSAJE_INVALIDA = 'La cantidad debe ser un número entero de 1 a 999.';

const congelar = (valor) => {
  Object.values(valor).forEach(
    (hijo) => typeof hijo === 'object' && hijo !== null && congelar(hijo),
  );
  return Object.freeze(valor);
};

const leche = { productoId: 1, nombre: 'Leche entera 1 L', precioAplicado: '22.00', cantidad: 2 };
const pan = { productoId: 2, nombre: 'Pan de caja', precioAplicado: '3.50', cantidad: 1 };
const venta = (...detalles) => ({ detalles, errores: {} });
const total = (actual) => formatearCentavos(calcularTotal(actual));
const subtotal = (detalle) => formatearCentavos(calcularSubtotal(detalle));

describe('validarCantidad: lo que acepta (RN-06)', () => {
  // La tabla de la spec: un número entero o un texto de solo dígitos (recortado), de 1 a 999.
  it.each([
    [3, 3],
    ['3', 3],
    [' 3 ', 3],
    ['007', 7],
    [999, 999],
    ['999', 999],
    [1, 1],
    ['1', 1],
    ['000999', 999],
    ['\t12\n', 12],
    [3.0, 3],
    [500, 500],
  ])('%j es válida y vale %i', (valor, esperado) => {
    expect(validarCantidad(valor)).toEqual({ valido: true, valor: esperado });
  });

  it('el valor que devuelve es un número entero, aunque se escriba como texto', () => {
    expect(typeof validarCantidad('007').valor).toBe('number');
    expect(Number.isInteger(validarCantidad(' 42 ').valor)).toBe(true);
  });

  it('el máximo de la pantalla es el mismo que usa agregar a la venta actual: 999', () => {
    expect(CANTIDAD_MAXIMA).toBe(999);
    expect(validarCantidad(CANTIDAD_MAXIMA).valido).toBe(true);
    expect(validarCantidad(CANTIDAD_MAXIMA + 1).valido).toBe(false);
  });
});

describe('validarCantidad: lo que rechaza (criterio 3)', () => {
  it.each(['', ' ', '   ', '\t', '\n', ' \t\n '])('%j es una cantidad vacía', (valor) => {
    expect(validarCantidad(valor)).toEqual({ valido: false, mensaje: MENSAJE_VACIA });
  });

  // La tarjeta V-06 lista «0», «1.5» y «abc»; «1000» viene de RF-06 y de la pregunta abierta 4.
  it.each([0, '0', '1000', 1000, -2, 1.5, '1.5', 'abc', '1e2', '-1', null, NaN])(
    '%j no es una cantidad válida',
    (valor) => {
      expect(validarCantidad(valor)).toEqual({ valido: false, mensaje: MENSAJE_INVALIDA });
    },
  );

  it.each([
    undefined,
    true,
    false,
    {},
    Infinity,
    -Infinity,
    -0,
    0.5,
    999.5,
    '+5',
    '5.',
    '.5',
    '1 2',
    '1,5',
    '0x10',
    '3n',
    '0000',
    '٣',
    '１２',
    '9'.repeat(30),
    Number.MAX_SAFE_INTEGER,
    3n,
  ])('%s tampoco: solo valen los enteros y los textos de dígitos', (valor) => {
    expect(validarCantidad(valor)).toEqual({ valido: false, mensaje: MENSAJE_INVALIDA });
  });

  // Aparte de la tabla: it.each abre los arreglos como argumentos y [3] llegaría como 3.
  it('un arreglo, aunque traiga un número válido, tampoco', () => {
    expect(validarCantidad([])).toEqual({ valido: false, mensaje: MENSAJE_INVALIDA });
    expect(validarCantidad([3])).toEqual({ valido: false, mensaje: MENSAJE_INVALIDA });
    expect(validarCantidad(['3'])).toEqual({ valido: false, mensaje: MENSAJE_INVALIDA });
  });

  it('el límite está en 1 y en 999: el 0 y el 1000 no pasan, el 1 y el 999 sí', () => {
    expect(validarCantidad(0).valido).toBe(false);
    expect(validarCantidad(1).valido).toBe(true);
    expect(validarCantidad(999).valido).toBe(true);
    expect(validarCantidad(1000).valido).toBe(false);
    expect(validarCantidad('0').valido).toBe(false);
    expect(validarCantidad('1').valido).toBe(true);
    expect(validarCantidad('999').valido).toBe(true);
    expect(validarCantidad('1000').valido).toBe(false);
  });

  it('nunca lanza, ni con valores raros que fallan al convertirse en texto', () => {
    const raros = [
      Symbol('cantidad'),
      () => 3,
      Object.create(null),
      {
        toString() {
          throw new Error('no debe convertirse a texto');
        },
        valueOf() {
          throw new Error('no debe convertirse a número');
        },
      },
    ];
    for (const valor of raros) {
      expect(() => validarCantidad(valor)).not.toThrow();
      expect(validarCantidad(valor).valido).toBe(false);
    }
  });

  it('un resultado inválido trae solo el mensaje, y uno válido solo el valor', () => {
    expect(Object.keys(validarCantidad('abc'))).toEqual(['valido', 'mensaje']);
    expect(Object.keys(validarCantidad('3'))).toEqual(['valido', 'valor']);
  });

  it('es pura: devuelve un resultado nuevo cada vez y el mismo para la misma entrada', () => {
    expect(validarCantidad('5')).not.toBe(validarCantidad('5'));
    expect(validarCantidad('5')).toEqual(validarCantidad('5'));
    expect(validarCantidad('abc')).toEqual(validarCantidad('abc'));
  });
});

describe('cambiarCantidad: un valor válido (criterio 1 y RN-08)', () => {
  it('con la cantidad 2, pasar a 3 deja el subtotal en 66.00 y el total recalculado', () => {
    const actual = venta(leche, pan);
    const nueva = cambiarCantidad(actual, 1, 3);
    expect(nueva.detalles[0].cantidad).toBe(3);
    expect(subtotal(nueva.detalles[0])).toBe('66.00');
    expect(total(actual)).toBe('47.50');
    expect(total(nueva)).toBe('69.50');
  });

  it.each([
    [7, 7],
    ['7', 7],
    [' 7 ', 7],
    ['007', 7],
    [1, 1],
    [999, 999],
    ['999', 999],
  ])('acepta %j y deja la cantidad en %i', (valor, esperada) => {
    expect(cambiarCantidad(venta(leche, pan), 1, valor).detalles[0].cantidad).toBe(esperada);
  });

  it('cambia solo la cantidad del detalle: nombre, precio aplicado, orden y los demás detalles siguen igual', () => {
    const actual = venta(leche, pan);
    const nueva = cambiarCantidad(actual, 1, 5);
    expect(nueva.detalles).toEqual([{ ...leche, cantidad: 5 }, pan]);
    expect(nueva.detalles[1]).toBe(actual.detalles[1]);
    expect(cambiarCantidad(actual, 2, 9).detalles).toEqual([leche, { ...pan, cantidad: 9 }]);
  });

  it('devuelve una venta actual nueva y no cambia la que recibió', () => {
    const actual = venta(leche, pan);
    const nueva = cambiarCantidad(actual, 1, 5);
    expect(nueva).not.toBe(actual);
    expect(nueva.detalles).not.toBe(actual.detalles);
    expect(actual).toEqual(venta(leche, pan));
  });

  it('con la misma cantidad que ya tenía, la venta actual queda igual', () => {
    const actual = venta(leche, pan);
    expect(cambiarCantidad(actual, 1, 2)).toEqual(actual);
    expect(cambiarCantidad(actual, 1, '2')).toEqual(actual);
  });

  it('el subtotal y el total salen de la cantidad nueva y no pierden centavos', () => {
    const actual = venta({ ...pan, precioAplicado: '1.15', cantidad: 1 });
    const nueva = cambiarCantidad(actual, 2, 3);
    expect(subtotal(nueva.detalles[0])).toBe('3.45');
    expect(total(nueva)).toBe('3.45');
    const grande = cambiarCantidad(venta({ ...pan, precioAplicado: '99999.99' }), 2, 999);
    expect(total(grande)).toBe('99899990.01');
  });

  it('quita el error de cantidad de ese detalle: el campo vuelve a mostrar el valor válido', () => {
    const errores = { 1: { cantidad: MENSAJE_INVALIDA } };
    const nueva = cambiarCantidad({ detalles: [leche, pan], errores }, 1, 4);
    expect(nueva.errores).toEqual({});
    expect(ventaActualEsValida(nueva)).toBe(true);
  });

  it('quita solo el error de cantidad: el del precio aplicado y los de otros detalles se quedan', () => {
    const errorDePrecio = 'Escribe un precio aplicado.';
    const errores = {
      1: { precioAplicado: errorDePrecio, cantidad: MENSAJE_INVALIDA },
      2: { cantidad: MENSAJE_VACIA },
    };
    const nueva = cambiarCantidad({ detalles: [leche, pan], errores }, 1, 4);
    expect(nueva.errores).toEqual({
      1: { precioAplicado: errorDePrecio },
      2: { cantidad: MENSAJE_VACIA },
    });
    expect(ventaActualEsValida(nueva)).toBe(false);
  });

  it('deja los errores de otros detalles aunque el suyo no tenga ninguno', () => {
    const errores = { 2: { cantidad: MENSAJE_INVALIDA } };
    expect(cambiarCantidad({ detalles: [leche, pan], errores }, 1, 4).errores).toEqual(errores);
  });
});

describe('cambiarCantidad: un valor que no sirve (criterio 3)', () => {
  // «0», «1000», «1.5» y «abc»: el detalle no cambia, el mensaje queda como error de un campo del detalle.
  it.each(['0', '1000', '1.5', 'abc', '1e2', '-1', 0, 1000, 1.5, NaN, null])(
    'con %j el detalle conserva su cantidad y anota el error, y «Registrar venta» no se puede usar',
    (valor) => {
      const actual = venta(leche, pan);
      const nueva = cambiarCantidad(actual, 1, valor);
      expect(nueva.detalles).toEqual([leche, pan]);
      expect(nueva.errores).toEqual({ 1: { cantidad: MENSAJE_INVALIDA } });
      expect(ventaActualEsValida(actual)).toBe(true);
      expect(ventaActualEsValida(nueva)).toBe(false);
    },
  );

  it('una cantidad vacía pide escribir una', () => {
    for (const vacio of ['', '   ']) {
      const nueva = cambiarCantidad(venta(leche), 1, vacio);
      expect(nueva.errores).toEqual({ 1: { cantidad: MENSAJE_VACIA } });
      expect(nueva.detalles[0].cantidad).toBe(2);
    }
  });

  it('el subtotal y el total siguen siendo los de la última cantidad válida', () => {
    const nueva = cambiarCantidad(venta(leche, pan), 1, 'abc');
    expect(subtotal(nueva.detalles[0])).toBe('44.00');
    expect(total(nueva)).toBe('47.50');
  });

  it('lo que se manda a registrar lleva la última cantidad válida, no lo escrito', () => {
    const nueva = cambiarCantidad(venta(leche, pan), 1, '1000');
    expect(detallesParaRegistrar(nueva)).toEqual([
      { productoId: 1, cantidad: 2, precioAplicado: '22.00' },
      { productoId: 2, cantidad: 1, precioAplicado: '3.50' },
    ]);
  });

  it('otro valor inválido reemplaza el mensaje anterior', () => {
    const primero = cambiarCantidad(venta(leche), 1, '');
    const segundo = cambiarCantidad(primero, 1, 'abc');
    expect(segundo.errores).toEqual({ 1: { cantidad: MENSAJE_INVALIDA } });
  });

  it('conserva el error del precio aplicado del mismo detalle y los errores de los demás', () => {
    const errorDePrecio = 'Escribe un precio aplicado.';
    const errores = { 1: { precioAplicado: errorDePrecio }, 2: { cantidad: MENSAJE_VACIA } };
    const nueva = cambiarCantidad({ detalles: [leche, pan], errores }, 1, '0');
    expect(nueva.errores).toEqual({
      1: { precioAplicado: errorDePrecio, cantidad: MENSAJE_INVALIDA },
      2: { cantidad: MENSAJE_VACIA },
    });
  });

  it('no cambia los errores que recibió: el objeto nuevo es otro', () => {
    const errores = { 2: { cantidad: MENSAJE_VACIA } };
    const actual = { detalles: [leche, pan], errores };
    const nueva = cambiarCantidad(actual, 1, 'abc');
    expect(nueva.errores).not.toBe(errores);
    expect(errores).toEqual({ 2: { cantidad: MENSAJE_VACIA } });
    expect(actual.errores).toBe(errores);
  });

  it('al corregirla, el error se va y «Registrar venta» se puede usar otra vez', () => {
    const conError = cambiarCantidad(venta(leche, pan), 1, 'abc');
    expect(ventaActualEsValida(conError)).toBe(false);
    const corregida = cambiarCantidad(conError, 1, '5');
    expect(corregida.errores).toEqual({});
    expect(corregida.detalles[0].cantidad).toBe(5);
    expect(ventaActualEsValida(corregida)).toBe(true);
  });
});

describe('cambiarCantidad: los botones «+» y «−» llaman a esta misma función (criterios 1, 4 y 5)', () => {
  it('«+»: la cantidad válida más 1; «−»: la cantidad válida menos 1', () => {
    const actual = venta({ ...leche, cantidad: 5 }, pan);
    expect(cambiarCantidad(actual, 1, 5 + 1).detalles[0].cantidad).toBe(6);
    expect(cambiarCantidad(actual, 1, 5 - 1).detalles[0].cantidad).toBe(4);
  });

  it('criterio 1: con la leche en 2, «+» la pasa a 3 y se recalculan el subtotal y el total', () => {
    const nueva = cambiarCantidad(venta(leche, pan), 1, leche.cantidad + 1);
    expect(nueva.detalles[0].cantidad).toBe(3);
    expect(subtotal(nueva.detalles[0])).toBe('66.00');
    expect(total(nueva)).toBe('69.50');
  });

  it('se puede subir hasta 999 y bajar hasta 1', () => {
    expect(cambiarCantidad(venta({ ...leche, cantidad: 998 }), 1, 999).detalles[0].cantidad).toBe(
      999,
    );
    expect(cambiarCantidad(venta({ ...leche, cantidad: 2 }), 1, 1).detalles[0].cantidad).toBe(1);
  });

  it('pasarse de los límites no es una cantidad: por eso el botón se deshabilita en 1 y en 999', () => {
    const arriba = cambiarCantidad(venta({ ...leche, cantidad: 999 }), 1, 999 + 1);
    expect(arriba.detalles[0].cantidad).toBe(999);
    expect(arriba.errores).toEqual({ 1: { cantidad: MENSAJE_INVALIDA } });
    const abajo = cambiarCantidad(venta({ ...leche, cantidad: 1 }), 1, 1 - 1);
    expect(abajo.detalles[0].cantidad).toBe(1);
    expect(abajo.errores).toEqual({ 1: { cantidad: MENSAJE_INVALIDA } });
  });

  it('criterio 5: con una cantidad con error escrita, «+» usa la cantidad válida más 1 y el error se va', () => {
    const conError = cambiarCantidad(venta(leche, pan), 1, 'abc');
    const nueva = cambiarCantidad(conError, 1, conError.detalles[0].cantidad + 1);
    expect(nueva.detalles[0].cantidad).toBe(3);
    expect(nueva.errores).toEqual({});
    expect(ventaActualEsValida(nueva)).toBe(true);
  });
});

describe('cambiarCantidad: un producto que no está en la venta actual', () => {
  it('devuelve la misma venta, sin error: el cajero pudo eliminar el detalle un instante antes', () => {
    const actual = venta(leche, pan);
    expect(cambiarCantidad(actual, 99, 3)).toBe(actual);
    expect(cambiarCantidad(actual, 99, 'abc')).toBe(actual);
    expect(cambiarCantidad(actual, 99, '')).toBe(actual);
  });

  it('también con la venta actual vacía', () => {
    const vacia = { detalles: [], errores: {} };
    expect(cambiarCantidad(vacia, 1, 3)).toBe(vacia);
  });
});

describe('cambiarCantidad: no modifica lo que recibe (criterio 13)', () => {
  it('con la venta actual congelada no lanza y la deja como estaba, con un valor válido, uno inválido o un producto ausente', () => {
    const errores = { 2: { cantidad: MENSAJE_VACIA } };
    const actual = congelar({ detalles: [leche, pan], errores });
    const copia = structuredClone(actual);
    expect(() => cambiarCantidad(actual, 1, 5)).not.toThrow();
    expect(() => cambiarCantidad(actual, 1, 'abc')).not.toThrow();
    expect(() => cambiarCantidad(actual, 2, '8')).not.toThrow();
    expect(() => cambiarCantidad(actual, 99, 5)).not.toThrow();
    expect(actual).toEqual(copia);
  });
});
