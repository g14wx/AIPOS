#!/usr/bin/env bash
# Spec: specs/despliegue.spec.md, "Los scripts del servidor" (paso 3) y "Casos de error".
# No se puede bajar una imagen: desplegar.sh termina antes de tocar nada de lo que corre.
# shellcheck source=comun.sh disable=SC2015
source "$(dirname "${BASH_SOURCE[0]}")/comun.sh"
preparar_servidor

servidor_con_version release-0.1.0
crear_version release-0.2.0
export DOCKER_FALLA='AIPOS_VERSION=release-0.2.0 .*pull'
correr desplegar release-0.2.0

[ "$CODIGO" -ne 0 ] && ok "termina con error" || falla "terminó bien sin poder bajar la imagen"
tiene "intentó bajar las imágenes" "$(cat "$REGISTRO")" "pull backend frontend"
for orden in " up " " run " " stop " " down "; do
  no_tiene "no corre$orden después de un pull fallido" "$(cat "$REGISTRO")" "$orden"
done
igual "sigue corriendo la versión anterior" "release-0.1.0" "$(leer_corriendo)"
igual "version-actual no cambió" "release-0.1.0" "$(leer_estado version-actual)"
igual "version-anterior no cambió" "(no hay)" "$(leer_estado version-anterior)"
tiene "el mensaje dice que no se pudo bajar" "$SALIDA" "bajar"
sin_borrar "pull que falla"

terminar
