# shellcheck shell=bash disable=SC2034
# Ayudas de las pruebas de tests/despliegue (spec: specs/despliegue.spec.md, sección "Pruebas en local").
# Cada prueba se corre sola con `bash tests/despliegue/<nombre>.test.sh`, imprime `ok:` o `FALLA:` y termina con
# `todo bien` o con error. Este archivo no es una prueba: se carga con `source`.
#
# Sirve para dos cosas:
#   1. Contar aciertos y fallas (ok, falla, comprobar, terminar, omitir).
#   2. Armar un "servidor de mentira": una carpeta temporal que hace de /srv/aipos, y dobles de `docker`, `curl` y
#      `flock` al inicio del PATH. Los dobles anotan cada llamada en $REGISTRO y no tocan Docker ni la red.
#
# Lo que las pruebas esperan de despliegue/desplegar.sh (el script las obliga a ser así):
#   - Corre con bash 3.2 (el del Mac) y con bash 5 (el del servidor): sin arrays asociativos ni `mapfile`.
#   - Toma el candado con `flock -n <descriptor o archivo>` sobre $AIPOS_RAIZ/.despliegue.lock, sin `-w`.
#   - Todas las órdenes de Compose son `docker compose --env-file $AIPOS_RAIZ/.env --project-directory $AIPOS_RAIZ
#     -f $AIPOS_RAIZ/versiones/<etiqueta>/docker-compose.produccion.yml ...` con AIPOS_VERSION=<etiqueta> en el entorno.
#   - Para saber si una imagen ya está en el servidor usa `docker image inspect ghcr.io/g14wx/aipos-<parte>:<etiqueta>`.
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FALLAS=0

ok() { echo "ok: $1"; }
falla() {
  echo "FALLA: $1"
  FALLAS=$((FALLAS + 1))
}

# comprobar "descripción" comando args...  -> ok si el comando termina bien
comprobar() {
  local descripcion="$1"
  shift
  if "$@" >/dev/null 2>&1; then ok "$descripcion"; else falla "$descripcion"; fi
}

# tiene "descripción" "texto" "patrón fijo"  -> ok si el texto contiene el patrón
tiene() {
  if grep -qF -- "$3" <<<"$2"; then ok "$1"; else falla "$1 (no aparece: $3)"; fi
}

# no_tiene "descripción" "texto" "patrón fijo"  -> ok si el texto NO contiene el patrón
no_tiene() {
  if grep -qF -- "$3" <<<"$2"; then falla "$1 (aparece: $3)"; else ok "$1"; fi
}

# igual "descripción" "esperado" "real"
igual() {
  if [ "$2" = "$3" ]; then ok "$1"; else falla "$1 (esperado '$2', real '$3')"; fi
}

terminar() {
  if [ "$FALLAS" -gt 0 ]; then
    echo "$FALLAS fallas"
    exit 1
  fi
  echo "todo bien"
  exit 0
}

# omitir "motivo": la prueba no puede correr aquí (falta una herramienta, la red o el código de otra tarjeta).
# Lo dice en voz alta y termina bien: no es un acierto, es una prueba que no corrió.
omitir() {
  echo "OMITIDA: $1"
  echo "todo bien (omitida)"
  exit 0
}

# Permisos de un archivo en octal, igual en macOS y en Linux.
permisos() { stat -c %a "$1" 2>/dev/null || stat -f %Lp "$1"; }

# Suma de comprobación de un archivo, igual en macOS y en Linux.
suma() { shasum -a 256 "$1" | cut -d' ' -f1; }

# ---------------------------------------------------------------------------------------------------------------
# Servidor de mentira
# ---------------------------------------------------------------------------------------------------------------

# Crea la carpeta temporal, un .env con permisos 600 y los dobles. Deja estas variables listas:
#   AIPOS_RAIZ  la carpeta que hace de /srv/aipos      REGISTRO   el archivo donde los dobles anotan cada llamada
#   ESTADO      qué versión "corre" y qué imágenes "hay"   BIN     los dobles (al inicio del PATH)
# Variables que cambian lo que hacen los dobles (se pasan con `export` o delante de la orden):
#   DOCKER_FALLA  expresión regular; si "AIPOS_VERSION=<v> <argumentos>" la cumple, docker falla
#   FLOCK_OCUPADO 1 = otro despliegue tiene el candado
preparar_servidor() {
  if [ -n "${TMP:-}" ]; then rm -rf "$TMP"; fi
  TMP="$(mktemp -d)"
  trap 'rm -rf "$TMP"' EXIT
  AIPOS_RAIZ="$TMP/srv-aipos"
  BIN="$TMP/bin"
  ESTADO="$TMP/estado"
  IMAGENES="$ESTADO/imagenes"
  REGISTRO="$TMP/registro.log"
  REGLAS_CURL="$TMP/curl.reglas"
  mkdir -p "$AIPOS_RAIZ/versiones" "$BIN" "$IMAGENES"
  : >"$REGISTRO"
  : >"$REGLAS_CURL"
  echo ninguna >"$ESTADO/corriendo"
  printf 'COMPOSE_PROJECT_NAME=aipos\nMYSQL_PASSWORD=clave-de-mentira\n' >"$AIPOS_RAIZ/.env"
  chmod 600 "$AIPOS_RAIZ/.env"
  crear_dobles
  export AIPOS_RAIZ REGISTRO ESTADO IMAGENES REGLAS_CURL
  export AIPOS_REINTENTOS=2 AIPOS_ESPERA=0
  unset DOCKER_FALLA FLOCK_OCUPADO
  PATH="$BIN:$PATH"
  export PATH
}

crear_dobles() {
  cat >"$BIN/docker" <<'EOF'
#!/usr/bin/env bash
# docker de mentira: anota la llamada, lleva la cuenta de las imágenes que "hay" y de la versión que "corre".
version="${AIPOS_VERSION:-}"
linea="AIPOS_VERSION=$version $*"
echo "docker $linea" >>"$REGISTRO"
pedido_a_fallar() { [ -n "${DOCKER_FALLA:-}" ] && [[ "$linea" =~ $DOCKER_FALLA ]]; }
sub=""
for a in "$@"; do
  case "$a" in pull | up | run | stop | image) sub="$a"; break ;; esac
done
con() { local x; for x in "$@"; do [ "$x" = "$buscada" ] && return 0; done; return 1; }
case "$sub" in
  pull)
    [ -n "$version" ] || { echo "falta AIPOS_VERSION" >&2; exit 1; }
    pedido_a_fallar && { echo "docker de mentira: no se pudo bajar" >&2; exit 1; }
    touch "$IMAGENES/$version"
    ;;
  image)
    pedido_a_fallar && exit 1
    imagen="${*: -1}"
    [ -e "$IMAGENES/${imagen##*:}" ] || exit 1
    ;;
  run)
    [ -n "$version" ] || { echo "falta AIPOS_VERSION" >&2; exit 1; }
    [ -e "$IMAGENES/$version" ] || { echo "no está la imagen $version" >&2; exit 1; }
    pedido_a_fallar && { echo "docker de mentira: falla a pedido" >&2; exit 1; }
    ;;
  up)
    if buscada=backend con "$@"; then
      [ -n "$version" ] || { echo "falta AIPOS_VERSION" >&2; exit 1; }
      [ -e "$IMAGENES/$version" ] || { echo "no está la imagen $version" >&2; exit 1; }
      echo "$version" >"$ESTADO/corriendo"
    fi
    pedido_a_fallar && { echo "docker de mentira: no quedó sano" >&2; exit 1; }
    ;;
  stop)
    pedido_a_fallar && exit 1
    if buscada=backend con "$@"; then echo ninguna >"$ESTADO/corriendo"; fi
    ;;
esac
exit 0
EOF
  cat >"$BIN/curl" <<'EOF'
#!/usr/bin/env bash
# curl de mentira: responde según lo que "corre" ($ESTADO/corriendo) y las reglas de $REGLAS_CURL
# (una por línea: "<versión o *> <parte de la dirección> <código>"; gana la primera que cumple).
url="" con_w=0 con_i=0 con_f=0
for a in "$@"; do
  case "$a" in
    http://* | https://*) url="$a" ;;
    --write-out) con_w=1 ;;
    --include) con_i=1 ;;
    --fail) con_f=1 ;;
    --*) ;;
    -[a-zA-Z]*)
      case "$a" in *w*) con_w=1 ;; esac
      case "$a" in *i*) con_i=1 ;; esac
      case "$a" in *f*) con_f=1 ;; esac
      ;;
  esac
done
echo "curl $url" >>"$REGISTRO"
corriendo="$(cat "$ESTADO/corriendo")"
codigo=""
while read -r v fragmento c; do
  [ -n "$v" ] || continue
  if { [ "$v" = "*" ] || [ "$v" = "$corriendo" ]; } && [[ "$url" == *"$fragmento"* ]]; then codigo="$c"; break; fi
done <"$REGLAS_CURL"
if [ -z "$codigo" ]; then
  if [ "$corriendo" = ninguna ]; then codigo=000; else codigo=200; fi
fi
[ "$codigo" = 000 ] && exit 7
[ "$con_i" = 1 ] && printf 'HTTP/1.1 %s\r\n\r\n' "$codigo"
[ "$con_w" = 1 ] && printf '%s' "$codigo"
if [ "$con_w" = 0 ] && [ "$codigo" -lt 400 ]; then
  case "$url" in *"/api/salud"*) echo '{"estado":"ok","baseDeDatos":"ok"}' ;; *) echo ok ;; esac
fi
[ "$con_f" = 1 ] && [ "$codigo" -ge 400 ] && exit 22
exit 0
EOF
  cat >"$BIN/flock" <<'EOF'
#!/usr/bin/env bash
# flock de mentira (macOS no trae flock): dice que el candado está ocupado si FLOCK_OCUPADO=1.
echo "flock $*" >>"$REGISTRO"
[ "${FLOCK_OCUPADO:-0}" = 1 ] && exit 1
restantes=()
for a in "$@"; do case "$a" in -*) ;; *) restantes+=("$a") ;; esac; done
[ "${#restantes[@]}" -gt 1 ] && exec "${restantes[@]:1}"
exit 0
EOF
  chmod +x "$BIN/docker" "$BIN/curl" "$BIN/flock"
}

# Ayudas para armar el estado del servidor de mentira.
crear_version() { # etiqueta: la carpeta de la versión con su compose
  mkdir -p "$AIPOS_RAIZ/versiones/$1"
  echo "# compose de mentira de $1" >"$AIPOS_RAIZ/versiones/$1/docker-compose.produccion.yml"
}
marcar_imagen() { : >"$IMAGENES/$1"; }           # la imagen de esa etiqueta ya está en el servidor
estar_corriendo() { echo "$1" >"$ESTADO/corriendo"; } # qué versión corre ahora ("ninguna" si nada)
leer_corriendo() { cat "$ESTADO/corriendo"; }
regla_curl() { echo "$1 $2 $3" >>"$REGLAS_CURL"; }  # versión (o *), parte de la dirección, código HTTP
leer_estado() { cat "$AIPOS_RAIZ/$1" 2>/dev/null || echo "(no hay)"; } # version-actual o version-anterior
llamadas_docker() { grep -c '^docker ' "$REGISTRO" || true; }
# Número de la primera línea del registro que trae el texto fijo (vacío si no hay).
linea_de() { grep -nF -- "$1" "$REGISTRO" | head -1 | cut -d: -f1 || true; }
cuantas() { grep -cF -- "$1" "$REGISTRO" || true; }

# Estado de un servidor con la versión $1 corriendo y guardada como version-actual (y $2 como version-anterior).
servidor_con_version() {
  crear_version "$1"
  marcar_imagen "$1"
  estar_corriendo "$1"
  echo "$1" >"$AIPOS_RAIZ/version-actual"
  if [ -n "${2:-}" ]; then
    crear_version "$2"
    marcar_imagen "$2"
    echo "$2" >"$AIPOS_RAIZ/version-anterior"
  fi
}

# Corre despliegue/desplegar.sh con los argumentos dados; deja la salida en SALIDA y el código en CODIGO.
correr() {
  set +e
  SALIDA="$(cd "$TMP" && bash "$RAIZ/despliegue/desplegar.sh" "$@" 2>&1)"
  CODIGO=$?
  set -e
}

# Ninguna llamada del registro puede borrar datos.
sin_borrar() {
  if grep -E '^docker .*( down|--volumes| -v( |$)|prune|volume rm)' "$REGISTRO" >/dev/null; then
    falla "$1: docker recibió una orden que borra datos"
  else
    ok "$1: ninguna orden de docker borra datos"
  fi
}

# ---------------------------------------------------------------------------------------------------------------
# Repositorio de git de mentira (para despliegue/revisar-etiqueta.sh)
# ---------------------------------------------------------------------------------------------------------------

# Crea en $1 un "origen" y un clon con la rama ProductionEnv (commit EN_PRODUCCION) y otra rama, feature/otra, que
# sale de ProductionEnv y tiene un commit más (commit FUERA_DE_PRODUCCION). Deja el clon en $REPO_MENTIRA, con
# origin/ProductionEnv al día. No toca la configuración global de git.
crear_repo_de_mentira() {
  local base="$1" g
  g() { git -c user.name=Prueba -c user.email=prueba@example.com -c commit.gpgsign=false -c core.hooksPath=/dev/null "$@"; }
  mkdir -p "$base"
  g init -q --bare -b ProductionEnv "$base/origen.git"
  REPO_MENTIRA="$base/clon"
  g clone -q "$base/origen.git" "$REPO_MENTIRA" 2>/dev/null
  (
    cd "$REPO_MENTIRA"
    g switch -q -c ProductionEnv
    echo uno >archivo.txt
    g add archivo.txt
    g commit -q -m "primer commit en ProductionEnv"
    g push -q -u origin ProductionEnv
    g switch -q -c feature/otra
    echo dos >>archivo.txt
    g commit -q -am "commit que solo está en otra rama"
    g push -q -u origin feature/otra
    g switch -q ProductionEnv
  )
  EN_PRODUCCION="$(git -C "$REPO_MENTIRA" rev-parse ProductionEnv)"
  FUERA_DE_PRODUCCION="$(git -C "$REPO_MENTIRA" rev-parse feature/otra)"
}

# Corre despliegue/revisar-etiqueta.sh dentro del clon de mentira; deja la salida en SALIDA y el código en CODIGO.
revisar_etiqueta() {
  set +e
  SALIDA="$(cd "$REPO_MENTIRA" && bash "$RAIZ/despliegue/revisar-etiqueta.sh" "$@" 2>&1)"
  CODIGO=$?
  set -e
}
