# Bitácora de IA — AIPOS

Registro de cómo se usó el agente de código en cada tarea. De aquí salen los puntos 8 a 11 del README.
Las entradas marcadas "reconstruido" se armaron después, desde git y GitHub, y hay que confirmarlas.

## Resumen

| Entregable | Tiempo aprox. | Tareas con agente | Propuestas cambiadas o descartadas |
|---|---|---|---|
| Preparación: agentes, tiles y glosario | 1 h 45 min hasta ahora (12:46–14:30), en curso | 7 | 4 |

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
