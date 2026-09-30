#!/usr/bin/env bash
# Spec: specs/grafo-del-proyecto.spec.md, sección "Hook de git pre-commit".
# Si graphify no está en el PATH pero sí en ~/.local/bin, donde lo pone `uv tool install`, el hook de git lo usa.
# Pasa en los commits desde WebStorm u otras apps de git, que a veces no ven ~/.local/bin.
source "$(dirname "$0")/comun.sh"
preparar_repo
crear_graphify_falso ok "$HOME/.local/bin"
if command -v graphify >/dev/null 2>&1; then
  falla "graphify no debería estar en el PATH de la prueba"
fi

git add README.md
git commit -q -m "prueba: graphify fuera del PATH"

archivos="$(git show --name-only --format= HEAD)"
grep -qx "graphify-out/graph.json" <<<"$archivos" || falla "el hook de git no encontró graphify en ~/.local/bin"
echo "ok: el hook de git encuentra graphify en ~/.local/bin aunque no esté en el PATH"
