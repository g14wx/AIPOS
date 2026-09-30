'use strict';

const { validarDinero, validarEnteroEnRango, exigirDatosValidos } = require('./comunes');

const MENSAJE_DE_LA_VENTA = 'Los datos de la venta no son válidos. Revisa los campos marcados.';

// Los límites de los detalles de venta. El productoId cabe en INT (2 147 483 647), la cantidad va de 1 a 999 (RN-06)
// y una venta tiene como máximo 100 detalles (RN-14): con más, el total se pasaría de DECIMAL(12,2).
const MAXIMO_DE_DETALLES = 100;
const RANGO_DEL_PRODUCTO_ID = { minimo: 1, maximo: 2147483647 };
const RANGO_DE_LA_CANTIDAD = { minimo: 1, maximo: 999 };

const conProblema = (campo, mensaje) => ({ detalleDelError: { campo, mensaje } });
const esUnObjeto = (valor) => valor !== null && typeof valor === 'object' && !Array.isArray(valor);

// El problema de la lista `detalles` en sí, o undefined si tiene de 1 a 100 elementos. Es lo primero que se mira: una
// lista vacía (RN-10) o de más (RN-14) es el único problema que se dice, sin revisar uno por uno sus elementos.
function problemaDeLaLista(detalles) {
  if (detalles === undefined || detalles === null)
    return conProblema('detalles', 'Es obligatorio.');
  if (!Array.isArray(detalles)) {
    return conProblema('detalles', 'Debe ser una lista de detalles de venta.');
  }
  if (detalles.length === 0) return conProblema('detalles', 'Agrega al menos un producto.');
  if (detalles.length > MAXIMO_DE_DETALLES) {
    return conProblema(
      'detalles',
      `Una venta puede tener como máximo ${MAXIMO_DE_DETALLES} productos.`,
    );
  }
  return undefined;
}

// Un producto tiene un solo detalle en la venta (RN-07). Solo cuentan los productoId válidos: dos inválidos iguales
// no son un producto repetido. El que se repite es el segundo detalle, y a él apunta el problema.
function validarProductoId(valor, campo, productosVistos) {
  const resultado = validarEnteroEnRango(valor, campo, RANGO_DEL_PRODUCTO_ID);
  if (resultado.detalleDelError) return resultado;
  if (productosVistos.has(resultado.valor)) {
    return conProblema(campo, 'Este producto ya está en la venta.');
  }
  productosVistos.add(resultado.valor);
  return resultado;
}

// Revisa un detalle de venta y devuelve los resultados de sus tres campos, siempre en el orden productoId, cantidad
// y precioAplicado, y el detalle limpio con solo esos tres campos: lo que sobre (un subtotal, un nombre) se ignora.
// El precio aplicado acepta el 0 (RN-05): por eso `permiteCero`.
function revisarDetalle(detalle, posicion, productosVistos) {
  if (!esUnObjeto(detalle)) {
    const mensaje = 'Debe ser un objeto con productoId, cantidad y precioAplicado.';
    return { resultados: [conProblema(`detalles[${posicion}]`, mensaje)] };
  }
  const campo = (nombre) => `detalles[${posicion}].${nombre}`;
  const productoId = validarProductoId(detalle.productoId, campo('productoId'), productosVistos);
  const cantidad = validarEnteroEnRango(detalle.cantidad, campo('cantidad'), RANGO_DE_LA_CANTIDAD);
  const precioAplicado = validarDinero(detalle.precioAplicado, campo('precioAplicado'), {
    permiteCero: true,
  });
  return {
    resultados: [productoId, cantidad, precioAplicado],
    limpio: {
      productoId: productoId.valor,
      cantidad: cantidad.valor,
      precioAplicado: precioAplicado.valor,
    },
  };
}

// Revisa el cuerpo de POST /api/ventas antes de tocar la base de datos (RN-05, RN-06, RN-07, RN-10 y RN-14) y
// devuelve { detalles } con los detalles limpios, o lanza un ErrorApi 400 con todos los campos con problema, en el
// orden de los detalles. La API no recibe un total ni un subtotal: si el cuerpo trae uno, se ignora (RN-09).
// Un cuerpo que falta (petición sin Content-Type: application/json) o que es un arreglo se trata como un cuerpo
// vacío: el 400 dice que `detalles` es obligatorio y no es un error de JavaScript, que sería un 500.
function validarVentaNueva(cuerpo) {
  const { detalles } = esUnObjeto(cuerpo) ? cuerpo : {};
  const problema = problemaDeLaLista(detalles);
  exigirDatosValidos(MENSAJE_DE_LA_VENTA, problema ? [problema] : []);

  const productosVistos = new Set();
  // Array.from visita todas las posiciones, también las vacías: un hueco se revisa como un detalle que no es objeto.
  const revisados = Array.from(detalles, (detalle, posicion) =>
    revisarDetalle(detalle, posicion, productosVistos),
  );
  exigirDatosValidos(
    MENSAJE_DE_LA_VENTA,
    revisados.flatMap((revisado) => revisado.resultados),
  );
  return { detalles: revisados.map((revisado) => revisado.limpio) };
}

module.exports = { validarVentaNueva };
