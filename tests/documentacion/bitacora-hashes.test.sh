#!/usr/bin/env bash
# Tarjeta E-01 (cerrar la bitácora): cada hash corto que cita docs/bitacora-ia.md tiene que existir en el repositorio.
# Un hash existe cuando es un commit (git cat-file -e <hash>^{commit}) y lo alcanza una rama de origin o una etiqueta.
# Solo mirar git cat-file no basta: el commit que dejó un rebase sigue suelto en tu copia, pero un clon nuevo no lo trae.
# Dice todos los hashes con problema, no solo el primero, y cuando puede sugiere el commit de origin con el mismo mensaje.
#
# Uso: bash tests/documentacion/bitacora-hashes.test.sh [archivo]   (por defecto, docs/bitacora-ia.md)
#      SIN_FETCH=1 bash tests/documentacion/bitacora-hashes.test.sh   (no trae origin: para cuando no hay red)
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

archivo="${1:-docs/bitacora-ia.md}"

fallas=0
falla() {
  echo "FALLA: $1"
  fallas=$((fallas + 1))
}
ok() { echo "ok: $1"; }

[ -f "$archivo" ] || { echo "FALLA: falta $archivo"; exit 1; }

# Los hashes que cita un archivo, sin repetir: de 7 a 40 caracteres hexadecimales. Los enlaces se quitan antes, porque
# traen ids que también son hexadecimales. Un texto de solo dígitos cuenta únicamente si mide 7, el largo que usa git:
# así un código de barras o una hora sin separadores no se toman por hashes.
hashes_citados() {
  sed -E 's#https?://[^ )>]*##g' "$1" | grep -o -E '\b[0-9a-f]{7,40}\b' | awk 'length($0) == 7 || /[a-f]/' | sort -u || true
}

# El commit de origin que reemplazó al hash $2 del repositorio $1, si se puede saber. Un rebase cambia el hash pero
# conserva la fecha de autoría: el que tiene el mismo mensaje y la misma fecha es el equivalente. Si ninguno tiene la
# misma fecha, lista hasta 3 con el mismo mensaje, porque varios commits pueden llamarse igual.
equivalente() {
  local repo="$1" h="$2" asunto fecha
  asunto="$(git -C "$repo" log -1 --format=%s "$h" 2>/dev/null)" || return 0
  fecha="$(git -C "$repo" log -1 --format=%at "$h" 2>/dev/null)" || return 0
  [ -n "$asunto" ] || return 0
  git -C "$repo" log --remotes=origin --tags --format='%h%x09%at%x09%s' |
    awk -F'\t' -v asunto="$asunto" -v fecha="$fecha" '
      $3 != asunto { next }
      $2 == fecha { exacto = $1; exit }
      n++ < 3 { otros = otros " " $1 }
      END {
        if (exacto != "") print exacto " (mismo mensaje y misma fecha de autoría)"
        else if (otros != "") print "con el mismo mensaje pero otra fecha:" otros
      }' || true
}

# Escribe una línea por cada hash del archivo $2 que no existe en el repositorio $1, con su motivo. Si todos existen,
# no escribe nada. Después de las líneas de un hash puede venir otra con su posible equivalente.
revisar_hashes() {
  local repo="$1" archivo="$2" h alcanzables sugerido
  alcanzables="$(git -C "$repo" rev-list --remotes=origin --tags)"
  while read -r h; do
    [ -n "$h" ] || continue
    if ! git -C "$repo" cat-file -e "$h^{commit}" 2>/dev/null; then
      echo "$h no existe en el repositorio"
    elif ! grep -q "^$h" <<<"$alcanzables"; then
      echo "$h solo existe en tu copia: ninguna rama de origin ni etiqueta lo alcanza"
    else
      continue
    fi
    sugerido="$(equivalente "$repo" "$h")"
    if [ -n "$sugerido" ]; then echo "  posible equivalente en origin: $sugerido"; fi
  done < <(hashes_citados "$archivo")
}

# 1. El archivo real, con lo que hay en origin.
if [ -z "${SIN_FETCH:-}" ]; then
  git fetch --quiet --tags origin || { echo "FALLA: git fetch origin no funcionó; sin red usa SIN_FETCH=1"; exit 1; }
fi
total="$(hashes_citados "$archivo" | wc -l | tr -d ' ')"
if [ "$total" -gt 0 ]; then ok "$archivo cita $total hashes"; else falla "$archivo no cita ningún hash: la revisión no está mirando nada"; fi
problemas="$(revisar_hashes . "$archivo")"
if [ -z "$problemas" ]; then
  ok "los $total hashes de $archivo existen y los alcanza origin"
else
  while IFS= read -r linea; do
    case "$linea" in
      "  "*) echo "$linea" ;;
      *) falla "$linea" ;;
    esac
  done <<<"$problemas"
fi

# 2. Control negativo, en un repositorio temporal y sin red: la revisión tiene que atrapar un hash que no existe y un
# commit que solo está en la copia local, y tiene que dejar pasar un commit de origin, un código de barras y un enlace.
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
git_temporal() { git -C "$tmp/repo" -c user.name=Prueba -c user.email=prueba@example.com -c commit.gpgsign=false "$@"; }
git init -q --bare "$tmp/origin.git"
git init -q "$tmp/repo"
git_temporal remote add origin "$tmp/origin.git"
git_temporal commit -q --allow-empty -m "commit que llega a origin"
en_origin="$(git_temporal rev-parse --short=7 HEAD)"
git_temporal push -q origin HEAD:refs/heads/rama
git_temporal fetch -q origin
git_temporal commit -q --allow-empty -m "commit que solo está en la copia"
solo_local="$(git_temporal rev-parse --short=7 HEAD)"
cat >"$tmp/bitacora.md" <<EOF
Commit de origin: \`$en_origin\`. Commit suelto: \`$solo_local\`. Commit inventado: \`0000000\`.
Un código de barras \`7501055300075\`, un límite 2147483647 y un enlace https://trello.com/c/6abc3e35f71f82bc9340b20a.
EOF
vistos="$(hashes_citados "$tmp/bitacora.md" | wc -l | tr -d ' ')"
if [ "$vistos" = 3 ]; then
  ok "el control negativo ve 3 hashes y no toma por hash el código de barras, el número ni el enlace"
else
  falla "el control negativo debía ver 3 hashes y vio $vistos"
fi
revisados="$(revisar_hashes "$tmp/repo" "$tmp/bitacora.md")"
if grep -q "^0000000 no existe" <<<"$revisados"; then ok "el control negativo atrapa un hash que no existe"; else falla "el control negativo no atrapó 0000000: $revisados"; fi
if grep -q "^$solo_local solo existe en tu copia" <<<"$revisados"; then ok "el control negativo atrapa un commit que solo está en la copia"; else falla "el control negativo no atrapó $solo_local: $revisados"; fi
if grep -q "^$en_origin" <<<"$revisados"; then falla "el control negativo marcó un commit que sí llega a origin: $en_origin"; else ok "el control negativo deja pasar un commit de origin"; fi

if [ "$fallas" -gt 0 ]; then
  echo "$fallas falla(s)"
  exit 1
fi
echo "todo bien"
