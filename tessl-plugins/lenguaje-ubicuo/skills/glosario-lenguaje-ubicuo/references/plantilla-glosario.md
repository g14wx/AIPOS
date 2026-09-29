# Plantilla: docs/lenguaje-ubicuo.md

Copia esta estructura. Borra las filas de ejemplo.

```markdown
# Lenguaje ubicuo — <nombre del proyecto>

Estas son las palabras oficiales del proyecto. Se usan igual en la conversación, el código, los tests,
la base de datos, los commits y la documentación. Si el código o la conversación dicen otra cosa,
uno de los dos está mal.

## Convención de nombres en código

- Idioma de los nombres del negocio: <por ejemplo, español, igual que se habla>.
- Lo técnico del framework queda en su idioma original: <por ejemplo, router, controller, props>.
- Formatos: <por ejemplo, modelos en PascalCase (`Venta`), funciones y variables en camelCase
  (`registrarVenta`), tablas y columnas en snake_case plural (`ventas`, `precio_aplicado`)>.
- Los nombres de tablas se fijan de forma explícita. No se deja que el ORM los pluralice en inglés.

## Negocio

| Término | Qué significa | Nombre en código | No decir | Ejemplo |
|---|---|---|---|---|
| Venta | Lo que se le vendió a un cliente en una sola operación, ya guardado. | `Venta`, tabla `ventas` | orden, transacción, sale | "La venta 15 tiene 3 productos." |

## Herramientas y proceso

| Término | Qué significa | No confundir con | Ejemplo |
|---|---|---|---|
| Tile | Paquete de Tessl con reglas y skills para el agente. Tessl ahora lo llama "plugin" y su archivo es `.tessl-plugin/plugin.json`. | Plugin de Claude Code | "El tile lenguaje-ubicuo trae dos reglas." |

## Pendientes (por confirmar)

| Término | Duda | Opciones |
|---|---|---|
| Precio | ¿Hablamos del precio del producto o del precio cobrado en la venta? | "precio" / "precio aplicado" |

## Historial de cambios

| Fecha | Cambio | Motivo |
|---|---|---|
| AAAA-MM-DD | "orden" pasa a llamarse "venta". | Es la palabra que usa el negocio. |
```
