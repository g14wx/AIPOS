// Funciones de la prueba de rutas documentadas (spec: documentación de la API, "La prueba de rutas documentadas").
// Listan las rutas que Express tiene registradas, las que dice la documentación de la API y las comparan.
// Ninguna llama a app.listen: solo leen la lista `montajes` y las capas de los routers.

const METODOS_DE_OPENAPI = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];

// Las rutas de la app, como 'MÉTODO /ruta' con los parámetros como {id}. Ordenadas.
// Express 5 ya no guarda con qué ruta se montó un router hijo: por eso el prefijo lo dice `montajes`.
export function listarRutasRegistradas(montajes) {
  const rutas = [];
  for (const { ruta: prefijo, router } of montajes) {
    for (const capa of router.stack) {
      if (!capa.route) {
        throw new Error(`En ${prefijo} hay algo que no es una ruta: la prueba no lo entiende.`);
      }
      const { path: rutaDeLaCapa, methods } = capa.route;
      if (typeof rutaDeLaCapa !== 'string' || /[*(){}]/.test(rutaDeLaCapa)) {
        throw new Error(`La ruta ${rutaDeLaCapa} usa una sintaxis que la prueba no entiende.`);
      }
      if (methods._all) {
        throw new Error(`La ruta ${prefijo}${rutaDeLaCapa} usa all(): la prueba no la entiende.`);
      }
      const sub = rutaDeLaCapa === '/' ? '' : rutaDeLaCapa;
      for (const metodo of Object.keys(methods)) {
        rutas.push(`${metodo.toUpperCase()} /api${prefijo}${sub}`.replace(/:(\w+)/g, '{$1}'));
      }
    }
  }
  return rutas.sort();
}

// Las rutas del documento OpenAPI, como 'MÉTODO /ruta'. Ordenadas.
export function listarRutasDocumentadas(documento) {
  const rutas = [];
  for (const [ruta, operaciones] of Object.entries(documento.paths ?? {})) {
    for (const metodo of Object.keys(operaciones)) {
      if (METODOS_DE_OPENAPI.includes(metodo)) rutas.push(`${metodo.toUpperCase()} ${ruta}`);
    }
  }
  return rutas.sort();
}

// Pura: no toca Express ni el archivo, y así se puede probar con una app falsa.
export function compararRutas(registradas, documentadas) {
  return {
    sinDocumentar: registradas.filter((ruta) => !documentadas.includes(ruta)).sort(),
    sinRuta: documentadas.filter((ruta) => !registradas.includes(ruta)).sort(),
  };
}

// Los mensajes que lee quien rompe la prueba: qué falta y dónde.
export function mensajesDeLaComparacion({ sinDocumentar, sinRuta }) {
  return [
    ...sinDocumentar.map(
      (ruta) => `Ruta sin documentar: \`${ruta}\`. Agrégala a \`backend/docs/openapi.yaml\`.`,
    ),
    ...sinRuta.map((ruta) => `Ruta documentada que no existe en Express: \`${ruta}\`.`),
  ];
}

function describirCapa(capa) {
  if (!capa.route) return capa.name || 'una capa sin nombre';
  const metodos = Object.keys(capa.route.methods).map((metodo) => metodo.toUpperCase());
  return `la ruta ${metodos.join(', ')} ${capa.route.path}`;
}

// Lo que Express tiene registrado por fuera de `montajes`: una ruta puesta directo en `app`, otro router montado
// en la app, o algo en el router de /api que no sea un router de `montajes` ni el de /api/docs (que no se
// documenta a sí mismo: es la única excepción). Devuelve una lista de mensajes, vacía si todo está en `montajes`.
// Los tres argumentos tienen que venir de la misma carga (todos con require o todos con import).
export function encontrarRutasFueraDeMontajes(app, montajes, routerDeDocs) {
  const problemas = [];
  const routersDeLaApp = [];
  for (const capa of app.router.stack) {
    if (capa.route) {
      problemas.push(`Ruta registrada directo en app: ${describirCapa(capa)}. Muévela a montajes.`);
    } else if (Array.isArray(capa.handle?.stack)) {
      routersDeLaApp.push(capa.handle);
    }
    // El resto son middlewares de función (helmet, cors, express.json, noEncontrado y errorHandler).
  }
  if (routersDeLaApp.length !== 1) {
    problemas.push(`app monta ${routersDeLaApp.length} routers y solo puede montar el de /api.`);
  }
  const permitidos = [...montajes.map((montaje) => montaje.router), routerDeDocs];
  for (const router of routersDeLaApp) {
    for (const capa of router.stack) {
      if (permitidos.includes(capa.handle)) continue;
      problemas.push(
        `El router de /api tiene ${describirCapa(capa)} fuera de montajes. Agrégalo a montajes en src/routes/index.js.`,
      );
    }
  }
  return problemas;
}
