#!/usr/bin/env bash
# Spec: specs/despliegue.spec.md, "Los scripts del servidor" (paso 5) y criterio de aceptación 10.
# Una migración que falla: desplegar.sh no levanta la versión nueva, la anterior sigue corriendo, los archivos de
# estado no cambian y el mensaje avisa que hay que revisar la base (MySQL no deshace los cambios de esquema).
# shellcheck source=comun.sh disable=SC2015
source "$(dirname "${BASH_SOURCE[0]}")/comun.sh"
preparar_servidor

servidor_con_version release-0.1.0
crear_version release-0.2.0
export DOCKER_FALLA='AIPOS_VERSION=release-0.2.0 .*run --rm backend npm run migrar'
correr desplegar release-0.2.0

[ "$CODIGO" -ne 0 ] && ok "termina con error" || falla "terminó bien aunque la migración falló"
tiene "la migración corrió (para que el fallo sea el de la prueba)" "$(cat "$REGISTRO")" "run --rm backend npm run migrar"
igual "no levantó el backend nuevo: sigue corriendo la versión anterior" "release-0.1.0" "$(leer_corriendo)"
igual "version-actual no cambió" "release-0.1.0" "$(leer_estado version-actual)"
igual "version-anterior no cambió" "(no hay)" "$(leer_estado version-anterior)"
no_tiene "no hay ninguna orden up del backend con la versión nueva" "$(cat "$REGISTRO")" \
  "AIPOS_VERSION=release-0.2.0 compose --env-file $AIPOS_RAIZ/.env --project-directory $AIPOS_RAIZ -f $AIPOS_RAIZ/versiones/release-0.2.0/docker-compose.produccion.yml up -d --wait backend frontend"
n_migrar="$(linea_de "run --rm backend npm run migrar")"
if grep -nE 'up .*(backend|frontend)' "$REGISTRO" | awk -F: -v n="$n_migrar" '$1 > n' | grep -q .; then
  falla "levantó backend o pantalla después de que la migración falló"
else
  ok "no levantó backend ni pantalla después del fallo"
fi
tiene "el mensaje habla de la migración" "$SALIDA" "migra"
tiene "el mensaje pide revisar la base" "$SALIDA" "revis"
sin_borrar "migración que falla"

# Primer despliegue con migración que falla: nada corre y no se crean archivos de estado.
unset DOCKER_FALLA
preparar_servidor
crear_version release-0.1.0
export DOCKER_FALLA='run --rm backend npm run migrar'
correr desplegar release-0.1.0
[ "$CODIGO" -ne 0 ] && ok "primer despliegue: termina con error" || falla "primer despliegue: terminó bien"
igual "primer despliegue: no corre nada" "ninguna" "$(leer_corriendo)"
igual "primer despliegue: no escribe version-actual" "(no hay)" "$(leer_estado version-actual)"

terminar
