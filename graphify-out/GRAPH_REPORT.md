# Graph Report - v-03  (2026-09-30)

## Corpus Check
- 238 files · ~184,080 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 31 file(s) not represented in the graph (top: (none) 17, .drawio 8, .example 2)

## Summary
- 1652 nodes · 2620 edges · 166 communities (114 shown, 52 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 105 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- En AIPOS, el hook de git `pre-commit` actualiza este grafo en cada commit: va al día con el commit que lo trae.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Grafo del proyecto
- dependencies
- Trabajar en un tile
- NuevoProducto.test.js
- FormularioProducto.vue
- ayudas-crear-producto.js
- Flujo de un entregable
- Configurar el MCP de Trello
- saltos-de-linea.test.sh
- Tarjetas
- Documentación de la API
- Glosario de lenguaje ubicuo
- Bitácora de IA
- README de entrega
- ayudas-sp-registrar-venta.js
- Calling a stored procedure from Sequelize
- Vue 2 + Vuetify 2 + Vite setup
- Requerimientos de AIPOS
- Buscar producto
- hook-de-claude-code/graphify-fuera-del-path.test.sh
- Grafo del proyecto
- hook-de-git/comun.sh
- AIPOS
- Requerimientos no funcionales
- Comandos útiles
- misma-version.test.sh
- ignora-lo-local.test.sh
- agents-md.test.sh
- CLAUDE.md
- ayudas-ventas.js
- comunicacion-clara.md
- rules/lenguaje-ubicuo.md
- mysql-sequelize.md
- estructura-del-documento.test.js
- sin-rutas-ni-evals.test.sh
- update-sin-cambios.test.sh
- hook-de-claude-code/sin-graphify.test.sh
- agrega-el-grafo.test.sh
- graphify-falla.test.sh
- hook-de-git/sin-graphify.test.sh
- hook-de-git/graphify-fuera-del-path.test.sh
- otra-version.test.sh
- Crear producto
- BuscadorProductos.test.js
- marca-de-commit.test.sh
- version-con-crlf.test.sh
- desactualizado-tras-falla.test.sh
- merge-sin-choques.test.sh
- merge-sin-cambios-en-el-grafo.test.sh
- FormularioProducto.test.js
- spec-arquitectura.test.sh
- agents-md-tarjeta.test.sh
- Despliegue de AIPOS
- Alcance
- despliegue/comun.sh
- desplegar.sh
- revisar-produccion.sh
- ref_vitest
- arranque-local.test.sh
- instalar-caddy.test.sh
- imagenes.test.sh
- validar-busqueda.test.js
- instalar-caddy.sh
- revisar-produccion.test.sh
- compose-produccion.test.sh
- crear-env.test.sh
- crear-env.sh
- desplegar-migracion-falla.test.sh
- desplegar-sin-imagen.test.sh
- documentos.test.sh
- etiqueta-en-produccionenv.test.sh
- github-environment-y-etiquetas.test.sh
- sin-datos-privados.test.sh
- volver-dos-veces.test.sh
- volver-si-falla-la-salud.test.sh
- workflow.test.sh
- revisar-etiqueta.sh
- caddy.test.sh
- desplegar-en-fila.test.sh
- desplegar-ok.test.sh
- etiqueta-release.test.sh
- sin-borrar-datos.test.sh
- volver-primer-despliegue.test.sh
- archivos.test.js
- frontend/package.json
- sin-axios-en-componentes.test.js
- backend/package.json
- docs.js
- app.js
- errorHandler.js
- scripts
- ayudas.js
- devDependencies
- migraciones.test.js
- AnimacionLottie.test.js
- dependencias.test.js
- src/config.js
- documentacion-buscar-productos.test.js
- Product
- dependencies
- productos-migracion.test.js
- Design System: AIPOS
- devDependencies
- vaciarVentaActual
- comparar-rutas.test.js
- estructura.test.js
- scripts
- migraciones-ventas.test.js
- production
- sp-registrar-venta-migracion.test.js
- ref_node_path
- venta-vacia.test.js
- animaciones.test.js
- AnimacionLottie.vue
- eslint.config.js
- Armar la venta actual
- dependencies
- Vuetify 2 components (Vue 2.7)
- productos/buscar-productos.test.js
- validacion-comun.test.js
- Flujo 05 · Entregar un entregable
- glosario-y-alcance.test.sh
- backend/.prettierrc.json
- frontend/.prettierrc.json
- database.js
- Flujo 01 · Crear producto
- Flujo 02 · Buscar producto
- Flujo 03 · Armar la venta actual
- controllers/productos.js
- Flujo 00 · Mapa de procesos
- ejemplos-reales.test.js
- vitest-vue2.test.js
- vue2-vuetify2.md
- noEncontrado
- routes/index.js
- AIPOS
- validador-producto.test.js
- services/productos.js
- servidor.test.js
- documentacion-crear-producto.test.js
- P-03 · El botón "Nuevo producto" y el formulario
- Flujo 04 · Registrar venta
- ref_node_fs
- Criterios de aceptación
- Requerimientos funcionales
- P-02 · `POST /api/productos`
- Lenguaje ubicuo — AIPOS
- Flujo 07 · Desplegar una versión
- Imágenes
- validador-venta.test.js
- scarfSettings
- documentacion.js
- Pantalla: botón "Registrar venta" (V-08)
- El módulo (`src/ventaActual/`)
- La pantalla
- ErrorApi.js
- Flujo 06 · Trabajar una tarjeta con el agente

## God Nodes (most connected - your core abstractions)
1. `Despliegue de AIPOS` - 22 edges
2. `supertest` - 16 edges
3. `texto()` - 16 edges
4. `scripts` - 15 edges
5. `consultar()` - 15 edges
6. `cargarDocumentacionApi()` - 14 edges
7. `Requerimientos funcionales` - 14 edges
8. `Requerimientos no funcionales` - 14 edges
9. `Armar la venta actual` - 13 edges
10. `Arquitectura de AIPOS` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Herramientas y proceso` --references--> `production()`  [INFERRED]
  docs/lenguaje-ubicuo.md → backend/db/config.js
- `Despliegue` --references--> `production()`  [INFERRED]
  README.md → backend/db/config.js
- `Pasos` --references--> `production()`  [INFERRED]
  requerimientos/flujos/07-desplegar-una-version.md → backend/db/config.js
- `Reglas de negocio` --references--> `validarTexto()`  [INFERRED]
  specs/crear-producto.spec.md → backend/src/validators/comunes.js
- `Validación` --references--> `validarTexto()`  [INFERRED]
  specs/crear-producto.spec.md → backend/src/validators/comunes.js

## Import Cycles
- None detected.

## Communities (166 total, 52 thin omitted)

### Community 1 - "Grafo del proyecto"
Cohesion: 0.18
Nodes (10): Arranque de un clon nuevo, Grafo del proyecto, Hook de Claude Code, Hook de git `pre-commit`, Proceso escrito, Qué entra al grafo, Qué no se usa, Qué va a git (+2 more)

### Community 2 - "dependencies"
Cohesion: 0.12
Nodes (16): agents, dependencies, g14wxz/entrega-trazable, g14wxz/grafo-del-proyecto, g14wxz/lenguaje-ubicuo, g14wxz/mysql-sequelize-procedimientos, g14wxz/vue2-vuetify2-vite, tessl-labs/spec-driven-development (+8 more)

### Community 3 - "Trabajar en un tile"
Cohesion: 0.14
Nodes (14): 1. Instalar Tessl, 2. Instalar los tiles del proyecto, 3. Conectar el MCP de Tessl (opcional), 4. Verificar, 5. Cambiar un tile, 6. Medir un tile con evals (necesita cuenta), 7. Publicar un tile (necesita cuenta), Qué va a git y qué no (+6 more)

### Community 4 - "NuevoProducto.test.js"
Cohesion: 0.22
Nodes (10): abrirLlenarYGuardar(), boton(), botonNuevo(), dialogo(), entrada(), escribir(), esperar(), { loadAnimation, instancias } (+2 more)

### Community 5 - "FormularioProducto.vue"
Cohesion: 0.10
Nodes (30): crearProducto(), alAbrir(), alSalir(), cancelar(), cerrar(), data(), enfocar(), enlazarTitulo() (+22 more)

### Community 6 - "ayudas-crear-producto.js"
Cohesion: 0.14
Nodes (25): anotarCodigoDeBarras(), api(), app, borrarProductosDePrueba(), codigoConCerosNuevo(), codigoDeBarrasNuevo(), codigosUsados, contarProductos() (+17 more)

### Community 7 - "Flujo de un entregable"
Cohesion: 0.18
Nodes (10): 0. Revisar el repositorio (una vez por proyecto), 1. Empezar el entregable, 2. Trabajar, 3. Abrir el PR, 4. Revisar antes de integrar, 5. Integrar, 6. Etiquetar, 7. Entrega final (+2 more)

### Community 8 - "Configurar el MCP de Trello"
Cohesion: 0.18
Nodes (11): 1. Crear el board en Trello, 2. Obtener el API key, 3. Generar el token, 4. Agregar el servidor a Claude Code, 5. Verificar la conexión, Alternativa: Codex CLI, Configurar el MCP de Trello, Requisitos (+3 more)

### Community 10 - "Tarjetas"
Cohesion: 0.17
Nodes (12): Definición de terminado, Despliegue, Entrega final, Entregable productos, Entregable ventas, Entregables y tarjetas, Ramas de tarjeta, Requerimientos (+4 more)

### Community 11 - "Documentación de la API"
Cohesion: 0.10
Nodes (23): { consultarSalud }, obtenerSalud(), conLimiteDeTiempo(), consultarSalud(), cortarConexion(), sequelize, Salud, Cabecera (+15 more)

### Community 12 - "Glosario de lenguaje ubicuo"
Cohesion: 0.22
Nodes (7): Plantilla: docs/lenguaje-ubicuo.md, Crear el glosario, Cuando aparece una palabra nueva o dudosa, Cuando un término cambia, Cómo escribir cada entrada, Glosario de lenguaje ubicuo, Revisar si el código habla igual que el negocio

### Community 13 - "Bitácora de IA"
Cohesion: 0.25
Nodes (6): Plantilla: docs/bitacora-ia.md, Bitácora de IA, Cuándo escribir, Cómo escribir una entrada, Reconstruir desde git, Reglas

### Community 14 - "README de entrega"
Cohesion: 0.29
Nodes (5): Plantilla: README.md de entrega, De dónde sale cada punto, Flujo, README de entrega, Reglas

### Community 15 - "ayudas-sp-registrar-venta.js"
Cohesion: 0.06
Nodes (57): ARCHIVO_SQL, borrarDatosDePrueba(), borrarVentas(), buscarClienteMysql(), { config }, consultar(), correrSql(), crearLlamador() (+49 more)

### Community 16 - "Calling a stored procedure from Sequelize"
Cohesion: 0.29
Nodes (6): 1. Service, 2. No outer transaction, 3. Validate before calling, 4. Map database errors to HTTP, 5. Search products by name or barcode, Calling a stored procedure from Sequelize

### Community 17 - "Vue 2 + Vuetify 2 + Vite setup"
Cohesion: 0.29
Nodes (6): 1. Versions, 2. Project files, 3. Environment and API client, 4. ESLint (optional), 5. Check, Vue 2 + Vuetify 2 + Vite setup

### Community 18 - "Requerimientos de AIPOS"
Cohesion: 0.33
Nodes (6): Aspectos que se evaluarán, Cómo leer esta carpeta, Flujos, Matriz del PDF, Preguntas abiertas, Requerimientos de AIPOS

### Community 19 - "Buscar producto"
Cohesion: 0.14
Nodes (13): Buscar producto, Criterios de aceptación de la API (P-04), Criterios de aceptación de la pantalla (P-05), Cómo se decidió el diseño, Cómo se ve y se comporta, Diseño (skill `impeccable`), Estados de la zona de resultados, Lo que esta spec no cubre (+5 more)

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

### Community 31 - "ayudas-ventas.js"
Cohesion: 0.10
Nodes (33): conTransaccionDescartada(), errorDeMySQL(), insertarProducto(), require, sequelize, ER_BAD_NULL_ERROR, ER_CHECK_CONSTRAINT_VIOLATED, ER_DUP_ENTRY (+25 more)

### Community 35 - "estructura-del-documento.test.js"
Cohesion: 0.18
Nodes (11): { cargarDocumentacionApi }, DINERO, documento, ESTADOS_PERMITIDOS, METODOS, nombresDeCampos(), problemasDeDinero(), recorrer() (+3 more)

### Community 44 - "Crear producto"
Cohesion: 0.14
Nodes (13): Bugs, Crear producto, Criterios de aceptación de P-01, Migración, Modelo, P-01: la base, P-01 · La tabla `productos` y el modelo `Producto`, P-02: la API con `curl` (+5 more)

### Community 45 - "BuscadorProductos.test.js"
Cohesion: 0.06
Nodes (35): buscarProductos(), beforeDestroy(), buscar(), buscarAlPresionarEnter(), cancelarEspera(), elegir(), largoEnCaracteres(), mostrar() (+27 more)

### Community 52 - "FormularioProducto.test.js"
Cohesion: 0.12
Nodes (23): crearError(), http, traducirError(), cargar(), leche, cargar(), producto, cargarHttp() (+15 more)

### Community 53 - "spec-arquitectura.test.sh"
Cohesion: 0.71
Nodes (7): debe_decir(), falla(), ok(), revisar(), spec-arquitectura.test.sh script, unido(), ya_no_debe_decir()

### Community 55 - "Despliegue de AIPOS"
Cohesion: 0.12
Nodes (17): Caddy, Casos de error, Configuración del servidor (una sola vez), Criterios de aceptación, Cómo queda armado el servidor, Cómo se decidió el diseño, Despliegue de AIPOS, Docker Compose de producción (`docker-compose.produccion.yml`) (+9 more)

### Community 56 - "Alcance"
Cohesion: 0.22
Nodes (9): Actores y partes, Alcance, Fuera de alcance, Lo que agregamos y el PDF no pide, Objetivo, Qué entra, Restricciones, Riesgos (+1 more)

### Community 57 - "despliegue/comun.sh"
Cohesion: 0.10
Nodes (15): comprobar(), crear_dobles(), crear_repo_de_mentira(), crear_version(), estar_corriendo(), falla(), igual(), marcar_imagen() (+7 more)

### Community 58 - "desplegar.sh"
Cohesion: 0.31
Nodes (17): bajar_imagenes(), comprobar_env(), comprobar_etiqueta(), dc(), desplegar(), escribir_estado(), esperar_200(), fallar() (+9 more)

### Community 59 - "revisar-produccion.sh"
Cohesion: 0.33
Nodes (9): cabecera_cors(), pedir(), revisar(), revisar_cors_otro(), revisar_cors_permitido(), revisar_docs(), revisar_pantalla(), revisar_salud() (+1 more)

### Community 60 - "ref_vitest"
Cohesion: 0.10
Nodes (13): require, sequelize, { DataTypes }, require, sequelize, carpetaModelos, modelos, registrados (+5 more)

### Community 61 - "arranque-local.test.sh"
Cohesion: 0.46
Nodes (6): compose(), desplegar(), limpiar(), mysql_app(), restos_del_proyecto(), arranque-local.test.sh script

### Community 62 - "instalar-caddy.test.sh"
Cohesion: 0.32
Nodes (5): armar(), CADDY_FALLA, CAMBIA_VECINO, correr_script(), instalar-caddy.test.sh script

### Community 63 - "imagenes.test.sh"
Cohesion: 0.38
Nodes (3): leer(), imagenes.test.sh script, uso()

### Community 64 - "validar-busqueda.test.js"
Cohesion: 0.18
Nodes (10): validarBusqueda(), ErrorApi, errorDe(), require, { validarBusqueda }, API: `GET /api/productos?busqueda=<texto>`, Cómo busca el servicio, Documentación de la API (+2 more)

### Community 65 - "instalar-caddy.sh"
Cohesion: 0.60
Nodes (3): codigos(), fallar(), instalar-caddy.sh script

### Community 66 - "revisar-produccion.test.sh"
Cohesion: 0.70
Nodes (4): arrancar(), parar(), revisar(), revisar-produccion.test.sh script

### Community 67 - "compose-produccion.test.sh"
Cohesion: 0.83
Nodes (3): compose_config(), dato(), compose-produccion.test.sh script

### Community 68 - "crear-env.test.sh"
Cohesion: 0.67
Nodes (3): AIPOS_RAIZ, crear-env.test.sh script, valor()

### Community 86 - "archivos.test.js"
Cohesion: 0.17
Nodes (8): archivosJs(), backend, raiz, require, src, app, { cargarDocumentacionApi }, require

### Community 87 - "frontend/package.json"
Cohesion: 0.11
Nodes (18): description, engines, node, eslint, eslint-config-prettier, @eslint/js, globals, prettier (+10 more)

### Community 88 - "sin-axios-en-componentes.test.js"
Cohesion: 0.29
Nodes (6): archivosDe(), componentes, enSrc(), fueraDeApi, raiz, todos

### Community 89 - "backend/package.json"
Cohesion: 0.12
Nodes (16): description, engines, node, eslint, eslint-config-prettier, @eslint/js, globals, prettier (+8 more)

### Community 90 - "docs.js"
Cohesion: 0.14
Nodes (15): { cargarDocumentacionApi }, DE_DEMOSTRACION, documento, helmet, { Router }, swaggerUi, app, docs (+7 more)

### Community 91 - "app.js"
Cohesion: 0.08
Nodes (25): app, cors, crearApp(), { crearRouterApi, montajes: montajesDeLaApi }, errorHandler, express, helmet, noEncontrado (+17 more)

### Community 92 - "errorHandler.js"
Cohesion: 0.27
Nodes (11): aErrorApi(), desdeBaseDeDatos, desdeElCuerpo(), ErrorApi, errorHandler(), esDelLector(), Backend, Carpetas (+3 more)

### Community 93 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, deshacer, deshacer:prueba, dev, format, format:check, lint, migrar (+7 more)

### Community 94 - "ayudas.js"
Cohesion: 0.17
Nodes (9): carpetaBackend, carpetaRaiz, correrNpm(), correrNpmSinFallar(), crearProxyCongelable(), archivo, app, require (+1 more)

### Community 95 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-vue, globals, jsdom, prettier (+6 more)

### Community 96 - "migraciones.test.js"
Cohesion: 0.16
Nodes (11): correrCli(), tablasDeLaBase(), archivos, cargarConfiguracion(), carpetaMigraciones, require, sequelize, tablasSinElRegistro() (+3 more)

### Community 97 - "AnimacionLottie.test.js"
Cohesion: 0.14
Nodes (8): es, animacion, { loadAnimation, instancias }, paquete, @mdi/font, vue, @vue/test-utils, vuetify

### Community 98 - "dependencias.test.js"
Cohesion: 0.29
Nodes (5): backend, EN_DEPENDENCIES, EN_DEV_DEPENDENCIES, lock, paquete

### Community 99 - "src/config.js"
Cohesion: 0.05
Nodes (50): { cargarConfigDeEntorno, cargarArchivoEnv }, development(), paraElCli(), test(), crearBaseDePrueba(), cargarArchivoEnv(), cargarClaveRoot(), cargarConfig() (+42 more)

### Community 100 - "documentacion-buscar-productos.test.js"
Cohesion: 0.20
Nodes (8): montajes, app, { cargarDocumentacionApi }, documento, idsCreados, { montajes }, { Producto }, require

### Community 101 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 102 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, cors, dotenv, express, helmet, mysql2, sequelize, sequelize-cli (+3 more)

### Community 103 - "productos-migracion.test.js"
Cohesion: 0.29
Nodes (9): archivo, carpetaMigraciones, columnas(), indices(), leer(), require, restriccionesCheck(), sequelize (+1 more)

### Community 104 - "Design System: AIPOS"
Cohesion: 0.20
Nodes (9): Colors, Components, Design System: AIPOS, Do's and Don'ts, Elevation & Depth, Layout, Overview, Shapes (+1 more)

### Community 105 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, @apidevtools/swagger-parser, eslint, eslint-config-prettier, @eslint/js, globals, prettier, supertest (+1 more)

### Community 106 - "vaciarVentaActual"
Cohesion: 0.36
Nodes (5): data(), aCentavos(), formatearCentavos(), vaciarVentaActual(), Subtotales y total (V-04)

### Community 107 - "comparar-rutas.test.js"
Cohesion: 0.10
Nodes (25): { cargarDocumentacionApi }, { crearApp }, docs, documentadas, documento, { montajes }, require, { Router } (+17 more)

### Community 108 - "estructura.test.js"
Cohesion: 0.22
Nodes (6): archivosJs(), backend, paquete, raiz, require_, src

### Community 110 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, preview, test (+1 more)

### Community 111 - "migraciones-ventas.test.js"
Cohesion: 0.19
Nodes (14): archivoDetalles, archivoProductos, archivoVentas, carpetaMigraciones, columnas(), estructura(), indices(), leer() (+6 more)

### Community 112 - "production"
Cohesion: 0.16
Nodes (14): production(), Configuración del servidor (una sola vez), Cómo desplegar una versión, Cómo queda armado el servidor, Despliegue de AIPOS, Environment y regla de etiquetas (GitHub), Errores frecuentes, Lo que nunca se hace (+6 more)

### Community 113 - "sp-registrar-venta-migracion.test.js"
Cohesion: 0.20
Nodes (8): archivoDetalles, archivoProcedimiento, archivoVentas, carpetaMigraciones, cliente, nombres, require, sequelize

### Community 115 - "ref_node_path"
Cohesion: 0.22
Nodes (4): archivosJs(), ejemplo, raiz, carpetaBackend

### Community 116 - "venta-vacia.test.js"
Cohesion: 0.36
Nodes (7): calcularSubtotal(), calcularTotal(), congelar(), leche, pan, Quién implementa qué, `VentaActual.vue` (V-04, y V-05 a V-07 sobre él)

### Community 117 - "animaciones.test.js"
Cohesion: 0.25
Nodes (7): aHex(), animadas(), buscar(), carpeta, coloresDe(), paleta, permitidas

### Community 118 - "AnimacionLottie.vue"
Cohesion: 0.43
Nodes (6): animacion(), beforeDestroy(), crear(), destruir(), mounted(), pideMenosMovimiento()

### Community 120 - "Armar la venta actual"
Cohesion: 0.17
Nodes (11): Armar la venta actual, Casos de error y bordes, Cómo se decidió el diseño, Guardar la venta actual en el navegador (V-04), La API, con `curl`, La pantalla, en el navegador con el MCP `chrome-devtools`, La venta actual: los datos, Lo que esta spec no cubre (+3 more)

### Community 121 - "dependencies"
Cohesion: 0.33
Nodes (6): dependencies, axios, lottie-web, @mdi/font, vue, vuetify

### Community 122 - "Vuetify 2 components (Vue 2.7)"
Cohesion: 0.33
Nodes (5): Custom v-model, Example: point-of-sale screen, Reactivity, Vue 3 / Vuetify 3 habit and its Vue 2 / Vuetify 2 form, Vuetify 2 components (Vue 2.7)

### Community 123 - "productos/buscar-productos.test.js"
Cohesion: 0.13
Nodes (12): app, CABLE, EJEMPLOS, idsCreados, JUGO_50, JUGO_500, LECHE, { Producto } (+4 more)

### Community 124 - "validacion-comun.test.js"
Cohesion: 0.22
Nodes (13): bueno(), conProblema(), ErrorApi, exigirDatosValidos(), validarDinero(), validarTexto(), comoObjeto(), validarProductoNuevo() (+5 more)

### Community 125 - "Flujo 05 · Entregar un entregable"
Cohesion: 0.40
Nodes (5): Entrega final, Flujo 05 · Entregar un entregable, Otros caminos, Pasos, Qué no se hace

### Community 126 - "glosario-y-alcance.test.sh"
Cohesion: 0.90
Nodes (4): falla(), fila_dice(), ok(), glosario-y-alcance.test.sh script

### Community 127 - "backend/.prettierrc.json"
Cohesion: 0.50
Nodes (3): printWidth, singleQuote, trailingComma

### Community 128 - "frontend/.prettierrc.json"
Cohesion: 0.50
Nodes (3): printWidth, singleQuote, trailingComma

### Community 129 - "database.js"
Cohesion: 0.10
Nodes (18): { config }, { Sequelize }, { DataTypes }, DetalleVenta, sequelize, { DataTypes }, Producto, sequelize (+10 more)

### Community 130 - "Flujo 01 · Crear producto"
Cohesion: 0.50
Nodes (4): Flujo 01 · Crear producto, Notas técnicas, Otros caminos, Pasos

### Community 131 - "Flujo 02 · Buscar producto"
Cohesion: 0.50
Nodes (4): Flujo 02 · Buscar producto, Notas técnicas, Otros caminos, Pasos

### Community 132 - "Flujo 03 · Armar la venta actual"
Cohesion: 0.50
Nodes (4): Flujo 03 · Armar la venta actual, Notas técnicas, Otros caminos, Pasos

### Community 133 - "controllers/productos.js"
Cohesion: 0.32
Nodes (6): buscarProductos(), crearProducto(), servicio, { validarBusqueda, validarProductoNuevo }, { buscarProductos, crearProducto }, { Router }

### Community 134 - "Flujo 00 · Mapa de procesos"
Cohesion: 0.67
Nodes (3): Desarrollo de AIPOS, Flujo 00 · Mapa de procesos, Operación del POS

### Community 135 - "ejemplos-reales.test.js"
Cohesion: 0.25
Nodes (6): app, { cargarDocumentacionApi }, documento, problemas(), require, { Router }

### Community 136 - "vitest-vue2.test.js"
Cohesion: 0.20
Nodes (6): avisosAlInstalar, declaradas, espia, paquete, versionesDelFrontend, lottie-web

### Community 138 - "noEncontrado"
Cohesion: 0.40
Nodes (5): ErrorApi, noEncontrado(), crearRouterApi(), La política de contenido solo en `/api/docs`, Swagger UI en `GET /api/docs`

### Community 139 - "routes/index.js"
Cohesion: 0.25
Nodes (7): docs, productos, { Router }, salud, { obtenerSalud }, { Router }, express

### Community 140 - "AIPOS"
Cohesion: 0.20
Nodes (10): AIPOS, Base de datos: MySQL y migraciones, Base de prueba, Comandos del backend, Desde un clon limpio, Despliegue, Grafo del proyecto, Puertos, varias copias y empezar de cero (+2 more)

### Community 141 - "validador-producto.test.js"
Cohesion: 0.29
Nodes (7): detallesDe(), ErrorApi, errorDe(), OBLIGATORIOS, require, { validarProductoNuevo }, valido

### Community 142 - "services/productos.js"
Cohesion: 0.15
Nodes (16): DetalleVenta, Producto, sequelize, Venta, buscarProductos(), crearProducto(), ErrorApi, errorDeCodigoDeBarrasRepetido() (+8 more)

### Community 143 - "servidor.test.js"
Cohesion: 0.33
Nodes (3): abrirUnPuerto(), backend, buscarPuertoLibre()

### Community 144 - "documentacion-crear-producto.test.js"
Cohesion: 0.29
Nodes (5): { cargarDocumentacionApi }, documento, { montajes }, require, { validarProductoNuevo }

### Community 146 - "P-03 · El botón "Nuevo producto" y el formulario"
Cohesion: 0.33
Nodes (6): Al crear el producto, Criterios de aceptación de P-03, Diseño con `impeccable`, El formulario, Los componentes, P-03 · El botón "Nuevo producto" y el formulario

### Community 147 - "Flujo 04 · Registrar venta"
Cohesion: 0.50
Nodes (4): Flujo 04 · Registrar venta, Notas técnicas, Otros caminos, Pasos

### Community 150 - "ref_node_fs"
Cohesion: 0.18
Nodes (7): ARCHIVO, fs, leerCreate(), path, up(), contraste(), luminancia()

### Community 151 - "Criterios de aceptación"
Cohesion: 0.40
Nodes (5): Criterios de aceptación, V-04 · Agregar productos y ver el total (RF-03, RF-04, RF-08), V-05 · Editar el precio aplicado (RF-05), V-06 · Cambiar la cantidad (RF-06), V-07 · Eliminar un producto (RF-07)

### Community 152 - "Requerimientos funcionales"
Cohesion: 0.05
Nodes (42): total(), Reglas de negocio, Requerimientos funcionales, RF-01 Crear producto, RF-02 Buscar producto, RF-03 Agregar a la venta actual, RF-04 Ver los detalles de la venta actual, RF-05 Editar el precio aplicado (+34 more)

### Community 153 - "P-02 · `POST /api/productos`"
Cohesion: 0.22
Nodes (8): ErrorApi, Capas, Contrato, Criterios de aceptación de P-02, Documentación de la API (tarjeta A-01), P-02 · `POST /api/productos`, Servicio, 409 y peticiones al mismo tiempo, Validación

### Community 154 - "Lenguaje ubicuo — AIPOS"
Cohesion: 0.33
Nodes (6): Convención de nombres en código, Herramientas y proceso, Historial de cambios, Lenguaje ubicuo — AIPOS, Negocio, Pendientes (por confirmar)

### Community 155 - "Flujo 07 · Desplegar una versión"
Cohesion: 0.50
Nodes (4): Flujo 07 · Desplegar una versión, Otros caminos, Pasos, Qué no se hace

### Community 156 - "Imágenes"
Cohesion: 0.67
Nodes (3): Imagen de la pantalla (`frontend/Dockerfile`), Imagen del backend (`backend/Dockerfile`), Imágenes

### Community 158 - "validador-venta.test.js"
Cohesion: 0.21
Nodes (8): detallesDe(), detalleValido(), ErrorApi, errorDe(), require, { validarVentaNueva }, variosDetalles(), ventaValida()

### Community 160 - "documentacion.js"
Cohesion: 0.10
Nodes (18): cargarDocumentacionApi(), fs, { parse }, path, RUTA_DEL_DOCUMENTO, { cargarDocumentacionApi }, documento, PROHIBIDO (+10 more)

### Community 161 - "Pantalla: botón "Registrar venta" (V-08)"
Cohesion: 0.40
Nodes (5): Animación, Contrato del componente, Criterios de aceptación de V-08, Pantalla: botón "Registrar venta" (V-08), Qué hace

### Community 168 - "El módulo (`src/ventaActual/`)"
Cohesion: 0.33
Nodes (6): `agregarAVentaActual` (V-04), `cambiarCantidad` y `validarCantidad` (V-06), `cambiarPrecioAplicado` y `validarPrecioAplicado` (V-05), El módulo (`src/ventaActual/`), `eliminarDetalle` (V-07), Validez, registro y vaciado (V-04)

### Community 169 - "La pantalla"
Cohesion: 0.33
Nodes (6): `App.vue`: une la búsqueda con la venta actual (V-04), Botón «Eliminar» (V-07), `CampoCantidad.vue` (V-06), `CampoPrecioAplicado.vue` (V-05), Diseño (skill `impeccable`), La pantalla

### Community 170 - "ErrorApi.js"
Cohesion: 0.50
Nodes (3): desdeBaseDeDatos(), ErrorApi, ESTADOS

### Community 172 - "Flujo 06 · Trabajar una tarjeta con el agente"
Cohesion: 0.67
Nodes (3): Flujo 06 · Trabajar una tarjeta con el agente, Otros caminos, Pasos

## Knowledge Gaps
- **747 isolated node(s):** `singleQuote`, `printWidth`, `trailingComma`, `{ cargarConfigDeEntorno, cargarArchivoEnv }`, `fs` (+742 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 917 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **52 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `production()` connect `production` to `Lenguaje ubicuo — AIPOS`, `src/config.js`, `AIPOS`, `Flujo 07 · Desplegar una versión`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `total()` connect `Requerimientos funcionales` to `Lenguaje ubicuo — AIPOS`, `venta-vacia.test.js`, `vaciarVentaActual`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Why does `Arquitectura de AIPOS` connect `src/config.js` to `errorHandler.js`, `graphify-setup.md`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **What connects `singleQuote`, `printWidth`, `trailingComma` to the rest of the system?**
  _747 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Trabajar en un tile` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `FormularioProducto.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.09872241579558652 - nodes in this community are weakly interconnected._
