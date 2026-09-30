// Spec armar-venta-actual, "Validez, registro y vaciado (V-04)" y criterios 13 y 14 de V-04: ventaActualEsValida dice si
// «Registrar venta» puede estar habilitado (de 1 a 100 detalles y ningún error de un campo del detalle), y
// detallesParaRegistrar entrega lo que RegistrarVenta.vue (V-08) le manda a registrarVenta. Son funciones puras: la venta
// actual llega congelada y ninguna la modifica.
import { describe, it, expect } from 'vitest';
import {
  detallesParaRegistrar,
  ventaActualEsValida,
  vaciarVentaActual,
} from '../../src/ventaActual/ventaActual.js';

const congelar = (valor) => {
  Object.values(valor).forEach(
    (hijo) => typeof hijo === 'object' && hijo !== null && congelar(hijo),
  );
  return Object.freeze(valor);
};

const leche = { productoId: 1, nombre: 'Leche entera 1 L', precioAplicado: '22.00', cantidad: 2 };
const pan = { productoId: 2, nombre: 'Pan de caja', precioAplicado: '3.50', cantidad: 1 };
const regalo = { productoId: 3, nombre: 'Bolsa', precioAplicado: '0.00', cantidad: 1 };
const ventaConDetalles = (cuantos) => ({
  detalles: Array.from({ length: cuantos }, (_, i) => ({
    productoId: i + 1,
    nombre: `Producto ${i + 1}`,
    precioAplicado: '1.00',
    cantidad: 1,
  })),
  errores: {},
});

describe('ventaActualEsValida', () => {
  it('una venta actual vacía no es válida: «Registrar venta» queda deshabilitado (RN-10)', () => {
    expect(ventaActualEsValida(vaciarVentaActual())).toBe(false);
  });

  it('con un detalle y sin errores es válida', () => {
    expect(ventaActualEsValida({ detalles: [leche], errores: {} })).toBe(true);
  });

  it('con varios detalles y sin errores es válida', () => {
    expect(ventaActualEsValida({ detalles: [leche, pan], errores: {} })).toBe(true);
  });

  it('con un error de un campo del detalle no es válida, aunque haya detalles', () => {
    const errores = { 2: { cantidad: 'La cantidad debe ser un número entero de 1 a 999.' } };
    expect(ventaActualEsValida({ detalles: [leche, pan], errores })).toBe(false);
    expect(
      ventaActualEsValida({ detalles: [leche, pan], errores: { 1: { precioAplicado: 'x' } } }),
    ).toBe(false);
  });

  it('una venta actual con solo productos a 0.00 es válida', () => {
    expect(ventaActualEsValida({ detalles: [regalo], errores: {} })).toBe(true);
  });

  it('criterio 14: con 100 detalles válidos sigue siendo válida (RN-14)', () => {
    expect(ventaActualEsValida(ventaConDetalles(100))).toBe(true);
  });

  it('con 101 detalles no es válida: la pantalla nunca llega ahí, pero la regla es de la venta', () => {
    expect(ventaActualEsValida(ventaConDetalles(101))).toBe(false);
  });

  it('con 100 detalles y un error no es válida', () => {
    const actual = { ...ventaConDetalles(100), errores: { 7: { cantidad: 'x' } } };
    expect(ventaActualEsValida(actual)).toBe(false);
  });

  it('devuelve un boolean, no algo que se parezca', () => {
    expect(ventaActualEsValida({ detalles: [leche], errores: {} })).toBe(true);
    expect(ventaActualEsValida(vaciarVentaActual())).toBe(false);
  });

  it('no modifica la venta actual que recibe (criterio 13)', () => {
    const actual = congelar({ detalles: [{ ...leche }], errores: { 1: { cantidad: 'x' } } });
    expect(() => ventaActualEsValida(actual)).not.toThrow();
  });
});

describe('detallesParaRegistrar', () => {
  it('devuelve, para cada detalle y en su orden, productoId, cantidad y precioAplicado', () => {
    const actual = { detalles: [leche, pan, regalo], errores: {} };
    expect(detallesParaRegistrar(actual)).toEqual([
      { productoId: 1, cantidad: 2, precioAplicado: '22.00' },
      { productoId: 2, cantidad: 1, precioAplicado: '3.50' },
      { productoId: 3, cantidad: 1, precioAplicado: '0.00' },
    ]);
  });

  it('no lleva el nombre ni otro campo: solo los tres datos que recibe la API', () => {
    const [primero] = detallesParaRegistrar({ detalles: [leche], errores: {} });
    expect(Object.keys(primero).sort()).toEqual(['cantidad', 'precioAplicado', 'productoId']);
  });

  it('la cantidad es un número entero y el precio aplicado un texto con 2 decimales', () => {
    for (const { cantidad, precioAplicado } of detallesParaRegistrar({
      detalles: [leche, pan],
      errores: {},
    })) {
      expect(Number.isInteger(cantidad)).toBe(true);
      expect(precioAplicado).toMatch(/^\d{1,5}\.\d{2}$/);
    }
  });

  it('con la venta actual vacía devuelve una lista vacía', () => {
    expect(detallesParaRegistrar(vaciarVentaActual())).toEqual([]);
  });

  it('devuelve objetos nuevos: lo que se manda a la API no comparte nada con la venta actual', () => {
    const actual = { detalles: [{ ...leche }], errores: {} };
    const [primero] = detallesParaRegistrar(actual);
    expect(primero).not.toBe(actual.detalles[0]);
    primero.cantidad = 99;
    expect(actual.detalles[0].cantidad).toBe(2);
  });

  it('no mira los errores: decidir si se puede registrar es de ventaActualEsValida', () => {
    const actual = { detalles: [leche], errores: { 1: { cantidad: 'x' } } };
    expect(detallesParaRegistrar(actual)).toEqual([
      { productoId: 1, cantidad: 2, precioAplicado: '22.00' },
    ]);
  });

  it('no modifica la venta actual que recibe (criterio 13)', () => {
    const actual = congelar({ detalles: [{ ...leche }, { ...pan }], errores: {} });
    expect(() => detallesParaRegistrar(actual)).not.toThrow();
  });
});

describe('vaciarVentaActual', () => {
  it('devuelve una venta actual vacía: sin detalles y sin errores', () => {
    expect(vaciarVentaActual()).toEqual({ detalles: [], errores: {} });
  });

  it('devuelve una venta actual nueva cada vez, no un objeto compartido que alguien pueda cambiar', () => {
    const primera = vaciarVentaActual();
    const segunda = vaciarVentaActual();
    expect(primera).not.toBe(segunda);
    expect(primera.detalles).not.toBe(segunda.detalles);
    expect(primera.errores).not.toBe(segunda.errores);
    primera.detalles.push(leche);
    primera.errores[1] = { cantidad: 'x' };
    expect(vaciarVentaActual()).toEqual({ detalles: [], errores: {} });
  });
});
