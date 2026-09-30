---
name: Armar la venta actual
description: La venta actual en la pantalla (agregar, precio aplicado, cantidad, eliminar, subtotales y total en centavos) y su copia en el navegador, con la lógica fuera de los componentes
targets:
  - ../frontend/src/ventaActual/ventaActual.js
  - ../frontend/src/ventaActual/validaciones.js
  - ../frontend/src/ventaActual/almacenamiento.js
  - ../frontend/src/components/VentaActual.vue
  - ../frontend/src/components/CampoPrecioAplicado.vue
  - ../frontend/src/components/CampoCantidad.vue
  - ../frontend/src/App.vue
  - ../frontend/src/assets/animaciones/venta-vacia.json
---

# Armar la venta actual

Esta spec cubre el flujo 03 (`requerimientos/flujos/03-armar-la-venta-actual.md`): el cajero elige un producto en la
búsqueda, lo ve en la venta actual, cambia su precio aplicado o su cantidad, lo elimina si se equivocó y siempre ve el
total. Nada llega a la API ni a MySQL hasta registrar la venta (flujo 04, spec `registrar-venta`). La venta actual se
guarda en el navegador y sigue ahí si se recarga la página.

Se apoya en `specs/arquitectura.spec.md` y no repite lo que ya dice: las versiones, la carpeta `src/ventaActual/`, el
dinero en centavos con `src/dinero.js`, la paleta y los contrastes, Lottie, el flujo de pruebas en local y las reglas de
Git. Si esta spec choca con `requerimientos/` o con la spec de arquitectura, mandan ellos.

Los ejemplos de código no son el código final: lo escriben las tarjetas V-04 a V-07, y esas pruebas son las que enlazan
los `[@test]`.

## Quién implementa qué

Una sola pantalla, cuatro tarjetas en orden. Cada una depende de la anterior.

| Parte | Tarjeta | Qué se entrega |
|---|---|---|
| Módulo `src/ventaActual/`: `agregarAVentaActual`, subtotales, `calcularTotal`, `ventaActualEsValida`, `detallesParaRegistrar`, `vaciarVentaActual` | V-04 | Frontend |
| `almacenamiento.js`: guardar la venta actual en el navegador, leerla al abrir y vaciarla | V-04 | Frontend |
| `VentaActual.vue`: tabla de detalles, total siempre a la vista, venta actual vacía (con `venta-vacia.json`) y un botón provisional «Registrar venta» | V-04 | Frontend |
| Conectar `producto-elegido` de `BuscadorProductos.vue` con `agregarAVentaActual` en `App.vue` | V-04 | Frontend |
| `cambiarPrecioAplicado`, `validarPrecioAplicado` y `CampoPrecioAplicado.vue` | V-05 | Frontend |
| `cambiarCantidad`, `validarCantidad` y `CampoCantidad.vue` (botones «+» y «−» y campo) | V-06 | Frontend |
| `eliminarDetalle` y el botón «Eliminar» de cada detalle | V-07 | Frontend |

- V-04 depende de P-05 (`BuscadorProductos.vue`, que emite `producto-elegido`) y de B-04 (`App.vue`, `AnimacionLottie.vue`,
  `src/dinero.js`). V-05, V-06 y V-07 dependen de V-04.
- El botón «Registrar venta» de verdad lo hace V-08 (`RegistrarVenta.vue`, spec `registrar-venta`). V-04 deja en su lugar un
  botón provisional con el mismo texto que solo se deshabilita cuando la venta actual no es válida; V-08 lo reemplaza sin
  tocar el módulo (ver "Lo que V-08 espera de esta spec").
- No hay ruta nueva en la API ni tabla nueva. Esta spec no tiene contrato HTTP: lo que arma el cajero vive solo en la pantalla
  hasta que V-08 lo manda.

## Reglas de negocio

Salen de RF-03 a RF-08, RN-05 a RN-09 y RN-14, y de las decisiones de la persona desarrolladora del 2026-09-30 (preguntas
abiertas 1, 2, 4 y 6 de `requerimientos/README.md`). RN-14 sale de la pregunta abierta 9, que resolvió el orquestador el
2026-09-30 y que la persona desarrolladora puede confirmar o revertir.

- **RN-05.** El precio aplicado empieza igual al precio del producto. Cambiarlo no cambia el precio del producto: la
  pantalla nunca llama a la API para esto. Es 0 o más, hasta 99 999.99, con 2 decimales como máximo. **El 0 se permite**
  (por ejemplo, para regalar un producto).
- **RN-06.** La cantidad es un número entero de 1 a 999.
- **RN-07.** Un producto tiene un solo detalle en la venta actual. Si se agrega otra vez, su cantidad sube en 1.
- **RN-08.** Subtotal = precio aplicado × cantidad. Total = suma de los subtotales.
- **RN-09.** El total de la pantalla es solo para mostrar. El que vale lo calcula MySQL al registrar la venta.
- **RN-14.** Una venta tiene como máximo 100 detalles. Con el producto 101, la pantalla no lo agrega y avisa «Una venta
  puede tener como máximo 100 productos.». Es la misma regla que aplican la API y el procedimiento de registrar venta
  (spec `registrar-venta`), y evita que el total pase de `DECIMAL(12,2)`.
- **Dinero.** Los precios aplicados, los subtotales y el total se calculan en centavos (números enteros) con
  `src/dinero.js` y se muestran con 2 decimales, sin símbolo de moneda y sin separador de miles (`47.50`,
  `99899990.01`), igual que la API. Nunca se suman ni se multiplican decimales de JavaScript.
- **Persistencia.** La venta actual se guarda en `localStorage`, se recupera al abrir la pantalla y se vacía cuando la API
  confirma la venta (V-08). Todo acceso va dentro de `try/catch`: si el navegador no deja guardar, la venta sigue en memoria.
- **Un error no borra la venta actual.** Un precio aplicado o una cantidad inválidos bloquean «Registrar venta»; no quitan
  ni cambian el detalle.

## La venta actual: los datos

La venta actual es un objeto que el módulo nunca modifica: cada función recibe uno y devuelve otro nuevo. El componente
guarda el nuevo entero y así Vue 2 detecta el cambio.

```js
// Venta actual con la leche (2 a 22.00) y el pan (1 a 3.50), y una cantidad inválida escrita en el pan:
{
  detalles: [
    { productoId: 1, nombre: 'Leche entera 1 L', precioAplicado: '22.00', cantidad: 2 },
    { productoId: 2, nombre: 'Pan de caja', precioAplicado: '3.50', cantidad: 1 },
  ],
  errores: { 2: { cantidad: 'La cantidad debe ser un número entero de 1 a 999.' } },
}
```

- `detalles` va en el orden en que se agregaron los productos. Cada detalle tiene `productoId` (entero, el `id` del
  producto), `nombre` (texto), `precioAplicado` (texto con 2 decimales, como el dinero de la API) y `cantidad` (entero de 1
  a 999). Son los tres datos que V-08 manda a la API, más el nombre para mostrarlo.
- `errores` dice qué campos tienen un valor escrito que no se pudo aceptar. Su forma es
  `{ [productoId]: { precioAplicado?: <mensaje>, cantidad?: <mensaje> } }`. El detalle conserva su último valor válido, y el
  texto que escribió el cajero lo muestra el campo. Si no hay errores es `{}`. `errores` no se guarda en el navegador.
- Una venta actual vacía es `{ detalles: [], errores: {} }`. Nunca `null` ni `undefined`: así ningún código tiene que
  preguntar si existe.
- No hay dos detalles con el mismo `productoId` (RN-07).

## El módulo (`src/ventaActual/`)

Funciones puras (sin Vue, sin `axios`, sin `localStorage`, sin fechas ni azar), en `ventaActual.js` y `validaciones.js`. Reciben
la venta actual y devuelven una nueva. Ninguna modifica lo que recibe.

```js
agregarAVentaActual(venta, producto)               // producto: { id, nombre, precio, ... } de la búsqueda
cambiarPrecioAplicado(venta, productoId, texto)    // V-05
cambiarCantidad(venta, productoId, valor)          // V-06
eliminarDetalle(venta, productoId)                 // V-07
calcularSubtotal(detalle)                          // centavos (entero)
calcularTotal(venta)                               // centavos (entero)
ventaActualEsValida(venta)                         // boolean
detallesParaRegistrar(venta)                       // [{ productoId, cantidad, precioAplicado }]
vaciarVentaActual()                                // { detalles: [], errores: {} }
validarPrecioAplicado(texto)                       // { valido, valor | mensaje }   (validaciones.js)
validarCantidad(valor)                             // { valido, valor | mensaje }   (validaciones.js)
```

- Ninguna función modifica su argumento. Las pruebas pasan la venta actual congelada (`Object.freeze` en todos los niveles):
  si la función intenta modificarla, lanza un error y la prueba falla. Cada archivo de prueba de abajo lo comprueba con
  las funciones que prueba.
- Las funciones que reciben un `productoId` que no está en la venta actual devuelven **la misma venta** (la misma
  referencia), sin error: el cajero pudo eliminar el detalle un instante antes.
  `[@test] ../frontend/tests/venta-actual/precio-aplicado.test.js`
  `[@test] ../frontend/tests/venta-actual/cantidad.test.js`
  `[@test] ../frontend/tests/venta-actual/eliminar.test.js`

### `agregarAVentaActual` (V-04)

- Si el producto no está, agrega al final un detalle con `productoId` igual al `id` del producto, su `nombre`,
  `precioAplicado` igual al `precio` del producto y `cantidad` 1.
  `[@test] ../frontend/tests/venta-actual/agregar.test.js`
- Si ya está, sube su `cantidad` en 1 y deja igual su precio aplicado (aunque el cajero lo haya cambiado) y su lugar en la
  lista. Sigue habiendo un solo detalle de ese producto (RN-07).
  `[@test] ../frontend/tests/venta-actual/agregar.test.js`
- Si la cantidad ya es 999, no la sube: devuelve **la misma venta**. `App.vue` lo nota (`nueva === anterior`) y avisa al
  cajero (ver "`App.vue`").
  `[@test] ../frontend/tests/venta-actual/agregar.test.js`
- Si el producto no está y la venta actual ya tiene 100 detalles (RN-14), no lo agrega: devuelve **la misma venta**, y
  `App.vue` avisa al cajero igual que con la cantidad 999.
  `[@test] ../frontend/tests/venta-actual/agregar.test.js`
- Si el detalle tenía un error de cantidad escrito, al subir su cantidad ese error se quita: el campo vuelve a mostrar el
  valor válido.
  `[@test] ../frontend/tests/venta-actual/agregar.test.js`
- Un producto sin `id` entero de 1 o más, sin `nombre` de texto o con un `precio` que no sea texto con la forma del dinero
  (`^\d{1,5}(\.\d{1,2})?$`, como lo devuelve la API) lanza un `Error`: es un fallo de programación, no un caso del cajero.
  `[@test] ../frontend/tests/venta-actual/agregar.test.js`
- Agregar no cambia el producto que recibe ni toca la API: el precio del producto sigue siendo el de MySQL (RN-05).
  `[@test] ../frontend/tests/venta-actual/agregar.test.js`

### Subtotales y total (V-04)

- `calcularSubtotal(detalle)` devuelve `aCentavos(precioAplicado) × cantidad`, en centavos. `calcularTotal(venta)` devuelve la
  suma de los subtotales, en centavos, y `0` si no hay detalles. La pantalla los muestra con `formatearCentavos`.
  `[@test] ../frontend/tests/venta-actual/calculos.test.js`
- Casos que rompen con números decimales de JavaScript: `0.10 × 3 + 0.20` da `0.50` (no `0.5000000000000001`), y `1.15 × 3`
  da `3.45` (no `3.4499999999999997`).
  `[@test] ../frontend/tests/venta-actual/calculos.test.js`
- El caso más grande cabe sin perder centavos: `99999.99 × 999` da `99899990.01`, y la suma de dos así da `199799980.02`.
  `[@test] ../frontend/tests/venta-actual/calculos.test.js`
- Un precio aplicado de `0.00` da subtotal `0.00`.
  `[@test] ../frontend/tests/venta-actual/calculos.test.js`
- El módulo depende de que `aCentavos` entienda cualquier texto con la forma del dinero, también sin decimales (`"22"` da
  `2200`) y con uno (`"22.5"` da `2250`), y de que `formatearCentavos` complete los 2 decimales. La prueba de V-04 lo
  comprueba; si `src/dinero.js` de B-04 no lo hace, V-04 lo corrige en el mismo PR y lo anota.
  `[@test] ../frontend/tests/venta-actual/calculos.test.js`

### Validez, registro y vaciado (V-04)

- `ventaActualEsValida(venta)` es `true` solo si hay de 1 a 100 detalles y `errores` está vacío (RN-10 y RN-14). Una
  venta actual con solo productos a 0.00 es válida.
  `[@test] ../frontend/tests/venta-actual/valida-y-registro.test.js`
- `detallesParaRegistrar(venta)` devuelve, para cada detalle y en su orden, `{ productoId, cantidad, precioAplicado }` con
  la cantidad como número entero y el precio aplicado como texto con 2 decimales. Sin el nombre ni otro campo. Es lo que
  `RegistrarVenta.vue` (V-08) le manda a `registrarVenta`.
  `[@test] ../frontend/tests/venta-actual/valida-y-registro.test.js`
- `vaciarVentaActual()` devuelve una venta actual vacía nueva cada vez (no un objeto compartido que alguien pueda cambiar).
  `[@test] ../frontend/tests/venta-actual/valida-y-registro.test.js`

### `cambiarPrecioAplicado` y `validarPrecioAplicado` (V-05)

`validarPrecioAplicado(texto)` recorta los espacios de los extremos y aplica RN-05:

| Texto | Resultado |
|---|---|
| `"22"`, `"22.5"`, `"22.50"`, `"0"`, `"0.00"`, `"99999.99"`, `" 22.50 "`, `"00022"` | válido, con `valor` de 2 decimales: `"22.00"`, `"22.50"`, `"22.50"`, `"0.00"`, `"0.00"`, `"99999.99"`, `"22.50"`, `"22.00"` |
| `""` o solo espacios | `mensaje`: «Escribe un precio aplicado.» |
| `"22.999"`, `"1.234"` | `mensaje`: «Usa hasta 2 decimales.» |
| `"-1"`, `"abc"`, `"2,5"`, `"1e3"`, `"100000"`, `"100000.00"`, `"22."`, `".5"` | `mensaje`: «El precio aplicado debe ser un número de 0 a 99 999.99, como 22.00.» |
| algo que no es texto (un número `22.5`, `null`, `undefined`) | el mismo mensaje anterior |

`[@test] ../frontend/tests/venta-actual/precio-aplicado.test.js`

- `cambiarPrecioAplicado(venta, productoId, texto)`: si el texto es válido, el detalle queda con el `valor` de 2 decimales y
  se quita el `errores[productoId].precioAplicado` que hubiera. Si no es válido, el detalle no cambia y se anota el
  `mensaje` en `errores[productoId].precioAplicado`.
  `[@test] ../frontend/tests/venta-actual/precio-aplicado.test.js`
- El subtotal y el total salen del precio aplicado nuevo. Con leche a 25.00 y cantidad 1, al cambiar a `"22.00"` el
  subtotal es `22.00` y el total `22.00`.
  `[@test] ../frontend/tests/venta-actual/precio-aplicado.test.js`
- Cambiar el precio aplicado no cambia nada más: ni la cantidad, ni el orden, ni los otros detalles.
  `[@test] ../frontend/tests/venta-actual/precio-aplicado.test.js`

### `cambiarCantidad` y `validarCantidad` (V-06)

`validarCantidad(valor)` acepta un número entero o un texto de solo dígitos (recortado), de 1 a 999:

| Valor | Resultado |
|---|---|
| `3`, `"3"`, `" 3 "`, `"007"`, `999`, `"999"`, `1` | válido, con `valor` entero: `3`, `3`, `3`, `7`, `999`, `999`, `1` |
| `""` o solo espacios | `mensaje`: «Escribe una cantidad.» |
| `0`, `"0"`, `"1000"`, `1000`, `-2`, `1.5`, `"1.5"`, `"abc"`, `"1e2"`, `"-1"`, `null`, `NaN` | `mensaje`: «La cantidad debe ser un número entero de 1 a 999.» |

`[@test] ../frontend/tests/venta-actual/cantidad.test.js`

- `cambiarCantidad(venta, productoId, valor)`: si el valor es válido, el detalle queda con esa cantidad y se quita el
  `errores[productoId].cantidad` que hubiera. Si no es válido, el detalle no cambia y se anota el `mensaje` en
  `errores[productoId].cantidad`.
  `[@test] ../frontend/tests/venta-actual/cantidad.test.js`
- Los botones «+» y «−» llaman a esta misma función con la cantidad válida del detalle más 1 o menos 1. No hay una función
  aparte.
  `[@test] ../frontend/tests/venta-actual/cantidad.test.js`
- Con la cantidad válida de 2, `cambiarCantidad(venta, id, 3)` deja subtotal y total recalculados (leche a 22.00: subtotal
  `66.00`).
  `[@test] ../frontend/tests/venta-actual/cantidad.test.js`

### `eliminarDetalle` (V-07)

- Quita el detalle con ese `productoId`, deja los demás en su orden y quita también los `errores` de ese detalle. El
  total se recalcula sin él.
  `[@test] ../frontend/tests/venta-actual/eliminar.test.js`
- Si era el último, la venta actual queda vacía (`{ detalles: [], errores: {} }`).
  `[@test] ../frontend/tests/venta-actual/eliminar.test.js`
- Si el detalle eliminado era el único con un error, la venta actual vuelve a ser válida si le quedan detalles.
  `[@test] ../frontend/tests/venta-actual/eliminar.test.js`

## Guardar la venta actual en el navegador (V-04)

`src/ventaActual/almacenamiento.js` es el único archivo del proyecto que toca `localStorage`.

```js
leerVentaActual()          // -> venta actual (nunca lanza): la guardada, o una vacía
guardarVentaActual(venta)  // -> true si guardó o borró, false si el navegador no dejó (nunca lanza)
```

- La llave es `aipos.ventaActual` y el valor es un JSON `{ "version": 1, "detalles": [ ... ] }`. Solo se guardan los
  `detalles`, sin `errores`: un valor que no se pudo aceptar no se guarda, y al recargar el campo vuelve a su último valor
  válido. Cada detalle guardado tiene `productoId`, `nombre`, `precioAplicado` y `cantidad`.
  `[@test] ../frontend/tests/venta-actual/almacenamiento.test.js`
- Se guarda después de cada cambio de la venta actual (agregar, precio aplicado, cantidad, eliminar).
  `[@test] ../frontend/tests/pantalla-venta-actual.test.js`
- Si la venta actual queda sin detalles, `guardarVentaActual` **borra la llave** en vez de guardar una lista vacía. Así
  vaciarla después de registrar la venta deja el navegador sin nada guardado (RF-09, criterio 1).
  `[@test] ../frontend/tests/venta-actual/almacenamiento.test.js`
- Lo guardado se valida entero al leerlo. Se ignora **todo** (y se empieza con la venta actual vacía) si: no es un JSON
  válido; no es un objeto con `version` igual a 1; `detalles` no es una lista o tiene más de 100 detalles (RN-14); o
  algún detalle no cumple: `productoId`
  entero de 1 o más, `nombre` texto no vacío de hasta 120 caracteres, `precioAplicado` texto con la forma del dinero y de 0
  a 99 999.99, `cantidad` entero de 1 a 999, o un `productoId` repetido. Lo que se lee sale con el `precioAplicado` de 2
  decimales.
  `[@test] ../frontend/tests/venta-actual/almacenamiento.test.js`
- Si el navegador falla (ventana privada, datos del sitio bloqueados, cuota llena, `localStorage` que lanza al pedirlo o al
  usarlo), `leerVentaActual` devuelve una venta actual vacía y `guardarVentaActual` devuelve `false`. Nada lanza.
  `[@test] ../frontend/tests/venta-actual/almacenamiento.test.js`
- La pantalla no avisa si no puede guardar: sigue funcionando sin guardar (RF-04, criterio 4).
  `[@test] ../frontend/tests/pantalla-venta-actual.test.js`
- El resto del proyecto no toca `localStorage`, y el módulo no importa `vue`, `vuetify` ni `axios`. Una prueba lee los
  archivos de `src/` y lo comprueba, como la de "sin `axios` en los componentes" de la arquitectura.
  `[@test] ../frontend/tests/venta-actual/aislamiento.test.js`
- Dos pestañas del navegador comparten `localStorage` pero no se sincronizan: gana la última que guardó. AIPOS es una
  pantalla de un solo cajero, y los requerimientos no piden más.

## La pantalla

### `App.vue`: une la búsqueda con la venta actual (V-04)

`App.vue` es el mediador entre `BuscadorProductos.vue` y `VentaActual.vue`: los dos no se conocen, y `App.vue` es el único
que guarda la venta actual: la conserva en su estado (`ventaActual`, con `leerVentaActual()` al crearse), la guarda en el
navegador con `guardarVentaActual` y llama a `agregarAVentaActual`. También guarda `enviando` y `resaltarId`.
`VentaActual.vue` usa las demás funciones del módulo para calcular y para cambiar la venta actual, pero no la conserva:
emite la venta nueva y `App.vue` la reemplaza.

- Al recibir `producto-elegido`, llama a `agregarAVentaActual`, guarda el resultado y lo guarda en el navegador
  (`guardarVentaActual`). El componente `BuscadorProductos.vue` no sabe nada de la venta actual.
  `[@test] ../frontend/tests/pantalla-venta-actual.test.js`
- Si `agregarAVentaActual` devolvió la misma venta, muestra un aviso en una franja con `role="alert"` que se quita sola
  a los 4 segundos: «La cantidad máxima de un producto es 999.» si el producto ya estaba en la venta actual, o «Una
  venta puede tener como máximo 100 productos.» si no estaba (ya hay 100 detalles).
  `[@test] ../frontend/tests/pantalla-venta-actual.test.js`
- Marca `resaltarId` con el `productoId` agregado, y lo quita a los 2 segundos.
  `[@test] ../frontend/tests/pantalla-venta-actual.test.js`
- Mientras `enviando` es `true` (V-08 está registrando la venta), ignora `producto-elegido`: la venta actual no puede cambiar
  a la mitad de un envío.
  `[@test] ../frontend/tests/pantalla-venta-actual.test.js`
- Cada `update:ventaActual` de `VentaActual.vue` reemplaza la venta actual entera y la guarda en el navegador.
  `[@test] ../frontend/tests/pantalla-venta-actual.test.js`
- Los temporizadores se cancelan en `beforeDestroy`.
  `[@test] ../frontend/tests/pantalla-venta-actual.test.js`

### `VentaActual.vue` (V-04, y V-05 a V-07 sobre él)

Componente de Vue 2 con Options API y un solo elemento raíz, en `src/components/`. No llama al módulo para guardar ni toca
`localStorage`: recibe la venta actual y emite la nueva.

| | Nombre | Qué es |
|---|---|---|
| Propiedad | `ventaActual` | La venta actual (`{ detalles, errores }`). |
| Propiedad | `resaltarId` | `productoId` del detalle recién agregado, o `null`. |
| Propiedad | `enviando` | `true` mientras V-08 registra la venta. Deshabilita los campos y el botón «Eliminar». |
| Evento | `update:ventaActual` | Se emite con la venta actual nueva que devolvió una función del módulo. |
| Evento | `update:enviando` | Lo reemite cuando V-08 lo emite (`:enviando.sync`). |

- **Con detalles** muestra una tabla de Vuetify 2 (`v-data-table` sin paginación ni pie, columnas `{ text, value }` y
  ranuras `#item.<value>="{ item }"`) con una fila por detalle y estas columnas: «Producto» (el nombre), «Precio aplicado»,
  «Cantidad», «Subtotal» y las acciones. El subtotal sale de `calcularSubtotal` y se muestra con 2 decimales. Las filas
  llevan `key` con el `productoId`.
  `[@test] ../frontend/tests/componentes/VentaActual.test.js`
- **Total siempre a la vista.** Debajo de la tabla, en una franja aparte que se queda pegada al borde de abajo del área de
  la venta actual cuando la lista es larga (`position: sticky`), dice «Total» y lo que devuelve `calcularTotal`, con 2
  decimales (`47.50`). Está también con la venta actual vacía (`0.00`). El total se anuncia a los lectores de pantalla
  (`aria-live="polite"`). El total se calcula con cada cambio, sin botón que lo pida.
  `[@test] ../frontend/tests/componentes/VentaActual.test.js`
- **Venta actual vacía.** En vez de la tabla se ve la animación `venta-vacia.json` (en `AnimacionLottie.vue`, decorativa) y
  el texto «Busca un producto para empezar la venta». El total (`0.00`) y el botón «Registrar venta» siguen a la vista, con
  el botón deshabilitado.
  `[@test] ../frontend/tests/componentes/VentaActual.test.js`
- **Botón «Registrar venta» provisional** (V-04): deshabilitado cuando `ventaActualEsValida` es `false`. Todavía no manda
  nada. V-08 lo reemplaza por `RegistrarVenta.vue`.
  `[@test] ../frontend/tests/componentes/VentaActual.test.js`
- **Detalle recién agregado.** La fila del `resaltarId` se pinta con el color de acento (`#FFE66D`) y el texto en `#292F36`,
  y queda a la vista (`scrollIntoView` con `block: 'nearest'`, solo si el navegador lo trae). Sin animación de movimiento.
  `[@test] ../frontend/tests/componentes/VentaActual.test.js`
- **Nombre del producto.** Se muestra como texto (Vue lo escapa), nunca con `v-html` (RNF-04). Si es largo, pasa a otra
  línea y no rompe la tabla.
  `[@test] ../frontend/tests/componentes/VentaActual.test.js`
- **Detalles con errores.** Una fila con un valor escrito que no se aceptó sigue mostrando su subtotal del último valor
  válido, y el total suma esos valores. «Registrar venta» está deshabilitado hasta que se corrija (ver "Casos de error").
  `[@test] ../frontend/tests/componentes/VentaActual.test.js`

### `CampoPrecioAplicado.vue` (V-05)

Componente de Vue 2 con un solo elemento raíz, con un `v-text-field` de Vuetify 2.

| | Nombre | Qué es |
|---|---|---|
| Propiedad | `value` | El precio aplicado válido del detalle (texto con 2 decimales). |
| Propiedad | `error` | El mensaje de error del campo, o `''`. |
| Propiedad | `nombre` | El nombre del producto, para la etiqueta accesible. |
| Propiedad | `disabled` | `true` mientras se envía la venta. |
| Evento | `input` | Se emite con el texto que escribió el cajero, tal cual. `VentaActual.vue` lo pasa a `cambiarPrecioAplicado`. |

- Es un campo de texto con `inputmode="decimal"`, no `type="number"`: `type="number"` acepta `1e3` y cambia el valor con la
  rueda del ratón, y las reglas de RN-05 se validan sobre texto.
  `[@test] ../frontend/tests/componentes/CampoPrecioAplicado.test.js`
- Su etiqueta accesible dice «Precio aplicado de <nombre>» (`aria-label`), porque en la tabla el encabezado de columna
  no basta para un lector de pantalla.
  `[@test] ../frontend/tests/componentes/CampoPrecioAplicado.test.js`
- Mientras el cajero escribe, el campo muestra lo que escribe y emite `input` en cada cambio: la venta actual se recalcula
  y el subtotal y el total se actualizan al momento. Si el texto es inválido, el campo muestra `error` debajo, con borde e
  ícono `#FF6B6B` y el texto en `#292F36` (no rojo sobre el fondo claro), y conserva lo escrito.
  `[@test] ../frontend/tests/componentes/CampoPrecioAplicado.test.js`
- Al salir del campo (o con Enter), si el texto es válido, el campo muestra el valor con 2 decimales (`22` pasa a `22.00`).
  Si no es válido, deja lo escrito con su error.
  `[@test] ../frontend/tests/componentes/CampoPrecioAplicado.test.js`
- Si `value` cambia desde afuera y el campo no tiene el foco, el campo lo muestra.
  `[@test] ../frontend/tests/componentes/CampoPrecioAplicado.test.js`
- Con `disabled` no se puede editar.
  `[@test] ../frontend/tests/componentes/CampoPrecioAplicado.test.js`
- El precio del producto no aparece como campo, y ningún cambio del precio aplicado llama a la API.
  `[@test] ../frontend/tests/pantalla-venta-actual.test.js`

### `CampoCantidad.vue` (V-06)

Componente de Vue 2 con un solo elemento raíz: el botón «−», un campo de texto y el botón «+», en una fila.

| | Nombre | Qué es |
|---|---|---|
| Propiedad | `value` | La cantidad válida del detalle (entero). |
| Propiedad | `error` | El mensaje de error del campo, o `''`. |
| Propiedad | `nombre` | El nombre del producto, para las etiquetas accesibles. |
| Propiedad | `disabled` | `true` mientras se envía la venta. |
| Evento | `input` | Se emite con el texto que escribió el cajero, o con el número nuevo al presionar «+» o «−». `VentaActual.vue` lo pasa a `cambiarCantidad`. |

- Botones «+» y «−» con `aria-label` «Aumentar la cantidad de <nombre>» y «Disminuir la cantidad de <nombre>», con los
  íconos `mdi-plus` y `mdi-minus`. Cada uno mide al menos 44 × 44 px (se usan con el dedo).
  `[@test] ../frontend/tests/componentes/CampoCantidad.test.js`
- «−» está deshabilitado cuando la cantidad válida es 1: para quitar el producto se usa «Eliminar» (RF-06). «+» está
  deshabilitado cuando es 999.
  `[@test] ../frontend/tests/componentes/CampoCantidad.test.js`
- Presionar «+» o «−» emite `input` con la cantidad válida del detalle más 1 o menos 1, aunque el campo tenga un texto
  inválido escrito: el error se quita y el campo muestra el valor válido nuevo.
  `[@test] ../frontend/tests/componentes/CampoCantidad.test.js`
- El campo es de texto con `inputmode="numeric"` y `aria-label` «Cantidad de <nombre>». Emite `input` en cada cambio con lo
  que escribió el cajero. Si es inválido, muestra `error` con la misma presentación de `CampoPrecioAplicado.vue` y
  conserva lo escrito.
  `[@test] ../frontend/tests/componentes/CampoCantidad.test.js`
- Al salir del campo, si el texto es válido, el campo muestra la cantidad normalizada (`007` pasa a `7`).
  `[@test] ../frontend/tests/componentes/CampoCantidad.test.js`
- Con un texto inválido escrito («0», «1000», «1.5», «abc»), «+» y «−» siguen usando la cantidad válida del detalle, no el
  texto.
  `[@test] ../frontend/tests/componentes/CampoCantidad.test.js`
- Con `disabled` no se puede editar ni presionar.
  `[@test] ../frontend/tests/componentes/CampoCantidad.test.js`

### Botón «Eliminar» (V-07)

- Cada fila tiene un botón de ícono `mdi-delete` (color `#FF6B6B`: es una acción que borra) con `aria-label` «Eliminar
  <nombre> de la venta actual». Al presionarlo, `VentaActual.vue` emite `update:ventaActual` con `eliminarDetalle`. No pide
  confirmación: el cajero puede volver a agregar el producto desde la búsqueda.
  `[@test] ../frontend/tests/componentes/VentaActual-eliminar.test.js`
- Con `enviando` el botón está deshabilitado.
  `[@test] ../frontend/tests/componentes/VentaActual-eliminar.test.js`
- Después de eliminar, el foco pasa al botón «Eliminar» de la fila que ocupó su lugar (o al de la anterior, si era la
  última fila). Si la venta actual quedó vacía, pasa al título «Venta actual» (con `tabindex="-1"`), para que quien usa el
  teclado no pierda su lugar.
  `[@test] ../frontend/tests/componentes/VentaActual-eliminar.test.js`

### Diseño (skill `impeccable`)

Antes de construir cada parte de la pantalla, el agente carga la skill `impeccable` y sigue lo que indica (jerarquía,
espacios, estados, textos, contraste, teclado, foco visible y móvil). Al revisar, la corre en modo auditoría sobre lo que
cambió. Todo dentro de Vue 2 y Vuetify 2, con la paleta y los contrastes de la spec de arquitectura (`tema.test.js`).

- **Jerarquía.** El total es lo más grande de la zona: al menos 28 px, en negrita, sobre una franja de acento (`#FFE66D`) con
  texto `#292F36` (contraste 10.80). Los precios aplicados y los subtotales de la tabla van alineados a la derecha, con cifras del mismo ancho
  (`font-variant-numeric: tabular-nums`), para que los decimales queden en columna.
- **Estados.** Vacío (con animación y el texto), con detalles, con un campo con error, enviando (campos deshabilitados) y
  el aviso de cantidad máxima. Cada uno se ve distinto sin depender solo del color.
- **Teclado y foco.** Se llega a todo con Tab, en el orden de lectura de la fila (precio aplicado, «−», cantidad, «+»,
  «Eliminar»). El foco se ve siempre: un anillo de 2 px en `#292F36` (contraste 13.26 con el fondo `#F7FFF7`; el
  turquesa `#4ECDC4` solo tiene 1.90 y no alcanza para un borde de foco, que pide 3 o más).
- **Móvil.** Con 375 px de ancho no hay scroll horizontal. La tabla de Vuetify pasa a filas apiladas con la etiqueta de cada
  columna, y las zonas táctiles miden al menos 44 × 44 px.
- **Movimiento.** La animación `venta-vacia.json` (menos de 50 KB, en los colores de la paleta) usa `AnimacionLottie.vue`, que
  ya respeta `prefers-reduced-motion`. Lo demás no se anima.
  `[@test] ../frontend/tests/animaciones.test.js`
- **Vuetify 2.** Nada de propiedades de Vuetify 3 (`variant`, `density`, `item-title`) ni `<v-table>`.

## Casos de error y bordes

| Situación | Qué pasa |
|---|---|
| El cajero escribe un precio aplicado inválido (`-1`, `abc`, `22.999`, vacío) | El campo muestra el mensaje y conserva lo escrito. El detalle conserva su último precio aplicado válido. «Registrar venta» queda deshabilitado hasta corregirlo. |
| El cajero escribe una cantidad inválida (`0`, `1000`, `1.5`, `abc`, vacío) | Igual: mensaje en el campo, la cantidad válida anterior se conserva, y «Registrar venta» queda deshabilitado. |
| Un detalle tiene un error y el cajero lo elimina | Se van el detalle y su error. Si no quedan más errores y hay detalles, «Registrar venta» se habilita. |
| El cajero agrega un producto cuyo detalle ya tiene 999 | La cantidad no cambia y se muestra «La cantidad máxima de un producto es 999.» |
| El cajero agrega un producto cuyo detalle tiene un error de cantidad escrito | Sube la cantidad válida en 1 y se quita el error. |
| El precio aplicado es `0` | Es válido. El subtotal es `0.00`. |
| La venta actual solo tiene productos a `0.00` | Total `0.00` y «Registrar venta» habilitado. |
| Se elimina el último detalle | La venta actual queda vacía: se ve «Busca un producto para empezar la venta», «Registrar venta» deshabilitado, y el navegador ya no guarda nada. |
| El cajero recarga la página | La pantalla lee la venta actual del navegador y se ve igual, con sus detalles, precios aplicados y cantidades. Un valor con error que no se había corregido vuelve a su último valor válido. |
| Lo guardado en el navegador está dañado o tiene otra forma | Se ignora y se empieza con la venta actual vacía. La pantalla no falla. |
| El navegador no deja usar `localStorage` (ventana privada, datos del sitio bloqueados) | La pantalla funciona igual. La venta actual vive en memoria y se pierde al recargar. |
| Lo guardado en el navegador tiene un producto que ya no existe en la base (por ejemplo, después de reiniciar la base de desarrollo) | La pantalla no lo sabe: solo la API conoce los productos. Al registrar la venta, la API responde 422 con el motivo (RF-09, criterio 4), `RegistrarVenta.vue` lo muestra, la venta actual se conserva y el cajero elimina ese detalle. |
| V-08 está registrando la venta | No se puede agregar, editar ni eliminar hasta que termine. |
| V-08 recibe un error de la API | La venta actual no se toca (RNF-05). Lo decide `RegistrarVenta.vue`, que no la vacía. |

`[@test] ../frontend/tests/pantalla-venta-actual.test.js`

## Lo que V-08 espera de esta spec

La spec `registrar-venta` define `RegistrarVenta.vue` con las propiedades `detalles` y `valida`, y los eventos `registrada` y
`update:enviando`. Esta spec le da lo que necesita, sin que V-08 cambie el módulo:

- `detalles` es `detallesParaRegistrar(ventaActual)` y `valida` es `ventaActualEsValida(ventaActual)`. Los calcula
  `VentaActual.vue` con el módulo, no `RegistrarVenta.vue`.
- El total y `RegistrarVenta.vue` viven en la franja de abajo de `VentaActual.vue`, que se muestra también con la venta actual
  vacía: así el mensaje de «Venta N registrada» sigue a la vista cuando la venta actual ya quedó vacía.
- Al recibir `registrada`, `VentaActual.vue` emite `update:ventaActual` con `vaciarVentaActual()`. `App.vue` la guarda con
  `guardarVentaActual`, que borra la llave `aipos.ventaActual`. Para comprobarlo, las pruebas de V-08 usan
  `leerVentaActual()` (que da una venta actual vacía) y `localStorage.getItem('aipos.ventaActual')` (que da `null`).
- `:enviando.sync` sube hasta `App.vue`, que ignora `producto-elegido` mientras dura el envío.
- Lo único que cambia en V-08 dentro de `VentaActual.vue` es reemplazar el botón provisional.

## Criterios de aceptación

Los de las tarjetas, más los que faltaban (marcados con «Extra»). Cada uno es una prueba automática o una prueba en local.

### V-04 · Agregar productos y ver el total (RF-03, RF-04, RF-08)

1. Dada una venta actual vacía, cuando el cajero agrega la leche (25.00), entonces hay un detalle con cantidad 1 y subtotal
   25.00.
   `[@test] ../frontend/tests/venta-actual/agregar.test.js`
   `[@test] ../frontend/tests/componentes/VentaActual.test.js`
2. Dada la leche ya en la venta actual, cuando la agrega otra vez, entonces sigue un solo detalle de leche con cantidad 2.
   `[@test] ../frontend/tests/venta-actual/agregar.test.js`
3. Dada la leche con cantidad 2 a 22.00 y el pan con cantidad 1 a 3.50, entonces el total es 47.50.
   `[@test] ../frontend/tests/venta-actual/calculos.test.js`
   `[@test] ../frontend/tests/componentes/VentaActual.test.js`
4. Dada una venta actual vacía, entonces se ve «Busca un producto para empezar la venta» y «Registrar venta» está
   deshabilitado.
   `[@test] ../frontend/tests/componentes/VentaActual.test.js`
5. Dada una venta actual con 2 detalles, entonces se ven los dos con su nombre, su precio aplicado, su cantidad, su subtotal y
   sus acciones (RF-04, criterio 1).
   `[@test] ../frontend/tests/componentes/VentaActual.test.js`
6. Extra. Dado un producto que el cajero elige en la búsqueda, entonces entra a la venta actual (P-05, criterio 7).
   `[@test] ../frontend/tests/pantalla-venta-actual.test.js`
7. Extra. Dado cualquier cambio (agregar, precio aplicado, cantidad o eliminar), entonces el total se actualiza al momento y
   se ve con 2 decimales (RF-08, criterios 2 y 3).
   `[@test] ../frontend/tests/pantalla-venta-actual.test.js`
8. Extra. Dada una venta actual con detalles, cuando se recarga la página, entonces sigue igual, con sus detalles, sus
   precios aplicados y sus cantidades (RF-04, criterio 3).
   `[@test] ../frontend/tests/pantalla-venta-actual.test.js`
9. Extra. Dado que el navegador no deja guardar, entonces la pantalla sigue funcionando y la venta actual vive en memoria
   (RF-04, criterio 4).
   `[@test] ../frontend/tests/pantalla-venta-actual.test.js`
10. Extra. Dados los precios `0.10 × 3` y `0.20`, entonces el total es `0.50`; dado `1.15 × 3`, entonces el subtotal es
    `3.45`.
    `[@test] ../frontend/tests/venta-actual/calculos.test.js`
11. Extra. Dado un detalle con cantidad 999, cuando el cajero agrega otra vez ese producto, entonces la cantidad sigue en 999
    y se ve el aviso.
    `[@test] ../frontend/tests/pantalla-venta-actual.test.js`
12. Extra. Dado lo guardado dañado (`"{"`, `{"version":2}`, un detalle con cantidad 0), entonces la pantalla abre con la venta
    actual vacía y sin errores.
    `[@test] ../frontend/tests/venta-actual/almacenamiento.test.js`
13. Extra. Dada una venta actual, entonces las funciones del módulo no la modifican.
    `[@test] ../frontend/tests/venta-actual/agregar.test.js`
    `[@test] ../frontend/tests/venta-actual/valida-y-registro.test.js`
14. Extra. Dada una venta actual con 100 detalles, cuando el cajero elige un producto que no está en ella, entonces no se
    agrega y se ve el aviso «Una venta puede tener como máximo 100 productos.» (RN-14). Con 100 detalles válidos,
    «Registrar venta» sigue habilitado.
    `[@test] ../frontend/tests/venta-actual/agregar.test.js`
    `[@test] ../frontend/tests/venta-actual/valida-y-registro.test.js`
    `[@test] ../frontend/tests/pantalla-venta-actual.test.js`

### V-05 · Editar el precio aplicado (RF-05)

1. Dada la leche a 25.00, cuando el cajero cambia su precio aplicado a 22.00, entonces se recalculan el subtotal y el total, y
   al buscar la leche su precio sigue en 25.00.
   `[@test] ../frontend/tests/venta-actual/precio-aplicado.test.js`
   `[@test] ../frontend/tests/pantalla-venta-actual.test.js`
2. Dado un precio aplicado «-1» o «abc», entonces el campo muestra el error y «Registrar venta» queda deshabilitado hasta
   corregirlo.
   `[@test] ../frontend/tests/componentes/CampoPrecioAplicado.test.js`
   `[@test] ../frontend/tests/pantalla-venta-actual.test.js`
3. Extra. Dado un precio aplicado `0`, entonces es válido, el subtotal es `0.00` y «Registrar venta» sigue habilitado.
   `[@test] ../frontend/tests/venta-actual/precio-aplicado.test.js`
4. Extra. Dado un precio aplicado `22.999` o `100000`, entonces el campo muestra el error.
   `[@test] ../frontend/tests/venta-actual/precio-aplicado.test.js`
5. Extra. Dado un precio aplicado con error, cuando el cajero lo corrige, entonces el error se va y «Registrar venta» se
   habilita.
   `[@test] ../frontend/tests/pantalla-venta-actual.test.js`

### V-06 · Cambiar la cantidad (RF-06)

1. Dada la leche con cantidad 2, cuando el cajero presiona «+», entonces pasa a 3 y se recalculan el subtotal y el total.
   `[@test] ../frontend/tests/componentes/CampoCantidad.test.js`
   `[@test] ../frontend/tests/pantalla-venta-actual.test.js`
2. Dada la cantidad 1, entonces el botón «−» está deshabilitado.
   `[@test] ../frontend/tests/componentes/CampoCantidad.test.js`
3. Dada una cantidad escrita «0», «1000», «1.5» o «abc», entonces el campo muestra el error y «Registrar venta» queda
   deshabilitado. (La tarjeta V-06 lista «0», «1.5» y «abc»; «1000» viene de RF-06 y de la pregunta abierta 4.)
   `[@test] ../frontend/tests/venta-actual/cantidad.test.js`
   `[@test] ../frontend/tests/pantalla-venta-actual.test.js`
4. Extra. Dada la cantidad 999, entonces el botón «+» está deshabilitado.
   `[@test] ../frontend/tests/componentes/CampoCantidad.test.js`
5. Extra. Dada una cantidad con error escrito, cuando el cajero presiona «+», entonces el campo vuelve a mostrar la cantidad
   válida más 1 y el error se va.
   `[@test] ../frontend/tests/componentes/CampoCantidad.test.js`

### V-07 · Eliminar un producto (RF-07)

1. Dada una venta actual con leche y pan, cuando el cajero elimina el pan, entonces queda la leche y el total se recalcula.
   `[@test] ../frontend/tests/venta-actual/eliminar.test.js`
   `[@test] ../frontend/tests/componentes/VentaActual-eliminar.test.js`
2. Dado un solo detalle, cuando lo elimina, entonces la venta actual queda vacía.
   `[@test] ../frontend/tests/venta-actual/eliminar.test.js`
   `[@test] ../frontend/tests/componentes/VentaActual-eliminar.test.js`
3. Extra. Dada una venta actual vacía por eliminar, cuando se recarga la página, entonces sigue vacía (el navegador ya no
   guarda nada).
   `[@test] ../frontend/tests/pantalla-venta-actual.test.js`

## Pruebas en local

Todo se prueba en local, además de las pruebas automáticas (`npm test`, `npm run lint`, `npm run format:check` y `npm run
build` en `frontend/`). Cada tarjeta corre las que le tocan y anota el resultado en su «Update» de la tarjeta. Cada bug
relevante se abre como un issue de GitHub, con los pasos para reproducirlo (`gh issue create`), y se cierra con un
comentario que nombra el commit que lo corrige (`gh issue close <número> --comment "Corregido en <commit>"`).

### La API, con `curl`

Esta spec no agrega rutas. Solo se usa la API para preparar los productos y para comprobar que la venta actual no la toca.
Con el backend corriendo (`npm run dev`, con MySQL levantado y migrado):

```bash
# Productos de ejemplo (P-01). El precio va como texto.
curl -s -X POST http://localhost:3000/api/productos -H 'Content-Type: application/json' \
  -d '{"nombre":"Leche entera 1 L","codigoBarras":"7501055300075","precio":"25.00"}'
curl -s -X POST http://localhost:3000/api/productos -H 'Content-Type: application/json' \
  -d '{"nombre":"Pan de caja","codigoBarras":"7501000111206","precio":"3.50"}'

# Después de editar el precio aplicado de la leche a 22.00 en la pantalla (V-05): el precio del producto no cambió.
curl -s 'http://localhost:3000/api/productos?busqueda=lech'
# Esperado: 200 y la leche con "precio": "25.00"
```

Si esos productos ya existen, `POST /api/productos` responde 409 `CODIGO_BARRAS_DUPLICADO`: se sigue con los que hay.

### La pantalla, en el navegador con el MCP `chrome-devtools`

Con el backend corriendo y los productos de arriba, el agente corre la pantalla (`npm run dev` del frontend) y hace lo que
hace el cajero. Si la sesión no tiene el MCP `chrome-devtools`, lo dice y la persona desarrolladora hace esta prueba a mano.

**V-04**

1. `navigate_page` a la pantalla y `take_snapshot`: se ve «Busca un producto para empezar la venta», el total `0.00` y
   «Registrar venta» deshabilitado. `take_screenshot` de la venta actual vacía.
2. `evaluate_script` con `localStorage.clear()` y recargar: sigue igual y sin errores.
3. `fill` en el campo de búsqueda con «lech» y `click` en «Leche entera 1 L»: aparece una fila con precio aplicado `25.00`,
   cantidad `1` y subtotal `25.00`, con el total `25.00`. La fila se ve resaltada un momento.
4. Buscar «lech» y elegir la leche otra vez: sigue una sola fila, con cantidad `2` y subtotal `50.00`.
5. Buscar «pan» y elegir el pan: dos filas y total `53.50`.
6. `evaluate_script` con `localStorage.getItem('aipos.ventaActual')`: es un JSON con `version` 1 y los 2 detalles.
7. Recargar con `navigate_page` (tipo `reload`): la venta actual sigue igual, con los mismos detalles y el total `53.50`.
8. `list_network_requests`: no hay ninguna llamada a `/api/ventas`; solo las de `/api/productos?busqueda=`.
9. `evaluate_script` que hace que `Storage.prototype.setItem` lance un error, y elegir el pan otra vez: la pantalla sigue
   funcionando (cantidad del pan `2`) y `list_console_messages` no muestra errores.
10. `resize_page` a 375 × 667: sin scroll horizontal, con el total a la vista. Con muchas filas (agregar 8 productos distintos
    o repetir con `evaluate_script`), el total sigue a la vista sin bajar la página. `take_screenshot`.

**V-05**

11. En la fila de la leche, `fill` en «Precio aplicado de Leche entera 1 L» con `22`: el subtotal y el total se recalculan. Al
    salir del campo se ve `22.00`.
12. `fill` con `-1`, luego con `abc`, con `22.999` y con `0`: con los tres primeros aparece el error debajo del campo y
    «Registrar venta» queda deshabilitado; con `0` no hay error, el subtotal es `0.00` y el botón está habilitado.
13. `curl` a `/api/productos?busqueda=lech`: la leche sigue con `"precio": "25.00"`.

**V-06**

14. `click` en «Aumentar la cantidad de Leche entera 1 L»: la cantidad y el subtotal suben. Con cantidad 1, «Disminuir la
    cantidad» está deshabilitado.
15. `fill` en «Cantidad de Leche entera 1 L» con `0`, `1000`, `1.5` y `abc`: el campo muestra el error y «Registrar venta»
    queda deshabilitado. `click` en «+»: el campo vuelve a un valor válido.

**V-07**

16. `click` en «Eliminar Pan de caja de la venta actual»: solo queda la leche y el total se recalcula. `click` en el «Eliminar»
    de la leche: se ve otra vez «Busca un producto para empezar la venta», el botón «Registrar venta» deshabilitado, y
    `localStorage.getItem('aipos.ventaActual')` da `null`. Recargar: sigue vacía.

**En todos:** `list_console_messages` sin errores y `take_screenshot` de cada estado (vacía, con detalles, con un campo con
error y en 375 × 667). Con el teclado (`press_key` Tab) se llega a todos los campos y botones, y se ve el foco.

## Lo que esta spec no cubre

- El botón «Registrar venta», su envío y el mensaje de éxito o error: spec `registrar-venta` (V-08).
- La búsqueda y sus resultados, y el evento `producto-elegido`: spec `buscar-producto` (P-05).
- Un botón «Deshacer» ni una confirmación al eliminar: los requerimientos no los piden.
- Mostrar el precio del producto junto al precio aplicado ni un botón para volver a él.
- Sincronizar la venta actual entre dos pestañas del navegador, ni guardarla en el servidor.
- El separador de miles (`1 234.50`): el dinero se muestra como lo devuelve la API.
- El orden de los detalles: siempre es el orden en que se agregaron.

## Cómo se decidió el diseño

Antes de decidir, se consultó el MCP `design-patterns`. El catálogo trae pocos patrones para pantallas de Vue 2 (los de
componentes son de React), y aquí se anota cuál se eligió y por qué.

| Decisión | Patrón | Por qué, en una frase |
|---|---|---|
| El módulo de la venta actual | Pure Functions e Immutability | Cada función recibe la venta actual y devuelve una nueva: se prueba sin pantalla y Vue 2 detecta el cambio al reemplazar el valor. |
| Guardar y leer de `localStorage` | Memento (el más cercano) | Guarda y restaura el estado de la venta actual, con validación al leer; el catálogo no trae uno para esto. |
| Una venta actual vacía que nunca es `null` | Null Object | La venta vacía es un valor real (`{ detalles: [], errores: {} }`), y ningún código pregunta si existe. |
| `App.vue` une la búsqueda con la venta actual | Mediator | `BuscadorProductos.vue` y `VentaActual.vue` no se conocen y `App.vue` decide qué hace cada evento. |
| Sin `vuex`, `pinia` ni bus de eventos | Publish-Subscribe, descartado | Son dos componentes y un estado en `App.vue`; un intermediario solo agregaría archivos (y la arquitectura no los instala). |
| Validar el precio aplicado y la cantidad | Input Validation (la de la arquitectura) y Pure Functions | Reglas de dinero sobre texto en funciones puras que la pantalla y las pruebas usan igual; la API vuelve a validar en V-03. |
| `CampoPrecioAplicado.vue`, `CampoCantidad.vue` y `VentaActual.vue` | Ninguno del catálogo | Los patrones de componentes son de React; se sigue la práctica de Vue 2: componentes que reciben propiedades y emiten eventos. |
| Guardar `errores` fuera de lo persistido | Ninguno del catálogo | Un valor que no se aceptó no debe volver al recargar; se anota aquí como decisión, no como patrón. |
