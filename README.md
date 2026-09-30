# AIPOS

AIPOS es una aplicación web de una sola pantalla para un punto de venta básico. El cajero crea y busca productos, arma
la venta actual y la registra en MySQL con un procedimiento almacenado (una función guardada dentro de MySQL que la
app llama por su nombre). Es la solución de una prueba técnica y se construyó con agentes de código.

| Qué | Dónde |
|---|---|
| Pantalla | <https://aipos.salsalvador.io> |
| API (el backend) | <https://aipos-back.salsalvador.io> |
| Documentación de la API (Swagger UI) | <https://aipos-back.salsalvador.io/api/docs> |
| Versión desplegada | la etiqueta `release-1.0.0` |
| Código | <https://github.com/g14wx/AIPOS>, rama `ProductionEnv` |

Este README tiene los 12 puntos que pide la prueba. Cada dato se puede comprobar en el repositorio, y la prueba
`tests/documentacion/readme-entrega.test.sh` revisa que estén los 12 puntos, que las versiones sean las instaladas y que
los archivos y los comandos que se nombran existan.

1. [Funcionalidades](#1-funcionalidades)
2. [Tecnologías y versiones](#2-tecnologías-y-versiones)
3. [Estructura](#3-estructura)
4. [Cumplimiento de requisitos](#4-cumplimiento-de-requisitos)
5. [Instalación y ejecución](#5-instalación-y-ejecución)
6. [Base de datos MySQL](#6-base-de-datos-mysql)
7. [Procedimiento almacenado](#7-procedimiento-almacenado)
8. [Tiempo](#8-tiempo)
9. [Herramientas de IA](#9-herramientas-de-ia)
10. [Cómo se usó el agente](#10-cómo-se-usó-el-agente)
11. [Decisiones técnicas](#11-decisiones-técnicas)
12. [Consideraciones](#12-consideraciones)

## 1. Funcionalidades

Todo pasa en una sola pantalla: el botón «Nuevo producto», el campo de búsqueda con sus resultados, la venta actual con
su total y el botón «Registrar venta».

- **Crear producto.** El botón «Nuevo producto» abre un formulario con nombre, precio y código de barras. La pantalla, la
  API y MySQL validan los datos: el precio es mayor que 0 y llega hasta 99 999.99, con 2 decimales como máximo. Un código
  de barras repetido da un error 409, y la pantalla lo dice junto al campo sin borrar lo que el cajero escribió.
- **Buscar producto.** Por una parte del nombre, sin importar mayúsculas, o por el código de barras exacto. Busca desde 2
  caracteres y muestra 20 resultados como máximo. Si el cajero escribe rápido, solo se ven los resultados de lo último
  que escribió.
- **Agregar a la venta actual.** Elegir un resultado lo agrega con cantidad 1 y con un precio aplicado igual al precio del
  producto. Si ya estaba, su cantidad sube en 1. Si el cajero escribe un código de barras completo y presiona Enter, el
  producto entra directo, sin elegirlo en la lista.
- **Ver la venta actual.** Cada detalle de la venta actual muestra su nombre, su precio aplicado, su cantidad y su
  subtotal, y abajo está el total, con 2 decimales. La venta actual se guarda en el navegador: si se recarga la página,
  sigue ahí.
- **Editar el precio aplicado, cambiar la cantidad y eliminar detalle.** Editar el precio aplicado no cambia el precio del
  producto. La cantidad es un entero de 1 a 999, y una venta tiene como máximo 100 detalles. Un valor que no sirve queda
  como error de un campo del detalle, y «Registrar venta» se deshabilita hasta corregirlo.
- **Registrar venta.** El botón manda la venta actual a la API, que llama al procedimiento almacenado
  `sp_registrar_venta` (punto 7). Guarda la venta con todos sus detalles de una sola vez, o no guarda nada. La pantalla
  muestra «Venta N registrada · Total X», con el total que calculó MySQL, y deja vacía la venta actual.

### La API

| Ruta | Qué hace | Errores |
|---|---|---|
| `GET /api/salud` | Dice si la API está viva y si MySQL responde. | 500 si MySQL no responde |
| `GET /api/productos?busqueda=` | Buscar producto. | 400 |
| `POST /api/productos` | Crear producto. | 400, 409 |
| `POST /api/ventas` | Registrar venta. | 400, 422 |
| `GET /api/docs` | La documentación de la API, con Swagger UI. | — |

Las respuestas de error de la API tienen la misma forma, `{ "error": { "codigo", "mensaje", "detalles" } }`, y usan uno de
cinco estados: 400 (datos inválidos), 404 (la ruta no existe), 409 (el código de barras ya existe), 422 (el procedimiento
almacenado rechazó la venta por una regla de negocio) y 500 (error inesperado, sin detalles internos para el cliente). La
excepción conocida está en el punto 12. El documento `backend/docs/openapi.yaml` describe cada ruta.

## 2. Tecnologías y versiones

Las versiones van fijas, sin `^` ni `~`, y son las que instala `npm ci` según cada `package-lock.json`. La prueba del
README las compara con esos archivos.

| Parte | Tecnología | Versión | Dónde se fija |
|---|---|---|---|
| Los dos | Node.js | 24 | `.nvmrc` (los dos `package.json` piden 24 o más) |
| Frontend | Vue | 2.7.16 | `frontend/package-lock.json` |
| Frontend | Vuetify | 2.7.2 | `frontend/package-lock.json`, con su CSS ya compilado |
| Frontend | Axios | 1.20.0 | `frontend/package-lock.json` |
| Frontend | Vite | 7.3.6 | `frontend/package-lock.json`, con `@vitejs/plugin-vue2` 2.3.4 |
| Frontend | lottie-web | 5.13.0 | `frontend/package-lock.json`, para las animaciones |
| Backend | Express | 5.2.1 | `backend/package-lock.json` |
| Backend | Sequelize | 6.37.8 | `backend/package-lock.json`, con `sequelize-cli` 6.6.5 |
| Backend | mysql2 | 3.24.5 | `backend/package-lock.json` |
| Backend | swagger-ui-express | 5.0.1 | `backend/package-lock.json`, para la documentación de la API |
| Base de datos | MySQL | 8.4 | `docker-compose.yml`, imagen `mysql:8.4` |
| Pruebas | Vitest | 5.0.2 | los dos `package-lock.json`, con `supertest` 7.3.0 en el backend y `@vue/test-utils` 1.3.6 en el frontend |
| Calidad | ESLint | 10.11.0 | los dos `package-lock.json`, con Prettier 3.9.9 |

- Las imágenes de Docker del backend y de la pantalla se construyen con `node:24-alpine`, y la pantalla se sirve con
  nginx. MySQL corre con Docker Compose.
- Vue 2 y Vuetify 2 ya no tienen soporte, pero la prueba los exige. Por eso las versiones están fijas: al escribir los
  requerimientos (2026-09-30), `npm i vuetify` instalaba la 4.2.2 y `npm i vite` la 8.3.1, y ninguna funciona con Vue 2.

## 3. Estructura

```text
AIPOS/
├── backend/                       la API: Node.js, Express y Sequelize
├── frontend/                      la pantalla: Vue 2, Vuetify 2 y Vite
├── docker-compose.yml             MySQL 8.4 para desarrollo y pruebas
├── docker-compose.produccion.yml  MySQL, backend y pantalla en producción
├── despliegue/                    scripts del servidor y bloques de Caddy (el programa que recibe el tráfico de internet)
├── .github/workflows/             el pipeline de despliegue, de GitHub Actions
├── docs/                          bitácora de IA, glosario, y guías de instalación del agente y del despliegue
├── requerimientos/                requerimientos, flujos y diagramas BPMN (dibujos de un proceso)
├── specs/                         las specs: qué tiene que hacer cada parte
├── tests/                         pruebas de shell de la raíz
├── tessl-plugins/                 los tiles de Tessl: reglas y skills del agente
├── graphify-out/                  el grafo del proyecto, el mapa de archivos y funciones que consulta el agente
├── .env.example                   las variables de entorno, con valores de ejemplo
├── .nvmrc                         Node 24
└── AGENTS.md                      las instrucciones para el agente
```

### Frontend

- `frontend/src/main.js` y `frontend/src/App.vue` arrancan Vue 2 y arman la pantalla única.
- `frontend/src/components/` tiene un componente por parte de la pantalla: `NuevoProducto.vue` (el botón y el aviso),
  `FormularioProducto.vue` (el formulario, en una ventana encima de la pantalla), `BuscadorProductos.vue`,
  `VentaActual.vue`, `CampoPrecioAplicado.vue`, `CampoCantidad.vue`, `RegistrarVenta.vue` y `AnimacionLottie.vue`.
- `frontend/src/api/` es el único lugar que habla con la API: `http.js` (Axios, con un solo formato de error),
  `productos.js` y `ventas.js`. Ningún componente llama a Axios directo.
- `frontend/src/ventaActual/` tiene la lógica de la venta actual sin pantalla: `ventaActual.js` (agregar, precio
  aplicado, cantidad, eliminar y total), `validaciones.js` y `almacenamiento.js` (la guarda en el navegador).
- `frontend/src/plugins/vuetify.js` define el tema con la paleta, y `frontend/src/assets/animaciones/` tiene las
  animaciones Lottie.
- `frontend/tests/` tiene las pruebas de Vitest, y `frontend/vite.config.js`, `frontend/Dockerfile` y
  `frontend/nginx.conf` arman, construyen y sirven la pantalla.

### Backend

- Las capas van en este orden: rutas, controladores, servicios y modelos. `backend/src/routes/` dice qué ruta llama a qué
  controlador, `backend/src/controllers/` recibe la petición y la valida con `backend/src/validators/`,
  `backend/src/services/` tiene la lógica de negocio y `backend/src/models/` tiene `Producto`, `Venta` y `DetalleVenta`.
- `backend/src/app.js` arma Express: helmet (cabeceras de seguridad), CORS, límite de 100 KB para el cuerpo, las rutas de
  `/api`, la ruta no encontrada y el manejador de errores. `backend/src/servidor.js` arranca la API: escucha en `PORT` y
  avisa si el puerto está ocupado.
- `backend/src/config.js` es el único archivo que lee las variables de entorno, y `backend/src/database.js` crea la
  conexión de Sequelize. `backend/src/documentacion.js` lee `backend/docs/openapi.yaml`, que `backend/src/routes/docs.js`
  muestra con Swagger UI.
- `backend/src/errors/` (`ErrorApi.js` y `desdeBaseDeDatos.js`, que traduce los errores de MySQL) y
  `backend/src/middlewares/` (`errorHandler.js` y `noEncontrado.js`) dan el formato de error.
- `backend/src/crearServidor.js` (llega con F-01): crea el servidor HTTP y contesta con el formato de error a una dirección o
  unas cabeceras de más de 16 KB, que Node rechaza antes de que lleguen a Express (issue #60).
- `backend/src/errors/aFormatoDeError.js` (llega con F-01): arma el cuerpo del formato de error, para que lo usen el manejador
  de errores y ese servidor.
- `backend/scripts/crear-base-de-prueba.js`, `backend/tests/` y `backend/Dockerfile` completan la carpeta.

### Base de datos

- `docker-compose.yml` levanta MySQL 8.4.
- `backend/db/migrations/` tiene las migraciones: las tres tablas (`productos`, `ventas` y `detalles_venta`) y el
  procedimiento almacenado. Están listadas en el punto 6.
- `backend/db/procedimientos/sp_registrar_venta.sql` es el script SQL del procedimiento almacenado (punto 7).
- `backend/db/config.js` y `backend/.sequelizerc` configuran `sequelize-cli`, la herramienta que corre las migraciones.

## 4. Cumplimiento de requisitos

Cada fila es un requisito de la prueba técnica. Los RF (requerimientos funcionales) y los RNF (no funcionales) están en
`requerimientos/`, con sus criterios de aceptación y las tarjetas del tablero AIPOS que los construyeron. El estado es
Cumplido, Parcial o No completado.

| Requisito | Estado | Dónde se ve |
|---|---|---|
| Una sola pantalla con frontend, backend y base de datos (RNF-01) | Cumplido | `frontend/src/App.vue`, <https://aipos.salsalvador.io> |
| Crear producto con nombre, precio y código de barras, desde un botón visible (RF-01) | Cumplido | `frontend/src/components/NuevoProducto.vue`, `frontend/src/components/FormularioProducto.vue`, `POST /api/productos` |
| Buscar producto por nombre o por código de barras (RF-02) | Cumplido | `frontend/src/components/BuscadorProductos.vue`, `GET /api/productos?busqueda=` |
| Agregar a la venta actual (RF-03) y ver sus detalles (RF-04) | Cumplido | `frontend/src/ventaActual/ventaActual.js`, `frontend/src/components/VentaActual.vue` |
| Editar el precio aplicado (RF-05) | Cumplido | `frontend/src/components/CampoPrecioAplicado.vue` |
| Cambiar la cantidad (RF-06, recomendado) | Cumplido | `frontend/src/components/CampoCantidad.vue` |
| Eliminar un producto de la venta actual (RF-07) | Cumplido | botón «Eliminar» de `frontend/src/components/VentaActual.vue` |
| Ver el total (RF-08) | Cumplido | el total, abajo de la venta actual |
| Registrar venta en MySQL con todos sus detalles (RF-09) | Cumplido | `frontend/src/components/RegistrarVenta.vue`, `POST /api/ventas` |
| Tablas de productos, ventas y detalles de venta, con sus relaciones (RF-10) | Cumplido | `backend/db/migrations/` |
| Un procedimiento almacenado que la app usa de verdad (RF-11) | Cumplido | `sp_registrar_venta`, punto 7 |
| Agregar con un código de barras exacto y Enter (RF-12, opcional) | Cumplido | `frontend/src/components/BuscadorProductos.vue` |
| Validación en tres lugares y seguridad básica (RNF-03, RNF-04) | Cumplido | pantalla, API (`backend/src/validators/`) y restricciones de MySQL (`backend/db/migrations/`) |
| Manejo de errores con un solo formato (RNF-05) | Parcial | `backend/src/middlewares/errorHandler.js`; la excepción conocida está en el punto 12 |
| Tecnologías: Node.js, Express y Sequelize; Vue 2, Vuetify y Axios; MySQL | Cumplido | punto 2 |
| Repositorio público con frontend, backend, migraciones y el script del procedimiento | Cumplido | este repositorio |
| Ramas por entregable integradas en `ProductionEnv` con merge commit, y commits claros | Cumplido | `git log --graph --first-parent origin/ProductionEnv`, y las etiquetas `entregable-base`, `entregable-productos` y `entregable-ventas` |
| Uso de inteligencia artificial documentado | Parcial | `docs/bitacora-ia.md` tiene una entrada por tarea, pero lo que la persona revisó de cada una está «por confirmar» (puntos 10 y 12) |
| README de 12 puntos (RNF-11) | Cumplido | este archivo, y `tests/documentacion/readme-entrega.test.sh` |
| Instrucciones que funcionan desde un clon limpio (RNF-07) | Parcial | el punto 5 se siguió paso a paso en una copia de trabajo; el clon limpio lo repite la tarjeta E-03 |

### Lo que agregamos y la prueba técnica no pide

| Qué | Por qué | Dónde se ve |
|---|---|---|
| Documentación de la API con Swagger UI | La pidió la persona desarrolladora el 2026-09-30. Describe cada ruta y se puede probar desde la página. | `GET /api/docs`, `backend/docs/openapi.yaml` |
| Despliegue con etiquetas `release-*` | AIPOS se puede ver funcionando: una etiqueta prueba, construye y despliega con Docker, y vuelve a la versión anterior si algo falla. | `.github/workflows/despliegue.yml`, `despliegue/`, `docs/despliegue.md` |
| Venta actual guardada en el navegador (`localStorage`) | Decisión de la persona del 2026-09-30: al recargar la página no se pierde la venta actual. | `frontend/src/ventaActual/almacenamiento.js` |
| Máximo de 100 detalles por venta | Con 101 detalles de 999 unidades a 99 999.99, el total no cabría en `DECIMAL(12,2)` y daría un error 500. Lo resolvió el orquestador (el agente que coordinaba la jornada); la persona puede confirmarlo o revertirlo. | `backend/src/validators/ventas.js`, `sp_registrar_venta` (código `DEMASIADOS_DETALLES`) |
| Cantidad y subtotal en cada detalle | La prueba no lo pide pero lo permite, y así funciona un punto de venta real. | `frontend/src/components/CampoCantidad.vue` |
| Enter con un código de barras exacto (RF-12) | Un lector de código de barras escribe el número y presiona Enter. | `frontend/src/components/BuscadorProductos.vue` |
| Docker Compose para MySQL | Cualquiera levanta la misma base de datos con un comando. | `docker-compose.yml` |
| `GET /api/salud` | Dice si la API y MySQL responden; lo usan Docker y el pipeline. | `backend/src/routes/salud.js` |
| Proceso de trabajo con el agente: requerimientos con diagramas BPMN, specs, tiles de Tessl y grafo del proyecto | El agente trabaja con reglas escritas en el repositorio y el trabajo se puede seguir paso a paso. | `requerimientos/`, `specs/`, `tessl-plugins/` |

### Lo que no se completó

- **Productos de ejemplo.** No hay un seeder (datos de ejemplo que se cargan con un comando). La base empieza vacía y el
  cajero crea los productos. La spec de crear producto lo dejó por confirmar y la subtarea se cerró como «no se hace».
- **PR final de `ProductionEnv` a `main` y prueba en un clon limpio.** Las hace la tarjeta E-03 después de este README.
- **Revisión de la persona desarrolladora.** El 2026-09-30, a las 01:40 y a las 01:45, dio su visto bueno general al
  proceso y a todos los PR, antes de ver el código. Su revisión de cada spec, cada tarjeta y cada PR queda «por
  confirmar» en la bitácora.
- **Diagramas BPMN de los flujos 03 y 04.** No muestran el máximo de 100 detalles por venta. El texto de los dos flujos sí
  lo dice, y manda el texto.
- **Bugs sin corregir.** Siguen abiertos como issues de GitHub: <https://github.com/g14wx/AIPOS/issues?q=is%3Aissue+is%3Aopen+label%3Abug>.
- **Fuera de alcance, como dice la prueba:** impresión de tickets, generación de documentos, reportes, inventarios,
  control de caja, métodos de pago, autenticación y CRUD completo. No se editan ni se borran productos, y no se consultan
  ni se cancelan las ventas registradas.

## 5. Instalación y ejecución

### Requisitos previos

- Git.
- Docker con Compose v2: `docker compose version` tiene que responder.
- Node.js 24, el del archivo `.nvmrc`. Con [nvm](https://github.com/nvm-sh/nvm), `nvm install` y `nvm use` lo eligen solos. npm
  viene con Node.

### Pasos desde un clon limpio

```bash
# 1. Clona el repositorio y entra a la versión final, la de ProductionEnv.
git clone https://github.com/g14wx/AIPOS.git
cd AIPOS
git checkout ProductionEnv

# 2. Elige Node 24 (con nvm).
nvm install
nvm use

# 3. Copia las variables de entorno y cambia las claves que empiezan con "cambiar-". El .env no va a git.
cp .env.example .env

# 4. Levanta MySQL. --wait espera a que responda: sin él, el primer arranque tarda unos segundos
#    y la migración puede fallar por llegar antes que MySQL.
docker compose up -d --wait mysql

# 5. Instala el backend, crea las tablas y el procedimiento almacenado con las migraciones, y arranca la API.
cd backend
npm ci
npm run migrar
npm start
```

La API queda en <http://localhost:3000>. Déjala corriendo y, en otra terminal, desde la raíz del repositorio, instala y
arranca la pantalla:

```bash
# 6. Instala la pantalla y arráncala.
cd frontend
npm ci
npm run dev
```

La pantalla queda en <http://localhost:5173>. Para comprobar que todo responde:

```bash
curl http://localhost:3000/api/salud   # {"estado":"ok","baseDeDatos":"ok"}
```

La documentación de la API está en <http://localhost:3000/api/docs>.

### Probarlo en la pantalla

1. Abre <http://localhost:5173> y presiona «Nuevo producto». Escribe nombre «Leche entera 1 L», precio «25.00» y código de
   barras «7501055300075», y presiona «Guardar». Aparece «Producto creado».
2. En el campo de búsqueda escribe «lech» y elige el resultado: entra a la venta actual con cantidad 1.
3. Cambia la cantidad a 2 y el precio aplicado a 22.00: el subtotal y el total se recalculan.
4. Presiona «Registrar venta». La pantalla muestra «Venta 1 registrada · Total 44.00».

### Otros puertos o varias copias

Los dos proyectos leen el mismo `.env`, el de la raíz. Para cambiar un puerto, o para tener dos copias a la vez, cambia
estas variables:

| Variable | Qué cambia | Por defecto |
|---|---|---|
| `COMPOSE_PROJECT_NAME` | El nombre del proyecto de Docker Compose: separa los contenedores y los volúmenes de dos copias. | `aipos` |
| `MYSQL_PORT` | El puerto de MySQL en tu máquina, solo en `127.0.0.1`. | `3306` |
| `PORT` | El puerto de la API. | `3000` |
| `FRONTEND_PORT` | El puerto de la pantalla. | `5173` |
| `CORS_ORIGIN` | El origen de la pantalla, con su puerto y sin barra final. La API solo acepta ese origen. | `http://localhost:5173` |
| `VITE_API_URL` | La dirección de la API, sin `/api` al final. | `http://localhost:3000` |

Si cambias `PORT` o `FRONTEND_PORT`, cambia también `VITE_API_URL` o `CORS_ORIGIN`.

### Pruebas

```bash
# Backend, desde backend/. La primera vez, con MySQL levantado, crea la base de prueba.
npm run preparar-prueba
npm test
npm run lint
npm run format:check

# Frontend, desde frontend/.
npm test
npm run lint
npm run format:check
npm run build

# Pruebas de shell, desde la raíz. Una falla imprime FALLÓ con el nombre del archivo.
for prueba in $(find tests -name '*.test.sh'); do bash "$prueba" || echo "FALLÓ: $prueba"; done
```

`tests/despliegue/arranque-local.test.sh` construye las imágenes de Docker y necesita Docker libre: si Docker no está
corriendo, se omite y lo dice.

