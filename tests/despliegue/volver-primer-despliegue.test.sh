#!/usr/bin/env bash
# Spec: specs/despliegue.spec.md, "Volver a la versión anterior" (`desplegar.sh volver` sin version-anterior) y
# "Casos de error" (primer despliegue que falla): no hay a dónde volver, se detienen backend y pantalla, MySQL y su
# volumen quedan, y el script termina con error.
# shellcheck source=comun.sh disable=SC2015
source "$(dirname "${BASH_SOURCE[0]}")/comun.sh"
preparar_servidor

echo "--- primer despliegue cuya salud falla ---"
crear_version release-0.1.0
regla_curl release-0.1.0 /api/salud 500
correr desplegar release-0.1.0
[ "$CODIGO" -ne 0 ] && ok "termina con error" || falla "terminó bien con /api/salud en 500"
tiene "detiene backend y pantalla" "$(cat "$REGISTRO")" "stop backend frontend"
igual "no queda nada corriendo" "ninguna" "$(leer_corriendo)"
igual "no escribe version-actual" "(no hay)" "$(leer_estado version-actual)"
igual "no escribe version-anterior" "(no hay)" "$(leer_estado version-anterior)"
no_tiene "no detiene MySQL" "$(cat "$REGISTRO")" "stop mysql"
sin_borrar "primer despliegue que falla"

echo "--- desplegar.sh volver sin version-anterior ---"
preparar_servidor
crear_version release-0.1.0
marcar_imagen release-0.1.0
estar_corriendo release-0.1.0
echo release-0.1.0 >"$AIPOS_RAIZ/version-actual"
correr volver
[ "$CODIGO" -ne 0 ] && ok "termina con error: no hay a dónde volver" || falla "terminó bien sin version-anterior"
tiene "detiene backend y pantalla" "$(cat "$REGISTRO")" "stop backend frontend"
no_tiene "no detiene MySQL" "$(cat "$REGISTRO")" "stop mysql"
igual "no queda nada corriendo" "ninguna" "$(leer_corriendo)"
tiene "el mensaje dice que no hay versión anterior" "$SALIDA" "anterior"
sin_borrar "volver sin version-anterior"

terminar
