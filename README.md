# AIPOS

AIPOS es una aplicación web de una sola pantalla para un punto de venta básico. El cajero crea y busca productos, arma
la venta actual y la registra en MySQL con un procedimiento almacenado (una función guardada dentro de MySQL que la
app llama por su nombre). Es la solución de una prueba técnica y se construyó con agentes de código.

| Qué | Dónde |
|---|---|
| Pantalla | <https://aipos.salsalvador.io> |
| API (el backend) | <https://aipos-back.salsalvador.io> |
| Documentación de la API (Swagger UI) | <https://aipos-back.salsalvador.io/api/docs> |
| Versión desplegada | la etiqueta `release-1.0.0` |
| Código | <https://github.com/g14wx/AIPOS>, rama `ProductionEnv` |

Este README tiene los 12 puntos que pide la prueba. Cada dato se puede comprobar en el repositorio, y la prueba
`tests/documentacion/readme-entrega.test.sh` revisa que estén los 12 puntos, que las versiones sean las instaladas y que
los archivos y los comandos que se nombran existan.

1. [Funcionalidades](#1-funcionalidades)
2. [Tecnologías y versiones](#2-tecnologías-y-versiones)
3. [Estructura](#3-estructura)
4. [Cumplimiento de requisitos](#4-cumplimiento-de-requisitos)
5. [Instalación y ejecución](#5-instalación-y-ejecución)
6. [Base de datos MySQL](#6-base-de-datos-mysql)
7. [Procedimiento almacenado](#7-procedimiento-almacenado)
8. [Tiempo](#8-tiempo)
9. [Herramientas de IA](#9-herramientas-de-ia)
10. [Cómo se usó el agente](#10-cómo-se-usó-el-agente)
11. [Decisiones técnicas](#11-decisiones-técnicas)
12. [Consideraciones](#12-consideraciones)

## 1. Funcionalidades

Todo pasa en una sola pantalla: el botón «Nuevo producto», el campo de búsqueda con sus resultados, la venta actual con
su total y el botón «Registrar venta».

- **Crear producto.** El botón «Nuevo producto» abre un formulario con nombre, precio y código de barras. La pantalla, la
  API y MySQL validan los datos: el precio es mayor que 0 y llega hasta 99 999.99, con 2 decimales como máximo. Un código
  de barras repetido da un error 409, y la pantalla lo dice junto al campo sin borrar lo que el cajero escribió.
- **Buscar producto.** Por una parte del nombre, sin importar mayúsculas, o por el código de barras exacto. Busca desde 2
  caracteres y muestra 20 resultados como máximo. Si el cajero escribe rápido, solo se ven los resultados de lo último
  que escribió.
- **Agregar a la venta actual.** Elegir un resultado lo agrega con cantidad 1 y con un precio aplicado igual al precio del
  producto. Si ya estaba, su cantidad sube en 1. Si el cajero escribe un código de barras completo y presiona Enter, el
  producto entra directo, sin elegirlo en la lista.
- **Ver la venta actual.** Cada detalle de la venta actual muestra su nombre, su precio aplicado, su cantidad y su
  subtotal, y abajo está el total, con 2 decimales. La venta actual se guarda en el navegador: si se recarga la página,
  sigue ahí.
- **Editar el precio aplicado, cambiar la cantidad y eliminar detalle.** Editar el precio aplicado no cambia el precio del
  producto. La cantidad es un entero de 1 a 999, y una venta tiene como máximo 100 detalles. Un valor que no sirve queda
  como error de un campo del detalle, y «Registrar venta» se deshabilita hasta corregirlo.
- **Registrar venta.** El botón manda la venta actual a la API, que llama al procedimiento almacenado
  `sp_registrar_venta` (punto 7). Guarda la venta con todos sus detalles de una sola vez, o no guarda nada. La pantalla
  muestra «Venta N registrada · Total X», con el total que calculó MySQL, y deja vacía la venta actual.

### La API

| Ruta | Qué hace | Errores |
|---|---|---|
| `GET /api/salud` | Dice si la API está viva y si MySQL responde. | 500 si MySQL no responde |
| `GET /api/productos?busqueda=` | Buscar producto. | 400 |
| `POST /api/productos` | Crear producto. | 400, 409 |
| `POST /api/ventas` | Registrar venta. | 400, 422 |
| `GET /api/docs` | La documentación de la API, con Swagger UI. | — |

Las respuestas de error de la API tienen la misma forma, `{ "error": { "codigo", "mensaje", "detalles" } }`, y usan uno de
cinco estados: 400 (datos inválidos), 404 (la ruta no existe), 409 (el código de barras ya existe), 422 (el procedimiento
almacenado rechazó la venta por una regla de negocio) y 500 (error inesperado, sin detalles internos para el cliente). La
excepción conocida está en el punto 12. El documento `backend/docs/openapi.yaml` describe cada ruta.

## 2. Tecnologías y versiones

Las versiones van fijas, sin `^` ni `~`, y son las que instala `npm ci` según cada `package-lock.json`. La prueba del
README las compara con esos archivos.

| Parte | Tecnología | Versión | Dónde se fija |
|---|---|---|---|
| Los dos | Node.js | 24 | `.nvmrc` (los dos `package.json` piden 24 o más) |
| Frontend | Vue | 2.7.16 | `frontend/package-lock.json` |
| Frontend | Vuetify | 2.7.2 | `frontend/package-lock.json`, con su CSS ya compilado |
| Frontend | Axios | 1.20.0 | `frontend/package-lock.json` |
| Frontend | Vite | 7.3.6 | `frontend/package-lock.json`, con `@vitejs/plugin-vue2` 2.3.4 |
| Frontend | lottie-web | 5.13.0 | `frontend/package-lock.json`, para las animaciones |
| Backend | Express | 5.2.1 | `backend/package-lock.json` |
| Backend | Sequelize | 6.37.8 | `backend/package-lock.json`, con `sequelize-cli` 6.6.5 |
| Backend | mysql2 | 3.24.5 | `backend/package-lock.json` |
| Backend | swagger-ui-express | 5.0.1 | `backend/package-lock.json`, para la documentación de la API |
| Base de datos | MySQL | 8.4 | `docker-compose.yml`, imagen `mysql:8.4` |
| Pruebas | Vitest | 5.0.2 | los dos `package-lock.json`, con `supertest` 7.3.0 en el backend y `@vue/test-utils` 1.3.6 en el frontend |
| Calidad | ESLint | 10.11.0 | los dos `package-lock.json`, con Prettier 3.9.9 |

- Las imágenes de Docker del backend y de la pantalla se construyen con `node:24-alpine`, y la pantalla se sirve con
  nginx. MySQL corre con Docker Compose.
- Vue 2 y Vuetify 2 ya no tienen soporte, pero la prueba los exige. Por eso las versiones están fijas: al escribir los
  requerimientos (2026-09-30), `npm i vuetify` instalaba la 4.2.2 y `npm i vite` la 8.3.1, y ninguna funciona con Vue 2.
