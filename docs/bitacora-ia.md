# Bitácora de IA — AIPOS

Registro de cómo se usó el agente de código en cada tarea. De aquí salen los puntos 8 a 11 del README.
Las entradas marcadas "reconstruido" se armaron después, desde git y GitHub, y hay que confirmarlas.

## Resumen

| Entregable | Tiempo aprox. | Tareas con agente | Propuestas cambiadas o descartadas |
|---|---|---|---|
| Preparación: agentes, tiles y glosario | 2 h 40 min hasta ahora (12:46–15:28), en curso | 14 | 6 |

## Entradas

### 2026-09-29 12:46 — Configuración de agentes y MCP de Trello (reconstruido, por confirmar)

- **Tarea:** por confirmar. Según los commits: conectar Claude Code y Codex a Trello con un MCP (una forma estándar de conectar el agente con herramientas externas) y documentar cómo hacerlo.
- **Agente:** Claude Code (Fable 5.1), según la línea `Co-Authored-By` de los commits.
- **Qué hizo el agente:** creó `.mcp.json.example`, `.codex/config.toml.example` y `docs/agents-setup.md`, y dejó fuera de git los archivos con credenciales (`.mcp.json`, `.codex/config.toml`).
- **Revisión de la persona:** investigó por su cuenta y detectó que el agente había afirmado algo falso: que Codex no admite servidores MCP por proyecto.
- **Propuestas cambiadas o descartadas:** "Codex no admite MCP por proyecto" → se documentó la configuración por proyecto con `.codex/config.toml` → Codex sí la lee en proyectos de confianza; el agente se había guiado solo por `codex mcp add --help`.
- **Tiempo:** 12:46–13:24, según los commits (por confirmar).
- **Commits:** `39019bc` (commit inicial de la persona), `873e7e3`, `edeeb2e`.

### 2026-09-29 13:27 — PR #1 y protección de `main` (reconstruido, por confirmar)

- **Tarea:** proteger `main` con buenas prácticas, con una sola persona desarrollando (según la memoria del agente; por confirmar).
- **Agente:** por confirmar.
- **Qué se hizo:** se abrió el PR #1 con la guía de agentes (13:27) y se integró en `main` (13:33). Se creó la regla de protección "Protect main" (13:32): PR obligatorio con 0 aprobaciones, sin force push, sin borrar la rama, historial lineal y solo squash o rebase. Son 0 aprobaciones porque, con una sola persona, pedir aprobación bloquearía cada merge.
- **Revisión de la persona:** por confirmar.
- **Propuestas cambiadas o descartadas:** ninguna registrada (por confirmar).
- **Tiempo:** 13:27–13:34, según GitHub.
- **Commits:** PR #1 (`edeeb2e` en `main`).

### 2026-09-29 13:35 — Análisis de la prueba y plan de tiles

- **Tarea:** "necesito crear unos tessl tiles para poder crear un proyecto en base a [el PDF] … analiza el proyecto, si hay alguna trampa por ahí, y vamos poco a poco creando los tiles".
- **Agente:** Claude Code (Opus 5.5), con 3 investigaciones en paralelo.
- **Qué hizo el agente:** leyó el PDF y el repo, revisó la configuración de GitHub e investigó en internet las trampas de Vue 2 con Vuetify 2, de MySQL con Sequelize y del registro de Tessl. Encontró, entre otras: GitHub borra las ramas al integrar un PR y no permite merge commits; los tiles viejos de Tessl para Vue, Vuetify y Sequelize están archivados; `npm i vuetify` instala la 4.2, que no funciona con Vue 2; `DELIMITER` falla si se envía por Sequelize; `DECIMAL` sin tamaño pierde los centavos. Escribió el plan fuera del repo.
- **Revisión de la persona:** pidió que el agente buscara en internet ("si necesitas ir a buscar info en internet, vamos!"). Decidió: tiles en `tessl-plugins/`, uno por dominio y en inglés; Vite 7 en vez de Vue CLI; integrar cada entregable con PR y merge commit.
- **Propuestas cambiadas o descartadas:** tiles privados primero → públicos desde el inicio → decisión de la persona.
- **Tiempo:** 13:35–14:00 (aprobación del plan).
- **Commits:** ninguno (solo análisis).

### 2026-09-29 14:01 — Tile lenguaje-ubicuo

- **Tarea:** "necesito un tile para definir el 'lenguaje ubicuo' … que sea corto, directo, no mensajes como robot". El motivo: el agente usaba jerga sin explicar, como "ADR", y frases cortadas.
- **Agente:** Claude Code (Opus 5.5).
- **Qué hizo el agente:** leyó el artículo de layra4.dev (sacó el texto del código de la página, porque se arma con JavaScript) y la investigación que pegó la persona. Creó `tessl-plugins/lenguaje-ubicuo/` con 2 reglas, la skill `glosario-lenguaje-ubicuo` y 3 evals. Corrió `tessl init` para Claude Code y Codex, instaló el tile y dejó Tessl en modo "managed": la copia instalada de los tiles no va a git y se reinstala con `tessl install`.
- **Revisión de la persona:** detectó que el agente usaba "plugin" para dos cosas distintas, el tile de Tessl y el plugin de Claude Code caveman ("mira como estamos confundiendo cosas"), y pidió que el tile lo deje claro. Decidió nombres del negocio en español y el tile en español.
- **Propuestas cambiadas o descartadas:** desactivar el plugin de Claude Code caveman → dejarlo en modo lite (el cambio de configuración sigue pendiente) → decisión de la persona. Aplicar la regla de comunicación en todos los proyectos → solo en AIPOS → decisión de la persona.
- **Tiempo:** 14:01–14:11.
- **Commits:** este commit.

### 2026-09-29 14:11 — Glosario del proyecto

- **Tarea:** armar el glosario de AIPOS con la skill `glosario-lenguaje-ubicuo`.
- **Agente:** Claude Code (Opus 5.5).
- **Qué hizo el agente:** creó `docs/lenguaje-ubicuo.md` con las palabras del PDF y de la conversación, separadas en "Negocio" y "Herramientas y proceso", y dejó 5 dudas en "Pendientes".
- **Revisión de la persona:** eligió "precio aplicado", "detalle de venta" y "registrar venta". Siguen pendientes "venta en pantalla" y "cantidad".
- **Propuestas cambiadas o descartadas:** ninguna; la persona eligió las 3 opciones que recomendó el agente.
- **Tiempo:** 14:11–14:14.
- **Commits:** este commit.

### 2026-09-29 14:14 — Qué tiles hacen falta

- **Tarea:** "¿qué otras tiles sacamos? que veas que sean necesarias".
- **Agente:** Claude Code (Opus 5.5).
- **Qué hizo el agente:** revisó el plan y lo bajó de 6 tiles a 3: `entrega-trazable`, `mysql-sequelize-procedimientos` y `vue2-vuetify2-vite`. Propuso probar tiles que ya existen en vez de escribirlos (`tessl-labs/express-error-handling`, `openkata/commit-conventions`) y llevar los requisitos de AIPOS en un archivo (`docs/requisitos.md`) en vez de un tile.
- **Revisión de la persona:** aprobó la propuesta ("ok vamos!").
- **Propuestas cambiadas o descartadas:** el propio agente cambió su plan: de 6 tiles a 3, porque el agente ya maneja bien Express y los requisitos de un solo proyecto no necesitan un tile.
- **Tiempo:** 14:14–14:16.
- **Commits:** ninguno (solo revisión).

### 2026-09-29 14:16 — Tile entrega-trazable

- **Tarea:** crear el primer tile de la lista ("ok vamos!").
- **Agente:** Claude Code (Opus 5.5).
- **Qué hizo el agente:** creó `tessl-plugins/entrega-trazable/` con la regla de entrega trazable, 3 skills (`flujo-entregable`, `bitacora-ia`, `readme-entrega`) y 3 evals con repos de git de ejemplo, y probó los scripts que arman esos repos. La validación de Tessl rechazó la skill `bitacora-ia` porque su descripción tenía dos puntos seguidos de un espacio; el agente la reescribió. Agregó al glosario los términos de entrega, escribió esta bitácora y separó el trabajo en commits, con una rama por tile.
- **Revisión de la persona:** decidió que los mensajes de commit van en español. A mitad de la tarea preguntó qué estaba haciendo el agente y después pidió seguir ("tu continua como venias haciendo"). Todavía no revisó el contenido del tile (por confirmar).
- **Propuestas cambiadas o descartadas:** ninguna por ahora.
- **Tiempo:** 14:16–14:30.
- **Commits:** este commit.

### 2026-09-29 14:33 — Guía de Tessl y carpeta de setup

- **Tarea:** "necesito documentar como ocupar esto de tessl … así como está docs/agents-setup.md" y "todo lo de setup … debería de ir en un dir más adentro de docs/, e.g. setup".
- **Agente:** Claude Code (Opus 5.5).
- **Qué hizo el agente:** movió la guía de agentes y su imagen a `docs/setup/` y actualizó los enlaces. Escribió `docs/setup/tessl-setup.md` después de comprobar los comandos: la instalación en la documentación oficial de Tessl y el MCP de Tessl en Codex con `codex mcp get tessl`. Agregó el servidor `tessl` a `.codex/config.toml.example`, una sección de Tessl al README y dos palabras al glosario: registro de Tessl y workspace de Tessl.
- **Revisión de la persona:** pidió ver los mensajes de commit antes de subir nada y pidió juntar las guías de configuración en `docs/setup/`.
- **Propuestas cambiadas o descartadas:** ninguna. Subir las ramas quedó en espera hasta que la persona revise los mensajes.
- **Tiempo:** 14:33–14:41.
- **Commits:** este commit y el anterior (mover las guías).

### 2026-09-29 14:42 — Revisión de calidad de las skills

- **Tarea:** medir los tiles, después de que la persona inició sesión en Tessl (`tessl login`).
- **Agente:** Claude Code (Opus 5.5).
- **Qué hizo el agente:** creó el proyecto `aipos` en Tessl y corrió la revisión de calidad de las 4 skills. Notas sobre 100: `glosario-lenguaje-ubicuo` 93, `flujo-entregable` 90, `bitacora-ia` 95 y `readme-entrega` 97. Aplicó la sugerencia de la revisión: la skill del glosario ahora pide comprobar, después de cambiar un término, que no quede el nombre viejo y que la migración y los tests funcionen. Lanzó el eval del tile `lenguaje-ubicuo`.
- **Revisión de la persona:** por confirmar.
- **Propuestas cambiadas o descartadas:** ninguna.
- **Tiempo:** 14:42–14:50. Gastó 40 créditos de Tessl en las revisiones.
- **Commits:** este commit y el anterior (vincular el proyecto).

### 2026-09-29 14:52 — Correcciones de la persona sobre cómo explicar

- **Tarea:** la persona señaló que el agente preguntó "¿Quito la línea Claude-Session?" sin decir qué es ni dónde está, y pidió lo mismo para el código: decir "en el archivo tal, que manda a llamar en la línea tal".
- **Agente:** Claude Code (Opus 5.5).
- **Qué hizo el agente:** agregó dos puntos a la regla de comunicación clara: decir qué es, dónde está y de dónde sale cada cosa, y reportar los problemas de código con archivo, línea, quién llama a qué y qué pasa. Sumó ese punto a un eval. Quitó la línea `Claude-Session` de los 6 commits locales, agregó a la regla de entrega trazable que no se ponen enlaces a sesiones privadas y abrió el PR #2 con el tile `lenguaje-ubicuo`.
- **Revisión de la persona:** decidió quitar `Claude-Session` y pidió "todo explicado en corto, sencillo, al punto". Para los PR dijo "lo que recomiendes": se sube un PR por rama, de a uno.
- **Propuestas cambiadas o descartadas:** el agente ponía la línea `Claude-Session` en cada commit, como pide su configuración → se quitó → el repositorio es público y quien evalúe puede no tener acceso a ese enlace.
- **Tiempo:** 14:52–14:58.
- **Commits:** este commit.

### 2026-09-29 15:00 — Revisar los PR sin otra persona

- **Tarea:** "ojo, soy el único desarrollador … en el futuro puede que haya alguien que me revise los PRs, pero por el momento nadie".
- **Agente:** Claude Code (Opus 5.5), y Codex para la revisión.
- **Qué hizo el agente:** agregó a la skill `flujo-entregable` el paso "Revisar antes de integrar": otro agente revisa el PR, se corrige o se explica cada hallazgo, el resultado queda como comentario del PR y se integra solo con el visto bueno de la persona. Corrió `codex review --base main` sobre el PR 1, que encontró 3 hallazgos. Aplicó los aceptados en el commit `3accfbc` y dejó el resultado como comentario del PR 1.
- **Revisión de la persona:** decidió cada hallazgo. Aceptó el 1 (avisar que hay que correr `tessl install`) y el 3 (el log del eval 1 no entraba a git por `*.log` en `.gitignore`), y descartó el 2.
- **Propuestas cambiadas o descartadas:** Codex proponía pasar los evals a "detalle de venta" → se descartó → los evals usan un proyecto de ejemplo con su propio glosario, a propósito, para medir si el agente sigue el glosario del repo donde trabaja.
- **Tiempo:** 15:00–15:17.
- **Commits:** `3accfbc` (PR 1) y este commit.

### 2026-09-29 15:13 — Resultado del eval del tile lenguaje-ubicuo

- **Tarea:** medir si el tile `lenguaje-ubicuo` ayuda al agente (eval lanzado a las 14:50).
- **Agente:** Claude Code (Opus 5.5). Tessl corrió el eval con el modelo `deepseek-v4.1-flash`.
- **Qué hizo el agente:** revisó el resultado. Sin el tile, 66%; con el tile, 81% (+15 puntos), así que el tile se queda. Por escenario: explicar un error, 40% → 50%; nombrar con el glosario, 91% → 91%; parar ante una palabra nueva, 63% → 100%. El escenario 1 corrió sin el archivo de log (ver la entrada anterior), así que hay que repetirlo. En el escenario 2 el tile no cambia nada: tener el glosario en el repo ya basta para que el agente use sus nombres.
- **Revisión de la persona:** por confirmar.
- **Propuestas cambiadas o descartadas:** ninguna.
- **Tiempo:** 14:50–15:13. Gastó 60 créditos de Tessl.
- **Commits:** este commit.

### 2026-09-29 15:19 — PR 1 integrado y resultados de los evals

- **Tarea:** integrar el PR 1 ("vamos!") y medir los dos tiles.
- **Agente:** Claude Code (Opus 5.5). Tessl corrió los evals con el modelo `deepseek-v4.1-flash`.
- **Qué hizo el agente:** integró el PR 1 en `main` con rebase, puso las ramas siguientes encima del `main` nuevo y abrió el PR 2 (tile `entrega-trazable`) para que Codex lo revise. Resultados de los evals:
  - `lenguaje-ubicuo`, repetido con el log y las correcciones: 74% → 92%. Explicar un error, 67% → 88%; nombrar con el glosario, 92% → 92%; parar ante una palabra nueva, 64% → 100%.
  - `entrega-trazable`: 83% → 99%. Commit y bitácora, 50% → 100%; integrar un entregable, 100% → 98%; README, 100% → 100%. En los dos últimos el agente ya lo hacía bien sin el tile, porque las tareas de prueba daban demasiadas pistas.
  - En los dos tiles las respuestas salieron largas: unas 300 palabras cuando la meta era 100.
- **Revisión de la persona:** aprobó integrar el PR 1. Avisó que otra sesión del agente ("planning") está escribiendo los requisitos del proyecto; esta sesión no la toca.
- **Propuestas cambiadas o descartadas:** ninguna.
- **Tiempo:** 15:19–15:26. Gastó 100 créditos de Tessl en evals.
- **Commits:** PR 1 en `main` (`f9889ab`) y PR 2 abierto (#3).

### 2026-09-29 15:26 — Límite de largo en las explicaciones

- **Tarea:** limitar el largo de las respuestas, que salieron largas en los evals.
- **Agente:** Claude Code (Opus 5.5).
- **Qué hizo el agente:** propuso y, con el visto bueno de la persona, agregó a la regla de comunicación clara: "Una explicación simple cabe en 3 a 5 frases, unas 100 palabras". Relanzó el eval del tile `lenguaje-ubicuo` para medir el cambio.
- **Revisión de la persona:** antes de aprobar preguntó qué era la propuesta ("¿una modificación?"); con la explicación, la aprobó.
- **Propuestas cambiadas o descartadas:** ninguna.
- **Tiempo:** 15:26–15:28.
- **Commits:** este commit.
