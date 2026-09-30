'use strict';

const { config } = require('./config');
const app = require('./app');

const servidor = app.listen(config.puerto, () => {
  console.log(`API de AIPOS escuchando en el puerto ${config.puerto}`);
});

// Docker manda SIGTERM al apagar: se dejan terminar las peticiones en curso.
for (const senal of ['SIGINT', 'SIGTERM']) {
  process.on(senal, () => servidor.close(() => process.exit(0)));
}
