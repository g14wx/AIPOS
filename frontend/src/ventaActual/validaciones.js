// Las reglas de lo que el cajero escribe en un detalle de la venta actual. Son funciones puras: reciben lo escrito y
// devuelven un resultado, { valido: true, valor } o { valido: false, mensaje }. Un texto mal escrito es un caso normal
// del cajero y no una excepción, así que el error viaja como un valor (patrón Either) y nadie necesita un try/catch.
// La pantalla y las pruebas las usan igual; la API vuelve a validar al registrar la venta.

// --- Cantidad (V-06) ---

// RN-06: la cantidad de un detalle es un número entero de 1 a 999.
export const CANTIDAD_MINIMA = 1;
export const CANTIDAD_MAXIMA = 999;

const MENSAJE_CANTIDAD_VACIA = 'Escribe una cantidad.';
const MENSAJE_CANTIDAD_INVALIDA = `La cantidad debe ser un número entero de ${CANTIDAD_MINIMA} a ${CANTIDAD_MAXIMA}.`;

const SOLO_DIGITOS = /^\d+$/;

const cantidadInvalida = (mensaje) => ({ valido: false, mensaje });

// Acepta un número entero o un texto de solo dígitos (se le quitan los espacios de los extremos: «007» vale 7), de 1 a
// 999. Nunca lanza: lo que no es número ni texto, y el número que no es entero, son una cantidad inválida. Un texto
// como «1e2», «1.5» o «-1» tampoco vale: las reglas de RN-06 se validan sobre el texto, no sobre lo que JavaScript
// entiende como número.
export function validarCantidad(valor) {
  let numero;
  if (typeof valor === 'number') {
    numero = valor;
  } else if (typeof valor === 'string') {
    const texto = valor.trim();
    if (texto === '') return cantidadInvalida(MENSAJE_CANTIDAD_VACIA);
    if (!SOLO_DIGITOS.test(texto)) return cantidadInvalida(MENSAJE_CANTIDAD_INVALIDA);
    numero = Number(texto);
  } else {
    return cantidadInvalida(MENSAJE_CANTIDAD_INVALIDA);
  }
  if (!Number.isInteger(numero) || numero < CANTIDAD_MINIMA || numero > CANTIDAD_MAXIMA) {
    return cantidadInvalida(MENSAJE_CANTIDAD_INVALIDA);
  }
  return { valido: true, valor: numero };
}
