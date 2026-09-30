#!/usr/bin/env bash
# Spec: specs/grafo-del-proyecto.spec.md, sección "Arranque de un clon nuevo".
# AGENTS.md tiene los tres pasos de arranque, antes de la sección que maneja Tessl. AGENTS.md se lee siempre,
# en Claude Code y en Codex, aunque Tessl todavía no esté instalado.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

grep -q "<!-- tessl-managed -->" AGENTS.md || { echo "FALLA: AGENTS.md no tiene la sección de Tessl"; exit 1; }
arranque="$(sed '/<!-- tessl-managed -->/,$d' AGENTS.md)"

fallas=0
revisar() {
  if grep -qF -- "$1" <<<"$arranque"; then
    echo "ok: $2"
  else
    echo "FALLA: falta $2"
    fallas=$((fallas + 1))
  fi
}

revisar "tessl install" "correr tessl install"
revisar "find tessl.json tessl-plugins -newer .tessl/RULES.md" "reinstalar si cambiaron los tiles"
revisar "sesión nueva" "pedir una sesión nueva después de tessl install"
revisar "codex review" "seguir sin persona, por ejemplo en codex review"
revisar "git config core.hooksPath .githooks" "activar el hook de git"
revisar "graphify --version" "revisar la versión de Graphify"
revisar 'uv tool install "graphifyy[sql]==0.9.72"' "instalar Graphify en la versión fijada"
revisar "Nunca lo instales sin preguntar" "preguntar antes de instalar Graphify"

if [ "$fallas" -gt 0 ]; then
  echo "$fallas fallas"
  exit 1
fi
echo "todo bien"
