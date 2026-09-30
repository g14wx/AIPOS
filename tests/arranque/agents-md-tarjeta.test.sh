#!/usr/bin/env bash
# Spec: specs/arquitectura.spec.md, sección "Git y entrega".
# AGENTS.md le dice a una sesión nueva qué es AIPOS, cómo toma una tarjeta, las cuatro reglas de no depender de una
# sesión ni de una máquina y que consulte el MCP design-patterns. "Antes de empezar" sigue al inicio y la sección de
# Tessl al final.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

fallas=0
revisar() {
  if grep -qF -- "$1" AGENTS.md; then
    echo "ok: $2"
  else
    echo "FALLA: falta $2"
    fallas=$((fallas + 1))
  fi
}

revisar "## Qué es AIPOS" "la sección Qué es AIPOS"
revisar "## Cómo tomar una tarjeta" "la sección Cómo tomar una tarjeta"
revisar "## Nada depende de una sesión ni de una máquina" "la sección de no depender de una sesión ni de una máquina"
revisar "## Decisiones de diseño" "la sección Decisiones de diseño"

revisar "Todo lo que se decide queda en el repo o en la tarjeta. Nada depende de una sesión ni de una máquina." "la regla 1"
revisar "En tarjetas y documentos no se nombran sesiones, alias de ssh ni carpetas que solo existen en una PC." "la regla 2"
revisar "El repo y el tablero son públicos: no se escriben credenciales ni cómo se entra a un servidor. Un servidor se nombra por su dominio, y por su IP solo si el DNS ya la hace pública." "la regla 3"
revisar "Las revisiones las hace el agente revisor (Codex), no otra sesión." "la regla 4"

revisar "tablero AIPOS" "el tablero AIPOS"
revisar "<tipo>/<id>-<resumen>" "la rama de tarjeta"
revisar "specs/arquitectura.spec.md" "la spec de arquitectura"
revisar "spec aprobada antes del código" "la spec aprobada antes del código"
revisar "graphify query" "consultar el grafo del proyecto"
revisar "curl" "probar la API con curl"
revisar "chrome-devtools" "probar la pantalla con el MCP chrome-devtools"
revisar "gh issue create" "abrir un issue por cada bug"
revisar "codex review" "la revisión de Codex"
revisar "bitacora-ia" "la entrada de la bitácora"
revisar "design-patterns" "consultar el MCP design-patterns"
revisar "impeccable" "la skill impeccable para la pantalla"

# "Antes de empezar" va primero y la sección de Tessl va al final.
primera="$(grep -n '^## ' AGENTS.md | head -1)"
case "$primera" in
  *"Antes de empezar"*) echo "ok: Antes de empezar es la primera sección" ;;
  *) echo "FALLA: la primera sección no es Antes de empezar ($primera)"; fallas=$((fallas + 1)) ;;
esac
ultima="$(grep -n '^# ' AGENTS.md | tail -1)"
case "$ultima" in
  *"Agent Rules <!-- tessl-managed -->"*) echo "ok: la sección de Tessl va al final" ;;
  *) echo "FALLA: la última sección no es la de Tessl ($ultima)"; fallas=$((fallas + 1)) ;;
esac

if grep -nE '/Users/|/private/|contabo|claude\.ai/code/session' AGENTS.md; then
  echo "FALLA: AGENTS.md tiene una ruta de la máquina, el alias de un servidor o un enlace a una sesión"
  fallas=$((fallas + 1))
fi

if [ "$fallas" -gt 0 ]; then
  echo "$fallas fallas"
  exit 1
fi
echo "todo bien"
