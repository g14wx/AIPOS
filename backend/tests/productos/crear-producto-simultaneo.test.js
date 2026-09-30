import { describe, it, expect, afterEach } from 'vitest';
import { createRequire } from 'node:module';
import {
  borrarProductosDePrueba,
  crearProductoPorApi,
  filasConCodigoDeBarras,
  productoValido,
} from './ayudas-crear-producto.js';

const require = createRequire(import.meta.url);
const ErrorApi = require('../../src/errors/ErrorApi.js');
const { crearProducto } = require('../../src/services/productos.js');

// Necesita MySQL levantado y la base de prueba migrada (npm run migrar:prueba).
// Peticiones iguales al mismo tiempo (criterio 6 de P-02): dos pestañas o un doble clic. Una consulta previa de
// "¿ya existe?" las dejaría pasar a las dos; el índice único de MySQL deja pasar una sola.
afterEach(borrarProductosDePrueba);

const estados = (respuestas) => respuestas.map((respuesta) => respuesta.status).sort();

describe('dos peticiones iguales al mismo tiempo', () => {
  it('dan un 201 y un 409, y en productos queda una sola fila', async () => {
    const cuerpo = productoValido();

    const respuestas = await Promise.all([
      crearProductoPorApi(cuerpo),
      crearProductoPorApi(cuerpo),
    ]);

    expect(estados(respuestas)).toEqual([201, 409]);
    const conflicto = respuestas.find((respuesta) => respuesta.status === 409);
    expect(conflicto.body.error.codigo).toBe('CODIGO_BARRAS_DUPLICADO');
    expect(await filasConCodigoDeBarras(cuerpo.codigoBarras)).toHaveLength(1);
  });

  it('con diez peticiones iguales a la vez, se crea un solo producto y las otras nueve son un 409', async () => {
    const cuerpo = productoValido();

    const respuestas = await Promise.all(
      Array.from({ length: 10 }, () => crearProductoPorApi(cuerpo)),
    );

    expect(estados(respuestas)).toEqual([201, 409, 409, 409, 409, 409, 409, 409, 409, 409]);
    expect(await filasConCodigoDeBarras(cuerpo.codigoBarras)).toHaveLength(1);
  });

  it('con el mismo código de barras escrito distinto (mayúsculas y espacios), también se crea uno solo', async () => {
    const codigo = productoValido().codigoBarras;

    const respuestas = await Promise.all([
      crearProductoPorApi(productoValido({ codigoBarras: codigo })),
      crearProductoPorApi(productoValido({ codigoBarras: ` ${codigo.toLowerCase()} ` })),
      crearProductoPorApi(productoValido({ codigoBarras: codigo.toUpperCase() })),
    ]);

    expect(estados(respuestas)).toEqual([201, 409, 409]);
    expect(await filasConCodigoDeBarras(codigo)).toHaveLength(1);
  });

  it('el servicio también: de dos crearProducto a la vez, uno guarda y el otro lanza el 409', async () => {
    const { nombre, precio, codigoBarras } = productoValido();

    const resultados = await Promise.allSettled([
      crearProducto({ nombre, precio, codigoBarras }),
      crearProducto({ nombre, precio, codigoBarras }),
    ]);

    expect(resultados.map((resultado) => resultado.status).sort()).toEqual([
      'fulfilled',
      'rejected',
    ]);
    const rechazado = resultados.find((resultado) => resultado.status === 'rejected');
    expect(rechazado.reason).toBeInstanceOf(ErrorApi);
    expect(rechazado.reason).toMatchObject({ estado: 409, codigo: 'CODIGO_BARRAS_DUPLICADO' });
    expect(await filasConCodigoDeBarras(codigoBarras)).toHaveLength(1);
  });
});

describe('peticiones distintas al mismo tiempo', () => {
  it('con códigos de barras distintos se crean todos los productos', async () => {
    const cuerpos = Array.from({ length: 8 }, () => productoValido());

    const respuestas = await Promise.all(cuerpos.map((cuerpo) => crearProductoPorApi(cuerpo)));

    expect(estados(respuestas)).toEqual(Array(8).fill(201));
    const ids = new Set(respuestas.map((respuesta) => respuesta.body.id));
    expect(ids.size).toBe(8);
  });
});
