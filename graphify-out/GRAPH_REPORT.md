# Graph Report - v-06  (2026-09-30)

## Corpus Check
- 252 files · ~210,087 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 31 file(s) not represented in the graph (top: (none) 17, .drawio 8, .example 2)

## Summary
- 1809 nodes · 2966 edges · 179 communities (128 shown, 51 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 161 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- En AIPOS, el hook de git `pre-commit` actualiza este grafo en cada commit: va al día con el commit que lo trae.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Grafo del proyecto
- dependencies
- Trabajar en un tile
- Requerimientos funcionales
- FormularioProducto.vue
- ayudas-crear-producto.js
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
- validarTexto
- comunicacion-clara.md
- rules/lenguaje-ubicuo.md
- mysql-sequelize.md
- comparar-rutas.test.js
- sin-rutas-ni-evals.test.sh
- update-sin-cambios.test.sh
- hook-de-claude-code/sin-graphify.test.sh
- agrega-el-grafo.test.sh
- graphify-falla.test.sh
- hook-de-git/sin-graphify.test.sh
- hook-de-git/graphify-fuera-del-path.test.sh
- otra-version.test.sh
- ref_vitest
- BuscadorProductos.test.js
- marca-de-commit.test.sh
- version-con-crlf.test.sh
- desactualizado-tras-falla.test.sh
- merge-sin-choques.test.sh
- merge-sin-cambios-en-el-grafo.test.sh
- VentaActual.vue
- spec-arquitectura.test.sh
- agents-md-tarjeta.test.sh
- Despliegue de AIPOS
- Alcance
- despliegue/comun.sh
- desplegar.sh
- revisar-produccion.sh
- documentacion.js
- arranque-local.test.sh
- instalar-caddy.test.sh
- imagenes.test.sh
- database.js
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
- ayudas-sp-registrar-venta.js
- frontend/package.json
- src/config.js
- backend/package.json
- docs.js
- app.js
- ayudas-ventas.js
- scripts
- ayudas.js
- devDependencies
- migraciones.test.js
- estructura-del-documento.test.js
- Documentación de la API
- Crear producto
- NuevoProducto.test.js
- Product
- dependencies
- App.vue
- Design System: AIPOS
- devDependencies
- VentaActual-eliminar.test.js
- ejemplos-reales.test.js
- estructura.test.js
- scripts
- vuetify.js
- vitest-vue2.test.js
- sp-registrar-venta-migracion.test.js
- BuscadorProductos.vue
- BuscadorProductos-enter.test.js
- api/productos.js
- cantidad.test.js
- animaciones.test.js
- eslint.config.js
- validar-busqueda.test.js
- dependencies
- value
- productos/buscar-productos.test.js
- migraciones-ventas.test.js
- Flujo 05 · Entregar un entregable
- glosario-y-alcance.test.sh
- backend/.prettierrc.json
- frontend/.prettierrc.json
- Flujo 01 · Crear producto
- Flujo 02 · Buscar producto
- Flujo 03 · Armar la venta actual
- Flujo 04 · Registrar venta
- Flujo 00 · Mapa de procesos
- ref_node_path
- validador-producto.test.js
- FormularioProducto.test.js
- P-02 · `POST /api/productos`
- noEncontrado
- mensaje
- pantalla-venta-actual.test.js
- services/productos.js
- routes/index.js
- ventaActual.js
- errorHandler.js
- Arquitectura de AIPOS
- AnimacionLottie.vue
- validarProductoNuevo
- productos-migracion.test.js
- VentaActual.test.js
- database.test.js
- sp-registrar-venta-reglas.test.js
- Flujo 06 · Trabajar una tarjeta con el agente
- eliminar.test.js
- archivos.test.js
- aislamiento.test.js
- CampoCantidad.test.js
- formatearCentavos
- valida-y-registro.test.js
- Registrar venta
- agregar.test.js
- sin-datos-privados-falsos-positivos.test.sh
- consultarSalud
- documentacion-crear-producto.test.js
- Lenguaje ubicuo — AIPOS
- El documento OpenAPI
- API: POST /api/ventas (V-03)
- Procedimiento sp_registrar_venta (V-02)
- scarfSettings
- ErrorApi.js
- Criterios de aceptación
- Pruebas en local
- P-03 · El botón "Nuevo producto" y el formulario
- Pantalla: botón "Registrar venta" (V-08)
- Diseño de la pantalla

## God Nodes (most connected - your core abstractions)
1. `Despliegue de AIPOS` - 22 edges
2. `formatearCentavos()` - 20 edges
3. `texto()` - 18 edges
4. `scripts` - 15 edges
5. `supertest` - 15 edges
6. `vaciarVentaActual()` - 15 edges
7. `calcularTotal()` - 15 edges
8. `agregarAVentaActual()` - 15 edges
9. `cargarDocumentacionApi()` - 14 edges
10. `mensaje()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Carpetas` --references--> `test()`  [INFERRED]
  specs/arquitectura.spec.md → backend/db/config.js
- `Git y entrega` --references--> `test()`  [INFERRED]
  specs/arquitectura.spec.md → backend/db/config.js
- `Archivos` --references--> `cargarDocumentacionApi()`  [INFERRED]
  specs/documentacion-de-la-api.spec.md → backend/src/documentacion.js
- ``GET /api/salud`` --references--> `consultarSalud()`  [INFERRED]
  specs/documentacion-de-la-api.spec.md → backend/src/services/salud.js
- `Reglas de negocio` --references--> `validarTexto()`  [INFERRED]
  specs/crear-producto.spec.md → backend/src/validators/comunes.js

## Import Cycles
- None detected.

## Communities (179 total, 51 thin omitted)

### Community 1 - "Grafo del proyecto"
Cohesion: 0.18
Nodes (10): Arranque de un clon nuevo, Grafo del proyecto, Hook de Claude Code, Hook de git `pre-commit`, Proceso escrito, Qué entra al grafo, Qué no se usa, Qué va a git (+2 more)

### Community 2 - "dependencies"
Cohesion: 0.12
Nodes (16): agents, dependencies, g14wxz/entrega-trazable, g14wxz/grafo-del-proyecto, g14wxz/lenguaje-ubicuo, g14wxz/mysql-sequelize-procedimientos, g14wxz/vue2-vuetify2-vite, tessl-labs/spec-driven-development (+8 more)

### Community 3 - "Trabajar en un tile"
Cohesion: 0.14
Nodes (14): 1. Instalar Tessl, 2. Instalar los tiles del proyecto, 3. Conectar el MCP de Tessl (opcional), 4. Verificar, 5. Cambiar un tile, 6. Medir un tile con evals (necesita cuenta), 7. Publicar un tile (necesita cuenta), Qué va a git y qué no (+6 more)

### Community 4 - "Requerimientos funcionales"
Cohesion: 0.14
Nodes (14): Reglas de negocio, Requerimientos funcionales, RF-01 Crear producto, RF-02 Buscar producto, RF-03 Agregar a la venta actual, RF-04 Ver los detalles de la venta actual, RF-05 Editar el precio aplicado, RF-06 Cambiar la cantidad (+6 more)

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

### Community 11 - "Armar la venta actual"
Cohesion: 0.13
Nodes (14): `agregarAVentaActual` (V-04), Armar la venta actual, Casos de error y bordes, Cómo se decidió el diseño, El módulo (`src/ventaActual/`), `eliminarDetalle` (V-07), La API, con `curl`, La pantalla, en el navegador con el MCP `chrome-devtools` (+6 more)

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

### Community 19 - "Buscar producto"
Cohesion: 0.20
Nodes (9): Buscar producto, Criterios de aceptación de la API (P-04), Criterios de aceptación de la pantalla (P-05), Cómo se decidió el diseño, Lo que esta spec no cubre, Pruebas en local: la pantalla en el navegador, Quién implementa qué, Reglas de negocio (+1 more)

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

### Community 31 - "validarTexto"
Cohesion: 0.25
Nodes (11): bueno(), conProblema(), ErrorApi, exigirDatosValidos(), validarDinero(), validarTexto(), { validarTexto, validarDinero, exigirDatosValidos }, ErrorApi (+3 more)

### Community 35 - "comparar-rutas.test.js"
Cohesion: 0.11
Nodes (23): { cargarDocumentacionApi }, { crearApp }, docs, documentadas, documento, { montajes }, require, { Router } (+15 more)

### Community 44 - "ref_vitest"
Cohesion: 0.13
Nodes (11): require, sequelize, app, { cargarConfig }, config, { crearApp }, require, { escaparParaLike } (+3 more)

### Community 45 - "BuscadorProductos.test.js"
Cohesion: 0.16
Nodes (12): asentar(), avanzar(), conResultados(), entrada(), escribir(), escribirYBuscar(), jugo, leche (+4 more)

### Community 52 - "VentaActual.vue"
Cohesion: 0.15
Nodes (6): enfocarTrasEliminar(), puedeRegistrar(), resaltarId(), ventaActual(), ventaActualEsValida(), `VentaActual.vue` (V-04, y V-05 a V-07 sobre él)

### Community 53 - "spec-arquitectura.test.sh"
Cohesion: 0.71
Nodes (7): debe_decir(), falla(), ok(), revisar(), spec-arquitectura.test.sh script, unido(), ya_no_debe_decir()

### Community 55 - "Despliegue de AIPOS"
Cohesion: 0.05
Nodes (48): production(), Configuración del servidor (una sola vez), Cómo desplegar una versión, Cómo queda armado el servidor, Despliegue de AIPOS, Environment y regla de etiquetas (GitHub), Errores frecuentes, Lo que nunca se hace (+40 more)

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

### Community 60 - "documentacion.js"
Cohesion: 0.11
Nodes (16): cargarDocumentacionApi(), fs, { parse }, path, RUTA_DEL_DOCUMENTO, { cargarDocumentacionApi }, documento, PROHIBIDO (+8 more)

### Community 61 - "arranque-local.test.sh"
Cohesion: 0.46
Nodes (6): compose(), desplegar(), limpiar(), mysql_app(), restos_del_proyecto(), arranque-local.test.sh script

### Community 62 - "instalar-caddy.test.sh"
Cohesion: 0.32
Nodes (5): armar(), CADDY_FALLA, CAMBIA_VECINO, correr_script(), instalar-caddy.test.sh script

### Community 63 - "imagenes.test.sh"
Cohesion: 0.38
Nodes (3): leer(), imagenes.test.sh script, uso()

### Community 64 - "database.js"
Cohesion: 0.11
Nodes (15): { config }, { Sequelize }, { DataTypes }, DetalleVenta, sequelize, { DataTypes }, Producto, sequelize (+7 more)

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

### Community 86 - "ayudas-sp-registrar-venta.js"
Cohesion: 0.12
Nodes (25): borrarDatosDePrueba(), borrarVentas(), { config }, consultar(), crearLlamador(), crearProductos(), ER_LOCK_WAIT_TIMEOUT, ER_SIGNAL_EXCEPTION (+17 more)

### Community 87 - "frontend/package.json"
Cohesion: 0.11
Nodes (18): description, engines, node, eslint, eslint-config-prettier, @eslint/js, globals, prettier (+10 more)

### Community 88 - "src/config.js"
Cohesion: 0.10
Nodes (29): { cargarConfigDeEntorno, cargarArchivoEnv }, development(), paraElCli(), test(), crearBaseDePrueba(), cargarArchivoEnv(), cargarClaveRoot(), cargarConfig() (+21 more)

### Community 89 - "backend/package.json"
Cohesion: 0.12
Nodes (16): description, engines, node, eslint, eslint-config-prettier, @eslint/js, globals, prettier (+8 more)

### Community 90 - "docs.js"
Cohesion: 0.14
Nodes (15): { cargarDocumentacionApi }, DE_DEMOSTRACION, documento, helmet, { Router }, swaggerUi, app, docs (+7 more)

### Community 91 - "app.js"
Cohesion: 0.11
Nodes (19): app, cors, crearApp(), { crearRouterApi, montajes: montajesDeLaApi }, errorHandler, express, helmet, noEncontrado (+11 more)

### Community 92 - "ayudas-ventas.js"
Cohesion: 0.10
Nodes (33): conTransaccionDescartada(), errorDeMySQL(), insertarProducto(), require, sequelize, ER_BAD_NULL_ERROR, ER_CHECK_CONSTRAINT_VIOLATED, ER_DUP_ENTRY (+25 more)

### Community 93 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, deshacer, deshacer:prueba, dev, format, format:check, lint, migrar (+7 more)

### Community 94 - "ayudas.js"
Cohesion: 0.12
Nodes (12): carpetaBackend, carpetaRaiz, correrNpm(), correrNpmSinFallar(), crearProxyCongelable(), archivo, app, require (+4 more)

### Community 95 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-vue, globals, jsdom, prettier (+6 more)

### Community 96 - "migraciones.test.js"
Cohesion: 0.16
Nodes (11): correrCli(), tablasDeLaBase(), archivos, cargarConfiguracion(), carpetaMigraciones, require, sequelize, tablasSinElRegistro() (+3 more)

### Community 97 - "estructura-del-documento.test.js"
Cohesion: 0.18
Nodes (11): { cargarDocumentacionApi }, DINERO, documento, ESTADOS_PERMITIDOS, METODOS, nombresDeCampos(), problemasDeDinero(), recorrer() (+3 more)

### Community 98 - "Documentación de la API"
Cohesion: 0.17
Nodes (11): Archivos, Criterios de aceptación, Cómo se decidió el diseño, Dependencias, Documentación de la API, Glosario y alcance, La prueba de rutas documentadas, La prueba se prueba a sí misma (+3 more)

### Community 99 - "Crear producto"
Cohesion: 0.22
Nodes (8): Crear producto, Criterios de aceptación de P-01, Migración, Modelo, P-01 · La tabla `productos` y el modelo `Producto`, Patrones de diseño, Productos de ejemplo (opcional, por confirmar), Reglas de negocio

### Community 100 - "NuevoProducto.test.js"
Cohesion: 0.15
Nodes (10): abrirLlenarYGuardar(), boton(), botonNuevo(), dialogo(), entrada(), escribir(), esperar(), { loadAnimation, instancias } (+2 more)

### Community 101 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 102 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, cors, dotenv, express, helmet, mysql2, sequelize, sequelize-cli (+3 more)

### Community 103 - "App.vue"
Cohesion: 0.13
Nodes (19): alElegirProducto(), avisar(), AVISOS, data(), reemplazarVentaActual(), resaltar(), detalleGuardado(), esObjeto() (+11 more)

### Community 104 - "Design System: AIPOS"
Cohesion: 0.20
Nodes (9): Colors, Components, Design System: AIPOS, Do's and Don'ts, Elevation & Depth, Layout, Overview, Shapes (+1 more)

### Community 105 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, @apidevtools/swagger-parser, eslint, eslint-config-prettier, @eslint/js, globals, prettier, supertest (+1 more)

### Community 106 - "VentaActual-eliminar.test.js"
Cohesion: 0.13
Nodes (12): botonEliminar(), botones(), clic(), eliminarConElFocoEnElBoton(), emitidas(), etiqueta(), huevos, leche (+4 more)

### Community 107 - "ejemplos-reales.test.js"
Cohesion: 0.22
Nodes (7): app, { cargarDocumentacionApi }, documento, problemas(), require, { Router }, @apidevtools/swagger-parser

### Community 108 - "estructura.test.js"
Cohesion: 0.22
Nodes (6): archivosJs(), backend, paquete, raiz, require_, src

### Community 110 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, preview, test (+1 more)

### Community 111 - "vuetify.js"
Cohesion: 0.14
Nodes (8): es, animacion, { loadAnimation, instancias }, paquete, @mdi/font, vue, @vue/test-utils, vuetify

### Community 112 - "vitest-vue2.test.js"
Cohesion: 0.20
Nodes (6): avisosAlInstalar, declaradas, espia, paquete, versionesDelFrontend, lottie-web

### Community 113 - "sp-registrar-venta-migracion.test.js"
Cohesion: 0.13
Nodes (14): ARCHIVO_SQL, buscarClienteMysql(), correrSql(), archivoProcedimiento, cliente, contexto, archivoDetalles, archivoProcedimiento (+6 more)

### Community 114 - "BuscadorProductos.vue"
Cohesion: 0.17
Nodes (11): buscarProductos(), beforeDestroy(), buscar(), buscarAlPresionarEnter(), cancelarEspera(), elegir(), largoEnCaracteres(), mostrar() (+3 more)

### Community 115 - "BuscadorProductos-enter.test.js"
Cohesion: 0.15
Nodes (12): asentar(), avanzar(), cable, entrada(), escribir(), jugo, leche, { loadAnimation } (+4 more)

### Community 116 - "api/productos.js"
Cohesion: 0.21
Nodes (9): crearError(), http, traducirError(), cargar(), leche, cargar(), producto, cargarHttp() (+1 more)

### Community 117 - "cantidad.test.js"
Cohesion: 0.14
Nodes (9): alSalir(), CANTIDAD_MAXIMA, CANTIDAD_MINIMA, cantidadInvalida(), validarCantidad(), congelar(), leche, pan (+1 more)

### Community 118 - "animaciones.test.js"
Cohesion: 0.25
Nodes (7): aHex(), animadas(), buscar(), carpeta, coloresDe(), paleta, permitidas

### Community 120 - "validar-busqueda.test.js"
Cohesion: 0.18
Nodes (10): validarBusqueda(), ErrorApi, errorDe(), require, { validarBusqueda }, API: `GET /api/productos?busqueda=<texto>`, Cómo busca el servicio, Documentación de la API (+2 more)

### Community 121 - "dependencies"
Cohesion: 0.33
Nodes (6): dependencies, axios, lottie-web, @mdi/font, vue, vuetify

### Community 122 - "value"
Cohesion: 0.15
Nodes (13): estaEscribiendo(), value(), Botón «Eliminar» (V-07), `CampoCantidad.vue` (V-06), `CampoPrecioAplicado.vue` (V-05), Diseño (skill `impeccable`), La pantalla, Vue 2 + Vuetify 2 + Vite (+5 more)

### Community 123 - "productos/buscar-productos.test.js"
Cohesion: 0.08
Nodes (28): borrarRestos(), codigoConCerosNuevo(), codigoNuevo(), { Producto }, require, restos, sembrarRestos(), app (+20 more)

### Community 124 - "migraciones-ventas.test.js"
Cohesion: 0.19
Nodes (14): archivoDetalles, archivoProductos, archivoVentas, carpetaMigraciones, columnas(), estructura(), indices(), leer() (+6 more)

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

### Community 130 - "Flujo 01 · Crear producto"
Cohesion: 0.50
Nodes (4): Flujo 01 · Crear producto, Notas técnicas, Otros caminos, Pasos

### Community 131 - "Flujo 02 · Buscar producto"
Cohesion: 0.50
Nodes (4): Flujo 02 · Buscar producto, Notas técnicas, Otros caminos, Pasos

### Community 132 - "Flujo 03 · Armar la venta actual"
Cohesion: 0.50
Nodes (4): Flujo 03 · Armar la venta actual, Notas técnicas, Otros caminos, Pasos

### Community 133 - "Flujo 04 · Registrar venta"
Cohesion: 0.50
Nodes (4): Flujo 04 · Registrar venta, Notas técnicas, Otros caminos, Pasos

### Community 134 - "Flujo 00 · Mapa de procesos"
Cohesion: 0.67
Nodes (3): Desarrollo de AIPOS, Flujo 00 · Mapa de procesos, Operación del POS

### Community 135 - "ref_node_path"
Cohesion: 0.07
Nodes (21): ARCHIVO, fs, leerCreate(), path, up(), carpetaModelos, modelos, registrados (+13 more)

### Community 136 - "validador-producto.test.js"
Cohesion: 0.29
Nodes (7): detallesDe(), ErrorApi, errorDe(), OBLIGATORIOS, require, { validarProductoNuevo }, valido

### Community 137 - "FormularioProducto.test.js"
Cohesion: 0.27
Nodes (14): boton(), dialogo(), entrada(), escribir(), esperar(), etiquetaDe(), franja(), guardarConError() (+6 more)

### Community 138 - "P-02 · `POST /api/productos`"
Cohesion: 0.22
Nodes (8): ErrorApi, Capas, Contrato, Criterios de aceptación de P-02, Documentación de la API (tarjeta A-01), P-02 · `POST /api/productos`, Servicio, 409 y peticiones al mismo tiempo, Validación

### Community 139 - "noEncontrado"
Cohesion: 0.40
Nodes (5): ErrorApi, noEncontrado(), crearRouterApi(), La política de contenido solo en `/api/docs`, Swagger UI en `GET /api/docs`

### Community 140 - "mensaje"
Cohesion: 0.18
Nodes (11): mensaje(), `cambiarPrecioAplicado` y `validarPrecioAplicado` (V-05), Carpetas, Errores, Frontend, Servicio de API, Cómo se ve y se comporta, Diseño (skill `impeccable`) (+3 more)

### Community 141 - "pantalla-venta-actual.test.js"
Cohesion: 0.14
Nodes (7): botonRegistrar(), filas(), leche, { loadAnimation }, pan, total(), zonaVenta()

### Community 142 - "services/productos.js"
Cohesion: 0.15
Nodes (16): DetalleVenta, Producto, sequelize, Venta, buscarProductos(), crearProducto(), ErrorApi, errorDeCodigoDeBarrasRepetido() (+8 more)

### Community 143 - "routes/index.js"
Cohesion: 0.22
Nodes (8): docs, montajes, productos, { Router }, salud, { obtenerSalud }, { Router }, express

### Community 144 - "ventaActual.js"
Cohesion: 0.23
Nodes (15): Negocio, alCambiarCantidad(), alEliminar(), agregarAVentaActual(), cambiarCantidad(), detalleNuevo(), detallesParaRegistrar(), eliminarDetalle() (+7 more)

### Community 145 - "errorHandler.js"
Cohesion: 0.31
Nodes (10): aErrorApi(), desdeBaseDeDatos, desdeElCuerpo(), ErrorApi, errorHandler(), esDelLector(), Backend, Carpetas (+2 more)

### Community 146 - "Arquitectura de AIPOS"
Cohesion: 0.18
Nodes (11): Arquitectura de AIPOS, Base de datos, Calidad, Cómo se decide un diseño, Dinero, Git y entrega, Monorepo, Pruebas (+3 more)

### Community 147 - "AnimacionLottie.vue"
Cohesion: 0.31
Nodes (8): animacion(), beforeDestroy(), crear(), destruir(), mounted(), pideMenosMovimiento(), Al crear el producto, Animación

### Community 148 - "validarProductoNuevo"
Cohesion: 0.27
Nodes (8): buscarProductos(), crearProducto(), servicio, { validarBusqueda, validarProductoNuevo }, { buscarProductos, crearProducto }, { Router }, comoObjeto(), validarProductoNuevo()

### Community 149 - "productos-migracion.test.js"
Cohesion: 0.29
Nodes (9): archivo, carpetaMigraciones, columnas(), indices(), leer(), require, restriccionesCheck(), sequelize (+1 more)

### Community 150 - "VentaActual.test.js"
Cohesion: 0.15
Nodes (5): leche, { loadAnimation, instancias }, pan, venta(), ventaConDetalles()

### Community 151 - "database.test.js"
Cohesion: 0.15
Nodes (9): app, { config }, servidor, { config }, dbConfig, modelos, require, { Sequelize } (+1 more)

### Community 152 - "sp-registrar-venta-reglas.test.js"
Cohesion: 0.24
Nodes (12): ER_INVALID_JSON_TEXT, errorDe(), cienUnDetalles(), comprobarRechazo(), conCantidad(), conPrecio(), contexto, crudo() (+4 more)

### Community 153 - "Flujo 06 · Trabajar una tarjeta con el agente"
Cohesion: 0.67
Nodes (3): Flujo 06 · Trabajar una tarjeta con el agente, Otros caminos, Pasos

### Community 154 - "eliminar.test.js"
Cohesion: 0.22
Nodes (5): errorDeCantidad(), congelar(), huevos, leche, pan

### Community 155 - "archivos.test.js"
Cohesion: 0.17
Nodes (8): archivosJs(), backend, raiz, require, src, app, { cargarDocumentacionApi }, require

### Community 156 - "aislamiento.test.js"
Cohesion: 0.12
Nodes (12): archivosDe(), componentes, enSrc(), fueraDeApi, raiz, todos, archivosDe(), delModulo (+4 more)

### Community 157 - "CampoCantidad.test.js"
Cohesion: 0.27
Nodes (4): campo(), escribir(), escrito(), salirDelCampo()

### Community 158 - "formatearCentavos"
Cohesion: 0.19
Nodes (17): subtotalDe(), total(), aCentavos(), formatearCentavos(), calcularSubtotal(), calcularTotal(), congelar(), detalle() (+9 more)

### Community 159 - "valida-y-registro.test.js"
Cohesion: 0.33
Nodes (4): congelar(), leche, pan, regalo

### Community 160 - "Registrar venta"
Cohesion: 0.20
Nodes (9): API, con `curl` (V-03), Bugs y issues, Cómo se decidió el diseño, Pantalla, en el navegador con el MCP `chrome-devtools` (V-08), Preguntas para la persona desarrolladora, Pruebas en local, Registrar venta, Reglas de negocio (+1 more)

### Community 161 - "agregar.test.js"
Cohesion: 0.38
Nodes (6): congelar(), detalle(), leche, pan, venta(), ventaConDetalles()

### Community 163 - "consultarSalud"
Cohesion: 0.36
Nodes (7): { consultarSalud }, obtenerSalud(), conLimiteDeTiempo(), consultarSalud(), cortarConexion(), sequelize, Salud

### Community 164 - "documentacion-crear-producto.test.js"
Cohesion: 0.29
Nodes (5): { cargarDocumentacionApi }, documento, { montajes }, require, { validarProductoNuevo }

### Community 165 - "Lenguaje ubicuo — AIPOS"
Cohesion: 0.40
Nodes (5): Convención de nombres en código, Herramientas y proceso, Historial de cambios, Lenguaje ubicuo — AIPOS, Pendientes (por confirmar)

### Community 166 - "El documento OpenAPI"
Cohesion: 0.29
Nodes (7): Cabecera, Ejemplos que dicen lo que la API hace, Ejemplos sin detalles internos, El documento es OpenAPI 3 válido, El documento OpenAPI, `GET /api/salud`, Rutas

### Community 167 - "API: POST /api/ventas (V-03)"
Cohesion: 0.33
Nodes (6): API: POST /api/ventas (V-03), Criterios de aceptación de V-03, Documentación de la API, El servicio y el procedimiento, Respuestas, Riesgo conocido: reintento cuando la respuesta se pierde

### Community 170 - "Procedimiento sp_registrar_venta (V-02)"
Cohesion: 0.33
Nodes (6): Archivos, Criterios de aceptación de V-02, Parámetro y respuesta, Procedimiento sp_registrar_venta (V-02), Qué hace, en orden, Todo o nada

### Community 173 - "ErrorApi.js"
Cohesion: 0.50
Nodes (3): desdeBaseDeDatos(), ErrorApi, ESTADOS

### Community 174 - "Criterios de aceptación"
Cohesion: 0.40
Nodes (5): Criterios de aceptación, V-04 · Agregar productos y ver el total (RF-03, RF-04, RF-08), V-05 · Editar el precio aplicado (RF-05), V-06 · Cambiar la cantidad (RF-06), V-07 · Eliminar un producto (RF-07)

### Community 175 - "Pruebas en local"
Cohesion: 0.40
Nodes (5): Bugs, P-01: la base, P-02: la API con `curl`, P-03: la pantalla, en el navegador con el MCP `chrome-devtools`, Pruebas en local

### Community 176 - "P-03 · El botón "Nuevo producto" y el formulario"
Cohesion: 0.40
Nodes (5): Criterios de aceptación de P-03, Diseño con `impeccable`, El formulario, Los componentes, P-03 · El botón "Nuevo producto" y el formulario

### Community 177 - "Pantalla: botón "Registrar venta" (V-08)"
Cohesion: 0.50
Nodes (4): Contrato del componente, Criterios de aceptación de V-08, Pantalla: botón "Registrar venta" (V-08), Qué hace

### Community 178 - "Diseño de la pantalla"
Cohesion: 0.67
Nodes (3): Diseño de la pantalla, Paleta, Íconos y animaciones

## Knowledge Gaps
- **756 isolated node(s):** `singleQuote`, `printWidth`, `trailingComma`, `{ cargarConfigDeEntorno, cargarArchivoEnv }`, `fs` (+751 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 979 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **51 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Lenguaje ubicuo — AIPOS` connect `Lenguaje ubicuo — AIPOS` to `ventaActual.js`, `graphify-setup.md`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `mensaje()` connect `mensaje` to `Lenguaje ubicuo — AIPOS`, `ayudas-crear-producto.js`, `FormularioProducto.test.js`, `P-02 · `POST /api/productos``, `pantalla-venta-actual.test.js`, `P-03 · El botón "Nuevo producto" y el formulario`, `Pantalla: botón "Registrar venta" (V-08)`, `cantidad.test.js`, `CampoCantidad.test.js`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `Herramientas y proceso` connect `Lenguaje ubicuo — AIPOS` to `mensaje`, `CampoCantidad.test.js`, `Despliegue de AIPOS`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **What connects `singleQuote`, `printWidth`, `trailingComma` to the rest of the system?**
  _756 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Trabajar en un tile` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `Requerimientos funcionales` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
