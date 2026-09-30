#!/usr/bin/env bash
# Spec: specs/despliegue.spec.md, sección "Los scripts del servidor" (despliegue/desplegar.sh desplegar <etiqueta>).
# Un despliegue que sale bien: las órdenes van en el orden de la spec, con las opciones de Compose que hacen falta,
# y al final los archivos de estado dicen qué versión corre y cuál era la anterior. También cubre las
# precondiciones (etiqueta, .env, compose de la versión): si no se cumplen, no toca Docker.
# shellcheck source=comun.sh disable=SC2015
source "$(dirname "${BASH_SOURCE[0]}")/comun.sh"
preparar_servidor

# --- Primer despliegue -----------------------------------------------------------------------------------------
crear_version release-0.1.0
correr desplegar release-0.1.0
igual "el primer despliegue termina bien" "0" "$CODIGO"
[ "$CODIGO" = 0 ] || echo "$SALIDA"
igual "version-actual dice release-0.1.0" "release-0.1.0" "$(leer_estado version-actual)"
igual "no hay version-anterior en el primer despliegue" "(no hay)" "$(leer_estado version-anterior)"
igual "corre la versión nueva" "release-0.1.0" "$(leer_corriendo)"

previa=0
en_orden=1
for paso in "pull backend frontend" "up -d --wait mysql" "run --rm backend npm run migrar" \
  "up -d --wait backend frontend"; do
  n="$(linea_de "$paso")"
  if [ -z "$n" ]; then
    falla "falta la orden: $paso"
    en_orden=0
  elif [ "$n" -le "$previa" ]; then
    en_orden=0
  else
    previa="$n"
  fi
done
igual "las órdenes van en el orden pull, mysql, migrar, backend y pantalla" "1" "$en_orden"

pedidas="$(linea_de "127.0.0.1:8140/api/salud")"
[ -n "$pedidas" ] && ok "pide /api/salud en 127.0.0.1:8140" || falla "no pide http://127.0.0.1:8140/api/salud"
[ -n "$(linea_de "127.0.0.1:8141")" ] && ok "pide la pantalla en 127.0.0.1:8141" || falla "no pide http://127.0.0.1:8141/"

compose="$AIPOS_RAIZ/versiones/release-0.1.0/docker-compose.produccion.yml"
mal=0
while IFS= read -r linea; do
  case "$linea" in
    *" compose "*)
      [[ "$linea" == *"--env-file $AIPOS_RAIZ/.env"* ]] || { falla "falta --env-file en: $linea"; mal=1; }
      [[ "$linea" == *"--project-directory $AIPOS_RAIZ"* ]] || { falla "falta --project-directory en: $linea"; mal=1; }
      [[ "$linea" == *"-f $compose"* ]] || { falla "no usa el compose guardado de la versión en: $linea"; mal=1; }
      [[ "$linea" == *"AIPOS_VERSION=release-0.1.0 "* ]] || { falla "falta AIPOS_VERSION=release-0.1.0 en: $linea"; mal=1; }
      ;;
  esac
done <"$REGISTRO"
[ "$(cuantas " compose ")" -ge 4 ] || falla "Compose recibió menos de 4 órdenes"
[ "$mal" -eq 0 ] && ok "cada orden de Compose lleva --env-file, --project-directory, -f y AIPOS_VERSION"
sin_borrar "primer despliegue"
tiene "toma el candado" "$(cat "$REGISTRO")" "flock -n"

# --- Segundo despliegue: la anterior queda guardada ------------------------------------------------------------
crear_version release-0.2.0
correr desplegar release-0.2.0
igual "el segundo despliegue termina bien" "0" "$CODIGO"
igual "version-actual pasa a release-0.2.0" "release-0.2.0" "$(leer_estado version-actual)"
igual "version-anterior guarda release-0.1.0" "release-0.1.0" "$(leer_estado version-anterior)"
igual "corre la versión nueva" "release-0.2.0" "$(leer_corriendo)"
sin_borrar "segundo despliegue"

# --- Precondiciones: no toca Docker si no se cumplen -----------------------------------------------------------
antes="$(llamadas_docker)"
for mala in release-hoy release-1.0 v1.0.0 entregable-base ""; do
  correr desplegar "$mala"
  [ "$CODIGO" -ne 0 ] && ok "rechaza la etiqueta '$mala'" || falla "aceptó la etiqueta '$mala'"
done
correr desplegar release-9.9.9
[ "$CODIGO" -ne 0 ] && ok "rechaza una versión sin carpeta versiones/<etiqueta>/" || falla "aceptó una versión sin compose"
correr
[ "$CODIGO" -ne 0 ] && ok "sin subcomando termina con error" || falla "sin subcomando terminó bien"

crear_version release-0.3.0
chmod 644 "$AIPOS_RAIZ/.env"
correr desplegar release-0.3.0
[ "$CODIGO" -ne 0 ] && ok "rechaza un .env que otros usuarios pueden leer" || falla "aceptó un .env con permisos 644"
chmod 600 "$AIPOS_RAIZ/.env"
mv "$AIPOS_RAIZ/.env" "$AIPOS_RAIZ/.env.guardado"
correr desplegar release-0.3.0
[ "$CODIGO" -ne 0 ] && ok "rechaza si no existe el .env" || falla "aceptó que no hubiera .env"
mv "$AIPOS_RAIZ/.env.guardado" "$AIPOS_RAIZ/.env"
igual "ninguna precondición rota llegó a Docker" "$antes" "$(llamadas_docker)"
igual "la versión que corre no cambió" "release-0.2.0" "$(leer_corriendo)"

terminar
