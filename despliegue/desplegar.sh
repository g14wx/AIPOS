#!/usr/bin/env bash
# Despliega una versión de AIPOS en el servidor de producción, o vuelve a la anterior.
# Spec: specs/despliegue.spec.md, secciones "Los scripts del servidor" y "Volver a la versión anterior".
#
#   desplegar.sh desplegar <etiqueta>   pone en producción la versión <etiqueta> (por ejemplo release-0.1.0)
#   desplegar.sh volver                 vuelve a la versión de version-anterior
#
# Corre en /srv/aipos, o en la carpeta que diga AIPOS_RAIZ (así lo prueban tests/despliegue con Docker de mentira).
# AIPOS_REINTENTOS (24) y AIPOS_ESPERA (5 segundos) dicen cuánto espera a que 127.0.0.1 dé 200.
# AIPOS_BAJAR_SOLO_SI_FALTA=1 no baja las imágenes que ya están en la máquina (lo usa la prueba de arranque local).
# Funciona con bash 3.2 (el del Mac) y con bash 5 (el del servidor): sin arrays asociativos ni mapfile.
set -euo pipefail

RAIZ="${AIPOS_RAIZ:-/srv/aipos}"
REINTENTOS="${AIPOS_REINTENTOS:-24}"
ESPERA="${AIPOS_ESPERA:-5}"
FORMA_ETIQUETA='^release-[0-9]+\.[0-9]+\.[0-9]+$'
REGISTRO_IMAGENES="ghcr.io/g14wx"

fallar() {
  echo "ERROR: $*" >&2
  exit 1
}

# permisos <archivo>: los permisos en octal, igual en Linux y en macOS.
permisos() { stat -c %a "$1" 2>/dev/null || stat -f %Lp "$1"; }

# comprobar_etiqueta <etiqueta>: solo release-MAYOR.MENOR.PARCHE.
comprobar_etiqueta() {
  [[ "$1" =~ $FORMA_ETIQUETA ]] || fallar "la etiqueta '$1' no tiene la forma release-MAYOR.MENOR.PARCHE (por ejemplo release-0.1.0)"
}

# comprobar_carpeta: el .env existe y solo lo lee su dueño; la carpeta de la app existe.
comprobar_env() {
  [ -d "$RAIZ" ] || fallar "no existe la carpeta de la app: $RAIZ"
  [ -f "$RAIZ/.env" ] || fallar "no existe $RAIZ/.env (se crea una sola vez con despliegue/crear-env.sh)"
  local modo
  modo="$(permisos "$RAIZ/.env")"
  [ "${modo: -2}" = "00" ] || fallar "$RAIZ/.env tiene permisos $modo: otros usuarios pueden leerlo (debe ser 600)"
}

# tomar_candado: un solo despliegue a la vez. El candado dura mientras corre este script (descriptor 9).
tomar_candado() {
  command -v flock >/dev/null 2>&1 || fallar "falta flock (viene con util-linux)"
  exec 9>"$RAIZ/.despliegue.lock"
  flock -n 9 || fallar "hay otro despliegue en marcha (el candado $RAIZ/.despliegue.lock está tomado); no se cambió nada"
}

# dc <etiqueta> <argumentos>: Docker Compose sobre la versión dada. El compose está en una subcarpeta, así que
# hacen falta --env-file y --project-directory; sin ellos Compose no encontraría el .env.
dc() {
  local v="$1"
  shift
  AIPOS_VERSION="$v" docker compose --env-file "$RAIZ/.env" --project-directory "$RAIZ" \
    -f "$RAIZ/versiones/$v/docker-compose.produccion.yml" "$@"
}

# leer_estado <archivo>: lo que dice version-actual o version-anterior (nada si no existe).
leer_estado() {
  local archivo="$RAIZ/$1" valor=""
  if [ -f "$archivo" ]; then valor="$(head -1 "$archivo" | tr -d '[:space:]')"; fi
  if [ -n "$valor" ]; then comprobar_etiqueta "$valor"; fi
  echo "$valor"
}

# escribir_estado <archivo> <etiqueta>: escribe y mueve, para que nunca quede a medias.
escribir_estado() {
  printf '%s\n' "$2" >"$RAIZ/$1.tmp"
  mv "$RAIZ/$1.tmp" "$RAIZ/$1"
}

# esperar_200 <dirección>: pide la dirección hasta que dé 200 (AIPOS_REINTENTOS veces, cada AIPOS_ESPERA segundos).
esperar_200() {
  local n=1 codigo
  while :; do
    codigo="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$1" || true)"
    if [ "$codigo" = 200 ]; then return 0; fi
    if [ "$n" -ge "$REINTENTOS" ]; then
      echo "  $1 respondió ${codigo:-000} después de $n intentos" >&2
      return 1
    fi
    n=$((n + 1))
    sleep "$ESPERA"
  done
}

# revisar_local: el backend y la pantalla de esta máquina responden 200.
revisar_local() {
  esperar_200 http://127.0.0.1:8140/api/salud && esperar_200 http://127.0.0.1:8141/
}

# imagenes_presentes <etiqueta>: las dos imágenes de esa versión ya están en el servidor.
imagenes_presentes() {
  docker image inspect "$REGISTRO_IMAGENES/aipos-backend:$1" >/dev/null 2>&1 &&
    docker image inspect "$REGISTRO_IMAGENES/aipos-frontend:$1" >/dev/null 2>&1
}

# bajar_imagenes <etiqueta>: docker compose pull. Con AIPOS_BAJAR_SOLO_SI_FALTA=1 salta las que ya están.
bajar_imagenes() {
  if [ "${AIPOS_BAJAR_SOLO_SI_FALTA:-0}" = 1 ]; then
    dc "$1" pull backend frontend --policy missing
  else
    dc "$1" pull backend frontend
  fi
}

# volver_a_lo_que_corria <la que corría> <la que falló>: después de un fallo, deja corriendo lo que corría antes.
# Si no había ninguna (primer despliegue), detiene backend y pantalla y deja MySQL y su volumen como estaban.
volver_a_lo_que_corria() {
  local actual="$1" etiqueta="$2"
  if [ -z "$actual" ]; then
    echo "Es el primer despliegue: no hay una versión anterior a la que volver. Detengo backend y pantalla; MySQL y sus datos siguen." >&2
    dc "$etiqueta" stop backend frontend || echo "AVISO: no se pudieron detener backend y pantalla" >&2
    return 0
  fi
  echo "La versión $etiqueta no quedó sana; vuelvo a levantar la versión $actual." >&2
  if [ -f "$RAIZ/versiones/$actual/docker-compose.produccion.yml" ] && dc "$actual" up -d --wait backend frontend && revisar_local; then
    echo "Se volvió a la versión $actual; el despliegue de $etiqueta no se hizo." >&2
  else
    echo "ERROR: no se pudo volver a levantar la versión $actual: hace falta intervención manual." >&2
  fi
}

desplegar() {
  local etiqueta="${1:-}" actual
  comprobar_etiqueta "$etiqueta"
  comprobar_env
  [ -f "$RAIZ/versiones/$etiqueta/docker-compose.produccion.yml" ] ||
    fallar "falta $RAIZ/versiones/$etiqueta/docker-compose.produccion.yml (el workflow lo copia antes de correr este script)"
  tomar_candado
  actual="$(leer_estado version-actual)"
  echo "== Desplegando $etiqueta (ahora corre: ${actual:-ninguna})"

  echo "-- 1/4 Bajando las imágenes"
  bajar_imagenes "$etiqueta" ||
    fallar "no se pudieron bajar las imágenes de $etiqueta; no se cambió nada de lo que corre${actual:+ (sigue la versión $actual)}"

  echo "-- 2/4 MySQL"
  dc "$etiqueta" up -d --wait mysql || fallar "MySQL no quedó sano; no se cambió el backend ni la pantalla${actual:+ (sigue la versión $actual)}"

  echo "-- 3/4 Migraciones (con el usuario de la app, nunca con root)"
  dc "$etiqueta" run --rm backend npm run migrar ||
    fallar "la migración de $etiqueta falló y no se levantó la versión nueva${actual:+ (sigue la versión $actual)}. MySQL no deshace los cambios de esquema: revisa la base de datos antes de repetir el despliegue, porque puede tener una parte de la migración aplicada."

  echo "-- 4/4 Backend y pantalla"
  if ! { dc "$etiqueta" up -d --wait backend frontend && revisar_local; }; then
    volver_a_lo_que_corria "$actual" "$etiqueta"
    fallar "el despliegue de $etiqueta falló"
  fi

  if [ -n "$actual" ]; then escribir_estado version-anterior "$actual"; fi
  escribir_estado version-actual "$etiqueta"
  echo "== Listo: corre $etiqueta${actual:+ (la anterior era $actual)}"
}

volver() {
  local actual anterior
  comprobar_env
  tomar_candado
  actual="$(leer_estado version-actual)"
  anterior="$(leer_estado version-anterior)"
  if [ -z "$anterior" ]; then
    echo "No hay versión anterior a la que volver (es el primer despliegue)." >&2
    [ -n "$actual" ] || fallar "tampoco hay version-actual: no hay nada que detener"
    dc "$actual" stop backend frontend || echo "AVISO: no se pudieron detener backend y pantalla" >&2
    fallar "backend y pantalla detenidos; MySQL y sus datos siguen. Caddy responde 502 hasta el siguiente despliegue"
  fi
  if [ "$actual" = "$anterior" ]; then
    echo "Ya corre la versión anterior ($anterior): no hay nada que hacer."
    return 0
  fi
  [ -f "$RAIZ/versiones/$anterior/docker-compose.produccion.yml" ] ||
    fallar "falta $RAIZ/versiones/$anterior/docker-compose.produccion.yml: hace falta intervención manual"
  if ! imagenes_presentes "$anterior"; then
    echo "Las imágenes de $anterior ya no están en el servidor: las bajo de ghcr.io."
    bajar_imagenes "$anterior" || fallar "no se pudieron bajar las imágenes de $anterior: hace falta intervención manual"
  fi
  echo "== Volviendo de ${actual:-ninguna} a $anterior (las migraciones no se deshacen)"
  if dc "$anterior" up -d --wait backend frontend && revisar_local; then
    escribir_estado version-actual "$anterior"
    echo "== Listo: corre $anterior"
  else
    fallar "la versión $anterior no quedó sana: hace falta intervención manual"
  fi
}

uso() {
  echo "Uso: desplegar.sh desplegar <etiqueta>   |   desplegar.sh volver" >&2
  exit 2
}

case "${1:-}" in
  desplegar) [ "$#" -eq 2 ] || uso; desplegar "$2" ;;
  volver) [ "$#" -eq 1 ] || uso; volver ;;
  *) uso ;;
esac
