#!/usr/bin/env bash
# Spec: specs/grafo-del-proyecto.spec.md, sección "Hook de Claude Code".
# Con graphify solo en ~/.local/bin, el hook de Claude Code lo usa. Claude Code abierto desde una app a veces no ve
# ~/.local/bin, donde lo pone `uv tool install`.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
home_falso="$(mktemp -d)"
trap 'rm -rf "$home_falso"' EXIT
mkdir -p "$home_falso/.local/bin"
cat > "$home_falso/.local/bin/graphify" <<'SH'
#!/bin/sh
echo "graphify falso: $*"
SH
chmod +x "$home_falso/.local/bin/graphify"

comandos="$(python3 -c '
import json
for grupo in json.load(open(".claude/settings.json"))["hooks"]["PreToolUse"]:
    for hook in grupo["hooks"]:
        print(hook["command"])
')"

while IFS= read -r comando; do
  salida="$(env HOME="$home_falso" PATH=/usr/bin:/bin sh -c "$comando" <<<'{"tool_name":"Grep","tool_input":{}}' 2>&1)" \
    || { echo "FALLA: el hook de Claude Code terminó con error"; exit 1; }
  grep -q "graphify falso: hook-guard" <<<"$salida" \
    || { echo "FALLA: el hook de Claude Code no usó el graphify de ~/.local/bin"; exit 1; }
  echo "ok: el hook de Claude Code usa graphify de ~/.local/bin ($(sed 's/graphify falso: //' <<<"$salida"))"
done <<<"$comandos"
