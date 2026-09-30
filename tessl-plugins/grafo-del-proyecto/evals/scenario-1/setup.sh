#!/usr/bin/env bash
set -euo pipefail

# graphify falso: responde como Graphify y anota cada llamada en graphify-out/.llamadas.log, con la
# cantidad de archivos con cambios sin commit en ese momento, sin contar graphify-out/.
# GRAPHIFY_FALSO_DIR sirve para probar este setup en una máquina sin tocar su PATH.
bin_dir=""
for d in ${GRAPHIFY_FALSO_DIR:-} /usr/local/bin "$HOME/.local/bin"; do
  mkdir -p "$d" 2>/dev/null || true
  if [ -w "$d" ]; then
    bin_dir="$d"
    break
  fi
done
[ -n "$bin_dir" ] || { echo "no hay dónde instalar el graphify falso" >&2; exit 1; }

cat > "$bin_dir/graphify" <<'SH'
#!/bin/sh
raiz=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cambios=$(git -C "$raiz" status --porcelain --untracked-files=no 2>/dev/null | grep -v ' graphify-out/' | wc -l | tr -d ' ')
mkdir -p "$raiz/graphify-out"
echo "$(date +%s) graphify $* | cambios_sin_commit=$cambios" >> "$raiz/graphify-out/.llamadas.log"
case "$1" in
  --version|version)
    echo "graphify 0.9.72" ;;
  query|explain|path)
    echo "Graph: graphify-out/graph.json (6 nodes) | Start: ['buscarProductos()']"
    echo "NODE buscarProductos() [src=src/productos.js loc=L15 community=Productos]"
    echo "NODE agregarProducto() [src=src/productos.js loc=L6 community=Productos]"
    echo "NODE productos [src=src/productos.js loc=L1 community=Productos]"
    echo "EDGE buscarProductos() --reads [EXTRACTED]--> productos at=src/productos.js:L17" ;;
  update)
    huella=$(cat "$raiz"/src/*.js 2>/dev/null | cksum | cut -d' ' -f1)
    printf '{"nodes": 6, "huella_del_codigo": "%s"}\n' "$huella" > "$raiz/graphify-out/graph.json"
    printf '# Graph Report\n\n- Huella del código: %s\n' "$huella" > "$raiz/graphify-out/GRAPH_REPORT.md"
    echo "[graphify watch] graph.json and GRAPH_REPORT.md updated in graphify-out" ;;
  hook-guard|hook-check)
    ;;
  *)
    echo "graphify (falso): este eval no soporta el comando $1" >&2 ;;
esac
exit 0
SH
chmod +x "$bin_dir/graphify"

# Que el agente lo encuentre aunque ese directorio no esté en su PATH
for rc in "$HOME/.bashrc" "$HOME/.profile" "$HOME/.zshrc"; do
  if ! grep -qs "graphify falso del eval" "$rc"; then
    printf '\n# graphify falso del eval\nexport PATH="%s:$PATH"\n' "$bin_dir" >> "$rc"
  fi
done
export PATH="$bin_dir:$PATH"

chmod +x .githooks/pre-commit
git init -q -b main
git config user.email "persona@example.com"
git config user.name "Persona"
graphify update . >/dev/null
rm -f graphify-out/.llamadas.log
git add -A
git commit -qm "chore: estructura inicial con el grafo del proyecto"
