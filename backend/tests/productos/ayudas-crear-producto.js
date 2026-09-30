import { beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createRequire } from 'node:module';
import { abrirServidorDePrueba, cerrarServidorDePrueba } from '../servidor-de-prueba.js';

// Ayudas de las pruebas de POST /api/productos. No es un archivo de pruebas: Vitest solo corre *.test.js.
// Esas pruebas hablan con MySQL de verdad: necesitan MySQL levantado y la base de prueba migrada
// (npm run migrar:prueba). Se carga todo con require, para que la app, Sequelize y los modelos sean los mismos
// objetos que usa el código (import y require de Vitest no comparten instancia).
const require = createRequire(import.meta.url);
const app = require('../../src/app.js');
const sequelize = require('../../src/database.js');

export const RUTA = '/api/productos';

// La API de prueba: un servidor atado a 127.0.0.1 que se abre antes de las pruebas del archivo que importa esta
// ayuda y se cierra al terminar. Con request(app), una petición puede caer en otro programa de la máquina que
// escucha en el mismo puerto (issue #58): un 403, un socket hang up o un ECONNRESET que la API no da.
let servidor;
beforeAll(async () => {
  servidor = await abrirServidorDePrueba(app);
});
afterAll(() => cerrarServidorDePrueba(servidor));

// Una petición a la API de prueba, para armarla con .post(), .options(), .set() y .send().
export const api = () => request(servidor);

// Test Fixture: la API confirma cada producto (no hay transacción que descartar), así que cada prueba usa
// códigos de barras propios y los borra al terminar, aunque falle. `productos` queda como estaba.
const codigosUsados = new Set();
let contador = 0;

// Anota un código de barras para borrarlo al terminar. Devuelve el mismo código.
export function anotarCodigoDeBarras(codigo) {
  codigosUsados.add(codigo);
  return codigo;
}

// Un código de barras que no existe en la tabla, con letras. Los códigos son únicos aunque se repita la corrida.
export function codigoDeBarrasNuevo() {
  contador += 1;
  return anotarCodigoDeBarras(`PRUEBA-${process.pid}-${Date.now()}-${contador}`);
}

// Un código de barras de solo dígitos que empieza con ceros, como los que pierde un número.
export function codigoConCerosNuevo() {
  contador += 1;
  return anotarCodigoDeBarras(`00${process.pid}${Date.now()}${contador}`);
}

export function productoValido(cambios = {}) {
  return {
    nombre: 'Leche entera 1 L',
    precio: '25.00',
    codigoBarras: codigoDeBarrasNuevo(),
    ...cambios,
  };
}

export async function borrarProductosDePrueba() {
  for (const codigo of codigosUsados) {
    await sequelize.query('DELETE FROM productos WHERE codigo_barras = :codigo', {
      replacements: { codigo },
    });
  }
  codigosUsados.clear();
}

// Lo que hace la pantalla: un POST con un cuerpo JSON. Sin `cuerpo`, manda la petición sin cuerpo.
export function crearProductoPorApi(cuerpo) {
  const peticion = api().post(RUTA);
  return cuerpo === undefined ? peticion : peticion.send(cuerpo);
}

export async function contarProductos() {
  const [[fila]] = await sequelize.query('SELECT COUNT(*) AS total FROM productos');
  return Number(fila.total);
}

// Las filas de `productos` con ese código de barras, leídas con SQL directo (no con el modelo).
export async function filasConCodigoDeBarras(codigo) {
  const [filas] = await sequelize.query(
    'SELECT id, nombre, precio, codigo_barras AS codigoBarras FROM productos WHERE codigo_barras = :codigo',
    { replacements: { codigo } },
  );
  return filas;
}
