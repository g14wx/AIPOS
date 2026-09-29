# Requerimientos funcionales

Lo que AIPOS hace. Cada requerimiento funcional (RF) dice de qué parte del PDF sale, qué reglas de negocio (RN)
aplica, en qué flujo se ve y qué tarjetas del tablero AIPOS lo construyen. Los criterios de aceptación se
escriben "Dado / Cuando / Entonces": dada una situación, cuando el cajero hace algo, entonces pasa esto. Cada
criterio se vuelve una prueba.

| RF | Qué | Prioridad | Flujo | Tarjetas |
|---|---|---|---|---|
| [RF-01](#rf-01-crear-producto) | Crear producto | Obligatorio | 01 | P-01, P-02, P-03 |
| [RF-02](#rf-02-buscar-producto) | Buscar producto | Obligatorio | 02 | P-04, P-05 |
| [RF-03](#rf-03-agregar-a-la-venta-actual) | Agregar a la venta actual | Obligatorio | 03 | V-04 |
| [RF-04](#rf-04-ver-los-detalles-de-la-venta-actual) | Ver los detalles de la venta actual | Obligatorio | 03 | V-04 |
| [RF-05](#rf-05-editar-el-precio-aplicado) | Editar el precio aplicado | Obligatorio | 03 | V-05 |
| [RF-06](#rf-06-cambiar-la-cantidad) | Cambiar la cantidad | Recomendado | 03 | V-06 |
| [RF-07](#rf-07-eliminar-un-producto-de-la-venta-actual) | Eliminar un producto de la venta actual | Obligatorio | 03 | V-07 |
| [RF-08](#rf-08-ver-el-total) | Ver el total | Obligatorio | 03 | V-04 |
| [RF-09](#rf-09-registrar-venta) | Registrar venta | Obligatorio | 04 | V-03, V-08 |
| [RF-10](#rf-10-guardar-productos-ventas-y-detalles-con-sus-relaciones) | Guardar productos, ventas y detalles con sus relaciones | Obligatorio | 01, 04 | P-01, V-01 |
| [RF-11](#rf-11-registrar-venta-con-sp_registrar_venta) | Registrar venta con `sp_registrar_venta` | Obligatorio | 04 | V-02, V-03 |
| [RF-12](#rf-12-agregar-con-un-código-de-barras-exacto) | Agregar con un código de barras exacto | Opcional | 02 | P-05 |

## RF-01 Crear producto

En la pantalla principal hay un botón visible, "Nuevo producto". Abre un formulario en una ventana encima de la
pantalla (un modal) con nombre, precio y código de barras. Al guardarlo, el producto queda en MySQL y ya se
puede buscar y vender.

- **Origen:** PDF §1, "Administración de productos".
- **Reglas:** RN-01 a RN-04.

Criterios de aceptación:
1. Dado el formulario vacío, cuando el cajero presiona "Guardar", entonces la pantalla marca los tres campos
   como obligatorios y no llama a la API.
2. Dado un precio "-5", "abc" o "10.999", cuando guarda, entonces la pantalla lo marca como inválido. Si la API
   recibe ese precio igual, responde 400 con el campo y el motivo.
3. Dado un código de barras que ya existe, cuando guarda, entonces la API responde 409 y la pantalla muestra "Ya
   existe un producto con ese código de barras" junto al campo, sin borrar lo escrito.
4. Dado un producto válido, cuando guarda, entonces hay una fila nueva en `productos`, la ventana se cierra,
   aparece "Producto creado" y el producto sale al buscarlo.
5. Dado que la API no responde, cuando guarda, entonces la pantalla avisa del error y conserva lo escrito.
6. Dado un doble clic en "Guardar", entonces se crea un solo producto: el botón está deshabilitado mientras se
   guarda.

## RF-02 Buscar producto

En la pantalla principal hay un campo de búsqueda. El cajero escribe un nombre o un código de barras y ve los
productos que coinciden, con su nombre, su código de barras y su precio. Elegir un resultado lo agrega a la
venta actual (RF-03).

- **Origen:** PDF §2, "Búsqueda de productos". El PDF deja a criterio cómo se muestran y se eligen los
  resultados.
- **Reglas:** busca por una parte del nombre, sin importar mayúsculas, o por el código de barras exacto. Busca
  desde 2 caracteres y muestra 20 resultados como máximo (pregunta abierta 3). `%` y `_` se buscan como texto
  normal.

Criterios de aceptación:
1. Dado el producto "Leche entera 1 L", cuando el cajero escribe "lech", entonces aparece en los resultados.
2. Dado el código de barras "7501055300075", cuando lo escribe completo, entonces aparece ese producto.
3. Dado un texto sin coincidencias, cuando termina de escribir, entonces ve "Sin resultados".
4. Dado que escribe rápido "le", "lec" y "lech", entonces solo se muestran los resultados de "lech", aunque las
   respuestas de la API lleguen desordenadas.
5. Dado el texto "50%", entonces solo aparecen productos con "50%" en el nombre, no todos los productos.
6. Dada una sola letra, entonces no se busca todavía y se ve "Escribe al menos 2 caracteres".
7. Dado un resultado, cuando el cajero lo elige, entonces pasa a la venta actual.

## RF-03 Agregar a la venta actual

El producto elegido en la búsqueda entra a la venta actual con cantidad 1 y con un precio aplicado igual a su
precio. Si ya estaba, su cantidad sube en 1.

- **Origen:** PDF §3, "los productos agregados a la venta actual". La cantidad es decisión de la persona
  desarrolladora (2026-09-29).
- **Reglas:** RN-05, RN-07.

Criterios de aceptación:
1. Dada una venta actual vacía, cuando el cajero agrega la leche (precio 25.00), entonces aparece un detalle:
   leche, precio aplicado 25.00, cantidad 1, subtotal 25.00.
2. Dada la leche ya en la venta actual, cuando la agrega otra vez, entonces sigue habiendo un solo detalle de
   leche, ahora con cantidad 2.

## RF-04 Ver los detalles de la venta actual

En la misma pantalla se ve la venta actual: cada detalle con su nombre, su precio aplicado, su cantidad y su
subtotal, y las acciones de cada detalle.

- **Origen:** PDF §3. El nombre y el precio aplicado los pide el PDF; la cantidad y el subtotal vienen de la
  decisión de la persona desarrolladora.

Criterios de aceptación:
1. Dada una venta actual con 2 detalles, entonces se ven los dos con sus 4 datos y sus acciones: editar el
   precio aplicado, cambiar la cantidad y eliminar.
2. Dada una venta actual vacía, entonces se ve "Busca un producto para empezar la venta" y el botón "Registrar
   venta" está deshabilitado.

## RF-05 Editar el precio aplicado

El cajero cambia el precio aplicado de un detalle. El precio del producto no cambia.

- **Origen:** PDF §3, "Editar el precio del producto dentro de la venta".
- **Reglas:** RN-05.

Criterios de aceptación:
1. Dada la leche a 25.00, cuando el cajero cambia su precio aplicado a 22.00, entonces el subtotal y el total se
   recalculan, y al buscar la leche su precio sigue siendo 25.00.
2. Dado un precio aplicado "-1" o "abc", entonces el campo muestra el error y "Registrar venta" queda
   deshabilitado hasta corregirlo.

## RF-06 Cambiar la cantidad

El cajero cambia la cantidad de un detalle con los botones "+" y "−" o escribiéndola.

- **Origen:** decisión de la persona desarrolladora (2026-09-29). El PDF no la pide, pero la permite.
- **Reglas:** RN-06.

Criterios de aceptación:
1. Dada la leche con cantidad 2, cuando el cajero presiona "+", entonces pasa a 3 y el subtotal y el total se
   recalculan.
2. Dada la cantidad 1, entonces el botón "−" está deshabilitado; para quitar el producto se usa "Eliminar".
3. Dada una cantidad escrita "0", "1.5" o "abc", entonces el campo muestra el error y "Registrar venta" queda
   deshabilitado.

## RF-07 Eliminar un producto de la venta actual

El cajero quita un detalle de la venta actual.

- **Origen:** PDF §3, "Eliminar el producto de la venta".

Criterios de aceptación:
1. Dada una venta actual con leche y pan, cuando el cajero elimina el pan, entonces solo queda la leche y el
   total se recalcula.
2. Dado un solo detalle, cuando lo elimina, entonces la venta actual queda vacía (RF-04, criterio 2).

## RF-08 Ver el total

La pantalla muestra siempre el total de la venta actual, claro y a la vista.

- **Origen:** PDF §3, "debe mostrarse claramente el total acumulado de todos los productos agregados".
- **Reglas:** RN-08, RN-09.

Criterios de aceptación:
1. Dada la leche con cantidad 2 a 22.00 y el pan con cantidad 1 a 3.50, entonces el total es 47.50.
2. Dado cualquier cambio (agregar, precio aplicado, cantidad o eliminar), entonces el total se actualiza al
   momento.
3. El total y los subtotales se muestran con 2 decimales.

## RF-09 Registrar venta

El cajero presiona "Registrar venta". La venta queda en MySQL con todos sus detalles, de una sola vez, con el
procedimiento almacenado (RF-11). La pantalla muestra el número de la venta y el total que devolvió MySQL, y la
venta actual queda vacía.

- **Origen:** PDF §3, "La venta debe poder guardarse y persistirse en la base de datos".
- **Reglas:** RN-08 a RN-12.

Criterios de aceptación:
1. Dada una venta actual con 2 detalles válidos, cuando el cajero la registra, entonces hay 1 fila nueva en
   `ventas` y 2 en `detalles_venta`, la pantalla muestra "Venta 15 registrada · Total 47.50" y la venta actual
   queda vacía.
2. Dada una venta actual vacía o con un dato inválido, entonces "Registrar venta" está deshabilitado. Si la API
   recibe igual una venta sin detalles, responde 400.
3. Dado un doble clic en "Registrar venta", entonces se registra una sola venta.
4. Dado un producto que ya no existe, cuando la registra, entonces no se guarda nada, la API responde 422 con
   el motivo y la pantalla conserva la venta actual.
5. Dado que la API no responde, entonces la pantalla avisa y conserva la venta actual para intentarlo de nuevo.

## RF-10 Guardar productos, ventas y detalles con sus relaciones

Tres tablas: `productos`, `ventas` y `detalles_venta`. Cada detalle de venta apunta a su venta y a su producto
con llaves foráneas (una columna que apunta a una fila de otra tabla). Un producto tiene un solo detalle en
cada venta.

- **Origen:** PDF §4, "Persistencia de datos": "Se evaluará que el diseño mantenga correctamente la relación
  entre una venta y los productos incluidos en ella".
- **Reglas:** RN-01 a RN-03, RN-06, RN-07, RN-12, RN-13.
- **Datos mínimos** (los tipos exactos los fijan las tarjetas P-01 y V-01):

| Tabla | Columnas |
|---|---|
| `productos` | `id`, `nombre`, `precio`, `codigo_barras` (único) |
| `ventas` | `id`, `fecha`, `total` |
| `detalles_venta` | `id`, `venta_id` → `ventas`, `producto_id` → `productos`, `cantidad`, `precio_aplicado`, `subtotal`; único `venta_id` + `producto_id` |

Criterios de aceptación:
1. Dada una venta registrada, cuando se consulta con un `JOIN`, entonces cada detalle muestra el nombre de su
   producto.
2. Dado un producto que está en una venta, cuando se intenta borrar en MySQL, entonces la base lo impide
   (`ON DELETE RESTRICT`).
3. Dado un detalle con cantidad 0 o con precio aplicado negativo, entonces MySQL lo rechaza (restricciones
   `CHECK`).
4. Las tablas se crean desde cero con migraciones y con los comandos del README.

## RF-11 Registrar venta con `sp_registrar_venta`

La API registra la venta llamando al procedimiento almacenado `sp_registrar_venta`, una función guardada dentro
de MySQL. El procedimiento recibe los detalles, crea la venta y sus detalles, calcula los subtotales y el total,
y devuelve el número de la venta y el total. Si algo falla, deshace todo (`ROLLBACK`) y avisa con un error propio
(`SIGNAL SQLSTATE '45000'`).

- **Origen:** PDF §5, "Procedimiento almacenado MySQL - obligatorio", y "Tecnologías requeridas": "Al menos un
  procedimiento almacenado MySQL utilizado realmente por la solución".
- **Reglas:** RN-08, RN-10, RN-11, RN-12.

Criterios de aceptación:
1. El script SQL está en el repositorio. Se crea con una migración y también con el cliente `mysql`, siguiendo
   el README.
2. La API lo usa de verdad: si se borra el procedimiento, registrar venta falla.
3. Dada una lista con un producto que no existe, cuando se llama al procedimiento, entonces no queda ninguna
   venta ni ningún detalle nuevo.
4. Dada una lista vacía, entonces el procedimiento responde con el error 45000.
5. El README dice su objetivo, dónde está su archivo SQL y desde qué archivo y función de la API se llama.

## RF-12 Agregar con un código de barras exacto

Si el cajero escribe o escanea un código de barras completo y presiona Enter, el producto entra directo a la
venta actual, sin elegirlo en los resultados.

- **Origen:** propuesta del agente. Opcional, por confirmar (pregunta abierta 5).

Criterios de aceptación:
1. Dado "7501055300075" y Enter, entonces la leche entra a la venta actual y el campo de búsqueda se limpia.
2. Dado un código de barras que no existe y Enter, entonces se ve "No hay un producto con ese código de barras".

## Reglas de negocio

Una regla de negocio (RN) se cumple siempre, venga de donde venga el dato: la pantalla avisa, la API valida y
la base de datos la protege.

| RN | Regla | Origen |
|---|---|---|
| RN-01 | Todo producto tiene nombre, precio y código de barras. | PDF §1 |
| RN-02 | El precio es mayor que 0 y tiene 2 decimales como máximo. La API rechaza 10.999, porque MySQL lo redondearía a 11.00 sin dar error. El máximo está en la pregunta abierta 4. | Propuesta, por confirmar el máximo |
| RN-03 | El código de barras es único: no hay dos productos con el mismo. Se guarda como texto (`VARCHAR`) para no perder los ceros de la izquierda. | Propuesta |
| RN-04 | El nombre y el código de barras se guardan sin espacios en los extremos y no pueden quedar vacíos. Largo máximo: 120 caracteres el nombre y 50 el código de barras. | Propuesta, por confirmar los largos |
| RN-05 | El precio aplicado empieza igual al precio del producto, y cambiarlo no cambia el precio del producto. Es 0 o más, con 2 decimales como máximo. | Glosario; el 0 está en la pregunta abierta 1 |
| RN-06 | La cantidad es un número entero, 1 o más. El máximo está en la pregunta abierta 4. | Decisión de la persona desarrolladora |
| RN-07 | Un producto tiene un solo detalle en la venta actual y en la venta. Si se agrega otra vez, su cantidad sube en 1. | Decisión de la persona desarrolladora |
| RN-08 | Subtotal = precio aplicado × cantidad. Total = suma de los subtotales. | Glosario |
| RN-09 | La pantalla muestra el total de la venta actual mientras se arma. El que vale es el que calcula la base de datos al registrar la venta. | Glosario |
| RN-10 | Una venta sin detalles no se registra. | Propuesta |
| RN-11 | Registrar venta es todo o nada: si falla un detalle, no se guarda nada de esa venta. | Glosario |
| RN-12 | Cada venta guarda su fecha, y la pone la base de datos. | Propuesta |
| RN-13 | Un producto que está en una venta no se puede borrar. | Propuesta; AIPOS no borra productos, pero la base lo protege igual |
