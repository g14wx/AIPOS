# Graph Report - v-02  (2026-09-30)

## Corpus Check
- 222 files · ~165,463 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 31 file(s) not represented in the graph (top: (none) 17, .drawio 8, .example 2)

## Summary
- 1501 nodes · 2274 edges · 162 communities (109 shown, 53 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 99 edges (avg confidence: 0.92)
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
- ref_vitest
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
- crearProducto
- consultarSalud
- marca-de-commit.test.sh
- version-con-crlf.test.sh
- desactualizado-tras-falla.test.sh
- merge-sin-choques.test.sh
- merge-sin-cambios-en-el-grafo.test.sh
- database.test.js
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
- validarTexto
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
- documentacion-buscar-productos.test.js
- frontend/package.json
- sin-axios-en-componentes.test.js
- backend/package.json
- csp-docs.test.js
- app.js
- Backend
- scripts
- ayudas.js
- devDependencies
- ref_node_path
- AnimacionLottie.test.js
- ref_node_fs
- Arquitectura de AIPOS
- NuevoProducto.test.js
- Product
- dependencies
- productos-migracion.test.js
- Design System: AIPOS
- devDependencies
- Armar la venta actual
- rutas-documentadas.test.js
- estructura.test.js
- graphify-setup.md
- scripts
- migraciones-ventas.test.js
- docs.js
- http.js
- env-example.test.js
- FormularioProducto.test.js
- animaciones.test.js
- src/config.js
- eslint.config.js
- config.test.js
- dependencies
- Vuetify 2 components (Vue 2.7)
- buscar-productos.test.js
- base-de-prueba.test.js
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
- Flujo 06 · Trabajar una tarjeta con el agente
- vitest-vue2.test.js
- vue2-vuetify2.md
- errorHandler.js
- P-01 · La tabla `productos` y el modelo `Producto`
- pantalla-unica.test.js
- models/index.js
- sp-registrar-venta-migracion.test.js
- Frontend
- comparar-rutas.test.js
- Flujo 04 · Registrar venta
- ejemplos-de-error.test.js
- 20260930172100-crear-sp-registrar-venta.js
- modelos.test.js
- cors.test.js
- limite-del-cuerpo.test.js
- Lenguaje ubicuo — AIPOS
- AnimacionLottie.vue
- db/config.js
- noEncontrado
- Pantalla: botón "Registrar venta" (V-08)
- Producto.js
- engines

## God Nodes (most connected - your core abstractions)
1. `Despliegue de AIPOS` - 22 edges
2. `scripts` - 15 edges
3. `crearProducto()` - 15 edges
4. `supertest` - 14 edges
5. `Requerimientos funcionales` - 14 edges
6. `Requerimientos no funcionales` - 14 edges
7. `texto()` - 13 edges
8. `cargarDocumentacionApi()` - 13 edges
9. `Armar la venta actual` - 13 edges
10. `Arquitectura de AIPOS` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Carpetas` --references--> `test()`  [INFERRED]
  specs/arquitectura.spec.md → backend/db/config.js
- `Git y entrega` --references--> `test()`  [INFERRED]
  specs/arquitectura.spec.md → backend/db/config.js
- `Herramientas y proceso` --references--> `production()`  [INFERRED]
  docs/lenguaje-ubicuo.md → backend/db/config.js
- `Archivos` --references--> `cargarDocumentacionApi()`  [INFERRED]
  specs/documentacion-de-la-api.spec.md → backend/src/documentacion.js
- ``GET /api/salud`` --references--> `consultarSalud()`  [INFERRED]
  specs/documentacion-de-la-api.spec.md → backend/src/services/salud.js

## Import Cycles
- None detected.

## Communities (162 total, 53 thin omitted)

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
Cohesion: 0.05
Nodes (42): total(), Reglas de negocio, Requerimientos funcionales, RF-01 Crear producto, RF-02 Buscar producto, RF-03 Agregar a la venta actual, RF-04 Ver los detalles de la venta actual, RF-05 Editar el precio aplicado (+34 more)

### Community 5 - "FormularioProducto.vue"
Cohesion: 0.10
Nodes (29): alAbrir(), alSalir(), cancelar(), cerrar(), data(), enfocar(), enlazarTitulo(), guardar() (+21 more)

### Community 6 - "ref_vitest"
Cohesion: 0.11
Nodes (12): require, sequelize, archivosJs(), backend, raiz, require, src, app (+4 more)

### Community 7 - "Flujo de un entregable"
Cohesion: 0.18
Nodes (10): 0. Revisar el repositorio (una vez por proyecto), 1. Empezar el entregable, 2. Trabajar, 3. Abrir el PR, 4. Revisar antes de integrar, 5. Integrar, 6. Etiquetar, 7. Entrega final (+2 more)

### Community 8 - "Configurar el MCP de Trello"
Cohesion: 0.20
Nodes (10): 1. Crear el board en Trello, 2. Obtener el API key, 3. Generar el token, 4. Agregar el servidor a Claude Code, 5. Verificar la conexión, Alternativa: Codex CLI, Configurar el MCP de Trello, Requisitos (+2 more)

### Community 10 - "Tarjetas"
Cohesion: 0.17
Nodes (12): Definición de terminado, Despliegue, Entrega final, Entregable productos, Entregable ventas, Entregables y tarjetas, Ramas de tarjeta, Requerimientos (+4 more)

### Community 11 - "Documentación de la API"
Cohesion: 0.12
Nodes (17): Archivos, Cabecera, Criterios de aceptación, Cómo se decidió el diseño, Dependencias, Documentación de la API, Ejemplos que dicen lo que la API hace, Ejemplos sin detalles internos (+9 more)

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
Cohesion: 0.08
Nodes (41): ARCHIVO_SQL, borrarDatosDePrueba(), borrarVentas(), buscarClienteMysql(), { config }, consultar(), correrSql(), crearLlamador() (+33 more)

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
Cohesion: 0.11
Nodes (17): API: `GET /api/productos?busqueda=<texto>`, Buscar producto, Criterios de aceptación de la API (P-04), Criterios de aceptación de la pantalla (P-05), Cómo busca el servicio, Cómo se decidió el diseño, Cómo se ve y se comporta, Diseño (skill `impeccable`) (+9 more)

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

### Community 44 - "crearProducto"
Cohesion: 0.12
Nodes (18): crearProducto(), Quién implementa qué, Contrato, Crear producto, Criterios de aceptación de P-02, Criterios de aceptación de P-03, Diseño con `impeccable`, Documentación de la API (tarjeta A-01) (+10 more)

### Community 45 - "consultarSalud"
Cohesion: 0.36
Nodes (7): { consultarSalud }, obtenerSalud(), conLimiteDeTiempo(), consultarSalud(), cortarConexion(), sequelize, Salud

### Community 52 - "database.test.js"
Cohesion: 0.15
Nodes (9): app, { config }, servidor, { config }, dbConfig, modelos, require, { Sequelize } (+1 more)

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
Nodes (17): cargarDocumentacionApi(), fs, { parse }, path, RUTA_DEL_DOCUMENTO, app, { cargarDocumentacionApi }, documento (+9 more)

### Community 61 - "arranque-local.test.sh"
Cohesion: 0.46
Nodes (6): compose(), desplegar(), limpiar(), mysql_app(), restos_del_proyecto(), arranque-local.test.sh script

### Community 62 - "instalar-caddy.test.sh"
Cohesion: 0.32
Nodes (5): armar(), CADDY_FALLA, CAMBIA_VECINO, correr_script(), instalar-caddy.test.sh script

### Community 63 - "imagenes.test.sh"
Cohesion: 0.38
Nodes (3): leer(), imagenes.test.sh script, uso()

### Community 64 - "validarTexto"
Cohesion: 0.22
Nodes (11): conProblema(), contarCaracteres(), ErrorApi, exigirDatosValidos(), validarTexto(), validarBusqueda(), { validarTexto, exigirDatosValidos }, ErrorApi (+3 more)

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

### Community 86 - "documentacion-buscar-productos.test.js"
Cohesion: 0.20
Nodes (9): app, { cargarDocumentacionApi }, documento, idsCreados, { montajes }, { Producto }, require, abrirServidorDePrueba() (+1 more)

### Community 87 - "frontend/package.json"
Cohesion: 0.12
Nodes (16): description, eslint, eslint-config-prettier, @eslint/js, globals, prettier, vitest, name (+8 more)

### Community 88 - "sin-axios-en-componentes.test.js"
Cohesion: 0.29
Nodes (6): archivosDe(), componentes, enSrc(), fueraDeApi, raiz, todos

### Community 89 - "backend/package.json"
Cohesion: 0.11
Nodes (18): description, engines, node, eslint, eslint-config-prettier, @eslint/js, globals, prettier (+10 more)

### Community 90 - "csp-docs.test.js"
Cohesion: 0.27
Nodes (8): app, docs, express, helmet, politicaDe(), politicaDeHelmet(), require, helmet

### Community 91 - "app.js"
Cohesion: 0.15
Nodes (15): app, cors, crearApp(), { crearRouterApi, montajes: montajesDeLaApi }, errorHandler, express, helmet, noEncontrado (+7 more)

### Community 92 - "Backend"
Cohesion: 0.24
Nodes (9): ErrorApi, errorHandler(), Backend, Capas, Carpetas, Errores, Límites, CORS y cabeceras, Procedimientos almacenados (+1 more)

### Community 93 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, deshacer, deshacer:prueba, dev, format, format:check, lint, migrar (+7 more)

### Community 94 - "ayudas.js"
Cohesion: 0.12
Nodes (12): carpetaBackend, carpetaRaiz, correrNpm(), correrNpmSinFallar(), crearProxyCongelable(), archivo, app, require (+4 more)

### Community 95 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-vue, globals, jsdom, prettier (+6 more)

### Community 96 - "ref_node_path"
Cohesion: 0.14
Nodes (11): tablasDeLaBase(), archivos, cargarConfiguracion(), carpetaMigraciones, require, sequelize, tablasSinElRegistro(), tablasSinElRegistro() (+3 more)

### Community 97 - "AnimacionLottie.test.js"
Cohesion: 0.24
Nodes (6): es, animacion, { loadAnimation, instancias }, @mdi/font, vue, vuetify

### Community 98 - "ref_node_fs"
Cohesion: 0.17
Nodes (7): backend, EN_DEPENDENCIES, EN_DEV_DEPENDENCIES, lock, paquete, contraste(), luminancia()

### Community 99 - "Arquitectura de AIPOS"
Cohesion: 0.14
Nodes (14): Arquitectura de AIPOS, Base de datos, Calidad, Cómo se decide un diseño, Dinero, Diseño de la pantalla, Git y entrega, Monorepo (+6 more)

### Community 100 - "NuevoProducto.test.js"
Cohesion: 0.22
Nodes (10): abrirLlenarYGuardar(), boton(), botonNuevo(), dialogo(), entrada(), escribir(), esperar(), { loadAnimation, instancias } (+2 more)

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

### Community 106 - "Armar la venta actual"
Cohesion: 0.06
Nodes (40): data(), aCentavos(), formatearCentavos(), calcularSubtotal(), calcularTotal(), vaciarVentaActual(), congelar(), leche (+32 more)

### Community 107 - "rutas-documentadas.test.js"
Cohesion: 0.15
Nodes (16): montajes, compararRutas(), describirCapa(), app, { cargarDocumentacionApi }, carpetaDeRutas, docs, { montajes } (+8 more)

### Community 108 - "estructura.test.js"
Cohesion: 0.22
Nodes (6): archivosJs(), backend, paquete, raiz, require_, src

### Community 110 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, preview, test (+1 more)

### Community 111 - "migraciones-ventas.test.js"
Cohesion: 0.19
Nodes (14): archivoDetalles, archivoProductos, archivoVentas, carpetaMigraciones, columnas(), estructura(), indices(), leer() (+6 more)

### Community 112 - "docs.js"
Cohesion: 0.13
Nodes (14): { cargarDocumentacionApi }, DE_DEMOSTRACION, documento, helmet, { Router }, swaggerUi, docs, productos (+6 more)

### Community 113 - "http.js"
Cohesion: 0.26
Nodes (7): crearError(), http, traducirError(), cargar(), producto, cargarHttp(), axios

### Community 115 - "env-example.test.js"
Cohesion: 0.40
Nodes (3): archivosJs(), ejemplo, raiz

### Community 116 - "FormularioProducto.test.js"
Cohesion: 0.27
Nodes (14): boton(), dialogo(), entrada(), escribir(), esperar(), etiquetaDe(), franja(), guardarConError() (+6 more)

### Community 117 - "animaciones.test.js"
Cohesion: 0.29
Nodes (6): aHex(), buscar(), carpeta, coloresDe(), paleta, permitidas

### Community 118 - "src/config.js"
Cohesion: 0.38
Nodes (9): cargarConfig(), dotenv, entero(), esUnOrigen(), leerOrigenes(), nombreDeLaBase(), OBLIGATORIAS, path (+1 more)

### Community 120 - "config.test.js"
Cohesion: 0.40
Nodes (4): cargarArchivoEnv(), base, { cargarConfig, cargarArchivoEnv }, require

### Community 121 - "dependencies"
Cohesion: 0.33
Nodes (6): dependencies, axios, lottie-web, @mdi/font, vue, vuetify

### Community 122 - "Vuetify 2 components (Vue 2.7)"
Cohesion: 0.33
Nodes (5): Custom v-model, Example: point-of-sale screen, Reactivity, Vue 3 / Vuetify 3 habit and its Vue 2 / Vuetify 2 form, Vuetify 2 components (Vue 2.7)

### Community 123 - "buscar-productos.test.js"
Cohesion: 0.14
Nodes (10): app, CABLE, EJEMPLOS, idsCreados, JUGO_50, JUGO_500, LECHE, { Producto } (+2 more)

### Community 124 - "base-de-prueba.test.js"
Cohesion: 0.19
Nodes (10): crearBaseDePrueba(), cargarClaveRoot(), { cargarClaveRoot, cargarConfig, cargarConfigDeEntorno }, consultar(), mysql, permisosDelUsuario(), require, sequelize (+2 more)

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
Cohesion: 0.14
Nodes (12): { config }, { Sequelize }, { DataTypes }, DetalleVenta, sequelize, { DataTypes }, sequelize, Venta (+4 more)

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
Cohesion: 0.33
Nodes (5): buscarProductos(), servicio, { validarBusqueda }, { buscarProductos }, { Router }

### Community 134 - "Flujo 00 · Mapa de procesos"
Cohesion: 0.67
Nodes (3): Desarrollo de AIPOS, Flujo 00 · Mapa de procesos, Operación del POS

### Community 135 - "Flujo 06 · Trabajar una tarjeta con el agente"
Cohesion: 0.67
Nodes (3): Flujo 06 · Trabajar una tarjeta con el agente, Otros caminos, Pasos

### Community 136 - "vitest-vue2.test.js"
Cohesion: 0.20
Nodes (6): avisosAlInstalar, declaradas, espia, paquete, versionesDelFrontend, lottie-web

### Community 138 - "errorHandler.js"
Cohesion: 0.31
Nodes (8): desdeBaseDeDatos(), ErrorApi, ESTADOS, aErrorApi(), desdeBaseDeDatos, desdeElCuerpo(), ErrorApi, esDelLector()

### Community 140 - "P-01 · La tabla `productos` y el modelo `Producto`"
Cohesion: 0.18
Nodes (10): Bugs, Criterios de aceptación de P-01, Migración, Modelo, P-01: la base, P-01 · La tabla `productos` y el modelo `Producto`, P-02: la API con `curl`, P-03: la pantalla, en el navegador con el MCP `chrome-devtools` (+2 more)

### Community 142 - "models/index.js"
Cohesion: 0.21
Nodes (10): DetalleVenta, Producto, sequelize, Venta, buscarProductos(), escaparParaLike(), { Op }, { sequelize, Producto } (+2 more)

### Community 143 - "sp-registrar-venta-migracion.test.js"
Cohesion: 0.17
Nodes (10): correrCli(), sinComentariosNiEspacios(), archivoDetalles, archivoProcedimiento, archivoVentas, carpetaMigraciones, cliente, nombres (+2 more)

### Community 144 - "Frontend"
Cohesion: 0.50
Nodes (4): Carpetas, Frontend, La venta actual, Servicio de API

### Community 146 - "comparar-rutas.test.js"
Cohesion: 0.20
Nodes (8): { cargarDocumentacionApi }, { crearApp }, docs, documentadas, documento, { montajes }, require, { Router }

### Community 147 - "Flujo 04 · Registrar venta"
Cohesion: 0.50
Nodes (4): Flujo 04 · Registrar venta, Notas técnicas, Otros caminos, Pasos

### Community 148 - "ejemplos-de-error.test.js"
Cohesion: 0.22
Nodes (6): { cargarDocumentacionApi }, documento, PROHIBIDO, recogerEjemplos(), require, RESPUESTAS_DE_ERROR

### Community 150 - "20260930172100-crear-sp-registrar-venta.js"
Cohesion: 0.33
Nodes (5): ARCHIVO, fs, leerCreate(), path, up()

### Community 151 - "modelos.test.js"
Cohesion: 0.29
Nodes (5): carpetaModelos, modelos, registrados, require, tablasDelGlosario

### Community 152 - "cors.test.js"
Cohesion: 0.33
Nodes (5): app, { cargarConfig }, config, { crearApp }, require

### Community 153 - "limite-del-cuerpo.test.js"
Cohesion: 0.33
Nodes (5): app, { crearApp }, eco, express, require

### Community 154 - "Lenguaje ubicuo — AIPOS"
Cohesion: 0.33
Nodes (6): Convención de nombres en código, Herramientas y proceso, Historial de cambios, Lenguaje ubicuo — AIPOS, Negocio, Pendientes (por confirmar)

### Community 155 - "AnimacionLottie.vue"
Cohesion: 0.36
Nodes (7): animacion(), beforeDestroy(), crear(), destruir(), mounted(), pideMenosMovimiento(), Al crear el producto

### Community 156 - "db/config.js"
Cohesion: 0.36
Nodes (6): { cargarConfigDeEntorno, cargarArchivoEnv }, development(), paraElCli(), test(), cargarConfigDeEntorno(), Entrega trazable

### Community 158 - "noEncontrado"
Cohesion: 0.50
Nodes (4): ErrorApi, noEncontrado(), La política de contenido solo en `/api/docs`, Swagger UI en `GET /api/docs`

### Community 159 - "Pantalla: botón "Registrar venta" (V-08)"
Cohesion: 0.40
Nodes (5): Animación, Contrato del componente, Criterios de aceptación de V-08, Pantalla: botón "Registrar venta" (V-08), Qué hace

### Community 160 - "Producto.js"
Cohesion: 0.50
Nodes (3): { DataTypes }, Producto, sequelize

## Knowledge Gaps
- **692 isolated node(s):** `singleQuote`, `printWidth`, `trailingComma`, `{ cargarConfigDeEntorno, cargarArchivoEnv }`, `fs` (+687 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 840 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **53 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `crearProducto()` connect `crearProducto` to `NuevoProducto.test.js`, `FormularioProducto.vue`, `Frontend`, `http.js`, `FormularioProducto.test.js`, `Lenguaje ubicuo — AIPOS`, `Backend`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Why does `Negocio` connect `Lenguaje ubicuo — AIPOS` to `crearProducto`, `Requerimientos funcionales`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `Lenguaje ubicuo — AIPOS` connect `Lenguaje ubicuo — AIPOS` to `graphify-setup.md`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **What connects `singleQuote`, `printWidth`, `trailingComma` to the rest of the system?**
  _692 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Trabajar en un tile` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `Requerimientos funcionales` be split into smaller, more focused modules?**
  _Cohesion score 0.0507399577167019 - nodes in this community are weakly interconnected._
