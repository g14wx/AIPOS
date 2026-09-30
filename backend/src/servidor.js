'use strict';

const { config } = require('./config');
const app = require('./app');
const crearServidor = require('./crearServidor');

const servidor = crearServidor(app);

// Si el arranque falla (por ejemplo, con el puerto ocupado), listen() emite 'error' y nunca 'listening'. Sin este
// aviso, Node escribiría un stack y no diría qué puerto falló.
function alFallarElArranque(err) {
  const motivo =
    err.code === 'EADDRINUSE'
      ? `el puerto ${config.puerto} ya está ocupado (EADDRINUSE). Cierra el otro proceso o cambia PORT en el .env`
      : err.message;
  console.error(`No se pudo arrancar la API de AIPOS: ${motivo}.`);
  process.exit(1);
}
servidor.once('error', alFallarElArranque);

servidor.listen(config.puerto, () => {
  servidor.off('error', alFallarElArranque);
  console.log(`API de AIPOS escuchando en el puerto ${config.puerto}`);
});

// Docker manda SIGTERM al apagar: se dejan terminar las peticiones en curso.
for (const senal of ['SIGINT', 'SIGTERM']) {
  process.on(senal, () => servidor.close(() => process.exit(0)));
}
