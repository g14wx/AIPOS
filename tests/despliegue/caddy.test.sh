#!/usr/bin/env bash
# Spec: specs/despliegue.spec.md, sección "Caddy" (despliegue/caddy/aipos.caddy y aipos-back.caddy).
# Revisa el contenido de los dos bloques y, si hay Docker, los valida con `caddy validate` de la imagen caddy:2
# sobre un Caddyfile que importa conf.d, igual que el del servidor.
# shellcheck source=comun.sh disable=SC2015
source "$(dirname "${BASH_SOURCE[0]}")/comun.sh"
CARPETA="$RAIZ/despliegue/caddy"
FRONT="$CARPETA/aipos.caddy"
BACK="$CARPETA/aipos-back.caddy"
for f in "$FRONT" "$BACK"; do
  if [ -f "$f" ]; then ok "existe ${f#"$RAIZ"/}"; else falla "falta ${f#"$RAIZ"/}"; fi
done
[ "$FALLAS" -eq 0 ] || terminar
igual "en despliegue/caddy solo están los dos archivos de AIPOS" "aipos-back.caddy aipos.caddy " "$(find "$CARPETA" -mindepth 1 -maxdepth 1 -exec basename {} \; | sort | tr '\n' ' ')"

front="$(cat "$FRONT")"
back="$(cat "$BACK")"

# La pantalla
tiene "aipos.caddy abre el bloque de aipos.salsalvador.io" "$front" "aipos.salsalvador.io {"
tiene "aipos.caddy manda todo a la pantalla en 127.0.0.1:8141" "$front" "reverse_proxy 127.0.0.1:8141"
tiene "aipos.caddy comprime" "$front" "encode zstd gzip"
tiene "aipos.caddy pone Strict-Transport-Security" "$front" 'Strict-Transport-Security "max-age=31536000"'
tiene "aipos.caddy pone X-Content-Type-Options" "$front" 'X-Content-Type-Options "nosniff"'
tiene "aipos.caddy pone X-Frame-Options" "$front" 'X-Frame-Options "DENY"'
tiene "aipos.caddy pone Referrer-Policy" "$front" 'Referrer-Policy "strict-origin-when-cross-origin"'
no_tiene "aipos.caddy no menciona el dominio del backend" "$front" "aipos-back"

# El backend
tiene "aipos-back.caddy abre el bloque de aipos-back.salsalvador.io" "$back" "aipos-back.salsalvador.io {"
tiene "aipos-back.caddy manda todo al backend en 127.0.0.1:8140" "$back" "reverse_proxy 127.0.0.1:8140"
tiene "aipos-back.caddy comprime" "$back" "encode zstd gzip"
tiene "aipos-back.caddy pone Strict-Transport-Security" "$back" 'Strict-Transport-Security "max-age=31536000"'
no_tiene "aipos-back.caddy no pone CORS (lo pone el backend)" "$back" "Access-Control"
no_tiene "aipos-back.caddy no filtra por rutas (todo va al backend)" "$back" "handle"

# Nada de publicar hacia fuera ni de tocar lo global
for archivo in "$FRONT" "$BACK"; do
  nombre="${archivo##*/}"
  contenido="$(cat "$archivo")"
  no_tiene "$nombre no usa 0.0.0.0" "$contenido" "0.0.0.0"
  no_tiene "$nombre no apaga la validación de certificados" "$contenido" "insecure"
  no_tiene "$nombre no trae bloque global (email, admin, debug)" "$contenido" "admin "
done
igual "cada archivo tiene un solo sitio (una línea que abre un bloque en la columna 0)" "2" \
  "$(grep -hc '^[a-z].* {$' "$FRONT" "$BACK" | paste -sd+ - | bc)"

# Validación real con Caddy
if ! command -v docker >/dev/null 2>&1; then omitir "docker no está instalado: no se corrió caddy validate"; fi
if ! docker info >/dev/null 2>&1; then omitir "el servicio de Docker no responde: no se corrió caddy validate"; fi
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
printf 'import /etc/caddy/conf.d/*.caddy\n' >"$TMP/Caddyfile"
set +e
SALIDA="$(docker run --rm -v "$CARPETA:/etc/caddy/conf.d:ro" -v "$TMP/Caddyfile:/etc/caddy/Caddyfile:ro" \
  caddy:2 caddy validate --config /etc/caddy/Caddyfile 2>&1)"
CODIGO=$?
set -e
if [ "$CODIGO" != 0 ]; then echo "$SALIDA"; fi
igual "caddy validate acepta los dos archivos" "0" "$CODIGO"
tiene "caddy validate dice que la configuración es válida" "$SALIDA" "Valid configuration"

# Un archivo roto sí se rechaza: la prueba de la prueba
mkdir -p "$TMP/roto"
cp "$FRONT" "$TMP/roto/aipos.caddy"
printf 'aipos-back.salsalvador.io {\n\treverse_proxy\n' >"$TMP/roto/aipos-back.caddy"
set +e
docker run --rm -v "$TMP/roto:/etc/caddy/conf.d:ro" -v "$TMP/Caddyfile:/etc/caddy/Caddyfile:ro" \
  caddy:2 caddy validate --config /etc/caddy/Caddyfile >/dev/null 2>&1
CODIGO=$?
set -e
[ "$CODIGO" != 0 ] && ok "caddy validate rechaza un archivo roto (la prueba sí detecta errores)" || falla "caddy validate rechaza un archivo roto"

terminar
