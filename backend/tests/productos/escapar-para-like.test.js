import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { escaparParaLike } = require('../../src/services/productos.js');

// escaparParaLike es una función pura: no toca MySQL. Antepone \ a cada \, % y _ para que el LIKE de MySQL
// los tome como texto normal y no como comodines (RNF-04). Sin esto, buscar "50%" devolvería de más.
describe('escaparParaLike', () => {
  it('antepone una barra invertida al %', () => {
    expect(escaparParaLike('50%')).toBe(String.raw`50\%`);
  });

  it('antepone una barra invertida al _', () => {
    expect(escaparParaLike('a_b')).toBe(String.raw`a\_b`);
  });

  it('antepone una barra invertida a la barra invertida', () => {
    expect(escaparParaLike('a\\')).toBe('a\\\\');
  });

  it('escapa todas las apariciones, no solo la primera', () => {
    expect(escaparParaLike('100% de 50% y a_b_c')).toBe(String.raw`100\% de 50\% y a\_b\_c`);
    expect(escaparParaLike('%%__')).toBe(String.raw`\%\%\_\_`);
  });

  it('no escapa dos veces la barra que agrega: la barra invertida y el % juntos', () => {
    // Entrada: \% (2 caracteres). Salida: \\ (la barra escapada) y \% (el % escapado), 4 caracteres.
    expect(escaparParaLike(String.raw`\%`)).toBe(String.raw`\\\%`);
  });

  it('deja igual un texto sin comodines', () => {
    for (const texto of ['lech', 'Leche entera 1 L', '7501055300075', 'ñandú', '']) {
      expect(escaparParaLike(texto), texto).toBe(texto);
    }
  });

  it('no toca otros caracteres raros: comillas, guiones, paréntesis ni corchetes', () => {
    const texto = `' OR 1=1 --; "x" (a) [b] {c} * ? . ^ $ | + :texto`;
    expect(escaparParaLike(texto)).toBe(texto);
  });

  it('siempre da el mismo resultado para el mismo texto y devuelve un texto', () => {
    const entrada = 'a%b_c\\d';
    const primero = escaparParaLike(entrada);
    expect(typeof primero).toBe('string');
    expect(escaparParaLike(entrada)).toBe(primero);
    expect(entrada).toBe('a%b_c\\d');
  });

  it('quitando las barras que agregó se recupera el texto original', () => {
    const muestras = ['50%', 'a_b', 'a\\', '\\%', '%_\\', '\\\\', '100% _x_ \\y\\', 'sin nada'];
    for (const muestra of muestras) {
      const escapado = escaparParaLike(muestra);
      expect(escapado.replace(/\\([\\%_])/g, '$1'), muestra).toBe(muestra);
    }
  });
});
