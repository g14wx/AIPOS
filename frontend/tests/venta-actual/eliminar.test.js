// Spec armar-venta-actual, "eliminarDetalle (V-07)" y criterios 1 y 2 de V-07: eliminar un detalle de la venta actual.
// Quita el detalle con ese productoId, deja los demás en su orden, quita también sus errores y, si era el último, deja la
// venta actual vacía. Un productoId que no está devuelve la misma venta. Son funciones puras: la venta actual llega
// congelada (Object.freeze en todos los niveles) y, si la función intenta modificarla, lanza un error y la prueba falla.
import { describe, it, expect } from 'vitest';
import { formatearCentavos } from '../../src/dinero.js';
import {
  agregarAVentaActual,
  calcularTotal,
  eliminarDetalle,
  vaciarVentaActual,
  ventaActualEsValida,
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
const huevos = { id: 3, nombre: 'Huevos x 12', codigoBarras: '7501000222303', precio: '4.25' };

const detalle = (producto, cantidad = 1, precioAplicado = producto.precio) => ({
  productoId: producto.id,
  nombre: producto.nombre,
  precioAplicado,
  cantidad,
});
const venta = (...detalles) => ({ detalles, errores: {} });
const ids = (actual) => actual.detalles.map((d) => d.productoId);
const total = (actual) => formatearCentavos(calcularTotal(actual));

const errorDeCantidad = 'La cantidad debe ser un número entero de 1 a 999.';
const errorDePrecio = 'Escribe un precio aplicado.';

describe('eliminarDetalle: quita el detalle y deja los demás', () => {
  it('criterio 1: con leche y pan, al eliminar el pan queda la leche y el total se recalcula', () => {
    const actual = congelar(venta(detalle(leche, 2, '22.00'), detalle(pan)));
    expect(total(actual)).toBe('47.50');
    const nueva = eliminarDetalle(actual, pan.id);
    expect(nueva.detalles).toEqual([detalle(leche, 2, '22.00')]);
    expect(total(nueva)).toBe('44.00');
  });

  it('al eliminar la leche queda el pan, con el total del pan', () => {
    const nueva = eliminarDetalle(venta(detalle(leche, 2, '22.00'), detalle(pan)), leche.id);
    expect(nueva.detalles).toEqual([detalle(pan)]);
    expect(total(nueva)).toBe('3.50');
  });

  it('deja los demás detalles en su orden: se elimine el primero, el del medio o el último', () => {
    const tres = () => congelar(venta(detalle(leche), detalle(pan), detalle(huevos)));
    expect(ids(eliminarDetalle(tres(), 1))).toEqual([2, 3]);
    expect(ids(eliminarDetalle(tres(), 2))).toEqual([1, 3]);
    expect(ids(eliminarDetalle(tres(), 3))).toEqual([1, 2]);
  });

  it('los detalles que quedan no cambian: ni su cantidad ni su precio aplicado', () => {
    const nueva = eliminarDetalle(venta(detalle(leche, 7, '22.50'), detalle(pan, 3, '0.00')), 2);
    expect(nueva.detalles).toEqual([detalle(leche, 7, '22.50')]);
  });

  it('elimina un solo detalle: un producto tiene uno solo en la venta actual (RN-07)', () => {
    const actual = venta(detalle(leche, 2), detalle(pan, 2), detalle(huevos, 2));
    expect(eliminarDetalle(actual, 2).detalles).toHaveLength(2);
  });

  it('el total se sigue calculando en centavos: 0.10 × 3 y 0.20 suman 0.50, y sin el segundo dan 0.30', () => {
    const actual = venta(
      detalle({ id: 1, nombre: 'A', precio: '0.10' }, 3),
      detalle({ id: 2, nombre: 'B', precio: '0.20' }),
    );
    expect(total(actual)).toBe('0.50');
    expect(total(eliminarDetalle(actual, 2))).toBe('0.30');
  });

  it('el caso más grande no pierde centavos: dos de 99999.99 × 999 suman 199799980.02, y con uno 99899990.01', () => {
    const grande = (id) => detalle({ id, nombre: `Caro ${id}`, precio: '99999.99' }, 999);
    const actual = venta(grande(1), grande(2));
    expect(total(actual)).toBe('199799980.02');
    expect(total(eliminarDetalle(actual, 1))).toBe('99899990.01');
  });
});

describe('eliminarDetalle: el último detalle', () => {
  it('criterio 2: con un solo detalle, la venta actual queda vacía', () => {
    const nueva = eliminarDetalle(congelar(venta(detalle(leche))), leche.id);
    expect(nueva).toEqual({ detalles: [], errores: {} });
    expect(total(nueva)).toBe('0.00');
    expect(ventaActualEsValida(nueva)).toBe(false);
  });

  it('queda vacía aunque el detalle tuviera errores: sin detalles no hay errores', () => {
    const errores = { 1: { precioAplicado: errorDePrecio, cantidad: errorDeCantidad } };
    const nueva = eliminarDetalle(congelar({ detalles: [detalle(leche)], errores }), leche.id);
    expect(nueva).toEqual({ detalles: [], errores: {} });
  });

  it('es una venta actual vacía nueva cada vez, no un objeto compartido que alguien pueda cambiar', () => {
    const una = eliminarDetalle(venta(detalle(leche)), leche.id);
    const otra = eliminarDetalle(venta(detalle(leche)), leche.id);
    expect(una).not.toBe(otra);
    una.detalles.push(detalle(pan));
    expect(otra.detalles).toEqual([]);
    expect(eliminarDetalle(venta(detalle(leche)), leche.id)).toEqual(vaciarVentaActual());
  });

  it('eliminar uno por uno todos los detalles termina en la venta actual vacía', () => {
    let actual = congelar(venta(detalle(leche), detalle(pan), detalle(huevos)));
    for (const id of [2, 1, 3]) actual = congelar(eliminarDetalle(actual, id));
    expect(actual).toEqual({ detalles: [], errores: {} });
  });
});

describe('eliminarDetalle: los errores de un campo del detalle', () => {
  const conErrorEnElPan = () =>
    congelar({
      detalles: [detalle(leche), detalle(pan)],
      errores: { 2: { precioAplicado: errorDePrecio, cantidad: errorDeCantidad } },
    });

  it('quita también los errores del detalle eliminado, el del precio aplicado y el de la cantidad', () => {
    const nueva = eliminarDetalle(conErrorEnElPan(), pan.id);
    expect(nueva.errores).toEqual({});
    expect(2 in nueva.errores).toBe(false);
  });

  it('los errores de los otros detalles se quedan tal como estaban', () => {
    const actual = congelar({
      detalles: [detalle(leche), detalle(pan), detalle(huevos)],
      errores: { 1: { cantidad: errorDeCantidad }, 2: { precioAplicado: errorDePrecio } },
    });
    expect(eliminarDetalle(actual, 2).errores).toEqual({ 1: { cantidad: errorDeCantidad } });
    expect(eliminarDetalle(actual, 3).errores).toEqual(actual.errores);
  });

  it('si el detalle eliminado era el único con un error, la venta actual vuelve a ser válida', () => {
    const actual = conErrorEnElPan();
    expect(ventaActualEsValida(actual)).toBe(false);
    const nueva = eliminarDetalle(actual, pan.id);
    expect(nueva.detalles).toEqual([detalle(leche)]);
    expect(ventaActualEsValida(nueva)).toBe(true);
  });

  it('si queda el error de otro detalle, la venta actual sigue sin ser válida', () => {
    const actual = congelar({
      detalles: [detalle(leche), detalle(pan)],
      errores: { 1: { cantidad: errorDeCantidad }, 2: { precioAplicado: errorDePrecio } },
    });
    expect(ventaActualEsValida(eliminarDetalle(actual, pan.id))).toBe(false);
  });
});

describe('eliminarDetalle: un productoId que no está', () => {
  it('devuelve la misma venta, la misma referencia y sin error: el cajero pudo eliminarlo un instante antes', () => {
    const actual = congelar({
      detalles: [detalle(leche), detalle(pan)],
      errores: { 2: { cantidad: errorDeCantidad } },
    });
    expect(eliminarDetalle(actual, 99)).toBe(actual);
  });

  it('con la venta actual vacía también devuelve la misma venta', () => {
    const vacia = congelar(vaciarVentaActual());
    expect(eliminarDetalle(vacia, 1)).toBe(vacia);
  });

  it('un productoId que no es de ningún detalle (null o undefined) no elimina nada', () => {
    const actual = congelar(venta(detalle(leche)));
    expect(eliminarDetalle(actual, null)).toBe(actual);
    expect(eliminarDetalle(actual, undefined)).toBe(actual);
  });

  it('eliminar dos veces el mismo detalle deja lo mismo que eliminarlo una vez', () => {
    const una = eliminarDetalle(congelar(venta(detalle(leche), detalle(pan))), pan.id);
    expect(eliminarDetalle(una, pan.id)).toBe(una);
  });
});

describe('eliminarDetalle: es una función pura', () => {
  it('criterio 13: no modifica la venta actual que recibe, congelada en todos los niveles', () => {
    const actual = congelar({
      detalles: [detalle(leche), detalle(pan), detalle(huevos)],
      errores: { 2: { cantidad: errorDeCantidad } },
    });
    for (const id of [1, 2, 3, 99]) expect(() => eliminarDetalle(actual, id)).not.toThrow();
  });

  it('lo que recibió sigue igual después de eliminar', () => {
    const errores = { 2: { cantidad: errorDeCantidad } };
    const actual = { detalles: [detalle(leche), detalle(pan)], errores };
    eliminarDetalle(actual, 2);
    expect(actual).toEqual({ detalles: [detalle(leche), detalle(pan)], errores });
    expect(actual.errores).toBe(errores);
  });

  it('devuelve una venta actual nueva: no es la anterior ni comparte con ella su lista de detalles', () => {
    const actual = venta(detalle(leche), detalle(pan));
    const nueva = eliminarDetalle(actual, pan.id);
    expect(nueva).not.toBe(actual);
    expect(nueva.detalles).not.toBe(actual.detalles);
    nueva.detalles.push(detalle(huevos));
    expect(ids(actual)).toEqual([1, 2]);
  });
});

describe('eliminarDetalle junto con agregarAVentaActual', () => {
  const producto = (id) => ({
    id,
    nombre: `Producto ${id}`,
    codigoBarras: `${id}`,
    precio: '1.00',
  });
  const conDetalles = (cuantos) =>
    venta(...Array.from({ length: cuantos }, (_, i) => detalle(producto(i + 1))));

  it('si el producto se agrega otra vez, empieza de nuevo con cantidad 1 y el precio del producto', () => {
    const actual = venta(detalle(pan, 5, '2.00'));
    const conElPanOtraVez = agregarAVentaActual(eliminarDetalle(actual, pan.id), pan);
    expect(conElPanOtraVez.detalles).toEqual([detalle(pan, 1, '3.50')]);
  });

  it('con 100 detalles, eliminar uno deja lugar para agregar otro producto (RN-14)', () => {
    const llena = congelar(conDetalles(100));
    expect(agregarAVentaActual(llena, producto(101))).toBe(llena);
    const conLugar = eliminarDetalle(llena, 50);
    expect(conLugar.detalles).toHaveLength(99);
    const conCien = agregarAVentaActual(conLugar, producto(101));
    expect(conCien.detalles).toHaveLength(100);
    expect(ids(conCien).at(-1)).toBe(101);
  });
});
