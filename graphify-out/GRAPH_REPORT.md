# Graph Report - p-02  (2026-09-30)

## Corpus Check
- 172 files · ~116,025 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 22 file(s) not represented in the graph (top: (none) 12, .drawio 7, .example 2)

## Summary
- 1165 nodes · 1660 edges · 142 communities (93 shown, 49 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 92 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- En AIPOS, el hook de git `pre-commit` actualiza este grafo en cada commit: va al día con el commit que lo trae.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- scripts
- dependencies
- Usar los tiles del proyecto
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
- comparar-rutas.test.js
- Calling a stored procedure from Sequelize
- Vue 2 + Vuetify 2 + Vite setup
- crear-producto-500.test.js
- Registrar venta
- hook-de-claude-code/graphify-fuera-del-path.test.sh
- Grafo del proyecto
- comun.sh
- AIPOS
- database.test.js
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
- spec-arquitectura.test.sh
- agents-md-tarjeta.test.sh
- backend/.prettierrc.json
- ref_node_fs
- ref_node_path
- app.js
- base-de-prueba.test.js
- archivos.test.js
- productos-migracion.test.js
- database.js
- Requerimientos de AIPOS
- estructura.test.js
- frontend/package.json
- devDependencies
- AnimacionLottie.test.js
- estructura-del-documento.test.js
- Product
- Despliegue de AIPOS
- Design System: AIPOS
- AnimacionLottie.vue
- venta-vacia.test.js
- scripts
- vitest-vue2.test.js
- docs.js
- crear-producto.test.js
- http.js
- sin-axios-en-componentes.test.js
- pantalla-unica.test.js
- dependencias.test.js
- animaciones.test.js
- eslint.config.js
- documentacion.js
- dependencies
- crear-producto-simultaneo.test.js
- Flujo 05 · Entregar un entregable
- tema.test.js
- Flujo 06 · Trabajar una tarjeta con el agente
- Flujo 01 · Crear producto
- Flujo 02 · Buscar producto
- glosario-y-alcance.test.sh
- frontend/.prettierrc.json
- dependencies
- Flujo 03 · Armar la venta actual
- Buscar producto
- Flujo 00 · Mapa de procesos
- documentacion-crear-producto.test.js
- total
- salud-con-base.test.js
- devDependencies
- ErrorApi.js
- Flujo 04 · Registrar venta
- ref_vitest
- Armar la venta actual
- ejemplos-de-error.test.js
- ayudas-crear-producto.js
- ErrorApi
- validador-producto.test.js
- vaciarVentaActual
- controllers/productos.js
- Backend
- servidor.test.js
- Trabajar en un tile
- MySQL stored procedure authoring
- Lenguaje ubicuo — AIPOS
- El módulo (`src/ventaActual/`)
- P-02 · `POST /api/productos`
- noEncontrado
- Qué es y para qué sirve
- La pantalla
- Criterios de aceptación
- scarfSettings

## God Nodes (most connected - your core abstractions)
1. `Despliegue de AIPOS` - 22 edges
2. `scripts` - 15 edges
3. `Requerimientos funcionales` - 14 edges
4. `Requerimientos no funcionales` - 14 edges
5. `supertest` - 13 edges
6. `cargarDocumentacionApi()` - 13 edges
7. `Armar la venta actual` - 13 edges
8. `Arquitectura de AIPOS` - 13 edges
9. `express` - 12 edges
10. `texto()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Herramientas y proceso` --references--> `production()`  [INFERRED]
  docs/lenguaje-ubicuo.md → backend/db/config.js
- `Archivos` --references--> `down()`  [INFERRED]
  specs/registrar-venta.spec.md → backend/db/migrations/20260930133500-crear-productos.js
- `Reglas de negocio` --references--> `validarTexto()`  [INFERRED]
  specs/crear-producto.spec.md → backend/src/validators/comunes.js
- `Validación` --references--> `validarTexto()`  [INFERRED]
  specs/crear-producto.spec.md → backend/src/validators/comunes.js
- `Negocio` --references--> `total()`  [INFERRED]
  docs/lenguaje-ubicuo.md → frontend/src/components/VentaActual.vue

## Import Cycles
- None detected.

## Communities (142 total, 49 thin omitted)

### Community 1 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, deshacer, deshacer:prueba, dev, format, format:check, lint, migrar (+7 more)

### Community 2 - "dependencies"
Cohesion: 0.12
Nodes (16): agents, dependencies, g14wxz/entrega-trazable, g14wxz/grafo-del-proyecto, g14wxz/lenguaje-ubicuo, g14wxz/mysql-sequelize-procedimientos, g14wxz/vue2-vuetify2-vite, tessl-labs/spec-driven-development (+8 more)

### Community 3 - "Usar los tiles del proyecto"
Cohesion: 0.29
Nodes (7): 1. Instalar Tessl, 2. Instalar los tiles del proyecto, 3. Conectar el MCP de Tessl (opcional), 4. Verificar, Requisitos, Setup de Tessl, Usar los tiles del proyecto

### Community 4 - "Requerimientos funcionales"
Cohesion: 0.14
Nodes (14): Reglas de negocio, Requerimientos funcionales, RF-01 Crear producto, RF-02 Buscar producto, RF-03 Agregar a la venta actual, RF-04 Ver los detalles de la venta actual, RF-05 Editar el precio aplicado, RF-06 Cambiar la cantidad (+6 more)

### Community 5 - "Requerimientos no funcionales"
Cohesion: 0.14
Nodes (14): Requerimientos no funcionales, RNF-01 Una sola pantalla, RNF-02 Tecnologías y versiones, RNF-03 Validación en tres lugares, RNF-04 Seguridad básica, RNF-05 Manejo de errores, RNF-06 Arquitectura en capas, RNF-07 Base de datos reproducible (+6 more)

### Community 6 - "Grafo del proyecto"
Cohesion: 0.20
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

### Community 15 - "comparar-rutas.test.js"
Cohesion: 0.11
Nodes (23): { cargarDocumentacionApi }, { crearApp }, docs, documentadas, documento, { montajes }, require, { Router } (+15 more)

### Community 16 - "Calling a stored procedure from Sequelize"
Cohesion: 0.29
Nodes (6): 1. Service, 2. No outer transaction, 3. Validate before calling, 4. Map database errors to HTTP, 5. Search products by name or barcode, Calling a stored procedure from Sequelize

### Community 17 - "Vue 2 + Vuetify 2 + Vite setup"
Cohesion: 0.29
Nodes (6): 1. Versions, 2. Project files, 3. Environment and API client, 4. ESLint (optional), 5. Check, Vue 2 + Vuetify 2 + Vite setup

### Community 18 - "crear-producto-500.test.js"
Cohesion: 0.20
Nodes (11): Producto, sequelize, crearProducto(), ErrorApi, errorDeCodigoDeBarrasRepetido(), esCodigoDeBarrasRepetido(), { Producto }, { crearProducto } (+3 more)

### Community 19 - "Registrar venta"
Cohesion: 0.05
Nodes (44): down(), up(), AIPOS, Base de datos: MySQL y migraciones, Base de prueba, Comandos del backend, Desde un clon limpio, Grafo del proyecto (+36 more)

### Community 21 - "Grafo del proyecto"
Cohesion: 0.33
Nodes (5): Al terminar una tarea, Antes de empezar una tarea, Antes de integrar un PR, Cuándo no usarlo, Grafo del proyecto

### Community 23 - "AIPOS"
Cohesion: 0.25
Nodes (7): Agent Rules <!-- tessl-managed -->, AIPOS, Antes de empezar, Cómo tomar una tarjeta, Decisiones de diseño, Nada depende de una sesión ni de una máquina, Qué es AIPOS

### Community 24 - "database.test.js"
Cohesion: 0.15
Nodes (9): app, { config }, servidor, { config }, dbConfig, modelos, require, { Sequelize } (+1 more)

### Community 25 - "Comandos útiles"
Cohesion: 0.25
Nodes (8): Antes de integrar un PR, Comandos útiles, Flujo de una tarea, Privacidad, Qué no usamos, y por qué, Qué va a git y qué no, Setup de Graphify, Solución de problemas

### Community 27 - "ignora-lo-local.test.sh"
Cohesion: 0.83
Nodes (3): debe_ignorar(), no_debe_ignorar(), ignora-lo-local.test.sh script

### Community 31 - "validacion-comun.test.js"
Cohesion: 0.24
Nodes (13): bueno(), conProblema(), ErrorApi, exigirDatosValidos(), validarDinero(), validarTexto(), comoObjeto(), validarProductoNuevo() (+5 more)

### Community 35 - "Alcance"
Cohesion: 0.20
Nodes (9): Actores y partes, Alcance, Fuera de alcance, Lo que agregamos y el PDF no pide, Objetivo, Qué entra, Restricciones, Riesgos (+1 more)

### Community 44 - "modelo-producto.test.js"
Cohesion: 0.17
Nodes (14): conTransaccionDescartada(), errorDeMySQL(), insertarProducto(), require, sequelize, carpetaSrc, leche, modelos (+6 more)

### Community 45 - "src/config.js"
Cohesion: 0.07
Nodes (35): { cargarConfigDeEntorno, cargarArchivoEnv }, development(), paraElCli(), test(), crearBaseDePrueba(), cargarArchivoEnv(), cargarConfig(), cargarConfigDeEntorno() (+27 more)

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
Nodes (9): tablasDeLaBase(), archivos, cargarConfiguracion(), carpetaMigraciones, require, sequelize, tablasSinElRegistro(), porDefecto (+1 more)

### Community 67 - "app.js"
Cohesion: 0.11
Nodes (21): app, cors, crearApp(), { crearRouterApi, montajes: montajesDeLaApi }, errorHandler, express, helmet, noEncontrado (+13 more)

### Community 68 - "base-de-prueba.test.js"
Cohesion: 0.29
Nodes (8): carpetaBackend, correrNpm(), correrNpmSinFallar(), consultar(), permisosDelUsuario(), require, sequelize, tablasDe()

### Community 69 - "archivos.test.js"
Cohesion: 0.17
Nodes (8): archivosJs(), backend, raiz, require, src, app, { cargarDocumentacionApi }, require

### Community 70 - "productos-migracion.test.js"
Cohesion: 0.25
Nodes (10): correrCli(), archivo, carpetaMigraciones, columnas(), indices(), leer(), require, restriccionesCheck() (+2 more)

### Community 71 - "database.js"
Cohesion: 0.18
Nodes (9): { config }, { Sequelize }, { DataTypes }, Producto, sequelize, { DataTypes }, require, sequelize (+1 more)

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

### Community 76 - "AnimacionLottie.test.js"
Cohesion: 0.21
Nodes (7): es, animacion, { loadAnimation, instancias }, @mdi/font, vue, @vue/test-utils, vuetify

### Community 77 - "estructura-del-documento.test.js"
Cohesion: 0.18
Nodes (11): { cargarDocumentacionApi }, DINERO, documento, ESTADOS_PERMITIDOS, METODOS, nombresDeCampos(), problemasDeDinero(), recorrer() (+3 more)

### Community 78 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 79 - "Despliegue de AIPOS"
Cohesion: 0.09
Nodes (25): production(), Caddy, Casos de error, Configuración del servidor (una sola vez), Criterios de aceptación, Cómo queda armado el servidor, Cómo se decidió el diseño, Despliegue de AIPOS (+17 more)

### Community 80 - "Design System: AIPOS"
Cohesion: 0.20
Nodes (9): Colors, Components, Design System: AIPOS, Do's and Don'ts, Elevation & Depth, Layout, Overview, Shapes (+1 more)

### Community 81 - "AnimacionLottie.vue"
Cohesion: 0.12
Nodes (17): animacion(), beforeDestroy(), crear(), destruir(), mounted(), pideMenosMovimiento(), lottie-web, `App.vue`: une la búsqueda con la venta actual (V-04) (+9 more)

### Community 82 - "venta-vacia.test.js"
Cohesion: 0.27
Nodes (9): aCentavos(), formatearCentavos(), calcularSubtotal(), calcularTotal(), congelar(), leche, pan, Subtotales y total (V-04) (+1 more)

### Community 83 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, preview, test (+1 more)

### Community 84 - "vitest-vue2.test.js"
Cohesion: 0.22
Nodes (5): avisosAlInstalar, declaradas, espia, paquete, versionesDelFrontend

### Community 85 - "docs.js"
Cohesion: 0.14
Nodes (15): { cargarDocumentacionApi }, DE_DEMOSTRACION, documento, helmet, { Router }, swaggerUi, app, docs (+7 more)

### Community 86 - "crear-producto.test.js"
Cohesion: 0.20
Nodes (16): anotarCodigoDeBarras(), api(), codigoConCerosNuevo(), codigoDeBarrasNuevo(), contarProductos(), crearProductoPorApi(), filasConCodigoDeBarras(), productoValido() (+8 more)

### Community 87 - "http.js"
Cohesion: 0.36
Nodes (5): crearError(), http, traducirError(), cargarHttp(), axios

### Community 88 - "sin-axios-en-componentes.test.js"
Cohesion: 0.29
Nodes (6): archivosDe(), componentes, enSrc(), fueraDeApi, raiz, todos

### Community 90 - "dependencias.test.js"
Cohesion: 0.29
Nodes (5): backend, EN_DEPENDENCIES, EN_DEV_DEPENDENCIES, lock, paquete

### Community 91 - "animaciones.test.js"
Cohesion: 0.33
Nodes (5): aHex(), carpeta, coloresDe(), paleta, permitidas

### Community 93 - "documentacion.js"
Cohesion: 0.11
Nodes (18): cargarDocumentacionApi(), fs, { parse }, path, RUTA_DEL_DOCUMENTO, app, { cargarDocumentacionApi }, documento (+10 more)

### Community 94 - "dependencies"
Cohesion: 0.33
Nodes (6): dependencies, axios, lottie-web, @mdi/font, vue, vuetify

### Community 95 - "crear-producto-simultaneo.test.js"
Cohesion: 0.33
Nodes (4): borrarProductosDePrueba(), { crearProducto }, ErrorApi, require

### Community 96 - "Flujo 05 · Entregar un entregable"
Cohesion: 0.40
Nodes (5): Entrega final, Flujo 05 · Entregar un entregable, Otros caminos, Pasos, Qué no se hace

### Community 98 - "Flujo 06 · Trabajar una tarjeta con el agente"
Cohesion: 0.67
Nodes (3): Flujo 06 · Trabajar una tarjeta con el agente, Otros caminos, Pasos

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

### Community 106 - "Buscar producto"
Cohesion: 0.14
Nodes (13): Buscar producto, Criterios de aceptación de la API (P-04), Criterios de aceptación de la pantalla (P-05), Cómo se decidió el diseño, Cómo se ve y se comporta, Diseño (skill `impeccable`), Estados de la zona de resultados, Lo que esta spec no cubre (+5 more)

### Community 107 - "Flujo 00 · Mapa de procesos"
Cohesion: 0.67
Nodes (3): Desarrollo de AIPOS, Flujo 00 · Mapa de procesos, Operación del POS

### Community 108 - "documentacion-crear-producto.test.js"
Cohesion: 0.17
Nodes (10): docs, montajes, productos, { Router }, salud, { cargarDocumentacionApi }, documento, { montajes } (+2 more)

### Community 109 - "total"
Cohesion: 0.19
Nodes (13): total(), API: POST /api/ventas (V-03), Archivos, Criterios de aceptación de V-02, Criterios de aceptación de V-03, Documentación de la API, El servicio y el procedimiento, Parámetro y respuesta (+5 more)

### Community 110 - "salud-con-base.test.js"
Cohesion: 0.07
Nodes (28): { consultarSalud }, obtenerSalud(), { obtenerSalud }, { Router }, conLimiteDeTiempo(), consultarSalud(), sequelize, app (+20 more)

### Community 111 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, @apidevtools/swagger-parser, eslint, eslint-config-prettier, @eslint/js, globals, prettier, supertest (+1 more)

### Community 112 - "ErrorApi.js"
Cohesion: 0.31
Nodes (8): desdeBaseDeDatos(), ErrorApi, ESTADOS, aErrorApi(), desdeBaseDeDatos, desdeElCuerpo(), ErrorApi, esDelLector()

### Community 115 - "Flujo 04 · Registrar venta"
Cohesion: 0.50
Nodes (4): Flujo 04 · Registrar venta, Notas técnicas, Otros caminos, Pasos

### Community 116 - "ref_vitest"
Cohesion: 0.11
Nodes (14): require, sequelize, carpetaModelos, modelos, registrados, require, tablasDelGlosario, app (+6 more)

### Community 120 - "Armar la venta actual"
Cohesion: 0.18
Nodes (10): Armar la venta actual, Casos de error y bordes, Cómo se decidió el diseño, Guardar la venta actual en el navegador (V-04), La API, con `curl`, La pantalla, en el navegador con el MCP `chrome-devtools`, La venta actual: los datos, Lo que esta spec no cubre (+2 more)

### Community 123 - "ejemplos-de-error.test.js"
Cohesion: 0.22
Nodes (6): { cargarDocumentacionApi }, documento, PROHIBIDO, recogerEjemplos(), require, RESPUESTAS_DE_ERROR

### Community 124 - "ayudas-crear-producto.js"
Cohesion: 0.28
Nodes (7): app, codigosUsados, idsCreados, require, sequelize, abrirServidorDePrueba(), cerrarServidorDePrueba()

### Community 125 - "ErrorApi"
Cohesion: 0.25
Nodes (7): ErrorApi, Capas, API: `GET /api/productos?busqueda=<texto>`, Cómo busca el servicio, Documentación de la API, Pruebas en local: la API con `curl`, Validación del texto

### Community 126 - "validador-producto.test.js"
Cohesion: 0.29
Nodes (7): detallesDe(), ErrorApi, errorDe(), OBLIGATORIOS, require, { validarProductoNuevo }, valido

### Community 127 - "vaciarVentaActual"
Cohesion: 0.29
Nodes (4): data(), vaciarVentaActual(), Lo que V-08 espera de esta spec, Quién implementa qué

### Community 128 - "controllers/productos.js"
Cohesion: 0.33
Nodes (5): crearProducto(), productos, { validarProductoNuevo }, { crearProducto }, { Router }

### Community 129 - "Backend"
Cohesion: 0.33
Nodes (7): errorHandler(), Backend, Carpetas, Errores, Límites, CORS y cabeceras, Procedimientos almacenados, Salud

### Community 130 - "servidor.test.js"
Cohesion: 0.33
Nodes (3): abrirUnPuerto(), backend, buscarPuertoLibre()

### Community 131 - "Trabajar en un tile"
Cohesion: 0.29
Nodes (7): 5. Cambiar un tile, 6. Medir un tile con evals (necesita cuenta), 7. Publicar un tile (necesita cuenta), Qué va a git y qué no, Seguridad, Solución de problemas, Trabajar en un tile

### Community 132 - "MySQL stored procedure authoring"
Cohesion: 0.29
Nodes (6): 1. Files, 2. Migration, 3. Template: a sale with its items, 4. Rules inside the body, 5. Final check, MySQL stored procedure authoring

### Community 133 - "Lenguaje ubicuo — AIPOS"
Cohesion: 0.33
Nodes (6): Convención de nombres en código, Herramientas y proceso, Historial de cambios, Lenguaje ubicuo — AIPOS, Negocio, Pendientes (por confirmar)

### Community 134 - "El módulo (`src/ventaActual/`)"
Cohesion: 0.33
Nodes (6): `agregarAVentaActual` (V-04), `cambiarCantidad` y `validarCantidad` (V-06), `cambiarPrecioAplicado` y `validarPrecioAplicado` (V-05), El módulo (`src/ventaActual/`), `eliminarDetalle` (V-07), Validez, registro y vaciado (V-04)

### Community 135 - "P-02 · `POST /api/productos`"
Cohesion: 0.33
Nodes (6): Contrato, Criterios de aceptación de P-02, Documentación de la API (tarjeta A-01), P-02 · `POST /api/productos`, Servicio, 409 y peticiones al mismo tiempo, Validación

### Community 136 - "noEncontrado"
Cohesion: 0.50
Nodes (4): ErrorApi, noEncontrado(), La política de contenido solo en `/api/docs`, Swagger UI en `GET /api/docs`

### Community 137 - "Qué es y para qué sirve"
Cohesion: 0.40
Nodes (5): 1. Instalar Graphify, 2. Activar el hook de git, 3. Verificar, Qué es y para qué sirve, Requisitos

### Community 138 - "La pantalla"
Cohesion: 0.40
Nodes (5): Botón «Eliminar» (V-07), `CampoCantidad.vue` (V-06), `CampoPrecioAplicado.vue` (V-05), Diseño (skill `impeccable`), La pantalla

### Community 139 - "Criterios de aceptación"
Cohesion: 0.40
Nodes (5): Criterios de aceptación, V-04 · Agregar productos y ver el total (RF-03, RF-04, RF-08), V-05 · Editar el precio aplicado (RF-05), V-06 · Cambiar la cantidad (RF-06), V-07 · Eliminar un producto (RF-07)

## Knowledge Gaps
- **622 isolated node(s):** `singleQuote`, `printWidth`, `trailingComma`, `{ cargarConfigDeEntorno, cargarArchivoEnv }`, `name` (+617 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 723 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **49 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `total()` connect `total` to `MySQL stored procedure authoring`, `Requerimientos funcionales`, `Lenguaje ubicuo — AIPOS`, `venta-vacia.test.js`, `Registrar venta`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Why does `Lenguaje ubicuo — AIPOS` connect `Lenguaje ubicuo — AIPOS` to `graphify-setup.md`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `Arquitectura de AIPOS` connect `src/config.js` to `AnimacionLottie.vue`, `Backend`, `Registrar venta`, `arquitectura.spec.md`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **What connects `singleQuote`, `printWidth`, `trailingComma` to the rest of the system?**
  _622 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Requerimientos funcionales` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
