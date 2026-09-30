// El dinero viaja como texto ("22.50") y la pantalla lo calcula en centavos, que son números enteros: con decimales
// de JavaScript, 0.10 × 3 + 0.20 da 0.5000000000000001. Es el patrón Money, y aquí no se guarda una moneda: solo el
// monto. La forma del texto es la misma que valida la API (RN-02 y RN-05): hasta 5 dígitos enteros y 2 decimales.
const FORMA_DEL_DINERO = /^(\d{1,5})(?:\.(\d{1,2}))?$/;

// aCentavos("22.50") da 2250. Un texto que no tiene la forma del dinero es un fallo de programación y lanza un Error.
export function aCentavos(texto) {
  const partes = typeof texto === 'string' ? FORMA_DEL_DINERO.exec(texto) : null;
  if (!partes) {
    throw new Error(
      'El dinero es un texto con hasta 5 enteros y 2 decimales, por ejemplo "22.50".',
    );
  }
  const [, enteros, decimales = ''] = partes;
  return Number(enteros) * 100 + Number(decimales.padEnd(2, '0'));
}

// formatearCentavos(4750) da "47.50": siempre 2 decimales, sin símbolo de moneda y sin separador de miles.
export function formatearCentavos(centavos) {
  if (!Number.isSafeInteger(centavos) || centavos < 0) {
    throw new Error('Los centavos son un número entero de 0 o más.');
  }
  const decimales = centavos % 100;
  const enteros = (centavos - decimales) / 100;
  return `${enteros}.${String(decimales).padStart(2, '0')}`;
}
