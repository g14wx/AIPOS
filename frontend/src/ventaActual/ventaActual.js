import { aCentavos } from '../dinero.js';

// La lógica de la venta actual vive aquí y no en los componentes, para probarla sin pantalla (RNF-06).
// Son funciones puras: reciben la venta actual y devuelven valores nuevos, sin modificar lo que reciben.
// B-04 deja la venta actual vacía y su total. Agregar, cambiar y eliminar detalles llegan con V-04 a V-07.

// Una venta actual vacía nueva cada vez: nadie comparte un objeto que otro pueda cambiar.
export function vaciarVentaActual() {
  return { detalles: [], errores: {} };
}

// Subtotal de un detalle, en centavos: el precio aplicado por la cantidad.
export function calcularSubtotal(detalle) {
  return aCentavos(detalle.precioAplicado) * detalle.cantidad;
}

// Total de la venta actual, en centavos: la suma de los subtotales, y 0 si no hay detalles.
// Es solo para mostrar: el total que vale lo calcula MySQL al registrar la venta (RN-09).
export function calcularTotal(ventaActual) {
  return ventaActual.detalles.reduce((total, detalle) => total + calcularSubtotal(detalle), 0);
}
