// Spec armar-venta-actual, "Subtotales y total (V-04)" y criterios 3 y 10 de V-04: el subtotal y el total se calculan en
// centavos (números enteros) con src/dinero.js, nunca sumando ni multiplicando decimales de JavaScript, y la pantalla los
// muestra con 2 decimales. B-04 dejó calcularSubtotal y calcularTotal con su prueba (venta-vacia.test.js); esta prueba
// cubre los casos que rompen con decimales y el caso más grande, y comprueba otra vez lo que el módulo necesita de dinero.js.
import { describe, it, expect } from 'vitest';
import { aCentavos, formatearCentavos } from '../../src/dinero.js';
import {
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

const detalle = (productoId, precioAplicado, cantidad) => ({
  productoId,
  nombre: `Producto ${productoId}`,
  precioAplicado,
  cantidad,
});
const venta = (...detalles) => ({ detalles, errores: {} });
const subtotal = (precioAplicado, cantidad) =>
  formatearCentavos(calcularSubtotal(detalle(1, precioAplicado, cantidad)));
const total = (...detalles) => formatearCentavos(calcularTotal(venta(...detalles)));

describe('calcularSubtotal: precio aplicado por cantidad, en centavos', () => {
  it('devuelve centavos, un número entero: 22.00 × 2 son 4400', () => {
    expect(calcularSubtotal(detalle(1, '22.00', 2))).toBe(4400);
    expect(Number.isInteger(calcularSubtotal(detalle(1, '3.50', 1)))).toBe(true);
  });

  it('criterio 1 de V-04: la leche a 25.00 con cantidad 1 tiene subtotal 25.00', () => {
    expect(subtotal('25.00', 1)).toBe('25.00');
  });

  it('criterio 10: 1.15 × 3 da 3.45 y no 3.4499999999999997', () => {
    expect(1.15 * 3).not.toBe(3.45);
    expect(subtotal('1.15', 3)).toBe('3.45');
  });

  it('un precio aplicado de 0.00 da subtotal 0.00', () => {
    expect(calcularSubtotal(detalle(1, '0.00', 5))).toBe(0);
    expect(subtotal('0.00', 5)).toBe('0.00');
  });

  it('el caso más grande cabe sin perder centavos: 99999.99 × 999 da 99899990.01', () => {
    expect(calcularSubtotal(detalle(1, '99999.99', 999))).toBe(9989999001);
    expect(subtotal('99999.99', 999)).toBe('99899990.01');
  });
});

describe('calcularTotal: la suma de los subtotales, en centavos', () => {
  it('con la venta actual vacía es 0 y se muestra 0.00', () => {
    expect(calcularTotal(vaciarVentaActual())).toBe(0);
    expect(formatearCentavos(calcularTotal(vaciarVentaActual()))).toBe('0.00');
  });

  it('criterio 3 (RF-08, criterio 1): 2 leches a 22.00 y 1 pan a 3.50 suman 47.50', () => {
    expect(total(detalle(1, '22.00', 2), detalle(2, '3.50', 1))).toBe('47.50');
    expect(calcularTotal(venta(detalle(1, '22.00', 2), detalle(2, '3.50', 1)))).toBe(4750);
  });

  it('criterio 10: 0.10 × 3 + 0.20 da 0.50', () => {
    // La trampa de la tarjeta: con decimales de JavaScript 0.1 + 0.2 no da 0.3.
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(total(detalle(1, '0.10', 3), detalle(2, '0.20', 1))).toBe('0.50');
    expect(total(detalle(1, '0.10', 1), detalle(2, '0.20', 1))).toBe('0.30');
  });

  it('suma en centavos cientos de decimales sin acumular error: 0.10 cien veces da 10.00', () => {
    const detalles = Array.from({ length: 100 }, (_, i) => detalle(i + 1, '0.10', 1));
    expect(total(...detalles)).toBe('10.00');
  });

  it('dos detalles del caso más grande suman 199799980.02', () => {
    expect(total(detalle(1, '99999.99', 999), detalle(2, '99999.99', 999))).toBe('199799980.02');
  });

  it('con 100 detalles del caso más grande el total es 9989999001.00 y cabe en DECIMAL(12,2) (RN-14)', () => {
    const detalles = Array.from({ length: 100 }, (_, i) => detalle(i + 1, '99999.99', 999));
    expect(total(...detalles)).toBe('9989999001.00');
    // El máximo de DECIMAL(12,2), 9 999 999 999.99, en centavos.
    expect(calcularTotal(venta(...detalles))).toBeLessThanOrEqual(999999999999);
  });

  it('un detalle con precio aplicado 0.00 suma 0.00 y el total sigue siendo el de los demás', () => {
    expect(total(detalle(1, '0.00', 3), detalle(2, '3.50', 2))).toBe('7.00');
    expect(total(detalle(1, '0.00', 3))).toBe('0.00');
  });

  it('no modifica la venta actual que recibe (criterio 13)', () => {
    const actual = congelar(venta(detalle(1, '22.00', 2), detalle(2, '3.50', 1)));
    expect(() => calcularTotal(actual)).not.toThrow();
    expect(() => calcularSubtotal(actual.detalles[0])).not.toThrow();
  });
});

// El módulo no suma decimales: depende de que dinero.js entienda cualquier texto con la forma del dinero, también sin
// decimales o con uno solo. dinero.test.js ya lo prueba; aquí se comprueba otra vez por si un cambio lo rompe.
describe('lo que el módulo necesita de dinero.js', () => {
  it('aCentavos entiende el dinero sin decimales y con uno', () => {
    expect(aCentavos('22')).toBe(2200);
    expect(aCentavos('22.5')).toBe(2250);
    expect(aCentavos('22.50')).toBe(2250);
    expect(aCentavos('0')).toBe(0);
    expect(aCentavos('99999.99')).toBe(9999999);
  });

  it('formatearCentavos completa los 2 decimales y no pone símbolo ni separador de miles', () => {
    expect(formatearCentavos(2200)).toBe('22.00');
    expect(formatearCentavos(5)).toBe('0.05');
    expect(formatearCentavos(0)).toBe('0.00');
    expect(formatearCentavos(9989999001)).toBe('99899990.01');
  });

  it('un precio aplicado sin decimales o con uno también se calcula bien', () => {
    expect(subtotal('22', 2)).toBe('44.00');
    expect(subtotal('22.5', 3)).toBe('67.50');
  });
});
