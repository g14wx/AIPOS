import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ErrorApi = require('../../src/errors/ErrorApi.js');
const { validarBusqueda } = require('../../src/validators/productos.js');

// validarBusqueda recibe el valor crudo de req.query.busqueda y devuelve el texto limpio, o lanza ErrorApi 400.
// Es lo que corre antes de llamar al servicio: la API no confía en la pantalla (Input Validation, RNF-04).
const MENSAJE = 'El texto de búsqueda debe tener entre 2 y 120 caracteres.';

function errorDe(valor) {
  try {
    validarBusqueda(valor);
  } catch (error) {
    return error;
  }
  throw new Error(`validarBusqueda(${JSON.stringify(valor)}) no lanzó nada`);
}

function esUn400DeBusqueda(error) {
  expect(error).toBeInstanceOf(ErrorApi);
  expect(error).toMatchObject({ estado: 400, codigo: 'DATOS_INVALIDOS' });
  expect(error.message).toBe(MENSAJE);
  expect(error.detalles).toHaveLength(1);
  expect(error.detalles[0].campo).toBe('busqueda');
  expect(typeof error.detalles[0].mensaje).toBe('string');
  expect(error.detalles[0].mensaje.length).toBeGreaterThan(0);
}

describe('validarBusqueda devuelve el texto limpio', () => {
  it.each([
    ['lech', 'lech'],
    ['  lech  ', 'lech'],
    ['\tlech\n', 'lech'],
    [' lech ', 'lech'],
    ['le', 'le'],
    [' le ', 'le'],
    ['Leche  entera', 'Leche  entera'],
    ['7501055300075', '7501055300075'],
    ['50%', '50%'],
    ['a_b', 'a_b'],
    ['a\\', 'a\\'],
    ["' OR 1=1 --", "' OR 1=1 --"],
  ])('%j da %j: quita los espacios de los extremos y no toca el resto', (valor, esperado) => {
    expect(validarBusqueda(valor)).toBe(esperado);
  });

  it('acepta 120 caracteres, también con espacios de más en los extremos', () => {
    const texto = 'a'.repeat(120);
    expect(validarBusqueda(texto)).toBe(texto);
    expect(validarBusqueda(`  ${texto}  `)).toBe(texto);
  });

  it('cuenta caracteres y no unidades de UTF-16: un emoji es 1 carácter, como en CHAR_LENGTH de MySQL', () => {
    expect(validarBusqueda('🙂🙂')).toBe('🙂🙂');
    expect(validarBusqueda('🙂'.repeat(120))).toBe('🙂'.repeat(120));
  });
});

describe('validarBusqueda lanza un 400 DATOS_INVALIDOS con el campo busqueda', () => {
  it.each([
    ['falta busqueda', undefined],
    ['busqueda vacía', ''],
    ['solo espacios', '   '],
    ['solo un tabulador y un salto de línea', '\t\n'],
    ['1 carácter', 'a'],
    ['1 carácter con espacios', ' a '],
    ['1 barra invertida', '\\'],
    ['1 emoji', '🙂'],
    ['121 caracteres', 'a'.repeat(121)],
    ['121 caracteres con espacios en los extremos', ` ${'a'.repeat(121)} `],
    ['121 emojis', '🙂'.repeat(121)],
  ])('%s', (nombre, valor) => {
    esUn400DeBusqueda(errorDe(valor));
  });

  it.each([
    ['una lista (busqueda repetido)', ['a', 'b']],
    ['una lista de dos textos válidos', ['lech', 'leche']],
    ['una lista de un texto válido', ['lech']],
    ['un objeto', { a: 'lech' }],
    ['un número', 25],
    ['un booleano', true],
    ['null', null],
  ])('un valor que no es texto no se convierte: %s', (nombre, valor) => {
    esUn400DeBusqueda(errorDe(valor));
  });

  it('con 1 carácter dice que escriba al menos 2 (el mensaje que la spec da de ejemplo)', () => {
    const error = errorDe('a');
    expect(error.detalles).toEqual([
      { campo: 'busqueda', mensaje: 'Escribe al menos 2 caracteres.' },
    ]);
  });

  it('con más de 120 caracteres dice cuál es el máximo', () => {
    const error = errorDe('a'.repeat(121));
    expect(error.detalles[0].mensaje).toMatch(/120/);
  });
});
