#!/usr/bin/env bash
# Revisa desde fuera del servidor que AIPOS responde: el backend, la pantalla, la documentación de la API y el CORS.
# Spec: specs/despliegue.spec.md, sección "Revisión desde internet (despliegue/revisar-produccion.sh)".
#
#   revisar-produccion.sh <pantalla> <backend> <origen>
#   revisar-produccion.sh https://aipos.salsalvador.io https://aipos-back.salsalvador.io https://aipos.salsalvador.io
#
# Corre en el runner de GitHub, así que comprueba todo el camino: DNS, HTTPS, Caddy y los contenedores.
# Todo sale por HTTPS y curl valida el certificado (nunca se le pide que no lo valide).
# AIPOS_REINTENTOS (24) y AIPOS_ESPERA (5 segundos) dicen cuánto espera cada revisión: en el primer despliegue Caddy
# tarda unos segundos en sacar el certificado. Termina con error, y dice qué revisión falló, en la primera que falle.
set -euo pipefail

REINTENTOS="${AIPOS_REINTENTOS:-24}"
ESPERA="${AIPOS_ESPERA:-5}"
OTRO_ORIGEN="https://otro.example"

if [ "$#" -ne 3 ]; then
  echo "Uso: revisar-produccion.sh <pantalla> <backend> <origen>" >&2
  exit 2
fi
PANTALLA="${1%/}"
BACKEND="${2%/}"
ORIGEN="${3%/}"

MOTIVO=""    # por qué falló el último intento de la revisión en curso
CODIGO_HTTP="" # lo que dejó la última llamada de pedir
CUERPO=""

# pedir <dirección> [opciones de curl]: deja CODIGO_HTTP y CUERPO. Un fallo de red da 000.
pedir() {
  local url="$1" salida
  shift
  salida="$(curl -s --max-time 15 -w '\n%{http_code}' "$@" "$url" 2>/dev/null)" || true
  CODIGO_HTTP="${salida##*$'\n'}"
  CUERPO="${salida%$'\n'*}"
  [ -n "$CODIGO_HTTP" ] || CODIGO_HTTP=000
}

# cabecera_cors <origen>: el valor de Access-Control-Allow-Origin que devuelve /api/salud a ese origen (vacío si no hay).
cabecera_cors() {
  curl -s --max-time 15 -D - -o /dev/null -H "Origin: $1" "$BACKEND/api/salud" 2>/dev/null |
    tr -d '\r' | grep -i '^access-control-allow-origin:' | head -1 | cut -d: -f2- | sed 's/^ *//' || true
}

revisar_salud() {
  pedir "$BACKEND/api/salud"
  if [ "$CODIGO_HTTP" != 200 ]; then MOTIVO="GET $BACKEND/api/salud respondió $CODIGO_HTTP y se esperaba 200"; return 1; fi
  if ! grep -Eq '"estado"[[:space:]]*:[[:space:]]*"ok"' <<<"$CUERPO"; then MOTIVO="GET /api/salud dio 200 pero no dice \"estado\":\"ok\""; return 1; fi
}

revisar_pantalla() {
  pedir "$PANTALLA/"
  if [ "$CODIGO_HTTP" != 200 ]; then MOTIVO="la pantalla ($PANTALLA/) respondió $CODIGO_HTTP y se esperaba 200"; return 1; fi
}

revisar_docs() {
  pedir "$BACKEND/api/docs" -L
  if [ "$CODIGO_HTTP" != 200 ]; then MOTIVO="GET $BACKEND/api/docs (siguiendo la redirección a /api/docs/) respondió $CODIGO_HTTP y se esperaba 200"; return 1; fi
}

revisar_cors_permitido() {
  local valor
  valor="$(cabecera_cors "$ORIGEN")"
  if [ "$valor" != "$ORIGEN" ]; then
    MOTIVO="CORS: el backend no deja pasar a la pantalla ($ORIGEN); Access-Control-Allow-Origin dice '${valor:-(no viene)}'. Sin esa cabecera la pantalla abre pero no puede llamar a la API"
    return 1
  fi
}

revisar_cors_otro() {
  local valor
  valor="$(cabecera_cors "$OTRO_ORIGEN")"
  if [ -n "$valor" ]; then
    MOTIVO="CORS: el backend deja pasar a otro origen ($OTRO_ORIGEN); Access-Control-Allow-Origin dice '$valor'"
    return 1
  fi
}

# revisar <nombre> <función>: repite la función hasta que salga bien o se acaben los reintentos.
revisar() {
  local nombre="$1" funcion="$2" n=1
  while ! "$funcion"; do
    if [ "$n" -ge "$REINTENTOS" ]; then
      echo "FALLA: $nombre. $MOTIVO (después de $n intentos)." >&2
      exit 1
    fi
    n=$((n + 1))
    sleep "$ESPERA"
  done
  echo "ok: $nombre"
}

revisar "el backend está vivo (/api/salud)" revisar_salud
revisar "la pantalla responde" revisar_pantalla
revisar "la documentación de la API responde (/api/docs)" revisar_docs
revisar "el backend deja pasar a la pantalla (CORS)" revisar_cors_permitido
revisar "el backend no deja pasar a otros orígenes (CORS)" revisar_cors_otro
echo "Bien: las cinco revisiones pasaron."
