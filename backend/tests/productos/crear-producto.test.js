import { describe, it, expect, afterEach } from 'vitest';
import { createRequire } from 'node:module';
import request from 'supertest';
import {
  RUTA,
  anotarCodigoDeBarras,
  borrarProductosDePrueba,
  codigoConCerosNuevo,
  codigoDeBarrasNuevo,
  contarProductos,
  crearProductoPorApi,
  filasConCodigoDeBarras,
  productoValido,
} from './ayudas-crear-producto.js';

const require = createRequire(import.meta.url);
const app = require('../../src/app.js');
const { config } = require('../../src/config.js');

// Necesita MySQL levantado y la base de prueba migrada (npm run migrar:prueba).
// POST /api/productos con datos válidos (criterio 5 de P-02), lo que se guarda y cómo se guarda.
afterEach(borrarProductosDePrueba);

describe('POST /api/productos con un producto válido', () => {
  it('responde 201 con el producto y hay una fila nueva en productos', async () => {
    const antes = await contarProductos();
    const cuerpo = productoValido();

    const respuesta = await crearProductoPorApi(cuerpo);

    expect(respuesta.status).toBe(201);
    expect(respuesta.headers['content-type']).toMatch(/application\/json/);
    expect(respuesta.body).toEqual({ id: expect.any(Number), ...cuerpo });
    expect(await contarProductos()).toBe(antes + 1);
    expect(await filasConCodigoDeBarras(cuerpo.codigoBarras)).toEqual([
      { id: respuesta.body.id, ...cuerpo },
    ]);
  });

  it('el producto que responde tiene solo id, nombre, precio y código de barras, y ninguna cabecera Location', async () => {
    const respuesta = await crearProductoPorApi(productoValido());
    expect(Object.keys(respuesta.body)).toEqual(['id', 'nombre', 'precio', 'codigoBarras']);
    expect(respuesta.headers).not.toHaveProperty('location');
  });

  it.each([
    ['25', '25.00'],
    ['25.5', '25.50'],
    ['25.50', '25.50'],
    ['0.10', '0.10'],
    ['7', '7.00'],
  ])('con el precio "%s" responde "%s", como lo guarda MySQL', async (enviado, guardado) => {
    const cuerpo = productoValido({ precio: enviado });
    const respuesta = await crearProductoPorApi(cuerpo);
    expect(respuesta.status).toBe(201);
    expect(respuesta.body.precio).toBe(guardado);
    const [fila] = await filasConCodigoDeBarras(cuerpo.codigoBarras);
    expect(fila.precio).toBe(guardado);
  });

  it('el precio sale como texto, nunca como número', async () => {
    const respuesta = await crearProductoPorApi(productoValido({ precio: '99999.99' }));
    expect(respuesta.status).toBe(201);
    expect(respuesta.body.precio).toBe('99999.99');
    expect(typeof respuesta.body.precio).toBe('string');
  });

  it('con el código de barras "0012345" responde y guarda los ceros de la izquierda', async () => {
    const codigoBarras = codigoConCerosNuevo();
    expect(codigoBarras.startsWith('00')).toBe(true);
    const respuesta = await crearProductoPorApi(productoValido({ codigoBarras }));
    expect(respuesta.status).toBe(201);
    expect(respuesta.body.codigoBarras).toBe(codigoBarras);
    const [fila] = await filasConCodigoDeBarras(codigoBarras);
    expect(fila.codigoBarras).toBe(codigoBarras);
  });

  it('ignora los campos que sobran: el id lo pone MySQL', async () => {
    const enviado = { ...productoValido(), id: 2147483000, precioAplicado: '1.00', otro: true };
    const respuesta = await crearProductoPorApi(enviado);
    expect(respuesta.status).toBe(201);
    expect(respuesta.body.id).not.toBe(2147483000);
    expect(Object.keys(respuesta.body)).toEqual(['id', 'nombre', 'precio', 'codigoBarras']);
    expect(respuesta.body.precio).toBe('25.00');
  });

  it('dos productos pueden tener el mismo nombre: solo el código de barras es único', async () => {
    const primero = await crearProductoPorApi(productoValido());
    const segundo = await crearProductoPorApi(productoValido());
    expect(primero.status).toBe(201);
    expect(segundo.status).toBe(201);
    expect(segundo.body.id).not.toBe(primero.body.id);
    expect(segundo.body.nombre).toBe(primero.body.nombre);
  });
});

describe('los textos: se recortan y se guardan tal cual', () => {
  it('"  Leche  " se guarda como "Leche" y el código de barras también se recorta (RN-04)', async () => {
    const codigoBarras = codigoDeBarrasNuevo();
    const respuesta = await crearProductoPorApi({
      nombre: '  Leche  ',
      precio: '25',
      codigoBarras: ` ${codigoBarras}  `,
    });
    expect(respuesta.status).toBe(201);
    expect(respuesta.body).toMatchObject({ nombre: 'Leche', codigoBarras });
    expect(await filasConCodigoDeBarras(codigoBarras)).toMatchObject([{ nombre: 'Leche' }]);
  });

  it('recorta con trim() de JavaScript: el tabulador y el espacio no separable también salen', async () => {
    const codigoBarras = codigoDeBarrasNuevo();
    const respuesta = await crearProductoPorApi(
      productoValido({ nombre: '\tPan ', codigoBarras: `${codigoBarras}\n` }),
    );
    expect(respuesta.status).toBe(201);
    expect(respuesta.body).toMatchObject({ nombre: 'Pan', codigoBarras });
  });

  it('un nombre o un código de barras que solo tenía espacios queda vacío y es un 400', async () => {
    const antes = await contarProductos();
    const respuesta = await crearProductoPorApi(
      productoValido({ nombre: '   ', codigoBarras: ' ' }),
    );
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error.detalles).toEqual([
      { campo: 'nombre', mensaje: 'Es obligatorio.' },
      { campo: 'codigoBarras', mensaje: 'Es obligatorio.' },
    ]);
    expect(await contarProductos()).toBe(antes);
  });

  it('el precio no se recorta: " 25" es un 400 y no se guarda nada', async () => {
    const cuerpo = productoValido({ precio: ' 25' });
    const respuesta = await crearProductoPorApi(cuerpo);
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error.detalles).toEqual([
      { campo: 'precio', mensaje: 'Debe ser un número con punto decimal, por ejemplo 25.50.' },
    ]);
    expect(await filasConCodigoDeBarras(cuerpo.codigoBarras)).toEqual([]);
  });

  it("un nombre como '; DROP TABLE productos; -- se guarda tal cual, como texto (RNF-04)", async () => {
    const nombre = "'; DROP TABLE productos; --";
    const codigoBarras = anotarCodigoDeBarras(`${codigoDeBarrasNuevo()}' OR '1'='1`);
    const respuesta = await crearProductoPorApi(productoValido({ nombre, codigoBarras }));
    expect(respuesta.status).toBe(201);
    expect(respuesta.body).toMatchObject({ nombre, codigoBarras });
    expect(await filasConCodigoDeBarras(codigoBarras)).toMatchObject([{ nombre }]);
    // La tabla sigue ahí y solo hay una fila con ese código de barras: el texto no se ejecutó.
    expect(await contarProductos()).toBeGreaterThan(0);
  });

  it('guarda tildes, eñes y emojis sin cambiarlos (utf8mb4)', async () => {
    const nombre = 'Café con leche ñandú 😀☕';
    const codigoBarras = codigoDeBarrasNuevo();
    const respuesta = await crearProductoPorApi(productoValido({ nombre, codigoBarras }));
    expect(respuesta.status).toBe(201);
    expect(respuesta.body.nombre).toBe(nombre);
    expect(await filasConCodigoDeBarras(codigoBarras)).toMatchObject([{ nombre }]);
  });
});

describe('la pantalla llama desde otro origen', () => {
  it('la petición previa de CORS (OPTIONS) deja pasar el POST del origen de la pantalla', async () => {
    const origen = config.corsOrigenes[0];
    const respuesta = await request(app)
      .options(RUTA)
      .set('Origin', origen)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type');
    expect(respuesta.status).toBe(204);
    expect(respuesta.headers['access-control-allow-origin']).toBe(origen);
    expect(respuesta.headers['access-control-allow-methods']).toMatch(/POST/);
  });
});
