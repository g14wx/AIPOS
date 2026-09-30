'use strict';

const sequelize = require('../database');

// Cuánto espera la salud a que MySQL conteste. Si MySQL acepta la conexión y no contesta (por ejemplo,
// congelado), authenticate() esperaría sin fin y GET /api/salud se quedaría colgada (issue #39).
const ESPERA_MAXIMA_MS = 3000;

// Timeout Pattern: gana la primera que termine, la consulta o el temporizador. El temporizador se
// limpia siempre, para no dejar nada pendiente cuando MySQL contesta a tiempo.
function conLimiteDeTiempo(promesa, milisegundos) {
  let temporizador;
  const limite = new Promise((_, rechazar) => {
    temporizador = setTimeout(
      () => rechazar(new Error(`MySQL no contestó en ${milisegundos} ms.`)),
      milisegundos,
    );
  });
  return Promise.race([promesa, limite]).finally(() => clearTimeout(temporizador));
}

// Dice si la API está viva y si MySQL responde. Health Check: solo lee, no cambia nada en la base.
// Si authenticate() falla o no contesta a tiempo, el error sigue de largo hasta el manejador de errores,
// que responde 500 con el formato de error y sin el texto de MySQL.
async function consultarSalud(esperaMaximaMs = ESPERA_MAXIMA_MS) {
  await conLimiteDeTiempo(sequelize.authenticate(), esperaMaximaMs);
  return { estado: 'ok', baseDeDatos: 'ok' };
}

module.exports = { consultarSalud };
