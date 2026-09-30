---
name: Documentación de la API
description: Documento OpenAPI 3 del backend, servido con Swagger UI en GET /api/docs, con el formato de error como esquema compartido y una prueba que falla si una ruta de Express no está documentada
targets:
  - ../backend/docs/openapi.yaml
  - ../backend/src/documentacion.js
  - ../backend/src/routes/docs.js
  - ../backend/src/routes/index.js
  - ../backend/package.json
  - ../backend/tests/documentacion/**
  - ../docs/lenguaje-ubicuo.md
  - ../requerimientos/01-alcance.md
  - ../requerimientos/04-entregables.md
  - ../tests/documentacion/glosario-y-alcance.test.sh
---

# Documentación de la API

Esta spec cubre la tarjeta A-01. La documentación de la API es el documento OpenAPI 3 (el formato estándar para
describir una API) del backend, y la página de Swagger UI (la página que deja leer y probar ese documento) que lo
muestra en `GET /api/docs`. Se apoya en la [spec de arquitectura](./arquitectura.spec.md) y no repite lo que ya dice:
las capas, el formato de error y las cabeceras de seguridad son los de allá.

Las versiones se comprobaron con `npm view` el 2026-09-30. Los ejemplos de esta spec no son código final: los escribe
la tarjeta A-01, y las pruebas que enlazan los `[@test]` son las suyas.

## Qué entra y qué no

- Entra: el documento `backend/docs/openapi.yaml`, Swagger UI en `GET /api/docs`, `GET /api/salud` documentada, el
  formato de error de RNF-05 como esquema que reusan todas las rutas, y la prueba que compara las rutas de Express con
  el documento.
- Las rutas de productos y de ventas no las documenta esta tarjeta: cada una la documenta la tarjeta que la crea
  (ver "Qué tarjeta implementa cada parte"). Esta tarjeta deja el documento y la prueba listos para que lo hagan.
- No entra: autenticación (AIPOS no tiene login), versiones de la API (`/api/v2`), generar el documento a partir del
  código ni generar un cliente de la API.
- `GET /api/docs` es pública, como el resto de la API. En producción vive en
  `https://aipos-back.salsalvador.io/api/docs` (tarjeta D-01).

## Archivos

```text
backend/
  docs/openapi.yaml           el documento OpenAPI 3: la única fuente de lo que dice la documentación de la API
  src/documentacion.js        lee y parsea el documento: cargarDocumentacionApi()
  src/routes/docs.js          el router de Swagger UI, con su política de contenido propia
  src/routes/index.js         (ya existe, de B-02) exporta también `montajes`, la lista de routers y su prefijo
  tests/documentacion/        las pruebas de esta spec, y rutas.js con las funciones que listan y comparan rutas
tests/documentacion/glosario-y-alcance.test.sh
```

- `backend/docs/` es una carpeta nueva, junto a `db/` y `src/`. El documento va fuera de `src/` porque no es código: se
  lee y se revisa como un documento. La ruta se resuelve con `path.resolve(__dirname, '../docs/openapi.yaml')`, así no
  depende de desde dónde se arranque el backend.
- Es YAML y no JSON: se lee mejor, deja comentarios y los ejemplos largos no llenan el archivo de comillas.
- `cargarDocumentacionApi()` lo usan la ruta de `/api/docs` y las pruebas. Es el único lugar que abre el archivo.
- `src/routes/docs.js` no tiene controller ni servicio: no es un recurso del negocio, solo une `GET /api/docs` con una
  librería. No toca modelos ni SQL, como pide la capa de rutas.
- Nombres sin tildes en el código (`documentacion.js`), como manda el glosario. Los textos del documento (resúmenes,
  descripciones y ejemplos) van en español y con las palabras del glosario.
- Patrón: ninguno del catálogo `design-patterns` describe "un documento OpenAPI servido con Swagger UI". Los que salieron
  al buscar (Versioning Pattern, API Gateway, API Composition) resuelven otras cosas. Se sigue la práctica estándar de
  OpenAPI: un solo documento como fuente y una página que lo muestra.

`[@test] ../backend/tests/documentacion/archivos.test.js`

## Dependencias

Todas fijas, sin `^` ni `~`, y con `package-lock.json` en git (regla de versiones de la arquitectura):

| Paquete | Versión | Dónde | Para qué |
|---|---|---|---|
| `swagger-ui-express` | 5.0.1 | `dependencies` | El router de Express que sirve Swagger UI. Es la versión que pide la tarjeta. |
| `swagger-ui-dist` | 5.33.0 | `dependencies` | Los archivos de Swagger UI. `swagger-ui-express` los pide como `>=5.0.0`, sin tope: se fija aparte para que un clon nuevo no traiga otra. |
| `yaml` | 2.9.1 | `dependencies` | Lee `openapi.yaml`. |
| `@apidevtools/swagger-parser` | 13.1.0 | `devDependencies` | Valida el documento como OpenAPI 3 en las pruebas, sin red. |

- `swagger-ui-dist` trae `@scarf/scarf`, que en su `postinstall` puede mandar estadísticas de instalación. El
  `package.json` del backend lleva `"scarfSettings": { "enabled": false }` para apagarlas.
- La versión del documento es `openapi: 3.0.3`. Es la que validan y muestran sin sorpresas las dos herramientas; no se
  usa la 3.1.
- Nada de `swagger-jsdoc` ni de comentarios `@swagger` en el código: dejarían dos fuentes de la verdad.

`[@test] ../backend/tests/documentacion/dependencias.test.js`

## El documento OpenAPI

### Cabecera

- `openapi: 3.0.3`.
- `info.title` es "API de AIPOS", `info.version` es "1.0.0" y `info.description` dice en pocas frases qué es AIPOS
  (un punto de venta de una sola pantalla), que no hay login y que el dinero va como texto con 2 decimales.
- `servers` tiene una sola entrada, `url: /`: una dirección relativa, así el botón "Try it out" de Swagger UI llama al
  mismo servidor que mostró la página, sea `localhost` o `aipos-back.salsalvador.io`. Como es el mismo origen, CORS no
  interviene.
- `tags` lleva una entrada por recurso en uso, con descripción: `Salud` hoy, `Productos` y `Ventas` cuando esas
  tarjetas agreguen su ruta.

### Rutas

- Cada ruta se escribe completa en `paths`, con `/api` (`/api/salud`), tal como la ve el cliente. Los parámetros van
  como `{id}`, no como `:id`.
- Cada operación tiene `operationId` único (el nombre de la función del glosario si existe: `crearProducto`,
  `buscarProductos`, `registrarVenta`), `summary` de una línea, `tags` y `responses`.
- Cada operación documenta el `500` con la respuesta reusable `ErrorInterno`. Si recibe cuerpo o parámetros, documenta
  también el `400` con `DatosInvalidos`.
- Solo se documentan los estados de RNF-05: `200` y `201` para el éxito, y `400`, `404`, `409`, `422` y `500` para los
  errores. Un estado fuera de esa lista rompe la prueba.
- Los campos del JSON van en `camelCase` (`codigoBarras`, `precioAplicado`) y el dinero como `type: string` con
  `pattern: '^\d{1,5}(\.\d{1,2})?$'`, igual que en "Dinero" de la arquitectura. Un ejemplo con el dinero como número
  está mal.

`[@test] ../backend/tests/documentacion/estructura-del-documento.test.js`

### `GET /api/salud`

- `operationId` `consultarSalud`, etiqueta `Salud`, sin parámetros y sin cuerpo.
- `200`: esquema `Salud` con `estado` (obligatorio, siempre `"ok"`) y `baseDeDatos` (opcional, siempre `"ok"`). El campo
  `baseDeDatos` solo aparece cuando la API comprueba MySQL (tarjeta B-03). Como es opcional, el documento vale igual
  antes y después de B-03.
- `500`: `ErrorInterno`. Cuando MySQL no responde, la API contesta con el formato de error y no con un estado nuevo
  (arquitectura, "Salud").
- El ejemplo del `200` es el cuerpo real: `{ "estado": "ok" }` sin B-03, y `{ "estado": "ok", "baseDeDatos": "ok" }` con
  B-03. La prueba llama a `/api/salud` y compara.

`[@test] ../backend/tests/documentacion/ejemplos-reales.test.js`

### El formato de error como esquema compartido

`components.schemas` tiene tres esquemas, con los nombres del formato de la arquitectura (`codigo`, `mensaje`,
`detalles`):

```yaml
RespuestaDeError:
  type: object
  required: [error]
  additionalProperties: false
  properties:
    error:
      type: object
      required: [codigo, mensaje]
      additionalProperties: false
      properties:
        codigo:   { type: string, pattern: '^[A-Z][A-Z0-9_]*$' }
        mensaje:  { type: string }
        detalles: { type: array, items: { $ref: '#/components/schemas/DetalleDeError' } }
DetalleDeError:
  type: object
  required: [campo, mensaje]
  additionalProperties: false
  properties: { campo: { type: string }, mensaje: { type: string } }
```

- `additionalProperties: false` en los dos niveles: si la API un día agregara un campo `stack` o `sql`, el documento lo
  declararía como no permitido.
- `detalles` solo lo lleva el `400`, y el `409` de código de barras repetido (arquitectura, "Errores").
- `components.responses` tiene una respuesta reusable por cada estado de error. Todas las rutas las usan con `$ref`, y
  ninguna escribe su propio esquema de error:

| Respuesta | Estado | `codigo` del ejemplo |
|---|---|---|
| `DatosInvalidos` | 400 | `DATOS_INVALIDOS`, con un elemento en `detalles` (el del ejemplo de la arquitectura) |
| `NoEncontrado` | 404 | `NO_ENCONTRADO` |
| `Conflicto` | 409 | `CODIGO_BARRAS_DUPLICADO`, con `detalles` que nombran `codigoBarras` |
| `ReglaDeNegocio` | 422 | `VENTA_SIN_DETALLES` |
| `ErrorInterno` | 500 | `ERROR_INTERNO`, con el mensaje "Ocurrió un error inesperado. Intenta de nuevo." |

- Los `mensaje` de los ejemplos son los que de verdad devuelve la API: A-01 los copia de las pruebas de errores de B-02
  y de las specs de cada ruta. No se inventan textos que la API no dice.
- Las cinco respuestas existen desde A-01, aunque hoy solo `ErrorInterno` la use una ruta. Así P-02, P-04 y V-03 solo
  escriben `$ref`.

`[@test] ../backend/tests/documentacion/estructura-del-documento.test.js`

### Ejemplos sin detalles internos

- Ningún ejemplo del documento (`example` y `examples[*].value`) muestra el stack, el texto de una consulta SQL ni el
  mensaje original de MySQL (RNF-04). La prueba recorre todos los ejemplos y falla si alguno contiene: un marco de
  stack (`at <función> (<archivo>:<línea>:<columna>)`), `node_modules`, `.js:<número>`, `stack`, `sql` (sin importar
  mayúsculas, así atrapa también `SQLSTATE`), `sequelize`, `mysql`, `errno`, `ER_` seguido de mayúsculas o una
  sentencia SQL en mayúsculas (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `CALL`, `DROP`).
- Cada ejemplo de error tiene la forma del esquema `RespuestaDeError`: `error.codigo` en mayúsculas con guion bajo,
  `error.mensaje` de texto, y `detalles` solo en el `400` y el `409`. Un ejemplo con otra forma rompe la prueba.
- El `ErrorInterno` es el caso que más importa: su ejemplo es una frase genérica, la misma que devuelve la API.

`[@test] ../backend/tests/documentacion/ejemplos-de-error.test.js`

### Ejemplos que dicen lo que la API hace

- La respuesta `200` de `GET /api/salud` de la documentación tiene la misma forma que la respuesta real.
- El `404` real de una ruta que no existe (`GET /api/no-existe`) usa el `codigo` que documenta `NoEncontrado`, y su
  cuerpo cumple el esquema `RespuestaDeError`.

`[@test] ../backend/tests/documentacion/ejemplos-reales.test.js`

### El documento es OpenAPI 3 válido

- `SwaggerParser.validate('backend/docs/openapi.yaml')` no lanza error. Si el documento se rompe (por ejemplo, una
  respuesta sin `description` o un `$ref` que no existe), la prueba falla con el mensaje del validador.
- La prueba también valida una copia rota a propósito y espera que falle: así se sabe que el validador no aprueba
  cualquier cosa.

`[@test] ../backend/tests/documentacion/openapi-valido.test.js`

## Swagger UI en `GET /api/docs`

Se monta con `swagger-ui-express` 5.0.1 dentro de `src/routes/docs.js`, y `src/routes/index.js` lo monta en `/docs`
(o sea, `/api/docs`), fuera de `montajes` (ver "La prueba de rutas documentadas"). Dentro del router:

```js
router.use(swaggerUi.serve); // los archivos de Swagger UI: CSS, JS, íconos
router.get('/', swaggerUi.setup(documento, { customSiteTitle: 'API de AIPOS', swaggerOptions: { validatorUrl: null } }));
```

- Se usa `router.get('/', …)` y no `router.use('/', serve, setup)`, que es la forma del README de la librería. Se
  comprobó el 2026-09-30 con Express 5.2.1: con `use('/', serve, setup)`, un `POST /api/docs/` y un `GET /api/docs/nada`
  responden 200 con la página. Eso rompe RNF-05 (una ruta que no existe es un 404 con el formato de error). Con `get`, el
  `POST` y la ruta desconocida siguen a `noEncontrado` y responden `404 NO_ENCONTRADO`.
- `GET /api/docs` (sin la barra final) responde 301 hacia `/api/docs/`. Es lo que hace la librería y se deja así: el
  navegador la sigue solo.
- `validatorUrl: null` apaga el validador en línea de Swagger UI. Sin eso, la página llama a un servicio externo con el
  documento, y AIPOS corre en local sin servicios externos.
- El documento se lee una vez, al arrancar. Si `openapi.yaml` no existe o no es YAML, el arranque falla con un mensaje
  que nombra el archivo, igual que una variable de entorno que falta.
- El orden de los middlewares no cambia (arquitectura: helmet, cors, `express.json`, rutas de `/api`): Swagger UI vive
  en las rutas de `/api`, después de helmet. El CORS tampoco cambia: `methods` sigue en `GET` y `POST`.

`[@test] ../backend/tests/documentacion/swagger-ui.test.js`

### La política de contenido solo en `/api/docs`

- La política de contenido (CSP) es la regla que le dice al navegador qué estilos y scripts puede cargar la página.
  `src/routes/docs.js` pone la suya con `helmet.contentSecurityPolicy`, antes de `serve`, y solo dentro del router de
  `/api/docs`. Reemplaza la que puso helmet en toda la API:

```js
router.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: { 'style-src': ["'self'", "'unsafe-inline'"], 'upgrade-insecure-requests': null },
  }),
);
```

- Por qué: Swagger UI escribe estilos en línea, y sin `'unsafe-inline'` en `style-src` la página sale sin estilos. Con
  la configuración de helmet 8.3.0 sin tocar (`helmet()`), el `style-src` ya los permite y la página se ve. Aun así se
  escribe explícito: si B-02 o un cambio futuro endurece la política general (por ejemplo, `style-src 'self'`), la
  documentación de la API no se rompe y el resto de la API sigue estricto. También se quita `upgrade-insecure-requests`
  solo aquí, para que la página se pueda abrir por `http` desde otra máquina de la red local sin que el navegador pida
  los archivos por `https`.
- Comprobado el 2026-09-30 con Chrome en modo sin pantalla y helmet 8.3.0: la página carga y muestra `GET /api/salud` con
  la política por defecto y con esta política. No se comprobó "Try it out" en un navegador: lo comprueba A-01 con el MCP
  `chrome-devtools` (ver "Pruebas en local").
- `GET /api/salud` y las demás rutas conservan la política de helmet tal cual, con `upgrade-insecure-requests`. La
  prueba compara las dos cabeceras.
- No se relaja nada más: ni `script-src` (Swagger UI trae su script inicial como archivo, `swagger-ui-init.js`, no en
  línea), ni `connect-src`, ni se agrega ningún origen externo.

`[@test] ../backend/tests/documentacion/csp-docs.test.js`

## La prueba de rutas documentadas

Una prueba compara las rutas que Express tiene registradas con las del documento, y falla si no son las mismas. Así
una ruta nueva sin documentar no llega a `main`, y una documentación de una ruta que ya no existe tampoco.

- Se compara `MÉTODO /ruta` en los dos lados, con los parámetros como `{id}`. `GET /api/salud` es una entrada;
  `POST /api/productos` y `GET /api/productos` son dos.
- `/api/docs` y lo que cuelga de ella no se documentan: la página no se describe a sí misma. Es la única excepción y
  está escrita en la prueba, no en el documento.
- Los mensajes de la prueba dicen qué falta y dónde: "Ruta sin documentar: `POST /api/ventas`. Agrégala a
  `backend/docs/openapi.yaml`." y "Ruta documentada que no existe en Express: `GET /api/viejo`."

### Cómo se listan las rutas con Express 5

En Express 5 el router vive en `app.router` (`app._router` ya no existe). Cada capa de su `stack` tiene `route`
(`route.path` y `route.methods`) si es una ruta, y es un router hijo si es un `use`. Lo que Express 5 ya no guarda es la
ruta con la que se montó el router hijo: la capa no tiene `regexp` ni `path` (comprobado con Express 5.2.1). Por eso
`src/routes/index.js` es el que sabe los prefijos y los exporta:

```js
// src/routes/index.js (boceto)
const montajes = [
  { prefijo: '/salud', router: salud },
  // { prefijo: '/productos', router: productos },  las agregan P-02 y V-03
];
for (const { prefijo, router: hijo } of montajes) router.use(prefijo, hijo);
router.use('/docs', docs); // fuera de `montajes`: la documentación no se documenta a sí misma
module.exports = router;
module.exports.montajes = montajes;
```

```js
// tests/documentacion/rutas.js (boceto): las rutas de la app, como 'MÉTODO /ruta'
function listarRutasRegistradas(montajes) {
  const rutas = [];
  for (const { prefijo, router } of montajes) {
    for (const capa of router.stack) {
      if (!capa.route) throw new Error(`En ${prefijo} hay algo que no es una ruta: la prueba no lo entiende.`);
      const sub = capa.route.path === '/' ? '' : capa.route.path;
      if (/[*(){}]/.test(sub)) throw new Error(`La ruta ${sub} usa una sintaxis que la prueba no entiende.`);
      for (const metodo of Object.keys(capa.route.methods)) {
        rutas.push(`${metodo.toUpperCase()} /api${prefijo}${sub}`.replace(/:(\w+)/g, '{$1}'));
      }
    }
  }
  return rutas.sort();
}
```

- Cada archivo de `src/routes/` (salvo `index.js` y `docs.js`) se monta en `montajes`. Un router que se monte de otra
  forma no lo ve la prueba, y por eso la prueba lo cuida (siguiente punto).
- La prueba falla si el router de `/api` (el que exporta `routes/index.js`) tiene una capa que no sea un router de
  `montajes` ni el de `docs`, si `app.router` tiene una ruta registrada directo en `app`, o si `app.router` monta algo
  distinto del router de `/api` (además de los middlewares que son funciones, como `noEncontrado` y `errorHandler`).
  Así una ruta puesta "por el camino corto" también rompe la prueba.
- Un `router.all`, un comodín (`*`), un parámetro opcional (`{/:id}`) o una expresión regular en una ruta hacen fallar
  la prueba con un mensaje claro. AIPOS no las usa; si algún día hacen falta, se amplía la prueba en esa tarjeta.
- Los métodos vienen de `route.methods`. Express 5 no agrega `HEAD` ahí, y `HEAD` no se documenta.
- Las funciones `listarRutasRegistradas`, `listarRutasDocumentadas` y `compararRutas` viven en
  `backend/tests/documentacion/rutas.js`, sin usar `app.listen`. `compararRutas(registradas, documentadas)` es pura y
  devuelve `{ sinDocumentar, sinRuta }`, para poder probarla con una app falsa.
- Patrón: ninguno del catálogo describe "una prueba que compara el código con su documento". El más cercano es
  Layer-Specific Logic Testing, que pide probar cada cosa en la capa donde vive; aquí la prueba mira la capa de rutas,
  no la de servicios.

`[@test] ../backend/tests/documentacion/rutas-documentadas.test.js`
`[@test] ../backend/tests/documentacion/comparar-rutas.test.js`

### La prueba se prueba a sí misma

`comparar-rutas.test.js` arma una app de Express falsa, con una ruta que el documento no tiene (`GET /api/extra`), y
espera `sinDocumentar: ['GET /api/extra']`. Arma otra con el documento de verdad pero sin una ruta que el documento sí
tiene, y espera `sinRuta`. Sin esta prueba no se sabría si la de arriba de verdad falla cuando debe.

## Glosario y alcance

- El glosario (`docs/lenguaje-ubicuo.md`) agrega «documentación de la API», que la persona desarrolladora aprueba
  (subtarea de A-01) y que la tarjeta cita como su término. Entrada propuesta: *El documento OpenAPI 3 del backend
  (`backend/docs/openapi.yaml`) y la página de Swagger UI en `GET /api/docs` que lo muestra. Describe cada ruta de la
  API, lo que recibe, lo que responde y su formato de error. No decir: doc de la API, Swagger a secas (Swagger UI es la
  página; OpenAPI es el formato). Ejemplo: "La ruta de crear producto está en la documentación de la API".*
- También se propone «formato de error»: *La forma única de toda respuesta de error de la API: `{ "error": { "codigo",
  "mensaje", "detalles" } }`. Está descrita en la spec de arquitectura y en el esquema `RespuestaDeError` de la
  documentación de la API.*
- `requerimientos/01-alcance.md` suma la fila «Documentación de la API» a "Lo que agregamos y el PDF no pide", con su
  porqué: la persona desarrolladora la pidió el 2026-09-30 y el PDF no la pide.
- `requerimientos/04-entregables.md` suma la fila de A-01 a la tabla del entregable base (área Backend y Documentación,
  rama `feature/base`, depende de B-02, 1 h), y sus horas al total.

`[@test] ../tests/documentacion/glosario-y-alcance.test.sh`

## Qué tarjeta implementa cada parte

| Parte | Tarjeta |
|---|---|
| `openapi.yaml` con la cabecera, `GET /api/salud`, los esquemas y las respuestas de error | A-01 |
| `src/documentacion.js`, `src/routes/docs.js`, `montajes` en `src/routes/index.js` y la política de contenido | A-01 |
| La prueba de rutas documentadas y las demás pruebas de esta spec | A-01 |
| Glosario, `01-alcance.md` y `04-entregables.md` | A-01 |
| Campo `baseDeDatos` de `GET /api/salud` en el documento, si B-03 llega después de A-01 | B-03 (el orden del plan es B-02, B-03 y A-01, así que normalmente ya lo hace A-01) |
| `POST /api/productos` (`crearProducto`): cuerpo, `201`, `400`, `409` y `500` | P-02 |
| `GET /api/productos?busqueda=` (`buscarProductos`): parámetro, `200`, `400` y `500` | P-04 |
| `POST /api/ventas` (`registrarVenta`): cuerpo, `201`, `400`, `422` y `500` | V-03 |
| Que `https://aipos-back.salsalvador.io/api/docs` responda en producción | D-01 |

- P-02, P-04 y V-03 tienen la subtarea «Documentar la ruta en la documentación de la API». La cumplen en el mismo PR
  que crea la ruta: agregan la ruta a `montajes` y su entrada a `openapi.yaml` con sus esquemas, sus ejemplos y los
  `$ref` a las respuestas de error. Si falta cualquiera de las dos, `npm test` falla. Su spec dice el detalle de su
  cuerpo y de sus respuestas; esta solo fija cómo se documenta.
- D-01 no toca el documento. Solo comprueba, después del despliegue, que el proxy deja pasar `/api/docs` (ver
  "Pruebas en local").

## Criterios de aceptación

Los cuatro primeros son los de la tarjeta A-01; los demás los agrega esta spec.

- Dado el backend corriendo, cuando se abre `/api/docs`, entonces se ve Swagger UI con `GET /api/salud`.
  `[@test] ../backend/tests/documentacion/swagger-ui.test.js`
- Dada una ruta de Express sin documentar, cuando corre `npm test`, entonces la prueba falla y dice cuál es.
  `[@test] ../backend/tests/documentacion/comparar-rutas.test.js`
- El documento pasa la validación de OpenAPI 3.
  `[@test] ../backend/tests/documentacion/openapi-valido.test.js`
- Los ejemplos de error no muestran el stack ni el SQL.
  `[@test] ../backend/tests/documentacion/ejemplos-de-error.test.js`
- Dada una ruta documentada que ya no existe en Express, cuando corre `npm test`, entonces la prueba falla y dice cuál
  es.
  `[@test] ../backend/tests/documentacion/comparar-rutas.test.js`
- Dada una ruta registrada por fuera de `montajes` (directo en `app` o en el router de `/api`), cuando corre `npm test`,
  entonces la prueba falla.
  `[@test] ../backend/tests/documentacion/rutas-documentadas.test.js`
- Dado un `POST /api/docs/` o un `GET /api/docs/nada`, cuando se llama, entonces la API responde 404 `NO_ENCONTRADO` con
  el formato de error.
  `[@test] ../backend/tests/documentacion/swagger-ui.test.js`
- Dado `GET /api/docs` sin la barra final, cuando se llama, entonces responde 301 hacia `/api/docs/`.
  `[@test] ../backend/tests/documentacion/swagger-ui.test.js`
- Dado helmet activo, cuando se pide `/api/docs/`, entonces la política de contenido permite estilos en línea y no lleva
  `upgrade-insecure-requests`; y cuando se pide `/api/salud`, entonces conserva la de helmet completa.
  `[@test] ../backend/tests/documentacion/csp-docs.test.js`
- Dada cualquier respuesta de error del documento, entonces usa el esquema `RespuestaDeError` con `$ref`, y solo con los
  estados 400, 404, 409, 422 y 500.
  `[@test] ../backend/tests/documentacion/estructura-del-documento.test.js`
- Dado el ejemplo del `200` de `GET /api/salud`, cuando se llama a la ruta, entonces la respuesta tiene la misma forma.
  `[@test] ../backend/tests/documentacion/ejemplos-reales.test.js`
- Dado un `npm ci` en `backend/`, entonces `swagger-ui-express` queda en 5.0.1 y `swagger-ui-dist` en 5.33.0.
  `[@test] ../backend/tests/documentacion/dependencias.test.js`

## Pruebas en local

Además de `npm test`, A-01 prueba su cambio con el sistema corriendo (ver "Pruebas en local" en la arquitectura). Con el
backend arrancado (`npm run dev` y MySQL migrado, puerto 3000 o el de `PORT`):

**La API, con `curl`:**

| Comando | Respuesta esperada |
|---|---|
| `curl -si localhost:3000/api/docs` | `301` con `Location: /api/docs/` |
| `curl -si localhost:3000/api/docs/` | `200`, `Content-Type: text/html`, y una `Content-Security-Policy` sin `upgrade-insecure-requests` |
| `curl -s localhost:3000/api/docs/swagger-ui-init.js` | Un JavaScript que contiene `"/api/salud"` |
| `curl -si localhost:3000/api/salud` | `200`, el mismo cuerpo que el ejemplo del documento, y la política de contenido de helmet con `upgrade-insecure-requests` |
| `curl -si -X POST localhost:3000/api/docs/` | `404` con `{"error":{"codigo":"NO_ENCONTRADO", ...}}` |
| `curl -si localhost:3000/api/docs/nada` | `404` con el mismo formato |

**La pantalla de Swagger UI, en el navegador con el MCP `chrome-devtools`:**

1. `navigate_page` a `http://localhost:3000/api/docs`, y `take_snapshot`: se ve "API de AIPOS" y la operación
   `GET /api/salud`.
2. `click` en la operación, en "Try it out" y en "Execute": la respuesta es `200` con `{"estado":"ok"}` (o con
   `baseDeDatos` si B-03 ya está).
3. `list_console_messages` no muestra errores, y `list_network_requests` no muestra ninguna llamada a otro dominio
   (el validador en línea está apagado).
4. `take_screenshot` de la página, y se guarda para el PR.

Si la sesión no tiene el MCP `chrome-devtools`, lo dice, y la persona desarrolladora hace esos pasos a mano. Cuando el
servidor de producción ya esté desplegado (tarjeta D-01), se repite `curl -sIL https://aipos-back.salsalvador.io/api/docs`
y se espera un `200` final. El agente anota el resultado de cada comando en su "Update" de la tarjeta.

Cada bug relevante que aparezca se abre como un issue de GitHub con los pasos para reproducirlo (`gh issue create`) y se
cierra con un comentario que nombra el commit que lo corrige. Estas reglas son de proceso: no tienen una prueba
automática, y se comprueban en la revisión del PR.

## Cómo se decidió el diseño

Se consultó el MCP `design-patterns` antes de cada decisión:

| Decisión | Patrón | Por qué, en una frase |
|---|---|---|
| Un documento OpenAPI y Swagger UI | Ninguno del catálogo | Los que salen (Versioning, API Gateway, API Composition) resuelven otras cosas; se sigue la práctica estándar de OpenAPI. |
| El formato de error como esquema compartido | Ninguno del catálogo | Los que salen son de React o de programación funcional; se usa `$ref` de OpenAPI para no repetir el formato. |
| `montajes` en `routes/index.js` | Registry (el más cercano) | Un solo lugar dice qué routers hay y con qué prefijo, y la prueba lo consulta; Express 5 ya no guarda ese prefijo. |
| La prueba de rutas documentadas | Layer-Specific Logic Testing (el más cercano) | Se prueba en la capa de rutas, que es donde vive lo que se compara. |
| CSP propia solo en `/api/docs` | Ninguno del catálogo | Es configuración de helmet; la regla es dejar estricto todo lo demás y relajar lo mínimo donde hace falta. |
| Sin capa nueva para la documentación | Layered Architecture, de la arquitectura | `docs.js` es una ruta más y no tiene reglas de negocio; un controller o un servicio solo reenviarían la llamada. |
