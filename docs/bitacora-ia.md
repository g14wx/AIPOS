# Bitácora de IA — AIPOS

Registro de cómo se usó el agente de código en cada tarea. De aquí salen los puntos 8 a 11 del README.
Las entradas marcadas "reconstruido" se armaron después, desde git y GitHub, y hay que confirmarlas.

## Resumen

| Entregable | Tiempo aprox. | Tareas con agente | Propuestas cambiadas o descartadas |
|---|---|---|---|
| Preparación: agentes, tiles y glosario | 8 h 37 min hasta ahora (12:46–17:33, 20:35–20:47 y 21:00–00:38 del 30), en curso | 31 | 19 |
| S-01: spec de arquitectura y planificación de la noche | 2 h 20 min (18:04–18:10, 20:29–21:05, 00:40–01:20 y 01:24–03:00 del 30) | 3 | 9 |
| S-02: ajustes de las specs tras la revisión cruzada | 4 h 33 min (04:59–09:32 del 30, con 5 cortes) | 1 | 3 |
| Requerimientos, diagramas BPMN y tablero AIPOS | 2 h 31 min (15:18–17:49) | 2 | 7 |
| D-01: pipeline de despliegue con etiquetas `release-*` | 5 h 19 min de reloj (04:21–09:40 del 30), con cortes del sistema | 1 | 3 |

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
- **Qué hizo el agente:** agregó a la skill `flujo-entregable` el paso "Revisar antes de integrar": otro agente revisa el PR, se corrige o se explica cada hallazgo, el resultado queda como comentario del PR y se integra solo con el visto bueno de la persona. Corrió `codex review --base main` sobre el PR #2, que encontró 3 hallazgos. Aplicó los aceptados en el commit `f9889ab` y dejó el resultado como comentario del PR #2.
- **Revisión de la persona:** decidió cada hallazgo. Aceptó el 1 (avisar que hay que correr `tessl install`) y el 3 (el log del eval 1 no entraba a git por `*.log` en `.gitignore`), y descartó el 2.
- **Propuestas cambiadas o descartadas:** Codex proponía pasar los evals a "detalle de venta" → se descartó → los evals usan un proyecto de ejemplo con su propio glosario, a propósito, para medir si el agente sigue el glosario del repo donde trabaja.
- **Tiempo:** 15:00–15:17.
- **Commits:** `f9889ab` (PR #2) y este commit.



### 2026-09-29 15:13 — Resultado del eval del tile lenguaje-ubicuo

- **Tarea:** medir si el tile `lenguaje-ubicuo` ayuda al agente (eval lanzado a las 14:50).
- **Agente:** Claude Code (Opus 5.5). Tessl corrió el eval con el modelo `deepseek-v4.1-flash`.
- **Qué hizo el agente:** revisó el resultado. Sin el tile, 66%; con el tile, 81% (+15 puntos), así que el tile se queda. Por escenario: explicar un error, 40% → 50%; nombrar con el glosario, 91% → 91%; parar ante una palabra nueva, 63% → 100%. El escenario 1 corrió sin el archivo de log (ver la entrada anterior), así que hay que repetirlo. En el escenario 2 el tile no cambia nada: tener el glosario en el repo ya basta para que el agente use sus nombres.
- **Revisión de la persona:** por confirmar.
- **Propuestas cambiadas o descartadas:** ninguna.
- **Tiempo:** 14:50–15:13. Gastó 60 créditos de Tessl.
- **Commits:** este commit.



### 2026-09-29 15:18 — Requerimientos, diagramas BPMN y tablero AIPOS

- **Tarea:** "ahorita full levantar requerimientos y crear diagramas de flujos BPMN … crees archivos .md bajo un nuevo dir llamado requerimientos … y vamos dejando las tareas explicadas en trello … si puedes dejar ahí el diagrama mucho que mejor". A mitad de la tarea: "con tags, para diferenciar el back con el front y otra tarea como e.g devops".
- **Agente:** Claude Code (Opus 5.5), con un agente Plan que revisó el borrador y 3 agentes en paralelo que subieron los diagramas y las subtareas a Trello.
- **Qué hizo el agente:** trabajó en otra carpeta del repositorio (worktree `../AIPOS-requerimientos`), porque otra sesión rebasaba ramas en la principal, y puso su trabajo encima de `main` antes del primer commit. Actualizó el glosario y escribió `requerimientos/`: índice con la matriz del PDF, alcance, 12 RF, 13 RNF, entregables y 7 flujos. Dibujó 7 diagramas BPMN con la skill `drawio-skill`: el 01 a mano y los demás con un generador del scratchpad que repite su estilo, con `validate.py` y 2 rondas de revisión visual. Armó el tablero AIPOS: 6 listas, 12 etiquetas de Trello y 27 tarjetas con descripción, subtareas, criterios de aceptación y el diagrama como portada y dentro de la descripción.
- **Revisión de la persona:** eligió "cajero", "venta actual", que un producto repetido suba la cantidad y "crear producto". Aprobó el plan, el estilo del diagrama 01, los 7 diagramas y los commits ("adelante has los commits"). Confirmó el tablero, recordó que la etapa es de planificación, sin código, y pidió mover T-01 y T-02 con su rama anotada.
- **Propuestas cambiadas o descartadas:** una tarjeta por historia de usuario → una tarjeta por área → pedido de la persona para distinguir back, front y DevOps. El agente Plan corrigió el borrador (la secuencia de ventas y de la entrega final, "agregar" con dos significados, "etiqueta" ya usada para el tag de git, caminos de error que faltaban) → se aplicó lo comprobado; su dato de que el tablero no era público se descartó → la API de Trello lo muestra público. En el diagrama 03 la vuelta de "Marca el campo" iba en rojo → pasó a negra, porque no es un error. T-01 y T-02 iban a «En progreso» → quedaron en «En revisión» → su rama ya tenía el PR #9 abierto. Pasar el PR por la revisión de Codex → no se pide → decisión de la persona ("no le pidas revision a codex, solo lanza"). El PR #13 chocó con `main` después de los PR #9 y #12 → se cerró y se abrió uno nuevo desde `main` con los mismos 4 commits → decisión de la persona, para no reescribir commits ya subidos.
- **Tiempo:** 15:18–16:56.
- **Commits:** este commit y los 3 anteriores de la rama `docs/requerimientos-2`, que entran con el PR que reemplaza al #13, sin revisión de Codex.

### 2026-09-29 15:19 — PR #2 integrado y resultados de los evals

- **Tarea:** integrar el PR #2 ("vamos!") y medir los dos tiles.
- **Agente:** Claude Code (Opus 5.5). Tessl corrió los evals con el modelo `deepseek-v4.1-flash`.
- **Qué hizo el agente:** integró el PR #2 en `main` con rebase, puso las ramas siguientes encima del `main` nuevo y abrió el PR #3 (tile `entrega-trazable`) para que Codex lo revise. Resultados de los evals:
  - `lenguaje-ubicuo`, repetido con el log y las correcciones: 74% → 92%. Explicar un error, 67% → 88%; nombrar con el glosario, 92% → 92%; parar ante una palabra nueva, 64% → 100%.
  - `entrega-trazable`: 83% → 99%. Commit y bitácora, 50% → 100%; integrar un entregable, 100% → 98%; README, 100% → 100%. En los dos últimos el agente ya lo hacía bien sin el tile, porque las tareas de prueba daban demasiadas pistas.
  - En los dos tiles las respuestas salieron largas: unas 300 palabras cuando la meta era 100.
- **Revisión de la persona:** aprobó integrar el PR #2. Avisó que otra sesión del agente ("planning") está escribiendo los requisitos del proyecto; esta sesión no la toca.
- **Propuestas cambiadas o descartadas:** ninguna.
- **Tiempo:** 15:19–15:26. Gastó 100 créditos de Tessl en evals.
- **Commits:** PR #2 en `main` (`f9889ab`) y PR #3 abierto.



### 2026-09-29 15:25 — Revisión de Codex del PR #3

- **Tarea:** revisar el PR #3 (tile `entrega-trazable`) con otro agente antes de integrarlo.
- **Agente:** Codex revisó con `codex review --base main`; Claude Code (Opus 5.5) recomendó qué hacer y aplicó los cambios.
- **Qué hizo el agente:** Codex encontró 5 hallazgos. Tres eran de la skill `flujo-entregable`: el plan B mezclaba dos casos, el mensaje del merge quedaba en inglés y la etiqueta podía caer en otro commit. Dos eran del proyecto de ejemplo del eval del README: el resumen de su bitácora no cuadraba y la bitácora contradecía al historial. Claude Code los aplicó en el commit `797bf4b` y dejó el resultado como comentario del PR #3.
- **Revisión de la persona:** aceptó los 5 hallazgos.
- **Propuestas cambiadas o descartadas:** ninguna descartada.
- **Tiempo:** 15:25–15:44.
- **Commits:** `797bf4b` (PR #3) y este commit.



### 2026-09-29 15:26 — Límite de largo en las explicaciones

- **Tarea:** limitar el largo de las respuestas, que salieron largas en los evals.
- **Agente:** Claude Code (Opus 5.5).
- **Qué hizo el agente:** propuso y, con el visto bueno de la persona, agregó a la regla de comunicación clara: "Una explicación simple cabe en 3 a 5 frases, unas 100 palabras". Relanzó el eval del tile `lenguaje-ubicuo` para medir el cambio.
- **Revisión de la persona:** antes de aprobar preguntó qué era la propuesta ("¿una modificación?"); con la explicación, la aprobó.
- **Propuestas cambiadas o descartadas:** ninguna.
- **Tiempo:** 15:26–15:28.
- **Commits:** este commit.



### 2026-09-29 15:28 — Resultado del eval con el límite de largo

- **Tarea:** medir si la regla nueva (3 a 5 frases) acorta las respuestas.
- **Agente:** Claude Code (Opus 5.5). Tessl corrió el eval con el modelo `deepseek-v4.1-flash`.
- **Qué hizo el agente:** revisó el resultado. Con el tile, 90%, contra 92% en la corrida anterior; con una sola corrida, esa diferencia es ruido. Las respuestas bajaron de unas 300 palabras a unas 200, pero siguen arriba de la meta de 100.
- **Revisión de la persona:** por confirmar.
- **Propuestas cambiadas o descartadas:** ninguna.
- **Tiempo:** 15:28–15:32. Gastó 30 créditos de Tessl.
- **Commits:** este commit.



### 2026-09-29 15:46 — PR #3 integrado y revisión de Codex del PR #4

- **Tarea:** integrar el PR #3 ("adelante!") y revisar el PR #4 (guías de configuración) con otro agente antes de integrarlo.
- **Agente:** Codex revisó con `codex review --base main`; Claude Code (Opus 5.5) integró el PR #3, recomendó qué hacer con cada hallazgo y aplicó los cambios.
- **Qué hizo el agente:** integró el PR #3 en `main` con rebase y abrió el PR #4. Codex encontró 2 hallazgos en el PR #4: a la guía de Tessl le faltaba pedir que se copien las plantillas antes de verificar el MCP, y la entrada de la bitácora de ese trabajo estaba solo en el último de sus dos commits. Claude Code aplicó el primero en el commit `08a1d20` y aclaró la regla de entrega trazable y la skill `bitacora-ia`: si una tarea ocupa varios commits, la entrada va en el último y nombra los anteriores.
- **Revisión de la persona:** aceptó el hallazgo 1 y descartó el 2.
- **Propuestas cambiadas o descartadas:** Codex proponía repartir la entrada reescribiendo dos commits ya subidos → se descartó → nuestra regla prohíbe reescribir commits ya subidos; en su lugar se aclaró la regla.
- **Tiempo:** 15:46–16:00.
- **Commits:** `08a1d20` (PR #4) y este commit.

### 2026-09-29 16:00 — Revisión de Codex del PR #7 y corrección de la bitácora

- **Tarea:** revisar el PR #7 (ajustes a los tiles) con otro agente antes de integrarlo.
- **Agente:** Codex revisó con `codex review --base main`; Claude Code (Opus 5.5) recomendó qué hacer y aplicó los cambios.
- **Qué hizo el agente:** Codex encontró 3 hallazgos. La comprobación al cambiar un término pedía algo imposible, porque las migraciones siempre nombran el término viejo. La bitácora decía "PR 1, 2 y 3" y citaba hashes de ramas que dejaron de existir al integrar con rebase. Y una entrada estaba fuera de orden. Claude Code hizo que la comprobación busque solo en el código y los tests, corrigió en esta bitácora los números de PR (#2, #3 y #4) y los hashes (`f9889ab`, `797bf4b` y `08a1d20`, los de `main`), movió la entrada de las 15:25 a su lugar e hizo que la skill `bitacora-ia` pida citar el número del PR.
- **Revisión de la persona:** aceptó los 3 hallazgos.
- **Propuestas cambiadas o descartadas:** ninguna descartada.
- **Tiempo:** 16:00–16:17.
- **Commits:** este commit (PR #7).

### 2026-09-29 16:02 — Dependabot y los PR de Vue 3

- **Tarea:** decidir qué hacer con los PR #5 y #6 que abrió Dependabot.
- **Agente:** Claude Code (Opus 5.5).
- **Qué hizo el agente:** al integrar el PR #4 aparecieron los PR #5 (`vue` 2.7.16 → 3.0.0) y #6 (`vuetify` 2.7.2 → 3.0.0), que Dependabot abrió sobre el proyecto de ejemplo del eval del README. Con el frontend real, que la prueba exige en Vue 2, va a pasar lo mismo. Revisó la documentación de GitHub: `ignore` también frena los PR de seguridad, y `exclude-paths` no. Cerró #5 y #6 con un comentario y agregó `.github/dependabot.yml`, que ignora las versiones mayores de `vue` y `vuetify` y apaga los PR de versiones normales; los de seguridad siguen llegando. Antes de subirlo integró el PR #7. También avisó que la rama `docs/requerimientos` de la otra sesión salió de una versión vieja de la rama del PR #7 y debe ponerse encima de `main` antes de su primer commit.
- **Revisión de la persona:** eligió cerrar los PR y configurar Dependabot, y aprobó integrar el PR #7.
- **Propuestas cambiadas o descartadas:** ninguna.
- **Tiempo:** 16:02–16:20.
- **Commits:** este commit.

### 2026-09-29 16:32 — Tiles mysql-sequelize-procedimientos y vue2-vuetify2-vite

- **Tarea:** "no perdamos el tiempo, necesito esto antes de media hora": terminar los tiles que faltaban y publicarlos.
- **Agente:** Claude Code (Opus 5.5), con dos agentes auxiliares que escribieron un tile cada uno, en paralelo.
- **Qué hizo el agente:** publicó en el registro de Tessl los tiles `lenguaje-ubicuo` y `entrega-trazable`, como públicos. Los agentes auxiliares escribieron los tiles `mysql-sequelize-procedimientos` y `vue2-vuetify2-vite`, en inglés, con una regla, 2 skills y 2 evals cada uno, a partir de los datos ya verificados. Claude Code revisó sus dudas: comprobó en npm que `vuetify@2.7.2` carga el paquete completo (`dist/vuetify.js`), y cambió el alias de Vite a `{ find: /^vue$/ }`, porque la forma de texto también reescribía los imports que empiezan con `vue/`. Agregó los dos tiles a `tessl.json` y a la guía de Tessl.
- **Revisión de la persona:** pidió todo en media hora. Tessl avisó que la cuenta agotó sus 1.000 créditos del mes, así que los tiles nuevos quedaron sin evals ni revisión de calidad.
- **Propuestas cambiadas o descartadas:** ninguna.
- **Tiempo:** 16:32–16:46.
- **Commits:** este commit y el anterior (tile `mysql-sequelize-procedimientos`).

### 2026-09-29 16:34 — Grafo del proyecto con Graphify (T-03)

- **Tarea:** "necesito agregarle https://github.com/Graphify-Labs/graphify a este proyecto que ya tiene tessl, entonces, necestio saber donde puede encajar" y "como un paso para poder ejecutar x tarea, y actualizarla a la finalizacion de una tarea". Es la tarjeta T-03 del tablero AIPOS.
- **Agente:** Claude Code (Opus 5.5).
- **Qué hizo el agente:** leyó el código de Graphify 0.9.72 y armó el plan en modo plan. Pasó la tarea por el flujo del tile `spec-driven-development`: requisitos, `specs/grafo-del-proyecto.spec.md` (la primera spec del proyecto), `spec-verification` y `work-review`. Creó el tile `grafo-del-proyecto` (una regla y un eval con un `graphify` falso), el hook de git `.githooks/pre-commit` y el hook de Claude Code en `.claude/settings.json`, con 8 pruebas en `tests/` que pasan. Sumó a `AGENTS.md` el arranque de un clon nuevo, escribió `docs/setup/graphify-setup.md` y actualizó el flujo 06 con su diagrama BPMN, la definición de terminado, el glosario y la guía de Tessl. Creó la tarjeta T-03 y corrigió el total de horas de `requerimientos/04-entregables.md`: las filas sumaban 23, no 23.5. En la máquina de la persona quitó Spec Kit de GitHub (`specify-cli` 0.12.17.dev0), que ningún proyecto usaba, y actualizó Graphify de la 0.9.11 a la 0.9.72. Quedan pendientes correr el eval, que espera los créditos de Tessl, y subir el diagrama nuevo a la tarjeta R-03 después del merge.
- **Revisión de la persona:** pidió primero solo un plan ("no toques nada") y esperar a que terminara la otra sesión. Eligió el grafo en git, el nombre "grafo del proyecto", el tile de specs de Tessl en lugar de Spec Kit, la regla más un hook de git `pre-commit`, y sumar el grafo al proceso escrito. Paró al agente cuando la instalación de Graphify escribió en `CLAUDE.md` y `AGENTS.md` ("para, es una spec nueva esto?"), preguntó por la tarjeta ("pero, ya tiene su tarjeta??") y pidió que todo funcione desde un clon: "clonar, y conectarlo a claude code o codex, y empezar a programar con los guardrials". Confirmó los requisitos, el glosario y el texto de T-03, aprobó la spec dos veces y validó el trabajo.
- **Propuestas cambiadas o descartadas:** dejar el grafo fuera de git → va a git (`graph.json` y `GRAPH_REPORT.md`) → motivo por confirmar. Instalar la skill con `graphify install --project`, que según el agente solo copiaba la skill → también escribió en `CLAUDE.md` y `AGENTS.md`; se deshizo y no se usa la skill → el agente había leído `install()` y no `_project_install` en el código de Graphify. Hook de Claude Code solo en la máquina de la persona → va en git, con un chequeo para cuando falta Graphify → todo tiene que funcionar desde un clon. "No instales Graphify" → "pregunta e instálalo si dice que sí" → la misma razón. Flujo 06 sin los pasos de specs → los nombra → la persona pidió que no se pierda ningún paso del proceso de specs. Empezar sin tarjeta → se creó T-03 → el flujo 06 empieza con una tarjeta.
- **Tiempo:** 16:34–22:46. La planeación tuvo pausas mientras terminaba la otra sesión (sus horas exactas están por confirmar). La implementación fue de 21:40 a 22:46.
- **Commits:** este commit y los 12 anteriores de la rama `chore/grafo-del-proyecto`: la spec y su ajuste, la tarjeta T-03, las reglas de ignorar, el hook de git, el hook de Claude Code, el tile, el arranque, la guía, el flujo 06, el grafo y la corrección de "hook" a secas.

### 2026-09-29 16:48 — Revisión de Codex del PR #9

- **Tarea:** revisar el PR #9 (tiles de MySQL y de Vue 2) con otro agente antes de integrarlo.
- **Agente:** Codex revisó con `codex review --base main`; Claude Code (Opus 5.5) recomendó qué hacer y aplicó los cambios.
- **Qué hizo el agente:** Codex encontró 6 fallas en los ejemplos de las skills y en los evals. Un ítem `null` dejaba colgada la petición en Express 4. El cliente de Vue no leía el mensaje de error del backend (`data.error`). La validación del precio aceptaba valores que no caben en `DECIMAL(10,2)`. El manejador de errores del eval de MySQL convertía en 500 los 400 y 413 del parser de JSON. El ejemplo de `VITE_API_URL` se saltaba el proxy de Vite. Y el eval de Vue no exigía el `package-lock.json`. Claude Code corrigió las 6.
- **Revisión de la persona:** aceptó los 6 hallazgos, y antes decidió publicar los tiles nuevos solo después de esta revisión.
- **Propuestas cambiadas o descartadas:** ninguna descartada.
- **Tiempo:** 16:48–17:10.
- **Commits:** este commit (PR #9).

### 2026-09-29 17:11 — PR #9 integrado y tiles publicados

- **Tarea:** integrar el PR #9 y publicar los dos tiles nuevos ("ok"), y dejarlo anotado en un PR aparte ("ok vamos").
- **Agente:** Claude Code (Opus 5.5).
- **Qué hizo el agente:** integró el PR #9 en `main` con rebase y publicó en el registro de Tessl `mysql-sequelize-procedimientos` y `vue2-vuetify2-vite`. Los 4 tiles quedaron públicos y pasaron la moderación y el análisis de seguridad de Tessl. Notas de calidad: `lenguaje-ubicuo` 95% y `entrega-trazable` 97%; los dos nuevos quedaron sin nota porque la cuenta agotó sus créditos del mes. No actualizó la carpeta principal del proyecto: ahí había un cambio sin subir en `tessl.json`, de la otra sesión, que instaló `tessl-labs/spec-driven-development`.
- **Revisión de la persona:** aprobó integrar y publicar, y pidió dejarlo anotado ya en lugar de esperar al próximo cambio.
- **Propuestas cambiadas o descartadas:** ninguna.
- **Tiempo:** 17:11–17:14.
- **Commits:** este commit.

### 2026-09-29 17:14 — Dependabot volvió a abrir PR de Vue 3

- **Tarea:** decidir qué hacer con los PR #10 y #11 que abrió Dependabot.
- **Agente:** Claude Code (Opus 5.5).
- **Qué hizo el agente:** Dependabot abrió los PR #10 y #11 (`vue` y `vuetify` a 3.0.0) sobre el proyecto de ejemplo del eval del tile `vue2-vuetify2-vite`, aunque `.github/dependabot.yml` debía impedirlo. Eran PR de seguridad automáticos, abiertos por 6 alertas de Vue 2 y Vuetify 2 en los proyectos de ejemplo de los evals. Apagó los PR de seguridad automáticos del repositorio (las alertas siguen visibles), cerró #10 y #11, marcó las 6 alertas como no usadas y corrigió el comentario de `.github/dependabot.yml`.
- **Revisión de la persona:** eligió apagar los PR de seguridad automáticos.
- **Propuestas cambiadas o descartadas:** el agente había dicho que `ignore` en `dependabot.yml` también frenaba los PR de seguridad → no los frenó en una carpeta nueva → se apagaron los PR automáticos, y las alertas de Vue 2 y Vuetify 2 se revisan a mano.
- **Tiempo:** 17:14–17:17.
- **Commits:** este commit (PR #12).

### 2026-09-29 17:20 — Tile spec-driven-development en `tessl.json`

- **Tarea:** "vamos a ocupar ese tile tessl-labs/spec-driven-development, para poder hacer SDD en este proyecto". La persona lo instaló con `tessl install tessl-labs/spec-driven-development` y aprobó ("adelante!") traer el `main` nuevo, conservar su cambio y subirlo en su propia rama con su PR.
- **Agente:** Claude Code (Opus 5.5).
- **Qué hizo el agente:** guardó el cambio de `tessl.json` con `git stash` y trajo el `main` nuevo con un avance directo, porque `git pull` con rebase se negó por el cambio sin commit de `.mcp.json.example`. Juntó en `tessl.json` los 4 tiles del proyecto y `tessl-labs/spec-driven-development` 2.0.1, corrió `tessl install` (5 tiles, 8 reglas activas) y abrió la rama `chore/tessl-spec-driven` en un worktree aparte. El tile suma las reglas `spec-before-code`, `one-question-at-a-time` y `spec-format-compliance` y 4 skills.
- **Revisión de la persona:** instaló el tile y aprobó el plan. Revisión de Codex antes de integrar: por confirmar.
- **Propuestas cambiadas o descartadas:** ninguna.
- **Tiempo:** 17:20–17:23.
- **Commits:** este commit.

### 2026-09-29 17:29 — PR #15 y #14 integrados, enlaces en el tablero AIPOS y cierre de R-00

- **Tarea:** "ok entonces, que estamos esperando?": integrar los PR pendientes y después cambiar las rutas de las tarjetas por enlaces de GitHub, como la persona había aprobado ("ok").
- **Agente:** Claude Code (Opus 5.5). Tres agentes de Claude Code con Sonnet 5.5 copiaron las descripciones nuevas en Trello.
- **Qué hizo el agente:** integró los PR #15 y #14 con rebase, lo único que permite la regla de `main`, y puso al día la carpeta principal. Con un script cambió por enlaces de GitHub las 104 rutas de las 27 tarjetas que existen en `main`; la de `README.md:5-6` apunta al commit `df442d5` para que la línea no se mueva. Revisó que los 28 enlaces abran y que Trello guardara las 27 descripciones tal cual. Corrigió la rama vieja `docs/requerimientos` en R-01, R-02 y B-01. Al revisar los criterios de R-00 agregó a la matriz las 2 partes del PDF que no tenían fila: el propósito de la evaluación y la revisión técnica.
- **Revisión de la persona:** R-01 a R-04 no tienen subtareas ni criterios de aceptación porque son de consulta. Entre aclararlo en el glosario o darles esas listas, eligió aclararlo en "tarjeta". También eligió integrar este PR sin revisión de Codex.
- **Propuestas cambiadas o descartadas:** ninguna: la persona eligió las opciones que proponía el agente.
- **Tiempo:** 17:29–17:49.
- **Commits:** este commit y los 2 anteriores de la rama `docs/cierre-requerimientos`: las filas de la matriz y la aclaración del glosario.

### 2026-09-29 17:30 — Caveman en modo lite en AIPOS

- **Tarea:** dejar el plugin de Claude Code caveman en modo lite, como eligió la persona al crear el tile `lenguaje-ubicuo` ("adelante").
- **Agente:** Claude Code (Opus 5.5), con la skill de configuración de Claude Code.
- **Qué hizo el agente:** agregó `CAVEMAN_DEFAULT_MODE=lite` en `.claude/settings.local.json`, la configuración local del proyecto, que no va a git. Comprobó que Claude Code pasa la variable y que el hook de arranque del caveman responde `level: lite`. En los demás proyectos sigue en `full`.
- **Revisión de la persona:** eligió aplicarlo solo en AIPOS.
- **Propuestas cambiadas o descartadas:** ninguna.
- **Tiempo:** 17:30–17:33.
- **Commits:** este commit (solo la entrada; la configuración es local).

### 2026-09-29 20:35 — Tile mysql-sequelize-procedimientos 0.1.1

- **Tarea:** la otra sesión, que escribe `specs/arquitectura.spec.md`, encontró 4 choques entre el tile y `requerimientos/`, y la persona decidió actualizar el tile antes de empezar la app.
- **Agente:** Claude Code (Opus 5.5).
- **Qué hizo el agente:** le explicó a la otra sesión el porqué de cada elección del tile. Express 4 y la carpeta `db/procedures/` fueron costumbre, y los códigos 400/409 no tenían una razón de fondo. El `.sql` sin `DELIMITER` sí era a propósito: un procedimiento creado por root no lo puede reemplazar después el usuario de la app. Actualizó el tile a la versión 0.1.1: Express 5, 422 para el `SIGNAL 45000`, un `.sql` con `DELIMITER $$` que también corre con el cliente `mysql`, una migración que manda solo el bloque `CREATE PROCEDURE … END`, el aviso de usar el usuario de la app y no root, y la carpeta según el glosario del proyecto. Probó con node que la migración extrae bien el bloque.
- **Revisión de la persona:** decidió actualizar el tile antes de la app.
- **Propuestas cambiadas o descartadas:** el tile asumía Express 4, respuestas 400/409, un `.sql` sin `DELIMITER` y la carpeta `db/procedures/` → se alineó con los requerimientos → mandan la spec y los requerimientos, y el riesgo del definidor queda cubierto con la instrucción de usar el usuario de la app.
- **Tiempo:** 20:35–20:45.
- **Commits:** este commit.

### 2026-09-29 20:45 — Revisión de Codex del PR #17

- **Tarea:** revisar el PR #17 (tile `mysql-sequelize-procedimientos` 0.1.1) con otro agente antes de integrarlo.
- **Agente:** Codex revisó con `codex review --base origin/main`; Claude Code (Opus 5.5) recomendó qué hacer y aplicó los cambios.
- **Qué hizo el agente:** Codex encontró 3 hallazgos. La extracción del bloque se confundía con un comentario que mencionara "CREATE PROCEDURE". El eval 1 no exigía el `.sql` para el cliente `mysql`. Y la comprobación final se marcaba sola con el comentario de la plantilla. Claude Code hizo que la migración lea solo lo que está entre la línea `DELIMITER $$` y el `$$` final, y lo probó con node, también con saltos de línea de Windows y `delimiter` en minúsculas. Sumó al eval 1 el pedido del script reproducible y un criterio que lo exige, y cambió la comprobación para que busque solo líneas `DELIMITER`.
- **Revisión de la persona:** aceptó los 3 hallazgos.
- **Propuestas cambiadas o descartadas:** ninguna descartada.
- **Tiempo:** 20:45–20:47.
- **Commits:** este commit (PR #17).

### 2026-09-29 21:00 — Repo reproducible desde un clon limpio, y cambios en S-01 y D-01

- **Tarea:** decidir quién toma S-01. El agente propuso tomarla en esta sesión porque "tengo a mano lo que se decidió en los tiles", y la persona respondió que todo tiene que ser "reproducible desde cualquier otra pc con claude code o codex, … ese es todo el punto de estar creando las tiles, los .md".
- **Agente:** Claude Code (Opus 5.5). Codex CLI contestó la prueba en el clon limpio.
- **Qué hizo el agente:** clonó el repo en una carpeta temporal y corrió `tessl install`: se instalaron los 5 tiles y sus 12 skills para Claude Code y Codex, sin cambios en git, y `codex exec` contestó bien 3 preguntas que solo responden los tiles. Encontró lo que dependía de esta sesión o de esta máquina: una subtarea de S-01 que nombraba a esta sesión, el MCP de draw.io sin commit en `.mcp.json.example` (entró en el PR #18) y el PDF, que `devdoc/` deja fuera a propósito. En el tablero AIPOS, esa subtarea pasó a «Revisión del borrador por el agente revisor (Codex)», y S-01 sumó para `AGENTS.md` la regla de no depender de una sesión ni de una máquina, con el OK de la sesión de planificación. De D-01 quitó la IP del runner de GitLab y la frase de que al servidor solo se entra como `root`, porque el tablero es público. Como Trello guarda las descripciones viejas en el historial público, copió D-01 y borró la original (enlace nuevo: <https://trello.com/c/ebqouqpL>).
- **Revisión de la persona:** preguntó por qué cambiar la subtarea y si convenía poner la regla en `AGENTS.md`, y aprobó cada cambio en el tablero AIPOS ("adelante", "confírmalo con @planning y dale"). Preguntó si hacía falta un PR: las tarjetas no están en git, pero esta entrada sí.
- **Propuestas cambiadas o descartadas:** tomar S-01 en esta sesión porque tenía el contexto → la persona lo descartó → una sesión nueva la toma desde un clon, y si pregunta algo ya decidido, falta escribirlo en el repo.
- **Tiempo:** 21:00–22:55.
- **Commits:** este commit.

### 2026-09-29 22:49 — Revisión de Codex del PR #19

- **Tarea:** revisar el PR #19 (tarjeta T-03, grafo del proyecto) con otro agente antes de integrarlo.
- **Agente:** Codex revisó con `codex review --base origin/main`, en un worktree del PR; Claude Code (Opus 5.5) propuso las correcciones y las aplicó.
- **Qué hizo el agente:** la primera corrida de Codex no revisó nada. El worktree no tenía `.tessl/RULES.md`, así que el arranque nuevo de `AGENTS.md` le hizo correr `tessl install` y pedir una sesión nueva. En la segunda corrida, Codex encontró 4 hallazgos P2: un clon con `.tessl/RULES.md` viejo no reinstalaba los tiles nuevos; solo se revisaba que existiera `graphify`, no su versión; las apps de git como WebStorm no ven `~/.local/bin`; y la marca de commit del grafo nombraba el commit anterior. Claude Code sumó un quinto hallazgo: el arranque dejaba parado a `codex review` en un clon nuevo. Actualizó la spec y corrigió los cinco, con 5 pruebas nuevas; las 13 pruebas pasan. Probó que `tessl install` actualiza la fecha de `.tessl/RULES.md`, así que el chequeo nuevo no pide reinstalar en cada sesión, y vio que su propia copia instalada de la regla estaba vieja.
- **Revisión de la persona:** aprobó corregir los 5 hallazgos en este PR y aprobó la spec actualizada.
- **Propuestas cambiadas o descartadas:** ninguna descartada.
- **Tiempo:** 22:49–23:17.
- **Commits:** este commit y los 5 anteriores (la spec con los hallazgos y las cuatro correcciones), en el PR #19.

### 2026-09-29 23:19 — Segunda revisión de Codex del PR #19

- **Tarea:** revisar otra vez el PR #19 con Codex, después de las correcciones de la primera revisión.
- **Agente:** Codex revisó con `codex review --base origin/main`, en el worktree del PR; Claude Code (Opus 5.5) propuso las correcciones y las aplicó.
- **Qué hizo el agente:** Codex confirmó primero el arreglo del arranque: vio archivos más nuevos que `.tessl/RULES.md`, corrió `tessl install` y siguió sin pedir una sesión nueva. Encontró 5 hallazgos: 2 P1 de Windows (CRLF en el hook de git y en `graphify --version`) y 3 P2 (el reporte decía "va al día" después de una falla, los merges no corrían el hook de git, y el hook de Claude Code no funcionaba en PowerShell). Claude Code verificó en la documentación de Claude Code que en Windows los hooks corren con Git Bash, y en la web que el botón de GitHub no respeta los drivers de merge de `.gitattributes`. Corrigió los cuatro primeros con 5 pruebas nuevas; las 18 pruebas pasan. Probó con Apple Git 2.54.0 que git no mete en el merge commit lo que agrega `pre-merge-commit`, así que ese hook detiene el merge y pide `git commit --no-edit`. El quinto quedó explicado, con Git for Windows como requisito en la guía. La regla, la guía y el flujo 05 piden poner la rama al día en local antes de integrar un PR.
- **Revisión de la persona:** aprobó corregir del 1 al 4 y explicar el 5, aprobó la spec y aceptó que un merge que cambia el grafo se detenga y pida `git commit --no-edit`.
- **Propuestas cambiadas o descartadas:** un `pre-merge-commit` que solo agregara el grafo, como pedía Codex → detiene el merge y pide `git commit --no-edit` → git no mete en el merge commit lo que ese hook agrega. Hacer el hook de Claude Code independiente del shell → se explica sin cambiarlo → en Windows corre con Git Bash, y el cambio rompía la búsqueda en `~/.local/bin`.
- **Tiempo:** 23:19–00:03 del 30.
- **Commits:** este commit y los 5 anteriores (la spec, los saltos de línea LF, la versión sin `\r`, el reporte desactualizado y el hook de git `pre-merge-commit` con el glosario), en el PR #19.

### 2026-09-30 00:36 — Cierre del PR #19

- **Tarea:** "ok, dejemos esto como esta, ya tomo mucho tiempo, debemos empezar a desarollar, pero no tu, si no, futuras sessiones de claude code" y "esto funciona al menos en bash? e.g macos y linux?".
- **Agente:** Claude Code (Opus 5.5).
- **Qué hizo el agente:** la tercera revisión de Codex se cortó a los 30 minutos, que era el límite del comando, sin respuesta final: estaba leyendo `graphify-out/graph.json`. El agente corrió las 18 pruebas en un contenedor de Debian (aarch64, bash 5.2.37, `sh` = `dash`, git 2.47.3), y pasan todas; `update-sin-cambios.test.sh` se saltó porque el contenedor no tenía Graphify. Después de este commit quedan integrar el PR #19 en `main` con rebase, subir el diagrama nuevo del flujo 06 a la tarjeta R-03 y pasar T-03 a "Hecho".
- **Revisión de la persona:** decidió no repetir la revisión de Codex porque ya había tomado mucho tiempo. Por eso la segunda ronda de correcciones no tiene revisión de otro agente. Pidió comprobar que funcione en bash, en macOS y en Linux, y aprobó integrar el PR.
- **Propuestas cambiadas o descartadas:** repetir la revisión de Codex sin `graphify-out/` y con 60 minutos → no se repite → la persona prefirió ese tiempo para empezar a desarrollar.
- **Tiempo:** 00:36–00:38 del 30.
- **Commits:** este commit, en el PR #19.

### 2026-09-29 18:04 — Planificación de S-01 (sin commit)

- **Tarea:** la persona preguntó cómo darle al proyecto su «constitución» con el tile de SDD, y después pidió empezar la spec de arquitectura con ayuda de otra sesión del agente.
- **Agente:** Claude Code (modelo por confirmar).
- **Qué hizo el agente:** 18:04–18:10: explicó que el tile no trae constitución y que eso se reparte entre las reglas y una spec de arquitectura; dos respuestas salieron en inglés y la persona pidió «en español» y «en pocas palabras». 20:29–20:57: juntó lo ya decidido y encontró 4 choques con los tiles (Express 4 o 5, 400/409 o 422, `DELIMITER`, y `procedures` o `procedimientos`); la otra sesión aceptó que mandan los requerimientos y abrió el PR #17, integrado a las 20:58. 20:57–21:05: puso en B-01 que depende de S-01.
- **Revisión de la persona:** eligió las entradas «spec» y «SDD» y Vitest, aprobó la tarjeta S-01 y el punto «Su spec está aprobada» de la definición de terminado, y aprobó la subtarea de la spec en P-01, P-04, V-01 y V-04. Recordó que esa sesión solo planifica y la detuvo («stop») cuando empezó a escribir la spec. Decidió que las specs las escriben las sesiones que toman las tarjetas, y que las ramas extra las decide la sesión que toma la tarjeta.
- **Propuestas cambiadas o descartadas:** escribir la spec en la sesión de planificación → la persona la detuvo y el agente borró su borrador, que no tenía commit → esa sesión solo planifica. Después, la persona pidió que nada dependa de una sesión ni de una máquina y S-01 sumó cuatro reglas para `AGENTS.md`.
- **Tiempo:** 18:04–18:10, 20:29–21:05.
- **Commits:** ninguno; PR #17 para el tile.

### 2026-09-30 00:40 — Planificación de la noche: una tarjeta por workflow (sin commit)

- **Tarea:** la persona pidió avanzar todo lo posible del tablero AIPOS con poco tiempo: tomar las tarjetas de "Por hacer" y después las del "Backlog", con un workflow por tarjeta, probando todo, abriendo PR sin borrar ramas y siguiendo SDD. También pidió documentar la API con Swagger.
- **Agente:** Claude Code en la sesión de planificación (modelo por confirmar).
- **Qué hizo el agente:** revisó GitHub, el repo, las herramientas y el tablero (solo lectura), y armó el plan de la noche: orden de las tarjetas, un workflow por tarjeta con tres agentes, worktrees separados, la tarjeta nueva A-01 (Swagger) y el alcance de D-01 con servidor.
- **Revisión de la persona:** decidió, entre las 00:40 y las 01:20: las 7 specs se escriben primero y las aprueba en un solo lote; el agente integra los PR solo, si las pruebas pasan y los hallazgos de Codex quedan corregidos o explicados, y el PR de `ProductionEnv` a `main` lo integra ella; D-01 completo, con backend, pantalla y MySQL en Docker en el servidor de aipos.salsalvador.io y el backend en `aipos-back.salsalvador.io`; de las preguntas abiertas se adoptan las propuestas 1, 3, 4, 5 y 6, y la 2 cambia (la venta actual se guarda en el navegador y se vacía al registrar); una rama y un PR por tarjeta (01:12); comentarios "Update" cortos con la hora en cada cosa importante (01:05); Sonnet 5.5 en todos los agentes de los workflows (01:14); la pantalla con la skill `impeccable`, animaciones Lottie y su paleta.
- **Propuestas cambiadas o descartadas:** «la venta actual se pierde al recargar en la versión 1» → se guarda en el navegador (`localStorage`) → lo decidió la persona el 2026-09-30. Workflows con Opus → Sonnet 5.5 → lo pidió la persona a las 01:14. Un solo PR por entregable → un PR por tarjeta hacia la rama del entregable, y otro PR del entregable hacia `ProductionEnv` → lo pidió la persona a las 01:12.
- **Tiempo:** 00:40–01:20.
- **Commits:** ninguno.

### 2026-09-30 01:24 — S-01: spec de arquitectura

- **Tarea:** tomar la tarjeta S-01 y escribir la spec de arquitectura y los documentos que pide la tarjeta, en la rama `docs/spec-arquitectura`, sin abrir PR: la persona aprueba las 7 specs de la noche en un solo lote.
- **Agente:** Claude Code (Sonnet 5.5) en un workflow. Codex como agente revisor.
- **Qué hizo el agente:** leyó la tarjeta, `requerimientos/`, el glosario, los tiles y consultó el grafo del proyecto. Comprobó las versiones con `npm view` y probó en local, en dos proyectos temporales, que Vitest 5.0.2 corre un backend en CommonJS (con `import` y con `require`) y componentes de Vue 2 con `@vitejs/plugin-vue2`, `@vue/test-utils` 1 y Vuetify 2.7.2; que `lottie-web` no carga en jsdom (se sustituye con `vi.mock`); y que ESLint 10 funciona con `flat/vue2-recommended` y con una configuración `.mjs` para el backend en CommonJS. Consultó el MCP `design-patterns` para las capas, los errores, la validación, la fachada de la API, el dinero, la venta actual, Lottie y la salud, y anotó el patrón de cada decisión (Front Controller y Memento como «el más cercano»; Repository y Data Mapper descartados). Escribió `specs/arquitectura.spec.md` (versiones fijas, carpetas, capas, formato de error, límites, CORS, helmet, `/api/salud`, MySQL 8.4 con puerto y base de prueba, dinero, frontend, paleta con contraste, Lottie, pruebas, Git). Agregó «SDD», «rama de tarjeta», «issue de GitHub», «prueba en local» y «base de prueba» al glosario, y cambió «venta actual». Puso al día RNF-02, RNF-08, RNF-09 y RNF-13, la definición de terminado, las preguntas abiertas 1 a 6 con su «qué cambia» (RN-02, RN-05, RN-06, RF-02, RF-04, RF-09, RF-10, RF-12, flujos 03 y 04), el flujo 05 (ramas de tarjeta) y `AGENTS.md`. Exportó los PNG de los flujos 03, 05 y 06. Escribió dos pruebas de shell, `tests/arquitectura/spec-arquitectura.test.sh` y `tests/arranque/agents-md-tarjeta.test.sh`; pasan, y también las 18 pruebas de shell anteriores.
- **Revisión de la persona:** a las 01:40 del 2026-09-30 dio el OK para todas las PR y para levantar los ambientes esa noche, antes de que las specs estuvieran escritas, y se fue a dormir. No leyó las specs: su revisión queda por confirmar.
- **Propuestas cambiadas o descartadas:** el agente decidió lo siguiente y la persona debe confirmarlo: `DECIMAL(12,2)` solo para subtotal y total, en vez de `DECIMAL(10,2)` en todo como pide el tile → mandan los requerimientos (pregunta abierta 4). Un 413 para el cuerpo muy grande → se responde 400 `CUERPO_MUY_GRANDE` → así la API usa solo los cinco estados de RNF-05. Una librería de validación (`zod`, `joi`) → funciones propias → las reglas de dinero se validan sobre texto y son pocas rutas. El quinto color de la paleta, `#FFE66D`, es un supuesto: la persona mandó `#FF6B6B` repetido. Codex se cortó dos veces a los 9 minutos sin dar hallazgos, la segunda con instrucciones más acotadas; el agente revisó la spec él mismo y corrigió lo que encontró (ESLint del backend en CommonJS, `vue-eslint-parser`, `"type": "module"` del frontend). Después, otra corrida de Codex (la primera de esta se cortó a los 9 minutos), acotada a la spec y a `AGENTS.md`, dio 2 hallazgos P2 y ninguno P0, P1 ni P3, y el agente los corrigió: la spec no enlazaba pruebas `[@test]` para guardar la venta actual en el navegador (se agregaron `funciones.test.js` y `almacenamiento.test.js`, que escribe V-04), y el último paso de «Cómo tomar una tarjeta» decía que el PR va siempre a la rama del entregable (ahora dice que S-01 va a `main` y B-01 y D-01 a `ProductionEnv`).
- **Tiempo:** 01:24–03:00 (1 h 36 min), sin contar la planificación. Las 7 specs de la noche se escribieron juntas, antes de que sus tarjetas se tomaran una por una.
- **Commits:** este commit y los 11 anteriores de la rama `docs/spec-arquitectura` (la spec, el glosario, RNF y flujos, preguntas abiertas, `AGENTS.md`, las dos pruebas de shell, el ajuste de ESLint, el enlace de las pruebas de la venta actual, el destino de las tarjetas sin entregable, la alineación con las specs de documentación de la API, despliegue y armar la venta actual, y los términos nuevos del glosario).

### 2026-09-30 03:25 — B-01: preparar GitHub y crear ProductionEnv

- **Tarea:** tomar la tarjeta B-01 del tablero AIPOS: dejar GitHub listo para integrar cada entregable con merge commit sin borrar su rama, y crear la rama de integración `ProductionEnv` desde el `main` que ya trae S-01.
- **Agente:** Claude Code (Sonnet 5.5) en un workflow.
- **Qué hizo el agente:** comprobó con `gh repo view` que el repositorio ya tenía `mergeCommitAllowed=true` y `deleteBranchOnMerge=false`; esos dos valores los cambió el orquestador del workflow a las 01:11, con el permiso que la persona dio en su plan de la noche. `ProductionEnv` se creó desde `main` con `git push origin origin/main:refs/heads/ProductionEnv` (parte del commit 820211c, el de S-01). Se protegió con la regla «Protect ProductionEnv» (id 24237637): sin borrar la rama, sin force push y con PR obligatorio, solo con merge commit. Se comprobó con `gh api repos/g14wx/AIPOS/rules/branches/ProductionEnv` que no exige historial lineal, y que la rama por defecto sigue siendo `main`. B-01 no cambia código: es configuración de GitHub y esta entrada.
- **Revisión de la persona:** por confirmar. A las 01:40 dio el OK para todas las PR y para levantar los ambientes esa noche, antes de que las specs estuvieran escritas, y se fue a dormir; no leyó lo que hizo este workflow. Dio el permiso de cambiar la configuración de GitHub en su plan, no en esta tarjeta.
- **Propuestas cambiadas o descartadas:** ninguna en esta tarjeta. La regla de `ProductionEnv` es la parte «opcional» de la tarjeta y se hizo porque el plan de la noche la pedía.
- **Tiempo:** 03:25–03:40 (unos 15 min), sin contar el cambio de configuración de las 01:11.
- **Commits:** este commit.

### 2026-09-30 03:50 — P-01: spec de crear producto (P-01, P-02 y P-03)

- **Tarea:** escribir `specs/crear-producto.spec.md`, la spec del flujo 01 completo (tabla `productos` y modelo, `POST /api/productos`, botón "Nuevo producto" con su modal), apoyada en la spec de arquitectura. Rama `docs/p-01-spec-crear-producto`.
- **Agente:** Claude Code (Sonnet 5.5) en un workflow. Codex como agente revisor.
- **Qué hizo el agente:** leyó la arquitectura, las tarjetas P-01 a P-03 con sus checklists, el flujo 01, RF-01, RF-10, RN-01 a RN-04, RNF-03 a RNF-05 y el glosario; consultó el grafo del proyecto y el MCP `design-patterns`; escribió la spec (commit `0381de0`); pasó la revisión de Codex y corrigió un hallazgo (commit `7ed27ec`). El orquestador puso la rama al día con `ProductionEnv` (merge sin choques de contenido, solo el grafo) y agregó esta entrada.
- **Decisiones del agente (por confirmar por la persona):**
  - Sin `created_at` ni `updated_at` en `productos`, como fija la arquitectura, aunque el encargo hablaba de timestamps con valor por defecto.
  - La API quita los espacios de los extremos del nombre y del código de barras (RN-04), en lugar de responder 400. El precio no se recorta y `" 25"` es un 400.
  - El `CHECK` del precio incluye el máximo 99 999.99, y hay dos `CHECK` más de "no vacío y sin espacios en los extremos" (nombre y código de barras).
  - El 201 devuelve el precio leído de la fila (`"25.00"`), no el texto que llegó.
  - El aviso "Producto creado" es un `v-snackbar` con la animación Lottie, no una pausa antes de cerrar el modal.
  - Los productos de ejemplo quedan como opcionales por confirmar: un seeder necesita carpeta, ruta y script que la arquitectura no lista.
- **Patrones consultados:** Constraints Enforcer, Active Record y Keyed Idempotency (los más cercanos); para la migración, el formulario y el doble clic, ningún patrón del catálogo encajó.
- **Revisión de Codex:** la primera corrida se cortó a los 9 minutos sin hallazgos (leyó demasiado); la segunda, acotada, dio 1 hallazgo P2 (la pantalla recortaba el precio mientras la API lo rechazaba con espacios) y ningún P0 ni P1. Se corrigió: la pantalla tampoco lo recorta.
- **Revisión de la persona:** a las 01:40 del 2026-09-30 dio el OK para todas las PR y para levantar los ambientes esa noche, antes de que las specs estuvieran escritas, y se fue a dormir. No leyó las specs: su revisión queda por confirmar.
- **Propuestas descartadas:** por confirmar.
- **Tiempo:** unos 20 minutos para escribir la spec (01:59–02:19). Las 7 specs de la noche se escribieron juntas, antes de que sus tarjetas se tomaran una por una.
- **Commits:** este commit y los 2 anteriores de la rama (`0381de0` la spec y `7ed27ec` el ajuste del precio en la pantalla).

### 2026-09-30 03:53 — P-04: spec de buscar producto (P-04 y P-05)

- **Tarea:** escribir `specs/buscar-producto.spec.md`, la spec del flujo 02 (`GET /api/productos?busqueda=` y el campo de búsqueda con sus resultados), con RF-12 como opcional, apoyada en la spec de arquitectura. Rama `docs/p-04-spec-buscar-producto`.
- **Agente:** Claude Code (Sonnet 5.5) en un workflow. Codex como agente revisor.
- **Qué hizo el agente:** leyó la arquitectura, las tarjetas P-04 y P-05 con sus checklists, el flujo 02, RF-02, RF-12, RNF-04 y el glosario; consultó el grafo del proyecto y el MCP `design-patterns`; escribió la spec (commit `ee8dcdf`); pasó la revisión de Codex y corrigió los hallazgos (commit `8503976`). El orquestador puso la rama al día con `ProductionEnv` y agregó esta entrada.
- **Decisiones del agente (por confirmar por la persona):**
  - Se busca desde 2 caracteres y como máximo 20 resultados. El texto se recorta y tiene de 2 a 120 caracteres.
  - Un código de barras exacto va siempre primero en la lista; después se ordena por nombre y por `id`.
  - Sin coincidencias, la API responde 200 con la lista vacía. Un `busqueda` repetido, ausente o de menos de 2 caracteres es un 400 `DATOS_INVALIDOS`.
  - `%`, `_` y `\` se escapan antes de `Op.like`. La prueba del escape de la barra invertida usa `a\` (2 caracteres).
  - La pantalla espera 300 ms al escribir, ignora las respuestas viejas con un contador (sin `AbortController`) y muestra 6 estados: inicial, pocos caracteres, buscando, con resultados, sin resultados y error con "Reintentar". Con 20 resultados avisa que solo muestra los primeros 20.
  - RF-12 queda opcional, con su propio archivo de pruebas. Sin código exacto, Enter muestra "No hay un producto con ese código de barras".
  - La documentación de la ruta apunta a `backend/docs/openapi.yaml` como ruta propuesta; si la spec de A-01 fija otra, manda esa.
- **Patrones consultados:** Input Validation, Layered Architecture con Service Layer, Debounce, SwitchMap (el más cercano) y Facade; Query Object descartado.
- **Revisión de Codex:** 3 hallazgos P2 y 1 P3. Corregidos: la prueba de la barra invertida usaba un solo carácter, que la validación rechaza con 400; RF-12 no mostraba el error cuando el texto coincidía con nombres pero no con un código exacto; el texto decía que RF-12 esperaba una confirmación ya resuelta. El cuarto, la falta de esta entrada de la bitácora, se resolvió con este commit.
- **Revisión de la persona:** a las 01:40 del 2026-09-30 dio el OK para todas las PR y para levantar los ambientes esa noche, antes de que las specs estuvieran escritas, y se fue a dormir. No leyó las specs: su revisión queda por confirmar.
- **Propuestas descartadas:** por confirmar.
- **Tiempo:** unos 27 minutos para escribir la spec (01:59–02:26). Las 7 specs de la noche se escribieron juntas, antes de que sus tarjetas se tomaran una por una.
- **Commits:** este commit y los de la rama (`ee8dcdf` la spec y `8503976` la corrección de Codex).

### 2026-09-30 03:54 — V-04: spec de armar la venta actual (V-04 a V-07)

- **Tarea:** escribir `specs/armar-venta-actual.spec.md`, la spec del flujo 03 (tarjetas V-04, V-05, V-06 y V-07). Rama `docs/v-04-spec-armar-venta-actual`.
- **Agente:** Claude Code (Sonnet 5.5) en un workflow. Codex como agente revisor.
- **Qué hizo el agente:** escribió la spec con las reglas de negocio RN-05 a RN-09, el módulo `src/ventaActual/` (funciones puras: agregar, precio aplicado, cantidad, eliminar, subtotales y total en centavos), guardar la venta actual en `localStorage`, los componentes `VentaActual.vue`, `CampoPrecioAplicado.vue` y `CampoCantidad.vue`, los casos de error, los criterios de aceptación de las 4 tarjetas y las pruebas en local con `curl` y el MCP `chrome-devtools`. Una primera pasada escribió el borrador y una segunda lo revisó contra las tarjetas, `requerimientos/`, el glosario y la spec de arquitectura, y agregó el caso de un producto guardado que ya no existe. Patrones consultados en el MCP `design-patterns`: Pure Functions e Immutability para el módulo, Memento (el más cercano) para guardar en el navegador, Null Object para la venta vacía, Mediator para `App.vue`; sin patrón para los componentes de Vue 2. Escribió la spec (commit `9fe4819`), corrigió a Codex (commit `ca6cdf0`), el orquestador puso la rama al día con `ProductionEnv` y agregó esta entrada.
- **Revisión de Codex:** 3 hallazgos P2, sin P0 ni P1. Corregidos: la spec decía que `App.vue` era el único que llama al módulo, pero `VentaActual.vue` también lo usa (ahora `App.vue` es el único que guarda la venta actual, y el componente calcula y emite); y permitía "404 o 422" para un producto que ya no existe, cuando RF-09 pide 422 (ahora dice 422). El tercero, la falta de esta entrada de la bitácora, se resolvió con este commit.
- **Decisiones que vienen de la persona (2026-09-30):** el precio aplicado puede ser 0; la cantidad es un entero de 1 a 999 y el precio aplicado llega hasta 99 999.99; los precios se muestran con 2 decimales y sin símbolo de moneda; la venta actual no se pierde al recargar (se guarda en el navegador y se vacía al registrar la venta).
- **Revisión de la persona:** a las 01:40 del 2026-09-30 dio el OK para todas las PR y para levantar los ambientes esa noche, antes de que las specs estuvieran escritas, y se fue a dormir. No leyó las specs: su revisión queda por confirmar.
- **Propuestas descartadas:** ninguna descartada por la persona. El agente descartó `vuex`, `pinia` y un bus de eventos (son solo dos componentes y un estado en `App.vue`).
- **Tiempo:** unos 27 minutos para escribir la spec (01:59–02:26). Las 7 specs de la noche se escribieron juntas, antes de que sus tarjetas se tomaran una por una.
- **Commits:** este commit y los 2 de la rama (`9fe4819` la spec y `ca6cdf0` las correcciones de Codex).

### 2026-09-30 03:59 — V-01: spec de registrar venta (V-01, V-02, V-03 y V-08)

- **Tarea:** escribir `specs/registrar-venta.spec.md`, la spec del flujo 04: las tablas `ventas` y `detalles_venta` con sus modelos, el procedimiento almacenado `sp_registrar_venta`, `POST /api/ventas` y el botón "Registrar venta" (tarjetas V-01, V-02, V-03 y V-08). Rama `docs/v-01-spec-registrar-venta`.
- **Agente:** Claude Code (Sonnet 5.5) en un workflow. Codex como agente revisor.
- **Qué hizo el agente:** leyó la spec de arquitectura, las 4 tarjetas con sus checklists, el flujo 04, RF-09 a RF-11, RNF-05 y RNF-07 y las skills de MySQL y Sequelize; consultó el grafo del proyecto y los patrones de diseño; escribió la spec y corrigió los hallazgos de Codex.
- **Decisiones del agente (por confirmar por la persona):**
  - El procedimiento devuelve un solo `SELECT` con `ventaId` y `total`. Sus rechazos usan `SIGNAL SQLSTATE '45000'` con un código en `MESSAGE_TEXT` (`VENTA_SIN_DETALLES`, `PRODUCTO_NO_EXISTE`, etc.), que la API traduce a un 422 con mensaje en español.
  - Máximo de 100 detalles por venta (API, procedimiento y botón), porque con 101 detalles de 999 × 99 999.99 el total pasa de `DECIMAL(12,2)`. No está en los requerimientos. La otra opción es ampliar el total a `DECIMAL(14,2)`.
  - El procedimiento revisa el precio como texto para rechazar decimales de más; la columna que inserta sigue en `DECIMAL(10,2)`, como pide la arquitectura.
  - No se incluye idempotencia por llave (reintento cuando la respuesta se pierde): queda como pregunta abierta.
- **Revisión de Codex:** la primera corrida se cortó a los 9 minutos sin hallazgos. La segunda dio 1 P1 y 4 P2: el procedimiento redondeaba `"10.999"` a `11.00`, una venta válida desbordaba el total (límite de 100), faltaban las llaves foráneas de las relaciones y dos archivos en los `targets`, y faltaba esta entrada. Una tercera pasada dio 1 P1 (la columna de `JSON_TABLE` debía alinearse con la arquitectura) y 1 P2 (el máximo de 100 debía entrar en `valida` del botón). Todo quedó corregido en la rama (commits `adb6a95` y `0dddbea`).
- **Revisión de la persona:** a las 01:40 del 2026-09-30 dio el OK para todas las PR y para levantar los ambientes esa noche, antes de que las specs estuvieran escritas, y se fue a dormir. No leyó las specs: su revisión queda por confirmar.
- **Propuestas descartadas:** ninguna descartada por la persona. El agente descartó los patrones Repository y Data Mapper, porque los modelos solo consultan y la venta se escribe en el procedimiento.
- **Tiempo:** unos 35 minutos para escribir la spec (01:59–02:35). Las 7 specs de la noche se escribieron juntas, antes de que sus tarjetas se tomaran una por una.
- **Commits:** este commit y los 3 de la rama (`379099b` la spec, `adb6a95` y `0dddbea` las correcciones de Codex).

### 2026-09-30 04:06 — A-01: spec de la documentación de la API (A-01)

- **Tarea:** escribir `specs/documentacion-de-la-api.spec.md`: el documento OpenAPI 3 del backend (`backend/docs/openapi.yaml`), Swagger UI en `GET /api/docs`, el formato de error como esquema compartido y una prueba que falla si una ruta de Express no está documentada. Rama `docs/a-01-spec-documentacion-de-la-api`.
- **Agente:** Claude Code (Sonnet 5.5) en un workflow. Codex como agente revisor.
- **Qué hizo el agente:** leyó la arquitectura, los requerimientos y la tarjeta A-01 con sus checklists; comprobó en local el montaje con Express 5.2.1, helmet 8.3.0 y swagger-ui-express 5.0.1; consultó el grafo del proyecto y el MCP `design-patterns`; escribió la spec (commit `066093c`) y enlazó la prueba de la autoverificación de rutas (commit `e8703ee`). Su borrador de bitácora se cortó: esta entrada se armó desde el historial de git, la salida de Codex y la tarjeta.
- **Decisiones del agente (por confirmar por la persona):**
  - Cinco respuestas de error reusables (400, 404, 409, 422 y 500) desde A-01, con los mensajes que de verdad devuelve la API, para que P-02, P-04 y V-03 solo escriban `$ref`.
  - `routes/index.js` expone los `montajes` (prefijo y router de cada ruta), porque Express 5 ya no guarda el prefijo, y la prueba de rutas documentadas los consulta.
  - Helmet queda estricto en todo el backend y solo `/api/docs` tiene una CSP propia para los estilos de Swagger UI.
  - Los ejemplos de error no llevan `stack` ni SQL (RNF-04), y el esquema de error los prohíbe.
- **Patrones consultados:** Registry y Layer-Specific Logic Testing (los más cercanos); para el documento OpenAPI, el esquema de error compartido y la CSP propia, ningún patrón del catálogo encajó. Sin capa nueva: `docs.js` es una ruta más.
- **Revisión de Codex:** la primera corrida se cortó a los 9 minutos sin hallazgos; la segunda dio 1 P2 (faltaba el enlace `[@test]` del requisito de autoverificación de `sinDocumentar` y `sinRuta`) y ningún P0 ni P1. Se corrigió en `e8703ee`.
- **Revisión de la persona:** a las 01:40 del 2026-09-30 dio el OK para todas las PR y para levantar los ambientes esa noche, antes de que las specs estuvieran escritas, y se fue a dormir. No leyó las specs: su revisión queda por confirmar. La subtarea de aprobar «documentación de la API» en el glosario sigue por confirmar.
- **Propuestas descartadas:** por confirmar.
- **Tiempo:** unos 39 minutos para escribir la spec (01:59–02:38). Las 7 specs de la noche se escribieron juntas, antes de que sus tarjetas se tomaran una por una.
- **Commits:** este commit y los 2 de la rama (`066093c` la spec y `e8703ee` la corrección de Codex).

### 2026-09-30 04:08 — D-01: spec de despliegue (D-01)

- **Tarea:** escribir `specs/despliegue.spec.md`, la spec del flujo 07: desplegar a producción con una etiqueta `release-*` (workflow de GitHub, imágenes, Docker Compose de producción, Caddy, scripts del servidor, volver a la versión anterior y revisión desde internet). Rama `docs/d-01-spec-despliegue`.
- **Agente:** Claude Code (Sonnet 5.5) en un workflow. Codex como agente revisor.
- **Qué hizo el agente:** leyó la arquitectura, los requerimientos y la tarjeta D-01 con sus checklists; escribió la spec (commit `85b4540`). Su borrador de bitácora se cortó: esta entrada se armó desde el historial de git, la salida de Codex y la tarjeta. Las correcciones de Codex (commit `65cee01`) las hizo el agente orquestador del workflow.
- **Decisiones del agente (por confirmar por la persona):**
  - Los dominios `aipos.salsalvador.io` (pantalla) y `aipos-back.salsalvador.io` (backend) son decisión de la persona del 2026-09-30, según la spec.
  - Las etiquetas válidas son `release-MAYOR.MENOR.PARCHE`; `release-hoy` falla.
  - Todo se publica solo en `127.0.0.1` y Caddy es la única entrada desde internet.
  - `/api/docs` se revisa en producción solo cuando A-01 esté integrada.
- **Patrones consultados:** por confirmar (la spec tiene su tabla "Cómo se decidió el diseño").
- **Revisión de Codex:** la primera corrida se cortó a los 9 minutos sin hallazgos. La segunda dio 1 P1 y 2 P2, sin P0: el flujo de error podía retroceder dos veces cuando `desplegar.sh` fallaba antes de activar la versión nueva (P1); el criterio 1 aceptaba cualquier `release-*` y contradecía al criterio 8 con `release-hoy` (P2); el criterio de `/api/docs` no tenía `[@test]` (P2). Los tres se corrigieron en `65cee01`.
- **Revisión de la persona:** a las 01:40 del 2026-09-30 dio el OK para todas las PR y para levantar los ambientes esa noche, antes de que las specs estuvieran escritas, y se fue a dormir. No leyó las specs: su revisión queda por confirmar. La subtarea de aprobar los términos del glosario sigue por confirmar.
- **Propuestas descartadas:** por confirmar.
- **Tiempo:** primer commit de la spec a las 02:24 y corrección de Codex a las 03:22; el inicio exacto queda por confirmar. Las 7 specs de la noche se escribieron juntas, antes de que sus tarjetas se tomaran una por una.
- **Commits:** este commit y los 2 de la rama (`85b4540` la spec y `65cee01` la corrección de Codex).

### 2026-09-30 04:21 — D-01: pipeline de despliegue con etiquetas `release-*` (D-01)

- **Tarea:** la persona pidió avanzar el tablero AIPOS tarjeta por tarjeta, probando todo en local. Esta tarjeta es D-01: implementar `specs/despliegue.spec.md` (PR #34, ya en `ProductionEnv`) para desplegar AIPOS en producción con una etiqueta `release-*`. Rama `chore/despliegue`, PR #53 a `ProductionEnv`.
- **Agente:** Claude Code (Sonnet 5.5) en agentes en segundo plano: implementar, Codex y cerrar. No hubo agente verificador aparte. Codex como agente revisor.
- **Qué hizo el agente:** escribió primero las 21 pruebas de `tests/despliegue/` y su `comun.sh`, y después el código. El pipeline `.github/workflows/despliegue.yml` tiene cinco jobs en fila (revisar, probar el backend, probar la pantalla, construir y desplegar con la aprobación del environment `production`). En `despliegue/` van cinco scripts (`desplegar.sh`, `crear-env.sh`, `instalar-caddy.sh`, `revisar-etiqueta.sh` y `revisar-produccion.sh`) y los dos bloques de Caddy. Además hizo `docker-compose.produccion.yml`, los dos `Dockerfile`, `frontend/nginx.conf`, los dos `.dockerignore`, `docs/despliegue.md`, el flujo 07 con su diagrama, la sección Despliegue del README y las filas de D-01 en el alcance y en los entregables.
- **Servidor y GitHub (sin commit):** el agente orquestador hizo antes los pasos 1 y 2 (foto inicial del servidor, y Docker 29.8.1 con Compose v5.5.1 del repositorio oficial de Docker, a las 02:36–02:38). El agente de D-01 siguió desde el paso 3: usuario de despliegue sin `sudo` y con su propia clave SSH, `/srv/aipos` con su `.env` de permisos 600 (`crear-env.sh`), los dos bloques de Caddy con `instalar-caddy.sh` (respaldo, `caddy validate` y `reload`, sin reiniciar), el environment `production` con la persona como revisora, los secretos y la variable, y la regla "Proteger etiquetas release". La foto final del servidor salió igual a la inicial: mismos puertos, mismos servicios caídos y mismo código HTTP en los 11 sitios que ya servía Caddy. No se creó ninguna etiqueta `release-*`.
- **Verificación y revisión de Codex:** sin verificador aparte, el agente que implementó comparó a mano el código con la spec, porque `spec-verification` y `work-review` piden scripts que el tile no trae (issue #25, ya abierto). Los 17 `targets` y los 21 `[@test]` existen, ninguna prueba queda sin enlace y los 15 criterios tienen su código y su prueba. Codex dio 1 hallazgo, un P1 (P0: 0, P2: 0, P3: 0): `backend/Dockerfile:18` copia `docs/` y `despliegue/revisar-produccion.sh:96` pide `/api/docs`, así que una versión sin A-01 no se puede construir ni aceptar. Es cierto contra la spec que hoy está en `ProductionEnv`. No se cambió código: A-01 es requisito de D-01 y `release-0.1.0` la incluye, según la nota del agente orquestador del 03:52 en la tarjeta. A-01 ya está en `feature/base` (PR #49) y la spec de S-02 (PR #50, sin integrar) lo deja escrito. Integrar D-01 antes no rompe nada: el pipeline solo arranca con una etiqueta `release-*`, y la primera se sube cuando la base, con A-01, esté en `ProductionEnv`.
- **Issues:** #51, abierto por el agente a las 07:41. El ejemplo de `GET /api/salud` en `openapi.yaml` no traía `baseDeDatos` y la prueba `ejemplos-reales` fallaba al juntar A-01 con B-03. Su corrección (`a093ea2`) ya está en la rama de B-03 y ese cierre cierra el issue. Sin ella, el job de pruebas del backend de `release-0.1.0` fallaría. El cierre de D-01 no abrió issues nuevos.
- **Pruebas:** 21 de 21 en verde con la rama sola, y también en Ubuntu 24.04 con `flock` real. Prueba en local con Docker de verdad, en una rama de prueba que nunca se subió (D-01 con la base y B-03): construye las dos imágenes y despliega dos versiones (las migraciones corren con el usuario de la app, `/api/salud` da 200 con `baseDeDatos` en ok, MySQL solo escucha en `127.0.0.1`, ningún proceso es root y el volumen conserva los datos). Una versión cuyo backend se cae al arrancar vuelve a la anterior. Una migración que falla no levanta la versión nueva. `volver` regresa a la anterior, y una segunda vez no hace nada. Con `curl` se probó cada ruta y sus errores (404, 400 por JSON mal escrito y por un cuerpo de 150 kb, CORS y preflight solo con `GET` y `POST`, `/api/docs`). En el navegador la pantalla carga con 0 errores en la consola y otro origen queda bloqueado por CORS. `shellcheck` quedó sin avisos (el cierre pulió los de estilo de `tests/despliegue/`), `actionlint` sin advertencias y `hadolint` solo con `DL3066`, que pide la spec.
- **Cortes del sistema:** el agente orquestador anotó a las 04:18 que un workflow anterior se cortó 6 veces en esta tarjeta sin commits. Después hubo 13 reintentos entre las 04:28 y las 05:38, y dos caídas por error de la API (a las 07:44 y antes de las 09:05). Cada agente siguió desde el archivo de avance y desde git.
- **Decisiones del agente (por confirmar por la persona):**
  - Volver a la versión anterior si la nueva no queda sana: patrón Fallback. El candado para que dos despliegues no se pisen: Pessimistic Locking. Esperar a que `/api/salud` y la pantalla den 200: Retry with Backoff, con espera fija de 24 intentos cada 5 segundos. Ningún patrón del catálogo (MCP `design-patterns`) encaja exacto en scripts de despliegue, y la spec ya descartó Blue-Green (un solo servidor).
  - `desplegar.sh` trae `AIPOS_BAJAR_SOLO_SI_FALTA=1`, un gancho solo para pruebas (apagado por defecto) que la spec no nombra.
  - La prueba de arranque local usa `release-0.0.N`, no `local`. La spec dice `local` en la línea 574 y permite `release-0.0.N` en la 96, y `desplegar.sh` solo acepta `release-X.Y.Z`. La frase de la spec queda por ajustar y la ajusta la persona.
  - El cierre agregó `tests/despliegue/.shellcheckrc` para que `shellcheck` siga el `source comun.sh` de cada prueba desde cualquier carpeta. Patrón External Configuration Store (80 %, no exacto).
- **Revisión de la persona:** a las 01:40 y 01:45 del 2026-09-30 dio su OK a todo el proceso y a todos los PR, antes de ver el código, y se fue a dormir; su revisión queda por confirmar. La subtarea del glosario (aprobar «desplegar», «producción», «pipeline» y «etiqueta `release-*`», que ya están en `docs/lenguaje-ubicuo.md`) sigue por confirmar. Según el agente orquestador, él sube `release-0.1.0` y aprueba el primer despliegue en nombre de la persona, con lo que ella autorizó a esas horas: por confirmar.
- **Propuestas cambiadas o descartadas:** (1) Codex proponía hacer opcionales `docs/` en la imagen y `/api/docs` en la revisión, o declarar A-01 requisito de D-01 → se declaró A-01 requisito → la imagen copia `docs/` porque A-01 lo lee al arrancar, y la spec pide `/api/docs` en 200 desde `release-0.1.0`. (2) La spec decía la etiqueta `local` para la prueba de arranque → se usó `release-0.0.N` → `desplegar.sh` rechaza lo que no sea `release-X.Y.Z`. (3) La pantalla se iba a probar con el MCP `chrome-devtools` → se usó `puppeteer-core`, la librería del mismo MCP, en un Chrome aparte → otra sesión tenía ocupado el perfil de su navegador.
- **Tiempo:** 04:21–09:40 (5 h 19 min de reloj, con los cortes del sistema y la espera de Codex). La spec de D-01 tiene su propia entrada.
- **Commits:** PR #53. Los 43 de la implementación, pruebas primero: `70e9187` `d256709` `15679e2` `3da44bc` `35a1a79` `fb45386` `ddd51ea` `f5fe0a2` `ced92c1` `62be6f3` `3c02226` `834f41b` `939485d` `04c978e` `09e5ad9` `8f42b77`. Código: `a9e0c87` `5c60680` `bbf447f` `8bc5d2d` `2746231` `329e818` `1197758` `97c03a8` `8b22a00` `19ab10d` `fe8a7b0` `c1a5ee5`. Ajustes de pruebas: `c30948c` `f801700` `8ebe84f` `233bce8` `1edb47e` `04e5b7e` `078e4b2` `8d80d03`. Documentos: `ea534dd` `6d5fea7` `aded6d0` `4c961d0` `e057699` `2314daa` `8c01ace`. Después, `2e1710d` (el pulido de `shellcheck`) y este commit.

### 2026-09-30 04:59 — S-02: ajustes de las specs tras la revisión cruzada

- **Tarea:** la persona pidió avanzar el tablero AIPOS tarjeta por tarjeta, probando todo en local. La tarjeta S-02 corrige los choques que encontró la revisión cruzada de las 7 specs (03:51) y las deja iguales al código de B-02 y de B-04. Rama `docs/s-02-ajustes-de-las-specs`, PR #50 a `ProductionEnv`.
- **Agente:** Claude Code (Sonnet 5.5), en agentes en segundo plano: implementar, Codex (el agente revisor) y cerrar. No corrió un verificador aparte: el agente que implementó comprobó su propio PR. El agente que cerró usó además tres subagentes de solo lectura para comparar las specs con el código de B-02, con el de B-04 y entre sí.
- **Qué hizo el agente:**
  - Implementar (04:59–07:28): escribió primero las comprobaciones de coherencia entre las 7 specs, el glosario y `requerimientos/` en `tests/arquitectura/spec-arquitectura.test.sh` (74 fallas esperadas) y ajustó los documentos hasta que pasaron: el máximo de 100 detalles por venta (RN-14 y pregunta abierta 9), `montajes`, `validarDinero`, `AnimacionLottie`, `http.js`, la imagen del backend con `docs/`, `release-0.1.0` con A-01, «cantidad» de 1 a 999 y seis términos nuevos del glosario. Abrió el PR #50 y sumó la pregunta 9 al checklist de R-04 en el tablero.
  - Cerrar (07:46–09:32): dejó la pregunta 9 como resuelta por el orquestador, con la persona pudiendo confirmarla o revertirla, en el README, en RN-14, en las specs y en el glosario; agregó el máximo de 100 detalles al texto de los flujos 03 y 04, con RN-14 en su línea de Requerimientos; y comparó las 7 specs con el código de B-02 (PR #35) y de B-04 (PR #48), integrados en `feature/base` pero todavía no en `ProductionEnv`. Salieron 20 diferencias de spec atrasada (1 bloqueaba: crear producto comparaba el precio con `aCentavos`, que lanza un `Error` con `100000`) y 2 que son del código, no de las specs. Se corrigieron 19 (una en parte: no se dijo la forma de lo que exporta `config.js`, que ninguna tarjeta pendiente usa); la otra (las variables de prueba de `vitest.config.mjs`) la cambia B-03.
- **Revisión de Codex y de la segunda revisión cruzada:**
  - 1.ª pasada (07:32–07:40): 1 P1 y 1 P2, sin P0. P1: la pregunta 9 estaba «resuelta» y «por confirmar» a la vez, y los flujos 03 y 04 no decían el máximo. Lo decidió el orquestador: queda resuelta; se corrigió en `a093315`, `e1e2222`, `94ed12f`, `ab2fe1b` y `c6cddc1`. Los diagramas BPMN de esos flujos no se tocan (P3): manda el texto y cada flujo lo dice. P2: faltaba esta entrada; es esta.
  - 2.ª pasada (08:55–09:08): 1 P1 y 2 P2, sin P0. P1: `release-0.1.0` exige A-01 y el entregable base de `requerimientos/04-entregables.md` no la nombraba; ya la nombra (`5b97ef1`), y las filas de A-01 y de D-01 en las tablas las suman los PR de esas tarjetas. P2: V-05, V-06 y V-07, y P-03 y P-05, corren a la vez y comparten archivos sin que la spec dijera quién los crea; ahora lo dice (`171e2cb`, `e9768bc`, `e3e4b2c`, `3bcbd82`).
  - 3.ª pasada (09:17–09:24): 1 P2, sin P0 ni P1. P-02 y P-04 comparten la ruta `/api/productos` de `openapi.yaml`; corregido en `eff00b4`. No hubo más pasadas: es el límite de repeticiones de la tarjeta.
  - La segunda revisión cruzada (subagente) dio por resueltos los 14 puntos de la primera y encontró 14 menores, ninguno que bloquee. Se corrigieron los baratos (el alto de la animación, la ruta relativa de `registrarVenta`, `enviando`, el 502, RF-12 en el flujo 02, los `[@test]` sin dueño, «código de barras» completo). Se dejaron los ejemplos de error de la documentación de la API, el texto de buscar producto y registrar venta por si A-01 no está integrada, quién sube las etiquetas `release-*` y el mensaje de un código de regla desconocido: son menores y no chocan.
- **Decisiones por confirmar con la persona:** el límite de 100 detalles por venta (RN-14, pregunta abierta 9), que resolvió el orquestador con el consentimiento general que la persona dio para todo el proceso (01:40 y 01:45); la palabra «orquestador», que entra al glosario como propuesta; el contrato de `validarDinero`, que fija la spec porque B-02 no lo trae; el botón «Nuevo producto» en la primera zona de la pantalla, como lo dejó B-04, en vez de la barra superior; y los nombres de las ramas de tarjeta de ventas y de las pruebas por operación, que propone este PR con la forma de los de productos.
- **Issues:** ninguno. No apareció un error en código ya commiteado: lo que salió del cotejo eran specs atrasadas. Quedan dos cosas de código que no son de esta tarjeta: `estructura.test.js` de B-02 solo revisa `routes/` y `controllers/`, y la spec de registrar venta lo cita para todo `src/` (lo amplía V-03); y B-04 usa «monto» e «importe» en `dinero.js` y en `VentaActual.vue`, palabras que el glosario prohíbe. Además, la rama de P-03 tiene `frontend/tests/api/productos.test.js` y la spec ahora dice `crear-producto.test.js`: hay que renombrarlo en esa rama.
- **Pruebas:** `tests/arquitectura/spec-arquitectura.test.sh`, escrita primero en cinco tandas (74, 21, 52, 28 y 3 fallas esperadas antes de cada ajuste); ahora 219 comprobaciones en verde, «todo bien». `tests/arranque/agents-md.test.sh` y `agents-md-tarjeta.test.sh` también en verde. Es una tarjeta de documentación: no hay pantalla ni API que probar (sin `curl` ni `chrome-devtools`) ni `npm test`, lint o build que correr.
- **Cortes del sistema:** el archivo de avance del agente que implementó registra tres cortes (05:27, 05:32 y 05:41), sin commits nuevos hasta las 06:36. Durante el cierre, la respuesta del agente se cortó dos veces y siguió desde el estado del árbol de trabajo, sin perder commits.
- **Revisión de la persona:** a las 01:40 y 01:45 del 2026-09-30 dio su OK a todo el proceso y a todos los PR, antes de ver el código, y se fue a dormir; su revisión queda por confirmar.
- **Propuestas cambiadas o descartadas:** la fila 9 decía «Sí, resuelta por el orquestador, por confirmar» → ahora dice «Resuelta el 2026-09-30 por el orquestador… la persona puede confirmarla o revertirla» → la frase anterior se contradecía (P1 de Codex). Codex proponía pedir la aprobación explícita de la persona o dejar el límite solo como propuesta → el orquestador decidió que queda resuelta, con el consentimiento general de la persona → ella puede revertirla al revisar. Codex pedía actualizar también los diagramas BPMN de los flujos 03 y 04 → no se tocan (P3) → manda el texto del flujo y el diagrama se actualiza en otra tarea.
- **Tiempo:** 04:59–09:32 (4 h 33 min), con esos cortes.
- **Commits:** PR #50, con merge commit. Del agente que implementó: `09dc025`, `e35c19f`, `64a76e8`, `8bb87bd`, `655219f`, `897b7f2`, `a3dc25f`, `32835bc`, `6b1570b`, `a2a4022`, `01b4010` y `9a75aba`. Del cierre: `f42733f`, `a093315`, `e1e2222`, `94ed12f`, `ab2fe1b`, `c6cddc1`, `2c3ddcc`, `4b51871`, `db2b00e`, `48b1dcb`, `96c7ac3`, `e58eb3d`, `d57efad`, `d3181f3`, `5b97ef1`, `24436ab`, `171e2cb`, `e9768bc`, `5b35b55`, `e3e4b2c`, `3bcbd82`, `64e609b`, `eff00b4` y `8da0750` (la primera versión de esta entrada), y este commit, que corrige sus tiempos y sus cuentas.
