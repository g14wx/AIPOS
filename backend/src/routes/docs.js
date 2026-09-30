'use strict';

const { Router } = require('express');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const { cargarDocumentacionApi } = require('../documentacion');

// La página de Swagger UI en GET /api/docs. No es un recurso del negocio: no tiene controller ni servicio, solo
// une la ruta con la librería. El documento se lee una vez, cuando Node carga este archivo, y si falla, el arranque
// falla con un mensaje que nombra el archivo.
const documento = cargarDocumentacionApi();

const router = Router();

// swagger-ui-dist trae una página de demostración (index.html) que carga el documento de ejemplo Petstore y el
// validador en línea desde servicios externos. AIPOS no la usa: esos archivos salen del router y siguen el camino de
// una ruta que no existe, un 404 con el formato de error. Va antes de la política de contenido y de `serve`.
const DE_DEMOSTRACION = ['/index.html', '/swagger-initializer.js', '/oauth2-redirect.html'];
router.use(DE_DEMOSTRACION, (req, res, next) => next('router'));

// Swagger UI escribe estilos en línea, así que esta política deja 'unsafe-inline' en style-src. Vale solo dentro de
// este router: el resto de la API conserva la política de helmet tal cual. También quita upgrade-insecure-requests,
// para poder abrir la página por http desde otra máquina de la red local sin que el navegador pida todo por https.
router.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: { 'style-src': ["'self'", "'unsafe-inline'"], 'upgrade-insecure-requests': null },
  }),
);

// Los archivos de Swagger UI: CSS, JavaScript e íconos. Un GET a /api/docs sin la barra final responde 301.
router.use(swaggerUi.serve);

// Es `get` y no `use('/')`: con `use`, un POST a /api/docs/ y un GET a /api/docs/nada también responderían 200 con
// la página, y una ruta que no existe tiene que ser un 404 con el formato de error. validatorUrl en null apaga el
// validador en línea de Swagger UI: sin eso, la página mandaría el documento a un servicio externo.
router.get(
  '/',
  swaggerUi.setup(documento, {
    customSiteTitle: 'API de AIPOS',
    swaggerOptions: { validatorUrl: null },
  }),
);

module.exports = router;
