# Graph Report - p-03  (2026-09-30)

## Corpus Check
- 101 files · ~61,748 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 16 file(s) not represented in the graph (top: (none) 7, .drawio 7, .example 1)

## Summary
- 608 nodes · 756 edges · 83 communities (42 shown, 41 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- En AIPOS, el hook de git `pre-commit` actualiza este grafo en cada commit: va al día con el commit que lo trae.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Configurar el MCP de Trello
- dependencies
- Trabajar en un tile
- devDependencies
- vitest-vue2.test.js
- Flujo de un entregable
- NuevoProducto.test.js
- saltos-de-linea.test.sh
- Entregables y tarjetas
- package.json
- Glosario de lenguaje ubicuo
- Bitácora de IA
- README de entrega
- .prettierrc.json
- Calling a stored procedure from Sequelize
- Vue 2 + Vuetify 2 + Vite setup
- Requerimientos no funcionales
- AnimacionLottie.vue
- hook-de-claude-code/graphify-fuera-del-path.test.sh
- Grafo del proyecto
- comun.sh
- AIPOS
- Product
- Comandos útiles
- misma-version.test.sh
- ignora-lo-local.test.sh
- agents-md.test.sh
- CLAUDE.md
- entrega-trazable.md
- comunicacion-clara.md
- rules/lenguaje-ubicuo.md
- mysql-sequelize.md
- Design System: AIPOS
- sin-rutas-ni-evals.test.sh
- update-sin-cambios.test.sh
- hook-de-claude-code/sin-graphify.test.sh
- agrega-el-grafo.test.sh
- graphify-falla.test.sh
- hook-de-git/sin-graphify.test.sh
- hook-de-git/graphify-fuera-del-path.test.sh
- otra-version.test.sh
- FormularioProducto.test.js
- Arquitectura de AIPOS
- marca-de-commit.test.sh
- version-con-crlf.test.sh
- desactualizado-tras-falla.test.sh
- merge-sin-choques.test.sh
- merge-sin-cambios-en-el-grafo.test.sh
- spec-arquitectura.test.sh
- agents-md-tarjeta.test.sh
- FormularioProducto.vue
- vitest
- venta-vacia.test.js
- Vuetify 2 components (Vue 2.7)
- Requerimientos funcionales
- vue2-vuetify2.md
- Requerimientos de AIPOS
- Grafo del proyecto
- Alcance
- graphify-setup.md
- Flujo 05 · Entregar un entregable
- Flujo 01 · Crear producto
- Flujo 02 · Buscar producto
- Flujo 03 · Armar la venta actual
- Flujo 04 · Registrar venta
- Flujo 00 · Mapa de procesos
- Flujo 06 · Trabajar una tarjeta con el agente

## God Nodes (most connected - your core abstractions)
1. `vitest` - 14 edges
2. `Requerimientos funcionales` - 14 edges
3. `Requerimientos no funcionales` - 14 edges
4. `Arquitectura de AIPOS` - 13 edges
5. `Product` - 11 edges
6. `Grafo del proyecto` - 10 edges
7. `Flujo de un entregable` - 10 edges
8. `scripts` - 9 edges
9. `Configurar el MCP de Trello` - 9 edges
10. `Design System: AIPOS` - 9 edges

## Surprising Connections (you probably didn't know these)
- `La venta actual` --references--> `calcularTotal()`  [INFERRED]
  specs/arquitectura.spec.md → frontend/src/ventaActual/ventaActual.js
- `Carpetas` --references--> `crearProducto()`  [INFERRED]
  specs/arquitectura.spec.md → frontend/src/api/productos.js
- `Servicio de API` --references--> `crearProducto()`  [INFERRED]
  specs/arquitectura.spec.md → frontend/src/api/productos.js
- `Negocio` --references--> `total()`  [INFERRED]
  docs/lenguaje-ubicuo.md → frontend/src/components/VentaActual.vue
- `RF-10 Guardar productos, ventas y detalles con sus relaciones` --references--> `total()`  [INFERRED]
  requerimientos/02-requerimientos-funcionales.md → frontend/src/components/VentaActual.vue

## Import Cycles
- None detected.

## Communities (83 total, 41 thin omitted)

### Community 1 - "Configurar el MCP de Trello"
Cohesion: 0.18
Nodes (11): 1. Crear el board en Trello, 2. Obtener el API key, 3. Generar el token, 4. Agregar el servidor a Claude Code, 5. Verificar la conexión, Alternativa: Codex CLI, Configurar el MCP de Trello, Requisitos (+3 more)

### Community 2 - "dependencies"
Cohesion: 0.12
Nodes (16): agents, dependencies, g14wxz/entrega-trazable, g14wxz/grafo-del-proyecto, g14wxz/lenguaje-ubicuo, g14wxz/mysql-sequelize-procedimientos, g14wxz/vue2-vuetify2-vite, tessl-labs/spec-driven-development (+8 more)

### Community 3 - "Trabajar en un tile"
Cohesion: 0.14
Nodes (14): 1. Instalar Tessl, 2. Instalar los tiles del proyecto, 3. Conectar el MCP de Tessl (opcional), 4. Verificar, 5. Cambiar un tile, 6. Medir un tile con evals (necesita cuenta), 7. Publicar un tile (necesita cuenta), Qué va a git y qué no (+6 more)

### Community 4 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-vue, globals, jsdom, prettier (+6 more)

### Community 6 - "vitest-vue2.test.js"
Cohesion: 0.07
Nodes (21): es, animacion, { loadAnimation, instancias }, paquete, archivosDe(), componentes, enSrc(), fueraDeApi (+13 more)

### Community 7 - "Flujo de un entregable"
Cohesion: 0.18
Nodes (10): 0. Revisar el repositorio (una vez por proyecto), 1. Empezar el entregable, 2. Trabajar, 3. Abrir el PR, 4. Revisar antes de integrar, 5. Integrar, 6. Etiquetar, 7. Entrega final (+2 more)

### Community 8 - "NuevoProducto.test.js"
Cohesion: 0.15
Nodes (10): abrirLlenarYGuardar(), boton(), botonNuevo(), dialogo(), entrada(), escribir(), esperar(), { loadAnimation, instancias } (+2 more)

### Community 10 - "Entregables y tarjetas"
Cohesion: 0.18
Nodes (11): Definición de terminado, Entrega final, Entregable productos, Entregable ventas, Entregables y tarjetas, Ramas de tarjeta, Requerimientos, Secuencia de los entregables (+3 more)

### Community 11 - "package.json"
Cohesion: 0.06
Nodes (33): dependencies, axios, lottie-web, @mdi/font, vue, vuetify, description, engines (+25 more)

### Community 12 - "Glosario de lenguaje ubicuo"
Cohesion: 0.22
Nodes (7): Plantilla: docs/lenguaje-ubicuo.md, Crear el glosario, Cuando aparece una palabra nueva o dudosa, Cuando un término cambia, Cómo escribir cada entrada, Glosario de lenguaje ubicuo, Revisar si el código habla igual que el negocio

### Community 13 - "Bitácora de IA"
Cohesion: 0.25
Nodes (6): Plantilla: docs/bitacora-ia.md, Bitácora de IA, Cuándo escribir, Cómo escribir una entrada, Reconstruir desde git, Reglas

### Community 14 - "README de entrega"
Cohesion: 0.29
Nodes (5): Plantilla: README.md de entrega, De dónde sale cada punto, Flujo, README de entrega, Reglas

### Community 15 - ".prettierrc.json"
Cohesion: 0.50
Nodes (3): printWidth, singleQuote, trailingComma

### Community 16 - "Calling a stored procedure from Sequelize"
Cohesion: 0.29
Nodes (6): 1. Service, 2. No outer transaction, 3. Validate before calling, 4. Map database errors to HTTP, 5. Search products by name or barcode, Calling a stored procedure from Sequelize

### Community 17 - "Vue 2 + Vuetify 2 + Vite setup"
Cohesion: 0.29
Nodes (6): 1. Versions, 2. Project files, 3. Environment and API client, 4. ESLint (optional), 5. Check, Vue 2 + Vuetify 2 + Vite setup

### Community 18 - "Requerimientos no funcionales"
Cohesion: 0.14
Nodes (14): Requerimientos no funcionales, RNF-01 Una sola pantalla, RNF-02 Tecnologías y versiones, RNF-03 Validación en tres lugares, RNF-04 Seguridad básica, RNF-05 Manejo de errores, RNF-06 Arquitectura en capas, RNF-07 Base de datos reproducible (+6 more)

### Community 19 - "AnimacionLottie.vue"
Cohesion: 0.36
Nodes (7): animacion(), beforeDestroy(), crear(), destruir(), mounted(), pideMenosMovimiento(), lottie-web

### Community 21 - "Grafo del proyecto"
Cohesion: 0.33
Nodes (5): Al terminar una tarea, Antes de empezar una tarea, Antes de integrar un PR, Cuándo no usarlo, Grafo del proyecto

### Community 23 - "AIPOS"
Cohesion: 0.25
Nodes (7): Agent Rules <!-- tessl-managed -->, AIPOS, Antes de empezar, Cómo tomar una tarjeta, Decisiones de diseño, Nada depende de una sesión ni de una máquina, Qué es AIPOS

### Community 24 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 25 - "Comandos útiles"
Cohesion: 0.15
Nodes (13): 1. Instalar Graphify, 2. Activar el hook de git, 3. Verificar, Antes de integrar un PR, Comandos útiles, Flujo de una tarea, Privacidad, Qué es y para qué sirve (+5 more)

### Community 27 - "ignora-lo-local.test.sh"
Cohesion: 0.83
Nodes (3): debe_ignorar(), no_debe_ignorar(), ignora-lo-local.test.sh script

### Community 35 - "Design System: AIPOS"
Cohesion: 0.20
Nodes (9): Colors, Components, Design System: AIPOS, Do's and Don'ts, Elevation & Depth, Layout, Overview, Shapes (+1 more)

### Community 44 - "FormularioProducto.test.js"
Cohesion: 0.27
Nodes (14): boton(), dialogo(), entrada(), escribir(), esperar(), etiquetaDe(), franja(), guardarConError() (+6 more)

### Community 45 - "Arquitectura de AIPOS"
Cohesion: 0.06
Nodes (33): Convención de nombres en código, Herramientas y proceso, Historial de cambios, Lenguaje ubicuo — AIPOS, Negocio, Pendientes (por confirmar), crearProducto(), Arquitectura de AIPOS (+25 more)

### Community 53 - "spec-arquitectura.test.sh"
Cohesion: 0.90
Nodes (4): falla(), ok(), revisar(), spec-arquitectura.test.sh script

### Community 55 - "FormularioProducto.vue"
Cohesion: 0.10
Nodes (29): alAbrir(), alSalir(), cancelar(), cerrar(), data(), enfocar(), enlazarTitulo(), guardar() (+21 more)

### Community 56 - "vitest"
Cohesion: 0.13
Nodes (14): crearError(), http, traducirError(), aHex(), buscar(), carpeta, coloresDe(), paleta (+6 more)

### Community 57 - "venta-vacia.test.js"
Cohesion: 0.12
Nodes (17): data(), total(), aCentavos(), formatearCentavos(), calcularSubtotal(), calcularTotal(), vaciarVentaActual(), congelar() (+9 more)

### Community 58 - "Vuetify 2 components (Vue 2.7)"
Cohesion: 0.33
Nodes (5): Custom v-model, Example: point-of-sale screen, Reactivity, Vue 3 / Vuetify 3 habit and its Vue 2 / Vuetify 2 form, Vuetify 2 components (Vue 2.7)

### Community 61 - "Requerimientos funcionales"
Cohesion: 0.15
Nodes (13): Reglas de negocio, Requerimientos funcionales, RF-01 Crear producto, RF-02 Buscar producto, RF-03 Agregar a la venta actual, RF-04 Ver los detalles de la venta actual, RF-05 Editar el precio aplicado, RF-06 Cambiar la cantidad (+5 more)

### Community 66 - "Requerimientos de AIPOS"
Cohesion: 0.33
Nodes (6): Aspectos que se evaluarán, Cómo leer esta carpeta, Flujos, Matriz del PDF, Preguntas abiertas, Requerimientos de AIPOS

### Community 67 - "Grafo del proyecto"
Cohesion: 0.18
Nodes (10): Arranque de un clon nuevo, Grafo del proyecto, Hook de Claude Code, Hook de git `pre-commit`, Proceso escrito, Qué entra al grafo, Qué no se usa, Qué va a git (+2 more)

### Community 72 - "Alcance"
Cohesion: 0.20
Nodes (9): Actores y partes, Alcance, Fuera de alcance, Lo que agregamos y el PDF no pide, Objetivo, Qué entra, Restricciones, Riesgos (+1 more)

### Community 73 - "graphify-setup.md"
Cohesion: 0.31
Nodes (4): AIPOS, Grafo del proyecto, Setup de agents, Tiles de Tessl

### Community 74 - "Flujo 05 · Entregar un entregable"
Cohesion: 0.40
Nodes (5): Entrega final, Flujo 05 · Entregar un entregable, Otros caminos, Pasos, Qué no se hace

### Community 77 - "Flujo 01 · Crear producto"
Cohesion: 0.50
Nodes (4): Flujo 01 · Crear producto, Notas técnicas, Otros caminos, Pasos

### Community 78 - "Flujo 02 · Buscar producto"
Cohesion: 0.50
Nodes (4): Flujo 02 · Buscar producto, Notas técnicas, Otros caminos, Pasos

### Community 79 - "Flujo 03 · Armar la venta actual"
Cohesion: 0.50
Nodes (4): Flujo 03 · Armar la venta actual, Notas técnicas, Otros caminos, Pasos

### Community 80 - "Flujo 04 · Registrar venta"
Cohesion: 0.50
Nodes (4): Flujo 04 · Registrar venta, Notas técnicas, Otros caminos, Pasos

### Community 81 - "Flujo 00 · Mapa de procesos"
Cohesion: 0.67
Nodes (3): Desarrollo de AIPOS, Flujo 00 · Mapa de procesos, Operación del POS

### Community 82 - "Flujo 06 · Trabajar una tarjeta con el agente"
Cohesion: 0.67
Nodes (3): Flujo 06 · Trabajar una tarjeta con el agente, Otros caminos, Pasos

## Knowledge Gaps
- **292 isolated node(s):** `singleQuote`, `printWidth`, `trailingComma`, `name`, `version` (+287 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 374 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **41 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `crearProducto()` connect `Arquitectura de AIPOS` to `vitest`, `NuevoProducto.test.js`, `FormularioProducto.test.js`, `FormularioProducto.vue`?**
  _High betweenness centrality (0.182) - this node is a cross-community bridge._
- **Why does `Negocio` connect `Arquitectura de AIPOS` to `venta-vacia.test.js`?**
  _High betweenness centrality (0.154) - this node is a cross-community bridge._
- **Why does `Lenguaje ubicuo — AIPOS` connect `Arquitectura de AIPOS` to `graphify-setup.md`?**
  _High betweenness centrality (0.148) - this node is a cross-community bridge._
- **What connects `singleQuote`, `printWidth`, `trailingComma` to the rest of the system?**
  _292 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Trabajar en un tile` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
