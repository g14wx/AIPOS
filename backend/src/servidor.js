'use strict';

const { config } = require('./config');
const app = require('./app');

// En Express 5, app.listen llama al callback también cuando el arranque falla (por ejemplo, con el
// puerto ocupado) y le pasa el error. Si no se mira, el servidor dice que escucha sin escuchar.
const servidor = app.listen(config.puerto, (err) => {
  if (err) {
    const motivo =
      err.code === 'EADDRINUSE'
        ? `el puerto ${config.puerto} ya está ocupado (EADDRINUSE). Cierra el otro proceso o cambia PORT en el .env`
        : err.message;
    console.error(`No se pudo arrancar la API de AIPOS: ${motivo}.`);
    process.exit(1);
  }
  console.log(`API de AIPOS escuchando en el puerto ${config.puerto}`);
});

// Docker manda SIGTERM al apagar: se dejan terminar las peticiones en curso.
for (const senal of ['SIGINT', 'SIGTERM']) {
  process.on(senal, () => servidor.close(() => process.exit(0)));
}
