import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ErrorApi = require('../src/errors/ErrorApi.js');
const { validarTexto, validarDinero, exigirDatosValidos } = require('../src/validators/comunes.js');

// Las piezas de validación que usan todos los recursos (spec de arquitectura, "Validación" y "Dinero").
// Ninguna lanza: devuelven { valor } con el dato limpio o { detalleDelError: { campo, mensaje } }, para que
// el validador de cada recurso junte todos los campos con problema y no solo el primero.
const conProblema = (campo, mensaje) => ({ detalleDelError: { campo, mensaje } });

describe('validarTexto: quita los espacios de los extremos y revisa que no quede vacío ni pase del largo', () => {
  const nombre = (valor, maximo = 120) => validarTexto(valor, 'nombre', { maximo });

  it('devuelve el texto sin los espacios de los extremos y respeta los de en medio', () => {
    expect(nombre('  Leche   entera  ')).toEqual({ valor: 'Leche   entera' });
    expect(nombre('Pan')).toEqual({ valor: 'Pan' });
  });

  it('recorta con trim() de JavaScript, que quita más que el espacio normal', () => {
    // El CHECK de MySQL solo ve el espacio normal (hallazgo H2 de P-01): la API es la que recorta el resto.
    expect(nombre('\t Pan \n')).toEqual({ valor: 'Pan' });
    expect(nombre('﻿Pan ')).toEqual({ valor: 'Pan' });
  });

  it.each([
    ['falta (undefined)', undefined],
    ['es null', null],
    ['es un texto vacío', ''],
    ['solo tiene espacios', '   '],
    ['solo tiene un tabulador y un salto de línea', '\t\n'],
    ['solo tiene un espacio no separable', ' '],
  ])('dice "Es obligatorio." cuando %s', (_caso, valor) => {
    expect(nombre(valor)).toEqual(conProblema('nombre', 'Es obligatorio.'));
  });

  it.each([
    ['un número', 5],
    ['el número 0', 0],
    ['un booleano', true],
    ['un objeto', { nombre: 'Pan' }],
    ['un arreglo vacío', []],
    ['un arreglo con un texto', ['Pan']],
  ])('dice "Debe ser un texto." cuando es %s: no lo convierte', (_caso, valor) => {
    expect(nombre(valor)).toEqual(conProblema('nombre', 'Debe ser un texto.'));
  });

  it('acepta justo el largo máximo y rechaza uno más, y el mensaje dice el máximo', () => {
    expect(nombre('a'.repeat(120))).toEqual({ valor: 'a'.repeat(120) });
    expect(nombre('a'.repeat(121))).toEqual(
      conProblema('nombre', 'No puede pasar de 120 caracteres.'),
    );
    expect(validarTexto('1'.repeat(51), 'codigoBarras', { maximo: 50 })).toEqual(
      conProblema('codigoBarras', 'No puede pasar de 50 caracteres.'),
    );
  });

  it('cuenta caracteres como MySQL y no unidades de UTF-16: un emoji cuenta 1', () => {
    expect(nombre('😀'.repeat(120))).toEqual({ valor: '😀'.repeat(120) });
    expect(nombre('😀'.repeat(121))).toEqual(
      conProblema('nombre', 'No puede pasar de 120 caracteres.'),
    );
  });

  it('cuenta el largo después de quitar los espacios de los extremos', () => {
    expect(nombre(`  ${'a'.repeat(120)}  `)).toEqual({ valor: 'a'.repeat(120) });
  });

  it('pone en el detalle del error el campo que le dijeron', () => {
    expect(validarTexto(null, 'detalles[0].nombre', { maximo: 10 })).toEqual(
      conProblema('detalles[0].nombre', 'Es obligatorio.'),
    );
  });

  it('sin largo máximo solo revisa que no quede vacío', () => {
    expect(validarTexto(` ${'a'.repeat(500)} `, 'busqueda')).toEqual({ valor: 'a'.repeat(500) });
    expect(validarTexto('   ', 'busqueda')).toEqual(conProblema('busqueda', 'Es obligatorio.'));
  });
});

describe('validarDinero: el dinero llega como texto con la forma ^\\d{1,5}(\\.\\d{1,2})?$', () => {
  const precio = (valor, opciones) => validarDinero(valor, 'precio', opciones);

  it.each(['25', '25.5', '25.50', '0.01', '99999.99', '00025', '007.5', '1', '0.10'])(
    'acepta "%s" y lo devuelve tal cual, sin formatearlo',
    (texto) => {
      expect(precio(texto)).toEqual({ valor: texto });
    },
  );

  it.each([
    ['falta (undefined)', undefined],
    ['es null', null],
    ['es un texto vacío', ''],
  ])('dice "Es obligatorio." cuando %s', (_caso, valor) => {
    expect(precio(valor)).toEqual(conProblema('precio', 'Es obligatorio.'));
  });

  it.each([
    ['un número con decimales', 25.5],
    ['un número entero', 25],
    ['el número 0', 0],
    ['un booleano', true],
    ['un objeto', { valor: '25.00' }],
    ['un arreglo', ['25.00']],
  ])('dice que debe enviarse como texto cuando es %s', (_caso, valor) => {
    expect(precio(valor)).toEqual(
      conProblema('precio', 'Debe enviarse como texto, por ejemplo "25.50".'),
    );
  });

  it.each([
    'abc',
    '-5',
    '+5',
    '1,5',
    '.5',
    '5.',
    '1e3',
    '0x10',
    '1 000',
    ' 25',
    '25 ',
    ' ',
    '25\n',
    '٢٥',
    '２５',
  ])('rechaza "%s": no son solo dígitos con un punto opcional', (texto) => {
    expect(precio(texto)).toEqual(
      conProblema('precio', 'Debe ser un número con punto decimal, por ejemplo 25.50.'),
    );
  });

  it.each(['10.999', '0.001', '1.000', '25.500', '99999.999'])(
    'rechaza "%s": tiene más de 2 decimales y MySQL lo redondearía sin avisar',
    (texto) => {
      expect(precio(texto)).toEqual(conProblema('precio', 'No puede tener más de 2 decimales.'));
    },
  );

  it.each(['100000', '100000.00', '123456', '999999.99'])(
    'rechaza "%s": tiene más de 5 dígitos enteros',
    (texto) => {
      expect(precio(texto)).toEqual(conProblema('precio', 'No puede ser mayor que 99999.99.'));
    },
  );

  it.each(['0', '0.0', '0.00', '00', '00000.00'])(
    'rechaza "%s" por defecto (el precio de un producto es mayor que 0) y lo acepta con permiteCero',
    (texto) => {
      expect(precio(texto)).toEqual(conProblema('precio', 'Debe ser mayor que 0.'));
      expect(precio(texto, { permiteCero: true })).toEqual({ valor: texto });
    },
  );

  it('dice solo el primer problema, en este orden: forma, decimales, dígitos enteros y cero', () => {
    expect(precio('100000.999').detalleDelError.mensaje).toBe('No puede tener más de 2 decimales.');
    expect(precio('-100000').detalleDelError.mensaje).toMatch(/número con punto decimal/);
    expect(precio('0.000').detalleDelError.mensaje).toBe('No puede tener más de 2 decimales.');
  });

  it('pone en el detalle del error el campo que le dijeron', () => {
    expect(validarDinero('abc', 'detalles[2].precioAplicado', { permiteCero: true })).toEqual(
      conProblema(
        'detalles[2].precioAplicado',
        'Debe ser un número con punto decimal, por ejemplo 25.50.',
      ),
    );
  });
});

describe('exigirDatosValidos: lanza un 400 con los detalles del error de todos los campos con problema', () => {
  const MENSAJE = 'Los datos no son válidos.';

  it('no lanza nada si todos los resultados son buenos', () => {
    expect(() => exigirDatosValidos(MENSAJE, [{ valor: 'a' }, { valor: 'b' }])).not.toThrow();
    expect(() => exigirDatosValidos(MENSAJE, [])).not.toThrow();
  });

  it('lanza un ErrorApi 400 DATOS_INVALIDOS con un detalle del error por cada campo con problema, en orden', () => {
    const resultados = [
      conProblema('nombre', 'Es obligatorio.'),
      { valor: '25.00' },
      conProblema('codigoBarras', 'Debe ser un texto.'),
    ];
    let error;
    try {
      exigirDatosValidos(MENSAJE, resultados);
    } catch (err) {
      error = err;
    }
    expect(error).toBeInstanceOf(ErrorApi);
    expect(error).toMatchObject({ estado: 400, codigo: 'DATOS_INVALIDOS' });
    expect(error.message).toBe(MENSAJE);
    expect(error.detalles).toEqual([
      { campo: 'nombre', mensaje: 'Es obligatorio.' },
      { campo: 'codigoBarras', mensaje: 'Debe ser un texto.' },
    ]);
  });
});
