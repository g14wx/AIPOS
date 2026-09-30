import { aCentavos, formatearCentavos } from '../dinero.js';

// La lógica de la venta actual vive aquí y no en los componentes, para probarla sin pantalla (RNF-06).
// Son funciones puras: reciben la venta actual y devuelven una nueva (o la misma, si nada cambió), sin modificar lo que
// reciben. Así el componente reemplaza el valor entero y Vue 2 detecta el cambio.
// Este archivo tiene lo de V-04: agregar, validez y lo que se manda a registrar. V-05 a V-07 suman editar el precio
// aplicado, cambiar la cantidad y eliminar un detalle.

// RN-14: una venta tiene como máximo 100 detalles. Evita que el total pase de DECIMAL(12,2).
export const MAXIMO_DETALLES = 100;
// RN-06: la cantidad de un detalle es un entero de 1 a 999.
export const CANTIDAD_MAXIMA = 999;
// Lo que acepta la API de crear producto (RN-04), contado en caracteres: un emoji es uno solo, como en MySQL.
export const LARGO_MAXIMO_NOMBRE = 120;

// El dinero viaja como texto con la forma que valida la API (RN-02 y RN-05): hasta 5 enteros y 2 decimales.
const FORMA_DEL_DINERO = /^\d{1,5}(\.\d{1,2})?$/;

export const esDinero = (valor) => typeof valor === 'string' && FORMA_DEL_DINERO.test(valor);
export const esNombreValido = (valor) =>
  typeof valor === 'string' && valor.length > 0 && [...valor].length <= LARGO_MAXIMO_NOMBRE;

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

// El detalle nuevo de un producto que eligió el cajero: cantidad 1 y precio aplicado igual al precio del producto
// (RN-05), con 2 decimales. Un producto mal formado es un fallo de programación y no un caso del cajero: la búsqueda
// siempre entrega el id entero, el nombre y el precio como texto, y lo que se arma aquí se puede guardar y leer.
function detalleNuevo(producto) {
  if (!Number.isInteger(producto?.id) || producto.id < 1) {
    throw new Error('El producto elegido no tiene un id entero de 1 o más.');
  }
  if (!esNombreValido(producto.nombre)) {
    throw new Error(
      `El producto ${producto.id} no tiene un nombre de 1 a ${LARGO_MAXIMO_NOMBRE} caracteres.`,
    );
  }
  if (!esDinero(producto.precio)) {
    throw new Error(`El producto ${producto.id} no tiene un precio como "25.00".`);
  }
  const precioAplicado = formatearCentavos(aCentavos(producto.precio));
  return { productoId: producto.id, nombre: producto.nombre, precioAplicado, cantidad: 1 };
}

// Quita el error de cantidad de un detalle (el campo vuelve a mostrar el valor válido) y deja los demás errores.
// Si el detalle se queda sin errores, su clave se va: sin errores, errores es {} y la venta actual puede registrarse.
function sinErrorDeCantidad(errores, productoId) {
  if (!errores[productoId] || !('cantidad' in errores[productoId])) return errores;
  const restantes = { ...errores[productoId] };
  delete restantes.cantidad;
  const nuevos = { ...errores };
  if (Object.keys(restantes).length === 0) delete nuevos[productoId];
  else nuevos[productoId] = restantes;
  return nuevos;
}

// Quita todos los errores de un detalle (los de su precio aplicado y los de su cantidad). Si no tenía, devuelve los mismos.
function sinErroresDelDetalle(errores, productoId) {
  if (!Object.hasOwn(errores, productoId)) return errores;
  const restantes = { ...errores };
  delete restantes[productoId];
  return restantes;
}

// Eliminar detalle (V-07): quita de la venta actual el detalle de ese producto y sus errores, y deja los demás en su
// orden. Si era el último, la venta actual queda vacía: sin detalles no hay errores. Si el producto no está (el cajero
// pudo eliminarlo un instante antes), devuelve LA MISMA venta actual: no hay nada que cambiar ni que guardar.
export function eliminarDetalle(ventaActual, productoId) {
  const { detalles, errores } = ventaActual;
  if (!detalles.some((detalle) => detalle.productoId === productoId)) return ventaActual;
  const restantes = detalles.filter((detalle) => detalle.productoId !== productoId);
  if (restantes.length === 0) return vaciarVentaActual();
  return { detalles: restantes, errores: sinErroresDelDetalle(errores, productoId) };
}

// Agregar a la venta actual un producto de la búsqueda. Si ya está, su cantidad sube en 1 (RN-07) y su precio aplicado
// se queda como esté. Con la cantidad en 999 o con 100 detalles (RN-14) devuelve LA MISMA venta actual, y quien la
// llama lo nota con `nueva === anterior` para avisar al cajero.
export function agregarAVentaActual(ventaActual, producto) {
  const nuevo = detalleNuevo(producto);
  const { detalles, errores } = ventaActual;
  const actual = detalles.find((detalle) => detalle.productoId === nuevo.productoId);
  if (!actual) {
    return detalles.length >= MAXIMO_DETALLES
      ? ventaActual
      : { detalles: [...detalles, nuevo], errores };
  }
  if (actual.cantidad >= CANTIDAD_MAXIMA) return ventaActual;
  return {
    detalles: detalles.map((detalle) =>
      detalle === actual ? { ...detalle, cantidad: detalle.cantidad + 1 } : detalle,
    ),
    errores: sinErrorDeCantidad(errores, actual.productoId),
  };
}

// «Registrar venta» solo se puede usar con de 1 a 100 detalles y sin ningún error de un campo del detalle (RN-10 y RN-14).
export function ventaActualEsValida(ventaActual) {
  const cuantos = ventaActual.detalles.length;
  return (
    cuantos >= 1 && cuantos <= MAXIMO_DETALLES && Object.keys(ventaActual.errores).length === 0
  );
}

// Lo que RegistrarVenta.vue le manda a registrarVenta: por cada detalle, su producto, su cantidad y su precio aplicado.
// Sin el nombre: es solo para mostrarlo. El total no se manda: lo calcula MySQL (RN-09).
export function detallesParaRegistrar(ventaActual) {
  return ventaActual.detalles.map(({ productoId, cantidad, precioAplicado }) => ({
    productoId,
    cantidad,
    precioAplicado,
  }));
}
