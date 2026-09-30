'use strict';

const ErrorApi = require('../errors/ErrorApi');
const sequelize = require('../database');

// La frase para el cajero de cada regla que puede rechazar el procedimiento sp_registrar_venta (spec de registrar
// venta, "Respuestas"). El procedimiento dice el código en MESSAGE_TEXT y aquí se le pone el mensaje: es una tabla de
// búsqueda, no hay lógica. Tiene justo los códigos del .sql (lo vigila regla-de-negocio.test.js).
const MENSAJES_DE_LAS_REGLAS = Object.freeze({
  VENTA_SIN_DETALLES: 'La venta no tiene productos. Agrega al menos uno.',
  DEMASIADOS_DETALLES: 'Una venta puede tener como máximo 100 productos.',
  DETALLE_INVALIDO: 'Un producto de la venta tiene datos inválidos.',
  CANTIDAD_FUERA_DE_RANGO: 'La cantidad debe ser un número entero de 1 a 999.',
  PRECIO_FUERA_DE_RANGO: 'El precio aplicado debe estar entre 0 y 99 999.99.',
  PRODUCTO_REPETIDO: 'Un producto aparece dos veces en la venta.',
  PRODUCTO_NO_EXISTE: 'Un producto de la venta ya no existe. Revisa la venta actual.',
});
const MENSAJE_DE_UNA_REGLA_QUE_NO_SE_CONOCE = 'La venta no cumple una regla de negocio.';

// El error original de mysql2 va en `parent` (Sequelize) o en `original`.
const originalDe = (err) => err && (err.parent || err.original);

// El procedimiento rechaza una venta con SIGNAL SQLSTATE '45000' (error 1644) y el código de la regla en sqlMessage.
// Solo eso se traduce: cualquier otro error de MySQL sigue como venía, y el manejador de errores decide.
function esUnRechazoDelProcedimiento(err) {
  const original = originalDe(err);
  return Boolean(original) && original.errno === 1644 && original.sqlState === '45000';
}

// Traduce un rechazo a un ErrorApi 422 con el código de la regla y su mensaje en español. Un código que no está en la
// tabla (o que ni siquiera es un texto) sale como REGLA_DE_NEGOCIO: el texto de MySQL nunca llega al cliente.
function errorDeLaRegla(err) {
  const { sqlMessage } = originalDe(err);
  if (typeof sqlMessage === 'string' && Object.hasOwn(MENSAJES_DE_LAS_REGLAS, sqlMessage)) {
    return new ErrorApi(422, sqlMessage, MENSAJES_DE_LAS_REGLAS[sqlMessage]);
  }
  return new ErrorApi(422, 'REGLA_DE_NEGOCIO', MENSAJE_DE_UNA_REGLA_QUE_NO_SE_CONOCE);
}

// Registra una venta con todos sus detalles, de una sola vez, llamando al procedimiento almacenado sp_registrar_venta.
// Recibe los detalles ya validados por la API (validators/ventas.js) y devuelve { ventaId, total }: el número de la
// venta y el total que calculó MySQL, como texto. Este servicio no suma ni multiplica dinero (RN-08 y RN-09).
//
// Cómo se llama al procedimiento (skill sequelize-call-procedure):
// - Sin sequelize.transaction(): el procedimiento maneja su propia transacción, y MySQL no anida transacciones. Con una
//   de afuera, su START TRANSACTION confirmaría sin avisar lo que Sequelize tuviera abierto (la prueba
//   sin-transaccion-externa.test.js lo demuestra).
// - La lista viaja como un solo parámetro JSON (JSON.stringify): en `replacements`, un arreglo se abriría en una lista
//   de valores y un objeto lanzaría un error.
// - Nada antes del CALL, ni un comentario: Sequelize reconoce el CALL por cómo empieza el SQL. Sin `type` de consulta
//   y sin parámetros OUT: el procedimiento devuelve sus datos con un solo SELECT, y Sequelize entrega las filas de ese
//   resultado, así que la primera fila es filas[0].
async function registrarVenta(detalles) {
  let filas;
  try {
    filas = await sequelize.query('CALL sp_registrar_venta(:detalles)', {
      replacements: { detalles: JSON.stringify(detalles) },
    });
  } catch (err) {
    throw esUnRechazoDelProcedimiento(err) ? errorDeLaRegla(err) : err;
  }
  const { ventaId, total } = filas[0];
  return { ventaId, total };
}

module.exports = { registrarVenta, MENSAJES_DE_LAS_REGLAS };
