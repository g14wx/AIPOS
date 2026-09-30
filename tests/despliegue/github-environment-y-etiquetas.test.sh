#!/usr/bin/env bash
# Spec: specs/despliegue.spec.md, sección "Environment y regla de etiquetas (GitHub)".
# Con `gh api` de solo lectura, revisa que el environment `production` y la regla "Proteger etiquetas release" estén
# como dice la spec. Si no hay `gh`, sesión de GitHub o red, se omite y lo dice. No lee ni imprime valores de secretos.
# shellcheck source=comun.sh
source "$(dirname "${BASH_SOURCE[0]}")/comun.sh"
REPO="${AIPOS_REPO:-g14wx/AIPOS}" # AIPOS_REPO solo sirve para probar la prueba contra otro repositorio
command -v gh >/dev/null || omitir "falta gh (la línea de comandos de GitHub)"
gh api "repos/$REPO" --jq .full_name >/dev/null 2>&1 || omitir "gh no tiene sesión o no hay red para leer $REPO"

# api <ruta> <filtro jq>: imprime el resultado, o nada si la llamada falla (por ejemplo, un 404).
api() {
  local salida
  if salida="$(gh api "repos/$REPO/$1" --jq "$2" 2>/dev/null)"; then printf '%s' "$salida"; fi
}

echo "# environment production"
if [ -n "$(api environments/production .name)" ]; then ok "existe el environment production"; else
  falla "no existe el environment production (gh api -X PUT repos/$REPO/environments/production)"
fi
FILTRO_REVISORES='[.protection_rules[] | select(.type=="required_reviewers") | .reviewers[].reviewer.login] | sort | join(",")'
igual "la revisora requerida es la persona desarrolladora (g14wx)" "g14wx" "$(api environments/production "$FILTRO_REVISORES")"
FILTRO_AUTORREVISION='[.protection_rules[] | select(.type=="required_reviewers") | .prevent_self_review] | first'
igual "prevent_self_review es false (ella también sube la etiqueta)" "false" "$(api environments/production "$FILTRO_AUTORREVISION")"
FILTRO_POLITICA='.deployment_branch_policy | "\(.protected_branches) \(.custom_branch_policies)"'
igual "solo las ramas y etiquetas de la lista (custom_branch_policies)" "false true" "$(api environments/production "$FILTRO_POLITICA")"
FILTRO_ETIQUETAS='[.branch_policies[] | "\(.type):\(.name)"] | sort | join(",")'
igual "la única política permitida es la etiqueta release-*" "tag:release-*" "$(api environments/production/deployment-branch-policies "$FILTRO_ETIQUETAS")"
igual "los secretos son SSH_CLAVE_PRIVADA y SSH_HOSTS_CONOCIDOS" "SSH_CLAVE_PRIVADA,SSH_HOSTS_CONOCIDOS" \
  "$(api environments/production/secrets '[.secrets[].name] | sort | join(",")')"
LARGO_USUARIO="$(api environments/production/variables '[.variables[] | select(.name=="SERVIDOR_USUARIO") | (.value | length)] | first')"
if [ -n "$LARGO_USUARIO" ] && [ "$LARGO_USUARIO" != null ] && [ "$LARGO_USUARIO" -gt 0 ] 2>/dev/null; then
  ok "la variable SERVIDOR_USUARIO existe y no está vacía (el valor no se imprime)"
else falla "falta la variable SERVIDOR_USUARIO del environment production"; fi

echo "# regla de etiquetas: Proteger etiquetas release"
ID_REGLA="$(api rulesets '[.[] | select(.name=="Proteger etiquetas release") | .id] | first')"
if [ -z "$ID_REGLA" ] || [ "$ID_REGLA" = null ]; then
  falla "no existe la regla (ruleset) \"Proteger etiquetas release\""
else
  ok "existe la regla \"Proteger etiquetas release\""
  igual "la regla es de etiquetas (target tag)" "tag" "$(api "rulesets/$ID_REGLA" .target)"
  igual "la regla está activa" "active" "$(api "rulesets/$ID_REGLA" .enforcement)"
  igual "apunta a refs/tags/release-*" "refs/tags/release-*" "$(api "rulesets/$ID_REGLA" '.conditions.ref_name.include | join(",")')"
  igual "no excluye ninguna etiqueta" "" "$(api "rulesets/$ID_REGLA" '.conditions.ref_name.exclude | join(",")')"
  REGLAS="$(api "rulesets/$ID_REGLA" '[.rules[].type] | sort | join(",")')"
  for tipo in creation update deletion; do tiene "bloquea la acción $tipo" ",$REGLAS," ",$tipo,"; done
  EXCEPCIONES="$(api "rulesets/$ID_REGLA" '[.bypass_actors[] | "\(.actor_type):\(.actor_id):\(.bypass_mode)"] | sort | join(",")')"
  igual "solo el rol de administradora del repositorio puede saltarla" "RepositoryRole:5:always" "$EXCEPCIONES"
fi

terminar
