# Graph Report - p-02  (2026-09-30)

## Corpus Check
- 161 files · ~80,657 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 22 file(s) not represented in the graph (top: (none) 12, .drawio 7, .example 2)

## Summary
- 991 nodes · 1422 edges · 120 communities (77 shown, 43 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 44 edges (avg confidence: 0.9)
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
- Configurar el MCP de Trello
- saltos-de-linea.test.sh
- Entregables y tarjetas
- backend/package.json
- Glosario de lenguaje ubicuo
- Bitácora de IA
- README de entrega
- rutas-documentadas.test.js
- Calling a stored procedure from Sequelize
- Vue 2 + Vuetify 2 + Vite setup
- comparar-rutas.test.js
- Arquitectura de AIPOS
- hook-de-claude-code/graphify-fuera-del-path.test.sh
- Grafo del proyecto
- comun.sh
- AIPOS
- AnimacionLottie.vue
- Comandos útiles
- misma-version.test.sh
- ignora-lo-local.test.sh
- agents-md.test.sh
- CLAUDE.md
- validacion-comun.test.js
- comunicacion-clara.md
- rules/lenguaje-ubicuo.md
- mysql-sequelize.md
- Alcance
- sin-rutas-ni-evals.test.sh
- update-sin-cambios.test.sh
- hook-de-claude-code/sin-graphify.test.sh
- agrega-el-grafo.test.sh
- graphify-falla.test.sh
- hook-de-git/sin-graphify.test.sh
- hook-de-git/graphify-fuera-del-path.test.sh
- otra-version.test.sh
- modelo-producto.test.js
- src/config.js
- marca-de-commit.test.sh
- version-con-crlf.test.sh
- desactualizado-tras-falla.test.sh
- merge-sin-choques.test.sh
- merge-sin-cambios-en-el-grafo.test.sh
- validador-producto.test.js
- spec-arquitectura.test.sh
- agents-md-tarjeta.test.sh
- backend/.prettierrc.json
- ref_node_fs
- ref_node_path
- app.js
- base-de-prueba.test.js
- cargarDocumentacionApi
- productos-migracion.test.js
- AnimacionLottie.test.js
- Requerimientos de AIPOS
- estructura.test.js
- frontend/package.json
- devDependencies
- servidor.test.js
- estructura-del-documento.test.js
- Product
- modelos.test.js
- Design System: AIPOS
- vitest-vue2.test.js
- ejemplos-de-error.test.js
- scripts
- swagger-ui.test.js
- csp-docs.test.js
- ref_node_module
- http.js
- sin-axios-en-componentes.test.js
- archivos.test.js
- dependencias.test.js
- animaciones.test.js
- eslint.config.js
- ejemplos-reales.test.js
- dependencies
- ref_vitest
- Flujo 05 · Entregar un entregable
- pantalla-unica.test.js
- docs.js
- Flujo 01 · Crear producto
- Flujo 02 · Buscar producto
- glosario-y-alcance.test.sh
- frontend/.prettierrc.json
- dependencies
- Flujo 03 · Armar la venta actual
- documentacion.js
- Flujo 00 · Mapa de procesos
- routes/index.js
- scarfSettings
- services/salud.js
- devDependencies
- limite-del-cuerpo.test.js
- Flujo 04 · Registrar venta
- cors.test.js
- tema.test.js

## God Nodes (most connected - your core abstractions)
1. `scripts` - 15 edges
2. `supertest` - 14 edges
3. `Requerimientos funcionales` - 14 edges
4. `Requerimientos no funcionales` - 14 edges
5. `Arquitectura de AIPOS` - 13 edges
6. `texto()` - 12 edges
7. `cargarDocumentacionApi()` - 12 edges
8. `express` - 11 edges
9. `crearApp()` - 11 edges
10. `Product` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Carpetas` --references--> `test()`  [INFERRED]
  specs/arquitectura.spec.md → backend/db/config.js
- `Git y entrega` --references--> `test()`  [INFERRED]
  specs/arquitectura.spec.md → backend/db/config.js
- `Íconos y animaciones` --references--> `beforeDestroy()`  [INFERRED]
  specs/arquitectura.spec.md → frontend/src/components/AnimacionLottie.vue
- `La venta actual` --references--> `calcularTotal()`  [INFERRED]
  specs/arquitectura.spec.md → frontend/src/ventaActual/ventaActual.js
- `Entrega trazable` --references--> `test()`  [INFERRED]
  tessl-plugins/entrega-trazable/rules/entrega-trazable.md → backend/db/config.js

## Import Cycles
- None detected.

## Communities (120 total, 43 thin omitted)

### Community 0 - "requerimientos/README.md"
Cohesion: 0.29
Nodes (3): Flujo 06 · Trabajar una tarjeta con el agente, Otros caminos, Pasos

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
Cohesion: 0.06
Nodes (36): Convención de nombres en código, Herramientas y proceso, Historial de cambios, Lenguaje ubicuo — AIPOS, Negocio, Pendientes (por confirmar), data(), total() (+28 more)

### Community 5 - "Requerimientos no funcionales"
Cohesion: 0.14
Nodes (14): Requerimientos no funcionales, RNF-01 Una sola pantalla, RNF-02 Tecnologías y versiones, RNF-03 Validación en tres lugares, RNF-04 Seguridad básica, RNF-05 Manejo de errores, RNF-06 Arquitectura en capas, RNF-07 Base de datos reproducible (+6 more)

### Community 6 - "Grafo del proyecto"
Cohesion: 0.18
Nodes (10): Arranque de un clon nuevo, Grafo del proyecto, Hook de Claude Code, Hook de git `pre-commit`, Proceso escrito, Qué entra al grafo, Qué no se usa, Qué va a git (+2 more)

### Community 7 - "Flujo de un entregable"
Cohesion: 0.18
Nodes (10): 0. Revisar el repositorio (una vez por proyecto), 1. Empezar el entregable, 2. Trabajar, 3. Abrir el PR, 4. Revisar antes de integrar, 5. Integrar, 6. Etiquetar, 7. Entrega final (+2 more)

### Community 8 - "Configurar el MCP de Trello"
Cohesion: 0.18
Nodes (11): 1. Crear el board en Trello, 2. Obtener el API key, 3. Generar el token, 4. Agregar el servidor a Claude Code, 5. Verificar la conexión, Alternativa: Codex CLI, Configurar el MCP de Trello, Requisitos (+3 more)

### Community 10 - "Entregables y tarjetas"
Cohesion: 0.18
Nodes (11): Definición de terminado, Entrega final, Entregable productos, Entregable ventas, Entregables y tarjetas, Ramas de tarjeta, Requerimientos, Secuencia de los entregables (+3 more)

### Community 11 - "backend/package.json"
Cohesion: 0.12
Nodes (16): description, engines, node, eslint, eslint-config-prettier, @eslint/js, globals, prettier (+8 more)

### Community 12 - "Glosario de lenguaje ubicuo"
Cohesion: 0.22
Nodes (7): Plantilla: docs/lenguaje-ubicuo.md, Crear el glosario, Cuando aparece una palabra nueva o dudosa, Cuando un término cambia, Cómo escribir cada entrada, Glosario de lenguaje ubicuo, Revisar si el código habla igual que el negocio

### Community 13 - "Bitácora de IA"
Cohesion: 0.25
Nodes (6): Plantilla: docs/bitacora-ia.md, Bitácora de IA, Cuándo escribir, Cómo escribir una entrada, Reconstruir desde git, Reglas

### Community 14 - "README de entrega"
Cohesion: 0.29
Nodes (5): Plantilla: README.md de entrega, De dónde sale cada punto, Flujo, README de entrega, Reglas

### Community 15 - "rutas-documentadas.test.js"
Cohesion: 0.11
Nodes (19): compararRutas(), describirCapa(), app, { cargarDocumentacionApi }, carpetaDeRutas, docs, { montajes }, require (+11 more)

### Community 16 - "Calling a stored procedure from Sequelize"
Cohesion: 0.29
Nodes (6): 1. Service, 2. No outer transaction, 3. Validate before calling, 4. Map database errors to HTTP, 5. Search products by name or barcode, Calling a stored procedure from Sequelize

### Community 17 - "Vue 2 + Vuetify 2 + Vite setup"
Cohesion: 0.29
Nodes (6): 1. Versions, 2. Project files, 3. Environment and API client, 4. ESLint (optional), 5. Check, Vue 2 + Vuetify 2 + Vite setup

### Community 18 - "comparar-rutas.test.js"
Cohesion: 0.20
Nodes (8): { cargarDocumentacionApi }, { crearApp }, docs, documentadas, documento, { montajes }, require, { Router }

### Community 19 - "Arquitectura de AIPOS"
Cohesion: 0.07
Nodes (29): down(), up(), AIPOS, Base de datos: MySQL y migraciones, Base de prueba, Comandos del backend, Desde un clon limpio, Grafo del proyecto (+21 more)

### Community 21 - "Grafo del proyecto"
Cohesion: 0.33
Nodes (5): Al terminar una tarea, Antes de empezar una tarea, Antes de integrar un PR, Cuándo no usarlo, Grafo del proyecto

### Community 23 - "AIPOS"
Cohesion: 0.25
Nodes (7): Agent Rules <!-- tessl-managed -->, AIPOS, Antes de empezar, Cómo tomar una tarjeta, Decisiones de diseño, Nada depende de una sesión ni de una máquina, Qué es AIPOS

### Community 24 - "AnimacionLottie.vue"
Cohesion: 0.17
Nodes (12): animacion(), beforeDestroy(), crear(), destruir(), mounted(), pideMenosMovimiento(), Vue 2 + Vuetify 2 + Vite, Custom v-model (+4 more)

### Community 25 - "Comandos útiles"
Cohesion: 0.15
Nodes (13): 1. Instalar Graphify, 2. Activar el hook de git, 3. Verificar, Antes de integrar un PR, Comandos útiles, Flujo de una tarea, Privacidad, Qué es y para qué sirve (+5 more)

### Community 27 - "ignora-lo-local.test.sh"
Cohesion: 0.83
Nodes (3): debe_ignorar(), no_debe_ignorar(), ignora-lo-local.test.sh script

### Community 31 - "validacion-comun.test.js"
Cohesion: 0.09
Nodes (29): desdeBaseDeDatos(), ErrorApi, ErrorApi, ESTADOS, aErrorApi(), desdeBaseDeDatos, desdeElCuerpo(), ErrorApi (+21 more)

### Community 35 - "Alcance"
Cohesion: 0.22
Nodes (9): Actores y partes, Alcance, Fuera de alcance, Lo que agregamos y el PDF no pide, Objetivo, Qué entra, Restricciones, Riesgos (+1 more)

### Community 44 - "modelo-producto.test.js"
Cohesion: 0.18
Nodes (13): conTransaccionDescartada(), errorDeMySQL(), insertarProducto(), require, sequelize, carpetaSrc, leche, modelos (+5 more)

### Community 45 - "src/config.js"
Cohesion: 0.10
Nodes (25): { cargarConfigDeEntorno, cargarArchivoEnv }, development(), paraElCli(), production(), test(), crearBaseDePrueba(), cargarArchivoEnv(), cargarConfig() (+17 more)

### Community 52 - "validador-producto.test.js"
Cohesion: 0.22
Nodes (7): detallesDe(), ErrorApi, errorDe(), OBLIGATORIOS, require, { validarProductoNuevo }, valido

### Community 53 - "spec-arquitectura.test.sh"
Cohesion: 0.90
Nodes (4): falla(), ok(), revisar(), spec-arquitectura.test.sh script

### Community 56 - "backend/.prettierrc.json"
Cohesion: 0.50
Nodes (3): printWidth, singleQuote, trailingComma

### Community 65 - "ref_node_fs"
Cohesion: 0.15
Nodes (6): carpetaRaiz, archivo, archivosJs(), ejemplo, raiz, carpetaBackend

### Community 66 - "ref_node_path"
Cohesion: 0.19
Nodes (9): correrCli(), tablasDeLaBase(), archivos, cargarConfiguracion(), carpetaMigraciones, require, sequelize, tablasSinElRegistro() (+1 more)

### Community 67 - "app.js"
Cohesion: 0.25
Nodes (10): app, cors, crearApp(), { crearRouterApi, montajes: montajesDeLaApi }, errorHandler, express, helmet, noEncontrado (+2 more)

### Community 68 - "base-de-prueba.test.js"
Cohesion: 0.18
Nodes (11): carpetaBackend, correrNpm(), correrNpmSinFallar(), consultar(), permisosDelUsuario(), require, sequelize, tablasDe() (+3 more)

### Community 69 - "cargarDocumentacionApi"
Cohesion: 0.33
Nodes (6): cargarDocumentacionApi(), archivo, { cargarDocumentacionApi }, copiaRota(), require, @apidevtools/swagger-parser

### Community 70 - "productos-migracion.test.js"
Cohesion: 0.29
Nodes (9): archivo, carpetaMigraciones, columnas(), indices(), leer(), require, restriccionesCheck(), sequelize (+1 more)

### Community 71 - "AnimacionLottie.test.js"
Cohesion: 0.21
Nodes (7): es, animacion, { loadAnimation, instancias }, @mdi/font, vue, @vue/test-utils, vuetify

### Community 72 - "Requerimientos de AIPOS"
Cohesion: 0.33
Nodes (6): Aspectos que se evaluarán, Cómo leer esta carpeta, Flujos, Matriz del PDF, Preguntas abiertas, Requerimientos de AIPOS

### Community 73 - "estructura.test.js"
Cohesion: 0.22
Nodes (6): archivosJs(), backend, paquete, raiz, require_, src

### Community 74 - "frontend/package.json"
Cohesion: 0.11
Nodes (18): description, engines, node, eslint, eslint-config-prettier, @eslint/js, globals, prettier (+10 more)

### Community 75 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-vue, globals, jsdom, prettier (+6 more)

### Community 76 - "servidor.test.js"
Cohesion: 0.33
Nodes (3): abrirUnPuerto(), backend, buscarPuertoLibre()

### Community 77 - "estructura-del-documento.test.js"
Cohesion: 0.18
Nodes (11): { cargarDocumentacionApi }, DINERO, documento, ESTADOS_PERMITIDOS, METODOS, nombresDeCampos(), problemasDeDinero(), recorrer() (+3 more)

### Community 78 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 79 - "modelos.test.js"
Cohesion: 0.29
Nodes (5): carpetaModelos, modelos, registrados, require, tablasDelGlosario

### Community 80 - "Design System: AIPOS"
Cohesion: 0.20
Nodes (9): Colors, Components, Design System: AIPOS, Do's and Don'ts, Elevation & Depth, Layout, Overview, Shapes (+1 more)

### Community 81 - "vitest-vue2.test.js"
Cohesion: 0.20
Nodes (6): avisosAlInstalar, declaradas, espia, paquete, versionesDelFrontend, lottie-web

### Community 82 - "ejemplos-de-error.test.js"
Cohesion: 0.22
Nodes (6): { cargarDocumentacionApi }, documento, PROHIBIDO, recogerEjemplos(), require, RESPUESTAS_DE_ERROR

### Community 83 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, preview, test (+1 more)

### Community 84 - "swagger-ui.test.js"
Cohesion: 0.40
Nodes (3): app, { cargarDocumentacionApi }, require

### Community 85 - "csp-docs.test.js"
Cohesion: 0.31
Nodes (7): app, docs, express, helmet, politicaDe(), politicaDeHelmet(), require

### Community 86 - "ref_node_module"
Cohesion: 0.05
Nodes (47): { config }, { Sequelize }, Producto, sequelize, { DataTypes }, Producto, sequelize, require (+39 more)

### Community 87 - "http.js"
Cohesion: 0.36
Nodes (5): crearError(), http, traducirError(), cargarHttp(), axios

### Community 88 - "sin-axios-en-componentes.test.js"
Cohesion: 0.29
Nodes (6): archivosDe(), componentes, enSrc(), fueraDeApi, raiz, todos

### Community 89 - "archivos.test.js"
Cohesion: 0.29
Nodes (5): archivosJs(), backend, raiz, require, src

### Community 90 - "dependencias.test.js"
Cohesion: 0.29
Nodes (5): backend, EN_DEPENDENCIES, EN_DEV_DEPENDENCIES, lock, paquete

### Community 91 - "animaciones.test.js"
Cohesion: 0.33
Nodes (5): aHex(), carpeta, coloresDe(), paleta, permitidas

### Community 93 - "ejemplos-reales.test.js"
Cohesion: 0.25
Nodes (6): app, { cargarDocumentacionApi }, documento, problemas(), require, { Router }

### Community 94 - "dependencies"
Cohesion: 0.33
Nodes (6): dependencies, axios, lottie-web, @mdi/font, vue, vuetify

### Community 95 - "ref_vitest"
Cohesion: 0.18
Nodes (8): appConRuta(), { crearApp }, desdeBaseDeDatos, ErrorApi, express, require, require, supertest

### Community 96 - "Flujo 05 · Entregar un entregable"
Cohesion: 0.40
Nodes (5): Entrega final, Flujo 05 · Entregar un entregable, Otros caminos, Pasos, Qué no se hace

### Community 98 - "docs.js"
Cohesion: 0.22
Nodes (8): { cargarDocumentacionApi }, DE_DEMOSTRACION, documento, helmet, { Router }, swaggerUi, helmet, swagger-ui-express

### Community 99 - "Flujo 01 · Crear producto"
Cohesion: 0.50
Nodes (4): Flujo 01 · Crear producto, Notas técnicas, Otros caminos, Pasos

### Community 101 - "Flujo 02 · Buscar producto"
Cohesion: 0.50
Nodes (4): Flujo 02 · Buscar producto, Notas técnicas, Otros caminos, Pasos

### Community 102 - "glosario-y-alcance.test.sh"
Cohesion: 0.90
Nodes (4): falla(), fila_dice(), ok(), glosario-y-alcance.test.sh script

### Community 103 - "frontend/.prettierrc.json"
Cohesion: 0.50
Nodes (3): printWidth, singleQuote, trailingComma

### Community 104 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, cors, dotenv, express, helmet, mysql2, sequelize, sequelize-cli (+3 more)

### Community 105 - "Flujo 03 · Armar la venta actual"
Cohesion: 0.50
Nodes (4): Flujo 03 · Armar la venta actual, Notas técnicas, Otros caminos, Pasos

### Community 106 - "documentacion.js"
Cohesion: 0.33
Nodes (5): fs, { parse }, path, RUTA_DEL_DOCUMENTO, yaml

### Community 107 - "Flujo 00 · Mapa de procesos"
Cohesion: 0.67
Nodes (3): Desarrollo de AIPOS, Flujo 00 · Mapa de procesos, Operación del POS

### Community 108 - "routes/index.js"
Cohesion: 0.25
Nodes (7): docs, montajes, { Router }, salud, { obtenerSalud }, { Router }, express

### Community 110 - "services/salud.js"
Cohesion: 0.43
Nodes (5): { consultarSalud }, obtenerSalud(), conLimiteDeTiempo(), consultarSalud(), sequelize

### Community 111 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, @apidevtools/swagger-parser, eslint, eslint-config-prettier, @eslint/js, globals, prettier, supertest (+1 more)

### Community 112 - "limite-del-cuerpo.test.js"
Cohesion: 0.33
Nodes (5): app, { crearApp }, eco, express, require

### Community 115 - "Flujo 04 · Registrar venta"
Cohesion: 0.50
Nodes (4): Flujo 04 · Registrar venta, Notas técnicas, Otros caminos, Pasos

### Community 116 - "cors.test.js"
Cohesion: 0.33
Nodes (5): app, { cargarConfig }, config, { crearApp }, require

## Knowledge Gaps
- **521 isolated node(s):** `singleQuote`, `printWidth`, `trailingComma`, `{ cargarConfigDeEntorno, cargarArchivoEnv }`, `name` (+516 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 614 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **43 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Lenguaje ubicuo — AIPOS` connect `Requerimientos funcionales` to `graphify-setup.md`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **Why does `Arquitectura de AIPOS` connect `Arquitectura de AIPOS` to `requerimientos/README.md`, `validacion-comun.test.js`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **What connects `singleQuote`, `printWidth`, `trailingComma` to the rest of the system?**
  _521 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Trabajar en un tile` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `Requerimientos funcionales` be split into smaller, more focused modules?**
  _Cohesion score 0.060129509713228495 - nodes in this community are weakly interconnected._
