---
name: Despliegue de AIPOS
description: Flujo 07 - una etiqueta release-* prueba, construye y despliega AIPOS con Docker en el servidor de producción de aipos.salsalvador.io (pantalla y backend en dos dominios, MySQL solo dentro del servidor), y vuelve a la versión anterior si algo falla
targets:
  - ../.github/workflows/despliegue.yml
  - ../backend/Dockerfile
  - ../backend/.dockerignore
  - ../frontend/Dockerfile
  - ../frontend/.dockerignore
  - ../frontend/nginx.conf
  - ../docker-compose.produccion.yml
  - ../despliegue/**
  - ../docs/despliegue.md
  - ../README.md
  - ../docs/lenguaje-ubicuo.md
  - ../requerimientos/01-alcance.md
  - ../requerimientos/04-entregables.md
  - ../requerimientos/flujos/00-mapa-de-procesos.md
  - ../requerimientos/flujos/07-desplegar-una-version.md
  - ../requerimientos/diagramas/07-desplegar-una-version.*
  - ../tests/despliegue/**
---

# Despliegue de AIPOS

Esta spec dice cómo llega AIPOS a producción: qué pasa cuando la persona desarrolladora sube una etiqueta
`release-*`, cómo queda armado el servidor y cómo se vuelve atrás si algo sale mal. La implementa la tarjeta D-01
(rama `chore/despliegue`, PR a `ProductionEnv`; es el nombre que ya traía su tarjeta y la única excepción a
`<tipo>/<id>-<resumen>`). Se apoya en la [spec de arquitectura](arquitectura.spec.md) y no
repite lo que ya dice: carpetas, versiones, variables de entorno, formato de error y `GET /api/salud`.

Producción es el servidor real donde el público usa AIPOS. Desplegar es poner en producción una versión ya probada.
El pipeline es la cadena de pasos automáticos de GitHub Actions que lo hace: revisar, probar, construir, esperar la
aprobación y desplegar. Estas cuatro palabras están propuestas para el glosario (ver "Palabras nuevas para el
glosario"). Hasta que la persona las apruebe, la spec las explica donde aparecen.

Todo lo que corre en el servidor de producción se nombra por su dominio, `aipos.salsalvador.io`. Ni la spec, ni los
documentos, ni el workflow, ni las tarjetas, ni los commits llevan una dirección IP, el alias de acceso al servidor,
un usuario del sistema ni una credencial. Una credencial es un valor escrito a mano: el código que solo lee una
contraseña del entorno por su nombre (`clave === ''`, `texto(env, 'MYSQL_ROOT_PASSWORD')`) no lo es.

`[@test] ../tests/despliegue/sin-datos-privados.test.sh`
`[@test] ../tests/despliegue/sin-datos-privados-falsos-positivos.test.sh`

## Qué se decidió

| Tema | Decisión | Por qué |
|---|---|---|
| Dónde corre | El servidor de producción de `aipos.salsalvador.io`, con Docker (contenedores) y Docker Compose (varios contenedores juntos, descritos en un archivo). | Ahí apunta el DNS. El servidor del runner de GitLab da acceso a Docker, que equivale a ser root. |
| Dominios | `aipos.salsalvador.io` es la pantalla. `aipos-back.salsalvador.io` es el backend (`/api/salud`, la API y `/api/docs`). | Decisión de la persona desarrolladora del 2026-09-30. Cada dominio tiene su bloque de Caddy y su certificado HTTPS. |
| Entrada | Caddy, que ya corre en el servidor, recibe el tráfico en los puertos 80 y 443 y lo manda a los contenedores. | Caddy ya saca los certificados HTTPS y sirve otros sitios. AIPOS no abre puertos nuevos. |
| Etiqueta | `release-MAYOR.MENOR.PARCHE`, por ejemplo `release-0.1.0`. | Ver "La etiqueta release-*". |
| Imágenes | Se construyen en GitHub Actions y se guardan en `ghcr.io` (el registro de imágenes de GitHub). El servidor las baja. | Se despliega la misma imagen que pasó las pruebas, y el servidor, que es compartido, no compila. Ver "Imágenes". |
| MySQL | `mysql:8.4` dentro de Docker. El backend lo usa por la red interna de Docker. Se publica solo en `127.0.0.1:3306`. | Los datos no salen del servidor. Nunca en `0.0.0.0`. |
| Aprobación | El job `desplegar` usa el environment `production` de GitHub, con la persona desarrolladora como revisora. | El agente no aprueba por ella. |
| Vuelta atrás | El servidor guarda la versión actual y la anterior. Si algo falla, levanta la anterior. | Ver "Volver a la versión anterior". |

## Cómo queda armado el servidor

```text
internet ── 80/443 ──> Caddy (ya existe, no se reinicia)
                        ├─ aipos.salsalvador.io       ──> 127.0.0.1:8141  contenedor frontend (nginx)
                        └─ aipos-back.salsalvador.io  ──> 127.0.0.1:8140  contenedor backend (Node)
                                                                  │  red interna de Docker
                                                                  └──> contenedor mysql (mysql:8.4)
                                                                       también en 127.0.0.1:3306
```

- Solo entran por internet los puertos que ya estaban abiertos (22, 80 y 443). AIPOS no abre ninguno.
- Docker se salta el firewall (`ufw`) en los puertos que publica. Por eso los tres contenedores publican solo en
  `127.0.0.1`, nunca en `0.0.0.0`, y así solo Caddy y el propio servidor los alcanzan.
- Los puertos 8140 (backend) y 8141 (pantalla) estaban libres el 2026-09-30. El paso 1 de la configuración del
  servidor los vuelve a comprobar con `ss -ltn` antes de usarlos.
- MySQL en `127.0.0.1:3306` sirve para entrar desde el mismo servidor o con un túnel SSH
  (`ssh -L 3307:127.0.0.1:3306 <usuario>@aipos.salsalvador.io`, que abre el puerto 3307 de tu máquina hacia el MySQL
  del servidor). Desde internet no se ve.
- Patrón: API Gateway (el más cercano). Caddy es la única entrada y reparte por dominio; el catálogo no trae un patrón
  exacto para un proxy inverso con dos sitios.

## La etiqueta release-*

Una etiqueta es una marca con nombre en un commit (en git se llama tag). La que despliega se llama
`release-MAYOR.MENOR.PARCHE`, con tres números:

| Etiqueta | Cuándo |
|---|---|
| `release-0.1.0` | Se integraron el entregable base (B-01 a B-04 y A-01) y D-01. Es el primer despliegue. |
| `release-0.2.0` | Se integró el entregable productos. |
| `release-1.0.0` | Se integró el entregable ventas: AIPOS completo. |
| `release-X.Y.Z` | Un arreglo o un cambio después: sube el tercer número, o el segundo si trae una función nueva. |

- La expresión que la valida es `^release-[0-9]+\.[0-9]+\.[0-9]+$`. GitHub arranca el workflow con el patrón
  `release-*`, y el primer job vuelve a revisar la forma exacta: `release-hoy` o `release-1.0` fallan sin desplegar.
- No se pide que el número sea mayor que el que está en producción. Volver atrás a mano es correr otra vez el
  workflow de una etiqueta anterior (ver "Volver a la versión anterior").
- `entregable-<x>` (la marca de cada entregable integrado) y `v1.0.0` (la de la entrega final del flujo 05) no
  arrancan el workflow. Solo `release-*` despliega.
- El nombre de la etiqueta es también la etiqueta de las imágenes de Docker: `release-0.1.0`.
- Las pruebas de la propia tarjeta usan `release-0.0.N`, que no es una versión de entrega.
- Patrón: ninguno del catálogo trae un formato de etiqueta; se sigue el versionado semántico (MAYOR.MENOR.PARCHE) con el
  prefijo `release-` que pidió la persona desarrolladora.

`[@test] ../tests/despliegue/etiqueta-release.test.sh`

## Imágenes

Cada versión son dos imágenes de Docker, con la misma etiqueta `release-X.Y.Z`:

- `ghcr.io/g14wx/aipos-backend:release-X.Y.Z`
- `ghcr.io/g14wx/aipos-frontend:release-X.Y.Z`

**Decisión: se construyen en GitHub Actions y se guardan en `ghcr.io`; el servidor solo las baja.** La otra opción era
clonar la etiqueta en el servidor y construir ahí. Se descartó por cuatro razones:

- Lo que se prueba es lo que se despliega. Con la construcción en el servidor, el código se compilaría otra vez, con
  otras dependencias posibles.
- El servidor tiene 4 CPU y 5.3 GB de memoria libres y sirve otros sitios. Compilar la pantalla con Vite lo dejaría
  lento para todos.
- Volver atrás es bajar la imagen anterior, que ya está construida. No hay que compilar con el sitio caído.
- El servidor no necesita clave de lectura del repositorio ni herramientas de compilación.

Cómo el servidor entra a `ghcr.io`: el paquete de imágenes nace privado. El workflow entra a `ghcr.io` en el servidor
con el `GITHUB_TOKEN` del propio job (una clave temporal que vale mientras corre el job, con permiso solo de lectura
de paquetes), y sale con `docker logout` al terminar. Así no queda ninguna clave de larga duración en el servidor.
Las imágenes llevan la etiqueta de imagen `org.opencontainers.image.source` con la dirección del repositorio, que es
lo que une el paquete con el repositorio y le da al job permiso sobre él.

### Imagen del backend (`backend/Dockerfile`)

- Dos etapas, las dos con `node:24-alpine` (la misma versión mayor que `.nvmrc`). La primera corre
  `npm ci --omit=dev` y la segunda copia solo `node_modules`, `package.json`, `.sequelizerc`, `db/`, `docs/` y `src/`.
  `docs/` trae `openapi.yaml`, que el backend lee al arrancar para servir `/api/docs`: sin esa carpeta, el arranque
  falla (spec de documentación de la API).
- `sequelize-cli` va en `dependencies` de `backend/package.json`, no en `devDependencies`: la imagen no instala las de
  desarrollo y las migraciones corren dentro de ella (lo dice la spec de arquitectura, en "Versiones").
- Corre como el usuario `node`, no como root: `USER node`. `NODE_ENV=production`. Escucha en el puerto 3000.
- No trae un archivo `.env`. Las variables llegan del entorno del contenedor (`src/config.js` da prioridad al
  entorno sobre el archivo, y `dotenv` no falla si el archivo no está).
- Tiene `HEALTHCHECK` (la orden que Docker repite para saber si el contenedor está sano): una petición a
  `http://127.0.0.1:3000/api/salud` con el `fetch` de Node, sin instalar `curl`.
- `backend/.dockerignore` deja fuera `node_modules`, `.env`, `coverage`, `tests` y `.git`.

### Imagen de la pantalla (`frontend/Dockerfile`)

- Dos etapas. La primera, `node:24-alpine`, corre `npm ci` y `npm run build` con `VITE_API_URL` que llega como
  argumento de construcción (`ARG VITE_API_URL`). La segunda, `nginxinc/nginx-unprivileged:1.28-alpine`, sirve
  `dist/`.
- **La ruta base de la API en producción es `https://aipos-back.salsalvador.io`**, sin `/api` al final. Es el valor de
  `VITE_API_URL` con el que el workflow construye la imagen. El servicio de API de la pantalla le suma `/api`
  (spec de arquitectura), así que la pantalla llama a `https://aipos-back.salsalvador.io/api/...`. El archivo
  `vite.config.js` no fija `base`: la pantalla vive en la raíz de su dominio.
- `VITE_API_URL` se graba dentro del JavaScript al construir. Cambiarlo obliga a construir otra vez. Si llega
  vacío, la construcción falla (`RUN test -n "$VITE_API_URL"`), para no publicar una pantalla que llama a ninguna parte.
- nginx corre como el usuario `nginx` (no root), en el puerto 8080, con `frontend/nginx.conf`: `server_tokens off`;
  una ruta que no es un archivo da 404 (es una sola pantalla, sin `vue-router`); `/assets/` con
  `Cache-Control: public, max-age=31536000, immutable`; `index.html` con `Cache-Control: no-store`. No comprime:
  Caddy comprime (`encode`).
- `frontend/.dockerignore` deja fuera `node_modules`, `dist`, `.env` y `.git`.
- Patrón: ninguno del catálogo describe cómo empaquetar una aplicación en una imagen de Docker; se siguen las prácticas
  de Docker (construcción en etapas y usuario sin privilegios).

`[@test] ../tests/despliegue/imagenes.test.sh`

## Docker Compose de producción (`docker-compose.produccion.yml`)

Es un archivo distinto del `docker-compose.yml` de desarrollo (que solo levanta MySQL). Tres servicios:

| Servicio | Imagen | Publica | Otros |
|---|---|---|---|
| `mysql` | `mysql:8.4` (nunca `latest` ni 9.x) | `127.0.0.1:${MYSQL_PORT:-3306}:3306` | Volumen con nombre `mysql_datos` (el proyecto `aipos` lo llama `aipos_mysql_datos`), `healthcheck` con `mysqladmin ping`, `mem_limit: 1g`. |
| `backend` | `ghcr.io/g14wx/aipos-backend:${AIPOS_VERSION}` | `127.0.0.1:8140:3000` | `depends_on` con `condition: service_healthy` de `mysql`, `mem_limit: 384m`. |
| `frontend` | `ghcr.io/g14wx/aipos-frontend:${AIPOS_VERSION}` | `127.0.0.1:8141:8080` | `mem_limit: 128m`. |

- `AIPOS_VERSION` es obligatoria (`${AIPOS_VERSION:?falta AIPOS_VERSION}`): sin ella `docker compose` se niega a
  arrancar. Vale la etiqueta, por ejemplo `release-0.1.0`.
- Todo puerto publicado lleva `127.0.0.1:` delante. Ninguno queda en `0.0.0.0`.
- El servicio `backend` recibe por `environment` solo lo que usa: `NODE_ENV=production`, `PORT=3000`,
  `CORS_ORIGIN`, `MYSQL_HOST=mysql`, `MYSQL_PORT=3306`, `MYSQL_DATABASE`, `MYSQL_USER` y `MYSQL_PASSWORD`. No recibe
  `MYSQL_ROOT_PASSWORD`: la API nunca entra a MySQL como root. `MYSQL_PORT` del archivo `.env` es el puerto del
  host; dentro de la red de Docker, MySQL siempre está en el 3306.
- `mysql` lee `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER` y `MYSQL_PASSWORD`. La imagen crea el usuario de la
  app como dueño de `MYSQL_DATABASE`. Nada crea tablas ni procedimientos desde `docker-entrypoint-initdb.d`: el esquema
  sale de las migraciones.
- `backend` y `frontend` llevan `cap_drop: [ALL]` y `security_opt: [no-new-privileges:true]`. En los tres servicios
  `restart: unless-stopped`, y `logging` con el controlador `json-file` (`max-size: 10m`, `max-file: 3`), para que los
  registros no llenen el disco compartido.
- Ningún contenedor corre su proceso principal como root: el proceso 1 tiene un uid distinto de 0 (`mysqld` corre como
  `mysql`, que es como la imagen oficial lo deja después de arrancar; el backend como `node`; nginx como `nginx`).
- El volumen de MySQL se conserva entre despliegues. **Nunca `docker compose down -v`**, ni `--volumes`, ni
  `docker volume prune`, ni `docker system prune --volumes`: borran los datos de producción. Ni el workflow ni los
  scripts de `despliegue/` escriben esas órdenes. Para detener se usa `docker compose stop`.
- Patrón: Health Check. Los tres servicios dicen si están sanos, y Compose espera esa señal (`--wait`) antes de dar por
  levantada la versión.

`[@test] ../tests/despliegue/compose-produccion.test.sh`
`[@test] ../tests/despliegue/sin-borrar-datos.test.sh`

## El .env de producción

El `.env` de producción vive solo en el servidor, en `/srv/aipos/.env`, con permisos 600 (solo lo lee su dueño, el
usuario de despliegue). Nunca está en git, en el workflow ni en los secretos de GitHub. Lo crea una sola vez el script
`despliegue/crear-env.sh`, que corre en el servidor:

```dotenv
COMPOSE_PROJECT_NAME=aipos
CORS_ORIGIN=https://aipos.salsalvador.io
MYSQL_PORT=3306
MYSQL_DATABASE=aipos
MYSQL_USER=aipos
MYSQL_PASSWORD=<openssl rand>
MYSQL_ROOT_PASSWORD=<openssl rand>
```

- Las dos contraseñas salen de `openssl rand -base64 32` (sin `/`, `+` ni `=`, para que no rompan la conexión).
  El script las escribe con `umask 077` y no las imprime.
- `CORS_ORIGIN` es `https://aipos.salsalvador.io`, sin barra final y sin `*`. Es lo único que deja al navegador
  llamar al backend.
- El script se niega a sobrescribir un `.env` que ya existe: cambiar una contraseña en el archivo no la cambia en un
  volumen de MySQL que ya se creó (la imagen solo las lee al crear el volumen), y perderías el acceso a la base.
- `desplegar.sh` se niega a correr si el `.env` no existe o si otros usuarios pueden leerlo.
- Cada variable que `docker-compose.produccion.yml` lee del `.env` ya está en `.env.example` (sin secretos), y este es
  el único archivo de ejemplo. `AIPOS_VERSION` no va en el `.env`: la pone `desplegar.sh` en cada despliegue.

`[@test] ../tests/despliegue/crear-env.test.sh`

## Caddy

Caddy ya corre en el servidor como servicio de systemd, y su `Caddyfile` solo importa
`/etc/caddy/conf.d/*.caddy`: un sitio es un archivo. AIPOS agrega dos archivos y no toca ninguno de los otros.

`despliegue/caddy/aipos.caddy`:

```caddy
aipos.salsalvador.io {
	encode zstd gzip
	header {
		Strict-Transport-Security "max-age=31536000"
		X-Content-Type-Options "nosniff"
		X-Frame-Options "DENY"
		Referrer-Policy "strict-origin-when-cross-origin"
	}
	reverse_proxy 127.0.0.1:8141
}
```

`despliegue/caddy/aipos-back.caddy`:

```caddy
aipos-back.salsalvador.io {
	encode zstd gzip
	header Strict-Transport-Security "max-age=31536000"
	reverse_proxy 127.0.0.1:8140
}
```

- Cada dominio tiene su bloque y su certificado HTTPS, que Caddy pide solo. El puerto 80 ya redirige a HTTPS, así
  que el desafío ACME (la comprobación con la que la entidad certificadora ve que el dominio es tuyo) funciona.
- Todo `aipos-back.salsalvador.io` va al backend, sin lista de rutas: `/api/salud`, `/api/productos`, `/api/ventas` y
  `/api/docs` (A-01 va en `release-0.1.0`). Las cabeceras del backend (helmet) y el CORS los pone el backend, no Caddy.
- Un archivo inválido en `conf.d` no rompe solo su sitio: invalida toda la configuración de Caddy, y todos los otros
  sitios caen en el siguiente reinicio del servicio (un reinicio del servidor o un `apt upgrade`). Por eso
  `despliegue/instalar-caddy.sh`, que corre en el servidor con permisos de administrador, hace siempre esto, en orden:
  1. Guarda una copia de respaldo de `/etc/caddy/Caddyfile` y de `/etc/caddy/conf.d/`.
  2. Anota qué código HTTP da cada sitio que ya sirve Caddy.
  3. Copia los dos archivos de AIPOS a `/etc/caddy/conf.d/`.
  4. Corre `caddy validate --config /etc/caddy/Caddyfile`. Si falla, borra los dos archivos de AIPOS, deja todo como
     estaba y termina con error, **sin recargar**.
  5. Si valida, corre `systemctl reload caddy`. Nunca `restart`.
  6. Vuelve a pedir cada sitio y compara con el paso 2. Si alguno cambió, lo avisa con el nombre del sitio.
- Nunca se edita el archivo de otro sitio, ni el `Caddyfile`.
- Patrón: ninguno del catálogo trata de la configuración de un servidor web; aquí manda la regla de no romper a los
  vecinos.

`[@test] ../tests/despliegue/caddy.test.sh`
`[@test] ../tests/despliegue/instalar-caddy.test.sh`

## El workflow (`.github/workflows/despliegue.yml`)

Un workflow es el archivo que le dice a GitHub Actions qué correr y cuándo. Este arranca solo con
`on: push: tags: ['release-*']`. No tiene `workflow_dispatch`: ese disparador solo aparece si el workflow está en
`main`, y `ProductionEnv` llega a `main` hasta E-03.

Trampa: GitHub corre el workflow que está en el commit de la etiqueta. El archivo tiene que estar en `ProductionEnv`
antes de subir la primera etiqueta.

Cinco jobs (los pasos del pipeline), uno detrás de otro. Si uno falla, los siguientes no corren:

| Job | Necesita | Qué hace |
|---|---|---|
| `revisar` | — | Revisa con `despliegue/revisar-etiqueta.sh` que la etiqueta cumpla `^release-[0-9]+\.[0-9]+\.[0-9]+$` y que su commit esté en `ProductionEnv` (`git merge-base --is-ancestor <commit> origin/ProductionEnv`, con `fetch-depth: 0`). Si no, falla sin hacer nada más. |
| `probar-backend` | `revisar` | Levanta un servicio de MySQL 8.4, corre `npm ci`, `npm run preparar-prueba` y `npm test` en `backend/`. |
| `probar-frontend` | `revisar` | `npm ci` y `npm test` en `frontend/`. |
| `construir` | `probar-backend`, `probar-frontend` | Construye las dos imágenes (`VITE_API_URL=https://aipos-back.salsalvador.io` para la pantalla) y las sube a `ghcr.io` con la etiqueta `release-X.Y.Z`. |
| `desplegar` | `construir` | Usa el environment `production`: se detiene hasta que la persona desarrolladora aprueba. Después despliega por SSH, revisa y, si falla, vuelve atrás. |

Reglas del workflow:

- `permissions: contents: read` para todo el workflow. `construir` agrega `packages: write` y `desplegar` agrega
  `packages: read`, solo en su job.
- `concurrency: group: despliegue-produccion` con `cancel-in-progress: false`: dos etiquetas seguidas se ponen en fila,
  no se cancelan ni se pisan.
- `timeout-minutes` en cada job: 15 para las pruebas y la construcción, y 20 para `desplegar`.
- Las acciones de terceros se fijan a su versión mayor (`actions/checkout@v7`, `actions/setup-node@v7`,
  `docker/login-action@v4`, `docker/setup-buildx-action@v4`, `docker/build-push-action@v7`, comprobadas el 2026-09-30).
  Node se toma de `.nvmrc` (`node-version-file`).
- Las pruebas del backend usan contraseñas de mentira escritas en el workflow (`ci-clave-de-prueba`). Nada que se
  parezca a una credencial real.
- `desplegar` usa solo tres cosas del environment `production`: el secreto `SSH_CLAVE_PRIVADA` (la clave privada del
  usuario de despliegue), el secreto `SSH_HOSTS_CONOCIDOS` (la línea de `known_hosts` del servidor, para que SSH
  compruebe que habla con el servidor correcto y con `StrictHostKeyChecking yes`) y la variable `SERVIDOR_USUARIO`
  (el nombre del usuario de despliegue, que así no se escribe en el repositorio). El servidor es
  `aipos.salsalvador.io`.
- La clave privada se escribe en un archivo con permisos 600 y se borra al final aunque el job falle
  (`if: always()`). Ningún paso imprime un secreto ni corre con `set -x`.
- Los pasos de `desplegar`, en este orden:
  1. Crea `/srv/aipos/versiones/<etiqueta>/` en el servidor y copia ahí, con `scp`, `docker-compose.produccion.yml` y
     `despliegue/desplegar.sh` de la etiqueta.
  2. Entra a `ghcr.io` en el servidor con el `GITHUB_TOKEN` por entrada estándar (`--password-stdin`).
  3. Corre `desplegar.sh desplegar <etiqueta>` en el servidor (ver "Los scripts del servidor").
  4. Corre `despliegue/revisar-produccion.sh` desde el runner de GitHub (ver "Revisión desde internet").
  5. Si falló el paso 3, no hace nada más: `desplegar.sh` ya dejó corriendo la versión que estaba activa y no cambió
     `version-actual` ni `version-anterior`, así que correr `volver` bajaría a una versión todavía más vieja. Si el paso 3
     terminó bien y falló el paso 4 (la versión nueva ya está activa), corre `desplegar.sh volver` en el servidor. En los
     dos casos el job sigue en rojo.
  6. Siempre: `docker logout ghcr.io` en el servidor y borra la clave privada del runner.
- Nada usa root: el workflow entra como el usuario de despliegue, que no tiene `sudo`.
- Patrón: CI/CD Pipeline. El catálogo lo describe como pruebas, construcción y despliegue automáticos, que es este
  workflow; la puerta de aprobación la pone el environment `production`.

`[@test] ../tests/despliegue/workflow.test.sh`
`[@test] ../tests/despliegue/etiqueta-en-produccionenv.test.sh`

## Los scripts del servidor

Viven en `despliegue/`, se prueban en local con Docker de mentira (ver "Pruebas en local") y corren con `bash` con
`set -euo pipefail`. Pasan `shellcheck` sin advertencias.

`despliegue/desplegar.sh desplegar <etiqueta>`, en `/srv/aipos` (o en la carpeta que diga `AIPOS_RAIZ`, para las
pruebas):

1. Comprueba que la etiqueta cumpla la expresión, que exista `.env` con permisos 600 y que exista
   `versiones/<etiqueta>/docker-compose.produccion.yml`. Todas las órdenes de Compose llevan
   `--env-file /srv/aipos/.env --project-directory /srv/aipos`, porque el compose está en una subcarpeta y, sin eso,
   Compose no encontraría el `.env`.
2. Toma un candado (`flock`) en `/srv/aipos/.despliegue.lock`. Si otro despliegue lo tiene, termina con error y sin
   tocar nada.
3. Baja las imágenes (`docker compose pull backend frontend`) con `AIPOS_VERSION=<etiqueta>`. Si falla, termina aquí:
   todavía no cambió nada de lo que corre.
4. Levanta MySQL y espera a que esté sano (`up -d --wait mysql`).
5. Corre las migraciones con una sola ejecución del contenedor del backend nuevo:
   `docker compose run --rm backend npm run migrar`. Entra a MySQL con el usuario de la app, nunca con root:
   si root crea `sp_registrar_venta`, la migración ya no puede reemplazarlo. Si falla, termina con error y **no**
   levanta la versión nueva: la anterior sigue corriendo.
6. Levanta el backend y la pantalla nuevos y espera a que estén sanos (`up -d --wait backend frontend`).
7. Pide `http://127.0.0.1:8140/api/salud` y `http://127.0.0.1:8141/` hasta que den 200, con
   `AIPOS_REINTENTOS` intentos (24 por defecto) cada `AIPOS_ESPERA` segundos (5 por defecto).
8. Si todo dio 200: guarda `version-anterior` con lo que decía `version-actual` (si existía) y escribe la etiqueta en
   `version-actual`.
9. Si el paso 6 o el 7 fallaron: vuelve a levantar la versión que decía `version-actual` (o, si no hay ninguna,
   detiene backend y pantalla con `docker compose stop backend frontend`), y termina con error.

Al final, los archivos de estado son `version-actual` y `version-anterior`, dentro de `/srv/aipos`, y cada
`versiones/<etiqueta>/` guarda el compose con el que corrió esa versión.

Las migraciones no se deshacen solas al volver atrás: `db:migrate:undo` puede borrar datos. Por eso una migración
de un release solo agrega (tablas, columnas nuevas con valor por defecto, un procedimiento nuevo o reemplazado) y la
versión anterior del código tiene que seguir funcionando con ese esquema. `release-0.2.0` solo agrega la tabla
`productos`, y `release-1.0.0` agrega `ventas`, `detalles_venta` y `sp_registrar_venta`.

MySQL no deshace las sentencias que cambian el esquema (DDL): si una migración falla a la mitad, la base puede quedar
con una parte aplicada. En ese caso el script lo dice en su mensaje de error y la persona desarrolladora lo revisa, sin
repetir el despliegue a ciegas.

`[@test] ../tests/despliegue/desplegar-ok.test.sh`
`[@test] ../tests/despliegue/desplegar-migracion-falla.test.sh`
`[@test] ../tests/despliegue/desplegar-sin-imagen.test.sh`
`[@test] ../tests/despliegue/desplegar-en-fila.test.sh`

## Volver a la versión anterior

Hay tres caminos, y los tres dejan el servidor en la versión que ya funcionaba:

| Cuándo falla | Quién vuelve | Qué queda |
|---|---|---|
| El backend o la pantalla no quedan sanos, o `127.0.0.1` no da 200 (pasos 6 y 7 de `desplegar`) | `desplegar.sh` mismo, con lo que dice `version-actual` | La versión que ya corría, sin cambiar los archivos de estado. |
| `revisar-produccion.sh` falla desde internet (Caddy, DNS, certificado, CORS) | El paso 5 del workflow, con `desplegar.sh volver` | La versión de `version-anterior`. `version-actual` pasa a valer esa etiqueta. |
| La persona desarrolladora decide volver a mano | Vuelve a correr el workflow de una etiqueta anterior (en GitHub, "Re-run all jobs" sobre esa ejecución) | Esa etiqueta, otra vez con su aprobación. |

`desplegar.sh volver`:

- Si no hay `version-anterior` (es el primer despliegue), no hay a dónde volver: detiene backend y pantalla
  (`docker compose stop backend frontend`), deja MySQL y su volumen como estaban, y termina con error. Caddy responde
  502 hasta el siguiente despliegue.
- Si `version-actual` ya es igual a `version-anterior`, no hace nada y termina bien: así el paso 5 del workflow no
  deshace lo que `desplegar.sh` ya deshizo.
- Si no, levanta esa etiqueta con su propio `versiones/<etiqueta>/docker-compose.produccion.yml`, espera a que estén
  sanos, comprueba `127.0.0.1` y escribe `version-actual`. Si la imagen anterior ya no está en el servidor, la baja de
  `ghcr.io`. Si tampoco se puede, termina con el mensaje "hace falta intervención manual".
- El workflow siempre queda en rojo después de volver: la etiqueta nueva no se desplegó.
- Patrón: Blue-Green Deployment, descartado. Mantiene dos entornos completos, y aquí duplicaría MySQL y la memoria en un
  servidor compartido. De él se toma solo la idea de que volver atrás sea rápido: la versión anterior ya está
  construida, con su compose guardado.

`[@test] ../tests/despliegue/volver-si-falla-la-salud.test.sh`
`[@test] ../tests/despliegue/volver-primer-despliegue.test.sh`
`[@test] ../tests/despliegue/volver-dos-veces.test.sh`

## Revisión desde internet (`despliegue/revisar-produccion.sh`)

Corre en el runner de GitHub, es decir, desde fuera del servidor, así que comprueba todo el camino: DNS, HTTPS, Caddy y
los contenedores. Recibe la dirección de la pantalla, la del backend y el origen permitido
(`https://aipos.salsalvador.io`), con `AIPOS_REINTENTOS` y `AIPOS_ESPERA` para reintentar (24 veces cada 5 segundos por
defecto: en el primer despliegue Caddy tarda unos segundos en sacar el certificado).

| Revisión | Comando equivalente | Espera |
|---|---|---|
| El backend está vivo | `curl -fsS https://aipos-back.salsalvador.io/api/salud` | 200 con `{ "estado": "ok", ... }` (spec de arquitectura). |
| La pantalla responde | `curl -fsS -o /dev/null -w '%{http_code}' https://aipos.salsalvador.io/` | 200. |
| La documentación de la API responde (A-01) | `curl -fsSL -o /dev/null -w '%{http_code}' https://aipos-back.salsalvador.io/api/docs` | 200, siguiendo la redirección a `/api/docs/`. |
| El backend deja pasar a la pantalla | `curl -si -H 'Origin: https://aipos.salsalvador.io' https://aipos-back.salsalvador.io/api/salud` | La cabecera `Access-Control-Allow-Origin: https://aipos.salsalvador.io`. Sin ella, la pantalla abre pero no puede llamar a la API. |
| El backend no deja pasar a otros | `curl -si -H 'Origin: https://otro.example' https://aipos-back.salsalvador.io/api/salud` | Sin `Access-Control-Allow-Origin`. |

- Todo sale por HTTPS: si `curl` no valida el certificado, la revisión falla. Nunca `-k`.
- Cualquier respuesta distinta, o agotar los reintentos, sale con error y con el mensaje de qué revisión falló.
- Patrón: Health Check, el mismo de `GET /api/salud`, ahora también visto desde fuera.

`[@test] ../tests/despliegue/revisar-produccion.test.sh`

## Configuración del servidor (una sola vez)

La hace el agente con el acceso que le da la persona desarrolladora, antes de subir la primera etiqueta. No la repite
el pipeline: el usuario de despliegue no tiene `sudo`. Se documenta en `docs/despliegue.md`, con estos pasos en orden y
**sin tocar lo que ya corre**. El servidor se nombra por su dominio.

1. **Leer primero, sin cambiar nada.** Sistema, puertos con `ss -ltn` (que 8140, 8141 y 3306 estén libres), rutas con
   `ip route` (para que las redes de Docker no choquen con una ruta que ya existe), `/etc/caddy/` y los sitios que sirve,
   estado del firewall y `systemctl --failed`. Guarda esa foto para compararla al final.
2. **Docker Engine y el plugin de Compose** desde el repositorio apt oficial de Docker, no desde el paquete `docker.io`
   de Ubuntu. Instala la llave del repositorio, `docker-ce`, `docker-ce-cli`, `containerd.io`, `docker-buildx-plugin` y
   `docker-compose-plugin`. No cambia el firewall: Docker publica solo en `127.0.0.1` y Caddy sigue entrando por 80 y 443.
3. **El usuario de despliegue**: sin contraseña, sin `sudo`, en el grupo `docker`, con su propia clave SSH. La clave se
   crea (`ssh-keygen -t ed25519`) en una carpeta temporal de la máquina de quien configura, la clave pública va al
   `authorized_keys` del usuario con la opción `restrict` (sin reenvío de puertos, sin terminal), y la privada va solo
   como secreto del environment con `gh secret set SSH_CLAVE_PRIVADA --env production`. La copia local de la clave
   privada se borra. La línea `known_hosts` sale de la llave pública del propio servidor, no de un escaneo de red, y va
   como secreto `SSH_HOSTS_CONOCIDOS`. No se usan la cuenta root ni la clave personal de la persona desarrolladora.
4. **La carpeta de la app**, `/srv/aipos`, dueño el usuario de despliegue, permisos 750. Ahí `despliegue/crear-env.sh`
   crea el `.env` con permisos 600.
5. **Caddy**, con `despliegue/instalar-caddy.sh` (respaldo, `caddy validate`, `systemctl reload caddy`; nunca un
   reinicio; ver "Caddy").
6. **GitHub**, con `gh api` (ver "Environment y regla de etiquetas").
7. **Al final**, repetir la foto del paso 1 y comprobar que todo lo que ya corría sigue igual: los otros sitios de Caddy
   dan el mismo código HTTP, y los puertos y servicios de antes siguen en su lugar.

- Nunca: activar o cambiar el firewall sin comprobar antes que SSH sigue entrando, reiniciar Caddy, editar el archivo de
  otro sitio, escribir credenciales, direcciones IP o el alias en el repositorio o en el tablero.
- El grupo `docker` equivale a ser root sobre el servidor: quien pueda correr `docker` puede montar cualquier carpeta.
  Se acepta porque la clave está limitada con `restrict`, solo vive como secreto del environment (que exige la
  aprobación de la persona) y el workflow solo corre `desplegar.sh`. Docker sin root (rootless) se descartó por su
  complejidad para una sola aplicación.

`[@test] ../tests/despliegue/documentos.test.sh`

## Environment y regla de etiquetas (GitHub)

- **Environment `production`** (`gh api -X PUT repos/g14wx/AIPOS/environments/production`):
  - Revisora requerida: la persona desarrolladora. `prevent_self_review` en `false`, porque ella también sube la
    etiqueta; con `true` el despliegue no se podría aprobar nunca.
  - Ramas y etiquetas permitidas: solo las etiquetas que cumplen `release-*` (`deployment_branch_policy` con
    `custom_branch_policies` y una política de tipo `tag`). Un workflow que corra sobre otra rama o etiqueta no puede
    leer los secretos.
  - Secretos: `SSH_CLAVE_PRIVADA` y `SSH_HOSTS_CONOCIDOS`. Variable: `SERVIDOR_USUARIO`.
- **Regla de etiquetas** (un ruleset de GitHub, que es un conjunto de reglas para las ramas o las etiquetas del
  repositorio): apunta a `refs/tags/release-*`, bloquea crear, mover y borrar, y deja pasar solo a la persona
  desarrolladora, con el rol de administradora del repositorio en la lista de excepciones. El repositorio es público, y
  sin esta regla cualquiera con permiso de escritura podría desplegar. Se llama "Proteger etiquetas release".
- El agente sube etiquetas con la cuenta de la persona desarrolladora, pero **no aprueba** un despliegue: la aprobación
  es una acción de la persona en la página del workflow.

`[@test] ../tests/despliegue/github-environment-y-etiquetas.test.sh`

## Casos de error

| Qué pasa | Qué ve la persona | Qué queda en el servidor |
|---|---|---|
| Etiqueta con forma distinta a `release-X.Y.Z` | `revisar` falla con el nombre de la etiqueta. | Nada cambia. |
| El commit de la etiqueta no está en `ProductionEnv` | `revisar` falla: "el commit no está en ProductionEnv". | Nada cambia. |
| Falla una prueba del backend o de la pantalla | El job de pruebas en rojo; `construir` y `desplegar` no corren. | Nada cambia. |
| Falla la construcción de una imagen (por ejemplo, `VITE_API_URL` vacío) | `construir` en rojo. | Nada cambia. |
| La persona rechaza la aprobación, o no aprueba a tiempo | `desplegar` cancelado o vencido. | Nada cambia. Las imágenes quedan en `ghcr.io` sin usarse. |
| SSH no conecta, o la llave del servidor no coincide con `SSH_HOSTS_CONOCIDOS` | `desplegar` falla al conectar. | Nada cambia. |
| No se puede bajar una imagen | `desplegar.sh` termina antes de tocar nada. | Sigue la versión anterior. |
| Falla una migración | El error de la migración, más el aviso de revisar la base. | Sigue la versión anterior; la base puede tener una migración a medias. |
| El backend o la pantalla nuevos no quedan sanos | `desplegar.sh` termina con error tras volver. | La versión que ya corría. |
| Falla la revisión desde internet (certificado, DNS, CORS) | `revisar-produccion.sh` dice qué revisión falló; el workflow corre `volver`. | La versión anterior. |
| Primer despliegue que falla | Igual que arriba, pero no hay versión anterior. | Backend y pantalla detenidos; MySQL y sus datos siguen. |
| Ya hay un despliegue corriendo | El segundo espera en fila (`concurrency`). Si dos `desplegar.sh` chocan en el servidor, el segundo falla por el candado. | El primero sigue. |
| `crear-env.sh` con un `.env` que ya existe | Se niega y no cambia nada. | El `.env` de antes. |
| `caddy validate` falla | `instalar-caddy.sh` deja todo como estaba y no recarga. | Caddy con la configuración de antes. |

`[@test] ../tests/despliegue/workflow.test.sh`

## Criterios de aceptación

Los siete primeros son los de la tarjeta D-01. Los demás salen de esta spec. Los marcados "en producción" solo se
pueden probar con el servidor real y los hace la persona con el agente en la subtarea "Probar con `release-0.1.0`"; los
otros se prueban en local (ver "Pruebas en local").

1. Dada una etiqueta con la forma exacta `release-MAYOR.MENOR.PARCHE` (`^release-[0-9]+\.[0-9]+\.[0-9]+$`) en un
   commit de `ProductionEnv`, cuando se sube, entonces el workflow prueba, espera la aprobación y despliega. (En producción; en local se prueba el orden de los jobs.)
   `[@test] ../tests/despliegue/workflow.test.sh`
2. Dada una etiqueta en un commit que no está en `ProductionEnv`, cuando se sube, entonces el workflow falla sin
   desplegar.
   `[@test] ../tests/despliegue/etiqueta-en-produccionenv.test.sh`
3. Dadas pruebas que fallan, cuando se sube la etiqueta, entonces no se despliega nada.
   `[@test] ../tests/despliegue/workflow.test.sh`
4. Después de desplegar, `https://aipos.salsalvador.io` responde con HTTPS y
   `https://aipos-back.salsalvador.io/api/salud` da 200. (En producción; en local, la misma revisión contra el
   sistema que corre en `127.0.0.1`.)
   `[@test] ../tests/despliegue/arranque-local.test.sh`
   `[@test] ../tests/despliegue/revisar-produccion.test.sh`
5. Dado que `/api/salud` no responde 200, cuando termina el despliegue, entonces el servidor queda con la versión
   anterior.
   `[@test] ../tests/despliegue/volver-si-falla-la-salud.test.sh`
6. Dado el servidor desplegado, entonces ni el workflow ni los contenedores usan root, y MySQL no se ve desde
   internet. (El "no se ve desde internet" se prueba en producción con `nc -zv aipos.salsalvador.io 3306`, que no debe
   conectar.)
   `[@test] ../tests/despliegue/compose-produccion.test.sh`
   `[@test] ../tests/despliegue/arranque-local.test.sh`
7. Dado Caddy con otros sitios, cuando se instalan los bloques de AIPOS, entonces los otros sitios siguen dando el
   mismo código HTTP. (En producción; en local, `instalar-caddy.sh` con un Caddy de mentira.)
   `[@test] ../tests/despliegue/instalar-caddy.test.sh`
8. Dada una etiqueta `release-hoy`, cuando se sube, entonces `revisar` falla porque no tiene la forma
   `release-X.Y.Z`.
   `[@test] ../tests/despliegue/etiqueta-release.test.sh`
9. Dado un `caddy validate` que falla, cuando corre `instalar-caddy.sh`, entonces no recarga Caddy y borra los archivos
   de AIPOS.
   `[@test] ../tests/despliegue/instalar-caddy.test.sh`
10. Dada una migración que falla, cuando corre `desplegar.sh`, entonces no levanta la versión nueva y sigue corriendo
    la anterior.
    `[@test] ../tests/despliegue/desplegar-migracion-falla.test.sh`
11. Dados dos despliegues seguidos, cuando el segundo empieza, entonces espera al primero y no se pisan.
    `[@test] ../tests/despliegue/desplegar-en-fila.test.sh`
12. Dado un despliegue de una versión nueva, cuando termina, entonces los datos de MySQL siguen (mismo volumen).
    `[@test] ../tests/despliegue/arranque-local.test.sh`
13. Dado el backend desplegado, cuando la pantalla de `https://aipos.salsalvador.io` lo llama, entonces el navegador
    no muestra errores de CORS, y otro origen no recibe `Access-Control-Allow-Origin`. (En producción; en local con
    orígenes de `127.0.0.1`.)
    `[@test] ../tests/despliegue/revisar-produccion.test.sh`
14. Dada la versión `release-0.1.0` o una posterior (traen A-01, que va en el entregable base), cuando se pide
    `https://aipos-back.salsalvador.io/api/docs`, entonces responde 200. `revisar-produccion.sh` pide también `/api/docs` y
    espera 200.
    `[@test] ../tests/despliegue/revisar-produccion.test.sh`
15. Dado el repositorio, entonces no contiene direcciones IP, el alias de acceso, usuarios del sistema, credenciales ni
    rutas de una máquina. Leer una contraseña del entorno por su nombre no cuenta como escribir una credencial.
    `[@test] ../tests/despliegue/sin-datos-privados.test.sh`
    `[@test] ../tests/despliegue/sin-datos-privados-falsos-positivos.test.sh`

## Pruebas en local

Todo se prueba en local, como pide la spec de arquitectura. Lo que necesita el servidor real (DNS, certificado,
firewall, aprobación de GitHub) se comprueba en la subtarea "Probar con `release-0.1.0`" y el resultado va al
"Update" de la tarjeta.

**Pruebas automáticas** (`tests/despliegue/*.test.sh`, en el formato de las de `tests/arranque/`: un script de bash que
imprime `ok:` o `FALLA:` y termina con `todo bien` o con error). Se corren una por una con `bash`:

- `workflow.test.sh`, `etiqueta-release.test.sh` y `github-environment-y-etiquetas.test.sh`: estructura del workflow
  (disparador, orden de jobs con `needs`, environment, permisos, sin `set -x`, sin `down -v`) y `actionlint` si está
  instalado (con Docker: `docker run --rm -v "$PWD:/repo" -w /repo rhysd/actionlint`). La comprobación del environment y
  del ruleset usa `gh api` de solo lectura y, si no hay red o `gh`, se omite y lo dice.
- `etiqueta-en-produccionenv.test.sh`: crea un repositorio de git temporal con una rama `ProductionEnv` y otra rama, y
  corre `despliegue/revisar-etiqueta.sh` sobre un commit de cada una.
- `imagenes.test.sh`: construye las dos imágenes con `docker build`, revisa el usuario (`docker run --rm --entrypoint id`),
  que la de la pantalla falle sin `VITE_API_URL`, y que la versión de Node coincida con `.nvmrc`.
- `compose-produccion.test.sh` y `sin-borrar-datos.test.sh`: `docker compose -f docker-compose.produccion.yml config`
  con variables de mentira. Revisa las imágenes, que cada puerto empiece con `127.0.0.1`, que `mysql` sea `8.4`, el
  volumen, los límites, que `backend` no reciba `MYSQL_ROOT_PASSWORD` y que `AIPOS_VERSION` sea obligatoria. También busca
  `down -v`, `--volumes` y `prune` en el workflow, los scripts y las guías.
- `arranque-local.test.sh`: construye las imágenes con la etiqueta `local`, levanta el compose de producción en la máquina
  de quien prueba (con un `.env` temporal, `CORS_ORIGIN=http://127.0.0.1:8141` y `VITE_API_URL=http://127.0.0.1:8140`),
  corre `desplegar.sh` contra ese compose y revisa: migraciones con el usuario de la app, `/api/salud` 200, MySQL solo en
  `127.0.0.1`, uid distinto de 0 en el proceso 1 de cada contenedor y que el volumen conserva una tabla después de
  desplegar otra vez. Al terminar baja los contenedores **sin** `-v` del compose temporal (que es de la prueba) y borra
  su proyecto temporal por nombre.
- `desplegar-*.test.sh` y `volver-*.test.sh`: corren `desplegar.sh` con `AIPOS_RAIZ` en una carpeta temporal y con
  `docker` y `curl` de mentira al inicio del `PATH`, que anotan lo que reciben y fallan cuando la prueba lo pide.
  Así comprueban el orden de las órdenes, la vuelta atrás y el candado sin tocar Docker.
- `revisar-produccion.test.sh`: un servidor HTTP local de mentira (`python3 -m http.server` o `nc`) que responde 200,
  500 o sin cabecera de CORS según el caso.
- `crear-env.test.sh`: corre `crear-env.sh` en una carpeta temporal y revisa los permisos 600, que las dos contraseñas
  tengan 32 caracteres o más y sean distintas, y que un segundo intento no sobrescriba el archivo.
- `caddy.test.sh` e `instalar-caddy.test.sh`: `docker run --rm -v "$PWD/despliegue/caddy:/etc/caddy/conf.d:ro" caddy:2
  caddy validate` sobre un `Caddyfile` que importa `conf.d`, y `instalar-caddy.sh` con `caddy`, `systemctl` y `curl` de
  mentira (válido, inválido y un vecino que cambia de código).
- `sin-datos-privados.test.sh`: busca en lo que sube git direcciones IP (menos `127.0.0.1` y `0.0.0.0`), `/Users/`, `/private/`, alias, `Claude-Session`
  y contraseñas. Una contraseña es un valor escrito a mano: una comparación (`clave === ''`), una flecha o una llamada
  (`const clave = texto(env, ...)`) no cuenta.
- `sin-datos-privados-falsos-positivos.test.sh` (issue #67): corre esa misma revisión sobre repositorios de mentira. Con
  una comparación, una flecha o una llamada que lee una contraseña pasa, y con una credencial escrita a mano (con
  comillas o sin ellas, en una variable, en un `.env` o en JSON) falla.
- `documentos.test.sh`: revisa que existan `requerimientos/flujos/07-desplegar-una-version.md` con su diagrama,
  `docs/despliegue.md`, la sección del README, «Lo que agregamos» en `01-alcance.md`, la fila de D-01 en
  `04-entregables.md` y las cuatro palabras nuevas en el glosario.

**La API, con `curl`** contra el backend corriendo del compose de producción en local (`127.0.0.1:8140`):

```bash
# La API está viva y MySQL responde
curl -i http://127.0.0.1:8140/api/salud
# Espera: 200 {"estado":"ok","baseDeDatos":"ok"}

# La pantalla puede llamar
curl -si -H 'Origin: http://127.0.0.1:8141' http://127.0.0.1:8140/api/salud | grep -i '^access-control-allow-origin'
# Espera: access-control-allow-origin: http://127.0.0.1:8141

# Otro origen no puede
curl -si -H 'Origin: https://otro.example' http://127.0.0.1:8140/api/salud | grep -ci '^access-control-allow-origin'
# Espera: 0

# Una ruta que no existe usa el formato de error de la arquitectura
curl -i http://127.0.0.1:8140/api/no-existe
# Espera: 404 {"error":{"codigo":"NO_ENCONTRADO", ...}}

# MySQL no queda abierto a la red
docker compose -f docker-compose.produccion.yml ps --format '{{.Ports}}'
# Espera: los tres puertos empiezan con 127.0.0.1
```

**La pantalla, en el navegador con el MCP `chrome-devtools`**, con la imagen construida con
`VITE_API_URL=http://127.0.0.1:8140`:

1. `navigate_page` a `http://127.0.0.1:8141/`.
2. `take_snapshot`: aparece la pantalla de AIPOS con "Nuevo producto" (o lo que tenga la versión).
3. `list_console_messages`: sin errores.
4. `evaluate_script` con `() => fetch('http://127.0.0.1:8140/api/salud').then(r => r.status)`: devuelve 200, sin error de
   CORS.
5. `list_network_requests`: las llamadas a `http://127.0.0.1:8140/api/...` dan 200 y no a `localhost:3000`.
6. `take_screenshot` y guardarla en la carpeta de capturas de la tarjeta.

Si la sesión no tiene el MCP `chrome-devtools`, lo dice y la persona desarrolladora hace esa prueba a mano.

**En producción** (subtarea 13, con el servidor real, después de que la persona apruebe el despliegue):
`curl -si https://aipos-back.salsalvador.io/api/salud`, `curl -si -o /dev/null -w '%{http_code}\n'
https://aipos.salsalvador.io/`, `nc -zv aipos.salsalvador.io 3306` (no debe conectar), la pantalla abierta con
`chrome-devtools` y la foto de antes y después de los otros sitios de Caddy.

**Bugs:** cada bug relevante que aparezca se abre como un issue de GitHub con los pasos para reproducirlo (`gh issue
create`) y se cierra con un comentario que nombra el commit que lo corrige (`gh issue close <número> --comment
"Corregido en <commit>"`).

## Qué tarjeta implementa cada parte

| Parte | Tarjeta | Nota |
|---|---|---|
| Workflow, Dockerfiles, `nginx.conf`, compose de producción, scripts de `despliegue/`, bloques de Caddy | D-01 | Rama `chore/despliegue` (la única excepción a `<tipo>/<id>-<resumen>`), PR a `ProductionEnv`. |
| Configuración del servidor, environment `production` y regla de etiquetas | D-01 | Se hace en el servidor y en GitHub, sin commit: queda descrita en `docs/despliegue.md` y en el "Update" de la tarjeta. |
| Flujo 07, su diagrama, `01-alcance.md`, `04-entregables.md`, glosario y README | D-01 | Subtareas 2, 3 y 14. |
| `GET /api/salud`, el `Dockerfile` puede correr `node src/servidor.js`, `sequelize-cli` en `dependencies` | B-02 y B-03 | D-01 depende del entregable base integrado (B-01 a B-04 y A-01). |
| El build de la pantalla con `VITE_API_URL` | B-04 | `frontend/package.json` con `build`, y `http.js` que falla sin `VITE_API_URL`. |
| `GET /api/docs` | A-01 | Va en `release-0.1.0`: A-01 es parte del entregable base, y `revisar-produccion.sh` la pide. Su PR suma su fila a `requerimientos/04-entregables.md` (spec de la documentación de la API), y el de D-01 suma la de D-01. |
| Aprobar cada despliegue y subir las etiquetas `release-*` | La persona desarrolladora | El agente no aprueba. |

## Cómo se decidió el diseño

Se consultó el MCP `design-patterns` para cada decisión, como pide la spec de arquitectura.

| Decisión | Patrón | Por qué, en una frase |
|---|---|---|
| Probar, construir, aprobar y desplegar en cadena | CI/CD Pipeline | Es lo que describe: automatizar pruebas, construcción y despliegue. |
| Caddy como entrada de los dos dominios | API Gateway (el más cercano) | Una sola entrada reparte por dominio; el catálogo no trae uno exacto para un proxy inverso. |
| Volver a la versión anterior | Blue-Green Deployment, descartado | Duplicaría MySQL y memoria en un servidor compartido; se toma solo la idea de volver rápido. |
| `/api/salud`, `HEALTHCHECK` y `--wait` | Health Check | Sirve para que Docker, el script y la revisión desde internet sepan si la versión está sana. |
| Formato de la etiqueta | Ninguno del catálogo | Se sigue el versionado semántico con el prefijo `release-`. |
| Imágenes de Docker | Ninguno del catálogo | Se siguen las prácticas de Docker: construcción en etapas y usuario sin privilegios. |
| Configuración del servidor | Ninguno del catálogo | Manda la regla de no tocar lo que ya corre. |

## Fuera de alcance

- Respaldos de la base de producción. Los datos viven en un solo volumen de Docker y `docker compose down -v` los
  borraría; esta spec solo pide no correrlo. Un respaldo periódico queda como pregunta abierta.
- Varios ambientes (pruebas, staging) y desplegar `main`. Solo hay producción y solo despliega una etiqueta `release-*`.
- Cero interrupciones al desplegar: al reemplazar los contenedores hay unos segundos sin servicio.
- Monitoreo, alertas y rotación de los registros más allá del límite de tamaño del compose.
- Deshacer migraciones al volver atrás (ver "Los scripts del servidor").
- Firewall: no se cambia. No hace falta abrir puertos nuevos.

## Preguntas abiertas

1. **Respaldos.** ¿Quieres un respaldo periódico del volumen de MySQL (por ejemplo, un `mysqldump` diario a una
   carpeta del servidor)? Ahora no hay ninguno.
2. **`v1.0.0` y `release-1.0.0`.** El flujo 05 pone la etiqueta `v1.0.0` en la entrega final, y aquí `release-1.0.0` es
   el despliegue de ventas. Las dos pueden vivir, pero no son lo mismo: `v1.0.0` marca la entrega, `release-1.0.0`
   despliega. ¿Se dejan las dos?

## Palabras nuevas para el glosario

Ya están en `docs/lenguaje-ubicuo.md`, pendientes de que la persona desarrolladora las apruebe con el lote de specs:
«desplegar», «producción», «pipeline» y «etiqueta `release-*`». Esta spec usa además «volver a la versión anterior»
(`despliegue/desplegar.sh volver`), que también está en el glosario.
