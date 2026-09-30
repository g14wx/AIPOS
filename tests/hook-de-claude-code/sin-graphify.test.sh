#!/usr/bin/env bash
# Spec: specs/grafo-del-proyecto.spec.md, sección "Hook de Claude Code".
# Corre los comandos del hook de Claude Code sin Graphify, ni en el PATH ni en ~/.local/bin: tienen que terminar
# con código 0 y sin salida, para no mostrar errores a quien clona el repo sin tener Graphify.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
home_vacio="$(mktemp -d)"
trap 'rm -rf "$home_vacio"' EXIT

comandos="$(python3 -c '
import json
for grupo in json.load(open(".claude/settings.json"))["hooks"]["PreToolUse"]:
    for hook in grupo["hooks"]:
        print(hook["command"])
')"

grep -q "hook-guard search" <<<"$comandos" || { echo "FALLA: falta el hook de Claude Code para Bash y Grep"; exit 1; }
grep -q "hook-guard read" <<<"$comandos" || { echo "FALLA: falta el hook de Claude Code para Read y Glob"; exit 1; }

while IFS= read -r comando; do
  if salida="$(env HOME="$home_vacio" PATH=/usr/bin:/bin sh -c "$comando" <<<'{"tool_name":"Grep","tool_input":{}}' 2>&1)"; then
    [ -z "$salida" ] || { echo "FALLA: sin Graphify, el hook de Claude Code mostró: $salida"; exit 1; }
    echo "ok: sin Graphify, el hook de Claude Code termina con 0 y sin salida"
  else
    echo "FALLA: sin Graphify, el hook de Claude Code terminó con error"
    exit 1
  fi
done <<<"$comandos"
