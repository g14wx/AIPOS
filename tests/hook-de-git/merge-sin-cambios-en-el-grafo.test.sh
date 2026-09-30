#!/usr/bin/env bash
# Spec: specs/grafo-del-proyecto.spec.md, sección "Hook de git pre-commit".
# En un merge sin choques que no cambia el grafo, el hook de git pre-merge-commit deja seguir el merge.
source "$(dirname "$0")/comun.sh"
preparar_repo
crear_graphify_falso ok

git add README.md
git commit -q -m "prueba: base"
git switch -q -c rama
echo "a" > a.txt
git add a.txt
git commit -q -m "prueba: rama agrega a.txt"
git switch -q main
echo "Otra línea" >> README.md
git add README.md
git commit -q -m "prueba: main cambia el README"

git merge -q --no-ff --no-edit rama 2>/dev/null || falla "el merge se detuvo aunque el grafo no cambió"
git rev-parse -q --verify HEAD^2 >/dev/null || falla "no se creó un merge commit"
if git rev-parse -q --verify MERGE_HEAD >/dev/null; then
  falla "el merge quedó a medias"
fi
echo "ok: si el grafo no cambia, el merge sigue normal"
