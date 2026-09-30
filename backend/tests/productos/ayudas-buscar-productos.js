import { createRequire } from 'node:module';

// Ayudas de las pruebas de GET /api/productos (buscar-productos.test.js y documentacion-buscar-productos.test.js).
// No es un archivo de pruebas: Vitest solo corre *.test.js. Necesita MySQL levantado y la base de prueba migrada.
// Se carga todo con require, para que los modelos sean los mismos objetos que usa la app.
const require = createRequire(import.meta.url);
const { Producto } = require('../../src/models/index.js');

// Test Fixture: la tabla `productos` de la base de prueba puede traer filas que no son de la prueba que corre. Son los
// restos de una corrida que se cortó (Ctrl+C, un proceso que se cae, el modo vigilar al guardar un archivo) o los que
// dejó otra prueba: las de crear producto (P-02) dejan «Leche entera 1 L» si se cortan. La búsqueda mira todos los
// nombres, así que una prueba que supone la tabla limpia falla en cuanto encuentra uno (issue #87). Dos cosas lo
// evitan:
//
// 1. Los códigos de barras son únicos por corrida (`codigoNuevo` y `codigoConCerosNuevo`). Si no, el UNIQUE de RN-03
//    rechaza el producto de la prueba cuando la tabla ya trae uno con ese código, y fallan todas las pruebas siguientes.
// 2. Cada prueba mira solo los productos que ella creó, y donde el orden y el máximo de 20 resultados dependen del
//    texto, lo busca con un nombre único por corrida. `sembrarRestos` pone filas ajenas antes de las pruebas y
//    `borrarRestos` las quita al terminar: así cada corrida comprueba que eso se cumple.

let contador = 0;

// Un código de barras nuevo, con letras. Mismo esquema que `codigoDeBarrasNuevo` de ayudas-crear-producto.js (P-02): el
// número del proceso, la hora y un contador. No choca con el de un resto ni con el de otra corrida, aunque se corte.
export function codigoNuevo() {
  contador += 1;
  return `BUSCAR-${process.pid}-${Date.now()}-${contador}`;
}

// Un código de barras nuevo de solo dígitos que empieza con ceros, como los que pierde un número.
export function codigoConCerosNuevo() {
  contador += 1;
  return `00${process.pid}${Date.now()}${contador}`;
}

// El código de barras del ejemplo de la documentación de la API, que estas pruebas guardaban tal cual antes de tener
// códigos únicos por corrida.
const CODIGO_DEL_EJEMPLO = '7501055300075';

const restos = [
  // Lo que deja una corrida cortada de crear-producto.test.js (P-02): el mismo nombre y un código de barras propio.
  { nombre: 'Leche entera 1 L', codigoBarras: 'RESTO-PRUEBA' },
  // El producto del ejemplo de la documentación, con su código de barras.
  { nombre: 'Leche entera 1 L', codigoBarras: CODIGO_DEL_EJEMPLO },
  // Nombres que coinciden con los textos que buscan las pruebas, también con los símbolos que prueban (%, _, \, ').
  ...[
    'Leche sobrante',
    'Café sobrante',
    'Pan',
    'Pan sobrante',
    'Jugo 50% sobrante',
    'Cable A_B sobrante',
    'Ruta a\\b sobrante',
    "Pan d'or sobrante",
    "O'Brien :texto sobrante",
    'Oferta :texto sobrante',
    'Oferta ? sobrante',
    'Oferta $1 sobrante',
  ].map((nombre, i) => ({ nombre, codigoBarras: `RESTO-${i + 1}` })),
  // Más de 20 productos con "galleta" y con "222" en el nombre: una prueba del máximo de 20 resultados que busque ese
  // texto sin nada propio de su corrida encuentra primero estos, y sus productos quedan fuera de la lista.
  ...Array.from({ length: 25 }, (_, i) => ({
    nombre: `Galleta ajena ${String(i + 1).padStart(2, '0')}`,
    codigoBarras: `RESTO-GALLETA-${i + 1}`,
  })),
  ...Array.from({ length: 25 }, (_, i) => ({
    nombre: `Tornillo 222 ajeno ${String(i + 1).padStart(2, '0')}`,
    codigoBarras: `RESTO-TORNILLO-${i + 1}`,
  })),
].map((resto) => ({ precio: '10.00', ...resto }));

// Borra los restos por su código de barras. Si una corrida cortada dejó los de la anterior, `sembrarRestos` los quita
// antes de poner los nuevos, para que los restos mismos no hagan fallar la corrida siguiente.
export async function borrarRestos() {
  await Producto.destroy({ where: { codigoBarras: restos.map((resto) => resto.codigoBarras) } });
}

export async function sembrarRestos() {
  await borrarRestos();
  await Producto.bulkCreate(restos);
}
