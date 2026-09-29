# Lenguaje ubicuo — Caja de la tienda

Estas son las palabras oficiales del proyecto. Se usan igual en la conversación, el código, los tests,
la base de datos, los commits y la documentación.

## Convención de nombres en código

- Los nombres del negocio van en español, igual que se habla.
- Lo técnico del framework queda en inglés (router, controller, props).
- Modelos en PascalCase (`Venta`), funciones y variables en camelCase (`registrarVenta`),
  tablas y columnas en snake_case plural (`ventas`, `precio_aplicado`).
- Los nombres de tablas se fijan con `tableName`. No se deja que Sequelize los pluralice en inglés.

## Negocio

| Término | Qué significa | Nombre en código | No decir | Ejemplo |
|---|---|---|---|---|
| Producto | Algo que la tienda vende. Tiene nombre, precio y código de barras. | `Producto`, tabla `productos` | item, artículo, product | "La leche entera es un producto." |
| Precio | Lo que cuesta un producto según el catálogo. | columna `precio` en `productos` | costo, price | "La leche tiene precio 25.00." |
| Código de barras | Número impreso en el producto que se escanea para buscarlo. | columna `codigo_barras` | barcode, sku | "7501055300075" |
| Venta | Lo que se le vendió a un cliente en una sola operación, ya registrado. | `Venta`, tabla `ventas` | orden, transacción, carrito, sale | "La venta 15 tiene 3 líneas." |
| Línea de venta | Cada producto dentro de una venta, con su precio aplicado. | `LineaVenta`, tabla `lineas_venta` | detalle, item, sale_item, order_line | "La venta 15 tiene una línea de leche a 22.00." |
| Precio aplicado | Lo que se cobró por un producto en una venta. Puede ser distinto del precio. | columna `precio_aplicado` en `lineas_venta` | precio de venta, unit_price | "La leche cuesta 25.00 pero se cobró a 22.00." |
| Total | Suma de los precios aplicados de todas las líneas de una venta. | columna `total` en `ventas` | monto, amount | "Total: 69.50" |
| Registrar venta | Guardar una venta con todas sus líneas de una sola vez. | `registrarVenta`, procedimiento `sp_registrar_venta` | guardar orden, checkout | "Al registrar la venta se guardan sus 3 líneas." |

## Herramientas y proceso

| Término | Qué significa | No confundir con | Ejemplo |
|---|---|---|---|
| Procedimiento almacenado | Una función guardada dentro de MySQL que la app llama por su nombre. | Función de JavaScript | "`sp_registrar_venta` es un procedimiento almacenado." |
| Migración | Un archivo que cambia la base de datos paso a paso. Nunca se edita una ya aplicada. | Script suelto de SQL | "La migración 002 crea la tabla ventas." |

## Pendientes (por confirmar)

| Término | Duda | Opciones |
|---|---|---|

## Historial de cambios

| Fecha | Cambio | Motivo |
|---|---|---|
| 2026-09-01 | "orden" pasa a llamarse "venta". | Es la palabra que usa el negocio. |
