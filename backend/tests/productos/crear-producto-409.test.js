import { describe, it, expect, afterEach, vi } from 'vitest';
import { createRequire } from 'node:module';
import {
  anotarCodigoDeBarras,
  borrarProductosDePrueba,
  codigoDeBarrasNuevo,
  contarProductos,
  crearProductoPorApi,
  filasConCodigoDeBarras,
  productoValido,
} from './ayudas-crear-producto.js';

const require = createRequire(import.meta.url);
const sequelize = require('../../src/database.js');

// Necesita MySQL levantado y la base de prueba migrada (npm run migrar:prueba).
// El 409 de POST /api/productos (criterio 4 de P-02): sale del índice único uq_productos_codigo_barras de MySQL
// y no de una consulta previa.
const MENSAJE = 'Ya existe un producto con ese código de barras.';

afterEach(async () => {
  vi.restoreAllMocks();
  await borrarProductosDePrueba();
});

describe('un código de barras que ya existe', () => {
  it('responde 409 CODIGO_BARRAS_DUPLICADO con el campo codigoBarras en los detalles del error', async () => {
    const original = productoValido();
    expect((await crearProductoPorApi(original)).status).toBe(201);

    const respuesta = await crearProductoPorApi({
      ...original,
      nombre: 'Otra leche',
      precio: '20.00',
    });

    expect(respuesta.status).toBe(409);
    expect(respuesta.body).toEqual({
      error: {
        codigo: 'CODIGO_BARRAS_DUPLICADO',
        mensaje: MENSAJE,
        detalles: [{ campo: 'codigoBarras', mensaje: MENSAJE }],
      },
    });
  });

  it('el producto que ya estaba no cambia y no se crea otra fila', async () => {
    const original = productoValido();
    const creado = await crearProductoPorApi(original);
    const antes = await contarProductos();
    const filaAntes = await filasConCodigoDeBarras(original.codigoBarras);

    await crearProductoPorApi({ ...original, nombre: 'Otra leche', precio: '20.00' });

    expect(await contarProductos()).toBe(antes);
    expect(await filasConCodigoDeBarras(original.codigoBarras)).toEqual(filaAntes);
    expect(filaAntes).toEqual([{ id: creado.body.id, ...original }]);
  });

  it('el mismo nombre y el mismo precio con el mismo código de barras también es un 409', async () => {
    const original = productoValido();
    await crearProductoPorApi(original);
    expect((await crearProductoPorApi(original)).status).toBe(409);
  });

  it('el código de barras se compara ya recortado: " codigo " después de "codigo" es un 409', async () => {
    const original = productoValido();
    await crearProductoPorApi(original);
    const respuesta = await crearProductoPorApi({
      ...original,
      codigoBarras: `  ${original.codigoBarras} `,
    });
    expect(respuesta.status).toBe(409);
  });

  it.each([
    ['ABC-1', 'abc-1'],
    ['abc-1', 'ABC-1'],
    ['CAFÉ-1', 'cafe-1'],
  ])(
    'MySQL no distingue mayúsculas ni tildes: "%s" y "%s" son el mismo código de barras',
    async (uno, otro) => {
      const sufijo = codigoDeBarrasNuevo();
      anotarCodigoDeBarras(`${uno}-${sufijo}`);
      anotarCodigoDeBarras(`${otro}-${sufijo}`);
      const primero = await crearProductoPorApi(
        productoValido({ codigoBarras: `${uno}-${sufijo}` }),
      );
      expect(primero.status).toBe(201);
      const segundo = await crearProductoPorApi(
        productoValido({ codigoBarras: `${otro}-${sufijo}` }),
      );
      expect(segundo.status).toBe(409);
      expect(segundo.body.error.codigo).toBe('CODIGO_BARRAS_DUPLICADO');
    },
  );

  it('un dato inválido gana sobre el 409: la validación va antes de tocar MySQL', async () => {
    const original = productoValido();
    await crearProductoPorApi(original);
    const respuesta = await crearProductoPorApi({ ...original, precio: '10.999' });
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error.codigo).toBe('DATOS_INVALIDOS');
  });

  it('la respuesta no deja pasar el texto de MySQL, el nombre del índice ni el SQL', async () => {
    const original = productoValido();
    await crearProductoPorApi(original);
    const respuesta = await crearProductoPorApi(original);
    expect(respuesta.status).toBe(409);
    expect(respuesta.text).not.toMatch(
      /Duplicate|uq_productos|ER_DUP|sequelize|mysql|errno|INSERT/i,
    );
  });
});

describe('el 409 sale del índice único, sin una consulta previa de "¿ya existe?"', () => {
  const sqlDe = (consulta) => consulta.mock.calls.map(([sql]) => String(sql?.query ?? sql));

  it('crear un producto nuevo empieza con el INSERT y no lee productos por código de barras', async () => {
    const consulta = vi.spyOn(sequelize, 'query');
    const respuesta = await crearProductoPorApi(productoValido());
    expect(respuesta.status).toBe(201);
    const sentencias = sqlDe(consulta);
    expect(sentencias[0]).toMatch(/^INSERT INTO `productos`/);
    for (const sentencia of sentencias) expect(sentencia).not.toMatch(/WHERE[^;]*codigo_barras/i);
  });

  it('un código de barras repetido llega a MySQL como un solo INSERT, y MySQL es quien dice que no', async () => {
    const original = productoValido();
    await crearProductoPorApi(original);
    const consulta = vi.spyOn(sequelize, 'query');
    const respuesta = await crearProductoPorApi(original);
    expect(respuesta.status).toBe(409);
    const sentencias = sqlDe(consulta);
    expect(sentencias).toHaveLength(1);
    expect(sentencias[0]).toMatch(/^INSERT INTO `productos`/);
  });
});
