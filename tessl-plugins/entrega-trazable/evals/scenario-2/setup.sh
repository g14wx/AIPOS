#!/usr/bin/env bash
set -euo pipefail
git init -q -b main
git config user.email "persona@example.com"
git config user.name "Persona"
git add README.md docs/lenguaje-ubicuo.md
git commit -qm "chore: estructura inicial del proyecto"
git branch ProductionEnv
git switch -q -c feature/productos ProductionEnv
git add package.json src migrations docs/bitacora-ia.md
git commit -qm "feat(productos): crear tabla y modelo de productos"
