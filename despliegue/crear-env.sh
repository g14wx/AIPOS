#!/usr/bin/env bash
# Crea el .env de producción, una sola vez, en /srv/aipos (o en la carpeta que diga AIPOS_RAIZ, para las pruebas).
# Spec: specs/despliegue.spec.md, sección "El .env de producción".
# Corre en el servidor, con el usuario de despliegue. Escribe el archivo con permisos 600 y no imprime las contraseñas.
# Se niega a sobrescribir un .env que ya existe: MySQL solo lee las contraseñas al crear su volumen, así que cambiarlas
# en el archivo no las cambia en la base, y se perdería el acceso.
set -euo pipefail
umask 077

RAIZ="${AIPOS_RAIZ:-/srv/aipos}"
ENV="$RAIZ/.env"

[ -d "$RAIZ" ] || {
  echo "ERROR: no existe la carpeta de la app: $RAIZ" >&2
  exit 1
}
if [ -e "$ENV" ]; then
  echo "ERROR: $ENV ya existe; no lo sobrescribo. Si de verdad quieres otro, muévelo tú a mano (las contraseñas de un volumen de MySQL que ya se creó no cambian)." >&2
  exit 1
fi

# generar_clave: 32 caracteres o más, sin /, + ni = (romperían la conexión). Sale de openssl rand -base64 32.
generar_clave() {
  local clave=""
  while [ "${#clave}" -lt 32 ]; do
    clave="$(openssl rand -base64 32 | tr -d '/+=\n')"
  done
  printf '%s' "$clave"
}

clave_app="$(generar_clave)"
clave_root="$(generar_clave)"

# noclobber: si otro proceso crea el archivo justo ahora, esta redirección falla en vez de pisarlo.
set -o noclobber
{
  echo "COMPOSE_PROJECT_NAME=aipos"
  echo "CORS_ORIGIN=https://aipos.salsalvador.io"
  echo "MYSQL_PORT=3306"
  echo "MYSQL_DATABASE=aipos"
  echo "MYSQL_USER=aipos"
  echo "MYSQL_PASSWORD=$clave_app"
  echo "MYSQL_ROOT_PASSWORD=$clave_root"
} >"$ENV"
set +o noclobber

chmod 600 "$ENV"
echo "Listo: se creó $ENV con permisos 600. Las contraseñas están dentro del archivo; no se muestran."
