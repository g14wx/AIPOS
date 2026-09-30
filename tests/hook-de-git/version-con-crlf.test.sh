#!/usr/bin/env bash
# Spec: specs/grafo-del-proyecto.spec.md, sección "Hook de git pre-commit".
# En Windows, `graphify --version` responde con CRLF. El hook de git compara la versión sin el \r, así que acepta la
# 0.9.72 y actualiza el grafo.
source "$(dirname "$0")/comun.sh"
preparar_repo
crear_graphify_falso crlf

git add README.md
salida="$(git commit -q -m "prueba: versión con CRLF" 2>&1)"

if grep -q "no es la versión del proyecto" <<<"$salida"; then
  falla "el hook de git rechazó la 0.9.72 por el CRLF de Windows"
fi
archivos="$(git show --name-only --format= HEAD)"
grep -qx "graphify-out/graph.json" <<<"$archivos" || falla "el commit no trae el grafo"
echo "ok: el hook de git acepta la 0.9.72 aunque graphify --version termine con CRLF"
