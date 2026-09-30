#!/usr/bin/env bash
# Spec: specs/grafo-del-proyecto.spec.md, sección "Hook de git pre-commit".
# Los scripts de shell van con saltos de línea LF en cualquier sistema, por .gitattributes. En Windows, git puede
# escribirlos con CRLF, y con CRLF `#!/bin/sh` no corre.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

fallas=0
for archivo in .githooks/pre-commit .githooks/pre-merge-commit tests/hook-de-git/comun.sh \
  tessl-plugins/grafo-del-proyecto/evals/scenario-1/setup.sh \
  tessl-plugins/grafo-del-proyecto/evals/scenario-1/proyecto/.githooks/pre-commit; do
  eol="$(git check-attr eol -- "$archivo" | awk '{print $NF}')"
  if [ "$eol" = "lf" ]; then
    echo "ok: git escribe $archivo con LF"
  else
    echo "FALLA: $archivo no tiene eol=lf en .gitattributes ($eol)"
    fallas=$((fallas + 1))
  fi
  if [ -f "$archivo" ] && grep -q $'\r' "$archivo"; then
    echo "FALLA: $archivo tiene CRLF"
    fallas=$((fallas + 1))
  fi
done

if [ "$fallas" -gt 0 ]; then
  echo "$fallas fallas"
  exit 1
fi
echo "todo bien"
