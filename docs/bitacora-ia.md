# Bitácora de IA — AIPOS

Registro de cómo se usó el agente de código en cada tarea. De aquí salen los puntos 8 a 11 del README.
Las entradas marcadas "reconstruido" se armaron después, desde git y GitHub, y hay que confirmarlas.

## Resumen

| Entregable | Tiempo aprox. | Tareas con agente | Propuestas cambiadas o descartadas |
|---|---|---|---|
| Preparación: agentes, tiles y glosario | 5 h hasta ahora (12:46–17:33 y 20:35–20:47), en curso | 26 | 9 |
| Requerimientos, diagramas BPMN y tablero AIPOS | 2 h 31 min (15:18–17:49) | 2 | 7 |

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
