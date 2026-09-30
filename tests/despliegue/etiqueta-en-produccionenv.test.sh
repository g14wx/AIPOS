#!/usr/bin/env bash
# Spec: specs/despliegue.spec.md, sección "El workflow" (job `revisar`) y criterio 2.
# despliegue/revisar-etiqueta.sh <etiqueta> revisa que el commit de la etiqueta esté en origin/ProductionEnv
# (`git merge-base --is-ancestor`). Aquí se corre sobre un repositorio de git temporal con una rama ProductionEnv y
# otra rama, con una etiqueta en un commit de cada una.
# shellcheck source=comun.sh disable=SC2015
source "$(dirname "${BASH_SOURCE[0]}")/comun.sh"
SCRIPT="$RAIZ/despliegue/revisar-etiqueta.sh"
if [ -f "$SCRIPT" ]; then ok "existe despliegue/revisar-etiqueta.sh"; else falla "falta despliegue/revisar-etiqueta.sh"; terminar; fi
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
crear_repo_de_mentira "$TMP"
G() { git -C "$REPO_MENTIRA" -c user.name=Prueba -c user.email=prueba@example.com -c commit.gpgsign=false "$@"; }

contenido="$(cat "$SCRIPT")"
tiene "el script usa git merge-base --is-ancestor" "$contenido" "merge-base --is-ancestor"
tiene "el script compara con origin/ProductionEnv" "$contenido" "origin/ProductionEnv"

echo "# caso: etiqueta en un commit de ProductionEnv"
G tag release-0.0.1 "$EN_PRODUCCION"
revisar_etiqueta release-0.0.1
igual "termina bien" "0" "$CODIGO"
[ "$CODIGO" = 0 ] || echo "$SALIDA"

echo "# caso: etiqueta en un commit que no está en ProductionEnv"
G tag release-0.0.2 "$FUERA_DE_PRODUCCION"
revisar_etiqueta release-0.0.2
[ "$CODIGO" != 0 ] && ok "termina con error" || falla "termina con error"
tiene "el mensaje dice que el commit no está en ProductionEnv" "$SALIDA" "el commit no está en ProductionEnv"
tiene "el mensaje nombra la etiqueta" "$SALIDA" "release-0.0.2"

echo "# caso: etiqueta anotada (git tag -a) en un commit de ProductionEnv"
G tag -a release-0.0.3 -m "etiqueta anotada" "$EN_PRODUCCION"
revisar_etiqueta release-0.0.3
igual "una etiqueta anotada también pasa (se mira el commit, no el objeto etiqueta)" "0" "$CODIGO"
G tag -a release-0.0.4 -m "etiqueta anotada" "$FUERA_DE_PRODUCCION"
revisar_etiqueta release-0.0.4
[ "$CODIGO" != 0 ] && ok "una etiqueta anotada fuera de ProductionEnv falla" || falla "una etiqueta anotada fuera de ProductionEnv falla"

echo "# caso: un commit nuevo de ProductionEnv sigue valiendo, y el que se integró después también"
(
  cd "$REPO_MENTIRA"
  G switch -q ProductionEnv
  echo tres >otro.txt
  G add otro.txt
  G commit -q -m "otro commit en ProductionEnv"
  G push -q origin ProductionEnv
)
nuevo="$(git -C "$REPO_MENTIRA" rev-parse ProductionEnv)"
G tag release-0.0.5 "$nuevo"
revisar_etiqueta release-0.0.5
igual "la etiqueta en la punta de ProductionEnv pasa" "0" "$CODIGO"
revisar_etiqueta release-0.0.1
igual "la etiqueta vieja, que sigue siendo antecesora, también pasa" "0" "$CODIGO"

echo "# caso: una etiqueta que no existe"
revisar_etiqueta release-9.9.9
[ "$CODIGO" != 0 ] && ok "una etiqueta que no existe falla" || falla "una etiqueta que no existe falla"
tiene "el mensaje nombra la etiqueta" "$SALIDA" "release-9.9.9"

echo "# caso: la rama se integró con un merge commit desde otra rama"
(
  cd "$REPO_MENTIRA"
  G switch -q ProductionEnv
  G merge -q --no-ff feature/otra -m "Merge: feature/otra"
  G push -q origin ProductionEnv
)
revisar_etiqueta release-0.0.2
igual "después del merge, la etiqueta del commit de la otra rama pasa" "0" "$CODIGO"

echo "# caso: el script no cambia el repositorio"
antes="$(git -C "$REPO_MENTIRA" for-each-ref --format='%(refname) %(objectname)' | sort | shasum)"
revisar_etiqueta release-0.0.2 >/dev/null
despues="$(git -C "$REPO_MENTIRA" for-each-ref --format='%(refname) %(objectname)' | sort | shasum)"
igual "las ramas y etiquetas quedan iguales" "$antes" "$despues"

terminar
