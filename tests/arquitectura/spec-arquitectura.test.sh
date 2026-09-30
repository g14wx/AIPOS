#!/usr/bin/env bash
# Spec: specs/arquitectura.spec.md, secciones "Versiones" y "Git y entrega".
# La spec de arquitectura tiene el formato del tile spec-driven-development (frontmatter y enlaces [@test]),
# dice las versiones y las decisiones que otras tarjetas usan, y ni ella ni los documentos que toca dejan
# rutas de una máquina, el alias de un servidor ni enlaces a sesiones del agente.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

spec=specs/arquitectura.spec.md
[ -f "$spec" ] || { echo "FALLA: falta $spec"; exit 1; }

fallas=0
falla() {
  echo "FALLA: $1"
  fallas=$((fallas + 1))
}
ok() { echo "ok: $1"; }

# Frontmatter: name, description y al menos un target relativo.
frontmatter="$(awk 'NR==1 && $0!="---" {exit} NR>1 && $0=="---" {exit} NR>1 {print}' "$spec")"
for campo in name description targets; do
  if grep -q "^$campo:" <<<"$frontmatter"; then ok "el frontmatter tiene $campo"; else falla "el frontmatter no tiene $campo"; fi
done
targets="$(grep -c '^  - \.\./' <<<"$frontmatter" || true)"
if [ "$targets" -ge 1 ]; then ok "hay $targets targets relativos"; else falla "no hay targets que empiecen con ../"; fi
if grep '^  - ' <<<"$frontmatter" | grep -qv '^  - \.\./'; then falla "hay un target que no es una ruta relativa desde specs/"; else ok "todos los targets son rutas relativas"; fi

# Enlaces [@test]: relativos desde specs/. Los de shell de la raíz ya tienen que existir.
enlaces="$(grep -o '\[@test\] [^ ]*' "$spec" | sed 's/^\[@test\] //; s/`$//' | sort -u)"
[ -n "$enlaces" ] || falla "la spec no tiene enlaces [@test]"
while IFS= read -r ruta; do
  [ -n "$ruta" ] || continue
  case "$ruta" in
    ../*) ;;
    *) falla "el [@test] $ruta no es una ruta relativa desde specs/" ;;
  esac
  case "$ruta" in
    ../tests/*)
      if [ -f "specs/$ruta" ]; then ok "existe $ruta"; else falla "no existe $ruta"; fi ;;
  esac
done <<<"$enlaces"

# Decisiones que las tarjetas B-02, B-03 y B-04 leen tal cual.
revisar() {
  if grep -qF -- "$1" "$spec"; then ok "la spec dice $1"; else falla "la spec no dice $1"; fi
}
for texto in \
  '`express` | 5.2.1' '`sequelize` | 6.37.8' '`mysql2` | 3.24.5' '`sequelize-cli` | 6.6.5' \
  '`vue` | 2.7.16' '`vuetify` | 2.7.2' '`vite` | 7.3.6' '`@vitejs/plugin-vue2` | 2.3.4' \
  '`axios` | 1.20.0' '`@mdi/font` | 7.4.47' '`lottie-web` | 5.13.0' '`vitest` | 5.0.2' \
  'mysql:8.4' 'DECIMAL(12,2)' 'DECIMAL(10,2)' 'MYSQL_PORT' 'npm run migrar' 'npm run deshacer' 'npm run rehacer' \
  '#292F36' '#4ECDC4' '#F7FFF7' '#FF6B6B' '#FFE66D' 'supuesto' 'impeccable' 'prefers-reduced-motion' \
  'aipos.ventaActual' 'ErrorApi' 'GET /api/salud' 'chrome-devtools' 'gh issue create' 'design-patterns' \
  'feature/b-02-base-del-backend'; do
  revisar "$texto"
done

# Sin datos privados en la spec ni en los documentos que toca.
archivos=("$spec" AGENTS.md docs/lenguaje-ubicuo.md)
while IFS= read -r archivo; do archivos+=("$archivo"); done < <(find requerimientos -name '*.md' | sort)
for archivo in "${archivos[@]}"; do
  if grep -nE '/Users/|/private/|ssh contabo|contabo|claude\.ai/code/session|sleepy-napping' "$archivo" >/dev/null; then
    falla "$archivo tiene una ruta de la máquina, el alias de un servidor o un enlace a una sesión"
    grep -nE '/Users/|/private/|ssh contabo|contabo|claude\.ai/code/session|sleepy-napping' "$archivo" || true
  fi
done
[ "$fallas" -eq 0 ] && ok "ningún documento deja datos privados"

if [ "$fallas" -gt 0 ]; then
  echo "$fallas fallas"
  exit 1
fi
echo "todo bien"
