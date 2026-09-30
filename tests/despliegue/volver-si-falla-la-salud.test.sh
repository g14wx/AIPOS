#!/usr/bin/env bash
# Spec: specs/despliegue.spec.md, "Volver a la versión anterior" (primera fila) y criterio de aceptación 5.
# Si /api/salud de 127.0.0.1 no da 200 con la versión nueva, desplegar.sh mismo vuelve a levantar la que ya corría,
# sin tocar los archivos de estado, y termina con error.
# shellcheck source=comun.sh disable=SC2015
source "$(dirname "${BASH_SOURCE[0]}")/comun.sh"
preparar_servidor

servidor_con_version release-0.2.0 release-0.1.0
crear_version release-0.3.0
regla_curl release-0.3.0 /api/salud 500
correr desplegar release-0.3.0

[ "$CODIGO" -ne 0 ] && ok "termina con error" || falla "terminó bien con /api/salud en 500"
igual "vuelve a correr la versión que ya corría" "release-0.2.0" "$(leer_corriendo)"
igual "version-actual sigue siendo release-0.2.0" "release-0.2.0" "$(leer_estado version-actual)"
igual "version-anterior sigue siendo release-0.1.0" "release-0.1.0" "$(leer_estado version-anterior)"
nueva="$(linea_de "AIPOS_VERSION=release-0.3.0 compose")"
vuelta="$(grep -nF 'AIPOS_VERSION=release-0.2.0' "$REGISTRO" | grep -F ' up ' | tail -1 | cut -d: -f1 || true)"
if [ -n "$nueva" ] && [ -n "$vuelta" ] && [ "$vuelta" -gt "$nueva" ]; then
  ok "levantó la versión anterior después de intentar la nueva"
else
  falla "no hay un up de release-0.2.0 después de probar release-0.3.0"
fi
tiene "usa el compose guardado de la versión anterior" "$(cat "$REGISTRO")" \
  "-f $AIPOS_RAIZ/versiones/release-0.2.0/docker-compose.produccion.yml"
tiene "el mensaje dice que volvió" "$SALIDA" "volv"
sin_borrar "salud que falla"

# Lo mismo si la pantalla no responde 200.
preparar_servidor
servidor_con_version release-0.2.0 release-0.1.0
crear_version release-0.3.0
regla_curl release-0.3.0 :8141 502
correr desplegar release-0.3.0
[ "$CODIGO" -ne 0 ] && ok "pantalla en 502: termina con error" || falla "pantalla en 502: terminó bien"
igual "pantalla en 502: vuelve a release-0.2.0" "release-0.2.0" "$(leer_corriendo)"
igual "pantalla en 502: version-actual no cambió" "release-0.2.0" "$(leer_estado version-actual)"

# Y si el backend o la pantalla nuevos no quedan sanos (up --wait falla).
preparar_servidor
servidor_con_version release-0.2.0 release-0.1.0
crear_version release-0.3.0
export DOCKER_FALLA='AIPOS_VERSION=release-0.3.0 .*up -d --wait backend frontend'
correr desplegar release-0.3.0
[ "$CODIGO" -ne 0 ] && ok "up --wait falla: termina con error" || falla "up --wait falla: terminó bien"
igual "up --wait falla: vuelve a release-0.2.0" "release-0.2.0" "$(leer_corriendo)"
igual "up --wait falla: version-actual no cambió" "release-0.2.0" "$(leer_estado version-actual)"
igual "up --wait falla: version-anterior no cambió" "release-0.1.0" "$(leer_estado version-anterior)"

terminar
