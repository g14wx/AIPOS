import { describe, it, expect } from 'vitest';
import { conTransaccionDescartada, errorDeMySQL, insertarProducto } from './ayudas-productos.js';

// Necesita MySQL levantado y la base de prueba migrada (npm run migrar:prueba).
// Prueba lo que MySQL protege por sí solo, sin la API ni la pantalla (RNF-03): NOT NULL, los largos,
// los CHECK y el índice único de la tabla productos. Cada prueba corre en una transacción que se descarta.
const ER_BAD_NULL_ERROR = 1048;
const ER_DUP_ENTRY = 1062;
const ER_NO_DEFAULT_FOR_FIELD = 1364;
const ER_DATA_TOO_LONG = 1406;
const ER_CHECK_CONSTRAINT_VIOLATED = 3819;

const valido = { nombre: 'Leche entera 1 L', precio: '25.00', codigoBarras: '7501055300075' };

// Intenta guardar el producto válido con los campos que se cambian y devuelve el error de MySQL (o null).
function guardar(consultar, campos) {
  return errorDeMySQL(insertarProducto(consultar, { ...valido, ...campos }));
}

describe('el índice único de codigo_barras (RN-03)', () => {
  it('rechaza un código de barras repetido con el error 1062 y el nombre del índice', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      await insertarProducto(consultar, valido);
      const error = await guardar(consultar, { nombre: 'Otra leche', precio: '20.00' });
      expect(error?.errno).toBe(ER_DUP_ENTRY);
      expect(error.mensaje).toContain('uq_productos_codigo_barras');
    });
  });

  it('el producto que ya estaba no cambia', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      await insertarProducto(consultar, valido);
      await guardar(consultar, { nombre: 'Otra leche', precio: '20.00' });
      const filas = await consultar(
        'SELECT nombre, precio FROM productos WHERE codigo_barras = :c',
        {
          c: valido.codigoBarras,
        },
      );
      expect(filas).toEqual([{ nombre: 'Leche entera 1 L', precio: '25.00' }]);
    });
  });

  it.each([
    ['ABC-1', 'abc-1'],
    ['CAFÉ-1', 'cafe-1'],
  ])(
    'no distingue mayúsculas ni tildes: "%s" y "%s" son el mismo código de barras',
    async (uno, otro) => {
      await conTransaccionDescartada(async ({ consultar }) => {
        await insertarProducto(consultar, { ...valido, codigoBarras: uno });
        const error = await guardar(consultar, { codigoBarras: otro });
        expect(error?.errno).toBe(ER_DUP_ENTRY);
      });
    },
  );

  it('solo el código de barras es único: dos productos pueden tener el mismo nombre', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      await insertarProducto(consultar, valido);
      expect(await guardar(consultar, { codigoBarras: '7501055300099' })).toBeNull();
    });
  });
});

describe('el CHECK chk_productos_precio (RN-02)', () => {
  it.each(['0', '0.00', '-1', '-0.01', '100000', '100000.00', '99999.995', '0.001'])(
    'rechaza el precio %s con el error 3819',
    async (precio) => {
      await conTransaccionDescartada(async ({ consultar }) => {
        const error = await guardar(consultar, { precio });
        expect(error?.errno).toBe(ER_CHECK_CONSTRAINT_VIOLATED);
        expect(error.mensaje).toContain('chk_productos_precio');
      });
    },
  );

  it.each([
    ['0.01', '0.01'],
    ['1', '1.00'],
    ['25.5', '25.50'],
    ['99999.99', '99999.99'],
  ])('acepta el precio %s y lo guarda como "%s"', async (precio, guardado) => {
    await conTransaccionDescartada(async ({ consultar }) => {
      expect(await guardar(consultar, { precio })).toBeNull();
      const [fila] = await consultar('SELECT precio FROM productos WHERE codigo_barras = :c', {
        c: valido.codigoBarras,
      });
      expect(fila.precio).toBe(guardado);
    });
  });

  it('con 3 decimales MySQL no da error: redondea 10.999 a 11.00 (por eso la API lo rechaza antes)', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      expect(await guardar(consultar, { precio: '10.999' })).toBeNull();
      const [fila] = await consultar('SELECT precio FROM productos WHERE codigo_barras = :c', {
        c: valido.codigoBarras,
      });
      expect(fila.precio).toBe('11.00');
    });
  });
});

const textosInvalidos = [
  ['vacío', ''],
  ['solo espacios', '   '],
  ['con un espacio al inicio', ' Pan'],
  ['con un espacio al final', 'Pan '],
  ['con espacios en los dos extremos', '  Pan  '],
];

describe.each([
  ['nombre', 'chk_productos_nombre'],
  ['codigoBarras', 'chk_productos_codigo_barras'],
])('el CHECK del campo %s (RN-04)', (campo, restriccion) => {
  it.each(textosInvalidos)('lo rechaza %s con el error 3819', async (_caso, texto) => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const error = await guardar(consultar, { [campo]: texto });
      expect(error?.errno).toBe(ER_CHECK_CONSTRAINT_VIOLATED);
      expect(error.mensaje).toContain(restriccion);
    });
  });

  it('acepta espacios en medio del texto', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      expect(await guardar(consultar, { [campo]: 'A B  C' })).toBeNull();
    });
  });
});

describe('NOT NULL (RN-01)', () => {
  const columnas = [
    ['nombre', 'nombre'],
    ['precio', 'precio'],
    ['codigo_barras', 'codigoBarras'],
  ];

  it.each(columnas)('%s: un NULL explícito da el error 1048', async (columna, campo) => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const error = await guardar(consultar, { [campo]: null });
      expect(error?.errno).toBe(ER_BAD_NULL_ERROR);
      expect(error.mensaje).toContain(`'${columna}'`);
    });
  });

  it.each(columnas)('%s: si el INSERT no la trae, da el error 1364', async (columna) => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const datos = { nombre: 'Pan', precio: '1.00', codigo_barras: 'FALTA-1' };
      const presentes = Object.keys(datos).filter((nombre) => nombre !== columna);
      const sql = `INSERT INTO productos (${presentes.join(', ')}) VALUES (${presentes.map((nombre) => `:${nombre}`).join(', ')})`;
      const error = await errorDeMySQL(consultar(sql, datos));
      expect(error?.errno).toBe(ER_NO_DEFAULT_FOR_FIELD);
      expect(error.mensaje).toContain(`'${columna}'`);
    });
  });
});

describe('los largos (RN-04)', () => {
  it('acepta un nombre de 120 caracteres y un código de barras de 50', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const error = await guardar(consultar, {
        nombre: 'a'.repeat(120),
        codigoBarras: '9'.repeat(50),
      });
      expect(error).toBeNull();
    });
  });

  it('rechaza un nombre de 121 caracteres con el error 1406', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const error = await guardar(consultar, { nombre: 'a'.repeat(121) });
      expect(error?.errno).toBe(ER_DATA_TOO_LONG);
      expect(error.mensaje).toContain("'nombre'");
    });
  });

  it('rechaza un código de barras de 51 caracteres con el error 1406', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const error = await guardar(consultar, { codigoBarras: '9'.repeat(51) });
      expect(error?.errno).toBe(ER_DATA_TOO_LONG);
      expect(error.mensaje).toContain("'codigo_barras'");
    });
  });

  it('cuenta caracteres y no bytes: 120 emojis caben y 121 no', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      expect(await guardar(consultar, { nombre: '😀'.repeat(120) })).toBeNull();
    });
    await conTransaccionDescartada(async ({ consultar }) => {
      const error = await guardar(consultar, { nombre: '😀'.repeat(121) });
      expect(error?.errno).toBe(ER_DATA_TOO_LONG);
    });
  });
});

describe('lo que se guarda es lo que se lee', () => {
  it('el precio 25.00 conserva sus centavos y el código de barras 0012345 conserva sus ceros', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      await insertarProducto(consultar, {
        nombre: 'Pan',
        precio: '25.00',
        codigoBarras: '0012345',
      });
      const [fila] = await consultar(
        'SELECT precio, codigo_barras FROM productos WHERE codigo_barras = :c',
        { c: '0012345' },
      );
      expect(fila).toEqual({ precio: '25.00', codigo_barras: '0012345' });
      expect(typeof fila.precio).toBe('string');
    });
  });

  it('el id se llena solo con un entero que sube', async () => {
    await conTransaccionDescartada(async ({ consultar }) => {
      const primero = await insertarProducto(consultar, valido);
      const segundo = await insertarProducto(consultar, { ...valido, codigoBarras: 'OTRO-1' });
      expect(Number.isInteger(primero)).toBe(true);
      expect(segundo).toBeGreaterThan(primero);
    });
  });
});
