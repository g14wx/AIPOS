#!/usr/bin/env bash
# Revisa una etiqueta de despliegue: tiene la forma release-MAYOR.MENOR.PARCHE y su commit está en ProductionEnv.
# Spec: specs/despliegue.spec.md, secciones "La etiqueta release-*" y "El workflow" (job `revisar`).
#
#   revisar-etiqueta.sh <etiqueta>       por ejemplo: revisar-etiqueta.sh release-0.1.0
#
# Corre dentro de un clon de git con el historial completo (`fetch-depth: 0` en actions/checkout), porque compara con
# origin/ProductionEnv. No cambia nada del repositorio. Termina con error, sin desplegar, si algo no cuadra.
set -euo pipefail

FORMA='^release-[0-9]+\.[0-9]+\.[0-9]+$'

if [ "$#" -ne 1 ]; then
  echo "Uso: revisar-etiqueta.sh <etiqueta>   (por ejemplo release-0.1.0)" >&2
  exit 2
fi
etiqueta="$1"

# 1. La forma. GitHub arranca el workflow con el patrón release-*, y aquí se revisa la forma exacta.
if ! [[ "$etiqueta" =~ $FORMA ]]; then
  echo "ERROR: la etiqueta '$etiqueta' no tiene la forma release-X.Y.Z (release-MAYOR.MENOR.PARCHE, por ejemplo release-0.1.0). No se despliega." >&2
  exit 1
fi

# 2. La etiqueta existe, y se mira el commit al que apunta (también si es una etiqueta anotada).
commit="$(git rev-parse --verify --quiet "refs/tags/$etiqueta^{commit}" || true)"
if [ -z "$commit" ]; then
  echo "ERROR: no encuentro la etiqueta '$etiqueta' en este repositorio." >&2
  exit 1
fi

# 3. Su commit está en ProductionEnv.
if ! git rev-parse --verify --quiet "refs/remotes/origin/ProductionEnv^{commit}" >/dev/null; then
  echo "ERROR: no encuentro origin/ProductionEnv; el checkout necesita todo el historial (fetch-depth: 0)." >&2
  exit 1
fi
if ! git merge-base --is-ancestor "$commit" origin/ProductionEnv; then
  echo "ERROR: el commit no está en ProductionEnv: la etiqueta '$etiqueta' apunta a ${commit:0:7}, que no forma parte de origin/ProductionEnv. No se despliega." >&2
  exit 1
fi

echo "Bien: la etiqueta '$etiqueta' tiene la forma correcta y su commit ${commit:0:7} está en ProductionEnv."
