#!/usr/bin/env bash
# Spec: specs/grafo-del-proyecto.spec.md, sección "Hook de git pre-commit".
# En un merge sin choques, git corre pre-merge-commit y no mete en el merge commit lo que ese hook agregue. Si el
# grafo cambió, el hook de git detiene el merge, y `git commit --no-edit` lo termina con el grafo actualizado.
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

# Recién ahora el grafo empieza a cambiar: antes, main no lo tocó y el merge no choca.
crear_graphify_falso cambia-siempre
if salida="$(git merge -q --no-ff --no-edit rama 2>&1)"; then
  falla "el merge siguió aunque el grafo cambió"
fi
grep -qF "git commit --no-edit" <<<"$salida" || falla "el hook de git no dijo cómo terminar el merge"
git rev-parse -q --verify MERGE_HEAD >/dev/null || falla "el merge no quedó preparado para terminarlo"

git commit -q --no-edit
git rev-parse -q --verify HEAD^2 >/dev/null || falla "git commit --no-edit no creó un merge commit"
grafo="$(git show HEAD:graphify-out/graph.json)"
grep -q '"merge": "[0-9a-f]' <<<"$grafo" || falla "el merge commit no trae el grafo actualizado en el merge"
grep -q "a.txt" <<<"$grafo" || falla "el grafo del merge no trae el archivo de la rama"
echo "ok: si el grafo cambia, el merge se detiene y git commit --no-edit lo termina con el grafo actualizado"
