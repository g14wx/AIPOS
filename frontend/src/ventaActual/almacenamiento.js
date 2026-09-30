import { aCentavos, formatearCentavos } from '../dinero.js';
import {
  CANTIDAD_MAXIMA,
  MAXIMO_DETALLES,
  esDinero,
  esNombreValido,
  vaciarVentaActual,
} from './ventaActual.js';

// La venta actual se guarda en el navegador para que siga igual si se recarga la página, y se vacía al registrar la
// venta. Este es el único archivo del proyecto que toca el almacenamiento del navegador: los componentes y el resto del
// módulo no lo saben. Nada de aquí lanza: si el navegador no deja (ventana privada, datos del sitio bloqueados, cuota
// llena), la venta actual vive solo en memoria y la pantalla funciona igual (RF-04, criterio 4).
// Lo guardado es un dato que el programa no controla (otra versión, una edición a mano, una escritura cortada), así que
// se valida entero al leerlo: si algo no cumple, se ignora todo y se empieza con la venta actual vacía.

const LLAVE = 'aipos.ventaActual';
const VERSION = 1;

const esObjeto = (valor) => valor !== null && typeof valor === 'object' && !Array.isArray(valor);

// Un detalle guardado que cumple RN-05, RN-06 y RN-07, con el precio aplicado de 2 decimales; null si no cumple.
function detalleGuardado(valor) {
  if (!esObjeto(valor)) return null;
  const { productoId, nombre, precioAplicado, cantidad } = valor;
  const cumple =
    Number.isInteger(productoId) &&
    productoId >= 1 &&
    esNombreValido(nombre) &&
    esDinero(precioAplicado) &&
    Number.isInteger(cantidad) &&
    cantidad >= 1 &&
    cantidad <= CANTIDAD_MAXIMA;
  if (!cumple) return null;
  return {
    productoId,
    nombre,
    precioAplicado: formatearCentavos(aCentavos(precioAplicado)),
    cantidad,
  };
}

// La venta actual que describe lo guardado; null si no tiene la forma esperada. Los errores de un campo del detalle no
// se guardan: un valor que no se aceptó no debe volver al recargar.
function ventaGuardada(valor) {
  if (!esObjeto(valor) || valor.version !== VERSION) return null;
  const { detalles } = valor;
  if (!Array.isArray(detalles) || detalles.length > MAXIMO_DETALLES) return null;
  const leidos = [];
  const vistos = new Set();
  for (const guardado of detalles) {
    const detalle = detalleGuardado(guardado);
    if (!detalle || vistos.has(detalle.productoId)) return null;
    vistos.add(detalle.productoId);
    leidos.push(detalle);
  }
  return { detalles: leidos, errores: {} };
}

// La venta actual que quedó guardada, o una vacía si no hay nada, está dañada o el navegador no deja leer.
export function leerVentaActual() {
  try {
    const texto = localStorage.getItem(LLAVE);
    return (texto === null ? null : ventaGuardada(JSON.parse(texto))) ?? vaciarVentaActual();
  } catch {
    return vaciarVentaActual();
  }
}

// Guarda solo los detalles. Con la venta actual vacía borra la llave en vez de guardar una lista vacía: así vaciarla
// después de registrar la venta deja el navegador sin nada guardado. Devuelve true si guardó o borró, y false si no pudo.
export function guardarVentaActual(ventaActual) {
  try {
    if (ventaActual.detalles.length === 0) {
      localStorage.removeItem(LLAVE);
    } else {
      const detalles = ventaActual.detalles.map(
        ({ productoId, nombre, precioAplicado, cantidad }) => ({
          productoId,
          nombre,
          precioAplicado,
          cantidad,
        }),
      );
      localStorage.setItem(LLAVE, JSON.stringify({ version: VERSION, detalles }));
    }
    return true;
  } catch {
    return false;
  }
}
