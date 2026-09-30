import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ErrorApi = require('../../src/errors/ErrorApi.js');
const { validarProductoNuevo } = require('../../src/validators/productos.js');

// El validador de crear producto (spec de crear producto, "Validación"): revisa todo antes de tocar la base
// de datos, junta todos los campos con problema, y devuelve los datos limpios. No necesita MySQL.
const MENSAJE_DEL_400 = 'Los datos del producto no son válidos. Revisa los campos marcados.';
const valido = { nombre: 'Leche entera 1 L', precio: '25.00', codigoBarras: '7501055300075' };

// Corre el validador y devuelve lo que lanzó (o undefined si no lanzó nada).
function errorDe(cuerpo) {
  try {
    validarProductoNuevo(cuerpo);
  } catch (err) {
    return err;
  }
  return undefined;
}

const detallesDe = (cuerpo) => errorDe(cuerpo)?.detalles;
const OBLIGATORIOS = [
  { campo: 'nombre', mensaje: 'Es obligatorio.' },
  { campo: 'precio', mensaje: 'Es obligatorio.' },
  { campo: 'codigoBarras', mensaje: 'Es obligatorio.' },
];

describe('un producto válido', () => {
  it('devuelve solo el nombre, el precio y el código de barras', () => {
    expect(validarProductoNuevo(valido)).toEqual(valido);
    expect(Object.keys(validarProductoNuevo(valido))).toEqual(['nombre', 'precio', 'codigoBarras']);
  });

  it('quita los espacios de los extremos del nombre y del código de barras, y no toca el precio', () => {
    const limpio = validarProductoNuevo({
      nombre: '  Leche  ',
      precio: '25',
      codigoBarras: ' 0012 ',
    });
    expect(limpio).toEqual({ nombre: 'Leche', precio: '25', codigoBarras: '0012' });
  });

  it('conserva los ceros de la izquierda del código de barras', () => {
    expect(validarProductoNuevo({ ...valido, codigoBarras: '0012345' }).codigoBarras).toBe(
      '0012345',
    );
  });

  it('ignora los campos que sobran: el id lo pone MySQL', () => {
    const limpio = validarProductoNuevo({ ...valido, id: 99, precioAplicado: '1.00', otro: true });
    expect(limpio).toEqual(valido);
  });

  it('no formatea el dinero: "25" sigue siendo "25" (el 25.00 lo devuelve MySQL)', () => {
    expect(validarProductoNuevo({ ...valido, precio: '25' }).precio).toBe('25');
  });

  it('no cambia el cuerpo que recibe', () => {
    const cuerpo = { nombre: '  Leche  ', precio: '25', codigoBarras: ' 0012 ', id: 3 };
    const copia = structuredClone(cuerpo);
    validarProductoNuevo(cuerpo);
    expect(cuerpo).toEqual(copia);
  });

  it('acepta el precio más chico y el más grande', () => {
    expect(validarProductoNuevo({ ...valido, precio: '0.01' }).precio).toBe('0.01');
    expect(validarProductoNuevo({ ...valido, precio: '99999.99' }).precio).toBe('99999.99');
  });
});

describe('un producto inválido lanza un 400 con el formato de error', () => {
  it('es un ErrorApi 400 DATOS_INVALIDOS con el mensaje del producto', () => {
    const err = errorDe({});
    expect(err).toBeInstanceOf(ErrorApi);
    expect(err).toMatchObject({ estado: 400, codigo: 'DATOS_INVALIDOS' });
    expect(err.message).toBe(MENSAJE_DEL_400);
  });

  it('el mensaje es siempre el mismo, sea cual sea el campo con problema', () => {
    expect(errorDe({ ...valido, precio: '10.999' }).message).toBe(MENSAJE_DEL_400);
    expect(errorDe({ ...valido, nombre: 5 }).message).toBe(MENSAJE_DEL_400);
  });

  it('un cuerpo vacío marca los tres campos como obligatorios, en el orden nombre, precio y código de barras', () => {
    expect(detallesDe({})).toEqual(OBLIGATORIOS);
  });

  it.each([
    ['falta (undefined)', undefined],
    ['es null', null],
    ['es un arreglo', []],
    ['es un arreglo con un objeto', [valido]],
    ['es un texto', 'nombre=Pan'],
    ['es un número', 5],
    ['es un booleano', true],
  ])(
    'un cuerpo que %s se trata como un cuerpo vacío, no como un error de JavaScript',
    (_caso, cuerpo) => {
      expect(detallesDe(cuerpo)).toEqual(OBLIGATORIOS);
    },
  );

  it('junta todos los campos con problema, no solo el primero', () => {
    expect(detallesDe({ nombre: '', precio: '10.999', codigoBarras: 5 })).toEqual([
      { campo: 'nombre', mensaje: 'Es obligatorio.' },
      { campo: 'precio', mensaje: 'No puede tener más de 2 decimales.' },
      { campo: 'codigoBarras', mensaje: 'Debe ser un texto.' },
    ]);
  });

  it('solo trae los campos con problema', () => {
    expect(detallesDe({ ...valido, precio: '-5' })).toEqual([
      { campo: 'precio', mensaje: 'Debe ser un número con punto decimal, por ejemplo 25.50.' },
    ]);
  });

  it('siempre va en el orden nombre, precio y código de barras, aunque el cuerpo lo escriba al revés', () => {
    const alReves = { codigoBarras: '', precio: 'abc', nombre: '' };
    expect(detallesDe(alReves).map((detalle) => detalle.campo)).toEqual([
      'nombre',
      'precio',
      'codigoBarras',
    ]);
  });

  it('cada campo dice solo su primer problema', () => {
    expect(detallesDe({ ...valido, precio: '100000.999' })).toEqual([
      { campo: 'precio', mensaje: 'No puede tener más de 2 decimales.' },
    ]);
  });
});

// RN-01 y RN-04: los dos textos siguen las mismas reglas y solo cambia el largo máximo.
describe.each([
  ['nombre', 120],
  ['codigoBarras', 50],
])('el campo %s (texto de hasta %i caracteres)', (campo, maximo) => {
  const con = (valor) => ({ ...valido, [campo]: valor });
  const unDetalle = (mensaje) => [{ campo, mensaje }];

  it.each([
    ['falta', undefined],
    ['es null', null],
    ['es un texto vacío', ''],
    ['solo tiene espacios', '    '],
    ['solo tiene tabuladores y saltos de línea', '\t\r\n'],
    ['solo tiene un espacio no separable', ' '],
  ])('%s: es obligatorio', (_caso, valor) => {
    const cuerpo = con(valor);
    if (valor === undefined) delete cuerpo[campo];
    expect(detallesDe(cuerpo)).toEqual(unDetalle('Es obligatorio.'));
  });

  it.each([
    ['un número', 7501055300075],
    ['un objeto', { texto: 'Pan' }],
    ['un arreglo', ['Pan']],
    ['un booleano', false],
  ])('si es %s, debe ser un texto', (_caso, valor) => {
    expect(detallesDe(con(valor))).toEqual(unDetalle('Debe ser un texto.'));
  });

  it(`acepta ${maximo} caracteres y rechaza ${maximo + 1}`, () => {
    expect(detallesDe(con('a'.repeat(maximo)))).toBeUndefined();
    expect(detallesDe(con('a'.repeat(maximo + 1)))).toEqual(
      unDetalle(`No puede pasar de ${maximo} caracteres.`),
    );
  });

  it('cuenta el largo en caracteres: un emoji cuenta 1', () => {
    expect(detallesDe(con('😀'.repeat(maximo)))).toBeUndefined();
    expect(detallesDe(con('😀'.repeat(maximo + 1)))).toEqual(
      unDetalle(`No puede pasar de ${maximo} caracteres.`),
    );
  });

  it('cuenta el largo después de quitar los espacios de los extremos', () => {
    expect(validarProductoNuevo(con(`  ${'a'.repeat(maximo)}  `))[campo]).toBe('a'.repeat(maximo));
  });

  it('recorta con trim() de JavaScript: el espacio no separable y el tabulador también salen', () => {
    expect(validarProductoNuevo(con('  Pan\t'))[campo]).toBe('Pan');
  });

  it('guarda los espacios de en medio tal cual', () => {
    expect(validarProductoNuevo(con('A  B C'))[campo]).toBe('A  B C');
  });
});

// RN-02: la tabla de mensajes del precio, en el orden en que se revisa.
describe('el campo precio (texto con punto decimal, mayor que 0 y hasta 99999.99)', () => {
  const conPrecio = (precio) => ({ ...valido, precio });
  const unDetalle = (mensaje) => [{ campo: 'precio', mensaje }];

  it('falta o es null o es un texto vacío: es obligatorio', () => {
    expect(detallesDe({ nombre: valido.nombre, codigoBarras: valido.codigoBarras })).toEqual(
      unDetalle('Es obligatorio.'),
    );
    expect(detallesDe(conPrecio(null))).toEqual(unDetalle('Es obligatorio.'));
    expect(detallesDe(conPrecio(''))).toEqual(unDetalle('Es obligatorio.'));
  });

  it.each([25.5, 25, 0, true, ['25.00'], { valor: '25.00' }])(
    'si es %j (no es un texto), debe enviarse como texto',
    (precio) => {
      expect(detallesDe(conPrecio(precio))).toEqual(
        unDetalle('Debe enviarse como texto, por ejemplo "25.50".'),
      );
    },
  );

  it.each(['abc', '-5', '1,5', '.5', '1e3', ' 25', '25 ', '1 000', ' '])(
    '"%s" no son solo dígitos con un punto opcional',
    (precio) => {
      expect(detallesDe(conPrecio(precio))).toEqual(
        unDetalle('Debe ser un número con punto decimal, por ejemplo 25.50.'),
      );
    },
  );

  it.each(['10.999', '0.001', '25.500'])('"%s" tiene más de 2 decimales', (precio) => {
    expect(detallesDe(conPrecio(precio))).toEqual(unDetalle('No puede tener más de 2 decimales.'));
  });

  it.each(['100000', '100000.00', '123456.7'])('"%s" tiene más de 5 dígitos enteros', (precio) => {
    expect(detallesDe(conPrecio(precio))).toEqual(unDetalle('No puede ser mayor que 99999.99.'));
  });

  it.each(['0', '0.0', '0.00'])('"%s" vale 0: tiene que ser mayor que 0', (precio) => {
    expect(detallesDe(conPrecio(precio))).toEqual(unDetalle('Debe ser mayor que 0.'));
  });

  it.each(['25', '25.5', '25.50', '0.01', '99999.99', '0.10', '1'])('"%s" vale', (precio) => {
    expect(validarProductoNuevo(conPrecio(precio)).precio).toBe(precio);
  });
});
