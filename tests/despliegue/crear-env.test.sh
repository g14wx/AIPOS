#!/usr/bin/env bash
# Spec: specs/despliegue.spec.md, sección "El .env de producción" (despliegue/crear-env.sh).
# El script crea /srv/aipos/.env (aquí, $AIPOS_RAIZ/.env) una sola vez, con permisos 600, las dos contraseñas de al
# menos 32 caracteres, distintas y sin / + =, y sin imprimirlas. Se niega a sobrescribir un .env que ya existe.
# shellcheck source=comun.sh disable=SC2015
source "$(dirname "${BASH_SOURCE[0]}")/comun.sh"
SCRIPT="$RAIZ/despliegue/crear-env.sh"
if [ -f "$SCRIPT" ]; then ok "existe despliegue/crear-env.sh"; else falla "falta despliegue/crear-env.sh"; terminar; fi
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
export AIPOS_RAIZ="$TMP/srv-aipos"
mkdir -p "$AIPOS_RAIZ"

valor() { grep -E "^$1=" "$AIPOS_RAIZ/.env" | head -1 | cut -d= -f2-; }

set +e
SALIDA="$(bash "$SCRIPT" 2>&1)"
CODIGO=$?
set -e
igual "la primera vez termina bien" "0" "$CODIGO"
[ "$CODIGO" = 0 ] || echo "$SALIDA"
comprobar "crea el .env" test -f "$AIPOS_RAIZ/.env"
igual "el .env tiene permisos 600" "600" "$(permisos "$AIPOS_RAIZ/.env")"

igual "COMPOSE_PROJECT_NAME es aipos" "aipos" "$(valor COMPOSE_PROJECT_NAME)"
igual "CORS_ORIGIN es https://aipos.salsalvador.io sin barra final" "https://aipos.salsalvador.io" "$(valor CORS_ORIGIN)"
igual "MYSQL_PORT es 3306" "3306" "$(valor MYSQL_PORT)"
igual "MYSQL_DATABASE es aipos" "aipos" "$(valor MYSQL_DATABASE)"
igual "MYSQL_USER es aipos" "aipos" "$(valor MYSQL_USER)"

clave="$(valor MYSQL_PASSWORD)"
raiz="$(valor MYSQL_ROOT_PASSWORD)"
[ "${#clave}" -ge 32 ] && ok "MYSQL_PASSWORD tiene 32 caracteres o más" || falla "MYSQL_PASSWORD tiene ${#clave} caracteres"
[ "${#raiz}" -ge 32 ] && ok "MYSQL_ROOT_PASSWORD tiene 32 caracteres o más" || falla "MYSQL_ROOT_PASSWORD tiene ${#raiz} caracteres"
[ -n "$clave" ] && [ "$clave" != "$raiz" ] && ok "las dos contraseñas son distintas" || falla "las contraseñas son iguales o vacías"
case "$clave$raiz" in
  *[/+=]*) falla "una contraseña trae /, + o =" ;;
  *) ok "las contraseñas no traen /, + ni =" ;;
esac
no_tiene "no imprime la contraseña de la app" "$SALIDA" "$clave"
no_tiene "no imprime la contraseña de root" "$SALIDA" "$raiz"
if grep -q 'AIPOS_VERSION' "$AIPOS_RAIZ/.env"; then falla "AIPOS_VERSION no va en el .env"; else ok "AIPOS_VERSION no va en el .env"; fi

echo "--- un segundo intento no sobrescribe ---"
antes="$(suma "$AIPOS_RAIZ/.env")"
set +e
SALIDA="$(bash "$SCRIPT" 2>&1)"
CODIGO=$?
set -e
[ "$CODIGO" -ne 0 ] && ok "el segundo intento termina con error" || falla "el segundo intento terminó bien"
igual "el .env no cambió" "$antes" "$(suma "$AIPOS_RAIZ/.env")"
tiene "el mensaje dice que ya existe" "$SALIDA" "ya existe"

echo "--- dos corridas en carpetas distintas dan contraseñas distintas ---"
export AIPOS_RAIZ="$TMP/otro"
mkdir -p "$AIPOS_RAIZ"
bash "$SCRIPT" >/dev/null 2>&1 || true
[ "$(valor MYSQL_PASSWORD)" != "$clave" ] && ok "las contraseñas son aleatorias" || falla "repitió la misma contraseña"

echo "--- cada variable que lee el compose está en .env.example ---"
if [ -f "$RAIZ/.env.example" ]; then
  for v in COMPOSE_PROJECT_NAME CORS_ORIGIN MYSQL_PORT MYSQL_DATABASE MYSQL_USER MYSQL_PASSWORD MYSQL_ROOT_PASSWORD; do
    comprobar ".env.example trae $v" grep -q "^$v=" "$RAIZ/.env.example"
  done
elif [ -f "$RAIZ/backend/package.json" ]; then
  falla "falta .env.example"
else
  echo "OMITIDA esta parte: todavía no está el entregable base (sin backend/package.json ni .env.example)"
fi
comprobar "el script pasa shellcheck" shellcheck "$SCRIPT"
comprobar "el script usa umask 077" grep -q 'umask 077' "$SCRIPT"

terminar
