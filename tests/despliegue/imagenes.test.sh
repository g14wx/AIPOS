#!/usr/bin/env bash
# Spec: specs/despliegue.spec.md, sección "Imágenes" y criterio 6.
# Parte 1 (sin Docker): lee los dos Dockerfile, los dos .dockerignore y frontend/nginx.conf.
# Parte 2 (con Docker y con el código de backend/ y frontend/): construye las dos imágenes, revisa el usuario del
# proceso (docker run --rm --entrypoint id), la versión de Node contra .nvmrc, que la pantalla no se construya sin
# VITE_API_URL y las cabeceras de nginx. Si falta Docker o falta el código de B-02, B-03 y B-04, la parte 2 se omite.
# shellcheck source=comun.sh
source "$(dirname "${BASH_SOURCE[0]}")/comun.sh"
NODO="$(tr -d '[:space:]' <"$RAIZ/.nvmrc" 2>/dev/null || true)"
if [ -n "$NODO" ]; then ok ".nvmrc dice Node $NODO"; else
  NODO=24 # la spec de arquitectura fija Node 24; el archivo lo crea la tarjeta B-02
  echo "OMITIDA: falta .nvmrc (lo trae B-02); se usa Node $NODO, como dice la spec de arquitectura"
fi

# leer <ruta desde la raíz> <variable>: pone el contenido del archivo en la variable; si no está, falla la prueba.
leer() {
  local contenido=""
  if [ -f "$RAIZ/$1" ]; then ok "existe $1"; contenido="$(cat "$RAIZ/$1")"; else falla "falta $1"; fi
  printf -v "$2" '%s' "$contenido"
}
cuenta() { grep -cE -- "$2" <<<"$1" || true; }

echo "# backend/Dockerfile"
leer backend/Dockerfile B
igual "dos etapas, las dos con node:$NODO-alpine (la versión mayor de .nvmrc)" "2" "$(cuenta "$B" "^FROM node:$NODO-alpine( |$)")"
tiene "la primera etapa corre npm ci --omit=dev" "$B" "npm ci --omit=dev"
tiene "corre como el usuario node (USER node)" "$B" "USER node"
tiene "NODE_ENV=production" "$B" "NODE_ENV=production"
tiene "escucha en el puerto 3000" "$B" "EXPOSE 3000"
tiene "tiene HEALTHCHECK" "$B" "HEALTHCHECK"
tiene "el HEALTHCHECK pide /api/salud en 127.0.0.1:3000" "$B" "127.0.0.1:3000/api/salud"
tiene "el HEALTHCHECK usa el fetch de Node (sin instalar curl)" "$B" "fetch("
tiene "arranca con node src/servidor.js" "$B" "src/servidor.js"
tiene "copia node_modules de la primera etapa" "$B" "--from="
for parte in package.json .sequelizerc db src docs; do
  igual "copia $parte" "1" "$(cuenta "$B" "^COPY( .*)?[ /]${parte//./\\.}( |/|\$)")"
done
no_tiene "no copia todo el contexto (COPY . .)" "$B" "COPY . ."
no_tiene "no copia un .env" "$B" "COPY .env"
tiene "la etiqueta org.opencontainers.image.source une el paquete con el repositorio" "$B" "org.opencontainers.image.source"
no_tiene "no instala curl" "$B" "apk add"

echo "# frontend/Dockerfile"
leer frontend/Dockerfile F
igual "la etapa de construcción usa node:$NODO-alpine" "1" "$(cuenta "$F" "^FROM node:$NODO-alpine( |$)")"
tiene "la etapa final es nginxinc/nginx-unprivileged:1.28-alpine" "$F" "FROM nginxinc/nginx-unprivileged:1.28-alpine"
tiene "VITE_API_URL llega como argumento de construcción" "$F" "ARG VITE_API_URL"
tiene "la construcción falla si VITE_API_URL está vacío" "$F" 'test -n "$VITE_API_URL"'
tiene "corre npm ci y npm run build" "$F" "npm run build"
tiene "copia dist/ a la etapa final" "$F" "/app/dist"
tiene "nginx escucha en el puerto 8080" "$F" "EXPOSE 8080"
tiene "tiene HEALTHCHECK (Compose espera esa señal con --wait)" "$F" "HEALTHCHECK"
tiene "usa frontend/nginx.conf" "$F" "nginx.conf"
tiene "la etiqueta org.opencontainers.image.source une el paquete con el repositorio" "$F" "org.opencontainers.image.source"
no_tiene "no corre como root (USER root)" "$F" "USER root"

echo "# frontend/nginx.conf"
leer frontend/nginx.conf N
tiene "server_tokens off" "$N" "server_tokens off"
tiene "escucha en el puerto 8080" "$N" "listen 8080"
tiene "/assets/ con Cache-Control public, max-age=31536000, immutable" "$N" "public, max-age=31536000, immutable"
tiene "index.html con Cache-Control no-store" "$N" "no-store"
tiene "una ruta que no es un archivo da 404 (try_files \$uri =404)" "$N" 'try_files $uri =404'
no_tiene "no hay ruta de reserva a index.html (no hay vue-router)" "$N" "/index.html;"
no_tiene "nginx no comprime (comprime Caddy)" "$N" "gzip on"

echo "# .dockerignore"
leer backend/.dockerignore BI
for x in node_modules .env coverage tests .git; do tiene "backend/.dockerignore deja fuera $x" "$BI" "$x"; done
leer frontend/.dockerignore FI
for x in node_modules dist .env .git; do tiene "frontend/.dockerignore deja fuera $x" "$FI" "$x"; done

echo "# backend/package.json"
if [ -f "$RAIZ/backend/package.json" ]; then
  if python3 -c 'import json,sys; sys.exit(0 if "sequelize-cli" in json.load(open(sys.argv[1])).get("dependencies", {}) else 1)' "$RAIZ/backend/package.json"; then
    ok "sequelize-cli va en dependencies (la imagen no instala las de desarrollo)"
  else falla "sequelize-cli debe ir en dependencies de backend/package.json"; fi
else echo "OMITIDA: falta backend/package.json (lo trae B-02)"; fi

echo "# imágenes construidas (Docker)"
docker info >/dev/null 2>&1 || { echo "OMITIDA: Docker no está corriendo; no se construyen las imágenes"; terminar; }
if [ ! -f "$RAIZ/backend/package.json" ] || [ ! -f "$RAIZ/frontend/package.json" ]; then
  echo "OMITIDA: faltan backend/package.json o frontend/package.json (B-02, B-03 y B-04); no se construyen las imágenes"
  terminar
fi
TMP="$(mktemp -d)"
IMG_B="aipos-prueba-imagenes-backend:prueba"
IMG_F="aipos-prueba-imagenes-frontend:prueba"
CONTENEDOR=""
limpiar() {
  if [ -n "$CONTENEDOR" ]; then docker rm -f "$CONTENEDOR" >/dev/null 2>&1 || true; fi
  docker rmi -f "$IMG_B" "$IMG_F" >/dev/null 2>&1 || true
  rm -rf "$TMP"
}
trap limpiar EXIT
en() { docker run --rm --entrypoint "$@"; } # en <programa> <imagen> <argumentos>: corre un programa de la imagen
uso() { docker run --rm --entrypoint "$1" "$2" "${@:3}" 2>&1; }

if docker build --progress=plain -t "$IMG_B" "$RAIZ/backend" >"$TMP/backend.log" 2>&1; then ok "se construye la imagen del backend"; else
  falla "no se construyó la imagen del backend"; tail -15 "$TMP/backend.log" | sed 's/^/    /'
fi
if docker build --progress=plain -t "$IMG_F-sin-url" "$RAIZ/frontend" >"$TMP/sin-url.log" 2>&1; then
  falla "la pantalla se construyó sin VITE_API_URL (debe fallar)"; docker rmi -f "$IMG_F-sin-url" >/dev/null 2>&1 || true
else
  tiene "la construcción de la pantalla falla sin VITE_API_URL y nombra la variable" "$(cat "$TMP/sin-url.log")" "VITE_API_URL"
fi
if docker build --progress=plain --build-arg VITE_API_URL=http://127.0.0.1:8140 -t "$IMG_F" "$RAIZ/frontend" >"$TMP/frontend.log" 2>&1; then
  ok "se construye la imagen de la pantalla con VITE_API_URL"
else
  falla "no se construyó la imagen de la pantalla"; tail -15 "$TMP/frontend.log" | sed 's/^/    /'
fi

echo "# usuario, Node y contenido"
igual "backend: el proceso corre como node" "node" "$(uso id "$IMG_B" -un)"
igual "frontend: el proceso corre como nginx" "nginx" "$(uso id "$IMG_F" -un)"
for i in "$IMG_B" "$IMG_F"; do
  uid="$(uso id "$i" -u)"
  if [ -n "$uid" ] && [ "$uid" != 0 ]; then ok "${i%%:*}: el uid del proceso no es 0 ($uid)"; else falla "${i%%:*}: el proceso corre como root"; fi
done
tiene "backend: usa Node $NODO (la versión de .nvmrc)" "$(uso node "$IMG_B" -v)" "v$NODO."
comprobar "backend: no trae un .env" en sh "$IMG_B" -c 'test ! -e /app/.env'
comprobar "backend: trae sequelize-cli para las migraciones" en sh "$IMG_B" -c 'test -x /app/node_modules/.bin/sequelize-cli'
comprobar "backend: trae db/, src/ y .sequelizerc" en sh "$IMG_B" -c 'test -d /app/db && test -d /app/src && test -f /app/.sequelizerc'
comprobar "backend: no trae tests/ ni coverage/" en sh "$IMG_B" -c 'test ! -e /app/tests && test ! -e /app/coverage'
if [ -d "$RAIZ/backend/docs" ]; then comprobar "backend: trae docs/ (A-01 lee openapi.yaml al arrancar)" en sh "$IMG_B" -c 'test -d /app/docs'; fi
tiene "backend: la imagen declara un HEALTHCHECK" "$(docker image inspect --format '{{json .Config.Healthcheck}}' "$IMG_B")" "/api/salud"
tiene "backend: la imagen declara su origen (org.opencontainers.image.source)" "$(docker image inspect --format '{{json .Config.Labels}}' "$IMG_B")" "github.com/g14wx/AIPOS"
tiene "frontend: la imagen declara su origen (org.opencontainers.image.source)" "$(docker image inspect --format '{{json .Config.Labels}}' "$IMG_F")" "github.com/g14wx/AIPOS"
# Vite solo graba VITE_API_URL en el JavaScript si algún componente llega a src/api/http.js. La pantalla base (B-04)
# todavía no llama a la API, así que esta comprobación espera a que algo importe src/api/.
if grep -rqE "from ['\"][./]*api/" "$RAIZ/frontend/src" --include='*.js' --include='*.vue' --exclude='http.js'; then
  tiene "frontend: VITE_API_URL quedó grabado en el JavaScript" "$(uso sh "$IMG_F" -c 'cat /usr/share/nginx/html/assets/*.js')" "127.0.0.1:8140"
else
  echo "OMITIDA: la pantalla todavía no llama a la API (nada importa src/api/), así que VITE_API_URL no queda grabado en el JavaScript"
fi

echo "# nginx de la pantalla (contenedor en un puerto libre de 127.0.0.1)"
CONTENEDOR="$(docker run -d --rm -p 127.0.0.1::8080 "$IMG_F" 2>/dev/null || true)"
if [ -z "$CONTENEDOR" ]; then falla "no arrancó el contenedor de la pantalla"; terminar; fi
PUERTO="$(docker port "$CONTENEDOR" 8080/tcp | head -1 | sed 's/.*://')"
for _ in $(seq 1 30); do curl -s -o /dev/null "http://127.0.0.1:$PUERTO/" && break; sleep 1; done
RAIZ_HTTP="$(curl -si -H 'Accept-Encoding: gzip' "http://127.0.0.1:$PUERTO/" || true)"
tiene "GET / da 200" "$(head -1 <<<"$RAIZ_HTTP")" "200"
tiene "index.html sale con Cache-Control: no-store" "$(tr '[:upper:]' '[:lower:]' <<<"$RAIZ_HTTP")" "cache-control: no-store"
no_tiene "no se manda el número de versión de nginx" "$(grep -i '^server:' <<<"$RAIZ_HTTP")" "nginx/"
no_tiene "nginx no comprime (comprime Caddy)" "$(tr '[:upper:]' '[:lower:]' <<<"$RAIZ_HTTP")" "content-encoding"
tiene "una ruta que no es un archivo da 404 (una sola pantalla, sin vue-router)" "$(curl -si "http://127.0.0.1:$PUERTO/no-existe" | head -1)" "404"
ARCHIVO="$(uso sh "$IMG_F" -c 'ls /usr/share/nginx/html/assets' | grep '\.js$' | head -1)"
tiene "un archivo de /assets/ sale con Cache-Control immutable" "$(curl -si "http://127.0.0.1:$PUERTO/assets/$ARCHIVO" | tr '[:upper:]' '[:lower:]')" "cache-control: public, max-age=31536000, immutable"

terminar
