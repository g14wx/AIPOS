// Spec de arquitectura, sección "Dinero": la pantalla calcula en centavos (números enteros) solo para
// mostrar, con src/dinero.js. Nunca suma decimales de JavaScript.
import { describe, it, expect } from 'vitest';
import { aCentavos, formatearCentavos } from '../src/dinero.js';

describe('aCentavos', () => {
  it.each([
    ['22.50', 2250],
    ['22.5', 2250],
    ['22', 2200],
    ['0', 0],
    ['0.00', 0],
    ['0.01', 1],
    ['0.10', 10],
    ['1.15', 115],
    ['25.00', 2500],
    ['99999.99', 9999999],
  ])('convierte el texto "%s" en %i centavos', (texto, centavos) => {
    expect(aCentavos(texto)).toBe(centavos);
  });

  it('devuelve siempre un entero, también con los casos que fallan con decimales de JavaScript', () => {
    // 1.15 * 100 da 114.99999999999999 y 0.29 * 100 da 28.999999999999996 en JavaScript.
    for (const texto of ['1.15', '0.29', '0.58', '4.35', '8.20', '19.99', '57.13']) {
      expect(Number.isInteger(aCentavos(texto)), texto).toBe(true);
    }
    expect(aCentavos('0.29')).toBe(29);
    expect(aCentavos('4.35')).toBe(435);
    expect(aCentavos('57.13')).toBe(5713);
  });

  it.each([
    ['un texto que no es número', 'abc'],
    ['un texto vacío', ''],
    ['3 decimales', '22.999'],
    ['un negativo', '-1'],
    ['notación científica', '1e3'],
    ['coma como separador', '22,50'],
    ['espacios', ' 22.50'],
    ['punto sin decimales', '22.'],
    ['sin parte entera', '.5'],
    ['más de 5 dígitos enteros', '100000.00'],
  ])('lanza un Error con %s', (_caso, texto) => {
    expect(() => aCentavos(texto)).toThrow(Error);
  });

  it.each([
    ['un número', 22.5],
    ['null', null],
    ['undefined', undefined],
    ['un objeto', {}],
  ])('lanza un Error con %s: el dinero es un texto', (_caso, valor) => {
    expect(() => aCentavos(valor)).toThrow(Error);
  });
});

describe('formatearCentavos', () => {
  it.each([
    [4750, '47.50'],
    [0, '0.00'],
    [1, '0.01'],
    [5, '0.05'],
    [10, '0.10'],
    [100, '1.00'],
    [2250, '22.50'],
    [9999999, '99999.99'],
    [9989999001, '99899990.01'],
    [19979998002, '199799980.02'],
  ])(
    'muestra %i centavos como "%s", con 2 decimales y sin símbolo de moneda',
    (centavos, texto) => {
      expect(formatearCentavos(centavos)).toBe(texto);
    },
  );

  it('no agrega separador de miles ni símbolo de moneda', () => {
    expect(formatearCentavos(123456789)).toBe('1234567.89');
    expect(formatearCentavos(4750)).not.toMatch(/[$€,\s]/);
  });

  it.each([
    ['un decimal', 1.5],
    ['un texto', '4750'],
    ['null', null],
    ['undefined', undefined],
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
  ])('lanza un Error con %s: los centavos son un entero', (_caso, valor) => {
    expect(() => formatearCentavos(valor)).toThrow(Error);
  });
});

describe('ida y vuelta', () => {
  it('formatearCentavos(aCentavos(x)) devuelve el texto con 2 decimales, sin perder centavos', () => {
    for (let centavos = 0; centavos <= 5000; centavos += 1) {
      const texto = formatearCentavos(centavos);
      expect(texto).toMatch(/^\d+\.\d{2}$/);
      expect(aCentavos(texto)).toBe(centavos);
    }
  });

  it('el precio más grande cabe sin perder centavos', () => {
    expect(aCentavos('99999.99')).toBe(9999999);
    expect(formatearCentavos(aCentavos('99999.99') * 999)).toBe('99899990.01');
  });

  it('suma en centavos lo que con decimales de JavaScript falla', () => {
    // 0.10 × 3 + 0.20 da 0.5000000000000001 con decimales de JavaScript.
    const centavos = aCentavos('0.10') * 3 + aCentavos('0.20');
    expect(formatearCentavos(centavos)).toBe('0.50');
  });
});
