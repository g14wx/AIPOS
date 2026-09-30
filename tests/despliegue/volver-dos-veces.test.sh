#!/usr/bin/env bash
# Spec: specs/despliegue.spec.md, "Volver a la versión anterior" (`desplegar.sh volver`).
# Volver levanta version-anterior con su propio compose y escribe version-actual. Correrlo otra vez no hace nada:
# así el paso 5 del workflow no deshace lo que desplegar.sh ya deshizo. Si la imagen anterior ya no está en el
# servidor, la baja de ghcr.io; si tampoco se puede, dice "hace falta intervención manual".
# shellcheck source=comun.sh disable=SC2015
source "$(dirname "${BASH_SOURCE[0]}")/comun.sh"
preparar_servidor

echo "--- primer volver: de release-0.2.0 a release-0.1.0 ---"
servidor_con_version release-0.2.0 release-0.1.0
correr volver
igual "el primer volver termina bien" "0" "$CODIGO"
[ "$CODIGO" = 0 ] || echo "$SALIDA"
igual "corre release-0.1.0" "release-0.1.0" "$(leer_corriendo)"
igual "version-actual pasa a release-0.1.0" "release-0.1.0" "$(leer_estado version-actual)"
igual "version-anterior sigue en release-0.1.0" "release-0.1.0" "$(leer_estado version-anterior)"
tiene "usa el compose guardado de la versión anterior" "$(cat "$REGISTRO")" \
  "-f $AIPOS_RAIZ/versiones/release-0.1.0/docker-compose.produccion.yml"
tiene "levanta y espera que estén sanos" "$(cat "$REGISTRO")" "up -d --wait"
tiene "comprueba /api/salud en 127.0.0.1" "$(cat "$REGISTRO")" "127.0.0.1:8140/api/salud"
tiene "comprueba la pantalla en 127.0.0.1" "$(cat "$REGISTRO")" "127.0.0.1:8141"
sin_borrar "primer volver"

echo "--- segundo volver: no hace nada ---"
antes="$(llamadas_docker)"
correr volver
igual "el segundo volver termina bien" "0" "$CODIGO"
igual "no llamó a docker otra vez" "$antes" "$(llamadas_docker)"
igual "sigue corriendo release-0.1.0" "release-0.1.0" "$(leer_corriendo)"
igual "version-actual no cambió" "release-0.1.0" "$(leer_estado version-actual)"

echo "--- la imagen anterior ya no está en el servidor: la baja de ghcr.io ---"
preparar_servidor
servidor_con_version release-0.2.0 release-0.1.0
rm -f "$IMAGENES/release-0.1.0"
correr volver
igual "termina bien tras bajar la imagen" "0" "$CODIGO"
tiene "baja la imagen anterior" "$(cat "$REGISTRO")" "AIPOS_VERSION=release-0.1.0"
tiene "con docker compose pull" "$(cat "$REGISTRO")" "pull backend frontend"
igual "corre release-0.1.0" "release-0.1.0" "$(leer_corriendo)"

echo "--- tampoco se puede bajar: hace falta intervención manual ---"
preparar_servidor
servidor_con_version release-0.2.0 release-0.1.0
rm -f "$IMAGENES/release-0.1.0"
export DOCKER_FALLA='AIPOS_VERSION=release-0.1.0 .*pull'
correr volver
[ "$CODIGO" -ne 0 ] && ok "termina con error" || falla "terminó bien sin poder bajar la imagen anterior"
tiene "el mensaje pide intervención manual" "$SALIDA" "hace falta intervención manual"
igual "version-actual no cambió" "release-0.2.0" "$(leer_estado version-actual)"
sin_borrar "volver sin imagen"

terminar
