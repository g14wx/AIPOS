#!/usr/bin/env bash
# Spec: specs/despliegue.spec.md, sección "Pruebas en local" (documentos.test.sh) y "Qué tarjeta implementa cada parte".
# Revisa que existan los documentos que D-01 agrega o cambia: el flujo 07 con su diagrama, la fila del flujo 07 en el
# mapa de procesos, docs/despliegue.md, la sección del README, "Lo que agregamos" en 01-alcance.md, la fila de D-01 en
# 04-entregables.md y las cuatro palabras nuevas en el glosario.
# shellcheck source=comun.sh
source "$(dirname "${BASH_SOURCE[0]}")/comun.sh"

# leer <ruta desde la raíz> <variable>: pone el contenido del archivo en la variable; si no está, falla la prueba.
leer() {
  local contenido=""
  if [ -f "$RAIZ/$1" ]; then ok "existe $1"; contenido="$(cat "$RAIZ/$1")"; else falla "falta $1"; fi
  printf -v "$2" '%s' "$contenido"
}

echo "# flujo 07 y su diagrama"
leer requerimientos/flujos/07-desplegar-una-version.md FLUJO
tiene "el flujo 07 empieza con su título" "$(head -1 <<<"$FLUJO")" "# Flujo 07 · Desplegar una versión"
tiene "el flujo 07 muestra el diagrama" "$FLUJO" "![Diagrama BPMN del flujo 07](../diagramas/07-desplegar-una-version.png)"
tiene "el flujo 07 enlaza la fuente editable" "$FLUJO" "[\`07-desplegar-una-version.drawio\`](../diagramas/07-desplegar-una-version.drawio)"
for parte in "**Carriles:**" "**Empieza:**" "**Termina bien:**" "**Requerimientos:**" "**Tarjetas:**" "## Pasos" "## Otros caminos"; do
  tiene "el flujo 07 tiene $parte" "$FLUJO" "$parte"
done
tiene "el flujo 07 nombra la etiqueta release-*" "$FLUJO" "release-"
tiene "el flujo 07 enlaza la spec de despliegue" "$FLUJO" "specs/despliegue.spec.md"
tiene "el flujo 07 nombra a D-01" "$FLUJO" "D-01"
PNG="$RAIZ/requerimientos/diagramas/07-desplegar-una-version.png"
DRAWIO="$RAIZ/requerimientos/diagramas/07-desplegar-una-version.drawio"
if [ -f "$PNG" ] && [ "$(head -c 4 "$PNG" | tail -c 3)" = "PNG" ]; then ok "existe el diagrama 07 en PNG"; else falla "falta requerimientos/diagramas/07-desplegar-una-version.png (o no es un PNG)"; fi
if [ -f "$DRAWIO" ] && command -v python3 >/dev/null && python3 -c 'import sys, xml.dom.minidom as m; m.parse(sys.argv[1])' "$DRAWIO" 2>/dev/null; then
  ok "existe el diagrama 07 en drawio y es XML válido"
else falla "falta requerimientos/diagramas/07-desplegar-una-version.drawio (o no es XML válido)"; fi
if [ -f "$DRAWIO" ]; then
  tiene "el diagrama nombra el servidor por su dominio" "$(cat "$DRAWIO")" "aipos.salsalvador.io"
  tiene "el diagrama muestra el dominio del backend" "$(cat "$DRAWIO")" "aipos-back.salsalvador.io"
fi

echo "# mapa de procesos"
leer requerimientos/flujos/00-mapa-de-procesos.md MAPA
tiene "el mapa lista el flujo 07 con su enlace" "$MAPA" "[07 Desplegar una versión](07-desplegar-una-version.md)"

echo "# docs/despliegue.md"
leer docs/despliegue.md GUIA
for parte in release-0.1.0 "desplegar.sh volver" SSH_CLAVE_PRIVADA SSH_HOSTS_CONOCIDOS SERVIDOR_USUARIO crear-env.sh instalar-caddy.sh \
  "Proteger etiquetas release" aipos-back.salsalvador.io "caddy validate" "systemctl reload caddy" "restrict" ssh-keygen "gh secret set"; do
  tiene "la guía nombra $parte" "$GUIA" "$parte"
done
for n in 1 2 3 4 5 6 7; do
  if grep -qE "^${n}\. \*\*" <<<"$GUIA"; then ok "la guía tiene el paso $n de la configuración del servidor"; else falla "la guía no tiene el paso $n de la configuración del servidor"; fi
done
tiene "la guía enseña a comprobar que MySQL no se ve desde internet" "$GUIA" "nc -zv aipos.salsalvador.io 3306"
tiene "la guía dice cómo volver atrás a mano (Re-run all jobs)" "$GUIA" "Re-run all jobs"

echo "# README"
leer README.md LEEME
tiene "el README tiene la sección Despliegue" "$LEEME" "## Despliegue"
tiene "el README dice cómo desplegar (etiqueta release-*)" "$LEEME" "release-"
tiene "el README dice cómo volver atrás" "$LEEME" "volver"
tiene "el README enlaza docs/despliegue.md" "$LEEME" "docs/despliegue.md"

echo "# alcance y entregables"
leer requerimientos/01-alcance.md ALCANCE
SECCION="$(sed -n '/^## Lo que agregamos y el PDF no pide/,/^## Supuestos/p' <<<"$ALCANCE")"
tiene "\"Lo que agregamos\" trae el despliegue con etiquetas release-*" "$SECCION" "release-"
tiene "\"Lo que agregamos\" trae el flujo 07" "$SECCION" "07"
leer requerimientos/04-entregables.md ENTREGABLES
FILA="$(grep -E '^\| D-01 \|' <<<"$ENTREGABLES" || true)"
tiene "04-entregables.md tiene la fila de D-01" "$FILA" "Pipeline de despliegue"
tiene "la fila de D-01 es de DevOps" "$FILA" "DevOps"
tiene "la fila de D-01 nombra su rama" "$FILA" "chore/despliegue"
tiene "la fila de D-01 nombra el diagrama 07" "$FILA" "07"

echo "# glosario"
leer docs/lenguaje-ubicuo.md GLOSARIO
for palabra in "Desplegar" "Producción" "Pipeline" 'Etiqueta `release-*`'; do
  tiene "el glosario define $palabra" "$GLOSARIO" "| $palabra |"
done

terminar
