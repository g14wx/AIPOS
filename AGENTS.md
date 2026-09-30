# AIPOS

## Antes de empezar

Revisa esto al abrir cada sesión, en este orden. Así un clon nuevo queda listo en cualquier máquina con Claude Code o Codex.

1. Si no existe `.tessl/RULES.md`, corre `tessl install` desde la raíz del proyecto. Así se instalan las reglas y las skills de los tiles de `tessl-plugins/`. Después pídele a la persona que abra una sesión nueva, y no empieces ninguna tarea en esta: las reglas y las skills se cargan al abrir la sesión. Si el comando `tessl` no está instalado, pídele que siga `docs/setup/tessl-setup.md`.
2. Si `git config core.hooksPath` no responde `.githooks`, corre `git config core.hooksPath .githooks`. Así se activa el hook de git `pre-commit`, que actualiza el grafo del proyecto en cada commit.
3. Si el comando `graphify` no está instalado, pregúntale a la persona si lo instalas. Si dice que sí, corre `uv tool install "graphifyy[sql]==0.9.72"`. Nunca lo instales sin preguntar. Si falta `uv`, la guía está en `docs/setup/graphify-setup.md`.

# Agent Rules <!-- tessl-managed -->

@.tessl/RULES.md follow the [instructions](.tessl/RULES.md)
