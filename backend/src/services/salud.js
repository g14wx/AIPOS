'use strict';

const sequelize = require('../database');

// Cuánto espera la salud a que MySQL conteste. Si MySQL acepta la conexión y no contesta (por ejemplo,
// congelado), authenticate() esperaría sin fin y GET /api/salud se quedaría colgada (issue #39).
// Es el mismo tiempo que src/database.js espera el saludo de MySQL al abrir una conexión (issue #63).
const ESPERA_MAXIMA_MS = 3000;

// Cada consulta de salud lleva en las opciones de authenticate() un objeto `seguimientoDeSalud`, y este
// gancho de Sequelize anota en él la conexión del pool que la consulta usa: sin eso no habría cómo
// cortarla al vencer el tiempo (issue #54). Las demás consultas no lo llevan y pasan de largo.
sequelize.addHook('beforeQuery', (opciones, consulta) => {
  const seguimiento = opciones.seguimientoDeSalud;
  if (!seguimiento) return;
  // La consulta esperaba lugar en el pool y llegó cuando ya se respondió 500: no se envía, y la conexión,
  // que está sana, vuelve al pool.
  if (seguimiento.vencido) throw new Error('La consulta de salud llegó después del tiempo máximo.');
  seguimiento.conexion = consulta.connection;
});

// Cierra el socket de la conexión. La consulta que iba por ella falla con "conexión perdida" y el pool
// descarta la conexión, porque Sequelize revisa que siga sirviendo antes de volver a prestarla.
function cortarConexion(conexion) {
  conexion?.stream?.destroy();
}

// Timeout Pattern: gana la primera que termine, la consulta o el temporizador. Si gana el temporizador,
// `alVencer` libera lo que la consulta tenía ocupado, para que no quede colgada. El temporizador se limpia
// siempre, para no dejar nada pendiente cuando MySQL contesta a tiempo.
function conLimiteDeTiempo(promesa, milisegundos, alVencer) {
  let temporizador;
  const limite = new Promise((_, rechazar) => {
    temporizador = setTimeout(() => {
      alVencer();
      rechazar(new Error(`MySQL no contestó en ${milisegundos} ms.`));
    }, milisegundos);
  });
  return Promise.race([promesa, limite]).finally(() => clearTimeout(temporizador));
}

// Dice si la API está viva y si MySQL responde. Health Check: solo lee, no cambia nada en la base.
// Si authenticate() falla o no contesta a tiempo, el error sigue de largo hasta el manejador de errores,
// que responde 500 con el formato de error y sin el texto de MySQL.
async function consultarSalud(esperaMaximaMs = ESPERA_MAXIMA_MS) {
  const seguimiento = { conexion: null, vencido: false };
  await conLimiteDeTiempo(
    sequelize.authenticate({ seguimientoDeSalud: seguimiento }),
    esperaMaximaMs,
    () => {
      seguimiento.vencido = true;
      cortarConexion(seguimiento.conexion);
    },
  );
  return { estado: 'ok', baseDeDatos: 'ok' };
}

module.exports = { consultarSalud };
