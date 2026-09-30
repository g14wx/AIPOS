# Graph Report - v-06  (2026-09-30)

## Corpus Check
- 240 files · ~194,789 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 31 file(s) not represented in the graph (top: (none) 17, .drawio 8, .example 2)

## Summary
- 1691 nodes · 2711 edges · 163 communities (112 shown, 51 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 152 edges (avg confidence: 0.92)
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
- migraciones-ventas.test.js
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
- P-02 · `POST /api/productos`
- BuscadorProductos.vue
- marca-de-commit.test.sh
- version-con-crlf.test.sh
- desactualizado-tras-falla.test.sh
- merge-sin-choques.test.sh
- merge-sin-cambios-en-el-grafo.test.sh
- CampoCantidad.test.js
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
- dependencias.test.js
- frontend/package.json
- src/config.js
- backend/package.json
- docs.js
- ref_vitest
- ref_node_module
- scripts
- Criterios de aceptación
- devDependencies
- migraciones.test.js
- BuscadorProductos.test.js
- archivos.test.js
- BuscadorProductos-enter.test.js
- NuevoProducto.test.js
- Product
- dependencies
- documentacion-buscar-productos.test.js
- Design System: AIPOS
- devDependencies
- Documentación de la API
- estructura.test.js
- scripts
- vuetify.js
- vitest-vue2.test.js
- productos-migracion.test.js
- servidor.test.js
- FormularioProducto.test.js
- test
- animaciones.test.js
- eslint.config.js
- validar-busqueda.test.js
- dependencies
- value
- productos/buscar-productos.test.js
- cantidad.test.js
- Flujo 05 · Entregar un entregable
- glosario-y-alcance.test.sh
- backend/.prettierrc.json
- frontend/.prettierrc.json
- App.vue
- Flujo 01 · Crear producto
- Flujo 02 · Buscar producto
- Flujo 03 · Armar la venta actual
- Flujo 04 · Registrar venta
- Flujo 00 · Mapa de procesos
- Flujo 06 · Trabajar una tarjeta con el agente
- validador-producto.test.js
- ventaActual.js
- noEncontrado
- base-de-prueba.test.js
- services/productos.js
- pantalla-venta-actual.test.js
- controllers/productos.js
- ErrorApi.js
- Crear producto
- modelos.test.js
- ref_node_path
- VentaActual.test.js
- database.test.js
- VentaActual.vue
- formatearCentavos
- crear-producto-simultaneo.test.js
- aislamiento.test.js
- Registrar venta
- ejemplos-reales.test.js
- Backend
- agregar.test.js
- MySQL stored procedure authoring
- mensaje
- scarfSettings

## God Nodes (most connected - your core abstractions)
1. `Despliegue de AIPOS` - 22 edges
2. `formatearCentavos()` - 18 edges
3. `texto()` - 17 edges
4. `scripts` - 15 edges
5. `supertest` - 15 edges
6. `cargarDocumentacionApi()` - 14 edges
7. `agregarAVentaActual()` - 14 edges
8. `mensaje()` - 14 edges
9. `Requerimientos funcionales` - 14 edges
10. `Requerimientos no funcionales` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Capas` --references--> `ErrorApi`  [INFERRED]
  specs/arquitectura.spec.md → backend/src/errors/ErrorApi.js
- `Reglas de negocio` --references--> `validarTexto()`  [INFERRED]
  specs/crear-producto.spec.md → backend/src/validators/comunes.js
- `Validación` --references--> `validarTexto()`  [INFERRED]
  specs/crear-producto.spec.md → backend/src/validators/comunes.js
- `Validez, registro y vaciado (V-04)` --references--> `vaciarVentaActual()`  [INFERRED]
  specs/armar-venta-actual.spec.md → frontend/src/ventaActual/ventaActual.js
- ``agregarAVentaActual` (V-04)` --references--> `agregarAVentaActual()`  [INFERRED]
  specs/armar-venta-actual.spec.md → frontend/src/ventaActual/ventaActual.js

## Import Cycles
- None detected.

## Communities (163 total, 51 thin omitted)

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
Cohesion: 0.17
Nodes (22): anotarCodigoDeBarras(), api(), app, borrarProductosDePrueba(), codigoConCerosNuevo(), codigoDeBarrasNuevo(), codigosUsados, contarProductos() (+14 more)

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
Cohesion: 0.20
Nodes (9): Armar la venta actual, Casos de error y bordes, Cómo se decidió el diseño, La API, con `curl`, La pantalla, en el navegador con el MCP `chrome-devtools`, La venta actual: los datos, Lo que esta spec no cubre, Pruebas en local (+1 more)

### Community 12 - "Glosario de lenguaje ubicuo"
Cohesion: 0.22
Nodes (7): Plantilla: docs/lenguaje-ubicuo.md, Crear el glosario, Cuando aparece una palabra nueva o dudosa, Cuando un término cambia, Cómo escribir cada entrada, Glosario de lenguaje ubicuo, Revisar si el código habla igual que el negocio

### Community 13 - "Bitácora de IA"
Cohesion: 0.25
Nodes (6): Plantilla: docs/bitacora-ia.md, Bitácora de IA, Cuándo escribir, Cómo escribir una entrada, Reconstruir desde git, Reglas

### Community 14 - "README de entrega"
Cohesion: 0.29
Nodes (5): Plantilla: README.md de entrega, De dónde sale cada punto, Flujo, README de entrega, Reglas

### Community 15 - "migraciones-ventas.test.js"
Cohesion: 0.19
Nodes (14): archivoDetalles, archivoProductos, archivoVentas, carpetaMigraciones, columnas(), estructura(), indices(), leer() (+6 more)

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

### Community 31 - "validarTexto"
Cohesion: 0.24
Nodes (13): bueno(), conProblema(), ErrorApi, exigirDatosValidos(), validarDinero(), validarTexto(), comoObjeto(), validarProductoNuevo() (+5 more)

### Community 35 - "comparar-rutas.test.js"
Cohesion: 0.11
Nodes (23): { cargarDocumentacionApi }, { crearApp }, docs, documentadas, documento, { montajes }, require, { Router } (+15 more)

### Community 44 - "P-02 · `POST /api/productos`"
Cohesion: 0.22
Nodes (8): ErrorApi, Validación del texto, Contrato, Criterios de aceptación de P-02, Documentación de la API (tarjeta A-01), P-02 · `POST /api/productos`, Servicio, 409 y peticiones al mismo tiempo, Validación

### Community 45 - "BuscadorProductos.vue"
Cohesion: 0.17
Nodes (11): buscarProductos(), beforeDestroy(), buscar(), buscarAlPresionarEnter(), cancelarEspera(), elegir(), largoEnCaracteres(), mostrar() (+3 more)

### Community 52 - "CampoCantidad.test.js"
Cohesion: 0.27
Nodes (4): campo(), escribir(), escrito(), salirDelCampo()

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
Cohesion: 0.10
Nodes (17): cargarDocumentacionApi(), fs, { parse }, path, RUTA_DEL_DOCUMENTO, { cargarDocumentacionApi }, documento, PROHIBIDO (+9 more)

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
Cohesion: 0.09
Nodes (17): { config }, { Sequelize }, { DataTypes }, DetalleVenta, sequelize, { DataTypes }, Producto, sequelize (+9 more)

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

### Community 86 - "dependencias.test.js"
Cohesion: 0.29
Nodes (5): backend, EN_DEPENDENCIES, EN_DEV_DEPENDENCIES, lock, paquete

### Community 87 - "frontend/package.json"
Cohesion: 0.11
Nodes (18): description, engines, node, eslint, eslint-config-prettier, @eslint/js, globals, prettier (+10 more)

### Community 88 - "src/config.js"
Cohesion: 0.15
Nodes (20): { cargarConfigDeEntorno, cargarArchivoEnv }, development(), paraElCli(), crearBaseDePrueba(), cargarArchivoEnv(), cargarClaveRoot(), cargarConfig(), cargarConfigDeEntorno() (+12 more)

### Community 89 - "backend/package.json"
Cohesion: 0.12
Nodes (16): description, engines, node, eslint, eslint-config-prettier, @eslint/js, globals, prettier (+8 more)

### Community 90 - "docs.js"
Cohesion: 0.11
Nodes (18): { cargarDocumentacionApi }, DE_DEMOSTRACION, documento, helmet, { Router }, swaggerUi, { obtenerSalud }, { Router } (+10 more)

### Community 91 - "ref_vitest"
Cohesion: 0.09
Nodes (26): app, cors, crearApp(), { crearRouterApi, montajes: montajesDeLaApi }, errorHandler, express, helmet, noEncontrado (+18 more)

### Community 92 - "ref_node_module"
Cohesion: 0.07
Nodes (44): conTransaccionDescartada(), errorDeMySQL(), insertarProducto(), require, sequelize, ER_BAD_NULL_ERROR, ER_CHECK_CONSTRAINT_VIOLATED, ER_DUP_ENTRY (+36 more)

### Community 93 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, deshacer, deshacer:prueba, dev, format, format:check, lint, migrar (+7 more)

### Community 94 - "Criterios de aceptación"
Cohesion: 0.40
Nodes (5): Criterios de aceptación, V-04 · Agregar productos y ver el total (RF-03, RF-04, RF-08), V-05 · Editar el precio aplicado (RF-05), V-06 · Cambiar la cantidad (RF-06), V-07 · Eliminar un producto (RF-07)

### Community 95 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-vue, globals, jsdom, prettier (+6 more)

### Community 96 - "migraciones.test.js"
Cohesion: 0.16
Nodes (11): correrCli(), tablasDeLaBase(), archivos, cargarConfiguracion(), carpetaMigraciones, require, sequelize, tablasSinElRegistro() (+3 more)

### Community 97 - "BuscadorProductos.test.js"
Cohesion: 0.16
Nodes (12): asentar(), avanzar(), conResultados(), entrada(), escribir(), escribirYBuscar(), jugo, leche (+4 more)

### Community 98 - "archivos.test.js"
Cohesion: 0.17
Nodes (8): archivosJs(), backend, raiz, require, src, app, { cargarDocumentacionApi }, require

### Community 99 - "BuscadorProductos-enter.test.js"
Cohesion: 0.15
Nodes (12): asentar(), avanzar(), cable, entrada(), escribir(), jugo, leche, { loadAnimation } (+4 more)

### Community 100 - "NuevoProducto.test.js"
Cohesion: 0.06
Nodes (31): animacion(), beforeDestroy(), crear(), destruir(), mounted(), pideMenosMovimiento(), abrirLlenarYGuardar(), boton() (+23 more)

### Community 101 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 102 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, cors, dotenv, express, helmet, mysql2, sequelize, sequelize-cli (+3 more)

### Community 103 - "documentacion-buscar-productos.test.js"
Cohesion: 0.10
Nodes (18): docs, montajes, productos, { Router }, salud, app, { cargarDocumentacionApi }, documento (+10 more)

### Community 104 - "Design System: AIPOS"
Cohesion: 0.20
Nodes (9): Colors, Components, Design System: AIPOS, Do's and Don'ts, Elevation & Depth, Layout, Overview, Shapes (+1 more)

### Community 105 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, @apidevtools/swagger-parser, eslint, eslint-config-prettier, @eslint/js, globals, prettier, supertest (+1 more)

### Community 107 - "Documentación de la API"
Cohesion: 0.09
Nodes (24): { consultarSalud }, obtenerSalud(), conLimiteDeTiempo(), consultarSalud(), cortarConexion(), sequelize, Salud, Cabecera (+16 more)

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

### Community 113 - "productos-migracion.test.js"
Cohesion: 0.29
Nodes (9): archivo, carpetaMigraciones, columnas(), indices(), leer(), require, restriccionesCheck(), sequelize (+1 more)

### Community 115 - "servidor.test.js"
Cohesion: 0.33
Nodes (3): abrirUnPuerto(), backend, buscarPuertoLibre()

### Community 116 - "FormularioProducto.test.js"
Cohesion: 0.12
Nodes (23): crearError(), http, traducirError(), cargar(), leche, cargar(), producto, cargarHttp() (+15 more)

### Community 117 - "test"
Cohesion: 0.40
Nodes (4): test(), Carpetas, Git y entrega, Entrega trazable

### Community 118 - "animaciones.test.js"
Cohesion: 0.25
Nodes (7): aHex(), animadas(), buscar(), carpeta, coloresDe(), paleta, permitidas

### Community 120 - "validar-busqueda.test.js"
Cohesion: 0.20
Nodes (9): validarBusqueda(), ErrorApi, errorDe(), require, { validarBusqueda }, API: `GET /api/productos?busqueda=<texto>`, Cómo busca el servicio, Documentación de la API (+1 more)

### Community 121 - "dependencies"
Cohesion: 0.33
Nodes (6): dependencies, axios, lottie-web, @mdi/font, vue, vuetify

### Community 122 - "value"
Cohesion: 0.10
Nodes (22): estaEscribiendo(), value(), resaltarId(), ventaActual(), `App.vue`: une la búsqueda con la venta actual (V-04), Botón «Eliminar» (V-07), `CampoCantidad.vue` (V-06), `CampoPrecioAplicado.vue` (V-05) (+14 more)

### Community 123 - "productos/buscar-productos.test.js"
Cohesion: 0.13
Nodes (12): app, CABLE, EJEMPLOS, idsCreados, JUGO_50, JUGO_500, LECHE, { Producto } (+4 more)

### Community 124 - "cantidad.test.js"
Cohesion: 0.15
Nodes (8): alSalir(), CANTIDAD_MAXIMA, CANTIDAD_MINIMA, cantidadInvalida(), validarCantidad(), congelar(), leche, pan

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

### Community 129 - "App.vue"
Cohesion: 0.12
Nodes (20): alElegirProducto(), avisar(), AVISOS, data(), reemplazarVentaActual(), resaltar(), detalleGuardado(), esObjeto() (+12 more)

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

### Community 135 - "Flujo 06 · Trabajar una tarjeta con el agente"
Cohesion: 0.67
Nodes (3): Flujo 06 · Trabajar una tarjeta con el agente, Otros caminos, Pasos

### Community 136 - "validador-producto.test.js"
Cohesion: 0.29
Nodes (7): detallesDe(), ErrorApi, errorDe(), OBLIGATORIOS, require, { validarProductoNuevo }, valido

### Community 138 - "ventaActual.js"
Cohesion: 0.33
Nodes (10): Negocio, agregarAVentaActual(), cambiarCantidad(), detalleNuevo(), detallesParaRegistrar(), esDinero(), LARGO_MAXIMO_NOMBRE, sinErrorDeCantidad() (+2 more)

### Community 139 - "noEncontrado"
Cohesion: 0.40
Nodes (5): ErrorApi, noEncontrado(), crearRouterApi(), La política de contenido solo en `/api/docs`, Swagger UI en `GET /api/docs`

### Community 140 - "base-de-prueba.test.js"
Cohesion: 0.13
Nodes (15): carpetaBackend, carpetaRaiz, correrNpm(), correrNpmSinFallar(), crearProxyCongelable(), { cargarClaveRoot, cargarConfig, cargarConfigDeEntorno }, consultar(), mysql (+7 more)

### Community 142 - "services/productos.js"
Cohesion: 0.13
Nodes (18): DetalleVenta, Producto, sequelize, Venta, buscarProductos(), crearProducto(), ErrorApi, errorDeCodigoDeBarrasRepetido() (+10 more)

### Community 143 - "pantalla-venta-actual.test.js"
Cohesion: 0.15
Nodes (7): botonRegistrar(), filas(), leche, { loadAnimation }, pan, total(), zonaVenta()

### Community 144 - "controllers/productos.js"
Cohesion: 0.32
Nodes (6): buscarProductos(), crearProducto(), servicio, { validarBusqueda, validarProductoNuevo }, { buscarProductos, crearProducto }, { Router }

### Community 145 - "ErrorApi.js"
Cohesion: 0.31
Nodes (8): desdeBaseDeDatos(), ErrorApi, ESTADOS, aErrorApi(), desdeBaseDeDatos, desdeElCuerpo(), ErrorApi, esDelLector()

### Community 147 - "Crear producto"
Cohesion: 0.14
Nodes (13): Bugs, Crear producto, Criterios de aceptación de P-01, Migración, Modelo, P-01: la base, P-01 · La tabla `productos` y el modelo `Producto`, P-02: la API con `curl` (+5 more)

### Community 150 - "modelos.test.js"
Cohesion: 0.29
Nodes (5): carpetaModelos, modelos, registrados, require, tablasDelGlosario

### Community 151 - "ref_node_path"
Cohesion: 0.13
Nodes (7): archivo, archivosJs(), ejemplo, raiz, carpetaBackend, contraste(), luminancia()

### Community 153 - "VentaActual.test.js"
Cohesion: 0.15
Nodes (5): leche, { loadAnimation, instancias }, pan, venta(), ventaConDetalles()

### Community 154 - "database.test.js"
Cohesion: 0.15
Nodes (9): app, { config }, servidor, { config }, dbConfig, modelos, require, { Sequelize } (+1 more)

### Community 155 - "VentaActual.vue"
Cohesion: 0.12
Nodes (7): alCambiarCantidad(), puedeRegistrar(), ventaActualEsValida(), congelar(), leche, pan, regalo

### Community 156 - "formatearCentavos"
Cohesion: 0.20
Nodes (16): subtotalDe(), total(), aCentavos(), formatearCentavos(), calcularSubtotal(), calcularTotal(), congelar(), detalle() (+8 more)

### Community 157 - "crear-producto-simultaneo.test.js"
Cohesion: 0.40
Nodes (3): { crearProducto }, ErrorApi, require

### Community 158 - "aislamiento.test.js"
Cohesion: 0.12
Nodes (12): archivosDe(), componentes, enSrc(), fueraDeApi, raiz, todos, archivosDe(), delModulo (+4 more)

### Community 159 - "Registrar venta"
Cohesion: 0.09
Nodes (21): API, con `curl` (V-03), API: POST /api/ventas (V-03), Archivos, Bugs y issues, Criterios de aceptación de V-02, Criterios de aceptación de V-03, Cómo se decidió el diseño, Documentación de la API (+13 more)

### Community 161 - "ejemplos-reales.test.js"
Cohesion: 0.25
Nodes (6): app, { cargarDocumentacionApi }, documento, problemas(), require, { Router }

### Community 163 - "Backend"
Cohesion: 0.33
Nodes (7): errorHandler(), Backend, Capas, Carpetas, Errores, Límites, CORS y cabeceras, Procedimientos almacenados

### Community 165 - "agregar.test.js"
Cohesion: 0.38
Nodes (6): congelar(), detalle(), leche, pan, venta(), ventaConDetalles()

### Community 166 - "MySQL stored procedure authoring"
Cohesion: 0.29
Nodes (6): 1. Files, 2. Migration, 3. Template: a sale with its items, 4. Rules inside the body, 5. Final check, MySQL stored procedure authoring

### Community 171 - "mensaje"
Cohesion: 0.11
Nodes (19): Convención de nombres en código, Herramientas y proceso, Historial de cambios, Lenguaje ubicuo — AIPOS, Pendientes (por confirmar), mensaje(), `agregarAVentaActual` (V-04), `cambiarCantidad` y `validarCantidad` (V-06) (+11 more)

## Knowledge Gaps
- **722 isolated node(s):** `singleQuote`, `printWidth`, `trailingComma`, `{ cargarConfigDeEntorno, cargarArchivoEnv }`, `name` (+717 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 927 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **51 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Lenguaje ubicuo — AIPOS` connect `mensaje` to `ventaActual.js`, `graphify-setup.md`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `Herramientas y proceso` connect `mensaje` to `CampoCantidad.test.js`, `Despliegue de AIPOS`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `mensaje()` connect `mensaje` to `Backend`, `ayudas-crear-producto.js`, `P-02 · `POST /api/productos``, `pantalla-venta-actual.test.js`, `Buscar producto`, `FormularioProducto.test.js`, `CampoCantidad.test.js`, `value`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **What connects `singleQuote`, `printWidth`, `trailingComma` to the rest of the system?**
  _722 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Trabajar en un tile` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `Requerimientos funcionales` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
