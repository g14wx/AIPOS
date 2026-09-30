#!/usr/bin/env bash
# Spec: specs/grafo-del-proyecto.spec.md, sección "Hook de git pre-commit".
# Si el hook de git no puede actualizar el grafo, no toca graph.json, pero el reporte dice "Puede estar
# desactualizado". Cuando vuelve a actualizarlo, el reporte vuelve a decir que va al día.
source "$(dirname "$0")/comun.sh"
preparar_repo
al_dia='el hook de git `pre-commit` actualiza este grafo en cada commit'

crear_graphify_falso ok
git add README.md
git commit -q -m "prueba: primer commit con grafo"
grep -qF "$al_dia" <<<"$(git show HEAD:graphify-out/GRAPH_REPORT.md)" || falla "el primer reporte no dice que va al día"
grafo_antes="$(git show HEAD:graphify-out/graph.json)"

rm "$BIN/graphify"
echo "Otra línea" >> README.md
git add README.md
git commit -q -m "prueba: sin Graphify" 2>/dev/null
reporte="$(git show HEAD:graphify-out/GRAPH_REPORT.md)"
grep -qF "Puede estar desactualizado" <<<"$reporte" || falla "sin Graphify, el reporte no avisa que puede estar desactualizado"
if grep -qF "$al_dia" <<<"$reporte"; then
  falla "sin Graphify, el reporte todavía dice que va al día"
fi
[ "$(git show HEAD:graphify-out/graph.json)" = "$grafo_antes" ] || falla "sin Graphify, graph.json cambió"

crear_graphify_falso ok
echo "Una línea más" >> README.md
git add README.md
git commit -q -m "prueba: Graphify de vuelta"
reporte="$(git show HEAD:graphify-out/GRAPH_REPORT.md)"
grep -qF "$al_dia" <<<"$reporte" || falla "con Graphify de vuelta, el reporte no dice que va al día"
if grep -qF "Puede estar desactualizado" <<<"$reporte"; then
  falla "con Graphify de vuelta, el reporte todavía avisa que puede estar desactualizado"
fi
echo "ok: el reporte avisa cuando el grafo quedó viejo y vuelve a decir que va al día cuando se actualiza"
