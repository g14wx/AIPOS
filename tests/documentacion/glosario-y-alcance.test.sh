#!/usr/bin/env bash
# Spec: specs/documentacion-de-la-api.spec.md, sección "Glosario y alcance".
# El glosario trae «documentación de la API» y «formato de error»; el alcance suma la fila «Documentación de la API»
# a "Lo que agregamos y el PDF no pide"; y los entregables suman la fila de A-01 al entregable base y sus horas al total.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

glosario=docs/lenguaje-ubicuo.md
alcance=requerimientos/01-alcance.md
entregables=requerimientos/04-entregables.md

fallas=0
falla() {
  echo "FALLA: $1"
  fallas=$((fallas + 1))
}
ok() { echo "ok: $1"; }

for archivo in "$glosario" "$alcance" "$entregables"; do
  [ -f "$archivo" ] || { echo "FALLA: falta $archivo"; exit 1; }
done

# Que la fila que empieza con $2 en el archivo $1 diga todo lo de los demás argumentos.
fila_dice() {
  local archivo="$1" inicio="$2" fila
  shift 2
  fila="$(grep -F -m1 -- "$inicio" "$archivo" || true)"
  if [ -z "$fila" ]; then falla "$archivo no tiene una fila que empiece con $inicio"; return; fi
  ok "$archivo tiene la fila $inicio"
  local texto
  for texto in "$@"; do
    if grep -qF -- "$texto" <<<"$fila"; then ok "la fila $inicio dice $texto"; else falla "la fila $inicio de $archivo no dice $texto"; fi
  done
}

# Glosario: las dos entradas, con lo que la spec propone.
fila_dice "$glosario" '| Documentación de la API |' 'backend/docs/openapi.yaml' 'GET /api/docs' 'Swagger UI' 'OpenAPI' 'documentación de la API'
fila_dice "$glosario" '| Formato de error |' '"error": { "codigo", "mensaje", "detalles" }' 'RespuestaDeError'

# Alcance: la fila está dentro de "Lo que agregamos y el PDF no pide".
seccion="$(awk '/^## Lo que agregamos y el PDF no pide/ {en=1; next} /^## / {en=0} en' "$alcance")"
if [ -z "$seccion" ]; then falla "$alcance no tiene la sección \"Lo que agregamos y el PDF no pide\""; fi
fila_alcance="$(grep -F -m1 '| Documentación de la API |' <<<"$seccion" || true)"
if [ -n "$fila_alcance" ]; then
  ok "el alcance suma la fila Documentación de la API en \"Lo que agregamos y el PDF no pide\""
  if grep -qF '2026-09-30' <<<"$fila_alcance"; then ok "la fila dice cuándo la pidió la persona desarrolladora"; else falla "la fila del alcance no dice 2026-09-30"; fi
  if grep -qi 'PDF no la pide' <<<"$fila_alcance"; then ok "la fila dice que el PDF no la pide"; else falla "la fila del alcance no dice que el PDF no la pide"; fi
else
  falla "la sección \"Lo que agregamos y el PDF no pide\" no tiene la fila Documentación de la API"
fi

# Entregables: la fila de A-01 está en la tabla del entregable base.
base="$(awk '/^### Tiles y entregable base/ {en=1; next} /^### / {en=0} en' "$entregables")"
fila_a01="$(grep -F -m1 '| A-01 |' <<<"$base" || true)"
if [ -n "$fila_a01" ]; then
  ok "la tabla del entregable base tiene la fila de A-01"
  for texto in 'Documentación de la API' 'Backend, Documentación' '`feature/base`' 'B-02' '| 1 |'; do
    if grep -qF -- "$texto" <<<"$fila_a01"; then ok "la fila de A-01 dice $texto"; else falla "la fila de A-01 no dice $texto"; fi
  done
else
  falla "la tabla del entregable base no tiene la fila de A-01"
fi

# El total estimado es la suma de las horas de las tablas, así las horas de A-01 ya están adentro.
suma="$(awk '
  /^\| Id / { en = ($0 ~ /\| Horas \|$/); next }
  /^\|---/ { next }
  /^\|/ && en { n = split($0, c, "|"); h = c[n - 1]; gsub(/ /, "", h); suma += h }
  !/^\|/ { en = 0 }
  END { print suma + 0 }' "$entregables")"
total="$(sed -n 's/^Total estimado: \([0-9.]*\) horas.*/\1/p' "$entregables" | head -1)"
if [ -z "$total" ]; then
  falla "$entregables no dice \"Total estimado: N horas\""
elif awk -v a="$suma" -v b="$total" 'BEGIN { exit !(a == b) }'; then
  ok "el total estimado ($total horas) es la suma de las horas de las tablas"
else
  falla "el total estimado dice $total horas y las tablas suman $suma"
fi

if [ "$fallas" -gt 0 ]; then
  echo "$fallas falla(s)"
  exit 1
fi
echo "todo bien"
