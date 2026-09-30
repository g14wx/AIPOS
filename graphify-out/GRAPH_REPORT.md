# Graph Report - p-03  (2026-09-30)

## Corpus Check
- 166 files · ~119,259 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 22 file(s) not represented in the graph (top: (none) 12, .drawio 7, .example 2)

## Summary
- 1154 nodes · 1649 edges · 118 communities (87 shown, 31 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 79 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- En AIPOS, el hook de git `pre-commit` actualiza este grafo en cada commit: va al día con el commit que lo trae.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Grafo del proyecto
- dependencies
- Trabajar en un tile
- Backend
- Buscar producto
- down
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
- Comandos útiles
- misma-version.test.sh
- ignora-lo-local.test.sh
- agents-md.test.sh
- CLAUDE.md
- database.js
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
- AnimacionLottie.vue
- marca-de-commit.test.sh
- version-con-crlf.test.sh
- desactualizado-tras-falla.test.sh
- merge-sin-choques.test.sh
- merge-sin-cambios-en-el-grafo.test.sh
- total
- spec-arquitectura.test.sh
- agents-md-tarjeta.test.sh
- Despliegue de AIPOS
- Alcance
- ref_vitest
- comparar-rutas.test.js
- backend/package.json
- scripts
- FormularioProducto.vue
- compose.test.js
- devDependencies
- ref_node_path
- AnimacionLottie.test.js
- Product
- dependencies
- Design System: AIPOS
- vitest-vue2.test.js
- devDependencies
- base-de-prueba.test.js
- NuevoProducto.test.js
- csp-docs.test.js
- services/salud.js
- estructura.test.js
- scripts
- FormularioProducto.test.js
- animaciones.test.js
- sin-axios-en-componentes.test.js
- Vuetify 2 components (Vue 2.7)
- ref_node_fs
- graphify-setup.md
- eslint.config.js
- src/config.js
- P-01 · La tabla `productos` y el modelo `Producto`
- dependencies
- pantalla-unica.test.js
- servidor.test.js
- Flujo 05 · Entregar un entregable
- glosario-y-alcance.test.sh
- backend/.prettierrc.json
- frontend/.prettierrc.json
- vue2-vuetify2.md
- AIPOS
- Flujo 01 · Crear producto
- Flujo 02 · Buscar producto
- Flujo 03 · Armar la venta actual
- Flujo 04 · Registrar venta
- Flujo 00 · Mapa de procesos
- Flujo 06 · Trabajar una tarjeta con el agente
- Requerimientos funcionales
- productos-migracion.test.js
- routes/index.js
- rutas-documentadas.test.js
- Registrar venta
- docs.js
- errores.test.js
- modelos.test.js
- MySQL stored procedure authoring
- errorHandler.js
- limite-del-cuerpo.test.js
- crearProducto
- ErrorApi.js
- noEncontrado
- API: `GET /api/productos?busqueda=<texto>`
- Crear producto

## God Nodes (most connected - your core abstractions)
1. `Despliegue de AIPOS` - 22 edges
2. `scripts` - 15 edges
3. `Requerimientos funcionales` - 14 edges
4. `Requerimientos no funcionales` - 14 edges
5. `crearProducto()` - 13 edges
6. `Armar la venta actual` - 13 edges
7. `Arquitectura de AIPOS` - 13 edges
8. `supertest` - 12 edges
9. `cargarDocumentacionApi()` - 12 edges
10. `total()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Validación del texto` --references--> `ErrorApi`  [INFERRED]
  specs/buscar-producto.spec.md → backend/src/errors/ErrorApi.js
- `Servicio de API` --references--> `crearProducto()`  [INFERRED]
  specs/arquitectura.spec.md → frontend/src/api/productos.js
- `Los componentes` --references--> `crearProducto()`  [INFERRED]
  specs/crear-producto.spec.md → frontend/src/api/productos.js
- `5. Final check` --references--> `total()`  [INFERRED]
  tessl-plugins/mysql-sequelize-procedimientos/skills/mysql-stored-procedure-authoring/SKILL.md → frontend/src/components/VentaActual.vue
- `La venta actual` --references--> `calcularTotal()`  [INFERRED]
  specs/arquitectura.spec.md → frontend/src/ventaActual/ventaActual.js

## Import Cycles
- None detected.

## Communities (118 total, 31 thin omitted)

### Community 1 - "Grafo del proyecto"
Cohesion: 0.18
Nodes (10): Arranque de un clon nuevo, Grafo del proyecto, Hook de Claude Code, Hook de git `pre-commit`, Proceso escrito, Qué entra al grafo, Qué no se usa, Qué va a git (+2 more)

### Community 2 - "dependencies"
Cohesion: 0.12
Nodes (16): agents, dependencies, g14wxz/entrega-trazable, g14wxz/grafo-del-proyecto, g14wxz/lenguaje-ubicuo, g14wxz/mysql-sequelize-procedimientos, g14wxz/vue2-vuetify2-vite, tessl-labs/spec-driven-development (+8 more)

### Community 3 - "Trabajar en un tile"
Cohesion: 0.14
Nodes (14): 1. Instalar Tessl, 2. Instalar los tiles del proyecto, 3. Conectar el MCP de Tessl (opcional), 4. Verificar, 5. Cambiar un tile, 6. Medir un tile con evals (necesita cuenta), 7. Publicar un tile (necesita cuenta), Qué va a git y qué no (+6 more)

### Community 4 - "Backend"
Cohesion: 0.29
Nodes (7): ErrorApi, Backend, Capas, Errores, Procedimientos almacenados, Salud, Validación

### Community 5 - "Buscar producto"
Cohesion: 0.14
Nodes (13): Buscar producto, Criterios de aceptación de la API (P-04), Criterios de aceptación de la pantalla (P-05), Cómo se decidió el diseño, Cómo se ve y se comporta, Diseño (skill `impeccable`), Estados de la zona de resultados, Lo que esta spec no cubre (+5 more)

### Community 6 - "down"
Cohesion: 0.24
Nodes (10): down(), up(), Base de datos: MySQL y migraciones, Base de prueba, Comandos del backend, Desde un clon limpio, Puertos, varias copias y empezar de cero, Base de datos (+2 more)

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
Nodes (41): data(), aCentavos(), formatearCentavos(), calcularSubtotal(), calcularTotal(), vaciarVentaActual(), congelar(), leche (+33 more)

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
Cohesion: 0.05
Nodes (35): cargarDocumentacionApi(), fs, { parse }, path, RUTA_DEL_DOCUMENTO, { cargarDocumentacionApi }, documento, PROHIBIDO (+27 more)

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

### Community 25 - "Comandos útiles"
Cohesion: 0.15
Nodes (13): 1. Instalar Graphify, 2. Activar el hook de git, 3. Verificar, Antes de integrar un PR, Comandos útiles, Flujo de una tarea, Privacidad, Qué es y para qué sirve (+5 more)

### Community 27 - "ignora-lo-local.test.sh"
Cohesion: 0.83
Nodes (3): debe_ignorar(), no_debe_ignorar(), ignora-lo-local.test.sh script

### Community 31 - "database.js"
Cohesion: 0.06
Nodes (33): { config }, { Sequelize }, Producto, sequelize, { DataTypes }, Producto, sequelize, app (+25 more)

### Community 35 - "app.js"
Cohesion: 0.25
Nodes (10): app, cors, crearApp(), { crearRouterApi, montajes: montajesDeLaApi }, errorHandler, express, helmet, noEncontrado (+2 more)

### Community 44 - "Documentación de la API"
Cohesion: 0.13
Nodes (15): Cabecera, Criterios de aceptación, Cómo se decidió el diseño, Dependencias, Documentación de la API, Ejemplos que dicen lo que la API hace, Ejemplos sin detalles internos, El documento es OpenAPI 3 válido (+7 more)

### Community 45 - "AnimacionLottie.vue"
Cohesion: 0.43
Nodes (6): animacion(), beforeDestroy(), crear(), destruir(), mounted(), pideMenosMovimiento()

### Community 52 - "total"
Cohesion: 0.19
Nodes (13): total(), RF-10 Guardar productos, ventas y detalles con sus relaciones, API: POST /api/ventas (V-03), Criterios de aceptación de V-02, Criterios de aceptación de V-03, Documentación de la API, El servicio y el procedimiento, Parámetro y respuesta (+5 more)

### Community 53 - "spec-arquitectura.test.sh"
Cohesion: 0.90
Nodes (4): falla(), ok(), revisar(), spec-arquitectura.test.sh script

### Community 55 - "Despliegue de AIPOS"
Cohesion: 0.07
Nodes (31): production(), Convención de nombres en código, Herramientas y proceso, Historial de cambios, Lenguaje ubicuo — AIPOS, Negocio, Pendientes (por confirmar), Caddy (+23 more)

### Community 56 - "Alcance"
Cohesion: 0.22
Nodes (9): Actores y partes, Alcance, Fuera de alcance, Lo que agregamos y el PDF no pide, Objetivo, Qué entra, Restricciones, Riesgos (+1 more)

### Community 57 - "ref_vitest"
Cohesion: 0.11
Nodes (12): require, sequelize, archivosJs(), backend, raiz, require, src, app (+4 more)

### Community 58 - "comparar-rutas.test.js"
Cohesion: 0.15
Nodes (16): { cargarDocumentacionApi }, { crearApp }, docs, documentadas, documento, { montajes }, require, { Router } (+8 more)

### Community 59 - "backend/package.json"
Cohesion: 0.11
Nodes (17): description, engines, node, eslint, eslint-config-prettier, @eslint/js, globals, prettier (+9 more)

### Community 60 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, deshacer, deshacer:prueba, dev, format, format:check, lint, migrar (+7 more)

### Community 61 - "FormularioProducto.vue"
Cohesion: 0.10
Nodes (29): alAbrir(), alSalir(), cancelar(), cerrar(), data(), enfocar(), enlazarTitulo(), guardar() (+21 more)

### Community 62 - "compose.test.js"
Cohesion: 0.15
Nodes (6): carpetaRaiz, archivo, archivosJs(), ejemplo, raiz, carpetaBackend

### Community 63 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-vue, globals, jsdom, prettier (+6 more)

### Community 64 - "ref_node_path"
Cohesion: 0.19
Nodes (9): tablasDeLaBase(), archivos, cargarConfiguracion(), carpetaMigraciones, require, sequelize, tablasSinElRegistro(), porDefecto (+1 more)

### Community 65 - "AnimacionLottie.test.js"
Cohesion: 0.24
Nodes (6): es, animacion, { loadAnimation, instancias }, @mdi/font, vue, vuetify

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

### Community 71 - "base-de-prueba.test.js"
Cohesion: 0.14
Nodes (14): carpetaBackend, correrNpm(), correrNpmSinFallar(), crearProxyCongelable(), { cargarClaveRoot, cargarConfig, cargarConfigDeEntorno }, consultar(), mysql, permisosDelUsuario() (+6 more)

### Community 72 - "NuevoProducto.test.js"
Cohesion: 0.15
Nodes (10): abrirLlenarYGuardar(), boton(), botonNuevo(), dialogo(), entrada(), escribir(), esperar(), { loadAnimation, instancias } (+2 more)

### Community 73 - "csp-docs.test.js"
Cohesion: 0.27
Nodes (8): app, docs, express, helmet, politicaDe(), politicaDeHelmet(), require, helmet

### Community 74 - "services/salud.js"
Cohesion: 0.33
Nodes (7): { consultarSalud }, obtenerSalud(), conLimiteDeTiempo(), consultarSalud(), cortarConexion(), sequelize, `GET /api/salud`

### Community 75 - "estructura.test.js"
Cohesion: 0.22
Nodes (6): archivosJs(), backend, paquete, raiz, require_, src

### Community 76 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, preview, test (+1 more)

### Community 77 - "FormularioProducto.test.js"
Cohesion: 0.13
Nodes (21): crearError(), http, traducirError(), cargar(), producto, cargarHttp(), boton(), dialogo() (+13 more)

### Community 78 - "animaciones.test.js"
Cohesion: 0.29
Nodes (6): aHex(), buscar(), carpeta, coloresDe(), paleta, permitidas

### Community 79 - "sin-axios-en-componentes.test.js"
Cohesion: 0.29
Nodes (6): archivosDe(), componentes, enSrc(), fueraDeApi, raiz, todos

### Community 80 - "Vuetify 2 components (Vue 2.7)"
Cohesion: 0.33
Nodes (5): Custom v-model, Example: point-of-sale screen, Reactivity, Vue 3 / Vuetify 3 habit and its Vue 2 / Vuetify 2 form, Vuetify 2 components (Vue 2.7)

### Community 81 - "ref_node_fs"
Cohesion: 0.17
Nodes (7): backend, EN_DEPENDENCIES, EN_DEV_DEPENDENCIES, lock, paquete, contraste(), luminancia()

### Community 84 - "src/config.js"
Cohesion: 0.06
Nodes (44): { cargarConfigDeEntorno, cargarArchivoEnv }, development(), paraElCli(), test(), crearBaseDePrueba(), cargarArchivoEnv(), cargarClaveRoot(), cargarConfig() (+36 more)

### Community 85 - "P-01 · La tabla `productos` y el modelo `Producto`"
Cohesion: 0.40
Nodes (5): Criterios de aceptación de P-01, Migración, Modelo, P-01 · La tabla `productos` y el modelo `Producto`, Productos de ejemplo (opcional, por confirmar)

### Community 86 - "dependencies"
Cohesion: 0.33
Nodes (6): dependencies, axios, lottie-web, @mdi/font, vue, vuetify

### Community 88 - "servidor.test.js"
Cohesion: 0.33
Nodes (3): abrirUnPuerto(), backend, buscarPuertoLibre()

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

### Community 103 - "Requerimientos funcionales"
Cohesion: 0.15
Nodes (13): Reglas de negocio, Requerimientos funcionales, RF-01 Crear producto, RF-02 Buscar producto, RF-03 Agregar a la venta actual, RF-04 Ver los detalles de la venta actual, RF-05 Editar el precio aplicado, RF-06 Cambiar la cantidad (+5 more)

### Community 104 - "productos-migracion.test.js"
Cohesion: 0.25
Nodes (10): correrCli(), archivo, carpetaMigraciones, columnas(), indices(), leer(), require, restriccionesCheck() (+2 more)

### Community 105 - "routes/index.js"
Cohesion: 0.25
Nodes (7): docs, montajes, { Router }, salud, { obtenerSalud }, { Router }, express

### Community 106 - "rutas-documentadas.test.js"
Cohesion: 0.22
Nodes (7): app, { cargarDocumentacionApi }, carpetaDeRutas, docs, { montajes }, require, { Router }

### Community 107 - "Registrar venta"
Cohesion: 0.14
Nodes (13): Animación, API, con `curl` (V-03), Bugs y issues, Contrato del componente, Criterios de aceptación de V-08, Cómo se decidió el diseño, Pantalla: botón "Registrar venta" (V-08), Pantalla, en el navegador con el MCP `chrome-devtools` (V-08) (+5 more)

### Community 108 - "docs.js"
Cohesion: 0.25
Nodes (7): { cargarDocumentacionApi }, DE_DEMOSTRACION, documento, helmet, { Router }, swaggerUi, swagger-ui-express

### Community 110 - "errores.test.js"
Cohesion: 0.25
Nodes (6): appConRuta(), { crearApp }, desdeBaseDeDatos, ErrorApi, express, require

### Community 111 - "modelos.test.js"
Cohesion: 0.29
Nodes (5): carpetaModelos, modelos, registrados, require, tablasDelGlosario

### Community 112 - "MySQL stored procedure authoring"
Cohesion: 0.29
Nodes (6): 1. Files, 2. Migration, 3. Template: a sale with its items, 4. Rules inside the body, 5. Final check, MySQL stored procedure authoring

### Community 113 - "errorHandler.js"
Cohesion: 0.57
Nodes (6): aErrorApi(), desdeBaseDeDatos, desdeElCuerpo(), ErrorApi, errorHandler(), esDelLector()

### Community 115 - "limite-del-cuerpo.test.js"
Cohesion: 0.33
Nodes (5): app, { crearApp }, eco, express, require

### Community 116 - "crearProducto"
Cohesion: 0.22
Nodes (10): crearProducto(), Carpetas, Contrato, Criterios de aceptación de P-02, Documentación de la API (tarjeta A-01), P-02 · `POST /api/productos`, Servicio, 409 y peticiones al mismo tiempo, Validación (+2 more)

### Community 117 - "ErrorApi.js"
Cohesion: 0.50
Nodes (3): desdeBaseDeDatos(), ErrorApi, ESTADOS

### Community 118 - "noEncontrado"
Cohesion: 0.40
Nodes (5): ErrorApi, noEncontrado(), Límites, CORS y cabeceras, La política de contenido solo en `/api/docs`, Swagger UI en `GET /api/docs`

### Community 119 - "API: `GET /api/productos?busqueda=<texto>`"
Cohesion: 0.40
Nodes (5): API: `GET /api/productos?busqueda=<texto>`, Cómo busca el servicio, Documentación de la API, Pruebas en local: la API con `curl`, Validación del texto

### Community 120 - "Crear producto"
Cohesion: 0.14
Nodes (13): Al crear el producto, Bugs, Crear producto, Criterios de aceptación de P-03, Diseño con `impeccable`, Los componentes, P-01: la base, P-02: la API con `curl` (+5 more)

## Knowledge Gaps
- **592 isolated node(s):** `singleQuote`, `printWidth`, `trailingComma`, `{ cargarConfigDeEntorno, cargarArchivoEnv }`, `name` (+587 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 692 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `crearProducto()` connect `crearProducto` to `NuevoProducto.test.js`, `FormularioProducto.test.js`, `src/config.js`, `Despliegue de AIPOS`, `Crear producto`, `FormularioProducto.vue`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **Why does `Lenguaje ubicuo — AIPOS` connect `Despliegue de AIPOS` to `graphify-setup.md`?**
  _High betweenness centrality (0.116) - this node is a cross-community bridge._
- **Why does `Negocio` connect `Despliegue de AIPOS` to `crearProducto`, `total`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **What connects `singleQuote`, `printWidth`, `trailingComma` to the rest of the system?**
  _592 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Trabajar en un tile` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `Buscar producto` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
