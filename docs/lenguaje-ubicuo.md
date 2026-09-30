# Lenguaje ubicuo — AIPOS

Estas son las palabras oficiales del proyecto. Se usan igual en la conversación, el código, los tests,
la base de datos, los commits y la documentación. Si el código o la conversación dicen otra cosa,
uno de los dos está mal.

Fuente: el documento de la prueba técnica y las decisiones tomadas en conversación.

## Convención de nombres en código

- Los nombres del negocio van en español, igual que se habla: `Producto`, `Venta`, `registrarVenta`.
- Lo técnico del framework queda en inglés: router, controller, props, store.
- Modelos en PascalCase (`Producto`), funciones y variables en camelCase (`codigoBarras`),
  tablas y columnas en snake_case (`productos`, `codigo_barras`).
- Los nombres de tablas se fijan con `tableName`. No se deja que Sequelize los pluralice en inglés.
- Sin tildes ni ñ en nombres de código: "línea" se escribe `linea`.

## Negocio

| Término | Qué significa | Nombre en código | No decir | Ejemplo |
|---|---|---|---|---|
| Cajero | La persona que usa el POS: crea y busca productos, arma la venta actual y la registra. No es un usuario del sistema, porque no hay login. | — (no tiene tabla ni modelo) | usuario, vendedor, operador | "El cajero edita el precio aplicado de la leche." |
| Producto | Algo que se vende en la tienda. Tiene nombre, precio y código de barras. | `Producto`, tabla `productos` | item, artículo, product | "La leche entera es un producto." |
| Nombre | Cómo se llama un producto. Sirve para buscarlo. | columna `nombre` | descripción, title | "Leche entera 1 L" |
| Precio | Lo que cuesta un producto según su registro. | columna `precio` en `productos` | costo, price | "La leche tiene precio 25.00." |
| Código de barras | Número impreso en el producto que se escanea para buscarlo. Se guarda como texto para no perder los ceros de la izquierda. | columna `codigo_barras` | barcode, sku, código a secas | "7501055300075" |
| Crear producto | Dar de alta un producto nuevo desde el botón "Nuevo producto" de la pantalla principal. | `crearProducto` | agregar producto, dar de alta, registrar producto | "El cajero crea el producto 'Leche entera 1 L'." |
| Buscar producto | Encontrar un producto por su nombre o por su código de barras desde el campo de búsqueda. | `buscarProductos` | filtrar, query | "Escribo 'leche' y aparece la leche entera." |
| Venta | Lo que se le vendió a un cliente en una sola operación. | `Venta`, tabla `ventas` | orden, transacción, carrito, sale | "La venta 15 tiene 3 detalles." |
| Venta actual | La venta que el cajero arma en la pantalla antes de registrarla. Se guarda en el navegador (`localStorage`), así que sigue ahí si se recarga la página, y se vacía al registrarla: entonces se vuelve una venta. | `ventaActual` | carrito, venta en curso, ticket, orden | "La venta actual tiene 2 detalles y total 47.00." |
| Agregar a la venta actual | Poner en la venta actual un producto elegido en la búsqueda. Si ya está, su cantidad sube en 1. | `agregarAVentaActual` | añadir, meter al carrito, agregar producto | "Agrego otra leche a la venta actual y su cantidad pasa a 2." |
| Editar el precio aplicado | Cambiar, dentro de la venta actual, el precio aplicado de un detalle. El precio del producto no cambia. Si el valor escrito no es válido, queda como error de un campo del detalle y el detalle conserva su último precio aplicado válido. | `cambiarPrecioAplicado` | cambiar el precio del producto, modificar precio, actualizar precio | "El cajero edita el precio aplicado de la leche de 25.00 a 22.00." |
| Cambiar la cantidad | Subir, bajar o escribir la cantidad de un detalle de la venta actual, con los botones «+» y «−» o con el campo. Va de 1 a 999; para quitar el producto se usa «eliminar detalle». | `cambiarCantidad` | modificar cantidad, actualizar cantidad | "Cambio la cantidad de la leche de 2 a 3." |
| Eliminar detalle | Quitar un detalle de la venta actual con el botón «Eliminar» de su fila. El total se recalcula. Si el producto se agrega otra vez, empieza de nuevo con cantidad 1 y el precio del producto. | `eliminarDetalle` | borrar línea, quitar producto, remover | "Elimino el detalle del pan y la venta actual queda solo con la leche." |
| Detalle de venta | Cada producto dentro de una venta, con su cantidad, su precio aplicado y su subtotal. Un producto tiene un solo detalle por venta, y una venta tiene como máximo 100 detalles. "Los detalles de la venta" son todos juntos. | `DetalleVenta`, tabla `detalles_venta` | línea, item, sale_item, order_line | "La venta 15 tiene un detalle de 2 leches a 22.00." |
| Detalle de la venta actual | Cada producto dentro de la venta actual, con su cantidad, su precio aplicado y su subtotal, antes de registrarla. Al registrar la venta pasa a ser un detalle de venta. | `detalles` (dentro de `ventaActual`) | línea, item, producto del carrito | "La venta actual tiene 2 detalles: 2 leches a 22.00 y 1 pan a 3.50." |
| Error de un campo del detalle | Un valor escrito por el cajero (precio aplicado o cantidad) que no cumple RN-05 o RN-06. Se anota aparte: el detalle conserva su último valor válido y "Registrar venta" se deshabilita hasta corregirlo. | `errores` (dentro de `ventaActual`) | estado inválido, warnings | "Escribir «abc» en la cantidad deja un error en ese detalle, y la cantidad sigue en 2." |
| Cantidad | Cuántas unidades de un producto lleva un detalle de venta. Es un número entero de 1 a 999. | columna `cantidad` en `detalles_venta` | qty, piezas, cant | "2 leches: cantidad 2." |
| Precio aplicado | Lo que se cobra por cada unidad de un producto en una venta. Empieza igual al precio del producto y se puede editar solo dentro de la venta actual; el precio del producto no cambia. | columna `precio_aplicado` en `detalles_venta` | precio de venta, precio cobrado, unit_price | "La leche tiene precio 25.00 pero se cobró a 22.00." |
| Subtotal | Precio aplicado por cantidad en un detalle de venta. | columna `subtotal` en `detalles_venta` | importe, monto, total de la línea | "2 leches a 22.00: subtotal 44.00." |
| Total | Suma de los subtotales de todos los detalles. El total de la venta actual lo calcula la pantalla, solo para mostrarlo; el de la venta lo calcula la base de datos al registrarla, y ese es el que vale. | columna `total` en `ventas` | monto, amount | "Total: 69.50" |
| Fecha de la venta | Día y hora en que se registró la venta. La pone la base de datos al registrarla. | columna `fecha` en `ventas` | created_at, timestamp, fecha de creación | "La venta 15 se registró el 2026-09-29 a las 15:40." |
| Registrar venta | Guardar en la base de datos una venta con todos sus detalles, de una sola vez. Si algo falla, no se guarda nada. | `registrarVenta`, procedimiento `sp_registrar_venta` | guardar venta, persistir, checkout | "Al registrar la venta se guardan sus 3 detalles." |

## Herramientas y proceso

| Término | Qué significa | No confundir con | Ejemplo |
|---|---|---|---|
| Tile | Paquete de Tessl con reglas y skills para el agente. Tessl ahora lo llama "plugin" y su archivo es `.tessl-plugin/plugin.json`, pero aquí decimos "tile". | Plugin de Claude Code | "El tile lenguaje-ubicuo trae dos reglas y una skill." |
| Plugin de Claude Code | Extensión instalada en Claude Code, por ejemplo caveman. No es un tile. Siempre se dice completo, nunca "plugin" a secas. | Tile | "El plugin de Claude Code caveman cambia cómo escribe el agente." |
| Regla | Instrucción de un tile que el agente lee siempre, en cada conversación. | Skill | "La regla de comunicación clara pide empezar por la respuesta." |
| Skill | Instrucción de un tile que el agente carga solo cuando la tarea la necesita. | Regla | "La skill del glosario se usa al nombrar una tabla nueva." |
| Eval | Prueba automática de Tessl: el agente resuelve una tarea con el tile y sin él, y se comparan las notas. | Test del código | "El eval mostró que con el tile el agente usa 'venta' y no 'order'." |
| Agente | Claude Code o Codex trabajando directamente sobre el código del proyecto. | Chat de preguntas | "El agente creó la migración de productos." |
| Entregable | Parte del trabajo que se entrega en su propia rama: base, productos y ventas. | Commit | "El entregable de productos ya está en ProductionEnv." |
| Rama de integración (`ProductionEnv`) | La rama donde se juntan los entregables terminados y queda la versión final. Se llama `ProductionEnv`, exacto, como lo pide la prueba. | `main` | "Se integró el entregable de ventas en ProductionEnv." |
| Rama de entregable | La rama donde se trabaja un entregable: `feature/base`, `feature/productos` o `feature/ventas`. Sale de la rama de integración y no se borra al integrarla. | Rama de integración | "La rama `feature/ventas` sigue existiendo después de integrarla." |
| Rama de tarjeta | La rama donde se trabaja una tarjeta: `<tipo>/<id>-<resumen>`, en minúsculas y con guiones. Sale de la rama de su entregable, su PR va a esa rama y no se borra al integrarla. Las tarjetas sin entregable salen de su destino. La única excepción al nombre es `chore/despliegue`, la de D-01. | Rama de entregable | "`feature/b-02-base-del-backend` es la rama de tarjeta de B-02 y sale de `feature/base`." |
| Pull request (PR) | La solicitud en GitHub para unir una rama con otra. Ahí se ve y se revisa el cambio antes de integrarlo. | Commit | "El PR del entregable de productos va hacia ProductionEnv." |
| Merge commit | Un commit que une dos ramas y deja ver en el historial que existieron por separado. Así se integran los entregables. | Squash (junta todos los commits de una rama en uno y se pierde su historia) | "`Merge: entregable productos`" |
| Etiqueta | Una marca con nombre en un commit (en git se llama tag). Cada entregable integrado lleva una. | Rama; etiqueta de Trello | "La etiqueta `entregable-ventas` marca dónde se integró ventas." |
| Bitácora de IA | El archivo `docs/bitacora-ia.md`: qué hizo el agente en cada tarea, qué revisó o corrigió la persona, qué propuestas se descartaron y cuánto tiempo tomó. | Historial de git | "La bitácora dice que la persona eligió tiles públicos desde el inicio." |
| Conventional Commits | Forma estándar de escribir mensajes de commit: un prefijo en inglés que dice el tipo de cambio (`feat` función nueva, `fix` arreglo, `docs` documentación, `chore` mantenimiento) y una descripción en español. | Mensaje libre | "`feat(ventas): registrar venta con procedimiento almacenado`" |
| MCP | Forma estándar de conectar el agente con herramientas externas, como Trello o Tessl. | Tile | "Con el MCP de Trello el agente lee las tarjetas del tablero AIPOS." |
| Registro de Tessl | El catálogo en línea de Tessl donde se publican los tiles para que otros los instalen. | Repositorio de git | "El tile lenguaje-ubicuo se publica en el registro de Tessl." |
| Workspace de Tessl | El espacio de una cuenta de Tessl donde viven sus tiles y sus evals. Es la primera parte del nombre de un tile. | Carpeta del proyecto | "En `g14wxz/lenguaje-ubicuo`, el workspace es `g14wxz`." |
| Procedimiento almacenado | Una función guardada dentro de MySQL que la app llama por su nombre. "SP" solo después de explicarlo. | Función de JavaScript | "La venta se registra con un procedimiento almacenado." |
| Migración | Un archivo que cambia la base de datos paso a paso. Nunca se edita una que ya se aplicó. | Script suelto de SQL | "La migración 001 crea la tabla productos." |
| Persona desarrolladora | Quien construye AIPOS con el agente: decide, revisa, prueba y aprueba. En la bitácora se le dice "la persona". | Cajero | "La persona desarrolladora aprobó el plan del agente." |
| Agente revisor | El agente que revisa el PR que hizo otro agente. Hoy es Codex con `codex review`. | Agente | "El agente revisor encontró 3 hallazgos en el PR de productos." |
| Orquestador | El agente que coordina las tarjetas de una jornada de trabajo: las reparte a otros agentes, decide lo que la persona desarrolladora le dejó decidir y deja por confirmar lo demás. | Persona desarrolladora; agente revisor | "El orquestador resolvió la pregunta abierta 9 con el consentimiento general de la persona desarrolladora; sigue por confirmar." |
| Requerimiento | Algo que AIPOS tiene que hacer (funcional, "RF") o cumplir (no funcional, "RNF"). Están en `requerimientos/`. | Historia de usuario | "RF-05: editar el precio aplicado." |
| Regla de negocio | Una condición que siempre se cumple, venga de donde venga el dato. Se numera "RN". | Validación de la pantalla | "RN-10: una venta sin detalles no se registra." |
| Criterio de aceptación | Una prueba concreta que dice cuándo una tarjeta está lista. Se escribe "Dado / Cuando / Entonces". | Definición de terminado | "Dado un código de barras repetido, cuando creo el producto, entonces veo el error." |
| Historia de usuario | Una necesidad del cajero en una frase: "Como cajero, quiero…, para…". Se reparte en tarjetas, una por área. | Requerimiento | "Como cajero, quiero buscar un producto por su código de barras, para agregarlo rápido a la venta actual." |
| Flujo | Los pasos de un proceso, uno tras otro, con quién hace cada uno. Cada flujo tiene su diagrama BPMN. | Historia de usuario | "El flujo 04 es registrar venta." |
| Diagrama BPMN | El dibujo de un flujo con la notación estándar BPMN: carriles, tareas, decisiones, inicio y fin. Vive en `requerimientos/diagramas/` y se edita con draw.io. | Diagrama de la base de datos | "El diagrama BPMN 01 muestra qué pasa si el código de barras ya existe." |
| Carril | La franja de un diagrama BPMN con lo que hace un actor, por ejemplo el cajero, la pantalla, la API o MySQL. | Rama de git | "El procedimiento almacenado está en el carril de MySQL." |
| Tablero AIPOS | El tablero de Trello del proyecto, <https://trello.com/b/K5mkgcdl/aipos>, con una lista por estado. No se dice "board". | Repositorio de git | "La tarjeta P-01 está en el backlog del tablero AIPOS." |
| Tarjeta | Una tarea del tablero AIPOS, de una sola área, con descripción, subtareas y criterios de aceptación. Las de la lista "Requerimientos" son de consulta: guardan decisiones, reglas o preguntas y no llevan subtareas ni criterios. No se dice "card". | Commit, PR | "La tarjeta V-02 es el procedimiento `sp_registrar_venta`." |
| Subtarea | Un paso de una tarjeta. En Trello es un elemento del checklist "Subtareas". | Tarjeta | "Crear la migración es una subtarea de P-01." |
| Etiqueta de Trello | La marca de color de una tarjeta. Dice su área (Frontend, Backend, Base de datos, DevOps…) y su entregable. Siempre se dice completo. | Etiqueta (tag de git) | "La tarjeta P-02 lleva la etiqueta de Trello 'Backend'." |
| DevOps | El área que prepara dónde y cómo corre y se entrega el proyecto: GitHub, Docker Compose, ramas y versiones. | Backend | "Crear ProductionEnv es una tarjeta de DevOps." |
| Backlog | La lista del tablero AIPOS con lo que falta hacer, de más a menos prioritario. | Por hacer (lo próximo que se hace) | "La tarjeta V-08 está en el backlog." |
| Definición de terminado | Lo que cumple toda tarjeta antes de pasar a "Hecho": criterios de aceptación, pruebas, revisión, bitácora e integración. | Criterio de aceptación | "Sin su entrada en la bitácora, la tarjeta no cumple la definición de terminado." |
| Spec | El archivo `specs/<tema>.spec.md`: qué tiene que hacer una parte del proyecto, qué archivos cubre (`targets`) y qué pruebas lo verifican (`[@test]`). Se aprueba antes de escribir el código. La pide el tile `spec-driven-development`. | Requerimiento, tarjeta | "La spec del grafo del proyecto cubre el tile y el hook de git." |
| SDD | Desarrollo guiado por specs (en inglés, Spec-Driven Development). Primero se escribe la spec y la persona desarrolladora la aprueba; después el agente escribe el código y las pruebas que la cumplen. AIPOS lo sigue con el tile `spec-driven-development`. | Requerimiento, tarjeta | "Con SDD, la tarjeta P-01 no empieza el código hasta que se aprueba la spec de crear producto." |
| Grafo del proyecto | El mapa que arma Graphify en `graphify-out/`: qué archivos, funciones, documentos y specs hay y cómo se conectan. El agente lo consulta antes de empezar una tarea, y el hook de git `pre-commit` lo actualiza en cada commit. | Diagrama BPMN, bitácora de IA | "Antes de tocar ventas, el agente le preguntó al grafo del proyecto qué llama a `sp_registrar_venta`." |
| Hook de git | Un script que git corre solo en un momento fijo. AIPOS usa `pre-commit`, en `.githooks/pre-commit`, que corre justo antes de cada commit, y `pre-merge-commit`, que hace lo mismo en los merges sin choques. Siempre se dice completo, nunca "hook" a secas. | Hook de Claude Code | "El hook de git `pre-commit` agregó el grafo del proyecto al commit." |
| Hook de Claude Code | Un comando que Claude Code corre solo antes o después de usar una herramienta. El de Graphify le recuerda al agente consultar el grafo del proyecto. Vive en `.claude/settings.json` y va a git. Siempre se dice completo. | Hook de git | "Antes de buscar con grep, el hook de Claude Code le recordó al agente consultar el grafo." |
| Issue de GitHub | El aviso de un bug en GitHub, con los pasos para reproducirlo. Se cierra con un comentario que nombra el commit que lo corrige. | Tarjeta (del tablero AIPOS) | "El issue del precio con 3 decimales explica cómo repetir el error." |
| Prueba en local | Probar un cambio con el sistema corriendo en la máquina de quien trabaja, además de las pruebas automáticas: la API con `curl` contra el backend corriendo y la pantalla en el navegador con el MCP `chrome-devtools`. | Prueba automática (`npm test`) | "La prueba en local de crear producto manda un `curl` con el precio "10.999" y espera un 400." |
| Base de prueba | La base de datos MySQL separada (`aipos_prueba`) donde corren las pruebas automáticas del backend. Nunca es la base donde se trabaja. | La base de desarrollo (`aipos`) | "`npm test` migra la base de prueba y no toca los productos de la base de desarrollo." |
| Documentación de la API | El documento OpenAPI 3 del backend (`backend/docs/openapi.yaml`) y la página de Swagger UI en `GET /api/docs` que lo muestra. Describe cada ruta de la API, lo que recibe, lo que responde y su formato de error. Swagger UI es la página y OpenAPI es el formato: no se dice "Swagger" a secas ni "doc de la API". | Los comentarios del código | "La ruta de crear producto está en la documentación de la API." |
| Formato de error | La forma única de toda respuesta de error de la API: `{ "error": { "codigo", "mensaje", "detalles" } }`. Está descrita en la spec de arquitectura y en el esquema `RespuestaDeError` de la documentación de la API. | Un error de MySQL, que nunca sale tal cual al cliente | "El formato de error del 409 lleva el código `CODIGO_BARRAS_DUPLICADO`." |
| Detalles del error | La lista `detalles` del formato de error: un elemento por campo con problema, con su `campo` y su `mensaje`. Solo viene en los 400 y en el 409 del código de barras repetido. Siempre se dice completo, porque «detalles» a secas también nombra los detalles de una venta. | Detalle de venta | "El 400 del precio con 3 decimales trae un detalle del error para el campo `precio`." |
| Desplegar | Poner en producción una versión que ya pasó las pruebas. En código es `despliegue/desplegar.sh`. No se dice "deployar" ni "subir a producción". | Integrar (unir una rama con otra con un pull request) | "El pipeline despliega `release-0.1.0` en el servidor." |
| Producción | El servidor real donde el público usa AIPOS: `aipos.salsalvador.io`. Su environment de GitHub se llama `production`. No se dice "prod" ni "servidor en vivo". | La rama `ProductionEnv`, que es la rama de integración | "La pantalla de producción llama a `aipos-back.salsalvador.io`." |
| Pipeline | La cadena de pasos automáticos de GitHub Actions que revisa, prueba, construye y despliega. En código es el workflow `despliegue.yml`. | Un hook de git (corre en la máquina de quien trabaja, antes de un commit) | "El pipeline falló en las pruebas del backend y no desplegó." |
| Etiqueta `release-*` | La etiqueta de git `release-MAYOR.MENOR.PARCHE` (por ejemplo `release-0.1.0`) que arranca el pipeline. Solo la persona desarrolladora puede crearla. | La etiqueta `entregable-<x>` y la etiqueta de Trello | "Subí la etiqueta `release-0.2.0` con productos." |
| Volver a la versión anterior | Dejar en producción la versión que corría antes del último despliegue, cuando algo sale mal. En código es `despliegue/desplegar.sh volver`. No deshace las migraciones. No se dice «rollback». | Desplegar (poner una versión nueva) | "El paso 5 del pipeline vuelve a la versión anterior si `revisar-produccion.sh` falla." |

## Pendientes (por confirmar)

Términos que proponen las specs de la noche del 2026-09-30. La persona desarrolladora los aprueba, o los cambia, cuando aprueba el lote de specs. Hasta entonces son propuestas:

- Del glosario de S-01: el texto de "SDD" (la tarjeta no trae el texto que aprobó la persona).
- De armar la venta actual: "detalle de la venta actual" y "error de un campo del detalle".
- De la documentación de la API: "documentación de la API" y "formato de error".
- Del despliegue: "desplegar", "producción", "pipeline" y "etiqueta `release-*`".
- Del ajuste de las specs (S-02): "editar el precio aplicado", "cambiar la cantidad", "eliminar detalle", "volver a la versión anterior", "detalles del error" y "orquestador"; el máximo de 100 detalles por venta (pregunta abierta 9).

Las dudas de reglas de negocio están en `requerimientos/README.md`.

## Historial de cambios

| Fecha | Cambio | Motivo |
|---|---|---|
| 2026-09-29 | Se crea el glosario. "Tile" es el término oficial para los paquetes de Tessl; "plugin" a secas queda prohibido. | Confundimos el tile de Tessl con el plugin de Claude Code caveman. |
| 2026-09-29 | Se confirman "detalle de venta", "precio aplicado" y "registrar venta". | "Detalle" y "registrar" son las palabras del PDF; "precio aplicado" evita confundirlo con el precio del producto. |
| 2026-09-29 | Se agregan los términos de entrega (rama de integración, rama de entregable, pull request, merge commit, etiqueta, bitácora de IA y Conventional Commits) y MCP. "ProductionEnv" pasa a ser el nombre de la rama de integración. | Los usa el tile entrega-trazable. |
| 2026-09-29 | Se agregan "registro de Tessl" y "workspace de Tessl". | Los usa la guía de Tessl. |
| 2026-09-29 | Se confirman "cajero", "crear producto", "venta actual", "agregar a la venta actual", "cantidad", "subtotal" y "fecha de la venta". Cambian "código de barras", "detalle de venta", "precio aplicado" y "total". | Decisiones de la persona al levantar los requerimientos. "Agregar" nombraba dos cosas en el PDF (crear un producto y ponerlo en la venta), y el PDF pide ver el total antes de registrar la venta. |
| 2026-09-29 | Se agregan los términos de requerimientos (requerimiento, regla de negocio, criterio de aceptación, historia de usuario, flujo, diagrama BPMN, carril), del tablero (tablero AIPOS, tarjeta, subtarea, etiqueta de Trello, DevOps, backlog, definición de terminado) y los actores del proceso (persona desarrolladora, agente revisor). "Entregable" suma "base". | Los usan `requerimientos/` y el tablero AIPOS. "Etiqueta" ya era el tag de git, por eso la de Trello se dice completa. |
| 2026-09-29 | Se aclara "tarjeta": las de la lista "Requerimientos" son de consulta y no llevan subtareas ni criterios de aceptación. | R-01 a R-04 guardan decisiones, reglas o preguntas, no tareas. Decisión de la persona al cerrar R-00. |
| 2026-09-29 | Se agregan "spec", "grafo del proyecto", "hook de git" y "hook de Claude Code". "Hook" nunca se dice a secas. | Los usan el tile grafo-del-proyecto y la spec `specs/grafo-del-proyecto.spec.md`. La persona eligió "grafo del proyecto" y confirmó las cuatro entradas. |
| 2026-09-30 | Se agregan "SDD", "rama de tarjeta", "issue de GitHub", "prueba en local" y "base de prueba". "Venta actual" ya no se pierde al recargar: se guarda en el navegador hasta registrarla. | Los usan `specs/arquitectura.spec.md` y `AGENTS.md`. La persona decidió el 2026-09-30 que la venta actual no se pierde al recargar (pregunta abierta 2 de `requerimientos/README.md`). "SDD" y "spec" venían de la tarjeta S-01. |
| 2026-09-30 | Se agregan "detalle de la venta actual", "error de un campo del detalle", "documentación de la API", "formato de error", "desplegar", "producción", "pipeline" y "etiqueta `release-*`". | Los proponen las specs de esta noche (armar la venta actual, documentación de la API y despliegue); la persona los aprueba con el lote. |
| 2026-09-30 | Se agregan «editar el precio aplicado», «cambiar la cantidad», «eliminar detalle», «volver a la versión anterior», «detalles del error» y «orquestador». «Cantidad» pasa a ser un entero de 1 a 999. «Detalle de venta» dice que una venta tiene como máximo 100 detalles. | Los usan las specs de armar la venta actual, arquitectura y despliegue, y las ajusta la tarjeta S-02 tras la revisión cruzada. La cantidad de 1 a 999 es la pregunta abierta 4, resuelta el 2026-09-30. El máximo de 100 detalles y «orquestador» son propuestas por confirmar con la persona desarrolladora. |
