---
name: Grafo del proyecto
description: Consultar el grafo del proyecto antes de empezar una tarea y actualizarlo en cada commit, con el tile grafo-del-proyecto y un hook de git pre-commit
targets:
  - ../tessl-plugins/grafo-del-proyecto/**
  - ../.githooks/pre-commit
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

```bash
graphify query "<la tarea>"   # consultar el grafo
graphify update .             # actualizar el grafo desde el código, en local y sin usar el modelo
/graphify . --update          # actualizar lo que sale de documentos y specs; usa el modelo del agente
```

## Qué va a git

- A git van solo `graphify-out/graph.json` y `graphify-out/GRAPH_REPORT.md`. El resto de `graphify-out/`
  queda fuera, porque guarda rutas de la máquina.
- La skill que instala `graphify install --project` queda fuera de git: `.claude/skills/graphify/`,
  `.claude/CLAUDE.md` y `.codex/skills/graphify/`.

La prueba pregunta a git qué ignora y qué no, archivo por archivo:
`[@test] ../tests/grafo-del-proyecto/ignora-lo-local.test.sh`

## Qué entra al grafo

- Entra lo que está en git, `specs/` incluido.
- Quedan fuera los proyectos de ejemplo de los evals (`tessl-plugins/*/evals/`), la bitácora de IA, las
  carpetas de los agentes (`.claude/`, `.agents/`, `.codex/`) y las imágenes `*.png`. Las imágenes gastarían
  tokens del modelo, y los flujos ya están escritos en markdown.

La prueba revisa que los dos archivos del grafo no traigan rutas de la máquina (`/Users/`) ni código de los evals:
`[@test] ../tests/grafo-del-proyecto/sin-rutas-ni-evals.test.sh`

- Si nada cambió, `graphify update .` no toca `graph.json` ni `GRAPH_REPORT.md`. Si los tocara, cada commit
  ensuciaría el grafo.

La prueba corre `graphify update .` dos veces y compara los archivos. Si Graphify no está instalado, avisa y se salta:
`[@test] ../tests/grafo-del-proyecto/update-sin-cambios.test.sh`

## Hook de git `pre-commit`

Vive en `.githooks/pre-commit`, entra a git como ejecutable y se activa una vez por copia del repo con
`git config core.hooksPath .githooks`. Nunca bloquea un commit: siempre termina con código 0.

- Con Graphify instalado, corre `graphify update .` y agrega `graph.json` y `GRAPH_REPORT.md` al commit, aunque
  la persona desarrolladora o el agente solo hayan agregado otros archivos.
  `[@test] ../tests/hook-de-git/agrega-el-grafo.test.sh`
- Sin Graphify, avisa por la salida de error, deja pasar el commit y no toca el grafo.
  `[@test] ../tests/hook-de-git/sin-graphify.test.sh`
- Si `graphify update .` falla, avisa y deja pasar el commit con el grafo anterior.
  `[@test] ../tests/hook-de-git/graphify-falla.test.sh`

Las tres pruebas arman un repo temporal con un `graphify` falso, así que no tocan este repo ni necesitan Graphify.

## Regla del tile `grafo-del-proyecto`

El agente la lee en cada conversación, en Claude Code y en Codex, junto a las del tile `spec-driven-development`.

- Antes de empezar una tarea, y antes de reunir requisitos o de escribir la spec, corre
  `graphify query "<la tarea>"` y lee primero los archivos que devuelve. Busca a mano solo si el grafo no tiene
  lo que necesita.
- Al terminar, si cambiaron `docs/`, `requerimientos/` o `specs/`, corre `/graphify . --update` (en Codex,
  `$graphify . --update`). En el flujo de specs, este paso va después de `work-review`.
- Si el hook de git no está activo (`git config core.hooksPath` no responde `.githooks`), corre
  `graphify update .` antes del commit y agrega los dos archivos del grafo.

El eval le da al agente una tarea de código con un `graphify` falso que anota cada llamada y si había cambios sin
commit en ese momento. Así se ve si consultó el grafo antes de tocar el código, y si el commit final trae los dos
archivos del grafo:
`[@test] ../tessl-plugins/grafo-del-proyecto/evals/scenario-1/criteria.json`

- No usa `--no-verify` y no sube otros archivos de `graphify-out/`.
- Si falta `graphify-out/graph.json`, lo construye con `/graphify .` (en Codex, `$graphify .`).
- Si `graphify` no está instalado, lee `graphify-out/GRAPH_REPORT.md`, avisa a la persona desarrolladora y sigue
  sin el grafo. No lo instala por su cuenta.
- Si la tarea es revisar si el grafo está bien, no usa el grafo como prueba: lee el código.

## Proceso escrito

- La definición de terminado (`requerimientos/04-entregables.md`) tiene un punto nuevo: el commit trae el grafo
  del proyecto al día.
- El flujo 06 suma "consultar el grafo del proyecto" antes del plan, y el hook de git en el commit. Su diagrama BPMN
  (`.drawio` y `.png`) muestra los mismos pasos, y la tarjeta R-03 del tablero AIPOS muestra la imagen nueva.
- El glosario tiene "grafo del proyecto", "hook de git", "hook de Claude Code" y "spec". Nunca se dice "hook" a secas.
- La guía `docs/setup/graphify-setup.md` explica cómo instalar Graphify, activar el hook de git y resolver
  problemas, y el README la enlaza.
