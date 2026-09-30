# Graph Report - p-04  (2026-09-30)

## Corpus Check
- 205 files · ~151,940 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 31 file(s) not represented in the graph (top: (none) 17, .drawio 8, .example 2)

## Summary
- 1373 nodes · 2003 edges · 149 communities (101 shown, 48 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 107 edges (avg confidence: 0.93)
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
- archivos.test.js
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
- comun.sh
- AIPOS
- Requerimientos no funcionales
- Comandos útiles
- misma-version.test.sh
- ignora-lo-local.test.sh
- agents-md.test.sh
- CLAUDE.md
- ref_vitest
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
- crearProducto
- Arquitectura de AIPOS
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
- despliegue/comun.sh
- desplegar.sh
- revisar-produccion.sh
- documentacion.js
- arranque-local.test.sh
- instalar-caddy.test.sh
- imagenes.test.sh
- database.test.js
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
- ref_node_fs
- frontend/package.json
- src/config.js
- backend/package.json
- docs.js
- app.js
- modelo-producto.test.js
- scripts
- salud-con-base.test.js
- devDependencies
- migraciones.test.js
- estructura-del-documento.test.js
- consultarSalud
- base-de-prueba.test.js
- NuevoProducto.test.js
- Product
- dependencies
- productos-migracion.test.js
- Design System: AIPOS
- devDependencies
- routes/index.js
- ejemplos-de-error.test.js
- estructura.test.js
- scripts
- modelos.test.js
- Registrar venta
- down
- Procedimiento sp_registrar_venta (V-02)
- FormularioProducto.test.js
- sin-axios-en-componentes.test.js
- animaciones.test.js
- eslint.config.js
- validarTexto
- dependencies
- Vuetify 2 components (Vue 2.7)
- buscar-productos.test.js
- ref_node_path
- Flujo 05 · Entregar un entregable
- glosario-y-alcance.test.sh
- backend/.prettierrc.json
- frontend/.prettierrc.json
- database.js
- Flujo 01 · Crear producto
- Flujo 02 · Buscar producto
- Flujo 03 · Armar la venta actual
- Flujo 04 · Registrar venta
- Flujo 00 · Mapa de procesos
- Flujo 06 · Trabajar una tarjeta con el agente
- engines
- vue2-vuetify2.md
- documentacion-buscar-productos.test.js
- Backend
- Documentación de la API
- ErrorApi.js
- models/index.js
- ref_node_module
- controllers/productos.js
- errorHandler.js
- Lenguaje ubicuo — AIPOS
- Pruebas en local
- P-01 · La tabla `productos` y el modelo `Producto`

## God Nodes (most connected - your core abstractions)
1. `Despliegue de AIPOS` - 22 edges
2. `scripts` - 15 edges
3. `crearProducto()` - 15 edges
4. `supertest` - 14 edges
5. `Requerimientos funcionales` - 14 edges
6. `Requerimientos no funcionales` - 14 edges
7. `cargarDocumentacionApi()` - 13 edges
8. `Armar la venta actual` - 13 edges
9. `Arquitectura de AIPOS` - 13 edges
10. `production()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Herramientas y proceso` --references--> `production()`  [INFERRED]
  docs/lenguaje-ubicuo.md → backend/db/config.js
- `Archivos` --references--> `down()`  [INFERRED]
  specs/registrar-venta.spec.md → backend/db/migrations/20260930133500-crear-productos.js
- `Archivos` --references--> `cargarDocumentacionApi()`  [INFERRED]
  specs/documentacion-de-la-api.spec.md → backend/src/documentacion.js
- `Reglas de negocio` --references--> `validarTexto()`  [INFERRED]
  specs/crear-producto.spec.md → backend/src/validators/comunes.js
- `Validación` --references--> `validarTexto()`  [INFERRED]
  specs/crear-producto.spec.md → backend/src/validators/comunes.js

## Import Cycles
- None detected.

## Communities (149 total, 48 thin omitted)

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
Cohesion: 0.15
Nodes (13): Reglas de negocio, Requerimientos funcionales, RF-01 Crear producto, RF-02 Buscar producto, RF-03 Agregar a la venta actual, RF-04 Ver los detalles de la venta actual, RF-05 Editar el precio aplicado, RF-06 Cambiar la cantidad (+5 more)

### Community 5 - "FormularioProducto.vue"
Cohesion: 0.10
Nodes (29): alAbrir(), alSalir(), cancelar(), cerrar(), data(), enfocar(), enlazarTitulo(), guardar() (+21 more)

### Community 6 - "archivos.test.js"
Cohesion: 0.29
Nodes (5): archivosJs(), backend, raiz, require, src

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
Cohesion: 0.05
Nodes (45): data(), aCentavos(), formatearCentavos(), calcularSubtotal(), calcularTotal(), vaciarVentaActual(), congelar(), leche (+37 more)

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

### Community 31 - "ref_vitest"
Cohesion: 0.11
Nodes (15): app, { cargarConfig }, config, { crearApp }, require, app, { cargarDocumentacionApi }, require (+7 more)

### Community 35 - "comparar-rutas.test.js"
Cohesion: 0.11
Nodes (23): { cargarDocumentacionApi }, { crearApp }, docs, documentadas, documento, { montajes }, require, { Router } (+15 more)

### Community 44 - "crearProducto"
Cohesion: 0.15
Nodes (15): crearProducto(), Al crear el producto, Contrato, Crear producto, Criterios de aceptación de P-02, Criterios de aceptación de P-03, Diseño con `impeccable`, Documentación de la API (tarjeta A-01) (+7 more)

### Community 45 - "Arquitectura de AIPOS"
Cohesion: 0.11
Nodes (19): test(), Arquitectura de AIPOS, Calidad, Carpetas, Cómo se decide un diseño, Dinero, Diseño de la pantalla, Frontend (+11 more)

### Community 52 - "total"
Cohesion: 0.32
Nodes (8): total(), RF-10 Guardar productos, ventas y detalles con sus relaciones, API: POST /api/ventas (V-03), Criterios de aceptación de V-03, Documentación de la API, El servicio y el procedimiento, Respuestas, Riesgo conocido: reintento cuando la respuesta se pierde

### Community 53 - "spec-arquitectura.test.sh"
Cohesion: 0.71
Nodes (7): debe_decir(), falla(), ok(), revisar(), spec-arquitectura.test.sh script, unido(), ya_no_debe_decir()

### Community 55 - "Despliegue de AIPOS"
Cohesion: 0.05
Nodes (47): production(), Configuración del servidor (una sola vez), Cómo desplegar una versión, Cómo queda armado el servidor, Despliegue de AIPOS, Environment y regla de etiquetas (GitHub), Errores frecuentes, Lo que nunca se hace (+39 more)

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

### Community 64 - "database.test.js"
Cohesion: 0.15
Nodes (9): app, { config }, servidor, { config }, dbConfig, modelos, require, { Sequelize } (+1 more)

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

### Community 86 - "ref_node_fs"
Cohesion: 0.17
Nodes (7): backend, EN_DEPENDENCIES, EN_DEV_DEPENDENCIES, lock, paquete, contraste(), luminancia()

### Community 87 - "frontend/package.json"
Cohesion: 0.12
Nodes (16): description, eslint, eslint-config-prettier, @eslint/js, globals, prettier, vitest, name (+8 more)

### Community 88 - "src/config.js"
Cohesion: 0.14
Nodes (20): { cargarConfigDeEntorno, cargarArchivoEnv }, development(), paraElCli(), crearBaseDePrueba(), cargarArchivoEnv(), cargarClaveRoot(), cargarConfig(), cargarConfigDeEntorno() (+12 more)

### Community 89 - "backend/package.json"
Cohesion: 0.11
Nodes (17): description, engines, node, eslint, eslint-config-prettier, @eslint/js, globals, prettier (+9 more)

### Community 90 - "docs.js"
Cohesion: 0.14
Nodes (15): { cargarDocumentacionApi }, DE_DEMOSTRACION, documento, helmet, { Router }, swaggerUi, app, docs (+7 more)

### Community 91 - "app.js"
Cohesion: 0.12
Nodes (18): app, cors, crearApp(), { crearRouterApi, montajes: montajesDeLaApi }, errorHandler, express, helmet, noEncontrado (+10 more)

### Community 92 - "modelo-producto.test.js"
Cohesion: 0.18
Nodes (13): conTransaccionDescartada(), errorDeMySQL(), insertarProducto(), require, sequelize, carpetaSrc, leche, modelos (+5 more)

### Community 93 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, deshacer, deshacer:prueba, dev, format, format:check, lint, migrar (+7 more)

### Community 94 - "salud-con-base.test.js"
Cohesion: 0.13
Nodes (10): carpetaBackend, carpetaRaiz, crearProxyCongelable(), archivo, app, require, sequelize, abrirUnPuerto() (+2 more)

### Community 95 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-vue, globals, jsdom, prettier (+6 more)

### Community 96 - "migraciones.test.js"
Cohesion: 0.18
Nodes (10): correrCli(), tablasDeLaBase(), archivos, cargarConfiguracion(), carpetaMigraciones, require, sequelize, tablasSinElRegistro() (+2 more)

### Community 97 - "estructura-del-documento.test.js"
Cohesion: 0.18
Nodes (11): { cargarDocumentacionApi }, DINERO, documento, ESTADOS_PERMITIDOS, METODOS, nombresDeCampos(), problemasDeDinero(), recorrer() (+3 more)

### Community 98 - "consultarSalud"
Cohesion: 0.15
Nodes (15): { consultarSalud }, obtenerSalud(), conLimiteDeTiempo(), consultarSalud(), cortarConexion(), sequelize, Salud, Cabecera (+7 more)

### Community 99 - "base-de-prueba.test.js"
Cohesion: 0.24
Nodes (9): correrNpm(), correrNpmSinFallar(), { cargarClaveRoot, cargarConfig, cargarConfigDeEntorno }, consultar(), mysql, permisosDelUsuario(), require, sequelize (+1 more)

### Community 100 - "NuevoProducto.test.js"
Cohesion: 0.05
Nodes (30): animacion(), beforeDestroy(), crear(), destruir(), mounted(), pideMenosMovimiento(), es, animacion (+22 more)

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

### Community 106 - "routes/index.js"
Cohesion: 0.22
Nodes (8): docs, montajes, productos, { Router }, salud, { obtenerSalud }, { Router }, express

### Community 107 - "ejemplos-de-error.test.js"
Cohesion: 0.22
Nodes (6): { cargarDocumentacionApi }, documento, PROHIBIDO, recogerEjemplos(), require, RESPUESTAS_DE_ERROR

### Community 108 - "estructura.test.js"
Cohesion: 0.22
Nodes (6): archivosJs(), backend, paquete, raiz, require_, src

### Community 110 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, preview, test (+1 more)

### Community 112 - "modelos.test.js"
Cohesion: 0.29
Nodes (5): carpetaModelos, modelos, registrados, require, tablasDelGlosario

### Community 113 - "Registrar venta"
Cohesion: 0.22
Nodes (8): API, con `curl` (V-03), Bugs y issues, Cómo se decidió el diseño, Pantalla, en el navegador con el MCP `chrome-devtools` (V-08), Preguntas para la persona desarrolladora, Pruebas en local, Registrar venta, Reglas de negocio

### Community 114 - "down"
Cohesion: 0.43
Nodes (7): down(), up(), Comandos del backend, Base de datos, Migración, Patrones de diseño, Tablas y modelos (V-01)

### Community 115 - "Procedimiento sp_registrar_venta (V-02)"
Cohesion: 0.33
Nodes (6): Archivos, Criterios de aceptación de V-02, Parámetro y respuesta, Procedimiento sp_registrar_venta (V-02), Qué hace, en orden, Todo o nada

### Community 116 - "FormularioProducto.test.js"
Cohesion: 0.13
Nodes (21): crearError(), http, traducirError(), cargar(), producto, cargarHttp(), boton(), dialogo() (+13 more)

### Community 117 - "sin-axios-en-componentes.test.js"
Cohesion: 0.29
Nodes (6): archivosDe(), componentes, enSrc(), fueraDeApi, raiz, todos

### Community 118 - "animaciones.test.js"
Cohesion: 0.29
Nodes (6): aHex(), buscar(), carpeta, coloresDe(), paleta, permitidas

### Community 120 - "validarTexto"
Cohesion: 0.22
Nodes (11): conProblema(), contarCaracteres(), ErrorApi, exigirDatosValidos(), validarTexto(), validarBusqueda(), { validarTexto, exigirDatosValidos }, ErrorApi (+3 more)

### Community 121 - "dependencies"
Cohesion: 0.33
Nodes (6): dependencies, axios, lottie-web, @mdi/font, vue, vuetify

### Community 122 - "Vuetify 2 components (Vue 2.7)"
Cohesion: 0.33
Nodes (5): Custom v-model, Example: point-of-sale screen, Reactivity, Vue 3 / Vuetify 3 habit and its Vue 2 / Vuetify 2 form, Vuetify 2 components (Vue 2.7)

### Community 123 - "buscar-productos.test.js"
Cohesion: 0.14
Nodes (10): app, CABLE, EJEMPLOS, idsCreados, JUGO_50, JUGO_500, LECHE, { Producto } (+2 more)

### Community 124 - "ref_node_path"
Cohesion: 0.22
Nodes (4): archivosJs(), ejemplo, raiz, carpetaBackend

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
Cohesion: 0.18
Nodes (9): { config }, { Sequelize }, { DataTypes }, Producto, sequelize, { DataTypes }, require, sequelize (+1 more)

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

### Community 138 - "documentacion-buscar-productos.test.js"
Cohesion: 0.20
Nodes (9): app, { cargarDocumentacionApi }, documento, idsCreados, { montajes }, { Producto }, require, abrirServidorDePrueba() (+1 more)

### Community 139 - "Backend"
Cohesion: 0.22
Nodes (10): ErrorApi, errorHandler(), Backend, Capas, Carpetas, Errores, Límites, CORS y cabeceras, Procedimientos almacenados (+2 more)

### Community 140 - "Documentación de la API"
Cohesion: 0.18
Nodes (11): Archivos, Criterios de aceptación, Cómo se decidió el diseño, Dependencias, Documentación de la API, Glosario y alcance, La prueba de rutas documentadas, La prueba se prueba a sí misma (+3 more)

### Community 141 - "ErrorApi.js"
Cohesion: 0.32
Nodes (5): desdeBaseDeDatos(), ErrorApi, ESTADOS, ErrorApi, noEncontrado()

### Community 142 - "models/index.js"
Cohesion: 0.36
Nodes (6): Producto, sequelize, buscarProductos(), escaparParaLike(), { Op }, { sequelize, Producto }

### Community 143 - "ref_node_module"
Cohesion: 0.25
Nodes (4): require, sequelize, { escaparParaLike }, require

### Community 144 - "controllers/productos.js"
Cohesion: 0.33
Nodes (5): buscarProductos(), servicio, { validarBusqueda }, { buscarProductos }, { Router }

### Community 145 - "errorHandler.js"
Cohesion: 0.67
Nodes (5): aErrorApi(), desdeBaseDeDatos, desdeElCuerpo(), ErrorApi, esDelLector()

### Community 146 - "Lenguaje ubicuo — AIPOS"
Cohesion: 0.33
Nodes (6): Convención de nombres en código, Herramientas y proceso, Historial de cambios, Lenguaje ubicuo — AIPOS, Negocio, Pendientes (por confirmar)

### Community 147 - "Pruebas en local"
Cohesion: 0.40
Nodes (5): Bugs, P-01: la base, P-02: la API con `curl`, P-03: la pantalla, en el navegador con el MCP `chrome-devtools`, Pruebas en local

### Community 148 - "P-01 · La tabla `productos` y el modelo `Producto`"
Cohesion: 0.50
Nodes (4): Criterios de aceptación de P-01, Modelo, P-01 · La tabla `productos` y el modelo `Producto`, Productos de ejemplo (opcional, por confirmar)

## Knowledge Gaps
- **640 isolated node(s):** `singleQuote`, `printWidth`, `trailingComma`, `{ cargarConfigDeEntorno, cargarArchivoEnv }`, `name` (+635 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 772 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **48 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `crearProducto()` connect `crearProducto` to `consultarSalud`, `NuevoProducto.test.js`, `FormularioProducto.vue`, `Backend`, `Documentación de la API`, `Arquitectura de AIPOS`, `Lenguaje ubicuo — AIPOS`, `Buscar producto`, `FormularioProducto.test.js`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Why does `Negocio` connect `Lenguaje ubicuo — AIPOS` to `crearProducto`, `total`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `Lenguaje ubicuo — AIPOS` connect `Lenguaje ubicuo — AIPOS` to `graphify-setup.md`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **What connects `singleQuote`, `printWidth`, `trailingComma` to the rest of the system?**
  _640 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Trabajar en un tile` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `FormularioProducto.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.10121951219512196 - nodes in this community are weakly interconnected._
