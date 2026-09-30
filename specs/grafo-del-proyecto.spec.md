---
name: Grafo del proyecto
description: Consultar el grafo del proyecto antes de empezar una tarea y actualizarlo en cada commit, con el tile grafo-del-proyecto, un hook de git pre-commit y un arranque que funciona desde un clon nuevo
targets:
  - ../tessl-plugins/grafo-del-proyecto/**
  - ../.githooks/pre-commit
  - ../.claude/settings.json
  - ../AGENTS.md
  - ../.gitignore
  - ../.graphifyignore
  - ../docs/setup/graphify-setup.md
  - ../docs/lenguaje-ubicuo.md
  - ../README.md
  - ../requerimientos/04-entregables.md
  - ../requerimientos/flujos/06-trabajar-una-tarjeta-con-el-agente.md
  - ../requerimientos/diagramas/06-trabajar-una-tarjeta-con-el-agente.*
---

# Grafo del proyecto

El grafo del proyecto es el mapa que arma Graphify en `graphify-out/`: qué archivos, funciones, documentos y
specs hay y cómo se conectan. El agente lo consulta antes de empezar una tarea, y el hook de git `pre-commit`
lo actualiza en cada commit.

Todo funciona desde un clon nuevo, en cualquier máquina con Claude Code o Codex. Nada depende de una sesión del
agente ni de la configuración de una sola máquina.

```bash
graphify query "<la tarea>"   # consultar el grafo
graphify update .             # armar o actualizar el grafo: código y documentos, en local y sin usar el modelo
```

## Arranque de un clon nuevo

`AGENTS.md` se lee siempre, en Claude Code y en Codex, aunque Tessl todavía no esté instalado. Por eso los pasos de
arranque van al inicio de `AGENTS.md`, fuera de la sección que maneja Tessl:

- Si no existe `.tessl/RULES.md`, el agente corre `tessl install` y le pide a la persona desarrolladora que abra
  una sesión nueva antes de empezar cualquier tarea. Las reglas y las skills se cargan al abrir la sesión.
- Si `git config core.hooksPath` no responde `.githooks`, el agente corre `git config core.hooksPath .githooks`.
- Si el comando `graphify` no está instalado, el agente le pregunta a la persona desarrolladora y, si dice que sí,
  lo instala con `uv tool install "graphifyy[sql]==0.9.72"`. Nunca lo instala sin preguntar.

La prueba revisa que `AGENTS.md` tenga los tres pasos, fuera de la sección de Tessl:
`[@test] ../tests/arranque/agents-md.test.sh`

## Qué va a git

- Del grafo van solo `graphify-out/graph.json` y `graphify-out/GRAPH_REPORT.md`. El resto de `graphify-out/`
  queda fuera, porque guarda rutas de la máquina.
- Van también el hook de git (`.githooks/pre-commit`) y el hook de Claude Code (`.claude/settings.json`).

La prueba pregunta a git qué ignora y qué no, archivo por archivo:
`[@test] ../tests/grafo-del-proyecto/ignora-lo-local.test.sh`

## Qué entra al grafo

- Entra lo que está en git, `specs/` incluido. `graphify update .` lee el código y, de los documentos, los títulos,
  los enlaces y los nombres de código entre comillas invertidas. No usa el modelo del agente.
- Quedan fuera los proyectos de ejemplo de los evals (`tessl-plugins/*/evals/`), la bitácora de IA, las
  carpetas de los agentes (`.claude/`, `.agents/`, `.codex/`) y las imágenes `*.png`.

La prueba revisa que los dos archivos del grafo no traigan rutas de la máquina (`/Users/`) ni código de los evals:
`[@test] ../tests/grafo-del-proyecto/sin-rutas-ni-evals.test.sh`

- Si nada cambió, `graphify update .` no toca `graph.json` ni `GRAPH_REPORT.md`. Si los tocara, cada commit
  ensuciaría el grafo.

La prueba corre `graphify update .` dos veces y compara los archivos. Si Graphify no está instalado, avisa y se salta:
`[@test] ../tests/grafo-del-proyecto/update-sin-cambios.test.sh`

## Hook de git `pre-commit`

Vive en `.githooks/pre-commit` y entra a git como ejecutable. Se activa con `git config core.hooksPath .githooks`,
que lo hace el agente en el arranque. Nunca bloquea un commit: siempre termina con código 0.

- Con Graphify instalado, corre `graphify update .` y agrega `graph.json` y `GRAPH_REPORT.md` al commit, aunque
  la persona desarrolladora o el agente solo hayan agregado otros archivos.
  `[@test] ../tests/hook-de-git/agrega-el-grafo.test.sh`
- Sin Graphify, avisa por la salida de error, deja pasar el commit y no toca el grafo.
  `[@test] ../tests/hook-de-git/sin-graphify.test.sh`
- Si `graphify update .` falla, avisa y deja pasar el commit con el grafo anterior.
  `[@test] ../tests/hook-de-git/graphify-falla.test.sh`

Las tres pruebas arman un repo temporal con un `graphify` falso, así que no tocan este repo ni necesitan Graphify.

## Hook de Claude Code

Vive en `.claude/settings.json`. Antes de cada búsqueda o lectura de archivos corre `graphify hook-guard`, que le
recuerda al agente consultar el grafo. Si Graphify no está instalado, no hace nada y no muestra errores.

La prueba corre los dos comandos del hook de Claude Code sin Graphify en el `PATH` y revisa que terminen con código 0 y sin salida:
`[@test] ../tests/hook-de-claude-code/sin-graphify.test.sh`

## Regla del tile `grafo-del-proyecto`

El agente la lee en cada conversación, en Claude Code y en Codex, junto a las del tile `spec-driven-development`.

- Antes de empezar una tarea, y antes de reunir requisitos o de escribir la spec, corre
  `graphify query "<la tarea>"` y lee primero los archivos que devuelve. Busca a mano solo si el grafo no tiene
  lo que necesita.
- Si el hook de git no está activo (`git config core.hooksPath` no responde `.githooks`), lo activa. Si no puede,
  corre `graphify update .` antes del commit y agrega los dos archivos del grafo.

El eval le da al agente una tarea de código con un `graphify` falso que anota cada llamada y si había cambios sin
commit en ese momento. Así se ve si consultó el grafo antes de tocar el código, y si el commit final trae los dos
archivos del grafo:
`[@test] ../tessl-plugins/grafo-del-proyecto/evals/scenario-1/criteria.json`

- No usa `--no-verify` y no sube otros archivos de `graphify-out/`.
- Si falta `graphify-out/graph.json`, lo arma con `graphify update .`.
- Si `graphify` no está instalado, pregunta antes de instalarlo, igual que en el arranque. Mientras tanto lee
  `graphify-out/GRAPH_REPORT.md`.
- Si la tarea es revisar si el grafo está bien, no usa el grafo como prueba: lee el código.

## Qué no se usa

- La skill `/graphify` y `graphify install`. En la 0.9.72, `graphify install --project` también escribe su propia
  regla en inglés en `CLAUDE.md` y `AGENTS.md`, y crea `.codex/hooks.json`. `AGENTS.md` lo maneja Tessl, y
  `graphify update .` ya alcanza para armar y actualizar el grafo.
- `graphify claude install`, `graphify codex install` y `graphify hook install`. Los dos primeros escriben esa misma
  regla, y el tercero instala hooks de git que corren después del commit y dejan `graph.json` cambiado.

## Proceso escrito

El proceso escrito nombra los mismos pasos que sigue el agente, para que nadie se salte uno al leerlo.

- El flujo 06 y su diagrama BPMN (`.drawio` y `.png`) siguen este orden: consultar el grafo del proyecto, reunir
  requisitos, escribir la spec, aprobar la spec, implementar, correr las pruebas, `spec-verification` y
  `work-review`, validar, bitácora, y commit con el hook de git. La tarjeta R-03 del tablero AIPOS muestra la
  imagen nueva.
- La definición de terminado (`requerimientos/04-entregables.md`) pide dos cosas más. Si la tarjeta cambia
  código, tiene su spec aprobada y pasó `spec-verification` y `work-review`. Y su commit trae el grafo del
  proyecto al día.
- El glosario tiene "grafo del proyecto", "hook de git", "hook de Claude Code" y "spec". Nunca se dice "hook" a secas.
- La guía `docs/setup/graphify-setup.md` explica el arranque, el hook de git, el hook de Claude Code y cómo
  resolver problemas, y el README la enlaza.
