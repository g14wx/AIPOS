# AIPOS

## Antes de empezar

Revisa esto al abrir cada sesión, en este orden. Así un clon nuevo queda listo en cualquier máquina con Claude Code o Codex.

1. Si no existe `.tessl/RULES.md`, o si `find tessl.json tessl-plugins -newer .tessl/RULES.md` muestra algún archivo (por ejemplo, después de un `git pull` que trajo un tile nuevo), corre `tessl install` desde la raíz del proyecto. Así se instalan las reglas y las skills de los tiles de `tessl-plugins/`. Después pídele a la persona que abra una sesión nueva, y no empieces ninguna tarea en esta: las reglas y las skills se cargan al abrir la sesión. Si no hay una persona que pueda abrirla, por ejemplo en `codex review` o en una ejecución automática, lee `.tessl/RULES.md` y los archivos que enlaza, y sigue con la tarea. Si el comando `tessl` no está instalado, pídele a la persona que siga `docs/setup/tessl-setup.md`.
2. Si `git config core.hooksPath` no responde `.githooks`, corre `git config core.hooksPath .githooks`. Así se activa el hook de git `pre-commit`, que actualiza el grafo del proyecto en cada commit.
3. Si `graphify --version` no responde `graphify 0.9.72`, porque no está instalado o es otra versión, pregúntale a la persona si lo instalas. Si dice que sí, corre `uv tool install "graphifyy[sql]==0.9.72"`. Nunca lo instales sin preguntar. Si falta `uv`, la guía está en `docs/setup/graphify-setup.md`.

## Qué es AIPOS

AIPOS es una aplicación web de una sola pantalla para un punto de venta básico. El cajero crea y busca productos, arma la venta actual y la registra en MySQL con el procedimiento almacenado `sp_registrar_venta`. Es una prueba técnica: se evalúan el resultado, el historial de git, el README y la bitácora de IA, y se construye con agentes de código. El repositorio es público.

Se hace con Vue 2 y Vuetify 2 en la pantalla, Node.js, Express y Sequelize en la API, y MySQL 8.4. Las versiones exactas están en `specs/arquitectura.spec.md`.

Dónde está cada cosa:

- `requerimientos/`: qué hace y qué cumple AIPOS, con sus flujos y diagramas BPMN. Si algo choca con una spec, mandan los requerimientos.
- `docs/lenguaje-ubicuo.md`: el glosario. Usa sus palabras tal cual.
- `specs/`: las specs. La de arquitectura (`specs/arquitectura.spec.md`) es la constitución del proyecto: tecnologías, carpetas, capas, errores, dinero, base de datos, pruebas, diseño de la pantalla y Git. Las demás specs se apoyan en ella.
- `docs/bitacora-ia.md`: la bitácora de IA, con una entrada por tarea.
- El tablero AIPOS, <https://trello.com/b/K5mkgcdl/aipos>: una tarjeta por tarea, con sus subtareas y sus criterios de aceptación.
- `backend/` y `frontend/`: el código. Los crean las tarjetas B-02 y B-04.

## Cómo tomar una tarjeta

Una sesión nueva sigue estos pasos con cualquier tarjeta del tablero AIPOS. No hace falta que nadie le cuente lo que ya se decidió: está en el repo o en la tarjeta.

1. **Leer la tarjeta.** Con el MCP de Trello, lee la tarjeta y sus checklists ("Subtareas" y "Criterios de aceptación"), y su flujo en `requerimientos/`. Si la sesión no tiene el MCP de Trello, pídele a la persona el texto de la tarjeta. La guía está en `docs/setup/agents-setup.md`. Pasa la tarjeta a "En progreso" y déjale un comentario corto con la hora, como "Update 01:42 — Empecé. Rama feature/b-02-base-del-backend."
2. **Crear su rama de tarjeta.** Se llama `<tipo>/<id>-<resumen>`, en minúsculas y con guiones, por ejemplo `feature/b-02-base-del-backend`. Sale de la rama de su entregable (`feature/base`, `feature/productos` o `feature/ventas`) y su PR va a esa rama. Las tarjetas sin entregable salen de su destino: S-01 de `main`, y B-01 y D-01 de `ProductionEnv`. El detalle está en la sección "Git y entrega" de `specs/arquitectura.spec.md`.
3. **Consultar el grafo del proyecto.** Corre `graphify query "<la tarea en pocas palabras>"` y lee primero los archivos que salen.
4. **Tener la spec aprobada antes del código.** Lee `specs/arquitectura.spec.md` y la spec del flujo de la tarjeta. Si la tarjeta cambia código y no hay una spec aprobada, escríbela con la skill `spec-writer` y pide la aprobación de la persona. No empieces el código sin ella. Si la tarjeta no cambia código, propón un plan corto y que la persona lo apruebe.
5. **Implementar.** Escribe primero las pruebas de los `[@test]` de la spec y después el código, en commits pequeños. Usa las skills de los tiles y las palabras del glosario. En la pantalla, usa la skill `impeccable` y la paleta de la spec de arquitectura.
6. **Probar en local.** Corre `npm test`, `npm run lint` y `npm run format:check` en el proyecto que cambiaste, y `npm run build` en el frontend. Después prueba el cambio de verdad: la API con `curl` contra el backend corriendo, y la pantalla en el navegador con el MCP `chrome-devtools`.
7. **Abrir un issue por cada bug relevante.** Con `gh issue create`, con los pasos para reproducirlo. Ciérralo con un comentario que nombre el commit que lo corrige.
8. **Verificar contra la spec.** Corre las skills `spec-verification` y `work-review`, y corrige lo que falte.
9. **Pasar la revisión de Codex.** El agente revisor corre `codex review --base origin/<rama de destino>`. Corrige cada hallazgo o explica por qué no aplica, y deja el resultado como comentario del PR.
10. **Escribir la entrada de la bitácora.** Con la skill `bitacora-ia`, en el último commit de la tarea. No inventes lo que la persona revisó o decidió: si no lo sabes, pregúntale o márcalo "por confirmar".
11. **Commit, push y PR.** Commits con Conventional Commits, `Co-Authored-By` y sin `Claude-Session`. El hook de git `pre-commit` agrega el grafo del proyecto. El PR va a la rama de su entregable, con merge commit y sin borrar la rama. Marca las subtareas en el tablero AIPOS y pasa la tarjeta a "En revisión".

## Nada depende de una sesión ni de una máquina

Más adelante van a trabajar otras personas y otros agentes. Por eso:

1. Todo lo que se decide queda en el repo o en la tarjeta. Nada depende de una sesión ni de una máquina.
2. En tarjetas y documentos no se nombran sesiones, alias de ssh ni carpetas que solo existen en una PC.
3. El repo y el tablero son públicos: no se escriben credenciales ni cómo se entra a un servidor. Un servidor se nombra por su dominio, y por su IP solo si el DNS ya la hace pública.
4. Las revisiones las hace el agente revisor (Codex), no otra sesión.

Si una sesión nueva te pregunta algo que ya se decidió, falta escribirlo en el repo: escríbelo en la spec o en el documento que corresponda.

Cuando eres el agente revisor (Codex con `codex review`), revisa contra `requerimientos/` y `specs/`, y no leas `graphify-out/`: es el grafo del proyecto, no es código.

## Decisiones de diseño

Antes de cada decisión de diseño (capas, errores, validación, módulos, componentes, despliegue), consulta el MCP `design-patterns` si tu sesión lo tiene (`find_patterns`, `search_patterns` y `get_pattern_details`). En la spec, anota el patrón que elegiste y por qué, en una frase. Si ningún patrón encaja, dilo en la spec.

# Agent Rules <!-- tessl-managed -->

@.tessl/RULES.md follow the [instructions](.tessl/RULES.md)
