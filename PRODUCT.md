# Product

<!-- impeccable:product-schema 1 -->

> Contexto de producto para la skill `impeccable`. No hubo entrevista con la persona desarrolladora: lo escribió el
> agente a partir de `requerimientos/` y de `specs/arquitectura.spec.md`. Lo que no sale de esos documentos va marcado
> "(por confirmar)".

## Platform

web

## Users

El cajero de una tienda. Atiende a un cliente frente a él, con prisa y con la atención puesta en el cliente y no en la
pantalla. Crea productos, busca productos por nombre o por código de barras, arma la venta actual y la registra. No hay
login ni más roles. Usa una computadora o una tableta en la tienda (por confirmar) y a veces el teléfono.

## Product Purpose

AIPOS es un punto de venta de una sola pantalla: el cajero crea y busca productos, arma la venta actual y registra la
venta. El éxito es registrar una venta en pocos segundos, sin errores de dinero y sin perder lo que escribió.

## Positioning

Todo pasa en una sola pantalla (RNF-01): no hay rutas ni páginas aparte, y el formulario de producto se abre en un
modal encima de ella. El total de la pantalla es solo para mostrar; el que vale lo calcula MySQL al registrar la venta.

## Operating Context

- El cajero teclea o escanea un código de barras en el campo de búsqueda, elige un producto y este se agrega a la
  venta actual. Puede cambiar el precio aplicado y la cantidad de cada detalle, o eliminarlo.
- La venta actual se guarda en el navegador: si se recarga la página sigue igual, y se vacía al registrar la venta.
- Un error nunca borra lo escrito ni la venta actual (RNF-05).
- Los precios se ven con 2 decimales y sin símbolo de moneda.

## Capabilities and Constraints

- Frontend: Vue 2.7, Vuetify 2.7 con su CSS ya compilado, Vite 7 y lottie-web (`specs/arquitectura.spec.md`).
- Los nombres salen del glosario (`docs/lenguaje-ubicuo.md`): cajero, producto, venta actual, detalle de la venta actual,
  precio aplicado, cantidad, subtotal, total, registrar venta. No se dice carrito, ticket, orden ni línea.
- Los textos de la pantalla van en español, con frases cortas.
- Sin `v-html` con datos del cajero (RNF-04).

## Brand Commitments

- El nombre es AIPOS.
- La paleta es de la persona desarrolladora y ya está fijada en la spec de arquitectura: `#292F36`, `#4ECDC4`,
  `#F7FFF7`, `#FF6B6B` y `#FFE66D`. El quinto color es un supuesto, porque la persona mandó `#FF6B6B` repetido (por
  confirmar). El texto es `#292F36` y nunca blanco sobre `#4ECDC4`.

## Evidence on Hand

Solo hay requerimientos y specs. No hay logo, ni capturas, ni datos reales de una tienda: no se inventan clientes,
precios reales ni cifras. Los productos de ejemplo de las pruebas son de mentira.

## Product Principles

1. El total y la venta actual siempre a la vista: el cajero nunca busca cuánto va a cobrar.
2. Una acción principal por momento, y las demás quietas.
3. Un error dice qué pasó y qué hacer, y nunca borra lo escrito.
4. El dinero es exacto: 2 decimales, el mismo formato en todas partes.
5. Familiar antes que original: es una herramienta de trabajo que debe desaparecer dentro de la tarea.

## Accessibility & Inclusion

Contraste AA (4.5 o más) en todo texto, manejo con teclado, foco visible y diseño que funcione en móvil
(`specs/arquitectura.spec.md`, "Diseño de la pantalla"). Con `prefers-reduced-motion: reduce` no hay animación.
