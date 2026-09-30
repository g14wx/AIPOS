'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { parse } = require('yaml');

// La documentación de la API es el documento OpenAPI 3 de backend/docs/openapi.yaml. Este es el único lugar que
// abre el archivo: lo usan la ruta de /api/docs y las pruebas. La ruta se resuelve desde __dirname y no desde la
// carpeta actual, así el backend lo encuentra sin importar desde dónde se arranque.
const RUTA_DEL_DOCUMENTO = path.resolve(__dirname, '../docs/openapi.yaml');

// Lee y parsea el documento. Si el archivo no existe, no es YAML o no es un objeto, el error nombra el archivo,
// igual que una variable de entorno que falta hace fallar el arranque con su nombre.
function cargarDocumentacionApi(ruta = RUTA_DEL_DOCUMENTO) {
  let texto;
  try {
    texto = fs.readFileSync(ruta, 'utf8');
  } catch (err) {
    throw new Error(`No se pudo leer la documentación de la API (${ruta}): ${err.message}`, {
      cause: err,
    });
  }

  let documento;
  try {
    documento = parse(texto);
  } catch (err) {
    throw new Error(`La documentación de la API (${ruta}) no es YAML válido: ${err.message}`, {
      cause: err,
    });
  }

  if (documento === null || typeof documento !== 'object' || Array.isArray(documento)) {
    throw new Error(
      `La documentación de la API (${ruta}) no es un documento OpenAPI: falta el objeto raíz.`,
    );
  }
  return documento;
}

module.exports = { cargarDocumentacionApi };
