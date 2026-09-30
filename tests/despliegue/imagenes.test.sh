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

# leer <ruta desde la raíz>: el contenido del archivo, o falla la prueba si no está.
leer() {
  if [ -f "$RAIZ/$1" ]; then ok "existe $1"; cat "$RAIZ/$1"; else falla "falta $1" >&2; fi
}
cuenta() { grep -cE -- "$2" <<<"$1" || true; }

echo "# backend/Dockerfile"
B="$(leer backend/Dockerfile)"
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
  igual "copia $parte" "1" "$(cuenta "$B" "^COPY .*[ /]$parte( |/|$)")"
done
no_tiene "no copia todo el contexto (COPY . .)" "$B" "COPY . ."
no_tiene "no copia un .env" "$B" "COPY .env"
tiene "la etiqueta org.opencontainers.image.source une el paquete con el repositorio" "$B" "org.opencontainers.image.source"
no_tiene "no instala curl" "$B" "apk add"

echo "# frontend/Dockerfile"
F="$(leer frontend/Dockerfile)"
igual "la etapa de construcción usa node:$NODO-alpine" "1" "$(cuenta "$F" "^FROM node:$NODO-alpine( |$)")"
tiene "la etapa final es nginxinc/nginx-unprivileged:1.28-alpine" "$F" "FROM nginxinc/nginx-unprivileged:1.28-alpine"
tiene "VITE_API_URL llega como argumento de construcción" "$F" "ARG VITE_API_URL"
tiene "la construcción falla si VITE_API_URL está vacío" "$F" 'test -n "$VITE_API_URL"'
tiene "corre npm ci y npm run build" "$F" "npm run build"
tiene "copia dist/ a la etapa final" "$F" "/app/dist"
tiene "nginx escucha en el puerto 8080" "$F" "EXPOSE 8080"
tiene "usa frontend/nginx.conf" "$F" "nginx.conf"
tiene "la etiqueta org.opencontainers.image.source une el paquete con el repositorio" "$F" "org.opencontainers.image.source"
no_tiene "no corre como root (USER root)" "$F" "USER root"

echo "# frontend/nginx.conf"
N="$(leer frontend/nginx.conf)"
tiene "server_tokens off" "$N" "server_tokens off"
tiene "escucha en el puerto 8080" "$N" "listen 8080"
tiene "/assets/ con Cache-Control public, max-age=31536000, immutable" "$N" "public, max-age=31536000, immutable"
tiene "index.html con Cache-Control no-store" "$N" "no-store"
tiene "una ruta que no es un archivo da 404 (try_files \$uri =404)" "$N" 'try_files $uri =404'
no_tiene "no hay ruta de reserva a index.html (no hay vue-router)" "$N" "/index.html;"
no_tiene "nginx no comprime (comprime Caddy)" "$N" "gzip on"

echo "# .dockerignore"
BI="$(leer backend/.dockerignore)"
for x in node_modules .env coverage tests .git; do tiene "backend/.dockerignore deja fuera $x" "$BI" "$x"; done
FI="$(leer frontend/.dockerignore)"
for x in node_modules dist .env .git; do tiene "frontend/.dockerignore deja fuera $x" "$FI" "$x"; done

echo "# backend/package.json"
if [ -f "$RAIZ/backend/package.json" ]; then
  python3 -c 'import json,sys; sys.exit(0 if "sequelize-cli" in json.load(open(sys.argv[1])).get("dependencies", {}) else 1)' "$RAIZ/backend/package.json" &&
    ok "sequelize-cli va en dependencies (la imagen no instala las de desarrollo)" ||
    falla "sequelize-cli debe ir en dependencies de backend/package.json"
else echo "OMITIDA: falta backend/package.json (lo trae B-02)"; fi

# La parte 2 (Docker) sigue en el mismo archivo.
