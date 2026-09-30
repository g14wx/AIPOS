# Ayudas de las pruebas del hook de git pre-commit (spec: specs/grafo-del-proyecto.spec.md).
# Cada prueba arma un repo temporal con el hook y, si hace falta, un graphify falso.
# Así no toca este repo ni necesita Graphify instalado.
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
GIT_REAL="$(command -v git)"

# Repo temporal con el hook activo. El PATH solo trae git y las herramientas del sistema,
# así que el graphify de esta máquina no se ve.
preparar_repo() {
  TMP="$(mktemp -d)"
  trap 'rm -rf "$TMP"' EXIT
  BIN="$TMP/bin"
  mkdir -p "$BIN"
  ln -s "$GIT_REAL" "$BIN/git"
  REPO="$TMP/repo"
  mkdir -p "$REPO/.githooks"
  cp "$RAIZ/.githooks/pre-commit" "$REPO/.githooks/pre-commit"
  chmod +x "$REPO/.githooks/pre-commit"
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

# graphify falso. Con "ok", `graphify update` escribe los dos archivos del grafo y uno local.
# Con "falla", termina con error.
crear_graphify_falso() {
  local modo="$1"
  cat > "$BIN/graphify" <<EOF
#!/bin/sh
[ "\$1" = "update" ] || exit 0
if [ "$modo" = "falla" ]; then
  echo "[graphify] WARNING: Refusing to overwrite. Pass --force to override." >&2
  exit 1
fi
mkdir -p graphify-out
echo "{\"nodes\": [\"\$(date +%s)\"]}" > graphify-out/graph.json
echo "# Graph Report" > graphify-out/GRAPH_REPORT.md
echo "/ruta/de/esta/maquina" > graphify-out/.graphify_root
EOF
  chmod +x "$BIN/graphify"
}

falla() {
  echo "FALLA: $*"
  exit 1
}
