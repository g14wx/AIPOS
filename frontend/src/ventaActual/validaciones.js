import { aCentavos, formatearCentavos } from '../dinero.js';

// Las reglas de lo que el cajero escribe en un campo del detalle de la venta actual, como funciones puras: reciben lo
// escrito y devuelven { valido: true, valor } o { valido: false, mensaje }. Un texto mal escrito es un caso normal del
// cajero y no un fallo de programación, por eso el error es un valor y la función no lanza.
// Este archivo tiene lo de V-05 (validarPrecioAplicado). V-06 suma validarCantidad.

const MENSAJES_DE_PRECIO_APLICADO = Object.freeze({
  vacio: 'Escribe un precio aplicado.',
  decimales: 'Usa hasta 2 decimales.',
  formato: 'El precio aplicado debe ser un número de 0 a 99 999.99, como 22.00.',
});

// RN-05: de 0 a 99 999.99, con hasta 5 enteros y 2 decimales, la forma que valida la API (RN-02). Los enteros y los
// decimales se cuentan aparte, y en el mismo orden que el formulario de producto: primero los decimales.
const ENTEROS_MAXIMOS = 5;
const DECIMALES_MAXIMOS = 2;
const FORMA_DEL_PRECIO_APLICADO = /^(\d+)(?:\.(\d+))?$/;

const invalido = (mensaje) => ({ valido: false, mensaje });

// Recorta los espacios de los extremos y revisa RN-05. El 0 es válido (por ejemplo, para regalar un producto). Lo que
// no es texto (un número, null, undefined) no es un precio aplicado escrito por el cajero. El valor sale con 2
// decimales, como lo guarda el detalle y lo manda la API: "22" da "22.00".
export function validarPrecioAplicado(texto) {
  if (typeof texto !== 'string') return invalido(MENSAJES_DE_PRECIO_APLICADO.formato);
  const recortado = texto.trim();
  if (recortado === '') return invalido(MENSAJES_DE_PRECIO_APLICADO.vacio);
  const partes = FORMA_DEL_PRECIO_APLICADO.exec(recortado);
  if (!partes) return invalido(MENSAJES_DE_PRECIO_APLICADO.formato);
  const [, enteros, decimales = ''] = partes;
  if (decimales.length > DECIMALES_MAXIMOS) return invalido(MENSAJES_DE_PRECIO_APLICADO.decimales);
  if (enteros.length > ENTEROS_MAXIMOS) return invalido(MENSAJES_DE_PRECIO_APLICADO.formato);
  return { valido: true, valor: formatearCentavos(aCentavos(recortado)) };
}
