# Ayudas de las pruebas del hook de git pre-commit (spec: specs/grafo-del-proyecto.spec.md).
# Cada prueba arma un repo temporal con el hook de git y, si hace falta, un graphify falso.
# Así no toca este repo ni necesita Graphify instalado.
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
GIT_REAL="$(command -v git)"

# Repo temporal con el hook de git activo. El PATH solo trae git y las herramientas del sistema, y el HOME es
# aparte, así que el graphify de esta máquina no se ve, ni en el PATH ni en ~/.local/bin.
preparar_repo() {
  TMP="$(mktemp -d)"
  trap 'rm -rf "$TMP"' EXIT
  BIN="$TMP/bin"
  mkdir -p "$BIN"
  ln -s "$GIT_REAL" "$BIN/git"
  HOME="$TMP/home"
  mkdir -p "$HOME"
  export HOME
  REPO="$TMP/repo"
  mkdir -p "$REPO/.githooks"
  cp "$RAIZ/.githooks/"* "$REPO/.githooks/"
  chmod +x "$REPO/.githooks/"*
  cd "$REPO"
  git init -q -b main
  git config user.email "prueba@example.com"
  git config user.name "Prueba"
  git config commit.gpgsign false
  git config core.hooksPath .githooks
  echo "# Prueba" > README.md
  PATH="$BIN:/usr/bin:/bin"
  export PATH
}

# graphify falso en BIN, o en el directorio que se pase como segundo argumento. El grafo que escribe depende solo de
# la lista de archivos, así un merge sin choques no choca en graph.json. Anota "merge" si corre durante un merge, y
# cada `graphify update` suma una línea en $GRAPHIFY_FALSO_LOG, si está definido. Modos:
#   ok: `graphify update` escribe los dos archivos del grafo, con la marca de commit que deja el Graphify real, y un
#       archivo local
#   falla: `graphify update` termina con error
#   otra-version: `graphify --version` responde otra versión
#   crlf: como ok, pero `graphify --version` termina con CRLF, como en Windows
#   cambia-siempre: como ok, pero el grafo cambia en cada `graphify update`
crear_graphify_falso() {
  local modo="$1"
  local dir="${2:-$BIN}"
  mkdir -p "$dir"
  cat > "$dir/graphify" <<EOF
#!/bin/sh
case "\$1" in
  --version)
    case "$modo" in
      otra-version) echo "graphify 0.9.11" ;;
      crlf) printf 'graphify 0.9.72\r\n' ;;
      *) echo "graphify 0.9.72" ;;
    esac
    exit 0 ;;
  update) ;;
  *) exit 0 ;;
esac
if [ "$modo" = "falla" ]; then
  echo "[graphify] WARNING: Refusing to overwrite. Pass --force to override." >&2
  exit 1
fi
[ -n "\${GRAPHIFY_FALSO_LOG:-}" ] && echo "update" >> "\$GRAPHIFY_FALSO_LOG"
archivos=\$(find . -type f ! -path './.git/*' ! -path './graphify-out/*' | LC_ALL=C sort | tr '\n' ' ')
merge=\$(git rev-parse -q --verify MERGE_HEAD 2>/dev/null)
llamada=0
if [ "$modo" = "cambia-siempre" ]; then
  llamada=\$(( \$(cat "$TMP/contador" 2>/dev/null || echo 0) + 1 ))
  echo "\$llamada" > "$TMP/contador"
fi
mkdir -p graphify-out
printf '{\n  "nodes": ["%s"],\n  "merge": "%s",\n  "llamada": "%s",\n  "built_at_commit": "abc1234"\n}\n' "\$archivos" "\$merge" "\$llamada" > graphify-out/graph.json
printf '# Graph Report\n\n## Graph Freshness\n- Built from commit: \`abc1234\`\n- Run \`git rev-parse HEAD\` and compare to check if the graph is stale.\n- Run \`graphify update .\` after code changes (no API cost).\n' > graphify-out/GRAPH_REPORT.md
echo "/ruta/de/esta/maquina" > graphify-out/.graphify_root
EOF
  chmod +x "$dir/graphify"
}

falla() {
  echo "FALLA: $*"
  exit 1
}
