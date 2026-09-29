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
| Producto | Algo que se vende en la tienda. Tiene nombre, precio y código de barras. | `Producto`, tabla `productos` | item, artículo, product | "La leche entera es un producto." |
| Nombre | Cómo se llama un producto. Sirve para buscarlo. | columna `nombre` | descripción, title | "Leche entera 1 L" |
| Precio | Lo que cuesta un producto según su registro. | columna `precio` en `productos` | costo, price | "La leche tiene precio 25.00." |
| Código de barras | Número impreso en el producto que se escanea para buscarlo. | columna `codigo_barras` | barcode, sku, código a secas | "7501055300075" |
| Buscar producto | Encontrar un producto por su nombre o por su código de barras desde el campo de búsqueda. | `buscarProductos` | filtrar, query | "Escribo 'leche' y aparece la leche entera." |
| Venta | Lo que se le vendió a un cliente en una sola operación. | `Venta`, tabla `ventas` | orden, transacción, carrito, sale | "La venta 15 tiene 3 detalles." |
| Detalle de venta | Cada producto dentro de una venta, con su precio aplicado. "Los detalles de la venta" son todos juntos. | `DetalleVenta`, tabla `detalles_venta` | línea, item, sale_item, order_line | "La venta 15 tiene un detalle de leche a 22.00." |
| Precio aplicado | Lo que se cobró por un producto en una venta. Empieza igual al precio del producto y se puede editar solo dentro de la venta; el precio del producto no cambia. | columna `precio_aplicado` en `detalles_venta` | precio de venta, precio cobrado, unit_price | "La leche tiene precio 25.00 pero se cobró a 22.00." |
| Total | Suma de los precios aplicados de todos los detalles de una venta. Lo calcula la base de datos, no la pantalla. | columna `total` en `ventas` | monto, amount | "Total: 69.50" |
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
| Entregable | Parte del trabajo que se entrega en su propia rama: productos y ventas. | Commit | "El entregable de productos ya está en ProductionEnv." |
| Rama de integración (`ProductionEnv`) | La rama donde se juntan los entregables terminados y queda la versión final. Se llama `ProductionEnv`, exacto, como lo pide la prueba. | `main` | "Se integró el entregable de ventas en ProductionEnv." |
| Rama de entregable | La rama donde se trabaja un entregable: `feature/productos` o `feature/ventas`. Sale de la rama de integración y no se borra al integrarla. | Rama de integración | "La rama `feature/ventas` sigue existiendo después de integrarla." |
| Pull request (PR) | La solicitud en GitHub para unir una rama con otra. Ahí se ve y se revisa el cambio antes de integrarlo. | Commit | "El PR del entregable de productos va hacia ProductionEnv." |
| Merge commit | Un commit que une dos ramas y deja ver en el historial que existieron por separado. Así se integran los entregables. | Squash (junta todos los commits de una rama en uno y se pierde su historia) | "`Merge: entregable productos`" |
| Etiqueta | Una marca con nombre en un commit (en git se llama tag). Cada entregable integrado lleva una. | Rama | "La etiqueta `entregable-ventas` marca dónde se integró ventas." |
| Bitácora de IA | El archivo `docs/bitacora-ia.md`: qué hizo el agente en cada tarea, qué revisó o corrigió la persona, qué propuestas se descartaron y cuánto tiempo tomó. | Historial de git | "La bitácora dice que la persona eligió tiles públicos desde el inicio." |
| Conventional Commits | Forma estándar de escribir mensajes de commit: un prefijo en inglés que dice el tipo de cambio (`feat` función nueva, `fix` arreglo, `docs` documentación, `chore` mantenimiento) y una descripción en español. | Mensaje libre | "`feat(ventas): registrar venta con procedimiento almacenado`" |
| MCP | Forma estándar de conectar el agente con herramientas externas, como Trello o Tessl. | Tile | "Con el MCP de Trello el agente lee las tarjetas del tablero AIPOS." |
| Procedimiento almacenado | Una función guardada dentro de MySQL que la app llama por su nombre. "SP" solo después de explicarlo. | Función de JavaScript | "La venta se registra con un procedimiento almacenado." |
| Migración | Un archivo que cambia la base de datos paso a paso. Nunca se edita una que ya se aplicó. | Script suelto de SQL | "La migración 001 crea la tabla productos." |

## Pendientes (por confirmar)

| Término | Duda | Opciones |
|---|---|---|
| Venta en pantalla | La venta que se arma en pantalla antes de guardarla, ¿tiene nombre propio? | "venta actual" / "venta en curso" / solo "venta" |
| Cantidad | La prueba no la pide. Si agregas el mismo producto dos veces, ¿se suma una cantidad o aparece otra fila? | Con cantidad / Sin cantidad (una fila por unidad) |

## Historial de cambios

| Fecha | Cambio | Motivo |
|---|---|---|
| 2026-09-29 | Se crea el glosario. "Tile" es el término oficial para los paquetes de Tessl; "plugin" a secas queda prohibido. | Confundimos el tile de Tessl con el plugin de Claude Code caveman. |
| 2026-09-29 | Se confirman "detalle de venta", "precio aplicado" y "registrar venta". | "Detalle" y "registrar" son las palabras del PDF; "precio aplicado" evita confundirlo con el precio del producto. |
| 2026-09-29 | Se agregan los términos de entrega (rama de integración, rama de entregable, pull request, merge commit, etiqueta, bitácora de IA y Conventional Commits) y MCP. "ProductionEnv" pasa a ser el nombre de la rama de integración. | Los usa el tile entrega-trazable. |
