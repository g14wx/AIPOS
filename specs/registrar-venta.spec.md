---
name: Registrar venta
description: Tablas ventas y detalles_venta, procedimiento almacenado sp_registrar_venta, POST /api/ventas y el botón "Registrar venta" de la pantalla, todo o nada
targets:
  - ../backend/db/migrations/*-crear-ventas.js
  - ../backend/db/migrations/*-crear-detalles-venta.js
  - ../backend/db/migrations/*-crear-sp-registrar-venta.js
  - ../backend/db/procedimientos/sp_registrar_venta.sql
  - ../backend/src/models/Venta.js
  - ../backend/src/models/DetalleVenta.js
  - ../backend/src/models/index.js
  - ../backend/src/routes/ventas.js
  - ../backend/src/routes/index.js
  - ../backend/src/controllers/ventas.js
  - ../backend/src/services/ventas.js
  - ../backend/src/validators/ventas.js
  - ../backend/docs/openapi.yaml
  - ../frontend/src/api/ventas.js
  - ../frontend/src/components/RegistrarVenta.vue
  - ../frontend/src/components/VentaActual.vue
  - ../frontend/src/assets/animaciones/venta-registrada.json
---

# Registrar venta

Esta spec cubre el flujo 04 (`requerimientos/flujos/04-registrar-venta.md`): el cajero presiona "Registrar venta" y la
venta actual queda en MySQL con todos sus detalles de venta, de una sola vez. Si algo falla, no se guarda nada y la
venta actual sigue en la pantalla.

Se apoya en `specs/arquitectura.spec.md` (capas, formato de error, dinero, procedimientos almacenados, pruebas en
local) y no repite lo que esa spec ya dice. Si esta spec choca con otro documento, manda este orden:
`requerimientos/`, `specs/arquitectura.spec.md`, esta spec, las reglas de los tiles.

Los archivos y los `[@test]` de abajo los escriben las tarjetas que implementan cada parte:

| Parte | Tarjeta | Área | Rama de tarjeta (sale de `feature/ventas`) |
|---|---|---|---|
| Tablas `ventas` y `detalles_venta`, y modelos `Venta` y `DetalleVenta` | V-01 | Base de datos | `feature/v-01-tablas-ventas` |
| Procedimiento `sp_registrar_venta` y su migración | V-02 | Base de datos | `feature/v-02-sp-registrar-venta` |
| `POST /api/ventas` y su documentación en la API | V-03 | Backend | `feature/v-03-api-registrar-venta` |
| Botón "Registrar venta" y su resultado en la pantalla | V-08 | Frontend | `feature/v-08-boton-registrar-venta` |

Las cuatro tarjetas son del entregable ventas: cada una trabaja en su rama de tarjeta, que sale de `feature/ventas`, y su
PR va a `feature/ventas` (spec de arquitectura, "Git y entrega"). V-01 es la tarjeta dueña de esta spec: su primera
subtarea ("escribir `specs/registrar-venta.spec.md`") es este archivo.

## Reglas de negocio

Salen de `requerimientos/02-requerimientos-funcionales.md`. Cada una se cumple venga de donde venga el dato: la pantalla
avisa, la API valida y la base de datos la protege.

| RN | Regla | Dónde se cumple |
|---|---|---|
| RN-05 | El precio aplicado es 0 o más, hasta 99 999.99, con 2 decimales como máximo. | Pantalla (V-05), API, procedimiento (lee el precio como texto y rechaza los decimales de más) y `CHECK` |
| RN-06 | La cantidad es un entero de 1 a 999. | Pantalla (V-06), API, `CHECK` y procedimiento |
| RN-07 | Un producto tiene un solo detalle de venta en cada venta. | API, procedimiento e índice único `venta_id` + `producto_id` |
| RN-08 | Subtotal = precio aplicado × cantidad. Total = suma de los subtotales. | Solo MySQL, dentro del procedimiento |
| RN-09 | El total que vale es el que calcula MySQL al registrar la venta. | La pantalla muestra el que devuelve la API |
| RN-10 | Una venta sin detalles no se registra. | Pantalla (botón deshabilitado), API (400) y procedimiento (45000) |
| RN-11 | Registrar venta es todo o nada. | Procedimiento con su propia transacción |
| RN-12 | Cada venta guarda su fecha, y la pone la base de datos. | `DEFAULT CURRENT_TIMESTAMP` |
| RN-13 | Un producto que está en una venta no se puede borrar. | Llave foránea `ON DELETE RESTRICT` |
| RN-14 | Una venta tiene como máximo 100 detalles de venta. Con 100 detalles de 999 × 99 999.99 el total llega a 9 989 999 001.00 y cabe en `DECIMAL(12,2)`; con 101 se desbordaría. La resolvió el orquestador; la persona desarrolladora puede confirmarla o revertirla (ver preguntas). | Pantalla (no agrega el detalle 101; el botón y `valida`), API (400) y procedimiento (`DEMASIADOS_DETALLES`) |

## Tablas y modelos (V-01)

Dos migraciones de sequelize-cli, en CommonJS, con `up` y `down`. Se aplican después de la de `productos` (P-01), y las
tres se pueden correr con `migrar`, `deshacer` y `rehacer` desde cero. Los tipos del dinero son los de "Dinero" de la spec
de arquitectura. Las tablas no llevan `createdAt` ni `updatedAt`.

| Tabla | Columna | Tipo y restricciones |
|---|---|---|
| `ventas` | `id` | `INT` con `AUTO_INCREMENT`, llave primaria |
| `ventas` | `fecha` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`, en UTC. La pone MySQL (RN-12) |
| `ventas` | `total` | `DECIMAL(12,2) NOT NULL` |
| `detalles_venta` | `id` | `INT` con `AUTO_INCREMENT`, llave primaria |
| `detalles_venta` | `venta_id` | `INT NOT NULL`, llave foránea a `ventas.id` con `ON DELETE RESTRICT` |
| `detalles_venta` | `producto_id` | `INT NOT NULL`, llave foránea a `productos.id` con `ON DELETE RESTRICT` |
| `detalles_venta` | `cantidad` | `INT NOT NULL`, `CHECK (cantidad BETWEEN 1 AND 999)` |
| `detalles_venta` | `precio_aplicado` | `DECIMAL(10,2) NOT NULL`, `CHECK (precio_aplicado BETWEEN 0 AND 99999.99)` |
| `detalles_venta` | `subtotal` | `DECIMAL(12,2) NOT NULL` |

- Índice único `uq_detalles_venta_venta_producto` sobre `venta_id` + `producto_id`: un producto tiene un solo detalle en la
  venta (RN-07). Las restricciones `CHECK` llevan nombre (`chk_detalles_venta_cantidad`,
  `chk_detalles_venta_precio_aplicado`), para que el error de MySQL diga cuál falló.
  `[@test] ../backend/tests/base-de-datos/restricciones-ventas.test.js`
- Las tablas se crean desde cero y se pueden deshacer y volver a crear. `deshacer` borra `detalles_venta` antes que
  `ventas`.
  `[@test] ../backend/tests/base-de-datos/migraciones-ventas.test.js`
- Los tipos son los de la tabla: `ventas.total` y `detalles_venta.subtotal` en `DECIMAL(12,2)`, `precio_aplicado` en
  `DECIMAL(10,2)`, y `mysql2` los devuelve como texto.
  `[@test] ../backend/tests/base-de-datos/tipos-de-dinero.test.js`
- MySQL rechaza un detalle con cantidad 0, con cantidad 1000, con precio aplicado negativo y con precio aplicado mayor que
  99 999.99 (error 3819, restricción `CHECK`).
  `[@test] ../backend/tests/base-de-datos/restricciones-ventas.test.js`
- MySQL rechaza un detalle que apunta a un producto que no existe o a una venta que no existe (error 1452), y un segundo
  detalle con el mismo producto en la misma venta (error 1062).
  `[@test] ../backend/tests/base-de-datos/restricciones-ventas.test.js`
- Un producto que está en una venta no se puede borrar (error 1451, `ON DELETE RESTRICT`), y una venta con detalles
  tampoco (RN-13).
  `[@test] ../backend/tests/base-de-datos/restricciones-ventas.test.js`

Los modelos siguen "Capas" de la spec de arquitectura:

- `Venta` (tabla `ventas`) y `DetalleVenta` (tabla `detalles_venta`), con `tableName` explícito, `freezeTableName: true`,
  `underscored: true` y `timestamps: false`. Los campos de JavaScript van en `camelCase` (`ventaId`, `productoId`,
  `precioAplicado`) y se traducen a la columna con `field`. El dinero es `DataTypes.DECIMAL(10, 2)` y `DECIMAL(12, 2)`.
- Relaciones, con la llave foránea fijada a mano para que Sequelize no invente `VentaId` ni `ProductoId`: una venta tiene
  muchos detalles (`Venta.hasMany(DetalleVenta, { as: 'detalles', foreignKey: 'ventaId' })`); cada detalle es de una venta
  y de un producto (`DetalleVenta.belongsTo(Venta, { foreignKey: 'ventaId' })` y
  `DetalleVenta.belongsTo(Producto, { as: 'producto', foreignKey: 'productoId' })`); un producto puede estar en muchos
  detalles (`Producto.hasMany(DetalleVenta, { foreignKey: 'productoId' })`). Todas con `onDelete: 'RESTRICT'`. El atributo
  `ventaId` del modelo es el único que apunta a `venta_id`.
- Registrar una venta no usa estos modelos: la escritura la hace el procedimiento. Los modelos sirven para consultar (por
  ejemplo, una venta con sus detalles y el nombre de cada producto) y para las pruebas.
  `[@test] ../backend/tests/base-de-datos/modelos-venta.test.js`

Criterios de aceptación de V-01:

1. Dada una venta registrada, cuando se consulta con un `JOIN` entre `detalles_venta` y `productos`, entonces cada detalle
   muestra el nombre de su producto.
   `[@test] ../backend/tests/base-de-datos/modelos-venta.test.js`
2. Dado un producto que está en una venta, cuando se intenta borrar en MySQL, entonces la base lo impide.
   `[@test] ../backend/tests/base-de-datos/restricciones-ventas.test.js`
3. Dado un detalle con cantidad 0 o con precio aplicado negativo, entonces MySQL lo rechaza.
   `[@test] ../backend/tests/base-de-datos/restricciones-ventas.test.js`
4. Dada una base vacía, cuando se corre `npm run migrar`, entonces se crean las tablas; `npm run rehacer` las borra y las
   vuelve a crear sin error.
   `[@test] ../backend/tests/base-de-datos/migraciones-ventas.test.js`

Patrón: no se agrega una capa Repository ni Data Mapper (ver la spec de arquitectura). El modelo de Sequelize es
suficiente para consultar, y la escritura de la venta la resuelve el procedimiento.

## Procedimiento sp_registrar_venta (V-02)

El objetivo: guardar una venta y todos sus detalles de una vez, dentro de MySQL, y devolver el número de la venta y su
total. Es el procedimiento almacenado obligatorio del PDF.

### Archivos

- `backend/db/procedimientos/sp_registrar_venta.sql`: `DROP PROCEDURE IF EXISTS sp_registrar_venta;` y después el bloque
  `CREATE PROCEDURE … END` entre `DELIMITER $$` y `$$`, para que también corra con el cliente `mysql`, con el usuario de la
  app y nunca con `root`.
- `backend/db/migrations/<marca>-crear-sp-registrar-venta.js`: lee ese mismo `.sql`, saca lo que está entre `DELIMITER $$`
  y el `$$` final, y manda `DROP` y `CREATE PROCEDURE … END` en dos llamadas separadas a `queryInterface.sequelize.query()`.
  Su `down` hace `DROP PROCEDURE IF EXISTS`. Nunca manda `DELIMITER`, ni `DEFINER=`, ni `CREATE OR REPLACE PROCEDURE`, y no
  activa `multipleStatements`. Es la migración más nueva de las de ventas, porque el procedimiento usa las dos tablas.
  `[@test] ../backend/tests/base-de-datos/sp-registrar-venta-migracion.test.js`
- El procedimiento queda creado por el usuario de la app (`DEFINER` es ese usuario, no `root`), tanto con la migración como
  con el cliente `mysql`. Las dos formas se prueban.
  `[@test] ../backend/tests/base-de-datos/sp-registrar-venta-migracion.test.js`
  `[@test] ../backend/tests/base-de-datos/sp-registrar-venta-cliente-mysql.test.js`
- La prueba con el cliente `mysql` corre el `.sql` con `docker compose exec -T mysql mysql` (o con el cliente `mysql` del
  PATH), contra la base de prueba y con el usuario de la app. Si no hay ninguno de los dos, la prueba se marca como omitida
  con el motivo en el reporte, y la persona desarrolladora la hace a mano con el comando de "Pruebas en local".
- Para cambiarlo después de entregarlo, se agrega una migración nueva que lo borra y lo crea otra vez. Nunca se edita una
  migración que ya corrió.

### Parámetro y respuesta

```sql
CREATE PROCEDURE sp_registrar_venta(IN p_detalles JSON)
```

`p_detalles` es un arreglo JSON de 1 a 100 objetos, uno por detalle de venta:

```json
[
  { "productoId": 3, "cantidad": 2, "precioAplicado": "22.00" },
  { "productoId": 7, "cantidad": 1, "precioAplicado": "3.50" }
]
```

Devuelve **un solo `SELECT` al final**, con una fila y dos columnas: `ventaId` (el número de la venta) y `total` (texto
con 2 decimales, por ejemplo `47.50`). No usa parámetros `OUT` ni deja otros `SELECT` sueltos.
`[@test] ../backend/tests/base-de-datos/sp-registrar-venta-calculo.test.js`

### Qué hace, en orden

1. `START TRANSACTION`, con `DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;` declarado antes.
2. Revisa las reglas. Si una falla, `SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '<CÓDIGO>'`, el manejador hace `ROLLBACK` y
   el error llega a la API (errno 1644). Se revisan en este orden, y gana la primera que falle:

| Código en `MESSAGE_TEXT` | Cuándo |
|---|---|
| `VENTA_SIN_DETALLES` | `p_detalles` es `NULL`, no es un arreglo o está vacío (RN-10). |
| `DEMASIADOS_DETALLES` | `p_detalles` tiene más de 100 elementos. |
| `DETALLE_INVALIDO` | Un elemento no es un objeto, o su `productoId` falta o no es un entero de 1 a 2 147 483 647. |
| `CANTIDAD_FUERA_DE_RANGO` | Una `cantidad` falta, no es un entero escrito con solo dígitos, o no está entre 1 y 999 (RN-06). |
| `PRECIO_FUERA_DE_RANGO` | Un `precioAplicado` falta, no tiene la forma `^[0-9]{1,5}(\.[0-9]{1,2})?$` (por ejemplo `10.999`, `-1`, `100000` o `abc`), lo que también deja el máximo en 99 999.99 (RN-05). |
| `PRODUCTO_REPETIDO` | Dos detalles con el mismo `productoId` (RN-07). |
| `PRODUCTO_NO_EXISTE` | Algún `productoId` no está en `productos`. |

3. Crea la venta (`INSERT INTO ventas (total) VALUES (0)`; la fecha la pone `DEFAULT CURRENT_TIMESTAMP`) y guarda su `id` con
   `LAST_INSERT_ID()`.
4. Crea los detalles con `INSERT … SELECT … FROM JSON_TABLE(p_detalles, '$[*]' COLUMNS (…)) AS j` y calcula cada subtotal
   en SQL con `ROUND(precio_aplicado * cantidad, 2)`. Para el paso 2, `JSON_TABLE` tiene además una columna de texto por
   campo (`VARCHAR`, por ejemplo `precio_texto VARCHAR(50) PATH '$.precioAplicado'`), y el procedimiento valida ese texto
   con `REGEXP` y rango antes de insertar. Así un `precioAplicado` de `"10.999"` se rechaza en vez de redondearse en
   silencio a `11.00`. La columna que se inserta sigue siendo `precio_aplicado DECIMAL(10,2) PATH '$.precioAplicado'`,
   como piden la spec de arquitectura y el tile de MySQL: la columna de texto solo sirve para revisar.
5. Calcula el total con `SUM(subtotal)` de los detalles recién creados y lo guarda en la venta.
6. `COMMIT` y el `SELECT` final.

- La lista viaja como un solo parámetro JSON y se lee con `JSON_TABLE` (MySQL 8.0.19 o más; el proyecto usa 8.4). El
  procedimiento nunca recibe un total: el que vale es el que calcula MySQL (RN-08 y RN-09).
- El procedimiento protege la regla aunque no lo llame la API: si se lo llama desde el cliente `mysql` con
  `precioAplicado` `"10.999"`, responde `PRECIO_FUERA_DE_RANGO` y no guarda nada. Acepta el precio y la cantidad como
  texto o como número JSON, mientras se escriban en la forma exacta de la tabla (sin notación científica, sin espacios).
  La API es más estricta (pide texto para el precio y número para la cantidad) para que el contrato sea uno solo.
- Si falla cualquier otra cosa (un error de MySQL que no es una regla), el manejador hace `ROLLBACK` y `RESIGNAL`: el error
  original llega a la API tal cual.
- Patrón: Transaction Script, como en la spec de arquitectura, más el Database Transaction Pattern del catálogo (la
  transacción de MySQL da lo de todo o nada). Para leer la lista se usa el JSON Data Handling Pattern: `JSON_TABLE` convierte
  el arreglo en filas que se insertan de una vez.

`[@test] ../backend/tests/base-de-datos/sp-registrar-venta-reglas.test.js`
`[@test] ../backend/tests/base-de-datos/sp-registrar-venta-calculo.test.js`

### Todo o nada

- Dada una lista con un producto que no existe entre productos válidos, cuando se llama al procedimiento, entonces responde
  `PRODUCTO_NO_EXISTE` y no queda ninguna venta ni ningún detalle nuevo (`COUNT(*)` de `ventas` y de `detalles_venta` igual
  que antes).
  `[@test] ../backend/tests/base-de-datos/sp-registrar-venta-todo-o-nada.test.js`
- Dado un error que no es una regla (por ejemplo, un detalle que viola una restricción `CHECK` porque la validación se
  saltó a propósito en la prueba), entonces el error llega tal cual, y no queda ninguna venta ni ningún detalle.
  `[@test] ../backend/tests/base-de-datos/sp-registrar-venta-todo-o-nada.test.js`
- Dada una lista vacía, entonces responde `VENTA_SIN_DETALLES` y no crea nada.
  `[@test] ../backend/tests/base-de-datos/sp-registrar-venta-reglas.test.js`
- Dada una lista con un `precioAplicado` de `"10.999"` llamada directo al procedimiento, entonces responde
  `PRECIO_FUERA_DE_RANGO` y no queda nada guardado (no se redondea a `11.00`).
  `[@test] ../backend/tests/base-de-datos/sp-registrar-venta-reglas.test.js`
- Dada una lista de 101 detalles, entonces responde `DEMASIADOS_DETALLES` y no queda nada guardado. Con 100 detalles de
  999 × `99999.99`, la venta se registra y el total es `9989999001.00`.
  `[@test] ../backend/tests/base-de-datos/sp-registrar-venta-calculo.test.js`
  `[@test] ../backend/tests/base-de-datos/sp-registrar-venta-reglas.test.js`

### Criterios de aceptación de V-02

1. Dada una lista de 2 detalles (2 × `22.00` y 1 × `3.50`), cuando se llama al procedimiento, entonces hay 1 fila nueva en
   `ventas` y 2 en `detalles_venta`, los subtotales son `44.00` y `3.50` y devuelve `ventaId` y `total` `47.50`.
   `[@test] ../backend/tests/base-de-datos/sp-registrar-venta-calculo.test.js`
2. Dado un precio aplicado `0`, entonces la venta se registra con subtotal `0.00`.
   `[@test] ../backend/tests/base-de-datos/sp-registrar-venta-calculo.test.js`
3. Dada la cantidad más grande (999) al precio más grande (`99999.99`), entonces el subtotal es `99899990.01` y el total no
   se desborda.
   `[@test] ../backend/tests/base-de-datos/sp-registrar-venta-calculo.test.js`
4. Dada una lista con un producto que no existe, cantidad 0, cantidad 1000, precio negativo, precio con 3 decimales, un
   producto repetido, 101 detalles o una lista vacía, entonces responde el código de la tabla y no queda nada guardado.
   `[@test] ../backend/tests/base-de-datos/sp-registrar-venta-reglas.test.js`
5. La migración y el cliente `mysql` crean el mismo procedimiento, con el usuario de la app.
   `[@test] ../backend/tests/base-de-datos/sp-registrar-venta-migracion.test.js`
6. El README (que escribe E-02) dice el objetivo del procedimiento, su archivo (`backend/db/procedimientos/sp_registrar_venta.sql`)
   y desde qué archivo y función se llama: `backend/src/services/ventas.js`, `registrarVenta`.

## API: POST /api/ventas (V-03)

Un router (`src/routes/ventas.js`, que `src/routes/index.js` monta en `/api/ventas`), un controller (`src/controllers/ventas.js`), un servicio (`src/services/ventas.js`) y
un validador (`src/validators/ventas.js`), con las capas y los límites de "Capas" de la spec de arquitectura.

```http
POST /api/ventas
Content-Type: application/json

{
  "detalles": [
    { "productoId": 3, "cantidad": 2, "precioAplicado": "22.00" },
    { "productoId": 7, "cantidad": 1, "precioAplicado": "3.50" }
  ]
}
```

| Campo | Tipo en el JSON | Regla |
|---|---|---|
| `detalles` | arreglo | Obligatorio, de 1 a 100 elementos (RN-10 y el límite de 100 detalles). |
| `detalles[i].productoId` | número entero | De 1 a 2 147 483 647 (cabe en `INT`). |
| `detalles[i].cantidad` | número entero | De 1 a 999 (RN-06). Un texto (`"2"`) o un decimal (`1.5`) es un 400. |
| `detalles[i].precioAplicado` | texto | Forma `^\d{1,5}(\.\d{1,2})?$`, de `0` a `99999.99` (RN-05). Un número JSON (`22.5`) es un 400. |

- Un producto no puede repetirse en `detalles` (RN-07): el segundo `productoId` igual es un 400 que apunta a él.
- Más de 100 detalles es un 400 con el campo `detalles` y el mensaje "Una venta puede tener como máximo 100 productos.".
  Es el límite que evita que el total pase de `DECIMAL(12,2)` (9 999 999 999.99) con datos válidos.
- Los campos que no están en la tabla se ignoran y no se pasan al procedimiento. El validador devuelve solo `productoId`,
  `cantidad` y `precioAplicado` de cada detalle.
- La API no recibe un total ni un subtotal. Si el cuerpo trae uno, se ignora: el que vale es el de MySQL (RN-09).
- La validación va en el controller, antes de llamar al servicio, con `src/validators/ventas.js` y las piezas de
  `comunes.js` (`validarDinero` con `permiteCero: true`, porque el precio aplicado puede ser 0 (RN-05), y
  `validarEnteroEnRango`). Devuelve todos los campos con problema, no solo el
  primero. Patrón: Input Validation. La API no confía en la pantalla, porque se le puede llamar con `curl`.
  `[@test] ../backend/tests/ventas/validador-venta.test.js`

### Respuestas

Todas siguen el formato de error de la spec de arquitectura (RNF-05).

| Estado | Cuerpo | Cuándo |
|---|---|---|
| 201 | `{ "ventaId": 15, "total": "47.50" }` | La venta y sus detalles quedaron guardados. `total` es el que calculó MySQL, como texto. |
| 400 | `DATOS_INVALIDOS`, con `detalles` por campo (por ejemplo `{ "campo": "detalles[1].cantidad", "mensaje": "Debe ser un entero de 1 a 999." }`) | El cuerpo no cumple la tabla de arriba, incluida una lista vacía o un cuerpo que no es un objeto JSON. |
| 400 | `JSON_INVALIDO` o `CUERPO_MUY_GRANDE` | JSON mal escrito, o un cuerpo de más de 100 kb (los da la spec de arquitectura). |
| 404 | `NO_ENCONTRADO` | `GET /api/ventas` o cualquier otro verbo: la ruta solo acepta `POST`. |
| 422 | El código del procedimiento, por ejemplo `PRODUCTO_NO_EXISTE` | El procedimiento rechazó la venta con `SQLSTATE 45000`. |
| 500 | `ERROR_INTERNO` | Cualquier otro error, incluido que el procedimiento no exista. |

- `201`: el cuerpo tiene solo `ventaId` (entero) y `total` (texto con 2 decimales). El servicio lee `filas[0]` del `CALL`.
  `[@test] ../backend/tests/ventas/registrar-venta.test.js`
- `400`: cada regla de la tabla tiene su caso (sin `detalles`, `detalles` que no es arreglo, lista vacía, elemento que no es
  objeto, `productoId` con texto o menor que 1, `cantidad` 0, 1000, `"2"` o `1.5`, `precioAplicado` con número JSON,
  `"10.999"`, `"-1"`, `"100000"` o `"abc"`, un producto repetido y 101 detalles). En cada uno no se crea ninguna venta.
  `[@test] ../backend/tests/ventas/validacion.test.js`
- `422`: cada código de la tabla del procedimiento se traduce con el código de `MESSAGE_TEXT` y un mensaje en español para
  el cajero, que sale de una tabla en `src/services/ventas.js`:

| Código | Mensaje |
|---|---|
| `VENTA_SIN_DETALLES` | La venta no tiene productos. Agrega al menos uno. |
| `DEMASIADOS_DETALLES` | Una venta puede tener como máximo 100 productos. |
| `DETALLE_INVALIDO` | Un producto de la venta tiene datos inválidos. |
| `CANTIDAD_FUERA_DE_RANGO` | La cantidad debe ser un número entero de 1 a 999. |
| `PRECIO_FUERA_DE_RANGO` | El precio aplicado debe estar entre 0 y 99 999.99. |
| `PRODUCTO_REPETIDO` | Un producto aparece dos veces en la venta. |
| `PRODUCTO_NO_EXISTE` | Un producto de la venta ya no existe. Revisa la venta actual. |

  Un código que no está en la tabla usa `REGLA_DE_NEGOCIO` y el mensaje "La venta no cumple una regla de negocio."
  Como la API valida antes, un 422 llega en la práctica solo con `PRODUCTO_NO_EXISTE` (un producto que se borró de MySQL
  después de que el cajero lo agregó a la venta actual). Las pruebas de los otros códigos llaman al servicio saltándose el
  validador.
  `[@test] ../backend/tests/ventas/regla-de-negocio.test.js`
- `500`: el mensaje es "Ocurrió un error inesperado. Intenta de nuevo." y el cuerpo no trae el stack, el texto del SQL ni el
  mensaje original. El error completo se escribe en el log del servidor con `console.error`.
  `[@test] ../backend/tests/ventas/error-inesperado.test.js`
- Si un `productoId` desapareciera entre la revisión del procedimiento y el `INSERT`, la llave foránea da el error 1452 y la
  API responde 404 (`NO_ENCONTRADO`), por la traducción de `src/errors/desdeBaseDeDatos.js`. No hay una prueba propia: el
  procedimiento revisa antes, y AIPOS no borra productos.

### El servicio y el procedimiento

- `registrarVenta(detalles)` en `src/services/ventas.js` llama al procedimiento con
  `sequelize.query('CALL sp_registrar_venta(:detalles)', { replacements: { detalles: JSON.stringify(detalles) } })` y lee
  `filas[0]`. Sin `QueryTypes.SELECT`, sin comentario antes del `CALL`, sin parámetros `OUT` y sin `sequelize.transaction()`:
  el `START TRANSACTION` del procedimiento haría `COMMIT` de lo que Sequelize tuviera abierto.
  `[@test] ../backend/tests/ventas/usa-el-procedimiento.test.js`
  `[@test] ../backend/tests/ventas/sin-transaccion-externa.test.js`
- La API usa el procedimiento de verdad, no una copia en JavaScript: si se borra `sp_registrar_venta`, registrar una venta
  responde 500 y no guarda nada. La prueba lo borra, comprueba el 500 y lo vuelve a crear con el mismo `.sql` que usa la
  migración.
  `[@test] ../backend/tests/ventas/usa-el-procedimiento.test.js`
- El servicio no suma ni multiplica dinero: devuelve el `total` como texto, tal como lo devuelve `mysql2`.
- Todo o nada, desde la API: dada una venta con un producto que no existe entre productos válidos, entonces responde 422 y
  `ventas` y `detalles_venta` tienen las mismas filas que antes.
  `[@test] ../backend/tests/ventas/todo-o-nada.test.js`
- Dos peticiones iguales al mismo tiempo crean dos ventas distintas, cada una completa: no hay filas mezcladas.
  `[@test] ../backend/tests/ventas/todo-o-nada.test.js`
- Patrón: Layered Architecture con Service Layer, como en la spec de arquitectura. Front Controller (el más cercano) para los
  errores: el mismo manejador de errores da el 400, el 422 y el 500.

### Documentación de la API

V-03 documenta `POST /api/ventas` en la documentación de la API (A-01), con el mismo contrato de esta sección: el cuerpo, un
ejemplo del 201, del 400, del 422 y del 500. Sigue el formato y el archivo (`backend/docs/openapi.yaml`) que fija la spec
de documentación de la API, y agrega la ruta a `montajes`. Si A-01 todavía no está integrada cuando V-03 termina, V-03
deja la ruta lista para documentar y lo anota en su "Update".
`[@test] ../backend/tests/ventas/documentacion-registrar-venta.test.js`

### Criterios de aceptación de V-03

1. Dado un cuerpo con 2 detalles válidos, cuando se llama a `POST /api/ventas`, entonces responde 201 con `ventaId` y
   `total` `47.50`, y hay 1 fila nueva en `ventas` y 2 en `detalles_venta`.
   `[@test] ../backend/tests/ventas/registrar-venta.test.js`
2. Dado un cuerpo sin detalles, con 101 detalles, con una cantidad fuera de rango o con un precio aplicado con 3 decimales,
   entonces responde 400 con el campo y el motivo, y no se guarda nada.
   `[@test] ../backend/tests/ventas/validacion.test.js`
3. Dado un producto que ya no existe, entonces responde 422 `PRODUCTO_NO_EXISTE` con su mensaje, y no se guarda nada.
   `[@test] ../backend/tests/ventas/regla-de-negocio.test.js`
4. Dado un error inesperado de MySQL, entonces responde 500 sin detalles internos.
   `[@test] ../backend/tests/ventas/error-inesperado.test.js`
5. La API usa el procedimiento: si se borra, registrar venta falla, y el `CALL` no va dentro de `sequelize.transaction()`.
   `[@test] ../backend/tests/ventas/usa-el-procedimiento.test.js`
   `[@test] ../backend/tests/ventas/sin-transaccion-externa.test.js`
6. Ningún archivo de `src/` fuera de `services/` y `models/` habla con la base de datos (RNF-06).
   `[@test] ../backend/tests/estructura.test.js`

### Riesgo conocido: reintento cuando la respuesta se pierde

Si MySQL guarda la venta pero la respuesta no llega a la pantalla (el tiempo máximo de 10 segundos de axios o un corte de
red), la pantalla muestra el error y conserva la venta actual, y un segundo intento crearía una venta repetida. El catálogo
de patrones trae Keyed Idempotency (una llave enviada por la pantalla que la API reconoce), pero los requerimientos no la
piden y agregaría una columna y una regla nuevas. Esta spec no la incluye. Queda como pregunta para la persona
desarrolladora.

## Pantalla: botón "Registrar venta" (V-08)

El botón y el resultado viven en un componente nuevo, `src/components/RegistrarVenta.vue`, de Vue 2 con el Options API y
un solo elemento raíz. `VentaActual.vue` (V-04) lo muestra junto al total, le pasa `detalles` y `valida`, y escucha `registrada` y `update:enviando`. La pantalla se diseña con la skill `impeccable`,
con la paleta y los contrastes de "Diseño de la pantalla" de la spec de arquitectura.

### Contrato del componente

| | Nombre | Qué es |
|---|---|---|
| Propiedad | `detalles` | Los detalles de la venta actual que se van a enviar. Cada uno lleva `productoId`, `cantidad` (entero) y `precioAplicado` (texto con 2 decimales). |
| Propiedad | `valida` | `true` si la venta actual tiene de 1 a 100 detalles y todo es válido. Lo calcula la lógica de `src/ventaActual/` (V-04 a V-07), no el componente. |
| Evento | `registrada` | Se emite con `{ ventaId, total }` cuando la API responde 201. |
| Evento | `update:enviando` | Se emite con `true` al empezar a enviar y con `false` al terminar. `VentaActual.vue` lo usa con `:enviando.sync` para deshabilitar agregar, editar y eliminar mientras dura el envío. |

Al recibir `registrada`, `VentaActual.vue` emite `update:ventaActual` con la venta actual vacía (`vaciarVentaActual()`, de
`src/ventaActual/`), y `App.vue` la guarda con `guardarVentaActual` (de `src/ventaActual/almacenamiento.js`, el único
que toca `localStorage`), que borra la llave `aipos.ventaActual`. `App.vue` es el único que guarda la venta actual, como
define la spec de armar la venta actual. `RegistrarVenta.vue` no toca `localStorage` ni importa `axios`: llama a
`registrarVenta` de `src/api/ventas.js`.

### Qué hace

- **Botón.** Dice "Registrar venta". Está deshabilitado cuando `valida` es `false` (venta actual vacía o con un dato inválido,
  RN-10), cuando `detalles` está vacío o tiene más de 100 elementos (en ese caso muestra "Una venta puede tener como máximo
  100 productos."), y mientras se envía. El componente revisa el máximo por su cuenta, sin depender de `valida`. Tiene el color primario y su texto en `#292F36`.
  `[@test] ../frontend/tests/componentes/RegistrarVenta.test.js`
- **Doble clic.** Al empezar a enviar, una marca `enviando` se pone en `true` antes de llamar a la API, y el método sale sin
  hacer nada si ya está en `true`. Dos clics seguidos, incluso en el mismo instante, mandan una sola petición.
  `[@test] ../frontend/tests/componentes/RegistrarVenta.test.js`
- **Envío.** Llama a `registrarVenta(detalles)` de `src/api/ventas.js`, que manda `POST /api/ventas` con
  `{ detalles: [{ productoId, cantidad, precioAplicado }] }` y solo esos tres campos de cada detalle. La función devuelve
  `{ ventaId, total }` o lanza el `Error` con `status`, `codigo`, `mensaje` y `detalles` que arma `src/api/http.js`.
  `[@test] ../frontend/tests/api/registrar-venta.test.js`
- **Éxito (201).** Muestra una franja con `role="status"` (se anuncia a los lectores de pantalla) que dice
  **"Venta 15 registrada · Total 47.50"**, con los valores que devolvió la API, sin símbolo de moneda y sin recalcular en la
  pantalla. Junto al texto va la animación Lottie `venta-registrada.json` en `AnimacionLottie.vue`, una sola vez (sin
  repetirse). Emite `registrada` y la venta actual queda vacía, también en el navegador.
  `[@test] ../frontend/tests/componentes/RegistrarVenta.test.js`
- **La franja de éxito** se queda hasta que el cajero la cierra con su botón "Cerrar" o registra otra venta; no desaparece
  sola, para que el cajero alcance a leer el total.
  `[@test] ../frontend/tests/componentes/RegistrarVenta.test.js`
- **Error 400 o 422.** Muestra `mensaje` (y, si hay, los `detalles` del 400, uno por línea) en una franja de error con
  borde e ícono `#FF6B6B` y el texto en `#292F36`, con `role="alert"`. La venta actual queda intacta y el botón se habilita
  otra vez.
  `[@test] ../frontend/tests/componentes/RegistrarVenta.test.js`
- **Error 500.** Muestra el mensaje de la API ("Ocurrió un error inesperado. Intenta de nuevo."). La venta actual queda
  intacta y el botón se habilita otra vez.
  `[@test] ../frontend/tests/componentes/RegistrarVenta.test.js`
- **Sin respuesta** (`status` 0 y `codigo` `SIN_CONEXION`: la API está caída o pasó el tiempo máximo). Muestra "No se pudo conectar con el servidor.
  Tu venta sigue aquí: intenta de nuevo." La venta actual queda intacta y el botón se habilita otra vez. Ver el riesgo
  conocido de "API".
  `[@test] ../frontend/tests/componentes/RegistrarVenta.test.js`
- El mensaje de un error anterior desaparece al empezar un nuevo envío y al tener éxito.
  `[@test] ../frontend/tests/componentes/RegistrarVenta.test.js`
- La venta actual solo se vacía cuando la API confirmó la venta con un 201 (RNF-05). Un error, del tipo que sea, nunca la
  toca.
  `[@test] ../frontend/tests/componentes/RegistrarVenta.test.js`
- Ningún texto del cajero ni de la API entra con `v-html` (RNF-04): el `mensaje` se muestra como texto.
  `[@test] ../frontend/tests/componentes/RegistrarVenta.test.js`

### Animación

- `venta-registrada.json` va en `frontend/src/assets/animaciones/`, en los colores de la paleta, pesa menos de 50 KB y dura
  cerca de 1.5 segundos, sin repetirse. La crea V-08 con el MCP `lottiefiles-creator` o, si la sesión no lo tiene, con la
  skill `text-to-lottie`. La revisa la prueba de animaciones de la spec de arquitectura.
  `[@test] ../frontend/tests/animaciones.test.js`
- Con `prefers-reduced-motion: reduce` no se anima: `AnimacionLottie.vue` muestra un solo cuadro fijo, el último por
  defecto (`cuadroFijo`; lo prueba B-04). `RegistrarVenta.vue` solo le pasa `animacion` y `loop` en `false`, y el texto
  de al lado dice lo mismo que la animación.
  `[@test] ../frontend/tests/componentes/AnimacionLottie.test.js`
  `[@test] ../frontend/tests/componentes/RegistrarVenta.test.js`
- En las pruebas, `lottie-web` se sustituye con `vi.mock`, porque jsdom no dibuja.
- Patrón: Facade para `src/api/ventas.js` (los componentes no saben de rutas ni de axios), y Adapter para
  `AnimacionLottie.vue`, como en la spec de arquitectura. Para el componente de esta pantalla (deshabilitar el botón
  mientras se envía y mostrar éxito o error) ningún patrón del catálogo encaja: se resuelve con una marca `enviando` y un
  estado de resultado en el componente.

### Criterios de aceptación de V-08

1. Dada una venta actual con 2 detalles válidos, cuando el cajero presiona "Registrar venta", entonces se manda una petición
   a `POST /api/ventas`, la pantalla muestra "Venta 15 registrada · Total 47.50" con los valores de la API, la venta actual
   queda vacía y `aipos.ventaActual` ya no tiene detalles: si se recarga la página, sigue vacía.
   `[@test] ../frontend/tests/componentes/RegistrarVenta.test.js`
2. Dada una venta actual vacía, con un dato inválido o con 101 detalles, entonces "Registrar venta" está deshabilitado (con 101,
   avisa el máximo de 100 productos).
   `[@test] ../frontend/tests/componentes/RegistrarVenta.test.js`
3. Dado un doble clic en "Registrar venta", entonces se registra una sola venta.
   `[@test] ../frontend/tests/componentes/RegistrarVenta.test.js`
4. Dada una respuesta 422 (por ejemplo, un producto que ya no existe), entonces se muestra el motivo, la venta actual
   conserva todos sus detalles y el botón se habilita otra vez.
   `[@test] ../frontend/tests/componentes/RegistrarVenta.test.js`
5. Dada una respuesta 400, entonces se muestra el motivo con los campos, y la venta actual sigue igual.
   `[@test] ../frontend/tests/componentes/RegistrarVenta.test.js`
6. Dado que la API no responde, entonces la pantalla avisa, conserva la venta actual y habilita el botón para intentarlo de
   nuevo.
   `[@test] ../frontend/tests/componentes/RegistrarVenta.test.js`
7. Dado que el sistema pide menos movimiento, entonces la animación de éxito no se mueve, y el texto dice lo mismo.
   `[@test] ../frontend/tests/componentes/AnimacionLottie.test.js`
8. Ningún componente importa `axios` ni escribe una URL: `RegistrarVenta.vue` solo llama a `registrarVenta`.
   `[@test] ../frontend/tests/sin-axios-en-componentes.test.js`

## Pruebas en local

Además de las pruebas automáticas, cada tarjeta prueba su parte con el sistema corriendo de verdad, como pide la spec de
arquitectura. El agente corre estos pasos y anota el resultado en su "Update" de la tarjeta. Antes: `docker compose up -d
--wait mysql`, y en `backend/`: `npm run migrar` y `npm run dev`. Para la pantalla, `npm run dev` en `frontend/`.

### API, con `curl` (V-03)

Se necesitan dos productos. Se crean con `POST /api/productos` (P-02) y se anotan los `id` de la respuesta como
`ID_LECHE` y `ID_PAN`. Con el backend en `http://localhost:3000`:

| # | Comando | Respuesta esperada |
|---|---|---|
| 1 | `curl -i -X POST localhost:3000/api/ventas -H 'Content-Type: application/json' -d '{"detalles":[{"productoId":ID_LECHE,"cantidad":2,"precioAplicado":"22.00"},{"productoId":ID_PAN,"cantidad":1,"precioAplicado":"3.50"}]}'` | `201` y `{"ventaId":<n>,"total":"47.50"}` |
| 2 | La misma llamada con `"precioAplicado":"0"` en los dos detalles | `201` y `"total":"0.00"` |
| 3 | `-d '{"detalles":[]}'` | `400` `DATOS_INVALIDOS` |
| 4 | `-d '{}'` | `400` `DATOS_INVALIDOS` |
| 5 | Un detalle con `"cantidad":1000` | `400` `DATOS_INVALIDOS`, con `detalles[0].cantidad` |
| 6 | Un detalle con `"cantidad":"2"` | `400` `DATOS_INVALIDOS` |
| 7 | Un detalle con `"precioAplicado":"10.999"` | `400` `DATOS_INVALIDOS`, con `detalles[0].precioAplicado` |
| 8 | Un detalle con `"precioAplicado":22.5` (número) | `400` `DATOS_INVALIDOS` |
| 9 | Dos detalles con el mismo `productoId` | `400` `DATOS_INVALIDOS` |
| 10 | `-d '{"detalles":[`  (JSON roto) | `400` `JSON_INVALIDO` |
| 11 | Un detalle con `"productoId":999999` | `422` `PRODUCTO_NO_EXISTE` y ninguna fila nueva |
| 12 | `curl -i localhost:3000/api/ventas` | `404` `NO_ENCONTRADO` |
| 13 | Con `"cantidad":999` y `"precioAplicado":"99999.99"` | `201` y `"total":"99899990.01"` |
| 14 | Un cuerpo con 101 detalles (armado con un ciclo de `jq` o de shell, con `productoId` distintos) | `400` `DATOS_INVALIDOS`, con `detalles` (el caso de 100 detalles lo cubre la prueba automática) |

- La comprobación del 11 se hace contando filas antes y después con el cliente `mysql` (con el usuario de la app, no con
  `root`): `docker compose exec mysql mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "SELECT COUNT(*) FROM
  ventas; SELECT COUNT(*) FROM detalles_venta"`. Los dos números no cambian.
- Después del 1, se comprueba el guardado con un `JOIN`: `SELECT v.id, v.fecha, v.total, p.nombre, d.cantidad,
  d.precio_aplicado, d.subtotal FROM ventas v JOIN detalles_venta d ON d.venta_id = v.id JOIN productos p ON p.id =
  d.producto_id WHERE v.id = <ventaId>`. Salen 2 filas con los nombres de los productos, y `fecha` la puso MySQL.
- Para probar que la API usa el procedimiento: se borra con `DROP PROCEDURE sp_registrar_venta` (con el usuario de la app),
  el comando 1 responde `500` `ERROR_INTERNO` sin el texto del SQL, y se vuelve a crear con
  `docker compose exec -T mysql mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" < backend/db/procedimientos/sp_registrar_venta.sql`
  (esa misma línea prueba el camino del cliente `mysql`). El comando 1 vuelve a dar `201`.
- El 500 también se ve en el log del servidor (`console.error`), con el error completo.

### Pantalla, en el navegador con el MCP `chrome-devtools` (V-08)

Si la sesión no tiene el MCP `chrome-devtools`, lo dice y la persona desarrolladora hace estos pasos a mano.

1. `new_page` a `http://localhost:5173`, `take_snapshot`: con la venta actual vacía, "Registrar venta" está deshabilitado.
2. Buscar "leche" y elegir el resultado; buscar otro producto y elegirlo. Poner cantidad 2 y precio aplicado `22.00` al primero.
   `take_snapshot`: el botón está habilitado y el total dice `47.50`.
3. `click` en "Registrar venta". Se ve "Venta <n> registrada · Total 47.50" con la animación, la venta actual está vacía y el
   botón está deshabilitado otra vez. `list_console_messages` sin errores; `list_network_requests`: un solo `POST
   /api/ventas` con 201. `take_screenshot`.
4. `evaluate_script` con `localStorage.getItem('aipos.ventaActual')`: sin detalles. `navigate_page` con `reload`: sigue
   vacía.
5. Armar otra venta y, con `evaluate_script`, hacer dos clics seguidos en el botón (`b.click(); b.click()`).
   `list_network_requests`: un solo `POST /api/ventas`.
6. Armar una venta con un producto creado solo para la prueba y borrarlo con el cliente `mysql`
   (`DELETE FROM productos WHERE codigo_barras = '<código>'`). `click` en "Registrar venta": aparece la franja de error con
   "Un producto de la venta ya no existe. Revisa la venta actual.", la venta actual tiene todos sus detalles y el botón
   está habilitado.
7. Apagar el backend y hacer `click`: aparece "No se pudo conectar con el servidor. Tu venta sigue aquí: intenta de nuevo.",
   la venta actual sigue igual y el botón está habilitado. Con el backend otra vez arriba, `click` registra la venta.
8. Con `emulate` en `prefers-reduced-motion: reduce` (si la versión del MCP lo permite; si no, lo cubre la prueba de
   `AnimacionLottie`), la animación de éxito no se mueve.
9. `resize_page` a 375 × 667 (móvil): el botón, el total y el mensaje se ven sin scroll horizontal y el botón se alcanza
   con el teclado, con el foco visible.

## Preguntas para la persona desarrolladora

- **Límite de 100 detalles (RN-14, pregunta abierta 9 de `requerimientos/README.md`).** Los requerimientos no lo pedían.
  Esta spec lo propuso porque, sin él, 101 productos distintos con cantidad 999 y precio 99 999.99 (una venta válida en
  cada campo) pasan de `DECIMAL(12,2)` y darían un 500. Ya la resolvió el orquestador (2026-09-30), con el consentimiento
  general de la persona desarrolladora: la API, el procedimiento y el botón lo rechazan, y la spec de armar la venta
  actual lo incluye en `valida` y lo avisa al agregar el producto 101. La otra opción era ampliar `ventas.total` a
  `DECIMAL(14,2)`, que cambia la spec de arquitectura y RN-08. La persona desarrolladora puede confirmarla o revertirla:
  si prefiere la otra opción, cambia RN-14, esta spec y la de armar la venta actual.
- **Reintento con la respuesta perdida.** Ver "Riesgo conocido" en la sección de la API.

## Bugs y issues

Cada bug relevante que aparezca al implementar o al probar estas partes se abre como un issue de GitHub (`gh issue create`,
con los pasos para reproducirlo: el comando `curl` o los pasos de la pantalla, lo esperado y lo que pasó) y se cierra con un
comentario que nombra el commit que lo corrige (`gh issue close <número> --comment "Corregido en <commit>"`). Es un proceso:
no tiene una prueba automática.

## Cómo se decidió el diseño

Se consultó el MCP `design-patterns` para cada decisión. Los patrones que se eligieron son estos:

| Decisión | Patrón | Por qué, en una frase |
|---|---|---|
| Registrar venta en un procedimiento | Transaction Script y Database Transaction Pattern | Una petición se resuelve completa dentro de MySQL, y la transacción da lo de todo o nada. |
| Leer los detalles del JSON | JSON Data Handling Pattern | `JSON_TABLE` convierte el arreglo en filas sin un `INSERT` por detalle. |
| Rutas → controller → servicio → modelos | Layered Architecture y Service Layer | Es lo que pide RNF-06 y la spec de arquitectura. |
| Validar el cuerpo | Input Validation | A la API se le puede llamar sin la pantalla. |
| Errores 400, 422 y 500 | Front Controller (el más cercano) | El manejador de errores único ya existe. |
| Sin capa Repository | Repository y Data Mapper, descartados | Con tres tablas solo reenviarían llamadas. |
| `src/api/ventas.js` | Facade | Los componentes no saben de rutas ni de errores de red. |
| Animación de éxito | Adapter | `AnimacionLottie.vue` adapta la librería a un componente. |
| Botón deshabilitado y resultado | Ninguno | No hay un patrón del catálogo para una marca `enviando` en un componente de Vue. |
| Máximo de 100 detalles | Input Validation | Sin límite, una venta válida en cada campo desbordaría `DECIMAL(12,2)`; se rechaza en la API y en el procedimiento. |
| Reintento con la respuesta perdida | Keyed Idempotency, descartado | Los requerimientos no lo piden y agregaría una columna y una regla; queda como pregunta. |
