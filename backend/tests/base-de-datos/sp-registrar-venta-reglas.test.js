import { describe, it, expect } from 'vitest';
import {
  ER_INVALID_JSON_TEXT,
  ER_SIGNAL_EXCEPTION,
  consultar,
  crearProductos,
  errorDe,
  prepararPrueba,
} from './ayudas-sp-registrar-venta.js';

// Necesita MySQL levantado y la base de prueba migrada (npm run migrar:prueba), que crea sp_registrar_venta.
// Prueba las reglas que el procedimiento revisa aunque no lo llame la API (spec registrar-venta, tabla "Código
// en MESSAGE_TEXT"): cada una responde con SQLSTATE 45000 (error 1644) y su código como texto del error, y no
// deja nada guardado. La cuenta de filas se hace en la misma sesión que hizo la llamada: si faltara el
// ROLLBACK, esa sesión vería las filas sin confirmar.
const contexto = prepararPrueba({ productos: 3 });

// Un detalle válido. JSON.stringify no escribe las propiedades con valor `undefined`: así un caso "sin campo"
// se escribe con `undefined`.
const detalle = (productoId, cambios = {}) => ({
  productoId,
  cantidad: 2,
  precioAplicado: '22.00',
  ...cambios,
});
const conCantidad = (cantidad) => (ids) => [detalle(ids[0], { cantidad })];
const conPrecio = (precioAplicado) => (ids) => [detalle(ids[0], { precioAplicado })];

// Lo que JavaScript no puede escribir (un 3.0 o un 1e2) va como texto JSON tal cual. `crudo(null)` es un NULL
// de SQL, y `crudo('null')` es un null de JSON.
const crudo = (texto) => ({ crudo: texto });
const serializar = (valor) => (valor?.crudo !== undefined ? valor.crudo : JSON.stringify(valor));
const crudoConCantidad = (numero) => (ids) =>
  crudo(`[{"productoId": ${ids[0]}, "cantidad": ${numero}, "precioAplicado": "22.00"}]`);

async function comprobarRechazo(construir, codigo) {
  const textoJson = serializar(construir(contexto.productoIds));
  const antes = await contexto.llamador.contar();
  const error = await errorDe(contexto.llamador.llamarCrudo(textoJson));
  expect(error, 'el procedimiento aceptó la venta').not.toBeNull();
  expect(error).toEqual({ errno: ER_SIGNAL_EXCEPTION, estado: '45000', mensaje: codigo });
  expect(await contexto.llamador.contar(), 'quedó algo guardado').toEqual(antes);
}

// Una prueba por caso: `casos` es una lista de [descripción, construir], y `construir(productoIds)` arma la
// entrada con los ids de los productos de prueba.
function rechaza(codigo, casos) {
  describe(codigo, () => {
    it.each(casos)('%s', (_descripcion, construir) => comprobarRechazo(construir, codigo));
  });
}

rechaza('VENTA_SIN_DETALLES', [
  ['una lista vacía (RN-10)', () => []],
  ['un NULL de SQL', () => crudo(null)],
  ['un null de JSON', () => crudo('null')],
  ['un objeto en vez de un arreglo', (ids) => detalle(ids[0])],
  ['un texto', () => 'lista'],
  ['un número', () => 5],
  ['un booleano', () => true],
]);

const cienUnDetalles = (i) => (i === 100 ? 5 : detalle(1_000_000 + i));
rechaza('DEMASIADOS_DETALLES', [
  ['101 detalles (RN-14)', () => Array.from({ length: 101 }, (_, i) => detalle(1_000_000 + i))],
  ['1000 detalles', () => Array.from({ length: 1000 }, (_, i) => detalle(1_000_000 + i))],
  ['101 elementos que ni son objetos: gana sobre DETALLE_INVALIDO', () => Array(101).fill(5)],
  [
    '101 elementos con el último inválido',
    () => Array.from({ length: 101 }, (_, i) => cienUnDetalles(i)),
  ],
]);

rechaza('DETALLE_INVALIDO', [
  ['un elemento que es un número', () => [5]],
  ['un elemento que es un texto', () => ['leche']],
  ['un elemento que es null', () => [null]],
  ['un elemento que es un arreglo', (ids) => [[ids[0]]]],
  ['un objeto vacío', () => [{}]],
  ['un elemento inválido después de uno válido', (ids) => [detalle(ids[0]), 5]],
  ['sin productoId', () => [detalle(undefined)]],
  ['productoId 0', () => [detalle(0)]],
  ['productoId negativo', () => [detalle(-1)]],
  ['productoId 2147483648, que no cabe en INT', () => [detalle(2147483648)]],
  ['productoId como texto', (ids) => [detalle(String(ids[0]))]],
  ['productoId con decimales (1.5)', () => [detalle(1.5)]],
  [
    'productoId escrito con punto (3.0)',
    () => crudo('[{"productoId": 3.0, "cantidad": 2, "precioAplicado": "22.00"}]'),
  ],
  ['productoId true', () => [detalle(true)]],
  ['productoId null', () => [detalle(null)]],
  ['productoId que es un arreglo', (ids) => [detalle([ids[0]])]],
  ['productoId que es un objeto', () => [detalle({ id: 1 })]],
  ['productoId de 100 dígitos como texto', () => [detalle('1'.repeat(100))]],
  [
    'productoId -0 escrito como número',
    () => crudo('[{"productoId": -0, "cantidad": 2, "precioAplicado": "22.00"}]'),
  ],
  [
    'productoId de 20 dígitos como número',
    () => crudo(`[{"productoId": ${'9'.repeat(20)}, "cantidad": 2, "precioAplicado": "22.00"}]`),
  ],
]);

rechaza('CANTIDAD_FUERA_DE_RANGO', [
  ['sin cantidad', conCantidad(undefined)],
  ['cantidad 0 (RN-06)', conCantidad(0)],
  ['cantidad 1000', conCantidad(1000)],
  ['cantidad negativa', conCantidad(-1)],
  ['cantidad con decimales (1.5)', conCantidad(1.5)],
  ['cantidad escrita con punto (2.0)', crudoConCantidad('2.0')],
  ['cantidad en notación científica (1e2)', crudoConCantidad('1e2')],
  ['cantidad enorme', conCantidad(99999999999)],
  ['cantidad "abc"', conCantidad('abc')],
  ['cantidad vacía', conCantidad('')],
  ['cantidad "1000" como texto', conCantidad('1000')],
  ['cantidad "0000" como texto', conCantidad('0000')],
  ['cantidad "01000" como texto', conCantidad('01000')],
  ['cantidad "1e2" como texto', conCantidad('1e2')],
  ['cantidad "2.0" como texto', conCantidad('2.0')],
  ['cantidad con un espacio antes', conCantidad(' 2')],
  ['cantidad con un espacio después', conCantidad('2 ')],
  ['cantidad con un salto de línea al final', conCantidad('2\n')],
  ['cantidad con signo más', conCantidad('+2')],
  ['cantidad con un dígito de otro alfabeto', conCantidad('٢')],
  ['cantidad true', conCantidad(true)],
  ['cantidad null', conCantidad(null)],
  ['cantidad que es un arreglo', conCantidad([2])],
  ['cantidad que es un objeto', conCantidad({ valor: 2 })],
  ['cantidad de 100 dígitos como texto', conCantidad('1'.repeat(100))],
  ['cantidad -0 escrita como número', crudoConCantidad('-0')],
  ['cantidad de 20 dígitos como número', crudoConCantidad('9'.repeat(20))],
]);

rechaza('PRECIO_FUERA_DE_RANGO', [
  ['sin precioAplicado', conPrecio(undefined)],
  ['precio "-1"', conPrecio('-1')],
  ['precio "10.999": no se redondea a 11.00', conPrecio('10.999')],
  ['precio "100000"', conPrecio('100000')],
  ['precio "100000.00"', conPrecio('100000.00')],
  ['precio "abc"', conPrecio('abc')],
  ['precio vacío', conPrecio('')],
  ['precio con un espacio antes', conPrecio(' 10')],
  ['precio con un espacio después', conPrecio('10 ')],
  ['precio con un salto de línea al final', conPrecio('10\n')],
  ['precio con un retorno de carro al final', conPrecio('10\r')],
  ['precio con punto y sin decimales ("10.")', conPrecio('10.')],
  ['precio sin enteros (".5")', conPrecio('.5')],
  ['precio en notación científica como texto', conPrecio('1e2')],
  ['precio con coma decimal', conPrecio('1,5')],
  ['precio "NaN"', conPrecio('NaN')],
  ['precio con dígitos de otro alfabeto', conPrecio('٢٢')],
  ['precio negativo como número', conPrecio(-1)],
  ['precio 100000 como número', conPrecio(100000)],
  ['precio con 3 decimales como número (10.999)', conPrecio(10.999)],
  ['precio 0.001 como número', conPrecio(0.001)],
  ['precio true', conPrecio(true)],
  ['precio null', conPrecio(null)],
  ['precio que es un arreglo', conPrecio([22])],
  ['precio que es un objeto', conPrecio({ valor: 22 })],
  ['precio de 100 dígitos como texto', conPrecio('1'.repeat(100))],
  ['precio "10" seguido de 60 espacios', conPrecio(`10${' '.repeat(60)}`)],
]);

rechaza('PRODUCTO_REPETIDO', [
  ['el mismo producto dos veces seguidas (RN-07)', (ids) => [detalle(ids[0]), detalle(ids[0])]],
  [
    'el mismo producto separado por otro, con otra cantidad y otro precio',
    (ids) => [
      detalle(ids[0]),
      detalle(ids[1]),
      detalle(ids[0], { cantidad: 5, precioAplicado: '1' }),
    ],
  ],
  ['el mismo producto tres veces', (ids) => Array(3).fill(detalle(ids[2]))],
]);

rechaza('PRODUCTO_NO_EXISTE', [
  [
    'un producto que no existe entre productos válidos',
    (ids) => [detalle(ids[0]), detalle(999999999), detalle(ids[1])],
  ],
  ['un solo producto que no existe', () => [detalle(999999999)]],
  ['el productoId más grande que cabe en INT', () => [detalle(2147483647)]],
]);

describe('un producto que existía y se borró', () => {
  it('responde PRODUCTO_NO_EXISTE y no guarda nada', async () => {
    const [borrado] = await crearProductos(1, 'BORRADO');
    await consultar('DELETE FROM productos WHERE id = :borrado', { borrado });
    await comprobarRechazo((ids) => [detalle(ids[0]), detalle(borrado)], 'PRODUCTO_NO_EXISTE');
  });
});

describe('el orden de las reglas: gana la primera que falle', () => {
  it.each([
    [
      'DEMASIADOS_DETALLES gana sobre un detalle inválido',
      () => Array.from({ length: 101 }, (_, i) => cienUnDetalles(i)),
      'DEMASIADOS_DETALLES',
    ],
    [
      'DETALLE_INVALIDO gana sobre la cantidad, el precio, el repetido y el inexistente',
      (ids) => [
        detalle(ids[0], { cantidad: 0 }),
        detalle(ids[0], { precioAplicado: '-1' }),
        detalle(999999999),
        5,
      ],
      'DETALLE_INVALIDO',
    ],
    [
      'CANTIDAD_FUERA_DE_RANGO gana sobre el precio, el repetido y el inexistente, aunque el precio falle antes',
      (ids) => [
        detalle(ids[0], { precioAplicado: '-1' }),
        detalle(ids[0], { cantidad: 0 }),
        detalle(999999999),
      ],
      'CANTIDAD_FUERA_DE_RANGO',
    ],
    [
      'PRECIO_FUERA_DE_RANGO gana sobre el repetido y el inexistente',
      (ids) => [detalle(ids[0]), detalle(ids[0], { precioAplicado: '10.999' }), detalle(999999999)],
      'PRECIO_FUERA_DE_RANGO',
    ],
    [
      'PRODUCTO_REPETIDO gana sobre el inexistente',
      (ids) => [detalle(999999999), detalle(ids[0]), detalle(ids[0])],
      'PRODUCTO_REPETIDO',
    ],
  ])('%s', (_descripcion, construir, codigo) => comprobarRechazo(construir, codigo));
});

describe('un JSON mal escrito', () => {
  it.each([
    ['un texto que no es JSON', 'esto no es json'],
    ['un JSON cortado', '[{"productoId": 1'],
    ['comillas simples en vez de dobles', "[{'productoId': 1}]"],
  ])(
    '%s: MySQL lo rechaza al recibirlo (error 3140), sin llegar a las reglas',
    async (_d, texto) => {
      const antes = await contexto.llamador.contar();
      const error = await errorDe(contexto.llamador.llamarCrudo(texto));
      expect(error?.errno).toBe(ER_INVALID_JSON_TEXT);
      expect(await contexto.llamador.contar()).toEqual(antes);
    },
  );
});

describe('visto desde Sequelize, como lo lee la API', () => {
  it('una regla llega como err.parent con el error 1644, SQLSTATE 45000 y el código en sqlMessage', async () => {
    let capturado;
    try {
      await contexto.llamarComoElServicio([]);
    } catch (error) {
      capturado = error;
    }
    expect(capturado?.parent).toMatchObject({
      errno: ER_SIGNAL_EXCEPTION,
      sqlState: '45000',
      sqlMessage: 'VENTA_SIN_DETALLES',
    });
  });
});
