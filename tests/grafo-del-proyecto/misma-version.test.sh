#!/usr/bin/env bash
# Spec: specs/grafo-del-proyecto.spec.md, sección "Versión de Graphify".
# La versión de Graphify que usa el hook de git aparece igual en AGENTS.md, la regla del tile, la guía y el eval, y
# la copia del hook de git que usa el eval es igual al hook de git del repo.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

version="$(sed -n 's/^version_esperada="\(.*\)"$/\1/p' .githooks/pre-commit)"
[ -n "$version" ] || { echo "FALLA: .githooks/pre-commit no tiene version_esperada"; exit 1; }
echo "versión del hook de git: $version"

fallas=0
revisar() {
  if grep -qF -- "$2" "$1"; then
    echo "ok: $1 pide $2"
  else
    echo "FALLA: $1 no pide $2"
    fallas=$((fallas + 1))
  fi
}

revisar AGENTS.md "graphifyy[sql]==$version"
revisar AGENTS.md "graphify $version"
revisar tessl-plugins/grafo-del-proyecto/rules/grafo-del-proyecto.md "graphifyy[sql]==$version"
revisar docs/setup/graphify-setup.md "graphifyy[sql]==$version"
revisar tessl-plugins/grafo-del-proyecto/evals/scenario-1/setup.sh "graphify $version"

copia=tessl-plugins/grafo-del-proyecto/evals/scenario-1/proyecto/.githooks/pre-commit
if cmp -s .githooks/pre-commit "$copia"; then
  echo "ok: la copia del eval es igual al hook de git del repo"
else
  echo "FALLA: $copia no es igual a .githooks/pre-commit"
  fallas=$((fallas + 1))
fi

if [ "$fallas" -gt 0 ]; then
  echo "$fallas fallas"
  exit 1
fi
echo "todo bien"
