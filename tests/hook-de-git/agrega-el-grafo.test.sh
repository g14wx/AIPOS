#!/usr/bin/env bash
# Spec: specs/grafo-del-proyecto.spec.md, sección "Hook de git pre-commit".
# Con Graphify instalado, el hook de git agrega graph.json y GRAPH_REPORT.md al commit, aunque solo se haya
# agregado otro archivo, y no agrega nada más de graphify-out/.
source "$(dirname "$0")/comun.sh"
preparar_repo
crear_graphify_falso ok

git add README.md
git commit -q -m "prueba: solo el README"

archivos="$(git show --name-only --format= HEAD)"
grep -qx "graphify-out/graph.json" <<<"$archivos" || falla "el commit no trae graphify-out/graph.json"
grep -qx "graphify-out/GRAPH_REPORT.md" <<<"$archivos" || falla "el commit no trae graphify-out/GRAPH_REPORT.md"
if grep -q "graphify-out/.graphify_root" <<<"$archivos"; then
  falla "el commit trae graphify-out/.graphify_root, que es local"
fi
echo "ok: el commit trae los dos archivos del grafo y nada más de graphify-out/"
