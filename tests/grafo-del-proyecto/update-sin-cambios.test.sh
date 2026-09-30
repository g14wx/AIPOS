#!/usr/bin/env bash
# Spec: specs/grafo-del-proyecto.spec.md, sección "Qué entra al grafo".
# Si nada cambió, `graphify update .` no toca graph.json ni GRAPH_REPORT.md; si los tocara, cada commit ensuciaría
# el grafo. La primera corrida deja el grafo al día con lo que hay ahora; la segunda no tiene que cambiar nada.
# Si Graphify no está instalado, avisa y se salta.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

if ! command -v graphify >/dev/null 2>&1; then
  echo "se salta: Graphify no está instalado"
  exit 0
fi

graphify update . >/dev/null 2>&1
antes="$(cksum graphify-out/graph.json graphify-out/GRAPH_REPORT.md)"
graphify update . >/dev/null 2>&1
despues="$(cksum graphify-out/graph.json graphify-out/GRAPH_REPORT.md)"

if [ "$antes" != "$despues" ]; then
  echo "FALLA: la segunda corrida de graphify update . cambió el grafo"
  exit 1
fi
echo "ok: sin cambios, graphify update . no toca el grafo"
