#!/usr/bin/env bash
# Spec: specs/despliegue.spec.md, criterio de aceptación 15 (el repositorio no trae credenciales).
# Issue #67: sin-datos-privados.test.sh contaba como credencial una comparación y una llamada que leen una contraseña
# (el backend llama `clave` a la contraseña que lee del entorno). Esta prueba corre esa misma revisión sobre
# repositorios de mentira: con código que solo lee una contraseña tiene que pasar, y con una credencial escrita a mano
# (con comillas o sin ellas, en una variable, en un .env o en JSON) tiene que fallar.
# Los nombres se arman por partes para que la revisión del repositorio no encuentre esta prueba a sí misma.
# shellcheck source=comun.sh
source "$(dirname "${BASH_SOURCE[0]}")/comun.sh"
command -v git >/dev/null || omitir "falta git"
command -v python3 >/dev/null || omitir "falta python3"

CL="cla""ve"
PASS="PASS""WORD"
TOK="TO""KEN"
SECRETO="hunter2""hunter2"
BT='`' # la comilla invertida: cierra un fragmento de código en un texto y abre una sustitución de comandos

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
N=0

# revisar "<contenido de backend/src/ejemplo.js>": arma un repositorio de mentira con la prueba y su comun.sh copiados
# (así RAIZ es esa carpeta de mentira) y corre la revisión. Deja la salida en SALIDA y el código en CODIGO.
revisar() {
  N=$((N + 1))
  local dir="$TMP/repo$N"
  mkdir -p "$dir/tests/despliegue" "$dir/backend/src"
  cp "$RAIZ/tests/despliegue/comun.sh" "$RAIZ/tests/despliegue/sin-datos-privados.test.sh" "$dir/tests/despliegue/"
  printf '%s\n' "$1" >"$dir/backend/src/ejemplo.js"
  git -C "$dir" init -q
  set +e
  SALIDA="$(bash "$dir/tests/despliegue/sin-datos-privados.test.sh" 2>&1)"
  CODIGO=$?
  set -e
}

echo "# código que solo lee una contraseña: no es una credencial"
revisar "const $CL = texto(env, 'MYSQL_ROOT_$PASS');
if ($CL === '') {
if ($CL === 'example') {
} else if ($CL === 'examples') {
const larga = $CL => $CL.length > 8;
// la prueba tomaba como valor todo lo que sigue a ${BT}$CL =${BT}, y marcaba el código que lee la contraseña
MYSQL_$PASS=${BT}openssl rand -hex 16${BT}"
igual "una comparación, una flecha, una llamada, un texto corrido y una sustitución de comandos no son una credencial" "0" "$CODIGO"
[ "$CODIGO" = 0 ] || echo "$SALIDA"
tiene "la revisión de credenciales dice ok" "$SALIDA" "ok: sin credenciales"

echo "# una credencial escrita a mano sigue siendo un hallazgo"
while IFS='|' read -r descripcion linea; do
  revisar "$linea"
  igual "$descripcion: la revisión falla" "1" "$CODIGO"
  tiene "$descripcion: dice que hay credenciales" "$SALIDA" "FALLA: sin credenciales"
done <<CASOS
un texto con comillas en una variable|const $CL = '$SECRETO';
una variable sin comillas|$CL=$SECRETO
una variable de entorno|MYSQL_$PASS=$SECRETO
una ficha con puntos|$TOK=abc.def.ghi
un campo de JSON|{ "$CL": "$SECRETO" }
un valor escrito después de una comparación|if ($CL === 'x') { $CL = '$SECRETO'; }
CASOS

terminar
