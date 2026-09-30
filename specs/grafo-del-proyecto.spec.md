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
  - ../docs/setup/tessl-setup.md
  - ../docs/lenguaje-ubicuo.md
  - ../README.md
  - ../requerimientos/04-entregables.md
  - ../requerimientos/flujos/06-trabajar-una-tarjeta-con-el-agente.md
  - ../requerimientos/flujos/00-mapa-de-procesos.md
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

- Si no existe `.tessl/RULES.md`, o si `find tessl.json tessl-plugins -newer .tessl/RULES.md` muestra algún
  archivo (por ejemplo, después de un `git pull` que trajo un tile nuevo), el agente corre `tessl install`. Después
  le pide a la persona desarrolladora que abra una sesión nueva antes de empezar cualquier tarea, porque las reglas
  y las skills se cargan al abrir la sesión. Si no hay una persona que pueda abrirla, por ejemplo en `codex review`
  o en una ejecución automática, el agente lee `.tessl/RULES.md` y los archivos que enlaza, y sigue con la tarea.
- Si `git config core.hooksPath` no responde `.githooks`, el agente corre `git config core.hooksPath .githooks`.
- Si `graphify --version` no responde `graphify 0.9.72`, porque no está instalado o es otra versión, el agente le
  pregunta a la persona desarrolladora y, si dice que sí, lo instala con `uv tool install "graphifyy[sql]==0.9.72"`.
  Nunca lo instala sin preguntar.
- Si falta `tessl` o `uv`, el agente le indica a la persona desarrolladora la guía que corresponde:
  `docs/setup/tessl-setup.md` o `docs/setup/graphify-setup.md`.

La prueba revisa que `AGENTS.md` tenga los tres pasos, fuera de la sección de Tessl:
`[@test] ../tests/arranque/agents-md.test.sh`

## Versión de Graphify

El proyecto usa Graphify 0.9.72. Con otra versión el grafo puede salir distinto, y dos personas se pisarían el
grafo en cada commit. La versión aparece igual en `AGENTS.md`, la regla del tile, la guía, el hook de git y el eval.

La prueba revisa que todos esos archivos pidan la misma versión:
`[@test] ../tests/grafo-del-proyecto/misma-version.test.sh`

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

- Busca `graphify` en el `PATH` y, si no está, en `~/.local/bin/graphify`, donde lo pone `uv tool install`. Así
  funciona también en los commits desde WebStorm u otra app, que a veces no ven `~/.local/bin`.
  `[@test] ../tests/hook-de-git/graphify-fuera-del-path.test.sh`
- Si `graphify --version` no es la 0.9.72, avisa, deja pasar el commit y no toca el grafo.
  `[@test] ../tests/hook-de-git/otra-version.test.sh`
- Con Graphify instalado, corre `graphify update .` y agrega `graph.json` y `GRAPH_REPORT.md` al commit, aunque
  la persona desarrolladora o el agente solo hayan agregado otros archivos.
  `[@test] ../tests/hook-de-git/agrega-el-grafo.test.sh`
- Sin Graphify, avisa por la salida de error, deja pasar el commit y no toca el grafo.
  `[@test] ../tests/hook-de-git/sin-graphify.test.sh`
- Si `graphify update .` falla, avisa, muestra el aviso de Graphify y deja pasar el commit con el grafo anterior.
  Si Graphify se negó a achicar el grafo porque se borró código a propósito, el aviso dice cómo seguir:
  `graphify update . --force` y el grafo en otro commit.
  `[@test] ../tests/hook-de-git/graphify-falla.test.sh`
- Vacía la marca de commit que deja Graphify: `built_at_commit` en `graph.json` y la línea "Built from commit" de
  `GRAPH_REPORT.md`. Graphify anota el commit anterior, porque el nuevo todavía no existe, y el grafo parecería
  desactualizado en su propio commit. En el reporte queda una línea que dice que el hook de git lo mantiene al día.
  `[@test] ../tests/hook-de-git/marca-de-commit.test.sh`

Estas pruebas arman un repo temporal con un `graphify` falso y un `HOME` aparte, así que no tocan este repo ni
necesitan Graphify.

El hook de git arma el grafo con lo que hay en la carpeta del proyecto, no solo con lo que entra al commit. Si
quedan cambios sin commit, el grafo del commit también los muestra, hasta el commit siguiente.

## Hook de Claude Code

Vive en `.claude/settings.json`. Antes de cada búsqueda o lectura de archivos corre `graphify hook-guard`, que le
recuerda al agente consultar el grafo. Busca `graphify` en el `PATH` y en `~/.local/bin/graphify`. Si no lo
encuentra, no hace nada y no muestra errores.

La prueba corre los dos comandos del hook de Claude Code sin Graphify y revisa que terminen con código 0 y sin salida:
`[@test] ../tests/hook-de-claude-code/sin-graphify.test.sh`

La otra prueba pone un `graphify` falso solo en `~/.local/bin` y revisa que el hook de Claude Code lo use:
`[@test] ../tests/hook-de-claude-code/graphify-fuera-del-path.test.sh`

## Regla del tile `grafo-del-proyecto`

El agente la lee en cada conversación, en Claude Code y en Codex, junto a las del tile `spec-driven-development`.

- Antes de empezar una tarea, y antes de reunir requisitos o de escribir la spec, corre
  `graphify query "<la tarea>"` y lee primero los archivos que devuelve. Usa la respuesta para encontrar las specs
  y el código relacionados y para elegir los `targets` de la spec. Busca a mano solo si el grafo no tiene lo que
  necesita.
- Si el hook de git no está activo (`git config core.hooksPath` no responde `.githooks`), lo activa. Si no puede,
  corre `graphify update .` antes del commit y agrega los dos archivos del grafo.

El eval le da al agente una tarea de código con un `graphify` falso que anota cada llamada y si había cambios sin
commit en ese momento. Así se ve si consultó el grafo antes de tocar el código, y si el commit final trae los dos
archivos del grafo:
`[@test] ../tessl-plugins/grafo-del-proyecto/evals/scenario-1/criteria.json`

- No usa `--no-verify` y no sube otros archivos de `graphify-out/`.
- Si falta `graphify-out/graph.json`, lo arma con `graphify update .`.
- Si `graphify` no está instalado, o `graphify --version` no responde `graphify 0.9.72`, pregunta antes de
  instalarlo, igual que en el arranque. Mientras tanto lee `graphify-out/GRAPH_REPORT.md`.
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
  `work-review`, validar, bitácora, y commit con el hook de git. Si la tarjeta no cambia código, no lleva spec: el
  agente propone un plan corto y la persona desarrolladora lo aprueba. La tarjeta R-03 del tablero AIPOS muestra la
  imagen nueva, y el mapa de procesos (`00-mapa-de-procesos.md`) resume el flujo 06 con los mismos pasos.
- La definición de terminado (`requerimientos/04-entregables.md`) pide dos cosas más. Si la tarjeta cambia
  código, tiene su spec aprobada y pasó `spec-verification` y `work-review`. Y su commit trae el grafo del
  proyecto al día.
- El glosario tiene "grafo del proyecto", "hook de git", "hook de Claude Code" y "spec". Nunca se dice "hook" a secas.
- La guía `docs/setup/graphify-setup.md` explica el arranque, el hook de git, el hook de Claude Code y cómo
  resolver problemas, y el README la enlaza. La guía de Tessl (`docs/setup/tessl-setup.md`) lista los tiles
  `grafo-del-proyecto` y `spec-driven-development`.
