# Alcance

## Objetivo

AIPOS es una aplicación web de una sola pantalla para un punto de venta básico. El cajero crea y busca
productos, arma la venta actual y la registra en MySQL. La prueba mide sobre todo tres cosas: el uso de MySQL
con un procedimiento almacenado, el uso de Git y el trabajo con un agente de código.

## Actores y partes

| Quién o qué | Qué hace |
|---|---|
| Cajero | Usa la pantalla: crea productos, los busca, arma la venta actual y la registra. |
| Pantalla | La única pantalla de AIPOS, hecha con Vue 2, Vuetify y Axios. Corre en el navegador. |
| API | El backend en Node.js con Express y Sequelize. Recibe lo que manda la pantalla, lo valida y habla con MySQL. |
| MySQL | La base de datos. Guarda productos, ventas y detalles de venta, y tiene el procedimiento almacenado `sp_registrar_venta`. |
| Persona desarrolladora | Construye AIPOS con el agente. Decide, revisa, prueba y aprueba. |
| Agente | Claude Code, trabajando sobre el código del repositorio. |
| Agente revisor | Codex. Revisa cada PR antes de integrarlo. |
| Quien evalúa | Revisa el repositorio público: código, historial de git, README y bitácora de IA. |

## Qué entra

**Obligatorio**, porque lo pide el PDF:
- Crear producto con nombre, precio y código de barras, desde un botón visible.
- Buscar producto por nombre o por código de barras.
- Armar la venta actual: agregar productos, ver su nombre y su precio aplicado, editar el precio aplicado,
  eliminar un producto y ver el total.
- Registrar venta en MySQL con todos sus detalles.
- Tablas de productos, ventas y detalles de venta, con sus relaciones.
- Un procedimiento almacenado que la app usa de verdad, con su script SQL y su explicación en el README.
- Ramas por entregable integradas en `ProductionEnv`, commits claros, README de 12 puntos y uso documentado del
  agente.

**Recomendado**, decidido por la persona desarrolladora y permitido por el PDF:
- Cantidad y subtotal en cada detalle de venta.

**Opcional**, por confirmar:
- RF-12: Enter con un código de barras exacto agrega el producto directo a la venta actual.

## Fuera de alcance

Lo que el PDF dice que no hace falta:
- Impresión de tickets.
- Generación de documentos.
- Reportes.
- Inventarios.
- Control de caja.
- Métodos de pago.
- Autenticación de usuarios.
- CRUD completo (crear, leer, editar y borrar) para todas las tablas.

Lo que eso significa en AIPOS:
- No se editan ni se borran productos.
- No se consultan ni se cancelan ventas registradas.
- No hay cuentas ni permisos: quien tiene la pantalla abierta es el cajero.

## Lo que agregamos y el PDF no pide

Se declara en el README para que quien evalúa lo vea.

| Qué | Por qué |
|---|---|
| Cantidad y subtotal | Así funciona un punto de venta real: agregar otra leche sube su cantidad a 2. |
| RF-12, si entra | Un lector de código de barras escribe el número y presiona Enter. |
| Docker Compose para MySQL | Cualquiera levanta la misma base de datos con un comando. |
| Flujos 05 y 06 | Muestran cómo se entrega cada parte y cómo se trabaja con el agente. |
| PR final de `ProductionEnv` a `main` | Deja la versión final también en la rama que GitHub muestra primero. |

## Supuestos

- Hay un solo cajero a la vez y una sola venta actual.
- La venta actual vive solo en la pantalla. Si se recarga la página, se pierde (pregunta abierta 2).
- Los precios están en una sola moneda y tienen 2 decimales.
- AIPOS corre en local con los comandos del README. No se publica en internet.

## Restricciones

- Tecnologías obligatorias: Node.js, Express.js y Sequelize; Vue.js 2, Vuetify y Axios; MySQL. Las versiones
  están en [RNF-02](03-requerimientos-no-funcionales.md#rnf-02-tecnologías-y-versiones).
- Repositorio público en GitHub, con la rama `ProductionEnv`.

## Riesgos

| Riesgo | Qué hacemos |
|---|---|
| Vue 2 y Vuetify 2 ya no tienen soporte. Dependabot, el bot de GitHub que propone actualizar dependencias, abrió los PR #5 y #6 para subirlos a la versión 3 en el proyecto de ejemplo de un eval (`tessl-plugins/entrega-trazable/evals/scenario-3/proyecto/frontend`). | El PDF exige la versión 2. Los PR #5 y #6 se cerraron y el PR #8 agregó `.github/dependabot.yml`, que ignora las versiones mayores de Vue y Vuetify (pregunta abierta 8, resuelta). Se fijan las versiones y el README explica por qué. |
| `npm i vuetify` instala la 4.2.2 y `npm i vite` instala la 8.3.1. Ninguna funciona con Vue 2. | Se instalan versiones fijas ([RNF-02](03-requerimientos-no-funcionales.md#rnf-02-tecnologías-y-versiones)). |
| Hoy GitHub no deja integrar con merge commit (`mergeCommitAllowed=false`) y borra la rama al integrar (`deleteBranchOnMerge=true`). | La tarjeta B-01 cambia esa configuración, con permiso de la persona desarrolladora. |
| La regla "Protect main" de GitHub solo deja integrar a `main` con squash o rebase. | Pregunta abierta 7. |
| El script del procedimiento almacenado se corre distinto por migración y por el cliente `mysql`: `DELIMITER` solo lo entiende el cliente. | La tarjeta V-02 prueba los dos caminos. |
