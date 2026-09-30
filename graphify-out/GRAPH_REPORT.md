# Graph Report - spec-armar-venta-actual  (2026-09-30)

## Corpus Check
- 65 files · ~39,362 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: .drawio 7, (none) 5, .example 1)

## Summary
- 340 nodes · 331 edges · 52 communities (26 shown, 26 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- En AIPOS, el hook de git `pre-commit` actualiza este grafo en cada commit: va al día con el commit que lo trae.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- requerimientos/README.md
- graphify-setup.md
- dependencies
- Trabajar en un tile
- Requerimientos funcionales
- Requerimientos no funcionales
- Flujo 05 · Entregar un entregable
- Flujo de un entregable
- Configurar el MCP de Trello
- saltos-de-linea.test.sh
- Tarjetas
- Armar la venta actual
- Glosario de lenguaje ubicuo
- Bitácora de IA
- README de entrega
- MySQL stored procedure authoring
- Calling a stored procedure from Sequelize
- Vue 2 + Vuetify 2 + Vite setup
- Requerimientos de AIPOS
- Vuetify 2 components (Vue 2.7)
- hook-de-claude-code/graphify-fuera-del-path.test.sh
- Grafo del proyecto
- comun.sh
- AGENTS.md
- Grafo del proyecto
- Comandos útiles
- misma-version.test.sh
- ignora-lo-local.test.sh
- agents-md.test.sh
- CLAUDE.md
- entrega-trazable.md
- comunicacion-clara.md
- rules/lenguaje-ubicuo.md
- mysql-sequelize.md
- vue2-vuetify2.md
- sin-rutas-ni-evals.test.sh
- update-sin-cambios.test.sh
- hook-de-claude-code/sin-graphify.test.sh
- agrega-el-grafo.test.sh
- graphify-falla.test.sh
- hook-de-git/sin-graphify.test.sh
- hook-de-git/graphify-fuera-del-path.test.sh
- otra-version.test.sh
- Alcance
- Flujo 03 · Armar la venta actual
- marca-de-commit.test.sh
- version-con-crlf.test.sh
- desactualizado-tras-falla.test.sh
- merge-sin-choques.test.sh
- merge-sin-cambios-en-el-grafo.test.sh

## God Nodes (most connected - your core abstractions)
1. `Requerimientos funcionales` - 14 edges
2. `Requerimientos no funcionales` - 14 edges
3. `Armar la venta actual` - 13 edges
4. `Grafo del proyecto` - 10 edges
5. `Flujo de un entregable` - 10 edges
6. `Configurar el MCP de Trello` - 9 edges
7. `Alcance` - 9 edges
8. `Trabajar en un tile` - 7 edges
9. `El módulo (`src/ventaActual/`)` - 7 edges
10. `La pantalla` - 7 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (52 total, 26 thin omitted)

### Community 0 - "requerimientos/README.md"
Cohesion: 0.11
Nodes (18): Desarrollo de AIPOS, Flujo 00 · Mapa de procesos, Operación del POS, Flujo 01 · Crear producto, Notas técnicas, Otros caminos, Pasos, Flujo 02 · Buscar producto (+10 more)

### Community 1 - "graphify-setup.md"
Cohesion: 0.16
Nodes (10): Convención de nombres en código, Herramientas y proceso, Historial de cambios, Lenguaje ubicuo — AIPOS, Negocio, Pendientes (por confirmar), AIPOS, Grafo del proyecto (+2 more)

### Community 2 - "dependencies"
Cohesion: 0.12
Nodes (16): agents, dependencies, g14wxz/entrega-trazable, g14wxz/grafo-del-proyecto, g14wxz/lenguaje-ubicuo, g14wxz/mysql-sequelize-procedimientos, g14wxz/vue2-vuetify2-vite, tessl-labs/spec-driven-development (+8 more)

### Community 3 - "Trabajar en un tile"
Cohesion: 0.14
Nodes (14): 1. Instalar Tessl, 2. Instalar los tiles del proyecto, 3. Conectar el MCP de Tessl (opcional), 4. Verificar, 5. Cambiar un tile, 6. Medir un tile con evals (necesita cuenta), 7. Publicar un tile (necesita cuenta), Qué va a git y qué no (+6 more)

### Community 4 - "Requerimientos funcionales"
Cohesion: 0.14
Nodes (14): Reglas de negocio, Requerimientos funcionales, RF-01 Crear producto, RF-02 Buscar producto, RF-03 Agregar a la venta actual, RF-04 Ver los detalles de la venta actual, RF-05 Editar el precio aplicado, RF-06 Cambiar la cantidad (+6 more)

### Community 5 - "Requerimientos no funcionales"
Cohesion: 0.14
Nodes (14): Requerimientos no funcionales, RNF-01 Una sola pantalla, RNF-02 Tecnologías y versiones, RNF-03 Validación en tres lugares, RNF-04 Seguridad básica, RNF-05 Manejo de errores, RNF-06 Arquitectura en capas, RNF-07 Base de datos reproducible (+6 more)

### Community 6 - "Flujo 05 · Entregar un entregable"
Cohesion: 0.40
Nodes (5): Entrega final, Flujo 05 · Entregar un entregable, Otros caminos, Pasos, Qué no se hace

### Community 7 - "Flujo de un entregable"
Cohesion: 0.18
Nodes (10): 0. Revisar el repositorio (una vez por proyecto), 1. Empezar el entregable, 2. Trabajar, 3. Abrir el PR, 4. Revisar antes de integrar, 5. Integrar, 6. Etiquetar, 7. Entrega final (+2 more)

### Community 8 - "Configurar el MCP de Trello"
Cohesion: 0.18
Nodes (11): 1. Crear el board en Trello, 2. Obtener el API key, 3. Generar el token, 4. Agregar el servidor a Claude Code, 5. Verificar la conexión, Alternativa: Codex CLI, Configurar el MCP de Trello, Requisitos (+3 more)

### Community 10 - "Tarjetas"
Cohesion: 0.20
Nodes (10): Definición de terminado, Entrega final, Entregable productos, Entregable ventas, Entregables y tarjetas, Requerimientos, Secuencia de los entregables, Tablero AIPOS (+2 more)

### Community 11 - "Armar la venta actual"
Cohesion: 0.06
Nodes (31): `agregarAVentaActual` (V-04), `App.vue`: une la búsqueda con la venta actual (V-04), Armar la venta actual, Botón «Eliminar» (V-07), `cambiarCantidad` y `validarCantidad` (V-06), `cambiarPrecioAplicado` y `validarPrecioAplicado` (V-05), `CampoCantidad.vue` (V-06), `CampoPrecioAplicado.vue` (V-05) (+23 more)

### Community 12 - "Glosario de lenguaje ubicuo"
Cohesion: 0.22
Nodes (7): Plantilla: docs/lenguaje-ubicuo.md, Crear el glosario, Cuando aparece una palabra nueva o dudosa, Cuando un término cambia, Cómo escribir cada entrada, Glosario de lenguaje ubicuo, Revisar si el código habla igual que el negocio

### Community 13 - "Bitácora de IA"
Cohesion: 0.25
Nodes (6): Plantilla: docs/bitacora-ia.md, Bitácora de IA, Cuándo escribir, Cómo escribir una entrada, Reconstruir desde git, Reglas

### Community 14 - "README de entrega"
Cohesion: 0.29
Nodes (5): Plantilla: README.md de entrega, De dónde sale cada punto, Flujo, README de entrega, Reglas

### Community 15 - "MySQL stored procedure authoring"
Cohesion: 0.29
Nodes (6): 1. Files, 2. Migration, 3. Template: a sale with its items, 4. Rules inside the body, 5. Final check, MySQL stored procedure authoring

### Community 16 - "Calling a stored procedure from Sequelize"
Cohesion: 0.29
Nodes (6): 1. Service, 2. No outer transaction, 3. Validate before calling, 4. Map database errors to HTTP, 5. Search products by name or barcode, Calling a stored procedure from Sequelize

### Community 17 - "Vue 2 + Vuetify 2 + Vite setup"
Cohesion: 0.29
Nodes (6): 1. Versions, 2. Project files, 3. Environment and API client, 4. ESLint (optional), 5. Check, Vue 2 + Vuetify 2 + Vite setup

### Community 18 - "Requerimientos de AIPOS"
Cohesion: 0.33
Nodes (6): Aspectos que se evaluarán, Cómo leer esta carpeta, Flujos, Matriz del PDF, Preguntas abiertas, Requerimientos de AIPOS

### Community 19 - "Vuetify 2 components (Vue 2.7)"
Cohesion: 0.33
Nodes (5): Custom v-model, Example: point-of-sale screen, Reactivity, Vue 3 / Vuetify 3 habit and its Vue 2 / Vuetify 2 form, Vuetify 2 components (Vue 2.7)

### Community 21 - "Grafo del proyecto"
Cohesion: 0.33
Nodes (5): Al terminar una tarea, Antes de empezar una tarea, Antes de integrar un PR, Cuándo no usarlo, Grafo del proyecto

### Community 23 - "AGENTS.md"
Cohesion: 0.50
Nodes (3): Agent Rules <!-- tessl-managed -->, AIPOS, Antes de empezar

### Community 24 - "Grafo del proyecto"
Cohesion: 0.18
Nodes (10): Arranque de un clon nuevo, Grafo del proyecto, Hook de Claude Code, Hook de git `pre-commit`, Proceso escrito, Qué entra al grafo, Qué no se usa, Qué va a git (+2 more)

### Community 25 - "Comandos útiles"
Cohesion: 0.15
Nodes (13): 1. Instalar Graphify, 2. Activar el hook de git, 3. Verificar, Antes de integrar un PR, Comandos útiles, Flujo de una tarea, Privacidad, Qué es y para qué sirve (+5 more)

### Community 27 - "ignora-lo-local.test.sh"
Cohesion: 0.83
Nodes (3): debe_ignorar(), no_debe_ignorar(), ignora-lo-local.test.sh script

### Community 44 - "Alcance"
Cohesion: 0.22
Nodes (9): Actores y partes, Alcance, Fuera de alcance, Lo que agregamos y el PDF no pide, Objetivo, Qué entra, Restricciones, Riesgos (+1 more)

### Community 45 - "Flujo 03 · Armar la venta actual"
Cohesion: 0.50
Nodes (4): Flujo 03 · Armar la venta actual, Notas técnicas, Otros caminos, Pasos

## Knowledge Gaps
- **218 isolated node(s):** `name`, `mode`, `source`, `source`, `source` (+213 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 251 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Requerimientos funcionales` connect `Requerimientos funcionales` to `requerimientos/README.md`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `Requerimientos no funcionales` connect `Requerimientos no funcionales` to `requerimientos/README.md`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `Setup de Tessl` connect `Trabajar en un tile` to `graphify-setup.md`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `name`, `mode`, `source` to the rest of the system?**
  _218 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `requerimientos/README.md` be split into smaller, more focused modules?**
  _Cohesion score 0.1103448275862069 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Trabajar en un tile` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
