#!/usr/bin/env bash
# Spec: specs/grafo-del-proyecto.spec.md, sección "Hook de git pre-commit".
# Graphify anota como "commit de origen" el commit anterior, porque el nuevo todavía no existe. El hook de git vacía
# esa marca en graph.json y cambia la línea del reporte, para que el grafo no parezca desactualizado en su propio
# commit.
source "$(dirname "$0")/comun.sh"
preparar_repo
crear_graphify_falso ok

git add README.md
git commit -q -m "prueba: marca de commit"

grafo="$(git show HEAD:graphify-out/graph.json)"
reporte="$(git show HEAD:graphify-out/GRAPH_REPORT.md)"

grep -qF '"built_at_commit": ""' <<<"$grafo" || falla "graph.json no trae la marca de commit vacía"
if grep -qF "abc1234" <<<"$grafo$reporte"; then
  falla "el grafo del commit todavía nombra el commit anterior"
fi
if grep -qF "Built from commit" <<<"$reporte"; then
  falla "GRAPH_REPORT.md todavía trae la línea Built from commit"
fi
grep -qF 'el hook de git `pre-commit` actualiza este grafo en cada commit' <<<"$reporte" \
  || falla "GRAPH_REPORT.md no dice que el hook de git lo mantiene al día"
python3 -c 'import json,sys; json.loads(sys.stdin.read())' <<<"$grafo" || falla "graph.json dejó de ser JSON válido"
echo "ok: el grafo del commit no nombra el commit anterior y el reporte dice que va al día"
