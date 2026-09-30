#!/usr/bin/env bash
# Spec: specs/grafo-del-proyecto.spec.md, sección "Hook de git pre-commit".
# Con otra versión de Graphify, el hook de git avisa, deja pasar el commit y no toca el grafo: con otra versión el
# grafo puede salir distinto, y dos personas se pisarían el grafo en cada commit.
source "$(dirname "$0")/comun.sh"
preparar_repo
crear_graphify_falso otra-version

git add README.md
salida="$(git commit -q -m "prueba: otra versión de Graphify" 2>&1)" || falla "el commit no pasó con otra versión de Graphify"

grep -q "no es la versión del proyecto" <<<"$salida" || falla "el hook de git no avisó que la versión es otra"
if [ -e graphify-out ]; then
  falla "el hook de git tocó el grafo con otra versión de Graphify"
fi
git rev-parse -q --verify HEAD >/dev/null || falla "no se creó el commit"
echo "ok: con otra versión de Graphify el hook de git avisa y no toca el grafo"
