# Requerimientos no funcionales

Lo que AIPOS cumple además de sus funciones: tecnologías, calidad, seguridad, forma de trabajo y entrega. Cada
requerimiento no funcional (RNF) dice de dónde sale y cómo se comprueba. La tarjeta R-02 del tablero AIPOS
tiene una subtarea por RNF para marcar lo cumplido.

## RNF-01 Una sola pantalla

Todo pasa en una sola pantalla: el botón "Nuevo producto", el campo de búsqueda con sus resultados, la venta
actual con su total y el botón "Registrar venta".

- **Origen:** PDF, "Objetivo" y §1 a §3.
- Los precios se ven con 2 decimales y sin símbolo de moneda (pregunta abierta 6, resuelta el 2026-09-30).
- **Se comprueba:** no hay rutas ni páginas aparte; el formulario de producto se abre en un modal encima de la
  pantalla.

## RNF-02 Tecnologías y versiones

Las tecnologías las fija el PDF. Las versiones se comprobaron con `npm view` el 2026-09-29 y se volvieron a
comprobar el 2026-09-30, al escribir la [spec de arquitectura](../specs/arquitectura.spec.md), que tiene la lista
completa y dónde se instala cada paquete. Todas van fijas, sin `^` ni `~`.

| Parte | Tecnología | Versión | Nota |
|---|---|---|---|
| Frontend | Vue | 2.7.16 | La última de Vue 2. |
| Frontend | Vuetify | 2.7.2 | `npm i vuetify` instala la 4.2.2, que no funciona con Vue 2. Se instala `vuetify@2.7.2` y se usa su CSS ya compilado. |
| Frontend | Axios | 1.20.0 | Nunca la 1.14.1 ni la 0.30.4 (versiones maliciosas). |
| Frontend | Vite | 7.3.6 | Decisión del 2026-09-29: Vite en vez de Vue CLI. `@vitejs/plugin-vue2` 2.3.4 acepta hasta Vite 7, y `npm i vite` instala la 8.3.1. |
| Frontend | lottie-web | 5.13.0 | Animaciones Lottie, con la versión fija. |
| Frontend | @mdi/font | 7.4.47 | Íconos MDI. |
| Los dos | Node.js | 24 (`.nvmrc`) | Es la LTS. Vite 7 pide 22.12 o más, Vitest 5 pide 22.12 o 24, y jsdom 30 pide 24.15 o más. |
| Backend | Express | 5.2.1 | Confirmada el 2026-09-30. La 5 pasa al manejador de errores los errores de funciones `async`. |
| Backend | Sequelize | 6.37.8, con `sequelize-cli` 6.6.5 | La 7 sigue en alfa. |
| Backend | mysql2 | 3.24.5 | Devuelve `DECIMAL` como texto: "25.00" + "22.00" pega los textos en vez de sumar. |
| Base de datos | MySQL | 8.4, con la imagen `mysql:8.4` de Docker | Hace falta 8.0.16 o más para que MySQL aplique las restricciones `CHECK`. Nunca `mysql:latest` ni una 9.x: Sequelize 6 soporta MySQL 5.7 y 8. |
| Pruebas | Vitest | 5.0.2 | En el backend, con `supertest` 7.3.0, y en el frontend, con `@vue/test-utils` 1.3.6 y jsdom 30.1.1. |
| Calidad | ESLint y Prettier | 10.11.0 y 3.9.9 | En el frontend, con `eslint-plugin-vue` 10.11.1 y su configuración `flat/vue2-recommended`. |

- **Diseño de la pantalla:** con la skill `impeccable`, con la paleta de la persona desarrolladora: `#292F36`,
  `#4ECDC4`, `#F7FFF7`, `#FF6B6B` y `#FFE66D`. El quinto color es un supuesto: la persona mandó `#FF6B6B` repetido
  y se asumió `#FFE66D`, el de la paleta clásica. El texto es `#292F36` y nunca blanco sobre `#4ECDC4` (contraste AA).
- **Origen:** PDF, "Tecnologías requeridas".
- **Se comprueba:** `package.json` fija las versiones y el README las lista (punto 2).

## RNF-03 Validación en tres lugares

- **Pantalla:** reglas de Vuetify en cada campo, para avisar rápido.
- **API:** valida todo antes de tocar la base de datos. Es la que manda, porque se le puede llamar sin la
  pantalla.
- **Base de datos:** `NOT NULL`, `UNIQUE`, `CHECK` y llaves foráneas.

- **Origen:** PDF, "Aspectos que se evaluarán": "criterios básicos de seguridad y validación".
- **Se comprueba:** una petición mal armada, mandada directo a la API, recibe 400.

## RNF-04 Seguridad básica

- Consultas parametrizadas: Sequelize con `replacements`. El texto del cajero nunca se pega dentro del SQL.
- `%` y `_` se escapan en la búsqueda.
- Las credenciales van en `.env`, fuera de git. El repositorio trae `.env.example`.
- CORS (la regla del navegador que decide qué páginas pueden llamar a la API) solo acepta el origen de la
  pantalla.
- La API limita el tamaño del cuerpo JSON.
- Los errores no muestran detalles internos al cliente, ni el stack ni el SQL.
- La pantalla no usa `v-html` con datos del cajero; Vue escapa el texto al mostrarlo.

- **Origen:** PDF, "Aspectos que se evaluarán".
- **Se comprueba:** una búsqueda con `' OR 1=1 --` no devuelve todos los productos, y un error 500 no muestra
  SQL.

## RNF-05 Manejo de errores

Un solo manejador de errores en Express y un solo formato de respuesta de error. El formato está en la
[spec de arquitectura](../specs/arquitectura.spec.md) y lo construye B-02.

| Código | Cuándo |
|---|---|
| 400 | Datos inválidos. |
| 404 | Lo pedido no existe. |
| 409 | El código de barras ya existe. |
| 422 | El procedimiento almacenado rechazó la venta por una regla de negocio (`SQLSTATE 45000`). |
| 500 | Error inesperado. Se escribe en el log del servidor. |

La pantalla muestra mensajes claros en español y nunca pierde lo escrito ni la venta actual por un error.

- **Origen:** PDF, "Aspectos que se evaluarán": "Manejo de errores".
- **Se comprueba:** cada código tiene una prueba en el backend.

## RNF-06 Arquitectura en capas

- **Backend:** rutas → controladores → servicios → modelos y base de datos. La lógica de negocio va en los
  servicios.
- **Frontend:** componentes de la vista, un servicio de API con Axios y la lógica de la venta actual separada
  de la vista, para poder probarla sin pantalla.
- Los nombres salen del glosario, en todo el código.

- **Origen:** PDF, "Aspectos que se evaluarán": "Arquitectura y separación de responsabilidades".
- **Se comprueba:** ningún componente de Vue llama a Axios directo y ninguna ruta de Express habla con la base.

## RNF-07 Base de datos reproducible

- Migraciones de Sequelize para las tablas y para crear el procedimiento almacenado.
- El script SQL del procedimiento vive en el repositorio.
- Docker Compose levanta MySQL.
- Desde cero: clonar, copiar `.env.example`, levantar MySQL, migrar y arrancar, con los comandos del README.

- **Origen:** PDF, §5 y "Entrega".
- **Se comprueba:** la tarjeta E-03 lo hace en un clon limpio.

## RNF-08 Pruebas

- **Backend:** Vitest y `supertest` contra una base de prueba separada de la de desarrollo. Cubren la API de productos
  y de ventas, cada código de RNF-05, y el caso "todo o nada" del procedimiento.
- **Frontend:** Vitest, `@vue/test-utils` 1 y jsdom. Cubren la lógica de la venta actual (agregar, cantidad, precio
  aplicado, eliminar, total y su guardado en el navegador) y los componentes.
- **Pruebas en local:** todo se prueba también con el sistema corriendo en local. La API, con `curl` contra el backend
  corriendo. La pantalla, en el navegador, con el MCP `chrome-devtools`.
- **Bugs:** cada bug relevante se abre como un issue de GitHub, con los pasos para reproducirlo, y se cierra con un
  comentario que nombra el commit que lo corrige.
- La persona desarrolladora valida el resultado. El PDF la hace responsable de las pruebas.

- **Origen:** PDF, "Uso de inteligencia artificial": el candidato sigue siendo responsable de "la validación del
  código generado, la depuración, las pruebas y el resultado final". La forma de correr las pruebas está en la
  [spec de arquitectura](../specs/arquitectura.spec.md).
- **Se comprueba:** `npm test` pasa en el backend y en el frontend, y cada tarjeta deja en su "Update" el resultado de
  sus pruebas en local.

## RNF-09 Git y GitHub

- Una rama de entregable por entregable, que sale de `ProductionEnv`: `feature/base`, `feature/productos` y
  `feature/ventas`.
- Cada tarjeta trabaja en su propia rama de tarjeta, `<tipo>/<id>-<resumen>` en minúsculas (por ejemplo
  `feature/b-02-base-del-backend`). Sale de la rama de su entregable y entra a ella con un PR, con merge commit y sin
  borrar la rama. Las tarjetas sin entregable van directo a su destino: B-01 y D-01 a `ProductionEnv`, y S-01 a `main`.
- Cada entregable entra a `ProductionEnv` con un PR, la revisión del agente revisor y el visto bueno de la persona
  desarrolladora. Se integra con merge commit, sin borrar la rama, y se marca con una etiqueta `entregable-<x>`.
- Cada PR, el de la tarjeta y el del entregable, pasa la revisión del agente revisor antes de integrarse.
- Mensajes con Conventional Commits en español.
- Nunca hay commits directos en `main` ni en `ProductionEnv`.

- **Origen:** PDF, "Requerimientos de Git y GitHub". Detalle en el [flujo 05](flujos/05-entregar-un-entregable.md).
- **Se comprueba:** `git log --graph` en `ProductionEnv` muestra un merge commit por entregable, y dentro de cada uno,
  los merge commits de sus tarjetas.

## RNF-10 Uso del agente

- Claude Code trabaja sobre el código del repositorio. Codex, como agente revisor, revisa cada PR.
- Cada tarea queda en la [bitácora de IA](../docs/bitacora-ia.md): qué se pidió, qué hizo el agente, qué revisó
  o corrigió la persona desarrolladora, qué propuestas se descartaron y cuánto tomó.

- **Origen:** PDF, "Uso de inteligencia artificial - obligatorio". Detalle en el
  [flujo 06](flujos/06-trabajar-una-tarjeta-con-el-agente.md).
- **Se comprueba:** cada commit del agente trae `Co-Authored-By` y su entrada en la bitácora.

## RNF-11 README de 12 puntos

El README de la raíz tiene los 12 puntos del PDF, con la plantilla de la skill `readme-entrega`. Dice también
lo que agregamos y lo que no se completó.

- **Origen:** PDF, "README.md obligatorio".
- **Se comprueba:** la tarjeta E-02 revisa los 12 puntos uno por uno.

## RNF-12 Entrega

Un repositorio público en GitHub con: frontend, backend, migraciones y scripts de MySQL, el script del
procedimiento almacenado, el README completo, la rama `ProductionEnv` con la versión final y un historial con
los entregables claros.

- **Origen:** PDF, "Entrega".
- **Se comprueba:** la tarjeta E-03 lo revisa desde un clon limpio.

## RNF-13 Código mantenible

- Un estilo uniforme con ESLint (revisa el código, en configuración plana; en el frontend, con la configuración
  `flat/vue2-recommended` de `eslint-plugin-vue`) y Prettier (le da formato). Confirmados en la
  [spec de arquitectura](../specs/arquitectura.spec.md).
- Sin nombres vagos: `Manager`, `Helper`, `Processor`, `Data`, `Info`, `Util`.
- Funciones cortas y comentarios solo donde el porqué no es obvio.

- **Origen:** PDF, "Aspectos que se evaluarán": "Calidad, claridad y mantenibilidad del código".
- **Se comprueba:** `npm run lint` y `npm run format:check` pasan sin errores, en el backend y en el frontend.
