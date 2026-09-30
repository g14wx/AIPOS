import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import request from 'supertest';
import { createRequire } from 'node:module';
import { abrirServidorDePrueba, cerrarServidorDePrueba } from '../servidor-de-prueba.js';

const require = createRequire(import.meta.url);
const app = require('../../src/app.js');
const sequelize = require('../../src/database.js');
const { Producto } = require('../../src/models/index.js');

// GET /api/productos?busqueda=<texto> contra MySQL de verdad (base de prueba). Necesita MySQL levantado y migrado.
// Cada prueba crea sus productos con el modelo Producto y los borra al terminar: deja la tabla como la encontró.
const LECHE = { nombre: 'Leche entera 1 L', codigoBarras: '7501055300075', precio: '25.00' };
const JUGO_50 = { nombre: 'Jugo 50% fruta', codigoBarras: '111', precio: '18.50' };
const JUGO_500 = { nombre: 'Jugo 500 ml', codigoBarras: '222', precio: '12.00' };
const CABLE = { nombre: 'Cable A_B', codigoBarras: '333', precio: '40.00' };
const EJEMPLOS = [LECHE, JUGO_50, JUGO_500, CABLE];

const idsCreados = [];

// Un servidor atado a 127.0.0.1: con request(app) una petición puede caer en otro programa de la máquina (issue #58).
let servidor;
beforeAll(async () => {
  servidor = await abrirServidorDePrueba(app);
});
afterAll(() => cerrarServidorDePrueba(servidor));

async function crear(...productos) {
  const filas = [];
  for (const datos of productos) {
    const fila = await Producto.create(datos);
    idsCreados.push(fila.id);
    filas.push(fila);
  }
  return filas;
}

afterEach(async () => {
  vi.restoreAllMocks();
  if (idsCreados.length > 0) await Producto.destroy({ where: { id: idsCreados.splice(0) } });
});

function buscar(texto) {
  return request(servidor).get('/api/productos').query({ busqueda: texto });
}

const nombresDe = (respuesta) => respuesta.body.map((producto) => producto.nombre);

describe('buscar por una parte del nombre o por el código de barras exacto', () => {
  it('criterio 1: dado el producto "Leche entera 1 L", cuando se busca "lech", entonces aparece en la lista', async () => {
    await crear(...EJEMPLOS);
    const respuesta = await buscar('lech');
    expect(respuesta.status, respuesta.text).toBe(200);
    expect(nombresDe(respuesta)).toEqual(['Leche entera 1 L']);
  });

  it('criterio 2: dado el código de barras "7501055300075", cuando se busca completo, entonces aparece ese producto', async () => {
    await crear(...EJEMPLOS);
    const respuesta = await buscar('7501055300075');
    expect(respuesta.status, respuesta.text).toBe(200);
    expect(respuesta.body).toHaveLength(1);
    expect(respuesta.body[0]).toMatchObject({
      nombre: 'Leche entera 1 L',
      codigoBarras: '7501055300075',
    });
  });

  it('criterio 3: dado un texto sin coincidencias, entonces responde 200 con la lista vacía', async () => {
    await crear(...EJEMPLOS);
    const respuesta = await buscar('zzzz');
    expect(respuesta.status, respuesta.text).toBe(200);
    expect(respuesta.body).toEqual([]);
  });

  it('con la tabla vacía también responde 200 con la lista vacía', async () => {
    const respuesta = await buscar('lech');
    expect(respuesta.status, respuesta.text).toBe(200);
    expect(respuesta.body).toEqual([]);
  });

  it('criterio 4: dado el texto "50%", entonces solo aparecen productos con "50%" en el nombre, no "Jugo 500 ml"', async () => {
    await crear(JUGO_50, JUGO_500);
    const respuesta = await buscar('50%');
    expect(respuesta.status, respuesta.text).toBe(200);
    expect(nombresDe(respuesta)).toEqual(['Jugo 50% fruta']);
  });

  it('criterio 5: dado el texto "\' OR 1=1 --", entonces no devuelve todos los productos', async () => {
    await crear(...EJEMPLOS);
    const respuesta = await buscar("' OR 1=1 --");
    expect(respuesta.status, respuesta.text).toBe(200);
    expect(respuesta.body).toEqual([]);
  });

  it('el texto del cajero no rompe la consulta: un nombre con comilla se encuentra con su propia comilla', async () => {
    await crear({ nombre: "Pan d'or", codigoBarras: '555', precio: '30.00' }, LECHE);
    const respuesta = await buscar("d'or");
    expect(respuesta.status, respuesta.text).toBe(200);
    expect(nombresDe(respuesta)).toEqual(["Pan d'or"]);
  });
});

describe('%, _ y \\ son texto normal, y no cuentan las mayúsculas ni las tildes', () => {
  it('criterio 6: dado el texto "a_b", entonces solo aparece "Cable A_B", no "Cable AXB"', async () => {
    await crear(CABLE, { nombre: 'Cable AXB', codigoBarras: '334', precio: '41.00' });
    const respuesta = await buscar('a_b');
    expect(respuesta.status, respuesta.text).toBe(200);
    expect(nombresDe(respuesta)).toEqual(['Cable A_B']);
  });

  it('criterio 6: dado el texto a\\ (2 caracteres), entonces responde 200 y no devuelve todos los productos con una "a"', async () => {
    await crear(...EJEMPLOS);
    const respuesta = await buscar('a\\');
    expect(respuesta.status, respuesta.text).toBe(200);
    expect(respuesta.body).toEqual([]);
  });

  it('la barra invertida se busca como texto: "a\\" encuentra un nombre que la tiene', async () => {
    await crear(...EJEMPLOS, { nombre: 'Ruta a\\b', codigoBarras: '666', precio: '5.00' });
    const respuesta = await buscar('a\\');
    expect(nombresDe(respuesta)).toEqual(['Ruta a\\b']);
  });

  it('dado "%%", "__", "%_" o 120 veces "%", entonces no son comodines: no devuelve todos los productos', async () => {
    await crear(...EJEMPLOS);
    for (const texto of ['%%', '__', '%_', '_%', '%'.repeat(120)]) {
      const respuesta = await buscar(texto);
      expect(respuesta.status, `${texto} -> ${respuesta.text}`).toBe(200);
      expect(respuesta.body, texto).toEqual([]);
    }
  });

  it('criterio 7: dado el texto "LÉCH" o "lech", entonces aparece "Leche entera 1 L"', async () => {
    await crear(...EJEMPLOS);
    for (const texto of ['LÉCH', 'lech', 'LECH', 'léch', 'Lech']) {
      const respuesta = await buscar(texto);
      expect(respuesta.status, `${texto} -> ${respuesta.text}`).toBe(200);
      expect(nombresDe(respuesta), texto).toEqual(['Leche entera 1 L']);
    }
  });

  it('un nombre con tilde se encuentra sin tilde y en mayúsculas', async () => {
    await crear({ nombre: 'Café molido', codigoBarras: '777', precio: '60.00' });
    for (const texto of ['cafe', 'CAFÉ', 'café']) {
      expect(nombresDe(await buscar(texto)), texto).toEqual(['Café molido']);
    }
  });

  it('criterio 8: dado el texto "  lech  " (con espacios en los extremos), entonces busca "lech"', async () => {
    await crear(...EJEMPLOS);
    const respuesta = await buscar('  lech  ');
    expect(respuesta.status, respuesta.text).toBe(200);
    expect(nombresDe(respuesta)).toEqual(['Leche entera 1 L']);
  });
});

describe('el código de barras se busca exacto', () => {
  it('criterio 9: dado un pedazo del código de barras ("750105530007"), entonces no aparece el producto por su código', async () => {
    await crear(...EJEMPLOS);
    for (const texto of ['750105530007', '75010', '055300075']) {
      const respuesta = await buscar(texto);
      expect(respuesta.status, `${texto} -> ${respuesta.text}`).toBe(200);
      expect(respuesta.body, texto).toEqual([]);
    }
  });

  it('no distingue mayúsculas, con la misma regla del UNIQUE de RN-03', async () => {
    await crear({ nombre: 'Cable USB', codigoBarras: 'ab-12', precio: '10.00' });
    expect(nombresDe(await buscar('AB-12'))).toEqual(['Cable USB']);
  });

  it('conserva los ceros de la izquierda: "0012345" lo encuentra y "12345" no', async () => {
    await crear({ nombre: 'Sal fina', codigoBarras: '0012345', precio: '8.00' });
    const completo = await buscar('0012345');
    expect(completo.body).toHaveLength(1);
    expect(completo.body[0].codigoBarras).toBe('0012345');
    expect((await buscar('12345')).body).toEqual([]);
  });

  it('un producto que coincide por nombre y por código de barras sale una sola vez', async () => {
    await crear({ nombre: 'Tornillo 999', codigoBarras: '999', precio: '1.00' });
    expect(nombresDe(await buscar('999'))).toEqual(['Tornillo 999']);
  });

  it('un texto que es el nombre de uno y el código de barras de otro trae los dos, el del código de barras primero', async () => {
    await crear({ nombre: 'Tornillo 999', codigoBarras: 'T-1', precio: '1.00' });
    await crear({ nombre: 'Zapato', codigoBarras: '999', precio: '90.00' });
    expect(nombresDe(await buscar('999'))).toEqual(['Zapato', 'Tornillo 999']);
  });
});

describe('como máximo 20 resultados, siempre en el mismo orden', () => {
  it('criterio 10: dados 25 productos con "Galleta" en el nombre, cuando se busca "galleta", entonces la lista trae los primeros 20 por nombre de la A a la Z', async () => {
    const nombres = Array.from(
      { length: 25 },
      (_, i) => `Galleta ${String(i + 1).padStart(2, '0')}`,
    );
    // Se crean del último al primero: ordenar por nombre da otra lista que ordenar por id.
    const alReves = [...nombres].reverse();
    await crear(
      ...alReves.map((nombre, i) => ({ nombre, codigoBarras: `GAL-${i}`, precio: '5.00' })),
    );
    const respuesta = await buscar('galleta');
    expect(respuesta.status, respuesta.text).toBe(200);
    expect(respuesta.body).toHaveLength(20);
    expect(nombresDe(respuesta)).toEqual(nombres.slice(0, 20));
  });

  it('criterio 11: dado un producto con el código de barras "222" y 25 productos con "222" en el nombre, cuando se busca "222", entonces el producto de ese código de barras va primero', async () => {
    const tornillos = Array.from({ length: 25 }, (_, i) => ({
      nombre: `Tornillo 222 ${String(i + 1).padStart(2, '0')}`,
      codigoBarras: `T-${i}`,
      precio: '1.00',
    }));
    await crear(...tornillos, { nombre: 'Zumo', codigoBarras: '222', precio: '12.00' });
    const respuesta = await buscar('222');
    expect(respuesta.status, respuesta.text).toBe(200);
    expect(respuesta.body).toHaveLength(20);
    expect(respuesta.body[0]).toMatchObject({ nombre: 'Zumo', codigoBarras: '222' });
    expect(nombresDe(respuesta).slice(1)).toEqual(tornillos.slice(0, 19).map((t) => t.nombre));
  });

  it('ordena por nombre de la A a la Z sin distinguir mayúsculas ni tildes', async () => {
    await crear(
      { nombre: 'pan integral', codigoBarras: 'P1', precio: '3.00' },
      { nombre: 'Pan blanco', codigoBarras: 'P2', precio: '2.00' },
      { nombre: 'pan Árabe', codigoBarras: 'P3', precio: '4.00' },
    );
    expect(nombresDe(await buscar('pan'))).toEqual(['pan Árabe', 'Pan blanco', 'pan integral']);
  });

  it('con el mismo nombre, ordena por id: el mismo texto siempre da la misma lista', async () => {
    const filas = await crear(
      { nombre: 'Pan', codigoBarras: 'P3', precio: '3.00' },
      { nombre: 'Pan', codigoBarras: 'P1', precio: '1.00' },
      { nombre: 'Pan', codigoBarras: 'P2', precio: '2.00' },
    );
    const ids = filas.map((fila) => fila.id);
    for (let vez = 0; vez < 3; vez += 1) {
      expect((await buscar('pan')).body.map((producto) => producto.id)).toEqual(ids);
    }
  });
});

describe('el texto de búsqueda se valida antes de tocar la base de datos (400 DATOS_INVALIDOS)', () => {
  const pedir = (direccion) => request(servidor).get(direccion);
  const CASOS = [
    ['falta busqueda', () => pedir('/api/productos')],
    ['busqueda vacía', () => pedir('/api/productos?busqueda=')],
    ['busqueda sin valor', () => pedir('/api/productos?busqueda')],
    ['solo espacios', () => buscar('   ')],
    ['1 carácter (a)', () => buscar('a')],
    ['1 carácter con espacios', () => buscar(' a ')],
    ['1 barra invertida', () => buscar('\\')],
    ['121 caracteres', () => buscar('a'.repeat(121))],
    ['busqueda repetido', () => pedir('/api/productos?busqueda=lech&busqueda=leche')],
    ['busqueda como lista', () => pedir('/api/productos?busqueda[]=lech')],
    ['busqueda como objeto', () => pedir('/api/productos?busqueda[a]=lech')],
  ];

  it.each(CASOS)(
    'criterio 12: %s responde 400 con el campo busqueda en los detalles del error y sin tocar MySQL',
    async (nombre, pedirCaso) => {
      await crear(LECHE);
      const consultas = vi.spyOn(sequelize, 'query');
      const buscarTodo = vi.spyOn(Producto, 'findAll');
      const respuesta = await pedirCaso();
      expect(respuesta.status, respuesta.text).toBe(400);
      expect(respuesta.body.error.codigo).toBe('DATOS_INVALIDOS');
      expect(typeof respuesta.body.error.mensaje).toBe('string');
      expect(respuesta.body.error.detalles.map((detalle) => detalle.campo)).toEqual(['busqueda']);
      expect(buscarTodo).not.toHaveBeenCalled();
      expect(consultas).not.toHaveBeenCalled();
    },
  );

  it('con 1 carácter el cuerpo es el de la spec', async () => {
    const respuesta = await buscar('a');
    expect(respuesta.status, respuesta.text).toBe(400);
    expect(respuesta.body).toEqual({
      error: {
        codigo: 'DATOS_INVALIDOS',
        mensaje: 'El texto de búsqueda debe tener entre 2 y 120 caracteres.',
        detalles: [{ campo: 'busqueda', mensaje: 'Escribe al menos 2 caracteres.' }],
      },
    });
  });

  it('con 2 caracteres y con 120 responde 200', async () => {
    await crear(LECHE);
    expect((await buscar('le')).status).toBe(200);
    const larga = await buscar('a'.repeat(120));
    expect(larga.status, larga.text).toBe(200);
    expect(larga.body).toEqual([]);
  });
});

describe('lo que trae cada producto', () => {
  it('criterio 13: trae id (número entero), nombre, codigoBarras y precio (texto con 2 decimales), y ningún campo más', async () => {
    await crear(LECHE);
    const respuesta = await buscar('lech');
    expect(respuesta.status, respuesta.text).toBe(200);
    expect(respuesta.headers['content-type']).toMatch(/application\/json/);
    expect(respuesta.body).toHaveLength(1);
    const [producto] = respuesta.body;
    expect(Object.keys(producto).sort()).toEqual(['codigoBarras', 'id', 'nombre', 'precio']);
    expect(Number.isInteger(producto.id)).toBe(true);
    expect(producto).toEqual({ id: producto.id, ...LECHE });
    expect(typeof producto.precio).toBe('string');
  });

  it('pide a MySQL solo esas cuatro columnas, para que una columna nueva de la tabla no salga por la búsqueda', async () => {
    const buscarTodo = vi.spyOn(Producto, 'findAll');
    const respuesta = await buscar('lech');
    expect(respuesta.status, respuesta.text).toBe(200);
    expect(buscarTodo).toHaveBeenCalledTimes(1);
    expect(buscarTodo.mock.calls[0][0].attributes).toEqual([
      'id',
      'nombre',
      'codigoBarras',
      'precio',
    ]);
  });

  it('el precio sale con 2 decimales aunque se haya guardado sin ellos', async () => {
    await crear(
      { nombre: 'Pan 1', codigoBarras: 'D1', precio: '25' },
      { nombre: 'Pan 2', codigoBarras: 'D2', precio: '0.5' },
      { nombre: 'Pan 3', codigoBarras: 'D3', precio: '99999.99' },
    );
    const precios = (await buscar('pan')).body.map((producto) => producto.precio);
    expect(precios).toEqual(['25.00', '0.50', '99999.99']);
  });

  it('los otros parámetros de la dirección se ignoran', async () => {
    await crear(...EJEMPLOS);
    const respuesta = await request(servidor)
      .get('/api/productos')
      .query({ busqueda: 'lech', pagina: 2, limite: 1, orden: 'desc', nombre: 'zzz' });
    expect(respuesta.status, respuesta.text).toBe(200);
    expect(nombresDe(respuesta)).toEqual(['Leche entera 1 L']);
  });
});

describe('cuando MySQL falla', () => {
  it('criterio 14: dado que MySQL falla, entonces responde 500 ERROR_INTERNO, sin el SQL ni el stack en el cuerpo', async () => {
    const textoSql = "SELECT id FROM productos WHERE nombre LIKE '%lech%'";
    const falla = new Error(`${textoSql} -> Table 'aipos_prueba.productos' doesn't exist`);
    falla.name = 'SequelizeDatabaseError';
    falla.parent = {
      errno: 1146,
      code: 'ER_NO_SUCH_TABLE',
      sqlMessage: 'Table no existe',
      sql: textoSql,
    };
    vi.spyOn(Producto, 'findAll').mockRejectedValueOnce(falla);
    const registro = vi.spyOn(console, 'error').mockImplementation(() => {});

    const respuesta = await buscar('lech');

    expect(respuesta.status, respuesta.text).toBe(500);
    expect(respuesta.body).toEqual({
      error: { codigo: 'ERROR_INTERNO', mensaje: 'Ocurrió un error inesperado. Intenta de nuevo.' },
    });
    expect(respuesta.text).not.toMatch(
      /SELECT|FROM|productos|aipos_prueba|ER_|errno|Sequelize|stack|\.js/i,
    );
    expect(registro).toHaveBeenCalledWith(falla);
  });
});

describe('buscar solo lee y el texto nunca se pega en el SQL', () => {
  const HOSTILES = [
    "'; DROP TABLE productos; --",
    "x' OR '1'='1",
    "\\' OR 1=1 --",
    "%' OR 1=1 --",
    'lech%" OR ""="',
    // El texto pasa por dos caminos: el patrón del LIKE (escapado por Sequelize) y el replacements del orden.
    // Estas mezclas de barra invertida, comilla y :texto son las que confundirían al segundo con el primero.
    "\\':texto",
    "\\\\':texto",
    "':texto",
    "\\' OR :texto OR \\'",
    ':texto\\',
    '\\:texto',
    "x\\\\\\':texto --",
    "%\\':texto",
    "_\\':texto",
    '\u0000ab',
  ];

  it('ninguna búsqueda, ni con SQL hostil, cambia la tabla productos', async () => {
    await crear(...EJEMPLOS);
    const foto = () => Producto.findAll({ raw: true, order: [['id', 'ASC']] });
    const antes = await foto();
    for (const texto of [...HOSTILES, 'lech', '7501055300075', '50%']) {
      const respuesta = await buscar(texto);
      expect(respuesta.status, `${texto} -> ${respuesta.text}`).toBe(200);
    }
    expect(await foto()).toEqual(antes);
  });

  it('las consultas que corre son solo SELECT', async () => {
    await crear(LECHE);
    const consultas = vi.spyOn(sequelize, 'query');
    await buscar('lech');
    await buscar(HOSTILES[0]);
    const sentencias = consultas.mock.calls.map(([sql]) =>
      typeof sql === 'string' ? sql : sql.query,
    );
    expect(sentencias.length).toBeGreaterThan(0);
    for (const sentencia of sentencias) expect(sentencia).toMatch(/^\s*SELECT\b/i);
  });

  it.each(HOSTILES)(
    'el texto hostil %j responde 200 con la lista vacía y no devuelve todos los productos',
    async (texto) => {
      await crear(...EJEMPLOS);
      const respuesta = await buscar(texto);
      expect(respuesta.status, respuesta.text).toBe(200);
      expect(respuesta.body).toEqual([]);
    },
  );

  it('un texto con comilla y con el nombre del parámetro (:texto) se busca tal cual y encuentra su producto', async () => {
    await crear({ nombre: "O'Brien :texto", codigoBarras: 'OB-1', precio: '9.00' }, ...EJEMPLOS);
    for (const texto of ["'brien :texto", "O'Brien :texto", 'n :texto']) {
      const respuesta = await buscar(texto);
      expect(respuesta.status, `${texto} -> ${respuesta.text}`).toBe(200);
      expect(nombresDe(respuesta), texto).toEqual(["O'Brien :texto"]);
    }
  });

  it('los símbolos de los parámetros con nombre y de posición se buscan como texto normal', async () => {
    await crear(
      { nombre: 'Oferta :texto', codigoBarras: 'S1', precio: '1.00' },
      { nombre: 'Oferta ?', codigoBarras: 'S2', precio: '1.00' },
      { nombre: 'Oferta $1', codigoBarras: 'S3', precio: '1.00' },
      LECHE,
    );
    const casos = [
      [':texto', 'Oferta :texto'],
      ['a ?', 'Oferta ?'],
      ['$1', 'Oferta $1'],
    ];
    for (const [texto, nombre] of casos) {
      const respuesta = await buscar(texto);
      expect(respuesta.status, `${texto} -> ${respuesta.text}`).toBe(200);
      expect(nombresDe(respuesta), texto).toEqual([nombre]);
    }
  });
});
