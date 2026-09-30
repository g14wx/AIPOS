'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { crearRouterApi, montajes: montajesDeLaApi } = require('./routes');
const noEncontrado = require('./middlewares/noEncontrado');
const errorHandler = require('./middlewares/errorHandler');

// Arma la app y no escucha ningún puerto: las pruebas usan supertest(app). Solo servidor.js escucha.
// El orden importa: helmet, cors, JSON, rutas de /api, ruta no encontrada y, al final, el manejador de errores.
function crearApp(config = require('./config').config, { montajes = montajesDeLaApi } = {}) {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigenes, methods: ['GET', 'POST'] }));
  app.use(express.json({ limit: '100kb' }));
  app.use('/api', crearRouterApi(montajes));
  app.use(noEncontrado);
  app.use(errorHandler);
  return app;
}

const app = crearApp();
app.crearApp = crearApp;

module.exports = app;
