# Graph Report - p-04  (2026-09-30)

## Corpus Check
- 152 files · ~74,542 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 22 file(s) not represented in the graph (top: (none) 12, .drawio 7, .example 2)

## Summary
- 924 nodes · 1267 edges · 101 communities (63 shown, 38 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 34 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- En AIPOS, el hook de git `pre-commit` actualiza este grafo en cada commit: va al día con el commit que lo trae.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- requerimientos/README.md
- Grafo del proyecto
- dependencies
- Usar los tiles del proyecto
- AnimacionLottie.vue
- Requerimientos no funcionales
- vuetify.js
- Flujo de un entregable
- Configurar el MCP de Trello
- saltos-de-linea.test.sh
- Entregables y tarjetas
- frontend/package.json
- Glosario de lenguaje ubicuo
- Bitácora de IA
- README de entrega
- frontend/.prettierrc.json
- Calling a stored procedure from Sequelize
- Vue 2 + Vuetify 2 + Vite setup
- documentacion.js
- comparar-rutas.test.js
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
- src/config.js
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
- ejemplos-reales.test.js
- Arquitectura de AIPOS
- marca-de-commit.test.sh
- version-con-crlf.test.sh
- desactualizado-tras-falla.test.sh
- merge-sin-choques.test.sh
- merge-sin-cambios-en-el-grafo.test.sh
- spec-arquitectura.test.sh
- agents-md-tarjeta.test.sh
- errorHandler.js
- devDependencies
- venta-vacia.test.js
- http.js
- ref_vitest
- Requerimientos funcionales
- backend/package.json
- scripts
- app.js
- database.js
- vitest-vue2.test.js
- routes/salud.js
- estructura.test.js
- ref_node_path
- servidor.test.js
- scripts
- base-de-prueba.test.js
- eslint.config.js
- modelos.test.js
- dependencies
- pantalla-unica.test.js
- backend/.prettierrc.json
- tema.test.js
- AnimacionLottie.test.js
- glosario-y-alcance.test.sh
- dependencies
- productos-migracion.test.js
- devDependencies
- ref_node_fs
- Trabajar en un tile
- docs.js
- errores.test.js
- sin-axios-en-componentes.test.js
- Lenguaje ubicuo — AIPOS
- dependencias.test.js
- animaciones.test.js
- Qué es y para qué sirve
- scarfSettings

## God Nodes (most connected - your core abstractions)
1. `scripts` - 15 edges
2. `Requerimientos funcionales` - 14 edges
3. `Requerimientos no funcionales` - 14 edges
4. `Arquitectura de AIPOS` - 13 edges
5. `supertest` - 12 edges
6. `express` - 11 edges
7. `crearApp()` - 11 edges
8. `cargarDocumentacionApi()` - 11 edges
9. `Product` - 11 edges
10. `texto()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Negocio` --references--> `total()`  [INFERRED]
  docs/lenguaje-ubicuo.md → frontend/src/components/VentaActual.vue
- `RF-10 Guardar productos, ventas y detalles con sus relaciones` --references--> `total()`  [INFERRED]
  requerimientos/02-requerimientos-funcionales.md → frontend/src/components/VentaActual.vue
- `La venta actual` --references--> `calcularTotal()`  [INFERRED]
  specs/arquitectura.spec.md → frontend/src/ventaActual/ventaActual.js
- `Carpetas` --references--> `test()`  [INFERRED]
  specs/arquitectura.spec.md → backend/db/config.js
- `Git y entrega` --references--> `test()`  [INFERRED]
  specs/arquitectura.spec.md → backend/db/config.js

## Import Cycles
- None detected.

## Communities (101 total, 38 thin omitted)

### Community 0 - "requerimientos/README.md"
Cohesion: 0.05
Nodes (42): Actores y partes, Alcance, Fuera de alcance, Lo que agregamos y el PDF no pide, Objetivo, Qué entra, Restricciones, Riesgos (+34 more)

### Community 1 - "Grafo del proyecto"
Cohesion: 0.20
Nodes (10): Arranque de un clon nuevo, Grafo del proyecto, Hook de Claude Code, Hook de git `pre-commit`, Proceso escrito, Qué entra al grafo, Qué no se usa, Qué va a git (+2 more)

### Community 2 - "dependencies"
Cohesion: 0.12
Nodes (16): agents, dependencies, g14wxz/entrega-trazable, g14wxz/grafo-del-proyecto, g14wxz/lenguaje-ubicuo, g14wxz/mysql-sequelize-procedimientos, g14wxz/vue2-vuetify2-vite, tessl-labs/spec-driven-development (+8 more)

### Community 3 - "Usar los tiles del proyecto"
Cohesion: 0.29
Nodes (7): 1. Instalar Tessl, 2. Instalar los tiles del proyecto, 3. Conectar el MCP de Tessl (opcional), 4. Verificar, Requisitos, Setup de Tessl, Usar los tiles del proyecto

### Community 4 - "AnimacionLottie.vue"
Cohesion: 0.13
Nodes (15): animacion(), beforeDestroy(), crear(), destruir(), mounted(), pideMenosMovimiento(), Diseño de la pantalla, Paleta (+7 more)

### Community 5 - "Requerimientos no funcionales"
Cohesion: 0.14
Nodes (14): Requerimientos no funcionales, RNF-01 Una sola pantalla, RNF-02 Tecnologías y versiones, RNF-03 Validación en tres lugares, RNF-04 Seguridad básica, RNF-05 Manejo de errores, RNF-06 Arquitectura en capas, RNF-07 Base de datos reproducible (+6 more)

### Community 6 - "vuetify.js"
Cohesion: 0.47
Nodes (4): es, @mdi/font, vue, vuetify

### Community 7 - "Flujo de un entregable"
Cohesion: 0.18
Nodes (10): 0. Revisar el repositorio (una vez por proyecto), 1. Empezar el entregable, 2. Trabajar, 3. Abrir el PR, 4. Revisar antes de integrar, 5. Integrar, 6. Etiquetar, 7. Entrega final (+2 more)

### Community 8 - "Configurar el MCP de Trello"
Cohesion: 0.18
Nodes (11): 1. Crear el board en Trello, 2. Obtener el API key, 3. Generar el token, 4. Agregar el servidor a Claude Code, 5. Verificar la conexión, Alternativa: Codex CLI, Configurar el MCP de Trello, Requisitos (+3 more)

### Community 10 - "Entregables y tarjetas"
Cohesion: 0.18
Nodes (11): Definición de terminado, Entrega final, Entregable productos, Entregable ventas, Entregables y tarjetas, Ramas de tarjeta, Requerimientos, Secuencia de los entregables (+3 more)

### Community 11 - "frontend/package.json"
Cohesion: 0.11
Nodes (18): description, engines, node, eslint, eslint-config-prettier, @eslint/js, globals, prettier (+10 more)

### Community 12 - "Glosario de lenguaje ubicuo"
Cohesion: 0.22
Nodes (7): Plantilla: docs/lenguaje-ubicuo.md, Crear el glosario, Cuando aparece una palabra nueva o dudosa, Cuando un término cambia, Cómo escribir cada entrada, Glosario de lenguaje ubicuo, Revisar si el código habla igual que el negocio

### Community 13 - "Bitácora de IA"
Cohesion: 0.25
Nodes (6): Plantilla: docs/bitacora-ia.md, Bitácora de IA, Cuándo escribir, Cómo escribir una entrada, Reconstruir desde git, Reglas

### Community 14 - "README de entrega"
Cohesion: 0.29
Nodes (5): Plantilla: README.md de entrega, De dónde sale cada punto, Flujo, README de entrega, Reglas

### Community 15 - "frontend/.prettierrc.json"
Cohesion: 0.50
Nodes (3): printWidth, singleQuote, trailingComma

### Community 16 - "Calling a stored procedure from Sequelize"
Cohesion: 0.29
Nodes (6): 1. Service, 2. No outer transaction, 3. Validate before calling, 4. Map database errors to HTTP, 5. Search products by name or barcode, Calling a stored procedure from Sequelize

### Community 17 - "Vue 2 + Vuetify 2 + Vite setup"
Cohesion: 0.29
Nodes (6): 1. Versions, 2. Project files, 3. Environment and API client, 4. ESLint (optional), 5. Check, Vue 2 + Vuetify 2 + Vite setup

### Community 18 - "documentacion.js"
Cohesion: 0.05
Nodes (36): cargarDocumentacionApi(), fs, { parse }, path, RUTA_DEL_DOCUMENTO, archivosJs(), backend, raiz (+28 more)

### Community 19 - "comparar-rutas.test.js"
Cohesion: 0.11
Nodes (22): { cargarDocumentacionApi }, { crearApp }, docs, documentadas, documento, { montajes }, require, { Router } (+14 more)

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
Cohesion: 0.25
Nodes (8): Antes de integrar un PR, Comandos útiles, Flujo de una tarea, Privacidad, Qué no usamos, y por qué, Qué va a git y qué no, Setup de Graphify, Solución de problemas

### Community 27 - "ignora-lo-local.test.sh"
Cohesion: 0.83
Nodes (3): debe_ignorar(), no_debe_ignorar(), ignora-lo-local.test.sh script

### Community 31 - "src/config.js"
Cohesion: 0.14
Nodes (20): { cargarConfigDeEntorno, cargarArchivoEnv }, development(), paraElCli(), production(), crearBaseDePrueba(), cargarArchivoEnv(), cargarConfig(), cargarConfigDeEntorno() (+12 more)

### Community 35 - "Design System: AIPOS"
Cohesion: 0.20
Nodes (9): Colors, Components, Design System: AIPOS, Do's and Don'ts, Elevation & Depth, Layout, Overview, Shapes (+1 more)

### Community 44 - "ejemplos-reales.test.js"
Cohesion: 0.13
Nodes (12): app, { cargarDocumentacionApi }, documento, problemas(), require, { Router }, app, { crearApp } (+4 more)

### Community 45 - "Arquitectura de AIPOS"
Cohesion: 0.07
Nodes (28): test(), down(), up(), AIPOS, Base de datos: MySQL y migraciones, Base de prueba, Comandos del backend, Desde un clon limpio (+20 more)

### Community 53 - "spec-arquitectura.test.sh"
Cohesion: 0.90
Nodes (4): falla(), ok(), revisar(), spec-arquitectura.test.sh script

### Community 55 - "errorHandler.js"
Cohesion: 0.12
Nodes (20): desdeBaseDeDatos(), ErrorApi, ErrorApi, ESTADOS, aErrorApi(), desdeBaseDeDatos, desdeElCuerpo(), ErrorApi (+12 more)

### Community 56 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-vue, globals, jsdom, prettier (+6 more)

### Community 57 - "venta-vacia.test.js"
Cohesion: 0.13
Nodes (16): data(), total(), aCentavos(), formatearCentavos(), calcularSubtotal(), calcularTotal(), vaciarVentaActual(), congelar() (+8 more)

### Community 58 - "http.js"
Cohesion: 0.36
Nodes (5): crearError(), http, traducirError(), cargarHttp(), axios

### Community 61 - "ref_vitest"
Cohesion: 0.12
Nodes (11): require, sequelize, app, { cargarConfig }, config, { crearApp }, require, { escaparParaLike } (+3 more)

### Community 62 - "Requerimientos funcionales"
Cohesion: 0.14
Nodes (14): Reglas de negocio, Requerimientos funcionales, RF-01 Crear producto, RF-02 Buscar producto, RF-03 Agregar a la venta actual, RF-04 Ver los detalles de la venta actual, RF-05 Editar el precio aplicado, RF-06 Cambiar la cantidad (+6 more)

### Community 63 - "backend/package.json"
Cohesion: 0.12
Nodes (16): description, engines, node, eslint, eslint-config-prettier, @eslint/js, globals, prettier (+8 more)

### Community 65 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, deshacer, deshacer:prueba, dev, format, format:check, lint, migrar (+7 more)

### Community 66 - "app.js"
Cohesion: 0.19
Nodes (13): app, cors, crearApp(), { crearRouterApi, montajes: montajesDeLaApi }, errorHandler, express, helmet, noEncontrado (+5 more)

### Community 67 - "database.js"
Cohesion: 0.06
Nodes (33): { config }, { Sequelize }, Producto, sequelize, { DataTypes }, Producto, sequelize, app (+25 more)

### Community 72 - "vitest-vue2.test.js"
Cohesion: 0.20
Nodes (6): avisosAlInstalar, declaradas, espia, paquete, versionesDelFrontend, lottie-web

### Community 73 - "routes/salud.js"
Cohesion: 0.29
Nodes (7): { consultarSalud }, obtenerSalud(), { obtenerSalud }, { Router }, conLimiteDeTiempo(), consultarSalud(), sequelize

### Community 74 - "estructura.test.js"
Cohesion: 0.22
Nodes (6): archivosJs(), backend, paquete, raiz, require_, src

### Community 75 - "ref_node_path"
Cohesion: 0.18
Nodes (10): correrCli(), tablasDeLaBase(), archivos, cargarConfiguracion(), carpetaMigraciones, require, sequelize, tablasSinElRegistro() (+2 more)

### Community 76 - "servidor.test.js"
Cohesion: 0.33
Nodes (3): abrirUnPuerto(), backend, buscarPuertoLibre()

### Community 77 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, preview, test (+1 more)

### Community 78 - "base-de-prueba.test.js"
Cohesion: 0.18
Nodes (11): carpetaBackend, correrNpm(), correrNpmSinFallar(), consultar(), permisosDelUsuario(), require, sequelize, tablasDe() (+3 more)

### Community 80 - "modelos.test.js"
Cohesion: 0.29
Nodes (5): carpetaModelos, modelos, registrados, require, tablasDelGlosario

### Community 81 - "dependencies"
Cohesion: 0.33
Nodes (6): dependencies, axios, lottie-web, @mdi/font, vue, vuetify

### Community 83 - "backend/.prettierrc.json"
Cohesion: 0.50
Nodes (3): printWidth, singleQuote, trailingComma

### Community 85 - "AnimacionLottie.test.js"
Cohesion: 0.33
Nodes (3): animacion, { loadAnimation, instancias }, @vue/test-utils

### Community 86 - "glosario-y-alcance.test.sh"
Cohesion: 0.90
Nodes (4): falla(), fila_dice(), ok(), glosario-y-alcance.test.sh script

### Community 87 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, cors, dotenv, express, helmet, mysql2, sequelize, sequelize-cli (+3 more)

### Community 88 - "productos-migracion.test.js"
Cohesion: 0.29
Nodes (9): archivo, carpetaMigraciones, columnas(), indices(), leer(), require, restriccionesCheck(), sequelize (+1 more)

### Community 89 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, @apidevtools/swagger-parser, eslint, eslint-config-prettier, @eslint/js, globals, prettier, supertest (+1 more)

### Community 90 - "ref_node_fs"
Cohesion: 0.15
Nodes (6): carpetaRaiz, archivo, archivosJs(), ejemplo, raiz, carpetaBackend

### Community 91 - "Trabajar en un tile"
Cohesion: 0.29
Nodes (7): 5. Cambiar un tile, 6. Medir un tile con evals (necesita cuenta), 7. Publicar un tile (necesita cuenta), Qué va a git y qué no, Seguridad, Solución de problemas, Trabajar en un tile

### Community 92 - "docs.js"
Cohesion: 0.14
Nodes (15): { cargarDocumentacionApi }, DE_DEMOSTRACION, documento, helmet, { Router }, swaggerUi, app, docs (+7 more)

### Community 93 - "errores.test.js"
Cohesion: 0.25
Nodes (6): appConRuta(), { crearApp }, desdeBaseDeDatos, ErrorApi, express, require

### Community 94 - "sin-axios-en-componentes.test.js"
Cohesion: 0.29
Nodes (6): archivosDe(), componentes, enSrc(), fueraDeApi, raiz, todos

### Community 95 - "Lenguaje ubicuo — AIPOS"
Cohesion: 0.33
Nodes (6): Convención de nombres en código, Herramientas y proceso, Historial de cambios, Lenguaje ubicuo — AIPOS, Negocio, Pendientes (por confirmar)

### Community 96 - "dependencias.test.js"
Cohesion: 0.29
Nodes (5): backend, EN_DEPENDENCIES, EN_DEV_DEPENDENCIES, lock, paquete

### Community 97 - "animaciones.test.js"
Cohesion: 0.33
Nodes (5): aHex(), carpeta, coloresDe(), paleta, permitidas

### Community 98 - "Qué es y para qué sirve"
Cohesion: 0.40
Nodes (5): 1. Instalar Graphify, 2. Activar el hook de git, 3. Verificar, Qué es y para qué sirve, Requisitos

## Knowledge Gaps
- **493 isolated node(s):** `singleQuote`, `printWidth`, `trailingComma`, `{ cargarConfigDeEntorno, cargarArchivoEnv }`, `name` (+488 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 579 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `total()` connect `venta-vacia.test.js` to `Requerimientos funcionales`, `Lenguaje ubicuo — AIPOS`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Why does `Lenguaje ubicuo — AIPOS` connect `Lenguaje ubicuo — AIPOS` to `graphify-setup.md`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `Arquitectura de AIPOS` connect `Arquitectura de AIPOS` to `AnimacionLottie.vue`, `errorHandler.js`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **What connects `singleQuote`, `printWidth`, `trailingComma` to the rest of the system?**
  _493 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `requerimientos/README.md` be split into smaller, more focused modules?**
  _Cohesion score 0.050314465408805034 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `AnimacionLottie.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.13450292397660818 - nodes in this community are weakly interconnected._
