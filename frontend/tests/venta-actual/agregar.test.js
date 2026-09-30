// Spec armar-venta-actual, "agregarAVentaActual (V-04)" y criterios 1, 2, 11, 13 y 14 de V-04: agregar a la venta actual
// un producto que eligió el cajero en la búsqueda. Si ya está, sube su cantidad en 1 (RN-07). Con la cantidad en 999 o con
// 100 detalles (RN-14) no cambia nada y devuelve la misma venta. Son funciones puras: la venta actual llega congelada
// (Object.freeze en todos los niveles) y, si la función intenta modificarla, lanza un error y la prueba falla.
import { describe, it, expect } from 'vitest';
import { formatearCentavos } from '../../src/dinero.js';
import {
  agregarAVentaActual,
  calcularSubtotal,
  calcularTotal,
  vaciarVentaActual,
} from '../../src/ventaActual/ventaActual.js';

const congelar = (valor) => {
  Object.values(valor).forEach(
    (hijo) => typeof hijo === 'object' && hijo !== null && congelar(hijo),
  );
  return Object.freeze(valor);
};

// Los productos son como los devuelve la búsqueda de la API: el dinero va como texto.
const leche = { id: 1, nombre: 'Leche entera 1 L', codigoBarras: '7501055300075', precio: '25.00' };
const pan = { id: 2, nombre: 'Pan de caja', codigoBarras: '7501000111206', precio: '3.50' };

const detalle = (producto, cantidad = 1, precioAplicado = producto.precio) => ({
  productoId: producto.id,
  nombre: producto.nombre,
  precioAplicado,
  cantidad,
});
const venta = (...detalles) => ({ detalles, errores: {} });

// Una venta actual con `cuantos` productos distintos, cada uno con cantidad 1.
const ventaConDetalles = (cuantos, cantidad = 1) =>
  venta(
    ...Array.from({ length: cuantos }, (_, i) =>
      detalle({ id: i + 1, nombre: `Producto ${i + 1}`, precio: '1.00' }, cantidad),
    ),
  );

describe('agregarAVentaActual: un producto que no está', () => {
  it('criterio 1: con la venta actual vacía crea un detalle con cantidad 1 y subtotal 25.00', () => {
    const nueva = agregarAVentaActual(vaciarVentaActual(), leche);
    expect(nueva.detalles).toEqual([
      { productoId: 1, nombre: 'Leche entera 1 L', precioAplicado: '25.00', cantidad: 1 },
    ]);
    expect(formatearCentavos(calcularSubtotal(nueva.detalles[0]))).toBe('25.00');
    expect(formatearCentavos(calcularTotal(nueva))).toBe('25.00');
  });

  it('el detalle tiene solo productoId, nombre, precioAplicado y cantidad: ni el código de barras ni el precio', () => {
    const [nuevo] = agregarAVentaActual(vaciarVentaActual(), leche).detalles;
    expect(Object.keys(nuevo).sort()).toEqual([
      'cantidad',
      'nombre',
      'precioAplicado',
      'productoId',
    ]);
  });

  it('el precio aplicado empieza igual al precio del producto (RN-05), con 2 decimales', () => {
    const conPrecio = (precio) =>
      agregarAVentaActual(vaciarVentaActual(), { ...pan, precio }).detalles[0].precioAplicado;
    expect(conPrecio('3.50')).toBe('3.50');
    expect(conPrecio('3.5')).toBe('3.50');
    expect(conPrecio('3')).toBe('3.00');
    expect(conPrecio('0.00')).toBe('0.00');
    expect(conPrecio('99999.99')).toBe('99999.99');
  });

  it('lo agrega al final: los detalles van en el orden en que se agregaron los productos', () => {
    const nueva = agregarAVentaActual(agregarAVentaActual(vaciarVentaActual(), leche), pan);
    expect(nueva.detalles.map((d) => d.productoId)).toEqual([1, 2]);
  });

  it('devuelve una venta actual nueva: no es la que recibió ni comparte su lista de detalles', () => {
    const original = vaciarVentaActual();
    const nueva = agregarAVentaActual(original, leche);
    expect(nueva).not.toBe(original);
    expect(nueva.detalles).not.toBe(original.detalles);
    expect(original).toEqual({ detalles: [], errores: {} });
  });

  it('deja los errores como estaban', () => {
    const errores = { 2: { precioAplicado: 'Escribe un precio aplicado.' } };
    const nueva = agregarAVentaActual({ detalles: [detalle(pan)], errores }, leche);
    expect(nueva.errores).toEqual(errores);
  });
});

describe('agregarAVentaActual: un producto que ya está (RN-07)', () => {
  it('criterio 2: sigue un solo detalle de leche, ahora con cantidad 2', () => {
    const nueva = agregarAVentaActual(agregarAVentaActual(vaciarVentaActual(), leche), leche);
    expect(nueva.detalles).toHaveLength(1);
    expect(nueva.detalles[0]).toEqual(detalle(leche, 2));
  });

  it('sube la cantidad en 1 cada vez, hasta 999', () => {
    let actual = venta(detalle(leche, 997));
    actual = agregarAVentaActual(actual, leche);
    expect(actual.detalles[0].cantidad).toBe(998);
    actual = agregarAVentaActual(actual, leche);
    expect(actual.detalles[0].cantidad).toBe(999);
  });

  it('deja igual el precio aplicado aunque el cajero lo haya cambiado', () => {
    const nueva = agregarAVentaActual(venta(detalle(leche, 1, '22.00')), leche);
    expect(nueva.detalles[0].precioAplicado).toBe('22.00');
    expect(nueva.detalles[0].cantidad).toBe(2);
  });

  it('deja el detalle en su lugar y no toca los demás', () => {
    const nueva = agregarAVentaActual(venta(detalle(leche), detalle(pan, 3)), leche);
    expect(nueva.detalles).toEqual([detalle(leche, 2), detalle(pan, 3)]);
  });

  it('el total se recalcula: 2 leches a 22.00 y 1 pan a 3.50 suman 47.50', () => {
    const actual = venta(detalle(leche, 1, '22.00'), detalle(pan, 1));
    const nueva = agregarAVentaActual(actual, leche);
    expect(formatearCentavos(calcularTotal(nueva))).toBe('47.50');
  });

  it('si el detalle tenía un error de cantidad escrito, sube la cantidad válida y quita ese error', () => {
    const actual = {
      detalles: [detalle(leche, 2), detalle(pan)],
      errores: { 1: { cantidad: 'La cantidad debe ser un número entero de 1 a 999.' } },
    };
    const nueva = agregarAVentaActual(actual, leche);
    expect(nueva.detalles[0].cantidad).toBe(3);
    expect(nueva.errores).toEqual({});
  });

  it('quita solo el error de cantidad: el del precio aplicado y los de otros detalles se quedan', () => {
    const errorDePrecio = 'Escribe un precio aplicado.';
    const errorDeOtro = 'La cantidad debe ser un número entero de 1 a 999.';
    const actual = {
      detalles: [detalle(leche), detalle(pan)],
      errores: {
        1: { precioAplicado: errorDePrecio, cantidad: 'x' },
        2: { cantidad: errorDeOtro },
      },
    };
    const { errores } = agregarAVentaActual(actual, leche);
    expect(errores).toEqual({ 1: { precioAplicado: errorDePrecio }, 2: { cantidad: errorDeOtro } });
  });
});

describe('agregarAVentaActual: los límites devuelven la misma venta', () => {
  it('criterio 11: con la cantidad en 999 no la sube y devuelve la misma venta', () => {
    const actual = venta(detalle(leche, 999));
    const nueva = agregarAVentaActual(actual, leche);
    expect(nueva).toBe(actual);
    expect(nueva.detalles[0].cantidad).toBe(999);
  });

  it('criterio 14 (RN-14): con 100 detalles no agrega un producto que no está y devuelve la misma venta', () => {
    const actual = ventaConDetalles(100);
    const nueva = agregarAVentaActual(actual, leche);
    expect(nueva).toBe(actual);
    expect(nueva.detalles).toHaveLength(100);
  });

  it('con 99 detalles agrega el 100', () => {
    const nueva = agregarAVentaActual(ventaConDetalles(99), leche);
    expect(nueva.detalles).toHaveLength(100);
    expect(nueva.detalles[99].productoId).toBe(1);
  });

  it('con 100 detalles sí sube la cantidad de un producto que ya está (no agrega otro detalle)', () => {
    const actual = ventaConDetalles(100);
    const nueva = agregarAVentaActual(actual, { id: 7, nombre: 'Producto 7', precio: '1.00' });
    expect(nueva).not.toBe(actual);
    expect(nueva.detalles).toHaveLength(100);
    expect(nueva.detalles[6].cantidad).toBe(2);
  });

  it('con 100 detalles y uno de ellos en 999, ese producto devuelve la misma venta', () => {
    const actual = ventaConDetalles(100, 999);
    expect(agregarAVentaActual(actual, { id: 100, nombre: 'Producto 100', precio: '1.00' })).toBe(
      actual,
    );
  });

  it('con la cantidad en 999 conserva un error de cantidad escrito: la venta no cambia', () => {
    const actual = { detalles: [detalle(leche, 999)], errores: { 1: { cantidad: 'x' } } };
    expect(agregarAVentaActual(actual, leche)).toBe(actual);
  });
});

// Un producto mal formado no es un caso del cajero sino un fallo de programación: la búsqueda siempre entrega el id
// entero, el nombre y el precio como texto con la forma del dinero (RN-02 y RN-05).
describe('agregarAVentaActual: un producto mal formado lanza un Error', () => {
  const conCampo = (campo, valor) => ({ ...leche, [campo]: valor });
  const casos = [
    ['sin id', conCampo('id', undefined)],
    ['con id 0', conCampo('id', 0)],
    ['con id negativo', conCampo('id', -1)],
    ['con id decimal', conCampo('id', 1.5)],
    ['con id de texto', conCampo('id', '1')],
    ['con id NaN', conCampo('id', NaN)],
    ['sin nombre', conCampo('nombre', undefined)],
    ['con nombre vacío', conCampo('nombre', '')],
    ['con nombre que no es texto', conCampo('nombre', 5)],
    ['con nombre de 121 caracteres', conCampo('nombre', 'a'.repeat(121))],
    ['sin precio', conCampo('precio', undefined)],
    ['con precio número', conCampo('precio', 25)],
    ['con precio null', conCampo('precio', null)],
    ['con precio vacío', conCampo('precio', '')],
    ['con precio de 3 decimales', conCampo('precio', '25.123')],
    ['con precio negativo', conCampo('precio', '-1')],
    ['con precio de letras', conCampo('precio', 'abc')],
    ['con precio de 6 enteros', conCampo('precio', '100000')],
    ['con precio en notación científica', conCampo('precio', '1e3')],
    ['con precio con coma', conCampo('precio', '25,50')],
    ['con precio con espacios', conCampo('precio', ' 25.00 ')],
    ['con precio sin decimales después del punto', conCampo('precio', '25.')],
  ];

  it.each(casos)('un producto %s', (_nombre, producto) => {
    expect(() => agregarAVentaActual(vaciarVentaActual(), producto)).toThrow(Error);
  });

  it('un producto null o undefined también', () => {
    expect(() => agregarAVentaActual(vaciarVentaActual(), null)).toThrow(Error);
    expect(() => agregarAVentaActual(vaciarVentaActual(), undefined)).toThrow(Error);
  });

  it('valida el producto aunque la venta actual ya esté en un límite', () => {
    expect(() => agregarAVentaActual(ventaConDetalles(100), conCampo('precio', 'abc'))).toThrow(
      Error,
    );
  });

  it('un nombre de 120 caracteres es válido, y se cuentan como los cuenta la API (un emoji es 1)', () => {
    expect(() =>
      agregarAVentaActual(vaciarVentaActual(), conCampo('nombre', 'a'.repeat(120))),
    ).not.toThrow();
    expect(() =>
      agregarAVentaActual(vaciarVentaActual(), conCampo('nombre', '🥛'.repeat(120))),
    ).not.toThrow();
    expect(() =>
      agregarAVentaActual(vaciarVentaActual(), conCampo('nombre', '🥛'.repeat(121))),
    ).toThrow(Error);
  });
});

describe('agregarAVentaActual: no modifica lo que recibe (criterio 13) ni toca el producto (RN-05)', () => {
  it('con la venta actual y el producto congelados no lanza y deja todo como estaba', () => {
    const actual = congelar(venta(detalle(pan, 2, '3.00')));
    const producto = congelar({ ...leche });
    expect(() => agregarAVentaActual(actual, producto)).not.toThrow();
    expect(() => agregarAVentaActual(actual, pan)).not.toThrow();
    expect(actual).toEqual(venta(detalle(pan, 2, '3.00')));
    expect(producto).toEqual(leche);
  });

  it('el precio aplicado del detalle es una copia: el precio del producto sigue siendo el de MySQL', () => {
    const producto = { ...leche };
    const nueva = agregarAVentaActual(vaciarVentaActual(), producto);
    expect(nueva.detalles[0]).not.toBe(producto);
    expect(producto.precio).toBe('25.00');
  });

  it('agregar dos veces seguidas no deja detalles repetidos de un mismo producto (RN-07)', () => {
    let actual = vaciarVentaActual();
    for (const producto of [leche, pan, leche, leche, pan])
      actual = agregarAVentaActual(actual, producto);
    expect(actual.detalles.map((d) => [d.productoId, d.cantidad])).toEqual([
      [1, 3],
      [2, 2],
    ]);
  });
});
