# Graph Report - despliegue  (2026-09-30)

## Corpus Check
- 96 files · ~92,646 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: .drawio 7, (none) 5, .example 1)

## Summary
- 622 nodes · 657 edges · 79 communities (36 shown, 43 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- En AIPOS, el hook de git `pre-commit` actualiza este grafo en cada commit: va al día con el commit que lo trae.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- requerimientos/README.md
- Grafo del proyecto
- dependencies
- Trabajar en un tile
- Requerimientos funcionales
- Buscar producto
- Crear producto
- Flujo de un entregable
- desplegar.sh
- saltos-de-linea.test.sh
- Entregables y tarjetas
- Armar la venta actual
- Glosario de lenguaje ubicuo
- Bitácora de IA
- README de entrega
- MySQL stored procedure authoring
- Calling a stored procedure from Sequelize
- Vue 2 + Vuetify 2 + Vite setup
- Requerimientos de AIPOS
- Vuetify 2 components (Vue 2.7)
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
- entrega-trazable.md
- comunicacion-clara.md
- rules/lenguaje-ubicuo.md
- mysql-sequelize.md
- vue2-vuetify2.md
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
- Registrar venta
- spec-arquitectura.test.sh
- agents-md-tarjeta.test.sh
- Despliegue de AIPOS
- Alcance
- despliegue/comun.sh
- crear-env.test.sh
- instalar-caddy.test.sh
- desplegar-migracion-falla.test.sh
- desplegar-sin-imagen.test.sh
- volver-si-falla-la-salud.test.sh
- desplegar-en-fila.test.sh
- desplegar-ok.test.sh
- volver-primer-despliegue.test.sh
- revisar-produccion.test.sh
- volver-dos-veces.test.sh
- caddy.test.sh
- etiqueta-en-produccionenv.test.sh
- etiqueta-release.test.sh
- workflow.test.sh
- sin-datos-privados.test.sh
- github-environment-y-etiquetas.test.sh
- compose-produccion.test.sh
- sin-borrar-datos.test.sh
- imagenes.test.sh
- documentos.test.sh
- arranque-local.test.sh

## God Nodes (most connected - your core abstractions)
1. `Despliegue de AIPOS` - 22 edges
2. `Requerimientos funcionales` - 14 edges
3. `Requerimientos no funcionales` - 14 edges
4. `Armar la venta actual` - 13 edges
5. `Arquitectura de AIPOS` - 13 edges
6. `desplegar()` - 12 edges
7. `Documentación de la API` - 12 edges
8. `volver()` - 11 edges
9. `Buscar producto` - 10 edges
10. `Grafo del proyecto` - 10 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (79 total, 43 thin omitted)

### Community 0 - "requerimientos/README.md"
Cohesion: 0.07
Nodes (27): Desarrollo de AIPOS, Flujo 00 · Mapa de procesos, Operación del POS, Flujo 01 · Crear producto, Notas técnicas, Otros caminos, Pasos, Flujo 02 · Buscar producto (+19 more)

### Community 1 - "Grafo del proyecto"
Cohesion: 0.06
Nodes (31): Convención de nombres en código, Herramientas y proceso, Historial de cambios, Lenguaje ubicuo — AIPOS, Negocio, Pendientes (por confirmar), 1. Crear el board en Trello, 2. Obtener el API key (+23 more)

### Community 2 - "dependencies"
Cohesion: 0.12
Nodes (16): agents, dependencies, g14wxz/entrega-trazable, g14wxz/grafo-del-proyecto, g14wxz/lenguaje-ubicuo, g14wxz/mysql-sequelize-procedimientos, g14wxz/vue2-vuetify2-vite, tessl-labs/spec-driven-development (+8 more)

### Community 3 - "Trabajar en un tile"
Cohesion: 0.14
Nodes (14): 1. Instalar Tessl, 2. Instalar los tiles del proyecto, 3. Conectar el MCP de Tessl (opcional), 4. Verificar, 5. Cambiar un tile, 6. Medir un tile con evals (necesita cuenta), 7. Publicar un tile (necesita cuenta), Qué va a git y qué no (+6 more)

### Community 4 - "Requerimientos funcionales"
Cohesion: 0.14
Nodes (14): Reglas de negocio, Requerimientos funcionales, RF-01 Crear producto, RF-02 Buscar producto, RF-03 Agregar a la venta actual, RF-04 Ver los detalles de la venta actual, RF-05 Editar el precio aplicado, RF-06 Cambiar la cantidad (+6 more)

### Community 5 - "Buscar producto"
Cohesion: 0.11
Nodes (18): API: `GET /api/productos?busqueda=<texto>`, Buscar producto, Criterios de aceptación de la API (P-04), Criterios de aceptación de la pantalla (P-05), Cómo busca el servicio, Cómo se decidió el diseño, Cómo se ve y se comporta, Diseño (skill `impeccable`) (+10 more)

### Community 6 - "Crear producto"
Cohesion: 0.08
Nodes (25): Al crear el producto, Bugs, Contrato, Crear producto, Criterios de aceptación de P-01, Criterios de aceptación de P-02, Criterios de aceptación de P-03, Diseño con `impeccable` (+17 more)

### Community 7 - "Flujo de un entregable"
Cohesion: 0.18
Nodes (10): 0. Revisar el repositorio (una vez por proyecto), 1. Empezar el entregable, 2. Trabajar, 3. Abrir el PR, 4. Revisar antes de integrar, 5. Integrar, 6. Etiquetar, 7. Entrega final (+2 more)

### Community 8 - "desplegar.sh"
Cohesion: 0.31
Nodes (17): bajar_imagenes(), comprobar_env(), comprobar_etiqueta(), dc(), desplegar(), escribir_estado(), esperar_200(), fallar() (+9 more)

### Community 10 - "Entregables y tarjetas"
Cohesion: 0.18
Nodes (11): Definición de terminado, Entrega final, Entregable productos, Entregable ventas, Entregables y tarjetas, Ramas de tarjeta, Requerimientos, Secuencia de los entregables (+3 more)

### Community 11 - "Armar la venta actual"
Cohesion: 0.06
Nodes (31): `agregarAVentaActual` (V-04), `App.vue`: une la búsqueda con la venta actual (V-04), Armar la venta actual, Botón «Eliminar» (V-07), `cambiarCantidad` y `validarCantidad` (V-06), `cambiarPrecioAplicado` y `validarPrecioAplicado` (V-05), `CampoCantidad.vue` (V-06), `CampoPrecioAplicado.vue` (V-05) (+23 more)

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

### Community 19 - "Vuetify 2 components (Vue 2.7)"
Cohesion: 0.33
Nodes (5): Custom v-model, Example: point-of-sale screen, Reactivity, Vue 3 / Vuetify 3 habit and its Vue 2 / Vuetify 2 form, Vuetify 2 components (Vue 2.7)

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

### Community 44 - "Documentación de la API"
Cohesion: 0.09
Nodes (22): Archivos, Cabecera, Criterios de aceptación, Cómo se decidió el diseño, Cómo se listan las rutas con Express 5, Dependencias, Documentación de la API, Ejemplos que dicen lo que la API hace (+14 more)

### Community 45 - "Arquitectura de AIPOS"
Cohesion: 0.08
Nodes (26): Arquitectura de AIPOS, Backend, Base de datos, Calidad, Capas, Carpetas, Carpetas, Cómo se decide un diseño (+18 more)

### Community 52 - "Registrar venta"
Cohesion: 0.07
Nodes (26): Animación, API, con `curl` (V-03), API: POST /api/ventas (V-03), Archivos, Bugs y issues, Contrato del componente, Criterios de aceptación de V-02, Criterios de aceptación de V-03 (+18 more)

### Community 53 - "spec-arquitectura.test.sh"
Cohesion: 0.90
Nodes (4): falla(), ok(), revisar(), spec-arquitectura.test.sh script

### Community 55 - "Despliegue de AIPOS"
Cohesion: 0.08
Nodes (24): Caddy, Casos de error, Configuración del servidor (una sola vez), Criterios de aceptación, Cómo queda armado el servidor, Cómo se decidió el diseño, Despliegue de AIPOS, Docker Compose de producción (`docker-compose.produccion.yml`) (+16 more)

### Community 56 - "Alcance"
Cohesion: 0.22
Nodes (9): Actores y partes, Alcance, Fuera de alcance, Lo que agregamos y el PDF no pide, Objetivo, Qué entra, Restricciones, Riesgos (+1 more)

### Community 57 - "despliegue/comun.sh"
Cohesion: 0.10
Nodes (15): comprobar(), crear_dobles(), crear_repo_de_mentira(), crear_version(), estar_corriendo(), falla(), igual(), marcar_imagen() (+7 more)

### Community 58 - "crear-env.test.sh"
Cohesion: 0.67
Nodes (3): AIPOS_RAIZ, crear-env.test.sh script, valor()

### Community 59 - "instalar-caddy.test.sh"
Cohesion: 0.32
Nodes (5): armar(), CADDY_FALLA, CAMBIA_VECINO, correr_script(), instalar-caddy.test.sh script

### Community 66 - "revisar-produccion.test.sh"
Cohesion: 0.70
Nodes (4): arrancar(), parar(), revisar(), revisar-produccion.test.sh script

### Community 78 - "imagenes.test.sh"
Cohesion: 0.38
Nodes (3): leer(), imagenes.test.sh script, uso()

### Community 80 - "arranque-local.test.sh"
Cohesion: 0.46
Nodes (6): compose(), desplegar(), limpiar(), mysql_app(), restos_del_proyecto(), arranque-local.test.sh script

## Knowledge Gaps
- **357 isolated node(s):** `name`, `mode`, `source`, `source`, `source` (+352 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 419 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **43 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Arquitectura de AIPOS` connect `Arquitectura de AIPOS` to `requerimientos/README.md`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `Despliegue de AIPOS` connect `Despliegue de AIPOS` to `requerimientos/README.md`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `Documentación de la API` connect `Documentación de la API` to `requerimientos/README.md`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `name`, `mode`, `source` to the rest of the system?**
  _357 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `requerimientos/README.md` be split into smaller, more focused modules?**
  _Cohesion score 0.07084785133565621 - nodes in this community are weakly interconnected._
- **Should `Grafo del proyecto` be split into smaller, more focused modules?**
  _Cohesion score 0.05855855855855856 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
