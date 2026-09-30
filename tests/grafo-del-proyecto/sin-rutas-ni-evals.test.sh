#!/usr/bin/env bash
# Spec: specs/grafo-del-proyecto.spec.md, sección "Qué entra al grafo".
# Los dos archivos del grafo que van a git no traen rutas de la máquina, y ningún nodo sale de los proyectos de
# ejemplo de los evals. El repositorio es público.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

fallas=0
for archivo in graphify-out/graph.json graphify-out/GRAPH_REPORT.md; do
  if [ ! -f "$archivo" ]; then
    echo "FALLA: falta $archivo"
    fallas=$((fallas + 1))
  elif grep -qE '/Users/|/home/' "$archivo"; then
    echo "FALLA: $archivo trae rutas de la máquina"
    fallas=$((fallas + 1))
  else
    echo "ok: $archivo no trae rutas de la máquina"
  fi
done

if [ -f graphify-out/graph.json ]; then
  de_evals="$(python3 -c '
import json
nodos = json.load(open("graphify-out/graph.json")).get("nodes", [])
print(sum(1 for n in nodos if "/evals/" in (n.get("source_file") or "")))
')"
  if [ "$de_evals" != "0" ]; then
    echo "FALLA: $de_evals nodos salen de los evals"
    fallas=$((fallas + 1))
  else
    echo "ok: ningún nodo sale de los evals"
  fi
fi

if [ "$fallas" -gt 0 ]; then
  echo "$fallas fallas"
  exit 1
fi
echo "todo bien"
