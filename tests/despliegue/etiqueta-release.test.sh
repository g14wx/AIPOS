#!/usr/bin/env bash
# Spec: specs/despliegue.spec.md, sección "La etiqueta release-*" y criterio 8.
# despliegue/revisar-etiqueta.sh <etiqueta> acepta solo ^release-[0-9]+\.[0-9]+\.[0-9]+$. Una etiqueta con otra forma
# (release-hoy, release-1.0, entregable-base, v1.0.0) falla con su nombre en el mensaje, antes de mirar las ramas.
# shellcheck source=comun.sh disable=SC2015
source "$(dirname "${BASH_SOURCE[0]}")/comun.sh"
SCRIPT="$RAIZ/despliegue/revisar-etiqueta.sh"
if [ -f "$SCRIPT" ]; then ok "existe despliegue/revisar-etiqueta.sh"; else falla "falta despliegue/revisar-etiqueta.sh"; terminar; fi
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
crear_repo_de_mentira "$TMP"

contenido="$(cat "$SCRIPT")"
tiene "el script trae la expresión exacta de la spec" "$contenido" '^release-[0-9]+\.[0-9]+\.[0-9]+$'
comprobar "el script empieza con set -euo pipefail" grep -q '^set -euo pipefail' "$SCRIPT"

# Formas válidas: se crea la etiqueta en un commit de ProductionEnv, para que solo cuente la forma.
for etiqueta in release-0.1.0 release-0.0.1 release-1.0.0 release-0.2.0 release-10.20.30; do
  git -C "$REPO_MENTIRA" tag "$etiqueta" "$EN_PRODUCCION"
  revisar_etiqueta "$etiqueta"
  igual "acepta $etiqueta" "0" "$CODIGO"
  [ "$CODIGO" = 0 ] || echo "$SALIDA"
done

# Formas inválidas: se crean también las que git deja crear, para que falle por la forma y no porque no existan.
for etiqueta in release-hoy release-1.0 release-1.0.0.0 release-v1.0.0 Release-1.0.0 release-1.0.0-rc1 release-1..0 \
  release-.1.0 release- release entregable-base v1.0.0 xrelease-1.0.0 release-1.0.0x "release-1.0.0 " "release-1.0.0/x"; do
  git -C "$REPO_MENTIRA" tag "$etiqueta" "$EN_PRODUCCION" 2>/dev/null || true
  revisar_etiqueta "$etiqueta"
  if [ "$CODIGO" != 0 ]; then ok "rechaza '$etiqueta'"; else falla "rechaza '$etiqueta'"; fi
done

echo "# caso: release-hoy (criterio 8)"
git -C "$REPO_MENTIRA" tag -f release-hoy "$EN_PRODUCCION" >/dev/null
revisar_etiqueta release-hoy
[ "$CODIGO" != 0 ] && ok "release-hoy falla" || falla "release-hoy falla"
tiene "el mensaje nombra la etiqueta" "$SALIDA" "release-hoy"
tiene "el mensaje dice la forma esperada" "$SALIDA" "release-X.Y.Z"

echo "# caso: sin argumentos o con dos"
revisar_etiqueta
[ "$CODIGO" != 0 ] && ok "sin etiqueta falla" || falla "sin etiqueta falla"
revisar_etiqueta release-0.1.0 release-0.2.0
[ "$CODIGO" != 0 ] && ok "con dos etiquetas falla" || falla "con dos etiquetas falla"

echo "# caso: la forma se revisa aunque no haya repositorio"
set +e
SALIDA="$(cd "$TMP" && bash "$SCRIPT" release-hoy 2>&1)"
CODIGO=$?
set -e
[ "$CODIGO" != 0 ] && ok "falla fuera de un repositorio" || falla "falla fuera de un repositorio"
tiene "y dice el nombre de la etiqueta" "$SALIDA" "release-hoy"

if command -v shellcheck >/dev/null 2>&1; then
  comprobar "shellcheck sin advertencias" shellcheck "$SCRIPT"
else
  echo "aviso: shellcheck no está instalado, se omite esa revisión"
fi

terminar
