import { afterAll, afterEach, beforeAll } from 'vitest';
import request from 'supertest';
import { createRequire } from 'node:module';
import { abrirServidorDePrueba, cerrarServidorDePrueba } from '../servidor-de-prueba.js';
import {
  borrarDatosDePrueba,
  borrarVentas,
  consultar,
  crearProductos,
  verificarProcedimientoDelSql,
} from '../base-de-datos/ayudas-sp-registrar-venta.js';

// Ayudas de las pruebas de POST /api/ventas. No es un archivo de pruebas: Vitest solo corre *.test.js.
// Esas pruebas hablan con MySQL de verdad: necesitan MySQL levantado y la base de prueba migrada
// (npm run migrar:prueba). Se carga la app con require, para que Sequelize y los servicios sean los mismos
// objetos que usa el código (import y require de Vitest no comparten instancia).
const require = createRequire(import.meta.url);
const app = require('../../src/app.js');

// Las lecturas de V-02 que también usan estas pruebas, para que las importen de un solo lugar.
export { consultar, leerDetalles, leerVenta } from '../base-de-datos/ayudas-sp-registrar-venta.js';

export const RUTA = '/api/ventas';

// La API de prueba: un servidor atado a 127.0.0.1 que se abre antes de las pruebas del archivo que importa esta
// ayuda y se cierra al terminar (issue #58: con request(app), una petición puede caer en otro programa de la
// máquina que escucha en el mismo puerto).
let servidor;
beforeAll(async () => {
  servidor = await abrirServidorDePrueba(app);
});
afterAll(() => cerrarServidorDePrueba(servidor));

// Una petición a la API de prueba, para armarla con .post(), .get(), .options(), .set() y .send().
export const api = () => request(servidor);

// Los números de las ventas que la API confirmó con un 201 mientras corre una prueba: se borran al terminar.
const ventasConfirmadas = [];

// Lo que hace la pantalla: un POST con un cuerpo JSON. Sin `cuerpo`, manda la petición sin cuerpo.
export function registrarVentaPorApi(cuerpo) {
  const peticion = api()
    .post(RUTA)
    .on('response', (respuesta) => {
      if (respuesta.status === 201 && Number.isInteger(respuesta.body?.ventaId)) {
        ventasConfirmadas.push(respuesta.body.ventaId);
      }
    });
  return cuerpo === undefined ? peticion : peticion.send(cuerpo);
}

// Test Fixture con limpieza explícita: el procedimiento hace su propio COMMIT, así que una venta registrada no se
// puede descartar con una transacción. Al empezar, el archivo borra lo que dejó una corrida cortada, comprueba que
// el procedimiento de la base de prueba es el del .sql y crea `productos` productos de prueba. Después de cada
// prueba borra las ventas que la API confirmó. Al terminar borra todo, incluso las ventas que un error dejara
// guardadas con estos productos. `ventas` y `detalles_venta` quedan como estaban.
export function prepararVentas({ productos = 3 } = {}) {
  const contexto = { productoIds: [] };
  beforeAll(async () => {
    await verificarProcedimientoDelSql();
    await borrarDatosDePrueba();
    contexto.productoIds = await crearProductos(productos, 'API');
  });
  afterEach(() => borrarVentas(ventasConfirmadas.splice(0)));
  afterAll(() => borrarDatosDePrueba());
  return contexto;
}

// Un detalle de venta como lo manda la pantalla: el producto, la cantidad (entero) y el precio aplicado (texto).
export const detalle = (productoId, cambios = {}) => ({
  productoId,
  cantidad: 1,
  precioAplicado: '10.00',
  ...cambios,
});

// Cuántas filas hay ahora mismo en ventas y en detalles_venta, leídas con SQL directo (no con los modelos).
export async function contarFilas() {
  const [fila] = await consultar(
    `SELECT (SELECT COUNT(*) FROM ventas) AS ventas,
            (SELECT COUNT(*) FROM detalles_venta) AS detalles`,
  );
  return { ventas: Number(fila.ventas), detalles: Number(fila.detalles) };
}

// La venta guardada con el nombre de cada producto, como la comprueba la spec (un JOIN de tres tablas).
export function leerVentaConProductos(ventaId) {
  return consultar(
    `SELECT v.id AS ventaId, v.fecha, v.total, p.nombre, d.cantidad,
            d.precio_aplicado AS precioAplicado, d.subtotal
       FROM ventas v
       JOIN detalles_venta d ON d.venta_id = v.id
       JOIN productos p ON p.id = d.producto_id
      WHERE v.id = :ventaId
      ORDER BY d.id`,
    { ventaId },
  );
}
