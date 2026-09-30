// Spec de arquitectura, sección "La venta actual": la lógica vive en src/ventaActual/, fuera de los componentes,
// y trabaja en centavos con src/dinero.js. B-04 deja el módulo con la venta actual vacía y el cálculo del total,
// que es lo que la pantalla necesita para mostrar 0.00. Agregar, cambiar y eliminar detalles lo hacen V-04 a V-07.
import { describe, it, expect } from 'vitest';
import { formatearCentavos } from '../../src/dinero.js';
import {
  calcularSubtotal,
  calcularTotal,
  vaciarVentaActual,
} from '../../src/ventaActual/ventaActual.js';

const congelar = (valor) => {
  Object.values(valor).forEach((hijo) => typeof hijo === 'object' && hijo !== null && congelar(hijo));
  return Object.freeze(valor);
};

const leche = { productoId: 1, nombre: 'Leche entera 1 L', precioAplicado: '22.00', cantidad: 2 };
const pan = { productoId: 2, nombre: 'Pan de caja', precioAplicado: '3.50', cantidad: 1 };

describe('vaciarVentaActual', () => {
  it('devuelve una venta actual vacía: sin detalles y sin errores', () => {
    expect(vaciarVentaActual()).toEqual({ detalles: [], errores: {} });
  });

  it('devuelve una venta actual nueva cada vez, para que nadie comparta un objeto que otro pueda cambiar', () => {
    const primera = vaciarVentaActual();
    const segunda = vaciarVentaActual();
    expect(primera).not.toBe(segunda);
    expect(primera.detalles).not.toBe(segunda.detalles);
    primera.detalles.push(leche);
    expect(segunda.detalles).toEqual([]);
  });
});

describe('calcularSubtotal', () => {
  it('es el precio aplicado por la cantidad, en centavos', () => {
    expect(calcularSubtotal(leche)).toBe(4400);
    expect(calcularSubtotal(pan)).toBe(350);
  });

  it('un precio aplicado de 0.00 da subtotal 0', () => {
    expect(calcularSubtotal({ ...pan, precioAplicado: '0.00' })).toBe(0);
  });

  it('el caso más grande cabe sin perder centavos: 99999.99 × 999', () => {
    const detalle = { ...leche, precioAplicado: '99999.99', cantidad: 999 };
    expect(formatearCentavos(calcularSubtotal(detalle))).toBe('99899990.01');
  });
});

describe('calcularTotal', () => {
  it('con la venta actual vacía es 0, y se muestra como 0.00', () => {
    expect(calcularTotal(vaciarVentaActual())).toBe(0);
    expect(formatearCentavos(calcularTotal(vaciarVentaActual()))).toBe('0.00');
  });

  it('suma los subtotales: 2 leches a 22.00 y 1 pan a 3.50 dan 47.50', () => {
    const venta = { detalles: [leche, pan], errores: {} };
    expect(calcularTotal(venta)).toBe(4750);
    expect(formatearCentavos(calcularTotal(venta))).toBe('47.50');
  });

  it('suma en centavos lo que con decimales de JavaScript falla: 0.10 × 3 + 0.20 da 0.50', () => {
    const venta = {
      detalles: [
        { ...leche, precioAplicado: '0.10', cantidad: 3 },
        { ...pan, precioAplicado: '0.20', cantidad: 1 },
      ],
      errores: {},
    };
    expect(formatearCentavos(calcularTotal(venta))).toBe('0.50');
  });

  it('no modifica la venta actual que recibe', () => {
    const venta = congelar({ detalles: [{ ...leche }, { ...pan }], errores: {} });
    expect(() => calcularTotal(venta)).not.toThrow();
    expect(() => calcularSubtotal(venta.detalles[0])).not.toThrow();
  });
});
