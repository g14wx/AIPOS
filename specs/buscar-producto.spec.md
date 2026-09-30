---
name: Buscar producto
description: Buscar un producto por una parte de su nombre o por su código de barras exacto, con la API GET /api/productos?busqueda= (P-04) y el campo de búsqueda con sus resultados en la pantalla (P-05), con RF-12 opcional
targets:
  - ../backend/src/routes/productos.js
  - ../backend/src/controllers/productos.js
  - ../backend/src/services/productos.js
  - ../backend/src/validators/productos.js
  - ../backend/docs/openapi.yaml
  - ../frontend/src/api/productos.js
  - ../frontend/src/components/BuscadorProductos.vue
  - ../frontend/src/App.vue
  - ../frontend/src/assets/animaciones/buscando.json
  - ../requerimientos/flujos/02-buscar-producto.md
---

# Buscar producto

Esta es la spec del flujo 02 (`requerimientos/flujos/02-buscar-producto.md`), de RF-02 y, opcional, de RF-12. Cubre las
tarjetas P-04 (la API) y P-05 (la pantalla). El cajero escribe un nombre o un código de barras en el campo de
búsqueda, ve los productos que coinciden y elige uno para la venta actual.

Se apoya en `specs/arquitectura.spec.md` y no repite lo que ya dice: las capas, el formato de error, la validación
propia, el servicio de API de la pantalla, la paleta, la lógica de las pruebas y las reglas de Git. Si esta spec choca
con `requerimientos/` o con la spec de arquitectura, mandan ellos.

Los ejemplos de código no son el código final: lo escriben las tarjetas P-04 y P-05, y esas pruebas son las que
enlazan los `[@test]`.

## Quién implementa qué

| Parte | Tarjeta | Qué se entrega |
|---|---|---|
| Ruta `GET /api/productos?busqueda=`, controller, validación, servicio `buscarProductos` y escape de `%`, `_` y `\` | P-04 | Backend |
| Documentar la ruta en la documentación de la API (subtarea de P-04) | P-04, sobre lo que crea A-01 | Backend |
| Función `buscarProductos` de `frontend/src/api/productos.js` | P-05 | Frontend |
| `BuscadorProductos.vue` (B-04 deja el campo con el foco al abrir y su lugar en `App.vue`; P-05 le suma la espera, los resultados y `producto-elegido`) y su animación `buscando.json` | P-05 | Frontend |
| Conectar el evento `producto-elegido` con `agregarAVentaActual` | V-04 | Frontend |
| RF-12 (Enter con un código de barras exacto), opcional | P-05, si sobra tiempo | Frontend |

P-04 depende de P-01 (la tabla `productos` y el modelo `Producto`). P-02 y P-04 corren a la vez y comparten los archivos
de `productos` del backend (`routes/productos.js`, `controllers/productos.js`, `services/productos.js`,
`validators/productos.js` y `validators/comunes.js`): los crea la primera de las dos que se integra en
`feature/productos`, y la otra los junta (spec de arquitectura, "Carpetas"). P-05 depende de P-04 y
de B-04 (el componente `AnimacionLottie.vue`, `src/api/http.js`, `App.vue` y el campo inicial de
`BuscadorProductos.vue`). P-03 y P-05 corren a la vez y comparten `frontend/src/api/productos.js`: P-05 agrega
`buscarProductos` y P-03 `crearProducto`. La que se integra primero lo crea, y la otra conserva las dos funciones al
poner su rama al día. Si A-01 todavía no está integrada cuando P-04 termina, la subtarea de documentar la ruta espera y
se hace en cuanto A-01 esté integrada.

## Reglas de negocio

Salen de RF-02, RN-01, RN-03 y RN-04, y de las decisiones de la persona desarrolladora del 2026-09-30 (pregunta abierta
3: desde 2 caracteres y 20 resultados como máximo; pregunta abierta 5: RF-12 es opcional).

- El texto de búsqueda se recorta (sin espacios en los extremos) y tiene de 2 a 120 caracteres. 120 es el largo máximo
  de un nombre (RN-04), y un código de barras (máximo 50) cabe dentro.
- Por nombre: el producto aparece si su nombre contiene el texto, sin importar mayúsculas ni tildes ("lech" y "LÉCH"
  encuentran "Leche entera 1 L"). Eso lo da la comparación por defecto de MySQL (`utf8mb4_0900_ai_ci`), sin código extra.
- Por código de barras: el producto aparece si su código de barras es igual al texto completo. Un pedazo del código de
  barras no cuenta ("750105530007" no encuentra el código de barras "7501055300075"). MySQL lo compara con la misma
  regla del `UNIQUE` de RN-03, así que no distingue mayúsculas.
- `%`, `_` y `\` son texto normal: buscar "50%" solo encuentra nombres que tengan "50%". Se escapan antes de armar el
  patrón de `LIKE` (RNF-04).
- Como máximo 20 resultados. Van primero el producto cuyo código de barras es igual al texto, y después los demás por
  nombre de la A a la Z y, si empatan, por `id`. Así el mismo texto siempre da la misma lista, y un código de barras
  exacto nunca queda fuera de los 20.
- Sin coincidencias no es un error: la API responde 200 con la lista vacía.
- Buscar solo lee: no cambia nada en la base de datos.
- El texto del cajero nunca se pega dentro del SQL (RNF-04). Se usa Sequelize con `Op.like`, `Op.eq` y `replacements`.

## API: `GET /api/productos?busqueda=<texto>`

La ruta vive en `src/routes/productos.js` (lo crea la primera de P-02 y P-04 que se integra, y la otra le suma su ruta;
P-04 le suma el `GET`), y el controller, el servicio y
el validador son `src/controllers/productos.js`, `src/services/productos.js` y `src/validators/productos.js`, cada uno
con una función `buscarProductos` (el controller y el servicio) y `validarBusqueda` (el validador). El controller lee
`req.query.busqueda`, llama a `validarBusqueda`, llama al servicio y responde con `res.json`.

- Método y ruta: `GET /api/productos`, con el parámetro `busqueda` en la dirección. No lleva cuerpo.
- Otros parámetros de la dirección se ignoran.
- Respuesta 200: una lista de productos, que puede estar vacía. Cada producto tiene cuatro campos, en `camelCase`, y el
  precio como texto con 2 decimales, como lo devuelve MySQL (ver "Dinero" en la spec de arquitectura):

```json
[
  { "id": 1, "nombre": "Leche entera 1 L", "codigoBarras": "7501055300075", "precio": "25.00" }
]
```

- Errores, con el formato de error de la arquitectura:

| Estado | `codigo` | Cuándo |
|---|---|---|
| 400 | `DATOS_INVALIDOS` | Falta `busqueda`, o quedan menos de 2 caracteres después de recortar, o pasa de 120, o viene repetido (`?busqueda=a&busqueda=b`). |
| 500 | `ERROR_INTERNO` | MySQL falla. El mensaje es el genérico de la arquitectura, sin el SQL ni el stack. |

  No hay 404 (sin coincidencias es 200), ni 409, ni 422: la ruta no escribe.

- El 400 lleva `detalles` con el campo `busqueda`. Por ejemplo, con `?busqueda=a`:

```json
{
  "error": {
    "codigo": "DATOS_INVALIDOS",
    "mensaje": "El texto de búsqueda debe tener entre 2 y 120 caracteres.",
    "detalles": [{ "campo": "busqueda", "mensaje": "Escribe al menos 2 caracteres." }]
  }
}
```

- Patrón: Input Validation, para el texto (lo dice la spec de arquitectura: a la API se le puede llamar sin la pantalla).
  Layered Architecture con Service Layer, como en el resto de la API. Query Object queda descartado: hay una sola
  consulta fija, y `Producto.findAll` con `where`, `order` y `limit` ya cumple ese papel sin otra clase.

### Validación del texto

- `validarBusqueda(valor)` recibe el valor crudo de `req.query.busqueda` y devuelve el texto limpio o lanza `ErrorApi`
  400 (`DATOS_INVALIDOS`). Usa `validarTexto` de `src/validators/comunes.js` para recortar y comprobar el máximo de 120, y
  comprueba él mismo el mínimo de 2 (`validarTexto` solo pide que no quede vacío). Un valor
  que no es un texto (por ejemplo la lista que arma `?busqueda=a&busqueda=b`) es un 400, no se convierte.
  `[@test] ../backend/tests/productos/validar-busqueda.test.js`
- La ruta responde 400 sin `busqueda`, con `busqueda=` vacía, con solo espacios, con 1 carácter (`a`), con 1 carácter y
  espacios (`" a "`) y con 121 caracteres. Con 2 caracteres y con 120 responde 200.
  `[@test] ../backend/tests/productos/buscar-productos.test.js`
- El 400 no toca la base de datos: la validación va antes de llamar al servicio.
  `[@test] ../backend/tests/productos/buscar-productos.test.js`

### Cómo busca el servicio

- `buscarProductos(texto)` de `src/services/productos.js` recibe el texto ya validado y devuelve la lista de productos
  con `id`, `nombre`, `codigoBarras` y `precio`. No conoce `req` ni `res`.
- `escaparParaLike(texto)` (misma carpeta) antepone `\` a cada `\`, `%` y `_`. Es una función pura y se exporta para
  probarla sola. MySQL usa `\` como carácter de escape del `LIKE` por defecto, y Sequelize ya escribe bien las
  barras al armar el texto de la consulta: la prueba de "50%" contra MySQL de verdad es la que lo demuestra.
  `[@test] ../backend/tests/productos/escapar-para-like.test.js`
- El patrón es `%` + texto escapado + `%`, con `Op.like` sobre `nombre`, unido con `Op.or` a `codigoBarras` igual al
  texto sin escapar (`Op.eq`). El límite es una constante, `RESULTADOS_MAXIMOS = 20`. Para que el código de barras
  exacto vaya primero se puede usar una segunda consulta con `Op.eq` o un `sequelize.literal` que lea el texto con
  `replacements`. Las dos sirven, si el texto nunca se pega en el SQL.
  `[@test] ../backend/tests/productos/buscar-productos.test.js`
- Las pruebas crean sus productos con el modelo `Producto`, en la base de prueba, y los borran al terminar: dejan la
  tabla como la encontraron (regla de "Base de datos" de la arquitectura).
  `[@test] ../backend/tests/productos/buscar-productos.test.js`

### Documentación de la API

- La ruta se documenta en el documento OpenAPI de A-01 (`backend/docs/openapi.yaml`, el archivo que fija la spec de la
  documentación de la API): `GET /api/productos` con el parámetro `busqueda` (obligatorio, de 2 a 120 caracteres), la
  respuesta 200 con la lista de productos, y las respuestas 400 y 500 con el esquema de error que A-01 define. Los
  ejemplos de error no muestran el SQL ni el stack.
  `[@test] ../backend/tests/productos/documentacion-buscar-productos.test.js`
- La prueba de A-01 ("falla si una ruta de Express no está documentada") también exige esta ruta.

### Pruebas en local: la API con `curl`

Con MySQL levantado y migrado y el backend corriendo (`npm run dev`), y los productos de ejemplo creados con
`POST /api/productos` (P-01): "Leche entera 1 L" con código de barras "7501055300075" y precio "25.00", "Jugo 50% fruta"
con código de barras "111" y precio "18.50", "Jugo 500 ml" con código de barras "222" y precio "12.00", y "Cable A_B" con
código de barras "333" y precio "40.00". Los `curl` usan `-G` y `--data-urlencode` para que el texto viaje bien codificado. Se corren con `PORT` en
lugar de 3000 si el `.env` lo cambió:

| Comando | Respuesta esperada |
|---|---|
| `curl -s -G localhost:3000/api/productos --data-urlencode "busqueda=lech" -w "\n%{http_code}\n"` | 200 y una lista con "Leche entera 1 L" |
| `curl -s -G localhost:3000/api/productos --data-urlencode "busqueda=7501055300075" -w "\n%{http_code}\n"` | 200 y una lista con "Leche entera 1 L" |
| `curl -s -G localhost:3000/api/productos --data-urlencode "busqueda=zzzz" -w "\n%{http_code}\n"` | 200 y `[]` |
| `curl -s -G localhost:3000/api/productos --data-urlencode "busqueda=50%" -w "\n%{http_code}\n"` | 200 y solo "Jugo 50% fruta" |
| `curl -s -G localhost:3000/api/productos --data-urlencode "busqueda=a_b" -w "\n%{http_code}\n"` | 200 y solo "Cable A_B" |
| `curl -s -G localhost:3000/api/productos --data-urlencode "busqueda=' OR 1=1 --" -w "\n%{http_code}\n"` | 200 y `[]`, no todos los productos |
| `curl -s -G localhost:3000/api/productos --data-urlencode 'busqueda=a\' -w "\n%{http_code}\n"` | 200 y `[]`, no todos los productos con una "a" |
| `curl -s -G localhost:3000/api/productos --data-urlencode "busqueda=a" -w "\n%{http_code}\n"` | 400 y `DATOS_INVALIDOS` con `detalles` del campo `busqueda` |
| `curl -s localhost:3000/api/productos -w "\n%{http_code}\n"` | 400 y `DATOS_INVALIDOS` |

Para el 500 se apaga MySQL (`docker compose stop mysql`) y se repite el primer comando: responde 500 con
`ERROR_INTERNO` y sin SQL. El agente anota el resultado de cada comando en su "Update" de la tarjeta. Esta prueba es
manual, sin archivo de prueba, como pide "Pruebas en local" de la arquitectura.

## Criterios de aceptación de la API (P-04)

Los cinco primeros son los de la tarjeta P-04; el resto completan la spec.

1. Dado el producto "Leche entera 1 L", cuando se busca "lech", entonces aparece en la lista.
   `[@test] ../backend/tests/productos/buscar-productos.test.js`
2. Dado el código de barras "7501055300075", cuando se busca completo, entonces aparece ese producto.
   `[@test] ../backend/tests/productos/buscar-productos.test.js`
3. Dado un texto sin coincidencias, entonces responde 200 con la lista vacía.
   `[@test] ../backend/tests/productos/buscar-productos.test.js`
4. Dado el texto "50%", entonces solo aparecen productos con "50%" en el nombre (con "Jugo 50% fruta" y "Jugo 500 ml"
   creados, solo sale el primero).
   `[@test] ../backend/tests/productos/buscar-productos.test.js`
5. Dado el texto "' OR 1=1 --", entonces no devuelve todos los productos (con varios productos creados, responde 200 y
   la lista vacía).
   `[@test] ../backend/tests/productos/buscar-productos.test.js`
6. Dado el texto "a_b", entonces solo aparece "Cable A_B", no "Cable AXB". Dado el texto `a\` (2 caracteres, con una barra
   invertida al final), entonces responde 200 y no devuelve todos los productos con una "a" en el nombre: con los
   productos de ejemplo, la lista vacía. Un solo `\` es de 1 carácter y responde 400.
   `[@test] ../backend/tests/productos/buscar-productos.test.js`
7. Dado el texto "LÉCH" o "lech", entonces aparece "Leche entera 1 L": no cuentan las mayúsculas ni las tildes.
   `[@test] ../backend/tests/productos/buscar-productos.test.js`
8. Dado el texto "  lech  " (con espacios en los extremos), entonces busca "lech".
   `[@test] ../backend/tests/productos/buscar-productos.test.js`
9. Dado un pedazo del código de barras ("750105530007"), entonces no aparece el producto por su código.
   `[@test] ../backend/tests/productos/buscar-productos.test.js`
10. Dados 25 productos con "Galleta" en el nombre, cuando se busca "galleta", entonces la lista trae 20, los primeros 20
    por nombre de la A a la Z.
    `[@test] ../backend/tests/productos/buscar-productos.test.js`
11. Dado un producto cuyo código de barras es "222" y 25 productos con "222" en el nombre, cuando se busca "222", entonces
    el producto de ese código de barras va primero.
    `[@test] ../backend/tests/productos/buscar-productos.test.js`
12. Dado un texto de 1 carácter, o sin `busqueda`, o de más de 120, entonces responde 400 `DATOS_INVALIDOS` con el campo
    `busqueda` en `detalles`.
    `[@test] ../backend/tests/productos/buscar-productos.test.js`
13. Dado un producto encontrado, entonces trae `id` (número entero), `nombre`, `codigoBarras` y `precio` (texto con 2
    decimales, "25.00"), y ningún campo más.
    `[@test] ../backend/tests/productos/buscar-productos.test.js`
14. Dado que MySQL falla (la prueba hace que `Producto.findAll` lance un error con un texto de SQL), entonces responde
    500 `ERROR_INTERNO`, sin el SQL ni el stack en el cuerpo.
    `[@test] ../backend/tests/productos/buscar-productos.test.js`

## Pantalla: campo de búsqueda y resultados (P-05)

### Cómo se ve y se comporta

`BuscadorProductos.vue` (`src/components/`, Options API, un solo elemento raíz) es el campo de búsqueda con su lista de
resultados. Se pone en `App.vue`, en la pantalla principal (RNF-01), y cabe en un componente: no hace falta partirlo. No
guarda nada en `localStorage`. B-04 deja `BuscadorProductos.vue` con el campo «Buscar producto», su ayuda, la lupa, el
botón de borrar y el foco al abrir (en `mounted`), y ya lo pone en `App.vue` (`data-zona="busqueda"`): P-05 le suma lo
demás sin quitar nada de eso.

- Un campo de texto de Vuetify 2 (`v-text-field`) con etiqueta visible "Buscar producto", ayuda "Nombre o código de
  barras", ícono de lupa MDI, botón para borrar y foco al abrir la pantalla. Debajo, la zona de resultados.
- Con el texto recortado en 0 caracteres no se muestra ningún mensaje ni resultados.
- Con 1 carácter no llama a la API y muestra "Escribe al menos 2 caracteres".
  `[@test] ../frontend/tests/componentes/BuscadorProductos.test.js`
- Con 2 o más, espera 300 ms sin cambios y entonces llama a `buscarProductos(texto)` de `src/api/productos.js`, con el
  texto ya recortado. Cada tecla nueva reinicia la espera: escribir "le", "lec" y "lech" seguido hace una sola llamada,
  con "lech". La espera y el mínimo son constantes con nombre (`ESPERA_MS = 300`, `MINIMO_CARACTERES = 2`).
  `[@test] ../frontend/tests/componentes/BuscadorProductos.test.js`
- Cada llamada lleva un número de búsqueda que crece. La respuesta, buena o mala, solo se usa si su número es el último.
  Una respuesta de una búsqueda anterior que llega tarde se ignora. Borrar el texto o dejarlo en menos de 2
  caracteres también invalida la búsqueda en curso.
  `[@test] ../frontend/tests/componentes/BuscadorProductos.test.js`
- Mientras espera la respuesta, la zona de resultados muestra la animación `buscando` (`AnimacionLottie`, decorativa,
  `aria-hidden="true"`) con el texto "Buscando…".
  `[@test] ../frontend/tests/componentes/BuscadorProductos.test.js`
- Con resultados, muestra una lista con una fila por producto: el nombre, el código de barras debajo y el precio a la
  derecha, con los 2 decimales que manda la API y sin símbolo de moneda. El nombre puede pasar a una segunda línea:
  nunca se corta sin poder leerse.
  `[@test] ../frontend/tests/componentes/BuscadorProductos.test.js`
- Con 20 resultados agrega la nota "Se muestran los primeros 20. Escribe más para afinar la búsqueda", porque la API no
  dice si hay más.
  `[@test] ../frontend/tests/componentes/BuscadorProductos.test.js`
- Sin coincidencias muestra "Sin resultados".
  `[@test] ../frontend/tests/componentes/BuscadorProductos.test.js`
- Si la llamada falla (sin respuesta, 400 o 500), muestra "No se pudo buscar. Intenta de nuevo." y un botón "Reintentar"
  que repite la búsqueda. El texto escrito no se pierde (RNF-05). La pantalla no muestra el mensaje interno del error.
  `[@test] ../frontend/tests/componentes/BuscadorProductos.test.js`
- Elegir un resultado (con clic, o con Enter o espacio sobre la fila) emite el evento `producto-elegido` con el producto
  (`{ id, nombre, codigoBarras, precio }`). Después el campo se limpia, la lista se cierra y el foco vuelve al campo,
  para que el cajero busque el siguiente producto sin tocar el ratón. El componente no sabe nada de la venta actual:
  V-04 conecta ese evento con `agregarAVentaActual` en `App.vue`.
  `[@test] ../frontend/tests/componentes/BuscadorProductos.test.js`
- El nombre y el código de barras se muestran como texto (con `{{ }}`, nunca `v-html`): un nombre como `<b>x</b>` se ve
  con esas letras (RNF-04).
  `[@test] ../frontend/tests/componentes/BuscadorProductos.test.js`
- `buscarProductos(texto)` de `src/api/productos.js` llama a `GET /productos` de `src/api/http.js` con
  `params: { busqueda: texto }` y devuelve la lista. Axios codifica el texto. Un error llega como el `Error` con
  `status`, `codigo` y `mensaje` que arma `http.js`. Ningún componente importa `axios` ni escribe la URL.
  `[@test] ../frontend/tests/api/buscar-productos.test.js`
  `[@test] ../frontend/tests/sin-axios-en-componentes.test.js`
- Patrón: Debounce, para la espera de 300 ms (evita una llamada por tecla). Para ignorar las respuestas viejas, el más
  cercano es SwitchMap (solo cuenta la última búsqueda), pero se resuelve con un contador y no con una librería reactiva.
  No se cancela la llamada vieja (`AbortController`): la API es barata y ignorar su respuesta alcanza. Para el resto
  (mostrar la lista, avisar la elección con un evento) el catálogo no trae un patrón para un componente de Vue 2, y no
  se inventa uno. La fachada de `src/api/` ya está en la spec de arquitectura.

### Estados de la zona de resultados

Solo hay uno a la vez:

| Estado | Cuándo | Qué se ve |
|---|---|---|
| Inicial | Texto vacío | Nada. |
| Pocos caracteres | 1 carácter | "Escribe al menos 2 caracteres". |
| Buscando | Llamada en curso | La animación `buscando` y "Buscando…". |
| Con resultados | 1 a 20 productos | La lista (y la nota, si son 20). |
| Sin resultados | Lista vacía | "Sin resultados". |
| Error | La llamada falló | "No se pudo buscar. Intenta de nuevo." y "Reintentar". |

  `[@test] ../frontend/tests/componentes/BuscadorProductos.test.js`

### Diseño (skill `impeccable`)

La pantalla se diseña con la skill `impeccable`, como pide la spec de arquitectura: el agente la carga antes de
construir el componente y la corre en modo auditoría sobre lo que cambió. Lo que esta spec fija, dentro de las reglas de
Vue 2 y Vuetify 2:

- Colores solo de la paleta del tema (`primary`, `error`, `accent`, `secondary`). Todo texto en `#292F36`. El error se
  escribe en `#292F36`, dentro de una franja con borde e ícono `#FF6B6B`, nunca en texto rojo sobre el fondo claro. La
  prueba de contraste de la arquitectura (`tema.test.js`) sigue en pie: el componente no agrega pares nuevos.
- Los mensajes de estado ("Escribe al menos 2 caracteres", "Sin resultados", "Buscando…" y el error) van en una región
  con `role="status"` y `aria-live="polite"`, para que un lector de pantalla los anuncie. La lista es una lista de
  verdad, y cada fila se alcanza con Tab, se elige con Enter o espacio y muestra un foco visible.
- Cada fila mide al menos 48 px de alto (se usa con el dedo en una tableta) y el nombre, el código de barras y el precio se
  leen con contraste 4.5 o más.
- Con 375 px de ancho (móvil) no hay scroll horizontal: el nombre pasa a otra línea y el precio no se corta.
- La animación `buscando.json` la hace P-05 (con el MCP `lottiefiles-creator` o, si no está, con la skill
  `text-to-lottie`), en los colores de la paleta y con menos de 50 KB. Con `prefers-reduced-motion: reduce`,
  `AnimacionLottie` muestra un cuadro fijo (el último por defecto, según su propiedad `cuadroFijo`), como dice la
  arquitectura.
  `[@test] ../frontend/tests/animaciones.test.js`
- Los textos de la pantalla son los de esta spec, en español, con las palabras del glosario.

`[@test] ../frontend/tests/componentes/BuscadorProductos.test.js`

## Criterios de aceptación de la pantalla (P-05)

Los cuatro primeros son los de la tarjeta P-05; el resto completan la spec. Las pruebas automáticas usan Vitest,
`@vue/test-utils` 1 y jsdom, con `vi.useFakeTimers()` para la espera y `vi.mock` para `src/api/productos.js` y para
la ruta exacta que importa `AnimacionLottie`, `lottie-web/build/player/lottie_light`.

1. Dado que el cajero escribe rápido "le", "lec" y "lech", entonces solo se ven los resultados de "lech" (una sola
   llamada a la API, con "lech"). Y dado que la respuesta de "le" llega después que la de "lech", entonces sigue la
   lista de "lech".
   `[@test] ../frontend/tests/componentes/BuscadorProductos.test.js`
2. Dada una sola letra, entonces se ve "Escribe al menos 2 caracteres" y no se llama a la API.
   `[@test] ../frontend/tests/componentes/BuscadorProductos.test.js`
3. Dado un texto sin coincidencias, entonces se ve "Sin resultados".
   `[@test] ../frontend/tests/componentes/BuscadorProductos.test.js`
4. Dado un resultado, cuando el cajero lo elige, entonces pasa a la venta actual (el componente emite
   `producto-elegido` con ese producto; V-04 lo agrega).
   `[@test] ../frontend/tests/componentes/BuscadorProductos.test.js`
5. Dado el producto "Leche entera 1 L" y el texto "lech", entonces la lista muestra su nombre, su código de barras y su
   precio "25.00".
   `[@test] ../frontend/tests/componentes/BuscadorProductos.test.js`
6. Dado que la API falla, entonces se ve "No se pudo buscar. Intenta de nuevo.", el texto sigue en el campo, y al pulsar
   "Reintentar" se busca otra vez.
   `[@test] ../frontend/tests/componentes/BuscadorProductos.test.js`
7. Dado que el cajero borra el texto mientras espera una respuesta, entonces la respuesta que llega después se ignora y
   no se ve ni la lista ni un mensaje.
   `[@test] ../frontend/tests/componentes/BuscadorProductos.test.js`
8. Dados 20 resultados, entonces se ve la nota "Se muestran los primeros 20. Escribe más para afinar la búsqueda".
   `[@test] ../frontend/tests/componentes/BuscadorProductos.test.js`
9. Dado un producto con el nombre `<b>x</b>`, entonces la pantalla muestra esas letras y no pone negritas.
   `[@test] ../frontend/tests/componentes/BuscadorProductos.test.js`
10. Dado un resultado elegido, entonces el campo queda vacío y con el foco.
    `[@test] ../frontend/tests/componentes/BuscadorProductos.test.js`

### Pruebas en local: la pantalla en el navegador

Con el backend corriendo y los productos de ejemplo de arriba, el agente corre la pantalla (`npm run dev` del frontend)
y la prueba con el MCP `chrome-devtools`. Si la sesión no lo tiene, lo dice y la persona desarrolladora hace esta prueba
a mano.

1. `navigate_page` a la pantalla y `take_snapshot`: se ve el campo "Buscar producto" con el foco.
2. `type_text` "l" (una letra): se ve "Escribe al menos 2 caracteres" y `list_network_requests` no muestra ninguna llamada
   a `/api/productos`.
3. `type_text` "ech" a continuación ("lech"): tras 300 ms se ve "Leche entera 1 L", su código de barras "7501055300075" y
   su precio "25.00". `list_network_requests` muestra una sola llamada a `/api/productos?busqueda=lech` con estado 200.
4. `fill` con "zzzz": se ve "Sin resultados". Con "50%": solo "Jugo 50% fruta".
5. `click` en el resultado "Leche entera 1 L": el campo queda vacío y con el foco (la venta actual la conecta V-04).
6. Se apaga el backend (o `emulate` con la red sin conexión) y `fill` con "lech": se ve "No se pudo buscar. Intenta de
   nuevo." con el botón "Reintentar", y el texto sigue en el campo. Se enciende otra vez y `click` en "Reintentar": se
   ven los resultados.
7. `resize_page` a 375 × 667: sin scroll horizontal y con las filas legibles.
8. `list_console_messages`: sin errores. `take_screenshot` del estado con resultados y del estado de error.

El agente anota el resultado en su "Update" de la tarjeta. Si hace falta un bug, se abre como issue de GitHub con los
pasos para reproducirlo y se cierra con el commit que lo corrige (regla de "Pruebas en local" de la arquitectura).

## RF-12 opcional: Enter con un código de barras exacto

Es opcional y entra si sobra tiempo (pregunta abierta 5, resuelta el 2026-09-30), y solo lo hace P-05. No cambia la
API: usa la misma búsqueda. El diagrama BPMN del flujo 02 todavía no lo dibuja. Si no se hace, la subtarea "RF-12
opcional" de P-05 queda sin marcar y nada más cambia.

- Con Enter en el campo y 2 o más caracteres, el componente cancela la espera de 300 ms y busca de inmediato, porque un
  lector de código de barras escribe y pulsa Enter más rápido que la espera. Con menos de 2 caracteres, Enter no hace
  nada.
- Si entre los resultados de esa búsqueda hay un producto cuyo `codigoBarras` es igual al texto recortado, el componente
  emite `producto-elegido` con él, sin pasar por la lista, y limpia el campo, como al elegir un resultado. La
  comparación es exacta, letra por letra.
  `[@test] ../frontend/tests/componentes/BuscadorProductos-enter.test.js`
- Si ningún producto tiene ese código de barras exacto, se ve "No hay un producto con ese código de barras" (RF-12,
  criterio 2), sea cual sea el resultado de la búsqueda, y no se agrega nada. Si el texto además coincide con nombres,
  esos resultados se muestran debajo del mensaje y el cajero elige uno. Si no coincide con nada, el mensaje reemplaza a
  "Sin resultados".
  `[@test] ../frontend/tests/componentes/BuscadorProductos-enter.test.js`
- Aplica la misma regla de las respuestas viejas: si el cajero sigue escribiendo, la respuesta de un Enter anterior se
  ignora y no agrega nada.
  `[@test] ../frontend/tests/componentes/BuscadorProductos-enter.test.js`
- Criterios de RF-12: dado "7501055300075" y Enter, la leche entra a la venta actual (se emite `producto-elegido`) y el
  campo se limpia; dado un código de barras que no existe y Enter, se ve "No hay un producto con ese código de barras".
  `[@test] ../frontend/tests/componentes/BuscadorProductos-enter.test.js`
- Prueba en local: con `chrome-devtools`, `fill` con "7501055300075" y `press_key` Enter: el campo queda vacío y
  `producto-elegido` llega a la venta actual cuando V-04 esté conectada (antes se ve en la consola de Vue o en la prueba
  automática). Con "0000" y Enter, se ve "No hay un producto con ese código de barras".

## Lo que esta spec no cubre

- Crear un producto (P-01 a P-03) y la venta actual (V-04 a V-07): son de otras specs.
- Paginar o pedir más de 20 resultados: no hace falta, el cajero afina el texto.
- Ordenar por relevancia o buscar por partes del código de barras: no lo pide RF-02.
- Guardar el último texto buscado: el campo empieza vacío cada vez que se abre la pantalla.

## Cómo se decidió el diseño

| Decisión | Patrón | Por qué, en una frase |
|---|---|---|
| Validar el texto en la API | Input Validation | A la API se le puede llamar sin la pantalla, y este texto llega al SQL. |
| Rutas, controller, servicio y modelo | Layered Architecture y Service Layer | Es la decisión de la arquitectura y cabe en una consulta. |
| Una sola consulta de búsqueda | Query Object, descartado | Hay una sola consulta fija, y `findAll` ya la expresa. |
| Espera de 300 ms al escribir | Debounce | Evita una llamada por cada tecla. |
| Ignorar respuestas viejas | SwitchMap, el más cercano | Solo cuenta la última búsqueda; se hace con un contador porque no hay librería reactiva. |
| `src/api/productos.js` | Facade (de la arquitectura) | La pantalla no sabe de rutas ni de axios. |
| El componente y sus eventos | Ninguno del catálogo | No hay un patrón para un componente de Vue 2 con un evento; se sigue la práctica de Vue. |
