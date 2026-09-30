#!/usr/bin/env bash
# Spec: specs/despliegue.spec.md, "Los scripts del servidor" (paso 2) y criterio de aceptación 11.
# Dos despliegues que chocan en el servidor: el segundo falla por el candado y no toca nada.
# shellcheck source=comun.sh disable=SC2015
source "$(dirname "${BASH_SOURCE[0]}")/comun.sh"
preparar_servidor

servidor_con_version release-0.1.0
crear_version release-0.2.0
marcar_imagen release-0.2.0

echo "--- con el flock de mentira, ocupado ---"
FLOCK_OCUPADO=1 correr desplegar release-0.2.0
[ "$CODIGO" -ne 0 ] && ok "con el candado ocupado termina con error" || falla "con el candado ocupado terminó bien"
tiene "pidió el candado sin esperar (-n)" "$(cat "$REGISTRO")" "flock -n"
igual "no llamó a docker" "0" "$(llamadas_docker)"
igual "sigue corriendo la versión anterior" "release-0.1.0" "$(leer_corriendo)"
igual "version-actual no cambió" "release-0.1.0" "$(leer_estado version-actual)"
tiene "el mensaje dice que hay otro despliegue" "$SALIDA" "otro despliegue"

echo "--- con el candado libre ---"
FLOCK_OCUPADO=0 correr desplegar release-0.2.0
igual "con el candado libre despliega" "0" "$CODIGO"

echo "--- con flock de verdad, si la máquina lo trae ---"
if PATH="${PATH#"$BIN":}" command -v flock >/dev/null 2>&1; then
  rm -f "$BIN/flock"
  servidor_con_version release-0.1.0
  crear_version release-0.3.0
  marcar_imagen release-0.3.0
  flock "$AIPOS_RAIZ/.despliegue.lock" sleep 5 &
  tenedor=$!
  sleep 1
  antes="$(llamadas_docker)"
  correr desplegar release-0.3.0
  [ "$CODIGO" -ne 0 ] && ok "flock real: el segundo despliegue falla mientras el primero tiene el candado" \
    || falla "flock real: el segundo despliegue no respetó el candado"
  igual "flock real: no llamó a docker" "$antes" "$(llamadas_docker)"
  kill "$tenedor" 2>/dev/null || true
  wait "$tenedor" 2>/dev/null || true
else
  echo "OMITIDA esta parte: esta máquina no trae flock (macOS); la prueba de flock real corre en Linux"
fi

terminar
