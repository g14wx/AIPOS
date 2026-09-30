import { describe, it, expect, afterEach, vi } from 'vitest';
import { createRequire } from 'node:module';
import {
  borrarProductosDePrueba,
  contarProductos,
  crearProductoPorApi,
  productoValido,
} from './ayudas-crear-producto.js';

const require = createRequire(import.meta.url);
const sequelize = require('../../src/database.js');
const { Producto } = require('../../src/models/index.js');
const { crearProducto } = require('../../src/services/productos.js');

// Necesita MySQL levantado y la base de prueba migrada (npm run migrar:prueba).
// El 500 de POST /api/productos (criterio 7 de P-02): un error que la ruta no espera sale como ERROR_INTERNO,
// sin el SQL ni el stack, y el detalle se escribe solo en el log del servidor (console.error).
afterEach(async () => {
  vi.restoreAllMocks();
  await borrarProductosDePrueba();
});

// Un error real de MySQL, no inventado: se le pide una tabla que no existe (error 1146) y se guarda lo que lanza Sequelize.
async function errorDeTablaInexistente() {
  try {
    await sequelize.query('SELECT id FROM tabla_que_no_existe');
  } catch (error) {
    return error;
  }
  throw new Error('MySQL tenía que rechazar una tabla que no existe.');
}

describe('un error inesperado de MySQL (por ejemplo, la tabla no existe)', () => {
  it('responde 500 ERROR_INTERNO sin el SQL ni el stack, y console.error escribe el detalle', async () => {
    const original = await errorDeTablaInexistente();
    expect(original.parent.errno).toBe(1146);
    const escribir = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(Producto, 'create').mockRejectedValue(original);
    const antes = await contarProductos();

    const respuesta = await crearProductoPorApi(productoValido());

    expect(respuesta.status).toBe(500);
    expect(respuesta.body).toEqual({
      error: { codigo: 'ERROR_INTERNO', mensaje: 'Ocurrió un error inesperado. Intenta de nuevo.' },
    });
    const dicho = JSON.stringify(respuesta.body) + respuesta.text;
    expect(dicho).not.toMatch(/tabla_que_no_existe|SELECT|doesn't exist|errno|sequelize|mysql/i);
    expect(dicho).not.toMatch(/stack|node_modules|\.js:\d+|at .*\(.*:\d+:\d+\)/i);
    expect(escribir).toHaveBeenCalledWith(original);
    expect(await contarProductos()).toBe(antes);
  });

  it('la API sigue viva: la siguiente petición válida responde 201', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(Producto, 'create').mockRejectedValueOnce(await errorDeTablaInexistente());

    expect((await crearProductoPorApi(productoValido())).status).toBe(500);
    expect((await crearProductoPorApi(productoValido())).status).toBe(201);
  });
});

describe('el servicio no traduce por adivinar', () => {
  const nombre = 'Leche';
  const precio = '25.00';
  const codigoBarras = 'no-se-guarda';

  it('un error que no es el del índice del código de barras sigue como venía', async () => {
    const otros = [
      await errorDeTablaInexistente(),
      Object.assign(new Error('CHECK'), {
        parent: { errno: 3819, sqlMessage: 'chk_productos_precio' },
      }),
      Object.assign(new Error('otro índice'), {
        parent: { errno: 1062, sqlMessage: "Duplicate entry '1' for key 'productos.otro_indice'" },
      }),
      // El valor lo escribe el cajero: si trae el nombre del índice, no puede engañar a la comparación.
      Object.assign(new Error('valor con el nombre del índice'), {
        parent: {
          errno: 1062,
          sqlMessage:
            "Duplicate entry 'x' for key 'productos.uq_productos_codigo_barras' ' for key 'productos.PRIMARY'",
        },
      }),
      new TypeError('no es de MySQL'),
    ];
    for (const original of otros) {
      vi.spyOn(Producto, 'create').mockRejectedValueOnce(original);
      await expect(crearProducto({ nombre, precio, codigoBarras })).rejects.toBe(original);
    }
  });
});
