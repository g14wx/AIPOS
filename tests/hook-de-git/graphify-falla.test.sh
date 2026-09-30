#!/usr/bin/env bash
# Spec: specs/grafo-del-proyecto.spec.md, sección "Hook de git pre-commit".
# Si `graphify update .` falla, el hook de git avisa y deja pasar el commit con el grafo anterior.
source "$(dirname "$0")/comun.sh"
preparar_repo
crear_graphify_falso ok

git add README.md
git commit -q -m "prueba: primer commit con grafo"
grafo_antes="$(git show HEAD:graphify-out/graph.json)"

crear_graphify_falso falla
echo "Otra línea" >> README.md
git add README.md
salida="$(git commit -q -m "prueba: graphify falla" 2>&1)" || falla "el commit no pasó con graphify fallando"

grep -q "falló" <<<"$salida" || falla "el hook de git no avisó que graphify falló"
grep -q -- "--force" <<<"$salida" || falla "el hook de git no mostró el aviso de Graphify"
[ "$(git show HEAD:graphify-out/graph.json)" = "$grafo_antes" ] || falla "el grafo cambió aunque graphify falló"
[ "$(git log --oneline | wc -l | tr -d ' ')" = "2" ] || falla "no se creó el segundo commit"
echo "ok: con graphify fallando el hook de git avisa y el commit pasa con el grafo anterior"
