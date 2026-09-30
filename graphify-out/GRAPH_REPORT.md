# Graph Report - p-01  (2026-09-30)

## Corpus Check
- 106 files · ~54,195 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 19 file(s) not represented in the graph (top: (none) 10, .drawio 7, .example 2)

## Summary
- 597 nodes · 735 edges · 67 communities (32 shown, 35 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- En AIPOS, el hook de git `pre-commit` actualiza este grafo en cada commit: va al día con el commit que lo trae.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- requerimientos/README.md
- scripts
- dependencies
- Trabajar en un tile
- Requerimientos funcionales
- Requerimientos no funcionales
- Grafo del proyecto
- Flujo de un entregable
- productos-restricciones.test.js
- saltos-de-linea.test.sh
- Entregables y tarjetas
- package.json
- Glosario de lenguaje ubicuo
- Bitácora de IA
- README de entrega
- MySQL stored procedure authoring
- Calling a stored procedure from Sequelize
- Vue 2 + Vuetify 2 + Vite setup
- Vuetify 2 components (Vue 2.7)
- hook-de-claude-code/graphify-fuera-del-path.test.sh
- Grafo del proyecto
- comun.sh
- AIPOS
- Arquitectura de AIPOS
- Comandos útiles
- misma-version.test.sh
- ignora-lo-local.test.sh
- agents-md.test.sh
- CLAUDE.md
- errorHandler.js
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
- src/config.js
- marca-de-commit.test.sh
- version-con-crlf.test.sh
- desactualizado-tras-falla.test.sh
- merge-sin-choques.test.sh
- merge-sin-cambios-en-el-grafo.test.sh
- database.test.js
- spec-arquitectura.test.sh
- agents-md-tarjeta.test.sh
- .prettierrc.json
- migraciones.test.js
- salud-con-base.test.js
- app.js

## God Nodes (most connected - your core abstractions)
1. `vitest` - 19 edges
2. `scripts` - 15 edges
3. `Requerimientos funcionales` - 14 edges
4. `Requerimientos no funcionales` - 14 edges
5. `Arquitectura de AIPOS` - 13 edges
6. `cargarConfig()` - 10 edges
7. `Grafo del proyecto` - 10 edges
8. `Flujo de un entregable` - 10 edges
9. `crearApp()` - 9 edges
10. `Configurar el MCP de Trello` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Carpetas` --references--> `test()`  [INFERRED]
  specs/arquitectura.spec.md → backend/db/config.js
- `Git y entrega` --references--> `test()`  [INFERRED]
  specs/arquitectura.spec.md → backend/db/config.js
- `Entrega trazable` --references--> `test()`  [INFERRED]
  tessl-plugins/entrega-trazable/rules/entrega-trazable.md → backend/db/config.js
- `Herramientas y proceso` --references--> `production()`  [INFERRED]
  docs/lenguaje-ubicuo.md → backend/db/config.js
- `Capas` --references--> `ErrorApi`  [INFERRED]
  specs/arquitectura.spec.md → backend/src/errors/ErrorApi.js

## Import Cycles
- None detected.

## Communities (67 total, 35 thin omitted)

### Community 0 - "requerimientos/README.md"
Cohesion: 0.06
Nodes (33): Desarrollo de AIPOS, Flujo 00 · Mapa de procesos, Operación del POS, Flujo 01 · Crear producto, Notas técnicas, Otros caminos, Pasos, Flujo 02 · Buscar producto (+25 more)

### Community 1 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, deshacer, deshacer:prueba, dev, format, format:check, lint, migrar (+7 more)

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

### Community 6 - "Grafo del proyecto"
Cohesion: 0.05
Nodes (35): Convención de nombres en código, Historial de cambios, Lenguaje ubicuo — AIPOS, Negocio, Pendientes (por confirmar), 1. Crear el board en Trello, 2. Obtener el API key, 3. Generar el token (+27 more)

### Community 7 - "Flujo de un entregable"
Cohesion: 0.18
Nodes (10): 0. Revisar el repositorio (una vez por proyecto), 1. Empezar el entregable, 2. Trabajar, 3. Abrir el PR, 4. Revisar antes de integrar, 5. Integrar, 6. Etiquetar, 7. Entrega final (+2 more)

### Community 8 - "productos-restricciones.test.js"
Cohesion: 0.31
Nodes (8): conTransaccionDescartada(), errorDeMySQL(), insertarProducto(), require, sequelize, guardar(), textosInvalidos, valido

### Community 10 - "Entregables y tarjetas"
Cohesion: 0.18
Nodes (11): Definición de terminado, Entrega final, Entregable productos, Entregable ventas, Entregables y tarjetas, Ramas de tarjeta, Requerimientos, Secuencia de los entregables (+3 more)

### Community 11 - "package.json"
Cohesion: 0.07
Nodes (30): dependencies, cors, dotenv, express, helmet, mysql2, sequelize, sequelize-cli (+22 more)

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

### Community 19 - "Vuetify 2 components (Vue 2.7)"
Cohesion: 0.33
Nodes (5): Custom v-model, Example: point-of-sale screen, Reactivity, Vue 3 / Vuetify 3 habit and its Vue 2 / Vuetify 2 form, Vuetify 2 components (Vue 2.7)

### Community 21 - "Grafo del proyecto"
Cohesion: 0.33
Nodes (5): Al terminar una tarea, Antes de empezar una tarea, Antes de integrar un PR, Cuándo no usarlo, Grafo del proyecto

### Community 23 - "AIPOS"
Cohesion: 0.25
Nodes (7): Agent Rules <!-- tessl-managed -->, AIPOS, Antes de empezar, Cómo tomar una tarjeta, Decisiones de diseño, Nada depende de una sesión ni de una máquina, Qué es AIPOS

### Community 24 - "Arquitectura de AIPOS"
Cohesion: 0.10
Nodes (20): test(), Arquitectura de AIPOS, Base de datos, Calidad, Carpetas, Cómo se decide un diseño, Dinero, Diseño de la pantalla (+12 more)

### Community 25 - "Comandos útiles"
Cohesion: 0.15
Nodes (13): 1. Instalar Graphify, 2. Activar el hook de git, 3. Verificar, Antes de integrar un PR, Comandos útiles, Flujo de una tarea, Privacidad, Qué es y para qué sirve (+5 more)

### Community 27 - "ignora-lo-local.test.sh"
Cohesion: 0.83
Nodes (3): debe_ignorar(), no_debe_ignorar(), ignora-lo-local.test.sh script

### Community 31 - "errorHandler.js"
Cohesion: 0.13
Nodes (19): desdeBaseDeDatos(), ErrorApi, ErrorApi, ESTADOS, aErrorApi(), desdeBaseDeDatos, desdeElCuerpo(), ErrorApi (+11 more)

### Community 44 - "Alcance"
Cohesion: 0.22
Nodes (9): Actores y partes, Alcance, Fuera de alcance, Lo que agregamos y el PDF no pide, Objetivo, Qué entra, Restricciones, Riesgos (+1 more)

### Community 45 - "src/config.js"
Cohesion: 0.15
Nodes (19): { cargarConfig, cargarArchivoEnv }, development(), paraElCli(), production(), crearBaseDePrueba(), cargarArchivoEnv(), cargarConfig(), dotenv (+11 more)

### Community 52 - "database.test.js"
Cohesion: 0.10
Nodes (16): { config }, { Sequelize }, sequelize, app, { config }, servidor, { DataTypes }, require (+8 more)

### Community 53 - "spec-arquitectura.test.sh"
Cohesion: 0.90
Nodes (4): falla(), ok(), revisar(), spec-arquitectura.test.sh script

### Community 56 - ".prettierrc.json"
Cohesion: 0.50
Nodes (3): printWidth, singleQuote, trailingComma

### Community 65 - "migraciones.test.js"
Cohesion: 0.06
Nodes (30): carpetaBackend, carpetaRaiz, correrCli(), correrNpm(), correrNpmSinFallar(), tablasDeLaBase(), consultar(), permisosDelUsuario() (+22 more)

### Community 66 - "salud-con-base.test.js"
Cohesion: 0.17
Nodes (10): { consultarSalud }, obtenerSalud(), { obtenerSalud }, { Router }, conLimiteDeTiempo(), consultarSalud(), sequelize, app (+2 more)

### Community 67 - "app.js"
Cohesion: 0.07
Nodes (35): app, cors, crearApp(), { crearRouterApi, montajes: montajesDeLaApi }, errorHandler, express, helmet, noEncontrado (+27 more)

## Knowledge Gaps
- **328 isolated node(s):** `singleQuote`, `printWidth`, `trailingComma`, `{ cargarConfig, cargarArchivoEnv }`, `name` (+323 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 384 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **35 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Arquitectura de AIPOS` connect `Arquitectura de AIPOS` to `requerimientos/README.md`, `errorHandler.js`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._
- **Why does `Lenguaje ubicuo — AIPOS` connect `Grafo del proyecto` to `src/config.js`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **What connects `singleQuote`, `printWidth`, `trailingComma` to the rest of the system?**
  _328 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `requerimientos/README.md` be split into smaller, more focused modules?**
  _Cohesion score 0.06280193236714976 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Trabajar en un tile` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
