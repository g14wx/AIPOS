---
name: Crear producto
description: Tabla productos con su modelo, la ruta POST /api/productos con su validación y sus errores, y el botón Nuevo producto con su formulario en un modal, de punta a punta (flujo 01, tarjetas P-01, P-02 y P-03)
targets:
  - ../backend/db/migrations/*-crear-productos.js
  - ../backend/src/models/Producto.js
  - ../backend/src/models/index.js
  - ../backend/src/routes/productos.js
  - ../backend/src/routes/index.js
  - ../backend/src/controllers/productos.js
  - ../backend/src/services/productos.js
  - ../backend/src/validators/productos.js
  - ../backend/docs/openapi.yaml
  - ../frontend/src/api/productos.js
  - ../frontend/src/reglasProducto.js
  - ../frontend/src/components/NuevoProducto.vue
  - ../frontend/src/components/FormularioProducto.vue
  - ../frontend/src/assets/animaciones/producto-creado.json
  - ../frontend/src/App.vue
---

# Crear producto

Esta spec cubre todo el flujo 01 (`requerimientos/flujos/01-crear-producto.md`): el cajero presiona "Nuevo producto",
llena el nombre, el precio y el código de barras, y el producto queda en MySQL, listo para buscarlo y venderlo. Son
tres tarjetas del tablero AIPOS, una por área:

| Tarjeta | Área | Qué construye | Rama de tarjeta (sale de `feature/productos`) |
|---|---|---|---|
| P-01 | Base de datos | La migración de `productos` y el modelo `Producto` | `feature/p-01-tabla-productos` |
| P-02 | Backend | `POST /api/productos`, su validación y sus errores | `feature/p-02-api-crear-producto` |
| P-03 | Frontend | El botón "Nuevo producto" y el formulario en un modal | `feature/p-03-formulario-producto` |

Se hacen en ese orden: P-02 depende de P-01 y P-03 depende de P-02. Todas dependen de que el entregable base esté
integrado. Esta spec se apoya en `specs/arquitectura.spec.md` y no repite lo que ya dice: versiones, capas, formato de
error, dinero, migraciones, paleta y `AnimacionLottie`. Si algo choca, manda el orden de la arquitectura:
`requerimientos/`, la spec de arquitectura y las reglas de los tiles.

Requerimientos que cubre: RF-01, RF-10 (la tabla `productos`), RN-01 a RN-04, RNF-03, RNF-04 y RNF-05.

Lo que no cubre: buscar productos (P-04 y P-05, flujo 02), editar o borrar un producto (AIPOS no los pide) ni una
ruta `GET /api/productos/:id`. Por eso la respuesta 201 no lleva la cabecera `Location`.

## Reglas de negocio

Se cumplen siempre, venga de donde venga el dato: la pantalla avisa, la API valida y MySQL las protege (RNF-03).

| Regla | Qué dice | Pantalla | API | MySQL |
|---|---|---|---|---|
| RN-01 | Todo producto tiene nombre, precio y código de barras. | El campo vacío se marca. | Un campo que falta o viene vacío es un 400. | `NOT NULL`. |
| RN-02 | El precio es mayor que 0, hasta 99 999.99, y tiene 2 decimales como máximo. | Marca el precio inválido. | 400. Rechaza 10.999, porque MySQL lo redondearía a 11.00 sin dar error. | `DECIMAL(10,2)` y un `CHECK`. |
| RN-03 | El código de barras es único y se guarda como texto, para no perder los ceros de la izquierda. | Muestra el error del 409 junto al campo. | 409 `CODIGO_BARRAS_DUPLICADO`. | `VARCHAR(50)` con índice único. |
| RN-04 | El nombre y el código de barras se guardan sin espacios en los extremos y no quedan vacíos. Largo máximo: 120 el nombre y 50 el código de barras. | Marca los campos vacíos o largos y manda los textos sin espacios en los extremos. | Quita los espacios de los extremos (`validarTexto`) y rechaza lo que quede vacío o pase del largo. | `VARCHAR` con largo y un `CHECK` de no vacío y sin espacios en los extremos. |

Los largos se cuentan en caracteres, como los cuenta MySQL, no en unidades de UTF-16: un emoji cuenta 1.

`[@test] ../backend/tests/productos/validador-producto.test.js`
`[@test] ../backend/tests/base-de-datos/productos-restricciones.test.js`

## P-01 · La tabla `productos` y el modelo `Producto`

### Migración

Una sola migración, `backend/db/migrations/<fecha>-crear-productos.js` (CommonJS, con `up` y `down`, como pide la
arquitectura), crea la tabla `productos`:

| Columna | Tipo | Restricciones |
|---|---|---|
| `id` | `INT` con `AUTO_INCREMENT` | Llave primaria. |
| `nombre` | `VARCHAR(120)` | `NOT NULL`. |
| `precio` | `DECIMAL(10,2)` | `NOT NULL`. |
| `codigo_barras` | `VARCHAR(50)` | `NOT NULL`. |

- `CHECK` con nombre fijo `chk_productos_precio`: `precio > 0 AND precio <= 99999.99` (RN-02). La tarjeta P-01 pide
  "mayor que 0", y la arquitectura fija el máximo en 99 999.99 (tabla de "Dinero"). El `CHECK` cubre los dos, para que
  MySQL proteja el máximo aunque llamen a la base sin la API.
- `CHECK` con nombre fijo `chk_productos_nombre` y `chk_productos_codigo_barras`: el texto no está vacío y no tiene
  espacios en los extremos (`CHAR_LENGTH(x) > 0 AND x = TRIM(x)`). Protegen RN-04 en MySQL, como pide RNF-03. La
  ordenación por defecto de MySQL 8.4 no ignora los espacios finales al comparar, así que `x = TRIM(x)` sí los detecta.
- Índice único con nombre fijo `uq_productos_codigo_barras` sobre `codigo_barras`. La API reconoce el 409 por ese nombre.
- La tabla usa `ENGINE=InnoDB` (los `CHECK` y, después, las llaves foráneas de `detalles_venta` lo necesitan),
  `utf8mb4` y `utf8mb4_0900_ai_ci`, dichos de forma explícita en `createTable`, no heredados de la base.
- No lleva `created_at` ni `updated_at`: la arquitectura fija que las tablas no los tienen (la única fecha del
  sistema es `ventas.fecha`). El `id` es `INT`, como en `detalles_venta.producto_id`.
- El `DECIMAL` va siempre con su tamaño: escrito sin él, MySQL lo vuelve `DECIMAL(10,0)` y se pierden los centavos.
- El orden `utf8mb4_0900_ai_ci` no distingue mayúsculas ni tildes, y el índice único lo hereda: "ABC-1" y "abc-1" son
  el mismo código de barras.
- `down` borra la tabla. Con `rehacer:prueba` (deshacer todo y migrar otra vez) no hay errores, en cualquier orden.

`[@test] ../backend/tests/base-de-datos/productos-migracion.test.js`

### Modelo

`backend/src/models/Producto.js` define `Producto` con `tableName: 'productos'`, `freezeTableName: true`,
`underscored: true` y `timestamps: false`, y `models/index.js` lo registra. Atributos: `id`, `nombre`
(`STRING(120)`), `precio` (`DECIMAL(10,2)`) y `codigoBarras` (`STRING(50)`, con `field: 'codigo_barras'`), todos
sin `allowNull`. El modelo no tiene reglas de negocio ni validaciones: eso va en el validador y en el servicio.
Nadie llama a `sequelize.sync()`: el esquema sale solo de la migración.

- `Producto.create` y `Producto.findByPk` devuelven `precio` como texto de 2 decimales (`"25.00"`), sin activar
  `decimalNumbers`.
  `[@test] ../backend/tests/base-de-datos/modelo-producto.test.js`

### Productos de ejemplo (opcional, por confirmar)

La tarjeta pide productos de ejemplo, como la leche entera `7501055300075`. Un seeder de sequelize-cli necesita una
carpeta `db/seeders/`, la ruta `seeders-path` en `.sequelizerc` y un script de `package.json`, y la arquitectura no
los lista. Por eso esta spec no los agrega sin que la persona desarrolladora lo confirme. Si los aprueba: un seeder
que se puede correr más de una vez sin duplicar (`ignoreDuplicates`) y solo en la base de desarrollo, con 3 productos
con precio de 2 decimales. Si no, la tarjeta cierra esa subtarea como "no se hace".

### Criterios de aceptación de P-01

1. Dado un código de barras repetido, cuando se inserta en MySQL, entonces el índice único lo rechaza (error 1062).
   `[@test] ../backend/tests/base-de-datos/productos-restricciones.test.js`
2. Dado un precio de 0, negativo o de 100 000, cuando se inserta en MySQL, entonces el `CHECK` lo rechaza (error 3819).
   `[@test] ../backend/tests/base-de-datos/productos-restricciones.test.js`
3. Dado un nombre o un código de barras vacío, o con espacios en los extremos, cuando se inserta en MySQL, entonces el
   `CHECK` lo rechaza.
   `[@test] ../backend/tests/base-de-datos/productos-restricciones.test.js`
4. Dado el precio `25.00` y el código de barras `0012345`, cuando se guardan y se leen, entonces el precio conserva
   sus centavos y el código conserva sus ceros de la izquierda.
   `[@test] ../backend/tests/base-de-datos/productos-restricciones.test.js`
5. Dada la base de prueba vacía, cuando se corre `npm run rehacer:prueba` (y `npm run migrar:prueba` después), entonces
   termina sin errores, y la tabla tiene las columnas, los tipos, los `CHECK`, el índice único, el motor y el orden de
   esta spec.
   `[@test] ../backend/tests/base-de-datos/productos-migracion.test.js`
6. La migración se aplica desde cero con los comandos del README (`docker compose up -d --wait mysql`,
   `npm run migrar`). Es una comprobación en local, sin prueba automática propia (la cubre el criterio 5).

## P-02 · `POST /api/productos`

Sigue las capas de la arquitectura, cada una en su archivo:

| Capa | Archivo | Qué hace aquí |
|---|---|---|
| Rutas | `src/routes/productos.js` | `router.post('/', crearProducto)`, montado en `/api/productos` por `routes/index.js`. |
| Controladores | `src/controllers/productos.js` | `crearProducto`: llama a `validarProductoNuevo(req.body)`, después al servicio y responde `201` con el producto. |
| Validadores | `src/validators/productos.js` | `validarProductoNuevo(cuerpo)`: usa `validarTexto` y `validarDinero` de `comunes.js` y devuelve los datos limpios, o lanza `ErrorApi` 400 con todos los campos con problema. |
| Servicios | `src/services/productos.js` | `crearProducto({ nombre, precio, codigoBarras })`: guarda con `Producto.create`, lee la fila guardada y traduce el error del índice único a 409. |

### Contrato

`POST /api/productos` con `Content-Type: application/json`:

```json
{ "nombre": "Leche entera 1 L", "precio": "25.00", "codigoBarras": "7501055300075" }
```

- `nombre`: texto, sin espacios en los extremos, de 1 a 120 caracteres.
- `precio`: **texto** con la forma `^\d{1,5}(\.\d{1,2})?$`, mayor que 0 y hasta `99999.99` (`"25"`, `"25.5"` y
  `"25.50"` valen). Un número JSON (`25.5`) es un 400: el dinero viaja como texto (arquitectura, "Dinero").
- `codigoBarras`: texto, sin espacios en los extremos, de 1 a 50 caracteres. Puede empezar con ceros.
- Los campos que sobran (por ejemplo `id`) se ignoran: el servicio toma solo los tres campos. El `id` lo pone MySQL.

Respuestas:

| Estado | Cuándo | Cuerpo |
|---|---|---|
| 201 | El producto se creó. | `{ "id": 1, "nombre": "Leche entera 1 L", "precio": "25.00", "codigoBarras": "7501055300075" }`. El `precio` sale de la fila guardada, con 2 decimales, aunque se mandara `"25"`. |
| 400 | Algún campo es inválido (`DATOS_INVALIDOS`). | El formato de error de la arquitectura, con un elemento en `detalles` por cada campo con problema, en el orden `nombre`, `precio`, `codigoBarras`. |
| 409 | El código de barras ya existe (`CODIGO_BARRAS_DUPLICADO`). | `detalles` con `campo: "codigoBarras"`. |
| 500 | Cualquier otro error (`ERROR_INTERNO`). | Sin stack ni SQL, como manda la arquitectura. |

Un 400 tiene siempre el mensaje "Los datos del producto no son válidos. Revisa los campos marcados." Cada elemento de
`detalles` lleva `campo` y `mensaje`, con estos textos (los mismos que usa la pantalla):

| Campo | Cuándo | Mensaje |
|---|---|---|
| `nombre` y `codigoBarras` | Falta, es `null`, queda vacío o solo tenía espacios. | `Es obligatorio.` |
| `nombre` y `codigoBarras` | No es un texto (un número, un objeto, un arreglo). | `Debe ser un texto.` |
| `nombre` | Pasa de 120 caracteres. | `No puede pasar de 120 caracteres.` |
| `codigoBarras` | Pasa de 50 caracteres. | `No puede pasar de 50 caracteres.` |
| `precio` | Falta, es `null` o es un texto vacío. | `Es obligatorio.` |
| `precio` | Es un número JSON, no un texto. | `Debe enviarse como texto, por ejemplo "25.50".` |
| `precio` | No son solo dígitos con un punto opcional (`abc`, `-5`, `1,5`, `.5`, `1e3`, con espacios). | `Debe ser un número con punto decimal, por ejemplo 25.50.` |
| `precio` | Tiene más de 2 decimales (`10.999`). | `No puede tener más de 2 decimales.` |
| `precio` | Tiene más de 5 dígitos enteros (`100000`). | `No puede ser mayor que 99999.99.` |
| `precio` | Vale 0 (`0`, `0.00`). | `Debe ser mayor que 0.` |
| `codigoBarras` | Ya existe (solo en el 409). | `Ya existe un producto con ese código de barras.` |

Cada campo muestra solo su primer problema. Se revisa en el orden de la tabla.

- Un cuerpo que falta (petición sin `Content-Type: application/json`) o que no es un objeto se trata como un objeto
  vacío: da un 400 con los tres campos obligatorios. Con Express 5, `req.body` llega `undefined` en el primero de
  esos casos, y el validador no debe fallar con un error de JavaScript (que sería un 500).
  `[@test] ../backend/tests/productos/crear-producto-400.test.js`
- Un JSON mal escrito (`JSON_INVALIDO`) y un cuerpo que pasa de 100 KB (`CUERPO_MUY_GRANDE`) son 400 del manejador
  de errores de la arquitectura; esta ruta no los cambia.
  `[@test] ../backend/tests/limite-del-cuerpo.test.js`

### Validación

- El validador revisa todo antes de tocar la base y junta todos los campos con problema, no solo el primero.
  `[@test] ../backend/tests/productos/validador-producto.test.js`
- Los nombres y los códigos de barras se recortan (`trim`) antes de revisarlos y antes de guardarlos: `"  Leche  "` se
  guarda como `"Leche"`. La API no rechaza los espacios de los extremos, los quita (RN-04 y `validarTexto`). Un texto
  que solo tenía espacios queda vacío y es un 400. El `precio` no se recorta: `" 25"` es un 400.
  `[@test] ../backend/tests/productos/crear-producto.test.js`
- El largo se cuenta en caracteres (`[...texto].length`): un nombre de 120 emojis es válido y de 121 no.
  `[@test] ../backend/tests/productos/validador-producto.test.js`
- Un texto del cajero nunca se pega en el SQL: Sequelize usa parámetros. Un nombre como `'; DROP TABLE productos; --` se
  guarda tal cual, como texto.
  `[@test] ../backend/tests/productos/crear-producto.test.js`

### Servicio, 409 y peticiones al mismo tiempo

- `crearProducto` guarda con `Producto.create` y, sin una consulta previa de "¿ya existe?", deja que el índice único
  decida. Después lee la fila guardada (`reload`) para responder el `precio` con 2 decimales, tal como lo guarda MySQL.
  El backend no calcula ni formatea dinero.
- Si MySQL rechaza la fila por el índice `uq_productos_codigo_barras` (error 1062 con ese nombre en el mensaje),
  el servicio lanza `ErrorApi(409, 'CODIGO_BARRAS_DUPLICADO', ...)`. Como es el único índice único además de la
  llave primaria, que se llena sola, ese error es siempre por el código de barras. Cualquier otro error sigue como
  500: no se traduce por adivinar.
- Dos peticiones iguales al mismo tiempo (dos pestañas o un doble clic) dan un 201 y un 409, y en `productos` queda una sola
  fila. Una consulta previa las dejaría pasar a las dos.
  `[@test] ../backend/tests/productos/crear-producto-simultaneo.test.js`
- Como el orden de MySQL no distingue mayúsculas ni tildes, crear "ABC-1" después de "abc-1" también da un 409.
  `[@test] ../backend/tests/productos/crear-producto-409.test.js`

### Documentación de la API (tarjeta A-01)

- P-02 agrega la ruta al documento OpenAPI, `backend/docs/openapi.yaml`, que crea A-01: `POST /api/productos` con su
  cuerpo (`nombre`, `precio` como texto con su `pattern`, `codigoBarras`, con sus largos), las respuestas 201, 400,
  409 y 500, y un ejemplo de cada una. El esquema de error es el de la arquitectura. Los ejemplos no muestran detalles
  internos (ni stack ni SQL).
- La prueba de A-01 falla si una ruta de Express no está documentada, así que P-02 no se integra sin este paso.
  `[@test] ../backend/tests/productos/documentacion-crear-producto.test.js`

### Criterios de aceptación de P-02

1. Dado un precio `"-5"`, `"abc"` o `"10.999"`, cuando llega a la API, entonces responde 400 con `campo: "precio"` y el
   motivo de la tabla.
   `[@test] ../backend/tests/productos/crear-producto-400.test.js`
2. Dado un precio `"100000"` o `"0"`, entonces responde 400 con su motivo. Con `"99999.99"` y `"0.01"` responde 201.
   `[@test] ../backend/tests/productos/crear-producto-400.test.js`
3. Dado un producto sin nombre, sin precio y sin código de barras, entonces responde 400 con un elemento en `detalles`
   por cada campo, y en `productos` no hay filas nuevas.
   `[@test] ../backend/tests/productos/crear-producto-400.test.js`
4. Dado un código de barras que ya existe, cuando se crea el producto, entonces responde 409
   `CODIGO_BARRAS_DUPLICADO`, y el producto que ya estaba no cambia.
   `[@test] ../backend/tests/productos/crear-producto-409.test.js`
5. Dado un producto válido, cuando se crea, entonces responde 201 con el producto y hay una fila nueva en `productos`.
   Con precio `"25"` responde `"25.00"`, y con el código `"0012345"` responde `"0012345"`.
   `[@test] ../backend/tests/productos/crear-producto.test.js`
6. Dadas dos peticiones iguales al mismo tiempo, entonces se crea un solo producto.
   `[@test] ../backend/tests/productos/crear-producto-simultaneo.test.js`
7. Dado un error inesperado de MySQL (por ejemplo, la tabla no existe), entonces responde 500 `ERROR_INTERNO` sin SQL ni
   stack, y `console.error` escribe el detalle.
   `[@test] ../backend/tests/productos/crear-producto-500.test.js`
8. Dada la documentación, entonces `POST /api/productos` está documentada con sus cuatro respuestas.
   `[@test] ../backend/tests/productos/documentacion-crear-producto.test.js`

## P-03 · El botón "Nuevo producto" y el formulario

### Los componentes

Vue 2.7 con Options API y Vuetify 2.7, como en la arquitectura. Cada componente tiene un solo elemento raíz y ningún
`v-html`.

| Archivo | Qué es |
|---|---|
| `src/components/NuevoProducto.vue` | El botón "Nuevo producto", el formulario y el aviso "Producto creado". `App.vue` solo lo incluye. |
| `src/components/FormularioProducto.vue` | El modal (`v-dialog`) con el formulario. Recibe `value` (si está abierto) y emite `input` y `creado` (con el producto que devolvió la API). Llama a `crearProducto` de `src/api/productos.js`. |
| `src/reglasProducto.js` | Las reglas de Vuetify de cada campo, como funciones puras, para probarlas sin pantalla. |
| `src/api/productos.js` | `crearProducto({ nombre, precio, codigoBarras })`: `POST productos` con `http`, y devuelve el producto. Los errores llegan como los deja el interceptor de `http.js` (`status`, `codigo`, `mensaje`, `detalles`). |

- El botón "Nuevo producto" está a la vista en la barra superior de la pantalla principal, fuera de cualquier lista, con
  el color `primary` y el texto `#292F36` (nunca blanco: arquitectura, "Paleta").
- Ningún componente importa `axios` ni escribe una URL.
  `[@test] ../frontend/tests/sin-axios-en-componentes.test.js`
- `crearProducto` manda `POST /productos` con el cuerpo de la tabla de arriba y devuelve el producto.
  `[@test] ../frontend/tests/api/productos.test.js`

### El formulario

- Tres campos, en este orden, todos con etiqueta visible: "Nombre", "Precio" y "Código de barras". El foco entra al campo
  "Nombre" al abrir. Con Enter en cualquier campo se guarda (los lectores de códigos de barras mandan un Enter al final).
  Los tres son campos de texto: el precio no usa `type="number"`, porque el valor debe seguir siendo el texto que
  escribió el cajero. El precio lleva `inputmode="decimal"` y la ayuda "Con punto decimal, por ejemplo 25.50". No lleva
  símbolo de moneda.
- Los contadores de caracteres (120 y 50) se ven, pero los campos no usan `maxlength`: así un texto pegado que sobra se
  marca como error en lugar de cortarse sin avisar.
- Las reglas de Vuetify de cada campo usan los mismos textos que la API (tabla del contrato) y revisan lo mismo. La
  pantalla quita los espacios de los extremos del nombre y del código de barras antes de revisarlos y de mandarlos. El
  precio no se recorta, igual que en la API: `" 25"` se marca con "Debe ser un número con punto decimal, por ejemplo
  25.50.". El máximo del precio se compara en centavos con `aCentavos` de `src/dinero.js`, sin sumar decimales de
  JavaScript.
  `[@test] ../frontend/tests/reglasProducto.test.js`
- Al presionar "Guardar" con el formulario vacío se marcan los tres campos como obligatorios, el foco va al primero
  y no se llama a la API. Los campos no se marcan antes de que el cajero presione "Guardar" o salga de ellos
  (`lazy-validation`).
  `[@test] ../frontend/tests/componentes/FormularioProducto.test.js`
- "Guardar" queda deshabilitado y con el indicador de carga mientras se guarda. Además, `guardar()` marca
  `guardando` en cuanto empieza y sale sin hacer nada si ya está guardando: así un doble clic, o un doble Enter, manda una sola
  petición, aun antes de que el botón se vuelva a pintar. "Cancelar" también se deshabilita mientras se guarda, porque
  cerrar el modal no cancelaría la petición.
  `[@test] ../frontend/tests/componentes/FormularioProducto.test.js`
- "Cancelar" cierra el modal sin crear nada, y al volver a abrirlo el formulario está vacío. Mientras haya texto escrito
  o se esté guardando, un clic fuera del modal o la tecla Esc no lo cierran (`persistent`): lo escrito no se pierde por
  un descuido. Con el formulario vacío sí cierran. Al cerrar, el foco vuelve al botón "Nuevo producto".
  `[@test] ../frontend/tests/componentes/FormularioProducto.test.js`
- Lo que la API o la red contesten no borra lo escrito. Cada caso:

| Respuesta | Qué ve el cajero |
|---|---|
| 400 con `detalles` | El mensaje de cada elemento, junto a su campo (`error-messages`). El foco va al primer campo con error. El mensaje de un campo se quita cuando el cajero lo edita. Un `campo` que la pantalla no conoce se muestra en la franja de error del modal. |
| 409 `CODIGO_BARRAS_DUPLICADO` | "Ya existe un producto con ese código de barras" junto al campo "Código de barras", y el foco va ahí. |
| Sin respuesta (`status` 0: sin red, servidor apagado o pasaron los 10 segundos) | Una franja de error en el modal: "No se pudo conectar con el servidor. Intenta de nuevo." (el mensaje de `http.js`). |
| 500 u otro estado | La franja de error con el mensaje de la API ("Ocurrió un error inesperado. Intenta de nuevo."). |

  En los dos últimos casos "Guardar" vuelve a habilitarse, para que el cajero lo reintente con los mismos datos. Si la
  primera petición sí llegó a la API pero la respuesta se perdió, el reintento da un 409 y la pantalla lo muestra como
  tal: no intenta adivinar lo que pasó.
  `[@test] ../frontend/tests/componentes/FormularioProducto.test.js`
- La franja de error es un `v-alert` con `role="alert"`, ícono y borde en `#FF6B6B` y el texto en `#292F36`: nunca texto
  rojo sobre el fondo claro (arquitectura, "Paleta").
  `[@test] ../frontend/tests/tema.test.js`

### Al crear el producto

- Con un 201, el modal se cierra, el formulario se vacía, `FormularioProducto` emite `creado` con el producto y
  `NuevoProducto` muestra el aviso "Producto creado" en un `v-snackbar` de 4 segundos.
- El aviso tiene fondo `surface`, texto `#292F36` y un borde izquierdo `primary`, y lleva una animación corta de éxito
  con `AnimacionLottie` (una palomita que se dibuja, de 1 a 1,5 segundos, sin repetirse, de unos 32 px). El texto dice lo
  mismo que la animación, que es solo decoración (`aria-hidden`). El texto se anuncia a los lectores de pantalla con
  `aria-live="polite"`, que Vuetify pone por defecto en `v-snackbar`.
  `[@test] ../frontend/tests/componentes/NuevoProducto.test.js`
- La animación es `src/assets/animaciones/producto-creado.json`, en los colores de la paleta (turquesa `#4ECDC4` y
  `#292F36`), de menos de 50 KB. La crea el agente con el MCP `lottiefiles-creator` o, si la sesión no lo tiene, con la
  skill `text-to-lottie`, y la agrega P-03.
  `[@test] ../frontend/tests/animaciones.test.js`
- Con `prefers-reduced-motion: reduce` no se anima: se ve un solo cuadro fijo, el último (la palomita ya dibujada), no
  uno vacío. Si `AnimacionLottie` (que crea B-04) muestra otro cuadro por defecto, P-03 le agrega la propiedad que
  hace falta para elegirlo, sin cambiar lo que ya hace.
  `[@test] ../frontend/tests/componentes/AnimacionLottie.test.js`
- El producto creado sale al buscarlo. Se comprueba cuando P-04 y P-05 estén integrados, con el mismo procedimiento
  de "Pruebas en local".

### Diseño con `impeccable`

Antes de construir el modal, el agente carga la skill `impeccable` y sigue lo que indica; al terminar la corre en modo
auditoría sobre lo que cambió. Lo que esta spec fija además:

- Una sola acción principal: "Guardar", en `primary` y a la derecha; "Cancelar" es un botón de texto a su izquierda.
- En un teléfono (`$vuetify.breakpoint.xsOnly`) el modal ocupa toda la pantalla (`fullscreen`), con los botones al
  alcance del pulgar. En una pantalla ancha mide 480 px como máximo. Los botones y los campos miden 44 px de alto o más
  para tocarlos.
- Estados visibles y con texto claro: vacío, con error junto al campo, guardando, con error de red y con éxito. Cada
  estado se puede alcanzar con el teclado, y el foco se ve siempre.
- El modal tiene su título "Nuevo producto" (`aria-labelledby` lo enlaza al diálogo).
- Los pares de color que usa (texto sobre `primary`, sobre `surface`, en la franja de error y en el aviso) pasan de 4.5
  en la prueba de contraste de la arquitectura.
  `[@test] ../frontend/tests/tema.test.js`

### Criterios de aceptación de P-03

1. Dado el formulario vacío, cuando el cajero presiona "Guardar", entonces se marcan los tres campos y no se llama a
   la API.
   `[@test] ../frontend/tests/componentes/FormularioProducto.test.js`
2. Dado un precio `-5`, `abc`, `10.999`, `100000`, `0` o `" 25"` (con un espacio), cuando el cajero presiona "Guardar", entonces se marca el
   precio con su motivo y no se llama a la API.
   `[@test] ../frontend/tests/reglasProducto.test.js`
3. Dado un código de barras que ya existe, cuando guarda, entonces ve "Ya existe un producto con ese código de barras"
   junto al campo, sin perder lo escrito.
   `[@test] ../frontend/tests/componentes/FormularioProducto.test.js`
4. Dado un producto válido, cuando guarda, entonces se cierra el modal y aparece "Producto creado".
   `[@test] ../frontend/tests/componentes/NuevoProducto.test.js`
5. Dado que la API no responde, cuando guarda, entonces se avisa del error, se conserva lo escrito y "Guardar" vuelve a
   estar habilitado.
   `[@test] ../frontend/tests/componentes/FormularioProducto.test.js`
6. Dado un doble clic en "Guardar", entonces se crea un solo producto.
   `[@test] ../frontend/tests/componentes/FormularioProducto.test.js`
7. Dado un 400 de la API con un mensaje para el precio, cuando llega, entonces el mensaje se ve junto al campo "Precio"
   y desaparece cuando el cajero edita ese campo.
   `[@test] ../frontend/tests/componentes/FormularioProducto.test.js`
8. Dado "Cancelar", cuando el cajero lo presiona, entonces el modal se cierra, no se llama a la API y, al abrirlo otra vez,
   el formulario está vacío.
   `[@test] ../frontend/tests/componentes/FormularioProducto.test.js`
9. Dado un sistema con `prefers-reduced-motion: reduce`, cuando se crea un producto, entonces el aviso no anima.
   `[@test] ../frontend/tests/componentes/AnimacionLottie.test.js`

## Pruebas en local

Toda prueba corre en local (arquitectura, "Pruebas en local"). Además de las pruebas automáticas de cada tarjeta, el
agente que la implementa hace esto con el sistema corriendo de verdad, y anota el resultado en su "Update" de la tarjeta.
Estas pruebas no tienen un archivo de prueba propio: se comprueban en la revisión del PR.

### P-01: la base

Con `docker compose up -d --wait mysql`, `npm run migrar`, `npm run deshacer` y otra vez `npm run migrar`, sin
errores. Con el cliente `mysql` y el usuario de la app (nunca `root`), `SHOW CREATE TABLE productos` muestra los
tipos, los `CHECK` y el índice `uq_productos_codigo_barras`.

### P-02: la API con `curl`

Con el backend corriendo (`npm run dev`, con MySQL levantado y migrado). Cada comando usa un código de barras nuevo, para
poder repetir la prueba sin limpiar la base:

```bash
API=http://localhost:3000
CODIGO=$(date +%s)
JSON='Content-Type: application/json'

# 201: el precio vuelve con 2 decimales
curl -i -X POST $API/api/productos -H "$JSON" \
  -d "{\"nombre\":\"Leche entera 1 L\",\"precio\":\"25\",\"codigoBarras\":\"$CODIGO\"}"
#   -> 201 {"id":<n>,"nombre":"Leche entera 1 L","precio":"25.00","codigoBarras":"<CODIGO>"}

# 409: el mismo código de barras otra vez
curl -i -X POST $API/api/productos -H "$JSON" \
  -d "{\"nombre\":\"Otra leche\",\"precio\":\"20.00\",\"codigoBarras\":\"$CODIGO\"}"
#   -> 409 codigo CODIGO_BARRAS_DUPLICADO, detalles [{"campo":"codigoBarras",...}]

# 400: precio con 3 decimales
curl -i -X POST $API/api/productos -H "$JSON" \
  -d '{"nombre":"Pan","precio":"10.999","codigoBarras":"PRUEBA-1"}'
#   -> 400 DATOS_INVALIDOS, detalles [{"campo":"precio","mensaje":"No puede tener más de 2 decimales."}]

# 400: precio negativo, con letras, mayor que el máximo, en cero y como número JSON
#   "-5" y "abc" -> "Debe ser un número con punto decimal, por ejemplo 25.50."
#   "100000"     -> "No puede ser mayor que 99999.99."
#   "0"          -> "Debe ser mayor que 0."
#   25.5         -> "Debe enviarse como texto, por ejemplo \"25.50\"."

# 400: campos que faltan (los tres) y petición sin cuerpo
curl -i -X POST $API/api/productos -H "$JSON" -d '{}'
curl -i -X POST $API/api/productos
#   -> 400 con "Es obligatorio." en nombre, precio y codigoBarras (no un 500)

# 400: JSON mal escrito
curl -i -X POST $API/api/productos -H "$JSON" -d '{"nombre":'
#   -> 400 JSON_INVALIDO

# Los espacios de los extremos se quitan
curl -i -X POST $API/api/productos -H "$JSON" \
  -d "{\"nombre\":\"  Pan  \",\"precio\":\"9.5\",\"codigoBarras\":\" $CODIGO-2 \"}"
#   -> 201 con "nombre":"Pan" y "codigoBarras":"<CODIGO>-2"

# La pantalla llama desde otro origen: la petición previa de CORS debe pasar
curl -i -X OPTIONS $API/api/productos -H 'Origin: http://localhost:5173' \
  -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: content-type'
#   -> 204 con Access-Control-Allow-Origin: http://localhost:5173
```

La respuesta 500 se comprueba con la prueba automática (criterio 7 de P-02), porque en local no hay una entrada que la
provoque sin romper algo a propósito.

### P-03: la pantalla, en el navegador con el MCP `chrome-devtools`

Con el backend y el frontend corriendo (`npm run dev` en cada uno). El agente abre la pantalla con `navigate_page` y
sigue estos pasos con `take_snapshot`, `fill` y `click`:

1. "Nuevo producto" está a la vista. Al presionarlo, el modal se abre con el foco en "Nombre".
2. Presiona "Guardar" con todo vacío: los tres campos se marcan y `list_network_requests` no muestra ninguna llamada a
   `/api/productos`.
3. Escribe un precio `10.999`: se marca con "No puede tener más de 2 decimales.".
4. Escribe un producto válido y presiona "Guardar": el modal se cierra, aparece "Producto creado" con su animación, y
   `list_network_requests` muestra un `POST /api/productos` con estado 201.
5. Crea otro producto con el mismo código de barras: se ve "Ya existe un producto con ese código de barras" junto al
   campo, el nombre y el precio siguen escritos, y "Guardar" está habilitado.
6. Con el backend apagado, guarda un producto válido: se ve la franja de error de red, lo escrito sigue ahí y "Guardar"
   está habilitado. Al volver a encender el backend y reintentar, el producto se crea.
7. Hace doble clic en "Guardar" con un producto válido: `list_network_requests` muestra un solo `POST`.
8. `list_console_messages` no muestra errores ni avisos de Vue o de Vuetify. `take_screenshot` guarda una captura del
   modal vacío, con errores y con el aviso; y otra con el ancho de un teléfono (`resize_page` o `emulate`), donde el
   modal ocupa toda la pantalla.
9. El movimiento reducido se prueba emulándolo con `emulate`, si la herramienta lo permite. Si no, lo prueba a mano la
   persona desarrolladora con el ajuste del sistema, y la prueba automática (criterio 9 de P-03) lo cubre mientras tanto.
10. Cuando P-04 y P-05 estén integrados: el producto creado sale al buscarlo por su nombre y por su código de barras.

Si la sesión no tiene el MCP `chrome-devtools`, lo dice en su "Update" y la persona desarrolladora hace esta prueba a mano.

### Bugs

Cada bug relevante que aparezca en estas pruebas se abre como issue de GitHub, con los pasos para reproducirlo
(`gh issue create`), y se cierra con un comentario que nombra el commit que lo corrige
(`gh issue close <número> --comment "Corregido en <commit>"`).

## Patrones de diseño

Cada decisión consultó el MCP `design-patterns` antes de escribirse. El catálogo casi no trae patrones de aplicaciones
web pequeñas, así que varias respuestas son "el más cercano" o "ninguno":

| Decisión | Patrón | Por qué, en una frase |
|---|---|---|
| `CHECK`, `NOT NULL` e índice único en `productos` | Constraints Enforcer (el más cercano) | La base rechaza lo inválido aunque la pantalla y la API fallen; el catálogo lo describe de forma muy general. |
| Migración versionada y reversible | Ninguno del catálogo | Se sigue la práctica de sequelize-cli, con `up` y `down`, ya fijada en la arquitectura. |
| El modelo `Producto` | Active Record (el más cercano) | Sequelize hace que el modelo lea y guarde su fila, pero aquí no lleva reglas de negocio: esas van en el servicio (arquitectura, "Capas"). |
| Validar la forma en el validador y las reglas de negocio en el servicio | Input Validation y Service Layer, de la arquitectura | Son los que la arquitectura ya eligió para las capas del backend. |
| El 409 sale del índice único, sin consulta previa | Keyed Idempotency (el más cercano) | La llave única deja pasar una sola de dos peticiones iguales. No es idempotencia exacta: la segunda recibe un 409, no el mismo resultado. |
| Reglas de la pantalla en `reglasProducto.js` | Ninguno del catálogo | Son funciones puras que se prueban sin pantalla, igual que la lógica de la venta actual. |
| `src/api/productos.js` | Facade, de la arquitectura | Los componentes no saben de rutas ni de axios. |
| `NuevoProducto` y `FormularioProducto` | Ninguno del catálogo | El catálogo solo trae patrones de React (por ejemplo Compound Components) que aquí no aplican; se separa lo que abre y avisa (`NuevoProducto`) de lo que captura y guarda (`FormularioProducto`). |
| Un solo envío a la vez (doble clic) | Ninguno del catálogo | Es una bandera `guardando` en el componente; la idempotencia con llave (`Keyed Idempotency`) pide una llave en la petición y sería más de lo que hace falta. |
| El aviso de éxito con Lottie | Adapter, de la arquitectura | `AnimacionLottie.vue` ya adapta la librería, y aquí solo se usa. |
