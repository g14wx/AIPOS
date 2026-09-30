#!/usr/bin/env bash
# Spec: specs/grafo-del-proyecto.spec.md, sección "Qué va a git".
# Pregunta a git qué ignora y qué no, archivo por archivo. --no-index revisa las reglas del .gitignore
# aunque el archivo ya esté en git.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

fallas=0

debe_ignorar() {
  if git check-ignore -q --no-index -- "$1"; then
    echo "ok: git ignora $1"
  else
    echo "FALLA: git debería ignorar $1"
    fallas=$((fallas + 1))
  fi
}

no_debe_ignorar() {
  if git check-ignore -q --no-index -- "$1"; then
    echo "FALLA: git no debería ignorar $1"
    fallas=$((fallas + 1))
  else
    echo "ok: git no ignora $1"
  fi
}

# Lo local de graphify-out/: guarda rutas de la máquina o se regenera
debe_ignorar graphify-out/.graphify_root
debe_ignorar graphify-out/manifest.json
debe_ignorar graphify-out/graph.html
debe_ignorar graphify-out/cache/ast.json

# Lo que va a git
no_debe_ignorar graphify-out/graph.json
no_debe_ignorar graphify-out/GRAPH_REPORT.md
no_debe_ignorar .githooks/pre-commit
no_debe_ignorar .claude/settings.json
no_debe_ignorar .graphifyignore

if [ "$fallas" -gt 0 ]; then
  echo "$fallas fallas"
  exit 1
fi
echo "todo bien"
