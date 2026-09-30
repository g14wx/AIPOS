#!/usr/bin/env bash
# Spec: specs/grafo-del-proyecto.spec.md, sección "Hook de git pre-commit".
# Sin Graphify, el hook avisa por la salida de error, deja pasar el commit y no toca el grafo.
source "$(dirname "$0")/comun.sh"
preparar_repo

git add README.md
salida="$(git commit -q -m "prueba: sin Graphify" 2>&1)" || falla "el commit no pasó sin Graphify"

grep -q "Graphify no está instalado" <<<"$salida" || falla "el hook no avisó que falta Graphify"
if [ -e graphify-out ]; then
  falla "el hook creó graphify-out/ sin Graphify"
fi
git rev-parse -q --verify HEAD >/dev/null || falla "no se creó el commit"
echo "ok: sin Graphify el hook avisa y el commit pasa"
