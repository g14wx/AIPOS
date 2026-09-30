# Graph Report - entregable  (2026-09-30)

## Corpus Check
- 141 files · ~100,054 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 22 file(s) not represented in the graph (top: (none) 12, .drawio 7, .example 2)

## Summary
- 970 nodes · 1257 edges · 103 communities (71 shown, 32 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 59 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- En AIPOS, el hook de git `pre-commit` actualiza este grafo en cada commit: va al día con el commit que lo trae.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Grafo del proyecto
- dependencies
- Trabajar en un tile
- errorHandler.js
- Buscar producto
- Crear producto
- Flujo de un entregable
- Configurar el MCP de Trello
- saltos-de-linea.test.sh
- Entregables y tarjetas
- Armar la venta actual
- Glosario de lenguaje ubicuo
- Bitácora de IA
- README de entrega
- documentacion.js
- Calling a stored procedure from Sequelize
- Vue 2 + Vuetify 2 + Vite setup
- Requerimientos de AIPOS
- frontend/package.json
- hook-de-claude-code/graphify-fuera-del-path.test.sh
- Grafo del proyecto
- comun.sh
- AIPOS
- Requerimientos no funcionales
- Qué es y para qué sirve
- misma-version.test.sh
- ignora-lo-local.test.sh
- agents-md.test.sh
- CLAUDE.md
- src/config.js
- comunicacion-clara.md
- rules/lenguaje-ubicuo.md
- mysql-sequelize.md
- app.js
- sin-rutas-ni-evals.test.sh
- update-sin-cambios.test.sh
- hook-de-claude-code/sin-graphify.test.sh
- agrega-el-grafo.test.sh
- graphify-falla.test.sh
- hook-de-git/sin-graphify.test.sh
- hook-de-git/graphify-fuera-del-path.test.sh
- otra-version.test.sh
- Documentación de la API
- Arquitectura de AIPOS
- marca-de-commit.test.sh
- version-con-crlf.test.sh
- desactualizado-tras-falla.test.sh
- merge-sin-choques.test.sh
- merge-sin-cambios-en-el-grafo.test.sh
- Requerimientos funcionales
- spec-arquitectura.test.sh
- agents-md-tarjeta.test.sh
- Despliegue de AIPOS
- Alcance
- ref_vitest
- comparar-rutas.test.js
- backend/package.json
- scripts
- rutas-documentadas.test.js
- ref_node_path
- devDependencies
- estructura-del-documento.test.js
- AnimacionLottie.test.js
- Product
- dependencies
- Design System: AIPOS
- vitest-vue2.test.js
- devDependencies
- express
- docs.js
- csp-docs.test.js
- ejemplos-de-error.test.js
- estructura.test.js
- scripts
- http.js
- ref_node_fs
- sin-axios-en-componentes.test.js
- archivos.test.js
- dependencias.test.js
- graphify-setup.md
- eslint.config.js
- limite-del-cuerpo.test.js
- Lenguaje ubicuo — AIPOS
- dependencies
- pantalla-unica.test.js
- Comandos útiles
- Flujo 05 · Entregar un entregable
- glosario-y-alcance.test.sh
- backend/.prettierrc.json
- frontend/.prettierrc.json
- tema.test.js
- AIPOS
- Flujo 01 · Crear producto
- Flujo 02 · Buscar producto
- Flujo 03 · Armar la venta actual
- Flujo 04 · Registrar venta
- Flujo 00 · Mapa de procesos
- Flujo 06 · Trabajar una tarjeta con el agente
- scarfSettings

## God Nodes (most connected - your core abstractions)
1. `Despliegue de AIPOS` - 22 edges
2. `scripts` - 15 edges
3. `Requerimientos funcionales` - 14 edges
4. `Requerimientos no funcionales` - 14 edges
5. `Armar la venta actual` - 13 edges
6. `Arquitectura de AIPOS` - 13 edges
7. `cargarDocumentacionApi()` - 12 edges
8. `total()` - 12 edges
9. `Documentación de la API` - 12 edges
10. `express` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Herramientas y proceso` --references--> `production()`  [INFERRED]
  docs/lenguaje-ubicuo.md → backend/db/config.js
- `Validación del texto` --references--> `ErrorApi`  [INFERRED]
  specs/buscar-producto.spec.md → backend/src/errors/ErrorApi.js
- `Negocio` --references--> `total()`  [INFERRED]
  docs/lenguaje-ubicuo.md → frontend/src/components/VentaActual.vue
- `El formulario` --references--> `aCentavos()`  [INFERRED]
  specs/crear-producto.spec.md → frontend/src/dinero.js
- `La venta actual` --references--> `calcularTotal()`  [INFERRED]
  specs/arquitectura.spec.md → frontend/src/ventaActual/ventaActual.js

## Import Cycles
- None detected.

## Communities (103 total, 32 thin omitted)

### Community 1 - "Grafo del proyecto"
Cohesion: 0.20
Nodes (10): Arranque de un clon nuevo, Grafo del proyecto, Hook de Claude Code, Hook de git `pre-commit`, Proceso escrito, Qué entra al grafo, Qué no se usa, Qué va a git (+2 more)

### Community 2 - "dependencies"
Cohesion: 0.12
Nodes (16): agents, dependencies, g14wxz/entrega-trazable, g14wxz/grafo-del-proyecto, g14wxz/lenguaje-ubicuo, g14wxz/mysql-sequelize-procedimientos, g14wxz/vue2-vuetify2-vite, tessl-labs/spec-driven-development (+8 more)

### Community 3 - "Trabajar en un tile"
Cohesion: 0.14
Nodes (14): 1. Instalar Tessl, 2. Instalar los tiles del proyecto, 3. Conectar el MCP de Tessl (opcional), 4. Verificar, 5. Cambiar un tile, 6. Medir un tile con evals (necesita cuenta), 7. Publicar un tile (necesita cuenta), Qué va a git y qué no (+6 more)

### Community 4 - "errorHandler.js"
Cohesion: 0.12
Nodes (20): desdeBaseDeDatos(), ErrorApi, ErrorApi, ESTADOS, aErrorApi(), desdeBaseDeDatos, desdeElCuerpo(), ErrorApi (+12 more)

### Community 5 - "Buscar producto"
Cohesion: 0.11
Nodes (18): API: `GET /api/productos?busqueda=<texto>`, Buscar producto, Criterios de aceptación de la API (P-04), Criterios de aceptación de la pantalla (P-05), Cómo busca el servicio, Cómo se decidió el diseño, Cómo se ve y se comporta, Diseño (skill `impeccable`) (+10 more)

### Community 6 - "Crear producto"
Cohesion: 0.08
Nodes (25): Al crear el producto, Bugs, Contrato, Crear producto, Criterios de aceptación de P-01, Criterios de aceptación de P-02, Criterios de aceptación de P-03, Diseño con `impeccable` (+17 more)

### Community 7 - "Flujo de un entregable"
Cohesion: 0.18
Nodes (10): 0. Revisar el repositorio (una vez por proyecto), 1. Empezar el entregable, 2. Trabajar, 3. Abrir el PR, 4. Revisar antes de integrar, 5. Integrar, 6. Etiquetar, 7. Entrega final (+2 more)

### Community 8 - "Configurar el MCP de Trello"
Cohesion: 0.20
Nodes (10): 1. Crear el board en Trello, 2. Obtener el API key, 3. Generar el token, 4. Agregar el servidor a Claude Code, 5. Verificar la conexión, Alternativa: Codex CLI, Configurar el MCP de Trello, Requisitos (+2 more)

### Community 10 - "Entregables y tarjetas"
Cohesion: 0.18
Nodes (11): Definición de terminado, Entrega final, Entregable productos, Entregable ventas, Entregables y tarjetas, Ramas de tarjeta, Requerimientos, Secuencia de los entregables (+3 more)

### Community 11 - "Armar la venta actual"
Cohesion: 0.06
Nodes (39): data(), aCentavos(), formatearCentavos(), calcularSubtotal(), calcularTotal(), vaciarVentaActual(), congelar(), leche (+31 more)

### Community 12 - "Glosario de lenguaje ubicuo"
Cohesion: 0.22
Nodes (7): Plantilla: docs/lenguaje-ubicuo.md, Crear el glosario, Cuando aparece una palabra nueva o dudosa, Cuando un término cambia, Cómo escribir cada entrada, Glosario de lenguaje ubicuo, Revisar si el código habla igual que el negocio

### Community 13 - "Bitácora de IA"
Cohesion: 0.25
Nodes (6): Plantilla: docs/bitacora-ia.md, Bitácora de IA, Cuándo escribir, Cómo escribir una entrada, Reconstruir desde git, Reglas

### Community 14 - "README de entrega"
Cohesion: 0.29
Nodes (5): Plantilla: README.md de entrega, De dónde sale cada punto, Flujo, README de entrega, Reglas

### Community 15 - "documentacion.js"
Cohesion: 0.11
Nodes (18): cargarDocumentacionApi(), fs, { parse }, path, RUTA_DEL_DOCUMENTO, app, { cargarDocumentacionApi }, documento (+10 more)

### Community 16 - "Calling a stored procedure from Sequelize"
Cohesion: 0.29
Nodes (6): 1. Service, 2. No outer transaction, 3. Validate before calling, 4. Map database errors to HTTP, 5. Search products by name or barcode, Calling a stored procedure from Sequelize

### Community 17 - "Vue 2 + Vuetify 2 + Vite setup"
Cohesion: 0.29
Nodes (6): 1. Versions, 2. Project files, 3. Environment and API client, 4. ESLint (optional), 5. Check, Vue 2 + Vuetify 2 + Vite setup

### Community 18 - "Requerimientos de AIPOS"
Cohesion: 0.33
Nodes (6): Aspectos que se evaluarán, Cómo leer esta carpeta, Flujos, Matriz del PDF, Preguntas abiertas, Requerimientos de AIPOS

### Community 19 - "frontend/package.json"
Cohesion: 0.11
Nodes (18): description, engines, node, eslint, eslint-config-prettier, @eslint/js, globals, prettier (+10 more)

### Community 21 - "Grafo del proyecto"
Cohesion: 0.33
Nodes (5): Al terminar una tarea, Antes de empezar una tarea, Antes de integrar un PR, Cuándo no usarlo, Grafo del proyecto

### Community 23 - "AIPOS"
Cohesion: 0.25
Nodes (7): Agent Rules <!-- tessl-managed -->, AIPOS, Antes de empezar, Cómo tomar una tarjeta, Decisiones de diseño, Nada depende de una sesión ni de una máquina, Qué es AIPOS

### Community 24 - "Requerimientos no funcionales"
Cohesion: 0.14
Nodes (14): Requerimientos no funcionales, RNF-01 Una sola pantalla, RNF-02 Tecnologías y versiones, RNF-03 Validación en tres lugares, RNF-04 Seguridad básica, RNF-05 Manejo de errores, RNF-06 Arquitectura en capas, RNF-07 Base de datos reproducible (+6 more)

### Community 25 - "Qué es y para qué sirve"
Cohesion: 0.25
Nodes (8): 1. Instalar Graphify, 2. Activar el hook de git, 3. Verificar, Antes de integrar un PR, Flujo de una tarea, Qué es y para qué sirve, Requisitos, Setup de Graphify

### Community 27 - "ignora-lo-local.test.sh"
Cohesion: 0.83
Nodes (3): debe_ignorar(), no_debe_ignorar(), ignora-lo-local.test.sh script

### Community 31 - "src/config.js"
Cohesion: 0.07
Nodes (34): { cargarConfigDeEntorno, cargarArchivoEnv }, development(), paraElCli(), test(), cargarArchivoEnv(), cargarConfig(), cargarConfigDeEntorno(), dotenv (+26 more)

### Community 35 - "app.js"
Cohesion: 0.14
Nodes (16): app, cors, crearApp(), { crearRouterApi, montajes: montajesDeLaApi }, errorHandler, express, helmet, noEncontrado (+8 more)

### Community 44 - "Documentación de la API"
Cohesion: 0.10
Nodes (20): Cabecera, Criterios de aceptación, Cómo se decidió el diseño, Dependencias, Documentación de la API, Ejemplos que dicen lo que la API hace, Ejemplos sin detalles internos, El documento es OpenAPI 3 válido (+12 more)

### Community 45 - "Arquitectura de AIPOS"
Cohesion: 0.07
Nodes (29): animacion(), beforeDestroy(), crear(), destruir(), mounted(), pideMenosMovimiento(), `App.vue`: une la búsqueda con la venta actual (V-04), Arquitectura de AIPOS (+21 more)

### Community 52 - "Requerimientos funcionales"
Cohesion: 0.05
Nodes (47): total(), Reglas de negocio, Requerimientos funcionales, RF-01 Crear producto, RF-02 Buscar producto, RF-03 Agregar a la venta actual, RF-04 Ver los detalles de la venta actual, RF-05 Editar el precio aplicado (+39 more)

### Community 53 - "spec-arquitectura.test.sh"
Cohesion: 0.90
Nodes (4): falla(), ok(), revisar(), spec-arquitectura.test.sh script

### Community 55 - "Despliegue de AIPOS"
Cohesion: 0.09
Nodes (25): production(), Caddy, Casos de error, Configuración del servidor (una sola vez), Criterios de aceptación, Cómo queda armado el servidor, Cómo se decidió el diseño, Despliegue de AIPOS (+17 more)

### Community 56 - "Alcance"
Cohesion: 0.20
Nodes (9): Actores y partes, Alcance, Fuera de alcance, Lo que agregamos y el PDF no pide, Objetivo, Qué entra, Restricciones, Riesgos (+1 more)

### Community 57 - "ref_vitest"
Cohesion: 0.14
Nodes (10): app, { cargarConfig }, config, { crearApp }, require, app, { cargarDocumentacionApi }, require (+2 more)

### Community 58 - "comparar-rutas.test.js"
Cohesion: 0.15
Nodes (16): { cargarDocumentacionApi }, { crearApp }, docs, documentadas, documento, { montajes }, require, { Router } (+8 more)

### Community 59 - "backend/package.json"
Cohesion: 0.11
Nodes (17): description, engines, node, eslint, eslint-config-prettier, @eslint/js, globals, prettier (+9 more)

### Community 60 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, deshacer, deshacer:prueba, dev, format, format:check, lint, migrar (+7 more)

### Community 61 - "rutas-documentadas.test.js"
Cohesion: 0.15
Nodes (11): docs, montajes, { Router }, salud, app, { cargarDocumentacionApi }, carpetaDeRutas, docs (+3 more)

### Community 62 - "ref_node_path"
Cohesion: 0.16
Nodes (6): archivosJs(), ejemplo, raiz, abrirUnPuerto(), backend, buscarPuertoLibre()

### Community 63 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-vue, globals, jsdom, prettier (+6 more)

### Community 64 - "estructura-del-documento.test.js"
Cohesion: 0.18
Nodes (11): { cargarDocumentacionApi }, DINERO, documento, ESTADOS_PERMITIDOS, METODOS, nombresDeCampos(), problemasDeDinero(), recorrer() (+3 more)

### Community 65 - "AnimacionLottie.test.js"
Cohesion: 0.21
Nodes (7): es, animacion, { loadAnimation, instancias }, @mdi/font, vue, @vue/test-utils, vuetify

### Community 66 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 67 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, cors, dotenv, express, helmet, mysql2, sequelize, sequelize-cli (+3 more)

### Community 68 - "Design System: AIPOS"
Cohesion: 0.20
Nodes (9): Colors, Components, Design System: AIPOS, Do's and Don'ts, Elevation & Depth, Layout, Overview, Shapes (+1 more)

### Community 69 - "vitest-vue2.test.js"
Cohesion: 0.20
Nodes (6): avisosAlInstalar, declaradas, espia, paquete, versionesDelFrontend, lottie-web

### Community 70 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, @apidevtools/swagger-parser, eslint, eslint-config-prettier, @eslint/js, globals, prettier, supertest (+1 more)

### Community 71 - "express"
Cohesion: 0.31
Nodes (6): { consultarSalud }, obtenerSalud(), { obtenerSalud }, { Router }, consultarSalud(), express

### Community 72 - "docs.js"
Cohesion: 0.22
Nodes (8): { cargarDocumentacionApi }, DE_DEMOSTRACION, documento, helmet, { Router }, swaggerUi, helmet, swagger-ui-express

### Community 73 - "csp-docs.test.js"
Cohesion: 0.31
Nodes (7): app, docs, express, helmet, politicaDe(), politicaDeHelmet(), require

### Community 74 - "ejemplos-de-error.test.js"
Cohesion: 0.22
Nodes (6): { cargarDocumentacionApi }, documento, PROHIBIDO, recogerEjemplos(), require, RESPUESTAS_DE_ERROR

### Community 75 - "estructura.test.js"
Cohesion: 0.22
Nodes (6): archivosJs(), backend, paquete, raiz, require_, src

### Community 76 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, preview, test (+1 more)

### Community 77 - "http.js"
Cohesion: 0.36
Nodes (5): crearError(), http, traducirError(), cargarHttp(), axios

### Community 78 - "ref_node_fs"
Cohesion: 0.29
Nodes (5): aHex(), carpeta, coloresDe(), paleta, permitidas

### Community 79 - "sin-axios-en-componentes.test.js"
Cohesion: 0.29
Nodes (6): archivosDe(), componentes, enSrc(), fueraDeApi, raiz, todos

### Community 80 - "archivos.test.js"
Cohesion: 0.29
Nodes (5): archivosJs(), backend, raiz, require, src

### Community 81 - "dependencias.test.js"
Cohesion: 0.29
Nodes (5): backend, EN_DEPENDENCIES, EN_DEV_DEPENDENCIES, lock, paquete

### Community 84 - "limite-del-cuerpo.test.js"
Cohesion: 0.33
Nodes (5): app, { crearApp }, eco, express, require

### Community 85 - "Lenguaje ubicuo — AIPOS"
Cohesion: 0.33
Nodes (6): Convención de nombres en código, Herramientas y proceso, Historial de cambios, Lenguaje ubicuo — AIPOS, Negocio, Pendientes (por confirmar)

### Community 86 - "dependencies"
Cohesion: 0.33
Nodes (6): dependencies, axios, lottie-web, @mdi/font, vue, vuetify

### Community 88 - "Comandos útiles"
Cohesion: 0.40
Nodes (5): Comandos útiles, Privacidad, Qué no usamos, y por qué, Qué va a git y qué no, Solución de problemas

### Community 89 - "Flujo 05 · Entregar un entregable"
Cohesion: 0.40
Nodes (5): Entrega final, Flujo 05 · Entregar un entregable, Otros caminos, Pasos, Qué no se hace

### Community 90 - "glosario-y-alcance.test.sh"
Cohesion: 0.90
Nodes (4): falla(), fila_dice(), ok(), glosario-y-alcance.test.sh script

### Community 91 - "backend/.prettierrc.json"
Cohesion: 0.50
Nodes (3): printWidth, singleQuote, trailingComma

### Community 92 - "frontend/.prettierrc.json"
Cohesion: 0.50
Nodes (3): printWidth, singleQuote, trailingComma

### Community 94 - "AIPOS"
Cohesion: 0.50
Nodes (4): AIPOS, Grafo del proyecto, Setup de agents, Tiles de Tessl

### Community 95 - "Flujo 01 · Crear producto"
Cohesion: 0.50
Nodes (4): Flujo 01 · Crear producto, Notas técnicas, Otros caminos, Pasos

### Community 96 - "Flujo 02 · Buscar producto"
Cohesion: 0.50
Nodes (4): Flujo 02 · Buscar producto, Notas técnicas, Otros caminos, Pasos

### Community 97 - "Flujo 03 · Armar la venta actual"
Cohesion: 0.50
Nodes (4): Flujo 03 · Armar la venta actual, Notas técnicas, Otros caminos, Pasos

### Community 98 - "Flujo 04 · Registrar venta"
Cohesion: 0.50
Nodes (4): Flujo 04 · Registrar venta, Notas técnicas, Otros caminos, Pasos

### Community 99 - "Flujo 00 · Mapa de procesos"
Cohesion: 0.67
Nodes (3): Desarrollo de AIPOS, Flujo 00 · Mapa de procesos, Operación del POS

### Community 100 - "Flujo 06 · Trabajar una tarjeta con el agente"
Cohesion: 0.67
Nodes (3): Flujo 06 · Trabajar una tarjeta con el agente, Otros caminos, Pasos

## Knowledge Gaps
- **549 isolated node(s):** `singleQuote`, `printWidth`, `trailingComma`, `{ cargarConfigDeEntorno, cargarArchivoEnv }`, `name` (+544 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 622 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `total()` connect `Requerimientos funcionales` to `Armar la venta actual`, `Lenguaje ubicuo — AIPOS`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Why does `Lenguaje ubicuo — AIPOS` connect `Lenguaje ubicuo — AIPOS` to `graphify-setup.md`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `Arquitectura de AIPOS` connect `Arquitectura de AIPOS` to `errorHandler.js`, `arquitectura.spec.md`, `src/config.js`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **What connects `singleQuote`, `printWidth`, `trailingComma` to the rest of the system?**
  _549 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Trabajar en un tile` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `errorHandler.js` be split into smaller, more focused modules?**
  _Cohesion score 0.12333333333333334 - nodes in this community are weakly interconnected._
