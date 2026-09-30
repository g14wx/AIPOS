---
name: Arquitectura de AIPOS
description: Tecnologías y versiones, carpetas, capas, errores, dinero, base de datos, pruebas, calidad, diseño de la pantalla y forma de trabajar con Git, para que una sesión nueva tome cualquier tarjeta sin volver a preguntar lo que ya se decidió
targets:
  - ../backend/**
  - ../frontend/**
  - ../docker-compose.yml
  - ../.env.example
  - ../.nvmrc
  - ../.gitignore
  - ../AGENTS.md
  - ../docs/lenguaje-ubicuo.md
  - ../requerimientos/03-requerimientos-no-funcionales.md
  - ../requerimientos/04-entregables.md
  - ../requerimientos/flujos/05-entregar-un-entregable.md
  - ../tests/arquitectura/spec-arquitectura.test.sh
  - ../tests/arranque/agents-md-tarjeta.test.sh
---

# Arquitectura de AIPOS

Esta es la spec de arquitectura: la constitución del proyecto para SDD (desarrollo guiado por specs). Dice con qué
se construye AIPOS, dónde va cada cosa y cómo se prueba. Las specs de cada flujo (crear producto, buscar producto,
armar la venta actual, registrar venta, documentación de la API y despliegue) se apoyan en esta y no repiten lo que
ya dice aquí. Una sesión nueva de Claude Code o de Codex toma una tarjeta del tablero AIPOS y programa sin volver
a preguntar lo que ya se decidió.

Si esta spec choca con otro documento, manda este orden: `requerimientos/`, esta spec, las reglas de los tiles.
Cuando una regla de un tile pide otra cosa, la spec dice por qué se aparta (por ejemplo en "Dinero").

Las versiones se comprobaron con `npm view` el 2026-09-30. Los ejemplos de la spec no son código final: los
escriben las tarjetas B-02, B-03 y B-04, y esas pruebas son las que enlazan los `[@test]`.

## Monorepo

AIPOS es un monorepo (un solo repositorio de git con dos proyectos npm, uno por parte). Cada proyecto tiene su
`package.json` y su `package-lock.json`, que se sube a git. Se instala con `npm ci`, no con `npm install`.

```text
AIPOS/
  .env.example              variables de entorno de todo el proyecto, sin secretos
  .nvmrc                    24
  docker-compose.yml        MySQL para desarrollo y pruebas
  backend/                  la API: Node.js, Express y Sequelize
  frontend/                 la pantalla: Vue 2, Vuetify 2 y Vite
  docs/  requerimientos/  specs/  tessl-plugins/  tests/   (ya existen)
```

- `.nvmrc` dice `24`. Los dos `package.json` llevan `"engines": { "node": ">=24" }`.
- No hay `package.json` en la raíz. Cada comando npm se corre dentro de `backend/` o de `frontend/`.
- `.gitignore` deja fuera `.env`, `node_modules/`, `frontend/dist/` y `coverage/`.
- El `.env` real vive solo en la raíz y no va a git. El backend y el frontend leen ese mismo archivo (ver
  "Variables de entorno").

`[@test] ../backend/tests/estructura.test.js`

## Versiones

Todas las versiones van fijas, sin `^` ni `~`. Así dos clones distintos instalan lo mismo. La spec no usa `latest`
de ningún paquete: en varios de estos, `latest` rompe el proyecto (Vue 3, Vuetify 4 y Vite 8 no funcionan con Vue 2).

| Parte | Paquete | Versión | Nota |
|---|---|---|---|
| Los dos | Node.js | 24 (`.nvmrc`) | Es la LTS. Vite 7 pide 22.12 o más, Vitest 5 pide 22.12 o 24, y jsdom 30 pide 24.15 o más. |
| Backend | `express` | 5.2.1 | La 5 pasa al manejador de errores los errores de las funciones `async`. |
| Backend | `sequelize` | 6.37.8 | La 7 sigue en alfa. Nunca `@sequelize/*`. |
| Backend | `mysql2` | 3.24.5 | Nunca el paquete `mysql`: no entra con `caching_sha2_password`. |
| Backend | `sequelize-cli` | 6.6.5 | Migraciones. Va en `dependencies`, no en `devDependencies`: la imagen de producción no instala las de desarrollo y las migraciones corren dentro de ella (spec de despliegue). |
| Backend | `cors` | 2.8.6 | |
| Backend | `helmet` | 8.3.0 | Cabeceras de seguridad. |
| Backend | `dotenv` | 18.0.4 | Lee el `.env` de la raíz. |
| Frontend | `vue` | 2.7.16 | La última de Vue 2. |
| Frontend | `vuetify` | 2.7.2 | Con su CSS ya compilado (`vuetify/dist/vuetify.min.css`). Sin `sass`. |
| Frontend | `vite` | 7.3.6 | Nunca la 8: rompe `@vitejs/plugin-vue2`. |
| Frontend | `@vitejs/plugin-vue2` | 2.3.4 | |
| Frontend | `axios` | 1.20.0 | Nunca `1.14.1` ni `0.30.4` (versiones maliciosas). |
| Frontend | `@mdi/font` | 7.4.47 | Íconos MDI. |
| Frontend | `lottie-web` | 5.13.0 | Animaciones. Versión fija. |
| Pruebas | `vitest` | 5.0.2 | En backend y en frontend. |
| Pruebas | `supertest` | 7.3.0 | Solo backend. |
| Pruebas | `jsdom` | 30.1.1 | Solo frontend. |
| Pruebas | `@vue/test-utils` | 1.3.6 | Solo frontend. Es la versión 1, la de Vue 2. |
| Pruebas | `vue-template-compiler` | 2.7.16 | Solo frontend. `@vue/test-utils` 1 lo pide como dependencia. |
| Calidad | `eslint` | 10.11.0 | Solo configuración plana. |
| Calidad | `@eslint/js` | 10.0.1 | |
| Calidad | `globals` | 17.12.0 | |
| Calidad | `eslint-config-prettier` | 10.1.8 | Apaga las reglas de ESLint que chocan con Prettier. |
| Calidad | `prettier` | 3.9.9 | |
| Calidad | `eslint-plugin-vue` | 10.11.1 | Solo frontend, con la configuración `flat/vue2-recommended`. |
| Calidad | `vue-eslint-parser` | 10.4.1 | Solo frontend. `eslint-plugin-vue` lo pide como dependencia: se instala aparte y fijo. |

Comprobado en local (2026-09-30, con Node 26.9): Vitest 5.0.2 corre pruebas de un backend en CommonJS, sea con
`import` o con `require`; y corre pruebas de componentes de Vue 2 con `@vitejs/plugin-vue2` 2.3.4, `@vue/test-utils`
1.3.6, jsdom 30.1.1 y Vuetify 2.7.2, con un alias solo para las pruebas (ver "Frontend"). `lottie-web` no carga en
jsdom (falla al pedir un lienzo), por eso las pruebas sustituyen con `vi.mock` la ruta exacta que importa
`AnimacionLottie`, `lottie-web/build/player/lottie_light`: `vi.mock('lottie-web')` no la cubre. Las pruebas mínimas de
B-02 y de B-04 dejan eso escrito como prueba, para que un cambio de versión lo avise.

- Si una tarjeta necesita otro paquete, primero lo consulta con `npm view`, lo fija exacto y lo anota en su PR.
- `express-validator`, `joi`, `zod`, `morgan`, `winston` y `pinia` o `vuex` no entran: no hacen falta (ver
  "Validación", "Errores" y "Frontend").

`[@test] ../backend/tests/estructura.test.js`
`[@test] ../backend/tests/vitest-commonjs.test.js`
`[@test] ../frontend/tests/vitest-vue2.test.js`

## Variables de entorno

Hay un solo archivo de ejemplo, `.env.example`, en la raíz. Se copia a `.env` y se editan los valores. El
`.env.example` no lleva secretos: las claves empiezan con `cambiar-` y avisan con un comentario.

```dotenv
# Docker Compose: el nombre del proyecto separa contenedores y volúmenes de dos copias del repo.
COMPOSE_PROJECT_NAME=aipos

# Backend
PORT=3000
CORS_ORIGIN=http://localhost:5173

# MySQL. MYSQL_PORT es el puerto del host; dentro de Docker MySQL siempre usa el 3306.
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=aipos
MYSQL_TEST_DATABASE=aipos_prueba
MYSQL_USER=aipos
MYSQL_PASSWORD=cambiar-esta-clave
MYSQL_ROOT_PASSWORD=cambiar-esta-clave-de-root

# Frontend (Vite solo deja pasar al navegador lo que empieza con VITE_)
FRONTEND_PORT=5173
VITE_API_URL=http://localhost:3000
```

- `CORS_ORIGIN` es el origen de la pantalla como lo manda el navegador en la cabecera `Origin`: `http` o `https`, el
  servidor y, si no es el puerto por defecto, el puerto (`http://localhost:5173`, `https://aipos.salsalvador.io`). Va en
  minúsculas, sin ruta, sin barra final y sin escribir el puerto 80 ni el 443. Puede llevar varios separados por coma.
  Nunca `*`. Si un origen no cumple, el arranque falla con un mensaje que nombra la variable.
- `VITE_API_URL` es la dirección del backend, sin `/api` al final. El servicio de API de la pantalla le agrega
  `/api`. La ruta base de producción la fija la spec de despliegue.
- `MYSQL_ROOT_PASSWORD` solo lo usan Docker Compose y el script que crea la base de prueba. La API nunca entra a
  MySQL como `root`.
- Los nombres `MYSQL_*` son los que entiende la imagen `mysql:8.4`, y el backend usa los mismos para no repetirlos.
- El backend carga el `.env` de la raíz con `dotenv` (`path` hacia `../.env`). Una variable que ya esté en el
  entorno gana sobre el archivo. Vite lee el mismo archivo con `envDir: '..'` en `vite.config.js`.
- `src/config.js` es el único lugar donde el backend lee `process.env`. Si falta una variable obligatoria
  (`MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD` y `CORS_ORIGIN`), el arranque falla con un mensaje que nombra la
  variable. `PORT`, `MYSQL_HOST` y `MYSQL_PORT` tienen valor por defecto (3000, `127.0.0.1` y 3306). `PORT` y
  `MYSQL_PORT` son enteros de 1 a 65535: con otro valor el arranque falla.
- Cada variable que lee `src/config.js` está en `.env.example`, y ninguna lleva un valor que parezca un secreto real.
- El patrón de diseño: ninguno del catálogo describe un archivo `.env`; se sigue la práctica de configuración por
  entorno, con un solo lugar de lectura.

`[@test] ../backend/tests/config.test.js`
`[@test] ../backend/tests/env-example.test.js`

## Backend

Node 24, CommonJS (`"type"` no se declara, así que los `.js` son CommonJS), Express 5.2.1, Sequelize 6.37.8 y mysql2
3.24.5. Cada archivo CommonJS (`src/`, `db/` y `.sequelizerc`) empieza con `'use strict';`. Las pruebas y los `.mjs`
son ESM.

### Carpetas

```text
backend/
  package.json  package-lock.json  .sequelizerc  eslint.config.mjs  .prettierrc.json  vitest.config.mjs
  docs/
    openapi.yaml              la documentación de la API (OpenAPI 3). La crea la tarjeta A-01 (spec de documentación de la API)
  db/
    config.js                 lee src/config.js y arma development, test y production para sequelize-cli
    migrations/               migraciones, CommonJS
    procedimientos/           un .sql por procedimiento almacenado, con DELIMITER $$
  scripts/
    crear-base-de-prueba.js   crea la base de prueba y le da permiso al usuario de la app
  src/
    app.js                    arma la app Express y no escucha ningún puerto
    servidor.js               arranca la app en PORT (con el puerto ocupado, avisa y sale con código 1)
    config.js                 lee y valida las variables de entorno
    database.js               la instancia de Sequelize
    routes/                   un router por recurso: salud.js, productos.js, ventas.js, index.js (A-01 suma docs.js)
    documentacion.js          lee openapi.yaml para /api/docs (A-01)
    controllers/              un controller por recurso
    services/                 la lógica de negocio: salud.js, productos.js, ventas.js
    models/                   Producto.js, Venta.js, DetalleVenta.js, index.js
    validators/               comunes.js y un archivo por recurso
    errors/                   ErrorApi.js y desdeBaseDeDatos.js
    middlewares/              errorHandler.js y noEncontrado.js
  tests/                      las pruebas de Vitest, con la misma forma que src/
```

- Los nombres del negocio van en español (`Producto`, `crearProducto`, `registrarVenta`, `codigoBarras`) y lo técnico
  del framework en inglés (`routes`, `controllers`, `models`, `errorHandler`), según el glosario. Sin nombres vagos:
  `Manager`, `Helper`, `Processor`, `Data`, `Info` ni `Util`.
- Las rutas de la API van en español y en plural, todas bajo `/api`: `/api/salud`, `/api/productos`, `/api/ventas`.
  Los verbos y los cuerpos de cada ruta los fija la spec de su flujo.
- Los campos del JSON van en `camelCase` (`codigoBarras`, `precioAplicado`). Las columnas de MySQL van en
  `snake_case` (`codigo_barras`, `precio_aplicado`). El modelo de Sequelize hace la traducción con `field`.
- `app.js` no escucha un puerto: así las pruebas usan `supertest(app)` sin abrir uno. Solo `servidor.js` escucha.
  `app.js` exporta la app ya armada y, en `app.crearApp(config, { montajes })`, la fábrica para armar otra con otra
  configuración u otros `montajes`. Si el puerto está ocupado, `servidor.js` escribe `EADDRINUSE` y sale con código 1; con
  `SIGINT` o `SIGTERM` (Docker manda `SIGTERM`) deja terminar las peticiones en curso y sale con 0.
- `src/routes/index.js` lo crea B-02. Exporta `montajes`, una lista de `{ ruta, router }` (al principio solo
  `{ ruta: '/salud', router: salud }`), y `crearRouterApi(lista = montajes)`, que monta cada router en su ruta y
  devuelve el router de `/api`. La tarjeta que crea una ruta agrega su router a `montajes` y su entrada a la
  documentación de la API (spec de documentación de la API): así una ruta sin documentar rompe `npm test`. `/api/docs`
  (A-01) se monta aparte, fuera de `montajes`.
- Los archivos que comparten las tarjetas de un mismo recurso (`routes/productos.js`, `controllers/productos.js`,
  `services/productos.js`, `validators/productos.js` y `validators/comunes.js` con su prueba `validacion-comun.test.js`)
  los crea la primera de esas tarjetas que se integra en la rama de su entregable. Las demás los juntan: ponen su rama
  al día con la de su entregable y agregan lo suyo a los mismos archivos, y la que necesita una pieza de `comunes.js`
  que todavía no está la agrega. En productos, P-02 y P-04 corren a la vez, y P-03 y P-05 corren a la vez: comparten
  `frontend/src/api/productos.js` (P-03 agrega `crearProducto` y P-05 `buscarProductos`), y la que se integra primero lo
  crea y la otra conserva las dos funciones. En ventas, V-05, V-06 y V-07 corren a la vez y comparten `VentaActual.vue`,
  `src/ventaActual/ventaActual.js`, `src/ventaActual/validaciones.js` y `frontend/tests/pantalla-venta-actual.test.js`
  (spec de armar la venta actual).
- Los scripts de `package.json` del backend:

| Comando | Qué hace |
|---|---|
| `npm run dev` | `node --watch src/servidor.js` |
| `npm start` | `node src/servidor.js` |
| `npm test` | `vitest run`. Desde B-03 necesita MySQL levantado (ver "Base de datos"): el de B-02 no. |
| `npm run test:vigilar` | `vitest`, se vuelve a correr al guardar. |
| `npm run migrar` | `sequelize-cli db:migrate` |
| `npm run deshacer` | `sequelize-cli db:migrate:undo` (la última migración) |
| `npm run rehacer` | `sequelize-cli db:migrate:undo:all`, y después `sequelize-cli db:migrate` |
| `npm run migrar:prueba` | lo mismo que `migrar`, con `--env test` |
| `npm run deshacer:prueba` | lo mismo que `deshacer`, con `--env test` |
| `npm run rehacer:prueba` | lo mismo que `rehacer`, con `--env test` |
| `npm run preparar-prueba` | `node scripts/crear-base-de-prueba.js`. B-02 deja el comando; el script y `docker-compose.yml` los crea B-03. |
| `npm run lint` | `eslint .` |
| `npm run format` | `prettier --write .` |
| `npm run format:check` | `prettier --check .` |

- `.sequelizerc` apunta a `db/config.js`, `db/migrations` y `src/models` con `path.resolve`.
- Patrón: Layered Architecture, con Service Layer para la lógica de negocio. Encaja porque RNF-06 pide justo esas
  capas y con tres recursos no hace falta más.

`[@test] ../backend/tests/estructura.test.js`
`[@test] ../backend/tests/servidor.test.js`

### Capas

La petición baja por las capas y la respuesta sube. Cada capa solo llama a la de abajo.

| Capa | Carpeta | Qué hace | Qué no hace |
|---|---|---|---|
| Rutas | `src/routes/` | Une un verbo y una ruta con una función del controller. | No toca modelos, Sequelize ni SQL. |
| Controladores | `src/controllers/` | Lee `req`, llama al validador y al servicio, y responde con `res`. | No tiene reglas de negocio y no toca modelos. |
| Servicios | `src/services/` | Las reglas de negocio: qué se guarda, qué se rechaza. Llama a los modelos y a `CALL sp_...`. | No conoce `req` ni `res` ni Express. |
| Modelos | `src/models/` | Las tablas de Sequelize, con `tableName` explícito. | No tiene reglas de negocio. |

- Un controller es una función `async (req, res)`. En Express 5 no necesita `try/catch` ni `next`: una promesa
  rechazada llega sola al manejador de errores.
- Un servicio lanza `ErrorApi` para las reglas de negocio. El manejador de errores lo convierte en respuesta.
- Los servicios reciben datos ya validados y limpios. La validación de la forma de la petición va en el controller,
  antes de llamar al servicio.
- Los modelos se crean con `tableName` explícito, `freezeTableName: true`, `underscored: true` y
  `timestamps: false`. Las tablas no llevan `createdAt` ni `updatedAt`: `ventas.fecha` es la única fecha y la pone
  MySQL. Así no hay que arreglar los `NOT NULL` que sequelize-cli deja sin valor por defecto.
- Patrón: no se agrega una capa Repository ni Data Mapper aparte encima de Sequelize. El catálogo los ofrece, pero
  con tres tablas serían archivos que solo reenvían llamadas al modelo.

`[@test] ../backend/tests/estructura.test.js`
`[@test] ../backend/tests/base-de-datos/modelo-producto.test.js`
`[@test] ../backend/tests/base-de-datos/modelos-venta.test.js`

### Procedimientos almacenados

- Cada procedimiento tiene un `.sql` en `backend/db/procedimientos/` con este orden: `DROP PROCEDURE IF EXISTS`,
  y después el bloque `CREATE PROCEDURE … END` entre `DELIMITER $$` y `$$`. Así también corre con el cliente
  `mysql`, con el usuario de la app y nunca con `root`.
- La migración que lo crea lee ese mismo `.sql`, saca solo lo que está entre la línea `DELIMITER $$` y el `$$` final,
  y manda `DROP` y `CREATE PROCEDURE … END` en dos llamadas separadas a `queryInterface.sequelize.query()`. Nunca
  manda `DELIMITER`, ni `DEFINER=`, ni `CREATE OR REPLACE PROCEDURE`, y no activa `multipleStatements`.
- Un procedimiento que escribe maneja su propia transacción (`START TRANSACTION … COMMIT`) con
  `DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;`. Las reglas de negocio fallan con
  `SIGNAL SQLSTATE '45000'` y un código en mayúsculas con guion bajo en `MESSAGE_TEXT` (por ejemplo
  `VENTA_SIN_DETALLES`).
- La API lo llama sin `sequelize.transaction()`: `sequelize.query('CALL sp_registrar_venta(:detalles)',
  { replacements: { detalles: JSON.stringify(detalles) } })`, y lee `filas[0]`. Sin `QueryTypes.SELECT`, sin
  comentario antes del `CALL` y sin parámetros `OUT`. El procedimiento devuelve sus datos con un solo `SELECT` final.
- Las listas van como un solo parámetro JSON, que el procedimiento lee con `JSON_TABLE`.
- Para cambiar un procedimiento que ya se entregó, se agrega una migración nueva que lo borra y lo crea otra vez.
  Nunca se edita una migración que ya corrió.
- Patrón: Transaction Script. Cada procedimiento resuelve una petición completa, de principio a fin, dentro de MySQL.

`[@test] ../backend/tests/base-de-datos/sp-registrar-venta-migracion.test.js`
`[@test] ../backend/tests/base-de-datos/sp-registrar-venta-cliente-mysql.test.js`

### Validación

- La API valida todo antes de tocar la base de datos, con funciones propias en `src/validators/`, sin librería de
  validación. Las reglas de dinero se validan sobre texto, y las librerías que convierten a número las echarían a
  perder. Además son pocas rutas.
- `src/validators/comunes.js` tiene las piezas que usan todos los recursos: `validarTexto` (quita espacios de los
  extremos y revisa que no quede vacío ni pase del largo máximo), `validarDinero` y `validarEnteroEnRango`. Cada
  validador de un recurso devuelve los datos limpios o lanza `ErrorApi` de estado 400 con todos los campos con
  problema, no solo el primero. `comunes.js` no es parte de B-02: lo crea la primera tarjeta que lo necesita (ver
  "Carpetas").
- `validarDinero(valor, campo, { permiteCero })` revisa un dinero que llega como texto: la forma
  `^\d{1,5}(\.\d{1,2})?$` y el máximo de 99 999.99 (ver "Dinero"). Sin `permiteCero`, el valor tiene que ser mayor que
  0: es el precio de un producto (RN-02). Con `permiteCero: true` el 0 se acepta: es el precio aplicado (RN-05).
- El cuerpo de la petición llega como JSON. Un campo con el tipo equivocado (por ejemplo un número donde va un
  texto) es un 400, no se convierte.
- Los largos máximos y los límites de los datos salen de `requerimientos/`: nombre de 120 caracteres, código de
  barras de 50 (RN-04), precio hasta 99 999.99, cantidad de 1 a 999 (ver "Dinero") y como máximo 100 detalles en una
  venta (RN-14).
- Patrón: Input Validation. La API no confía en la pantalla, porque se le puede llamar sin ella.

`[@test] ../backend/tests/validacion-comun.test.js`

### Errores

Hay un solo manejador de errores (`src/middlewares/errorHandler.js`) y un solo formato de respuesta de error
(RNF-05). Todo error, venga de donde venga, sale con esta forma:

```json
{
  "error": {
    "codigo": "DATOS_INVALIDOS",
    "mensaje": "El precio no puede tener más de 2 decimales.",
    "detalles": [{ "campo": "precio", "mensaje": "No puede tener más de 2 decimales." }]
  }
}
```

- `codigo` es un texto en mayúsculas con guion bajo, estable, que la pantalla puede leer. `mensaje` es una frase en
  español para el cajero. `detalles` (los «detalles del error», que no son los detalles de una venta) solo aparece en
  los 400 y en el 409 del código de barras repetido, y lista un elemento por campo con problema. Cuando no hay, la
  respuesta no trae la propiedad `detalles`.
- La API responde solo con cinco estados, los de RNF-05:

| Estado | `codigo` | Cuándo |
|---|---|---|
| 400 | `DATOS_INVALIDOS` | La forma o los valores de la petición no cumplen las reglas. También un JSON mal escrito (`JSON_INVALIDO`) y un cuerpo que pasa del límite (`CUERPO_MUY_GRANDE`), para no sumar un sexto estado. |
| 404 | `NO_ENCONTRADO` | La ruta no existe, o lo pedido no existe. |
| 409 | `CONFLICTO` | Un dato único ya existe. El código de barras repetido usa `CODIGO_BARRAS_DUPLICADO`, con `detalles` que nombran el campo. |
| 422 | El de la regla, por ejemplo `VENTA_SIN_DETALLES` | El procedimiento almacenado rechazó la petición con `SQLSTATE 45000`. |
| 500 | `ERROR_INTERNO` | Cualquier otro error. El mensaje es "Ocurrió un error inesperado. Intenta de nuevo." |

- `src/errors/ErrorApi.js` es la clase que lanzan validadores y servicios: `new ErrorApi(estado, codigo, mensaje,
  detalles)`. Lanza un `Error` si el estado no es uno de los cinco de arriba.
- `src/errors/desdeBaseDeDatos.js` traduce el error de Sequelize por `err.parent.errno`: 1644 (`SIGNAL`) → 422, con
  el código de `MESSAGE_TEXT` solo si son mayúsculas, dígitos y guion bajo y empieza con una letra
  (`^[A-Z][A-Z0-9_]*$`), y si no `REGLA_DE_NEGOCIO`; 1062 (duplicado) →
  409; 1452 (llave foránea que no existe) → 404; 3140 (JSON inválido) y 3819 (restricción `CHECK`) → 400. Todo lo
  demás no se traduce y sigue como 500.
- El 500 nunca muestra al cliente el stack, el texto del SQL ni el mensaje original. El manejador lo escribe entero,
  con su stack, en el log del servidor con `console.error`. No se usa una librería de logs.
- Los errores del lector del cuerpo de Express también salen con este formato. Un JSON que no es un objeto ni un arreglo
  (`null`, `5`, `"x"`) lo rechaza el lector en modo estricto, antes de llegar al validador: es un 400 `JSON_INVALIDO`. Un
  cuerpo comprimido que no se puede descomprimir, o con una codificación o un `charset` que no admite, es un 400
  `DATOS_INVALIDOS` con el mensaje "La petición no se pudo leer.". Un error con estado 4xx que no viene de ese lector no
  se traduce: sigue como 500.
- Una ruta que no existe cae en `src/middlewares/noEncontrado.js`, que lanza el 404 con el mismo formato.
- Patrón: Front Controller es el más cercano. Centraliza en un solo punto el comportamiento común (aquí, los errores)
  para que ninguna ruta lo repita. El catálogo no trae un patrón exacto para "un manejador de errores de Express".

`[@test] ../backend/tests/errores.test.js`

### Límites, CORS y cabeceras

- El cuerpo JSON tiene un límite: `express.json({ limit: '100kb' })`. Una venta con 100 detalles (el máximo, RN-14)
  pesa menos de 10 kb y cabe de sobra. Lo que pase del límite es un 400 `CUERPO_MUY_GRANDE`.
- CORS: `cors({ origin: <lista de CORS_ORIGIN>, methods: ['GET', 'POST'] })`. Un origen que no está en la lista no
  recibe `Access-Control-Allow-Origin`. Nunca `*`.
- helmet: sí. Pone las cabeceras de seguridad estándar y quita `X-Powered-By`. Su política de contenido (CSP) por
  defecto ya deja los estilos en línea (`style-src` con `'unsafe-inline'`), así que Swagger UI se ve sin cambiarla (lo
  comprobó la spec de documentación de la API con helmet 8.3.0). Aun así, la tarjeta A-01 pone una política propia y
  explícita solo en `/api/docs`, y no cambia la del resto de la API.
- El orden de los middlewares en `app.js` es: helmet, cors, `express.json`, rutas de `/api`, `noEncontrado` y, al
  final, `errorHandler`.

`[@test] ../backend/tests/limite-del-cuerpo.test.js`
`[@test] ../backend/tests/cors.test.js`
`[@test] ../backend/tests/cabeceras.test.js`

### Salud

`GET /api/salud` dice si la API está viva. Sirve para el despliegue y para probar con `curl`.

- B-02 la crea con `routes/salud.js`, `controllers/salud.js` (`obtenerSalud`) y `services/salud.js`
  (`consultarSalud`): responde 200 con `{ "estado": "ok" }`.
- B-03 le suma la base de datos en `consultarSalud`: corre `sequelize.authenticate()`. Si MySQL responde, 200 con
  `{ "estado": "ok", "baseDeDatos": "ok" }`. Si no, responde 500 con el formato de error de arriba: no se suma un
  estado nuevo.
- No pide nada en la petición y no cambia nada en la base.
- Patrón: Health Check.

`[@test] ../backend/tests/salud.test.js`
`[@test] ../backend/tests/base-de-datos/salud-con-base.test.js`

## Base de datos

MySQL 8.4 con Docker Compose. Nunca `mysql:latest` ni una 9.x: Sequelize 6 soporta MySQL 5.7 y 8.

- `docker-compose.yml` está en la raíz y tiene un servicio, `mysql`, con la imagen `mysql:8.4`.
- El puerto del host es una variable: `127.0.0.1:${MYSQL_PORT:-3306}:3306`. Así dos copias del repositorio no chocan:
  cada una pone su `MYSQL_PORT` y su `COMPOSE_PROJECT_NAME`. El puerto se publica solo en `127.0.0.1`.
- La imagen lee `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER` y `MYSQL_PASSWORD` del `.env`. El usuario de la
  app es dueño de `MYSQL_DATABASE`.
- El servicio tiene un `healthcheck` con `mysqladmin ping` y un volumen con nombre para los datos. `docker compose up
  -d --wait mysql` espera a que MySQL responda.
- Nada crea tablas ni procedimientos desde `docker-entrypoint-initdb.d`: eso corre como `root`. Todo el esquema sale de
  las migraciones.
- Hay una base de prueba separada, `MYSQL_TEST_DATABASE` (`aipos_prueba`). `npm run preparar-prueba` la crea con
  `root` (solo ese script usa `MYSQL_ROOT_PASSWORD`) y le da todos los permisos al usuario de la app sobre ella.
  Se puede correr más de una vez. Las pruebas usan solo la base de prueba: con `NODE_ENV=test`, `src/config.js`
  toma `MYSQL_TEST_DATABASE`, y falla si es igual a `MYSQL_DATABASE`.
- Vitest del backend corre con `fileParallelism: false` (un archivo de pruebas a la vez), porque todos comparten la
  base de prueba. Antes de correr, `globalSetup` ejecuta `migrar:prueba`, y cada prueba que escribe deja las tablas
  como las encontró. B-03 agrega ese `globalSetup`: hasta entonces, `npm test` no necesita MySQL.
- Las tablas y las columnas se crean solo con migraciones de sequelize-cli, CommonJS, con `up` y `down`. Se pueden
  correr `migrar`, `deshacer` y `rehacer` en cualquier orden, desde cero.
- Los nombres siguen el glosario: `productos`, `ventas`, `detalles_venta`; columnas en `snake_case`. Los `id` son
  `INT` con `AUTO_INCREMENT`.
- Juego de caracteres `utf8mb4`, con el orden por defecto de MySQL 8.4 (`utf8mb4_0900_ai_ci`), que no distingue
  mayúsculas ni tildes: así "lech" encuentra "Leche".
- Las fechas van en UTC. `ventas.fecha` es `DATETIME` con `DEFAULT CURRENT_TIMESTAMP`, y la pone MySQL (RN-12).
  La pantalla la muestra en la hora del cajero.
- Los `CHECK`, `NOT NULL`, `UNIQUE` y las llaves foráneas (`ON DELETE RESTRICT`) son de las specs de cada tabla.
- Un test de B-03 revisa que MySQL sea 8.4, que use `utf8mb4` y que `mysql2` devuelva el dinero como texto.

`[@test] ../backend/tests/database.test.js`
`[@test] ../backend/tests/base-de-datos/compose.test.js`
`[@test] ../backend/tests/base-de-datos/conexion.test.js`
`[@test] ../backend/tests/base-de-datos/base-de-prueba.test.js`
`[@test] ../backend/tests/base-de-datos/migraciones.test.js`

## Dinero

El precio, el precio aplicado, el subtotal y el total tienen 2 decimales. Los requerimientos mandan sobre la regla del
tile mysql-sequelize-procedimientos, que pide `DECIMAL(10,2)` en todas partes. Aquí no todo es `DECIMAL(10,2)`, y por
esto:

| Dónde | Tipo | Límite |
|---|---|---|
| `productos.precio` | `DECIMAL(10,2)` | Mayor que 0 y hasta 99 999.99 |
| `detalles_venta.precio_aplicado` | `DECIMAL(10,2)` | 0 o más, hasta 99 999.99 |
| `detalles_venta.cantidad` | `INT` | Entero de 1 a 999 |
| `detalles_venta.subtotal` | `DECIMAL(12,2)` | Precio aplicado × cantidad |
| `ventas.total` | `DECIMAL(12,2)` | Suma de los subtotales, de 1 a 100 detalles (RN-14) |

- Por qué: la pregunta abierta 4 de `requerimientos/README.md` (resuelta el 2026-09-30) fija el precio en hasta
  99 999.99 y la cantidad de 1 a 999, y pide `DECIMAL(12,2)` para el subtotal y el total. Un subtotal llega a
  99 899 990.01 (99 999.99 × 999), que apenas cabe en `DECIMAL(10,2)` (su máximo es 99 999 999.99), y el total suma
  varios subtotales: con dos detalles así ya se pasaría. `DECIMAL(12,2)` llega a 9 999 999 999.99. Como una venta tiene
  como máximo 100 detalles (RN-14, pregunta abierta 9), el total más grande es 100 × 99 899 990.01 = 9 989 999 001.00 y
  cabe; con 101 detalles se pasaría, y por eso existe el límite. El precio y el precio aplicado siguen en
  `DECIMAL(10,2)`, como pide el tile, y sus columnas de `JSON_TABLE` también.
- El límite de 100 detalles lo cumplen las tres capas: la pantalla no agrega el detalle 101, la API responde 400 y el
  procedimiento almacenado rechaza la venta con `DEMASIADOS_DETALLES` (spec de registrar venta).
- Nunca `FLOAT` ni `DOUBLE`.
- En JavaScript el dinero es un texto (`"25.00"`), en la API y en el backend. `mysql2` ya devuelve `DECIMAL` como texto,
  y no se activa `decimalNumbers`. El backend no suma ni multiplica dinero: eso lo hace MySQL.
- El subtotal se calcula en SQL con `ROUND(precio_aplicado * cantidad, 2)` y el total con `SUM(subtotal)`, dentro del
  procedimiento almacenado. El total que vale es el de MySQL (RN-09).
- La API acepta el dinero solo como texto con la forma `^\d{1,5}(\.\d{1,2})?$` (RN-02 y RN-05: como máximo 5 dígitos
  enteros y 2 decimales), y aplica el mínimo y el máximo de la tabla. Un número JSON (`25.5`) es un 400. MySQL solo
  avisa (no falla) cuando recorta decimales de más, así que la API es la que los rechaza.
- La cantidad llega como número entero JSON. Un texto (`"2"`) o un decimal (`1.5`) es un 400.
- La pantalla calcula en centavos (números enteros) solo para mostrar, con `src/dinero.js`: `aCentavos("22.50")` da
  `2250`, y `formatearCentavos(4750)` da `"47.50"`. Nunca suma decimales de JavaScript.
- Los precios se muestran con 2 decimales y sin símbolo de moneda (pregunta abierta 6, resuelta).
- Patrón: Money. Aquí no se guarda una moneda, solo el valor con sus 2 decimales, y por eso el "objeto" es un texto
  con validación.

`[@test] ../backend/tests/validacion-comun.test.js`
`[@test] ../backend/tests/base-de-datos/tipos-de-dinero.test.js`
`[@test] ../backend/tests/base-de-datos/dinero-como-texto.test.js`
`[@test] ../frontend/tests/dinero.test.js`

`dinero-como-texto.test.js` lo escribe B-03. `tipos-de-dinero.test.js` revisa los tipos de la tabla de arriba y necesita
las tres tablas (`productos`, `ventas` y `detalles_venta`): lo escribe V-01 (spec de registrar venta), que crea la última.

## Frontend

Vue 2.7.16, Vuetify 2.7.2 y Vite 7.3.6, con el Options API. Una sola pantalla (RNF-01): el botón "Nuevo producto",
el campo de búsqueda con sus resultados, la venta actual con su total y el botón "Registrar venta". El formulario
de producto se abre en un modal (una ventana encima de la pantalla). No hay `vue-router`.

### Carpetas

```text
frontend/
  package.json  package-lock.json  index.html  vite.config.js  eslint.config.js  .prettierrc.json
  src/
    main.js                   new Vue({ vuetify, ... }).$mount('#app'), con el tema de plugins/vuetify.js
    App.vue                   <v-app> con <v-main>: es la única pantalla
    plugins/vuetify.js        Vue.use(Vuetify) y el tema: la paleta, los íconos MDI y el español (vuetify.css afina el resto)
    api/                      http.js y un archivo por recurso: productos.js, ventas.js
    ventaActual/              la lógica de la venta actual, sin componentes
    components/               los componentes de Vue, en PascalCase
    assets/animaciones/       los archivos JSON de Lottie
    dinero.js                 aCentavos y formatearCentavos
  tests/                      las pruebas de Vitest, con la misma forma que src/
```

- Los componentes se llaman con palabras del glosario: `FormularioProducto.vue`, `BuscadorProductos.vue`,
  `VentaActual.vue`, `AnimacionLottie.vue`. Siempre de dos o más palabras.
- El `package.json` del frontend declara `"type": "module"`, como pide el tile de Vue 2, y por eso sus archivos de
  configuración usan `import`.
- `vite.config.js` usa `@vitejs/plugin-vue2`, el alias `vue` → `vue/dist/vue.esm.js`, `dedupe: ['vue']`,
  `envDir: '..'` y `server.port` con `FRONTEND_PORT` (con `strictPort: true`, para que el puerto que ve `CORS_ORIGIN`
  sea el real). El bloque `test` pone `environment: 'jsdom'`, `include: ['tests/**/*.test.js']` y un alias solo para las
  pruebas, `vue` → `vue/dist/vue.runtime.common.js`: Vuetify y `@vue/test-utils` piden `vue` con `require`, y sin ese alias
  las pruebas cargarían dos copias de Vue y Vuetify avisaría "Multiple instances of Vue detected" (lo vigila
  `vitest-vue2.test.js`).
- El arranque es `Vue.use(Vuetify)`, que vive en `plugins/vuetify.js` junto con el tema (ese archivo exporta la instancia
  de Vuetify), y `new Vue({ vuetify, render: (h) => h(App) }).$mount('#app')`, en `main.js`. Nunca `createApp`, ni
  `createVuetify`, ni `vite-plugin-vuetify`.
- Vuetify 2: las columnas de tabla son `{ text, value }`, las ranuras son `#item.<value>="{ item }"`, y los
  activadores `#activator="{ on, attrs }"`. Las propiedades de Vuetify 3 (`variant`, `density`, `item-title`) no
  hacen nada.
- Vue 2 no detecta `this.items[i] = x` ni claves nuevas de un objeto: se usa `splice`, `this.$set` o un arreglo
  nuevo. Un componente tiene un solo elemento raíz. Nada de `v-html` con datos del cajero (RNF-04).
- Los scripts de `package.json` del frontend: `dev` (`vite`), `build` (`vite build`), `preview` (`vite preview`),
  `test` (`vitest run`), `test:vigilar` (`vitest`), `lint`, `format` y `format:check`, como en el backend.
- Las tres zonas de `App.vue` llevan `data-zona="nuevo-producto"`, `"busqueda"` y `"venta-actual"`, y el total de
  `VentaActual.vue` lleva `data-total`. `pantalla-unica.test.js` exige esas zonas, en ese orden: quien agregue o mueva una
  zona actualiza esa prueba.

`[@test] ../frontend/tests/pantalla-unica.test.js`
`[@test] ../frontend/tests/vitest-vue2.test.js`

### Servicio de API

- `src/api/http.js` crea la instancia de axios con `baseURL` `${import.meta.env.VITE_API_URL}/api` (sin barras al final
  de `VITE_API_URL`) y un tiempo máximo de 10 segundos. Un interceptor de respuesta convierte todo error en un `Error`
  con `status`, `codigo`, `mensaje` y `detalles`, leídos del formato de error de la API; `detalles` es un arreglo vacío
  si la API no manda ninguno. Si no hubo respuesta (sin red, servidor apagado o pasaron los 10 segundos), `status` vale
  0, `codigo` `SIN_CONEXION` y `mensaje` "No se pudo conectar con el servidor. Intenta de nuevo." Si hubo respuesta pero
  no trae el formato de error (por ejemplo, el HTML de un 502), el `status` es el de la respuesta (un 502 queda 502),
  `codigo` es `ERROR_INTERNO` y `mensaje` "Ocurrió un error inesperado. Intenta de nuevo." El mensaje nunca muestra la
  dirección del servidor ni el texto de axios.
- `src/api/productos.js` y `src/api/ventas.js` exportan una función por operación, con nombres del glosario:
  `crearProducto`, `buscarProductos`, `registrarVenta`. Los componentes llaman solo a esas funciones. Ningún
  componente importa `axios` ni escribe una URL.
- Lo que se lee del entorno es solo `import.meta.env.VITE_*`. `process.env` no existe en el navegador. Si falta
  `VITE_API_URL`, `http.js` falla al cargar con un mensaje que nombra la variable.
- Patrón: Facade. Las funciones de `src/api/` son una fachada simple sobre axios y la forma de la API, y dejan a la
  pantalla sin saber de rutas ni de errores de red.

`[@test] ../frontend/tests/api/http.test.js`
`[@test] ../frontend/tests/sin-axios-en-componentes.test.js`

### La venta actual

- La lógica vive en `src/ventaActual/`, fuera de los componentes, para probarla sin pantalla: `agregarAVentaActual`,
  `cambiarPrecioAplicado`, `cambiarCantidad`, `eliminarDetalle` y `calcularTotal`. Son funciones que reciben la venta
  actual y devuelven una nueva, sin modificar la anterior. Así el componente reemplaza el valor entero y Vue 2 lo
  detecta.
- El dinero (precios aplicados, subtotales y total) se calcula en centavos con `src/dinero.js`.
- La venta actual tiene como máximo 100 detalles (RN-14): `agregarAVentaActual` no agrega un producto nuevo cuando ya
  hay 100, y la pantalla avisa (spec de armar la venta actual).
- La venta actual se guarda en el navegador con `localStorage` y se vacía al registrar la venta (pregunta abierta 2,
  resuelta el 2026-09-30). Si el cajero recarga la página, la venta actual sigue igual. La llave es
  `aipos.ventaActual`, y el valor es un JSON con `{ version: 1, detalles: [...] }`.
- Todo acceso a `localStorage` va dentro de `try/catch`: en una ventana privada o con los datos del sitio bloqueados
  puede fallar o venir vacío. Si falla, la pantalla funciona igual, sin guardar. Lo guardado se valida al leerlo: si no
  tiene la forma esperada, se ignora y se empieza con la venta actual vacía.
- La lógica de guardar y leer vive en `src/ventaActual/almacenamiento.js`, y es la única que toca `localStorage`.
- Un error al registrar la venta no borra la venta actual (RNF-05). Solo se vacía cuando la API confirmó la venta:
  `VentaActual.vue` emite la venta actual vacía y `App.vue`, el único que la guarda, la guarda con `almacenamiento.js`.
- Patrón: ninguno del catálogo describe un módulo de estado de la venta; se usan funciones puras. Memento es el más
  cercano para guardar y restaurar la venta actual, y Money para el dinero (ver "Dinero").

`[@test] ../frontend/tests/venta-actual/agregar.test.js`
`[@test] ../frontend/tests/venta-actual/calculos.test.js`
`[@test] ../frontend/tests/venta-actual/almacenamiento.test.js`
`[@test] ../frontend/tests/pantalla-venta-actual.test.js`
`[@test] ../frontend/tests/sin-axios-en-componentes.test.js`

Los archivos de `frontend/tests/venta-actual/` los escriben V-04 a V-07, y la spec de armar la venta actual da la lista
completa. `agregar.test.js` y `calculos.test.js` prueban las funciones puras y los centavos, y `almacenamiento.test.js`
prueba restaurar tras recargar, tolerar un `localStorage` que falla, ignorar un JSON con otra forma y guardar la venta
actual vacía. Que la venta actual solo se vacíe cuando la API confirmó la venta lo prueba `pantalla-venta-actual.test.js`,
la prueba de `App.vue`. Esta spec solo fija dónde vive el módulo y que ningún componente contiene esa lógica.

## Diseño de la pantalla

La pantalla se diseña con la skill `impeccable`. Antes de construir cada parte de la pantalla, el agente carga la
skill y sigue lo que indica: jerarquía, espacios, estados vacío, cargando, error y éxito, textos claros, contraste,
teclado, foco visible y diseño para móvil. Al revisar, la corre en modo auditoría sobre lo que cambió. Todo dentro de
las reglas de Vue 2 y Vuetify 2 de esta spec. El sistema visual (colores, tipografía, espacios y componentes) está en
`frontend/DESIGN.md`, y el contexto de producto que pide la skill, en `PRODUCT.md` (en la raíz): quien cambie la pantalla
los actualiza.

### Paleta

La paleta es de la persona desarrolladora. El quinto color vino repetido (`#FF6B6B` dos veces), así que se asumió
`#FFE66D`, el de la paleta clásica `292F36-4ECDC4-F7FFF7-FF6B6B-FFE66D`. Es un supuesto: si la persona dice otro, se
cambia en `src/plugins/vuetify.js` y aquí.

| Color | Uso | En el tema de Vuetify |
|---|---|---|
| `#292F36` | Barra superior y todo el texto | `secondary` |
| `#4ECDC4` | Acciones principales (botones y selección), y la marca y el foco sobre la barra oscura | `primary` |
| `#F7FFF7` | Fondo de la pantalla | `background` (`surface` con `#FFFFFF`) |
| `#FF6B6B` | Errores y acciones que borran | `error` |
| `#FFE66D` | Acento: resaltar el total y lo recién agregado. Es un supuesto | `accent` |

El tema también pone `info` y `success` en `#4ECDC4` y `warning` en `#FFE66D`, para que ningún componente de Vuetify pinte
un azul o un verde ajenos. Es un solo tema, el claro (`dark: false`), con `customProperties: true`: crea `--v-primary-base`
y las demás, que `plugins/vuetify.css` usa para lo que el tema no cambia solo. Vuetify va en español
(`lang.current: 'es'`), con «Borrar lo escrito en {0}» y «Cargando...» donde su traducción deja el inglés. El foco de
teclado es un contorno de 3 px en `#292F36` con 2 px de separación (turquesa sobre la barra oscura); los campos ya marcan
su borde.

Contraste (relación entre el color del texto y el del fondo). AA pide 4.5 o más para texto normal:

| Texto sobre fondo | Relación | ¿Sirve para texto? |
|---|---|---|
| `#292F36` sobre `#4ECDC4` | 6.98 | Sí |
| `#292F36` sobre `#F7FFF7` | 13.26 | Sí |
| `#292F36` sobre `#FFE66D` | 10.80 | Sí |
| `#292F36` sobre `#FF6B6B` | 4.87 | Sí |
| `#4ECDC4` sobre `#292F36` (texto turquesa en la barra) | 6.98 | Sí |
| Blanco sobre `#4ECDC4` | 1.93 | No: nunca |
| `#FF6B6B` sobre `#F7FFF7` | 2.72 | No: solo relleno, borde o ícono |
| `#4ECDC4` sobre `#F7FFF7` | 1.90 | No: solo relleno o borde |
| `#FFE66D` sobre `#F7FFF7` | 1.23 | No: solo relleno |

- Todo texto usa `#292F36`. Sobre el turquesa nunca es blanco, aunque Vuetify lo ponga por defecto en `primary`: el
  tema lo corrige. Un mensaje de error se escribe en `#292F36`, dentro de una franja o con un borde y un ícono
  `#FF6B6B`, nunca en texto rojo sobre el fondo claro.
- Un test calcula la relación de contraste de cada par que la pantalla usa para texto y falla si alguna baja de 4.5.

`[@test] ../frontend/tests/tema.test.js`

### Íconos y animaciones

- Íconos: MDI (`@mdi/font` 7.4.47) con `iconfont: 'mdi'`.
- Animaciones: Lottie con `lottie-web` 5.13.0, en `AnimacionLottie.vue`, un componente de Vue 2 con Options API. Usa la
  versión ligera, `lottie-web/build/player/lottie_light`, que solo dibuja con SVG y no evalúa expresiones. Tiene un
  solo elemento raíz, que es el contenedor de la animación, y estas propiedades: `animacion` (el JSON de la animación),
  `loop` (si se repite; `true` por defecto), `alto` (el alto en píxeles, 120 por defecto; el ancho lo da el contenedor)
  y `cuadroFijo` (`'ultimo'` por defecto, o `'primero'`: el cuadro que se muestra con menos movimiento). Crea la
  animación en `mounted`, la destruye en `beforeDestroy` y, si cambia `animacion`, destruye la anterior y crea la
  nueva. Es decorativa (`aria-hidden="true"`): el texto de al lado dice lo mismo.
- Si el sistema pide menos movimiento (`prefers-reduced-motion: reduce`), no se anima: no reproduce ni se repite, y se
  muestra un solo cuadro fijo, el último de la animación o, con `cuadroFijo="primero"`, el primero.
- Los archivos JSON van en `frontend/src/assets/animaciones/`, en los colores de la paleta, y pesan menos de 50 KB
  cada uno. Se hacen con el MCP `lottiefiles-creator` o, si la sesión no lo tiene, con la skill `text-to-lottie`.
  Solo hay cuatro, donde aportan: `venta-vacia.json` ("Busca un producto para empezar la venta"),
  `producto-creado.json`, `venta-registrada.json` y `buscando.json`. B-04 crea el componente; cada tarjeta agrega la
  animación que le toca.
- Patrón: Adapter. `AnimacionLottie.vue` adapta la librería, que es imperativa, a un componente con propiedades y ciclo
  de vida, y el resto de la pantalla no llama a `lottie`.

`[@test] ../frontend/tests/componentes/AnimacionLottie.test.js`
`[@test] ../frontend/tests/animaciones.test.js`

## Pruebas

Las pruebas son de la persona desarrolladora: el agente las escribe y las corre, y ella las valida. Toda prueba corre
en local, sin servicios externos.

- Backend: Vitest y `supertest` contra la base de prueba. Cada regla de negocio y cada estado de RNF-05 tiene su
  prueba. El caso "todo o nada" del procedimiento también.
- Frontend: Vitest, `@vue/test-utils` 1 y jsdom. Se prueba la lógica de la venta actual sin pantalla, y los
  componentes con Vuetify.
- Los archivos de prueba se llaman `<tema>.test.js` y viven en `backend/tests/` y `frontend/tests/`, con la misma forma
  de carpetas que `src/`. Las pruebas de shell de la raíz viven en `tests/`.
- Si una tarjeta prueba una operación, su archivo lleva el nombre de esa operación, en minúsculas y con guiones, y va en
  la carpeta de su recurso: `backend/tests/productos/crear-producto.test.js`, `frontend/tests/api/crear-producto.test.js`.
  Las pruebas del validador de un recurso van en la carpeta de ese recurso (`backend/tests/ventas/validador-venta.test.js`),
  no en una carpeta `validators/`, y las de su documentación en la API se llaman `documentacion-<operación>.test.js`.
  Así dos tarjetas que corren a la vez no escriben el mismo archivo.
- Los archivos de prueba usan `import` (`import { describe, it, expect } from 'vitest'`), también en el backend. Vitest 5
  no trae funciones globales. Cargan el código CommonJS con `import` o con `require`, y las dos formas funcionan.
- Dos pruebas mínimas tapan la trampa de la tarjeta S-01: B-02 escribe `backend/tests/vitest-commonjs.test.js`, que
  levanta la app en CommonJS con `supertest` y pide `/api/salud`. B-04 escribe `frontend/tests/vitest-vue2.test.js`,
  que monta un componente `.vue` con `@vitejs/plugin-vue2` y un `v-btn` de Vuetify.
- En las pruebas se sustituye con `vi.mock` la ruta exacta que importa `AnimacionLottie`,
  `lottie-web/build/player/lottie_light`, porque jsdom no dibuja: `vi.mock('lottie-web')` no la cubre. Toda prueba que
  monte un componente con `AnimacionLottie` la sustituye igual.
- Antes de decir que una tarjeta está lista, el agente corre `npm test`, `npm run lint` y `npm run format:check` en el
  proyecto que cambió, y `npm run build` en el frontend.

### Pruebas en local

Además de las automáticas, cada tarjeta prueba su cambio en local, con el sistema corriendo de verdad:

- **La API, con `curl`** contra el backend corriendo (`npm run dev`, con MySQL levantado y migrado). La spec de cada
  ruta lista sus comandos `curl` con la respuesta esperada: el caso feliz y cada estado de RNF-05 que la ruta pueda
  dar. El agente los corre y anota el resultado en su "Update" de la tarjeta.
- **La pantalla, en el navegador con el MCP `chrome-devtools`**: abre la pantalla (`npm run dev` del frontend), hace
  lo que hace el cajero (`take_snapshot`, `fill`, `click`), revisa `list_console_messages` sin errores y guarda una
  captura con `take_screenshot`. La spec de cada pantalla lista los pasos.
- Si la sesión no tiene el MCP `chrome-devtools`, lo dice y la persona desarrolladora hace esa prueba a mano.

Cada bug relevante que aparezca se abre como un issue de GitHub, con los pasos para reproducirlo (`gh issue create`),
y se cierra con un comentario que nombra el commit que lo corrige (`gh issue close <número> --comment "Corregido en
<commit>"`).

Estas reglas son de proceso: no tienen una prueba automática, y se comprueban en la revisión de cada PR y en el
flujo 06.

## Calidad

- ESLint en configuración plana y Prettier, en el backend y en el frontend. El archivo de ESLint es
  `eslint.config.mjs` en el backend (que es CommonJS y no puede usar `import` en un `.js`) y `eslint.config.js` en el
  frontend.
- Backend: `@eslint/js` (`recommended`), `globals.node` y `eslint-config-prettier`, con `sourceType: 'commonjs'` para
  el código y `sourceType: 'module'` solo para `tests/**` (que usan `import`). Comprobado en local con ESLint 10.11.0. Frontend: lo mismo con
  `globals.browser` y `eslint-plugin-vue` con `pluginVue.configs['flat/vue2-recommended']`. Desde la versión 10 de
  `eslint-plugin-vue`, `recommended` a secas es de Vue 3.
- En el frontend se agrega la regla `'vue/valid-v-slot': ['error', { allowModifiers: true }]`, para las ranuras
  `#item.<value>` de Vuetify 2. También se ajusta la regla `vue/multi-word-component-names` (con `ignores: ['App']`): pide
  nombres de dos palabras, y `App.vue` es la única excepción.
- Prettier, en los dos proyectos: `singleQuote: true`, `printWidth: 100` y `trailingComma: 'all'`.
  `.prettierignore` deja fuera `package-lock.json`, `dist/`, `coverage/` y `src/assets/animaciones/`.
- `npm run lint` y `npm run format:check` pasan sin errores. `npm run format` arregla el formato.
- Funciones cortas, y comentarios solo donde el porqué no es obvio.
- Se comprueba corriendo `npm run lint` y `npm run format:check` en cada proyecto; no tiene un archivo de prueba propio.

## Git y entrega

Todo el trabajo se ve en el historial de git y en la bitácora de IA. Esto amplía el flujo 05.

- Nunca hay commits directos en `main` ni en `ProductionEnv`. Todo entra por una rama y un pull request.
- Cada tarjeta trabaja en su propia rama de tarjeta, `<tipo>/<id>-<resumen>`, en minúsculas y con guiones. El tipo es
  uno de `feature`, `fix`, `docs`, `chore`, `refactor` o `test`. Por ejemplo `feature/b-02-base-del-backend` o
  `docs/e-01-bitacora-y-tiempos`.
- La rama de tarjeta sale de la rama de su entregable (`feature/base`, `feature/productos` o `feature/ventas`) y su
  PR va a esa rama, con merge commit y sin borrar la rama.
- Cuando todas las tarjetas del entregable están integradas en su rama, un PR lleva la rama del entregable a
  `ProductionEnv`, con merge commit y la etiqueta `entregable-<x>`. `docs/entrega-final` va igual, y después
  `ProductionEnv` va a `main`.
- Las tarjetas sin entregable van directo a su destino. B-01 y D-01 van a `ProductionEnv`. S-01 va a `main`.
- La rama de D-01 es `chore/despliegue`, el nombre que ya tenía su tarjeta antes de esta convención: es la única
  excepción a `<tipo>/<id>-<resumen>`. Las demás tarjetas la siguen.
- Antes de integrar un PR, su rama se pone al día en local con la de destino. Si el hook de git detiene el merge
  porque actualizó el grafo del proyecto, se termina con `git commit --no-edit`.
- Los mensajes de commit siguen Conventional Commits: prefijo en inglés y descripción en español con las palabras del
  glosario. Un cambio lógico por commit. Si el agente participó, el commit lleva `Co-Authored-By` y nunca
  `Claude-Session`. Nunca `--no-verify`: el hook de git `pre-commit` agrega el grafo del proyecto al commit.
- Cada PR pasa la revisión del agente revisor (Codex) antes de integrarse, y sus hallazgos se corrigen o se explican.
- Cada bug relevante es un issue de GitHub que se cierra con el commit que lo corrige (ver "Pruebas en local").
- Cada tarea del agente termina con su entrada en la bitácora, en el último commit de la tarea.
- En los documentos, las tarjetas, los commits y los PR no se escriben rutas de una máquina, alias de acceso a un
  servidor, credenciales ni enlaces a sesiones del agente. Un servidor se nombra por su dominio.

`[@test] ../tests/arquitectura/spec-arquitectura.test.sh`
`[@test] ../tests/arranque/agents-md-tarjeta.test.sh`

## Cómo se decide un diseño

Toda decisión de diseño (capas, errores, validación, módulos, componentes, despliegue) consulta antes el MCP
`design-patterns`, si la sesión lo tiene. La spec de la tarjeta anota el patrón elegido y por qué, en una frase. Si
ningún patrón encaja, lo dice.

Lo que se consultó para esta spec:

| Decisión | Patrón | Por qué, en una frase |
|---|---|---|
| Rutas → controladores → servicios → modelos | Layered Architecture y Service Layer | RNF-06 pide esas capas y son pocas rutas. |
| Un solo manejador de errores | Front Controller (el más cercano) | Un solo punto para lo común; el catálogo no trae un patrón exacto. |
| Validar en la API | Input Validation | A la API se le puede llamar sin la pantalla. |
| Registrar venta | Transaction Script | Una petición se resuelve completa dentro de un procedimiento almacenado. |
| Sin capa Repository | Repository y Data Mapper, descartados | Con tres tablas solo reenviarían llamadas a Sequelize. |
| Dinero como texto | Money | Evita los errores de decimales de JavaScript. |
| `src/api/` de la pantalla | Facade | Los componentes no saben de rutas ni de axios. |
| Guardar la venta actual | Memento (el más cercano) | Guardar y restaurar el estado; el catálogo no trae uno para la venta actual. |
| `AnimacionLottie.vue` | Adapter | Convierte una librería imperativa en un componente. |
| `GET /api/salud` | Health Check | Es lo que el despliegue y `curl` preguntan. |
| Variables de entorno | Ninguno del catálogo | Se sigue la práctica de configuración por entorno. |
