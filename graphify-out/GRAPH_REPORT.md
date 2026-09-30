# Graph Report - v-04  (2026-09-30)

## Corpus Check
- 218 files · ~173,900 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 31 file(s) not represented in the graph (top: (none) 17, .drawio 8, .example 2)

## Summary
- 1530 nodes · 2321 edges · 151 communities (102 shown, 49 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 130 edges (avg confidence: 0.93)
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
- BuscadorProductos.test.js
- Flujo de un entregable
- Configurar el MCP de Trello
- saltos-de-linea.test.sh
- Tarjetas
- VentaActual.test.js
- Glosario de lenguaje ubicuo
- Bitácora de IA
- README de entrega
- MySQL stored procedure authoring
- Calling a stored procedure from Sequelize
- Vue 2 + Vuetify 2 + Vite setup
- Requerimientos de AIPOS
- Documentación de la API
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
- Armar la venta actual
- BuscadorProductos.vue
- marca-de-commit.test.sh
- version-con-crlf.test.sh
- desactualizado-tras-falla.test.sh
- merge-sin-choques.test.sh
- merge-sin-cambios-en-el-grafo.test.sh
- vaciarVentaActual
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
- csp-docs.test.js
- app.js
- modelo-producto.test.js
- scripts
- FormularioProducto.test.js
- devDependencies
- docs.js
- api/productos.js
- ref_node_path
- NuevoProducto.test.js
- Product
- dependencies
- ventaActual.js
- Design System: AIPOS
- devDependencies
- BuscadorProductos-enter.test.js
- estructura.test.js
- scripts
- Registrar venta
- Arquitectura de AIPOS
- agregar.test.js
- sin-axios-en-componentes.test.js
- animaciones.test.js
- eslint.config.js
- validarTexto
- dependencies
- Vuetify 2 components (Vue 2.7)
- productos/buscar-productos.test.js
- pantalla-venta-actual.test.js
- Flujo 05 · Entregar un entregable
- glosario-y-alcance.test.sh
- backend/.prettierrc.json
- frontend/.prettierrc.json
- VentaActual.vue
- Flujo 01 · Crear producto
- Flujo 02 · Buscar producto
- Flujo 03 · Armar la venta actual
- rutas-documentadas.test.js
- Flujo 00 · Mapa de procesos
- Flujo 06 · Trabajar una tarjeta con el agente
- modelos.test.js
- vue2-vuetify2.md
- servidor.test.js
- noEncontrado
- Buscar producto
- vuetify.js
- consultarSalud
- El documento OpenAPI
- formatearCentavos
- Flujo 04 · Registrar venta
- vitest-vue2.test.js
- base-de-prueba.test.js
- aislamiento.test.js
- productos-migracion.test.js
- AnimacionLottie.vue
- La pantalla
- pantalla-unica.test.js
- limite-del-cuerpo.test.js

## God Nodes (most connected - your core abstractions)
1. `Despliegue de AIPOS` - 22 edges
2. `crearProducto()` - 16 edges
3. `scripts` - 15 edges
4. `formatearCentavos()` - 15 edges
5. `supertest` - 14 edges
6. `agregarAVentaActual()` - 14 edges
7. `Requerimientos funcionales` - 14 edges
8. `Requerimientos no funcionales` - 14 edges
9. `texto()` - 13 edges
10. `cargarDocumentacionApi()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Despliegue` --references--> `production()`  [INFERRED]
  README.md → backend/db/config.js
- ``GET /api/salud`` --references--> `consultarSalud()`  [INFERRED]
  specs/documentacion-de-la-api.spec.md → backend/src/services/salud.js
- `Reglas de negocio` --references--> `validarTexto()`  [INFERRED]
  specs/crear-producto.spec.md → backend/src/validators/comunes.js
- `Validación` --references--> `validarTexto()`  [INFERRED]
  specs/crear-producto.spec.md → backend/src/validators/comunes.js
- `Servicio de API` --references--> `crearProducto()`  [INFERRED]
  specs/arquitectura.spec.md → frontend/src/api/productos.js

## Import Cycles
- None detected.

## Communities (151 total, 49 thin omitted)

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
Cohesion: 0.06
Nodes (49): crearProducto(), alAbrir(), alSalir(), cancelar(), cerrar(), data(), enfocar(), enlazarTitulo() (+41 more)

### Community 6 - "BuscadorProductos.test.js"
Cohesion: 0.15
Nodes (12): asentar(), avanzar(), conResultados(), entrada(), escribir(), escribirYBuscar(), jugo, leche (+4 more)

### Community 7 - "Flujo de un entregable"
Cohesion: 0.18
Nodes (10): 0. Revisar el repositorio (una vez por proyecto), 1. Empezar el entregable, 2. Trabajar, 3. Abrir el PR, 4. Revisar antes de integrar, 5. Integrar, 6. Etiquetar, 7. Entrega final (+2 more)

### Community 8 - "Configurar el MCP de Trello"
Cohesion: 0.18
Nodes (11): 1. Crear el board en Trello, 2. Obtener el API key, 3. Generar el token, 4. Agregar el servidor a Claude Code, 5. Verificar la conexión, Alternativa: Codex CLI, Configurar el MCP de Trello, Requisitos (+3 more)

### Community 10 - "Tarjetas"
Cohesion: 0.17
Nodes (12): Definición de terminado, Despliegue, Entrega final, Entregable productos, Entregable ventas, Entregables y tarjetas, Ramas de tarjeta, Requerimientos (+4 more)

### Community 11 - "VentaActual.test.js"
Cohesion: 0.15
Nodes (5): leche, { loadAnimation, instancias }, pan, venta(), ventaConDetalles()

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

### Community 19 - "Documentación de la API"
Cohesion: 0.20
Nodes (10): Criterios de aceptación, Cómo se decidió el diseño, Dependencias, Documentación de la API, Glosario y alcance, La prueba de rutas documentadas, La prueba se prueba a sí misma, Pruebas en local (+2 more)

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
Cohesion: 0.12
Nodes (12): require, sequelize, app, { cargarConfig }, config, { crearApp }, require, app (+4 more)

### Community 35 - "comparar-rutas.test.js"
Cohesion: 0.15
Nodes (16): { cargarDocumentacionApi }, { crearApp }, docs, documentadas, documento, { montajes }, require, { Router } (+8 more)

### Community 44 - "Armar la venta actual"
Cohesion: 0.10
Nodes (20): `agregarAVentaActual` (V-04), Armar la venta actual, `cambiarCantidad` y `validarCantidad` (V-06), `cambiarPrecioAplicado` y `validarPrecioAplicado` (V-05), Casos de error y bordes, Criterios de aceptación, Cómo se decidió el diseño, El módulo (`src/ventaActual/`) (+12 more)

### Community 45 - "BuscadorProductos.vue"
Cohesion: 0.18
Nodes (11): buscarProductos(), beforeDestroy(), buscar(), buscarAlPresionarEnter(), cancelarEspera(), elegir(), largoEnCaracteres(), mostrar() (+3 more)

### Community 52 - "vaciarVentaActual"
Cohesion: 0.22
Nodes (9): guardarVentaActual(), leerVentaActual(), vaciarVentaActual(), congelar(), leche, pan, `App.vue`: une la búsqueda con la venta actual (V-04), Guardar la venta actual en el navegador (V-04) (+1 more)

### Community 53 - "spec-arquitectura.test.sh"
Cohesion: 0.71
Nodes (7): debe_decir(), falla(), ok(), revisar(), spec-arquitectura.test.sh script, unido(), ya_no_debe_decir()

### Community 55 - "Despliegue de AIPOS"
Cohesion: 0.05
Nodes (43): production(), Configuración del servidor (una sola vez), Cómo desplegar una versión, Cómo queda armado el servidor, Despliegue de AIPOS, Environment y regla de etiquetas (GitHub), Errores frecuentes, Lo que nunca se hace (+35 more)

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
Cohesion: 0.05
Nodes (35): cargarDocumentacionApi(), fs, { parse }, path, RUTA_DEL_DOCUMENTO, { cargarDocumentacionApi }, documento, PROHIBIDO (+27 more)

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
Nodes (18): { config }, { Sequelize }, { DataTypes }, Producto, sequelize, app, { config }, servidor (+10 more)

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
Cohesion: 0.11
Nodes (17): description, engines, node, eslint, eslint-config-prettier, @eslint/js, globals, prettier (+9 more)

### Community 90 - "csp-docs.test.js"
Cohesion: 0.27
Nodes (8): app, docs, express, helmet, politicaDe(), politicaDeHelmet(), require, helmet

### Community 91 - "app.js"
Cohesion: 0.14
Nodes (16): app, cors, crearApp(), { crearRouterApi, montajes: montajesDeLaApi }, errorHandler, express, helmet, noEncontrado (+8 more)

### Community 92 - "modelo-producto.test.js"
Cohesion: 0.18
Nodes (13): conTransaccionDescartada(), errorDeMySQL(), insertarProducto(), require, sequelize, carpetaSrc, leche, modelos (+5 more)

### Community 93 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, deshacer, deshacer:prueba, dev, format, format:check, lint, migrar (+7 more)

### Community 94 - "FormularioProducto.test.js"
Cohesion: 0.27
Nodes (14): boton(), dialogo(), entrada(), escribir(), esperar(), etiquetaDe(), franja(), guardarConError() (+6 more)

### Community 95 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-vue, globals, jsdom, prettier (+6 more)

### Community 96 - "docs.js"
Cohesion: 0.25
Nodes (7): { cargarDocumentacionApi }, DE_DEMOSTRACION, documento, helmet, { Router }, swaggerUi, swagger-ui-express

### Community 97 - "api/productos.js"
Cohesion: 0.21
Nodes (9): crearError(), http, traducirError(), cargar(), leche, cargar(), producto, cargarHttp() (+1 more)

### Community 99 - "ref_node_path"
Cohesion: 0.09
Nodes (13): carpetaRaiz, archivo, archivosJs(), backend, raiz, require, src, archivosJs() (+5 more)

### Community 100 - "NuevoProducto.test.js"
Cohesion: 0.15
Nodes (10): abrirLlenarYGuardar(), boton(), botonNuevo(), dialogo(), entrada(), escribir(), esperar(), { loadAnimation, instancias } (+2 more)

### Community 101 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 102 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, cors, dotenv, express, helmet, mysql2, sequelize, sequelize-cli (+3 more)

### Community 103 - "ventaActual.js"
Cohesion: 0.18
Nodes (17): alElegirProducto(), avisar(), AVISOS, data(), reemplazarVentaActual(), resaltar(), detalleGuardado(), esObjeto() (+9 more)

### Community 104 - "Design System: AIPOS"
Cohesion: 0.20
Nodes (9): Colors, Components, Design System: AIPOS, Do's and Don'ts, Elevation & Depth, Layout, Overview, Shapes (+1 more)

### Community 105 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, @apidevtools/swagger-parser, eslint, eslint-config-prettier, @eslint/js, globals, prettier, supertest (+1 more)

### Community 107 - "BuscadorProductos-enter.test.js"
Cohesion: 0.15
Nodes (12): asentar(), avanzar(), cable, entrada(), escribir(), jugo, leche, { loadAnimation } (+4 more)

### Community 108 - "estructura.test.js"
Cohesion: 0.22
Nodes (6): archivosJs(), backend, paquete, raiz, require_, src

### Community 110 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, preview, test (+1 more)

### Community 113 - "Registrar venta"
Cohesion: 0.05
Nodes (45): down(), up(), AIPOS, Base de datos: MySQL y migraciones, Base de prueba, Comandos del backend, Desde un clon limpio, Despliegue (+37 more)

### Community 114 - "Arquitectura de AIPOS"
Cohesion: 0.11
Nodes (18): test(), Arquitectura de AIPOS, Calidad, Carpetas, Cómo se decide un diseño, Dinero, Diseño de la pantalla, Frontend (+10 more)

### Community 115 - "agregar.test.js"
Cohesion: 0.38
Nodes (6): congelar(), detalle(), leche, pan, venta(), ventaConDetalles()

### Community 117 - "sin-axios-en-componentes.test.js"
Cohesion: 0.29
Nodes (6): archivosDe(), componentes, enSrc(), fueraDeApi, raiz, todos

### Community 118 - "animaciones.test.js"
Cohesion: 0.25
Nodes (7): aHex(), animadas(), buscar(), carpeta, coloresDe(), paleta, permitidas

### Community 120 - "validarTexto"
Cohesion: 0.07
Nodes (38): buscarProductos(), servicio, { validarBusqueda }, desdeBaseDeDatos(), ErrorApi, ErrorApi, ESTADOS, aErrorApi() (+30 more)

### Community 121 - "dependencies"
Cohesion: 0.33
Nodes (6): dependencies, axios, lottie-web, @mdi/font, vue, vuetify

### Community 122 - "Vuetify 2 components (Vue 2.7)"
Cohesion: 0.33
Nodes (5): Custom v-model, Example: point-of-sale screen, Reactivity, Vue 3 / Vuetify 3 habit and its Vue 2 / Vuetify 2 form, Vuetify 2 components (Vue 2.7)

### Community 123 - "productos/buscar-productos.test.js"
Cohesion: 0.07
Nodes (27): Producto, sequelize, buscarProductos(), escaparParaLike(), { Op }, { sequelize, Producto }, app, CABLE (+19 more)

### Community 124 - "pantalla-venta-actual.test.js"
Cohesion: 0.15
Nodes (7): botonRegistrar(), filas(), leche, { loadAnimation }, pan, total(), zonaVenta()

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

### Community 129 - "VentaActual.vue"
Cohesion: 0.12
Nodes (8): puedeRegistrar(), detallesParaRegistrar(), ventaActualEsValida(), congelar(), leche, pan, regalo, Quién implementa qué

### Community 130 - "Flujo 01 · Crear producto"
Cohesion: 0.50
Nodes (4): Flujo 01 · Crear producto, Notas técnicas, Otros caminos, Pasos

### Community 131 - "Flujo 02 · Buscar producto"
Cohesion: 0.50
Nodes (4): Flujo 02 · Buscar producto, Notas técnicas, Otros caminos, Pasos

### Community 132 - "Flujo 03 · Armar la venta actual"
Cohesion: 0.50
Nodes (4): Flujo 03 · Armar la venta actual, Notas técnicas, Otros caminos, Pasos

### Community 133 - "rutas-documentadas.test.js"
Cohesion: 0.12
Nodes (15): docs, montajes, productos, { Router }, salud, { obtenerSalud }, { Router }, app (+7 more)

### Community 134 - "Flujo 00 · Mapa de procesos"
Cohesion: 0.67
Nodes (3): Desarrollo de AIPOS, Flujo 00 · Mapa de procesos, Operación del POS

### Community 135 - "Flujo 06 · Trabajar una tarjeta con el agente"
Cohesion: 0.67
Nodes (3): Flujo 06 · Trabajar una tarjeta con el agente, Otros caminos, Pasos

### Community 136 - "modelos.test.js"
Cohesion: 0.29
Nodes (5): carpetaModelos, modelos, registrados, require, tablasDelGlosario

### Community 138 - "servidor.test.js"
Cohesion: 0.33
Nodes (3): abrirUnPuerto(), backend, buscarPuertoLibre()

### Community 139 - "noEncontrado"
Cohesion: 0.50
Nodes (4): ErrorApi, noEncontrado(), La política de contenido solo en `/api/docs`, Swagger UI en `GET /api/docs`

### Community 140 - "Buscar producto"
Cohesion: 0.14
Nodes (13): Buscar producto, Criterios de aceptación de la API (P-04), Criterios de aceptación de la pantalla (P-05), Cómo se decidió el diseño, Cómo se ve y se comporta, Diseño (skill `impeccable`), Estados de la zona de resultados, Lo que esta spec no cubre (+5 more)

### Community 141 - "vuetify.js"
Cohesion: 0.21
Nodes (7): es, animacion, { loadAnimation, instancias }, @mdi/font, vue, @vue/test-utils, vuetify

### Community 142 - "consultarSalud"
Cohesion: 0.36
Nodes (7): { consultarSalud }, obtenerSalud(), conLimiteDeTiempo(), consultarSalud(), cortarConexion(), sequelize, Salud

### Community 143 - "El documento OpenAPI"
Cohesion: 0.25
Nodes (8): Cabecera, Ejemplos que dicen lo que la API hace, Ejemplos sin detalles internos, El documento es OpenAPI 3 válido, El documento OpenAPI, El formato de error como esquema compartido, `GET /api/salud`, Rutas

### Community 144 - "formatearCentavos"
Cohesion: 0.19
Nodes (16): subtotalDe(), total(), aCentavos(), formatearCentavos(), calcularSubtotal(), calcularTotal(), congelar(), detalle() (+8 more)

### Community 145 - "Flujo 04 · Registrar venta"
Cohesion: 0.50
Nodes (4): Flujo 04 · Registrar venta, Notas técnicas, Otros caminos, Pasos

### Community 146 - "vitest-vue2.test.js"
Cohesion: 0.20
Nodes (6): avisosAlInstalar, declaradas, espia, paquete, versionesDelFrontend, lottie-web

### Community 147 - "base-de-prueba.test.js"
Cohesion: 0.28
Nodes (7): { cargarClaveRoot, cargarConfig, cargarConfigDeEntorno }, consultar(), mysql, permisosDelUsuario(), require, sequelize, tablasDe()

### Community 149 - "aislamiento.test.js"
Cohesion: 0.22
Nodes (6): archivosDe(), delModulo, enSrc(), puras, raiz, todos

### Community 152 - "productos-migracion.test.js"
Cohesion: 0.09
Nodes (26): carpetaBackend, correrCli(), correrNpm(), correrNpmSinFallar(), crearProxyCongelable(), tablasDeLaBase(), archivos, cargarConfiguracion() (+18 more)

### Community 157 - "AnimacionLottie.vue"
Cohesion: 0.43
Nodes (6): animacion(), beforeDestroy(), crear(), destruir(), mounted(), pideMenosMovimiento()

### Community 159 - "La pantalla"
Cohesion: 0.22
Nodes (9): Negocio, resaltarId(), ventaActual(), Botón «Eliminar» (V-07), `CampoCantidad.vue` (V-06), `CampoPrecioAplicado.vue` (V-05), Diseño (skill `impeccable`), La pantalla (+1 more)

### Community 167 - "limite-del-cuerpo.test.js"
Cohesion: 0.33
Nodes (5): app, { crearApp }, eco, express, require

## Knowledge Gaps
- **669 isolated node(s):** `singleQuote`, `printWidth`, `trailingComma`, `{ cargarConfigDeEntorno, cargarArchivoEnv }`, `name` (+664 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 847 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **49 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `crearProducto()` connect `FormularioProducto.vue` to `api/productos.js`, `NuevoProducto.test.js`, `Buscar producto`, `El documento OpenAPI`, `Arquitectura de AIPOS`, `Documentación de la API`, `validarTexto`, `pantalla-venta-actual.test.js`, `FormularioProducto.test.js`, `La pantalla`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `Negocio` connect `La pantalla` to `formatearCentavos`, `ventaActual.js`, `FormularioProducto.vue`, `Despliegue de AIPOS`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `Lenguaje ubicuo — AIPOS` connect `Despliegue de AIPOS` to `graphify-setup.md`, `La pantalla`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **What connects `singleQuote`, `printWidth`, `trailingComma` to the rest of the system?**
  _669 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Trabajar en un tile` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `Requerimientos funcionales` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
