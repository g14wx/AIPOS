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
// Los 400 de POST /api/productos (criterios 1 a 3 de P-02): cada uno con su campo y su motivo, y sin tocar MySQL.
const MENSAJE = 'Los datos del producto no son válidos. Revisa los campos marcados.';
const FORMA = 'Debe ser un número con punto decimal, por ejemplo 25.50.';

afterEach(async () => {
  vi.restoreAllMocks();
  await borrarProductosDePrueba();
});

// Manda el POST, y comprueba que es un 400 con ese cuerpo y que no cambió la tabla productos.
async function esperar400(cuerpo, detalles) {
  const antes = await contarProductos();
  const respuesta = await crearProductoPorApi(cuerpo);
  expect(respuesta.status).toBe(400);
  expect(respuesta.body).toEqual({
    error: { codigo: 'DATOS_INVALIDOS', mensaje: MENSAJE, detalles },
  });
  expect(await contarProductos()).toBe(antes);
}

describe('el precio (criterios 1 y 2)', () => {
  it.each([
    ['-5', FORMA],
    ['abc', FORMA],
    ['1,5', FORMA],
    ['.5', FORMA],
    ['1e3', FORMA],
    [' 25', FORMA],
    ['10.999', 'No puede tener más de 2 decimales.'],
    ['0.001', 'No puede tener más de 2 decimales.'],
    ['100000', 'No puede ser mayor que 99999.99.'],
    ['100000.00', 'No puede ser mayor que 99999.99.'],
    ['0', 'Debe ser mayor que 0.'],
    ['0.00', 'Debe ser mayor que 0.'],
    [25.5, 'Debe enviarse como texto, por ejemplo "25.50".'],
    [25, 'Debe enviarse como texto, por ejemplo "25.50".'],
    [null, 'Es obligatorio.'],
    ['', 'Es obligatorio.'],
  ])('el precio %j responde 400 con el campo precio y su motivo', async (precio, mensaje) => {
    await esperar400(productoValido({ precio }), [{ campo: 'precio', mensaje }]);
  });

  it('sin precio responde 400 con "Es obligatorio."', async () => {
    const { precio, ...sinPrecio } = productoValido();
    expect(precio).toBeDefined();
    await esperar400(sinPrecio, [{ campo: 'precio', mensaje: 'Es obligatorio.' }]);
  });

  it.each([
    ['99999.99', '99999.99'],
    ['0.01', '0.01'],
  ])('el precio "%s" responde 201', async (precio, guardado) => {
    const respuesta = await crearProductoPorApi(productoValido({ precio }));
    expect(respuesta.status).toBe(201);
    expect(respuesta.body.precio).toBe(guardado);
  });
});

describe('los campos que faltan (criterio 3)', () => {
  it('sin nombre, sin precio y sin código de barras hay un detalle del error por cada campo', async () => {
    await esperar400({}, [
      { campo: 'nombre', mensaje: 'Es obligatorio.' },
      { campo: 'precio', mensaje: 'Es obligatorio.' },
      { campo: 'codigoBarras', mensaje: 'Es obligatorio.' },
    ]);
  });

  it.each(['nombre', 'codigoBarras'])(
    'sin %s o con %s null, vacío o solo espacios: es obligatorio',
    async (campo) => {
      for (const valor of [undefined, null, '', '   ']) {
        const cuerpo = { ...productoValido(), [campo]: valor };
        await esperar400(cuerpo, [{ campo, mensaje: 'Es obligatorio.' }]);
      }
    },
  );

  it.each([
    ['nombre', 5, 'Debe ser un texto.'],
    ['nombre', ['Pan'], 'Debe ser un texto.'],
    ['nombre', { texto: 'Pan' }, 'Debe ser un texto.'],
    ['codigoBarras', 7501055300075, 'Debe ser un texto.'],
    ['codigoBarras', true, 'Debe ser un texto.'],
    ['nombre', 'a'.repeat(121), 'No puede pasar de 120 caracteres.'],
    ['codigoBarras', '1'.repeat(51), 'No puede pasar de 50 caracteres.'],
  ])('%s con el valor %j responde 400: %s', async (campo, valor, mensaje) => {
    await esperar400({ ...productoValido(), [campo]: valor }, [{ campo, mensaje }]);
  });

  it('junta todos los campos con problema en el orden nombre, precio y código de barras', async () => {
    await esperar400({ codigoBarras: 5, precio: '10.999', nombre: '' }, [
      { campo: 'nombre', mensaje: 'Es obligatorio.' },
      { campo: 'precio', mensaje: 'No puede tener más de 2 decimales.' },
      { campo: 'codigoBarras', mensaje: 'Debe ser un texto.' },
    ]);
  });
});

describe('el largo se cuenta en caracteres, como lo cuenta MySQL', () => {
  it('un nombre de 120 emojis se guarda (201) y uno de 121 es un 400', async () => {
    const nombre = '😀'.repeat(120);
    const respuesta = await crearProductoPorApi(productoValido({ nombre }));
    expect(respuesta.status).toBe(201);
    expect(respuesta.body.nombre).toBe(nombre);
    await esperar400(productoValido({ nombre: '😀'.repeat(121) }), [
      { campo: 'nombre', mensaje: 'No puede pasar de 120 caracteres.' },
    ]);
  });

  it('un nombre de 120 letras y un código de barras de 50 se guardan (201)', async () => {
    const codigoBarras = anotarCodigoDeBarras(codigoDeBarrasNuevo().padEnd(50, '0'));
    expect([...codigoBarras]).toHaveLength(50);
    const respuesta = await crearProductoPorApi(
      productoValido({ nombre: 'n'.repeat(120), codigoBarras }),
    );
    expect(respuesta.status).toBe(201);
    expect(await filasConCodigoDeBarras(codigoBarras)).toHaveLength(1);
  });
});

describe('un cuerpo que falta o no sirve: 400 con los tres campos obligatorios, nunca un 500', () => {
  const TRES_OBLIGATORIOS = [
    { campo: 'nombre', mensaje: 'Es obligatorio.' },
    { campo: 'precio', mensaje: 'Es obligatorio.' },
    { campo: 'codigoBarras', mensaje: 'Es obligatorio.' },
  ];

  it('una petición sin cuerpo y sin Content-Type (req.body llega undefined en Express 5)', async () => {
    await esperar400(undefined, TRES_OBLIGATORIOS);
  });

  it('una petición con Content-Type: application/json y el cuerpo vacío', async () => {
    const respuesta = await crearProductoPorApi().set('Content-Type', 'application/json');
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error.detalles).toEqual(TRES_OBLIGATORIOS);
  });

  it.each([
    ['un texto plano', 'text/plain', 'nombre=Pan&precio=1&codigoBarras=1'],
    ['un formulario', 'application/x-www-form-urlencoded', 'nombre=Pan&precio=1&codigoBarras=1'],
  ])(
    'un cuerpo que es %s no es JSON: se trata como un cuerpo vacío',
    async (_caso, tipo, texto) => {
      const respuesta = await crearProductoPorApi().set('Content-Type', tipo).send(texto);
      expect(respuesta.status).toBe(400);
      expect(respuesta.body.error.detalles).toEqual(TRES_OBLIGATORIOS);
    },
  );

  it.each([['[]'], ['[1, 2]'], ['[{"nombre":"Pan","precio":"1","codigoBarras":"1"}]']])(
    'un arreglo JSON (%s) se trata como un cuerpo vacío',
    async (texto) => {
      const respuesta = await crearProductoPorApi()
        .set('Content-Type', 'application/json')
        .send(texto);
      expect(respuesta.status).toBe(400);
      expect(respuesta.body.error.detalles).toEqual(TRES_OBLIGATORIOS);
    },
  );

  it.each([['null'], ['5'], ['"texto"'], ['true']])(
    'un JSON que no es un objeto ni un arreglo (%s) lo rechaza el lector de Express: 400 JSON_INVALIDO',
    async (texto) => {
      const respuesta = await crearProductoPorApi()
        .set('Content-Type', 'application/json')
        .send(texto);
      expect(respuesta.status).toBe(400);
      expect(respuesta.body.error.codigo).toBe('JSON_INVALIDO');
    },
  );

  it('un JSON mal escrito es un 400 JSON_INVALIDO y un cuerpo de más de 100 KB es un 400 CUERPO_MUY_GRANDE', async () => {
    const mal = await crearProductoPorApi()
      .set('Content-Type', 'application/json')
      .send('{"nombre":');
    expect(mal.status).toBe(400);
    expect(mal.body.error.codigo).toBe('JSON_INVALIDO');
    const grande = await crearProductoPorApi(productoValido({ nombre: 'a'.repeat(101 * 1024) }));
    expect(grande.status).toBe(400);
    expect(grande.body.error.codigo).toBe('CUERPO_MUY_GRANDE');
  });
});

describe('la validación va antes de tocar la base de datos', () => {
  it('un 400 no manda ninguna consulta a MySQL', async () => {
    const consulta = vi.spyOn(sequelize, 'query');
    for (const cuerpo of [
      {},
      productoValido({ precio: '10.999' }),
      productoValido({ nombre: 5 }),
    ]) {
      const respuesta = await crearProductoPorApi(cuerpo);
      expect(respuesta.status).toBe(400);
    }
    expect(consulta).not.toHaveBeenCalled();
  });

  it('la respuesta 400 no trae el stack, ni SQL, ni el mensaje de MySQL', async () => {
    const respuesta = await crearProductoPorApi(productoValido({ precio: '-5' }));
    expect(Object.keys(respuesta.body)).toEqual(['error']);
    expect(Object.keys(respuesta.body.error)).toEqual(['codigo', 'mensaje', 'detalles']);
    expect(respuesta.text).not.toMatch(
      /stack|node_modules|\.js:\d+|SELECT|INSERT|sequelize|mysql|errno/i,
    );
  });
});
