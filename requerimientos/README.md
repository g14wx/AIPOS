# Requerimientos de AIPOS

Esta carpeta dice qué tiene que hacer y cumplir AIPOS. Sale de la prueba técnica y de las decisiones de la
persona desarrolladora. Es la base del [tablero AIPOS](https://trello.com/b/K5mkgcdl/aipos) de Trello: cada
tarjeta apunta a un requerimiento y a un flujo de esta carpeta.

- **Fuente:** el PDF de la prueba técnica (`devdoc/Prueba_Tecnica_Lead_AI_Native_Software_Engineer.pdf`, fuera
  de git) y las decisiones del 2026-09-29.
- **Palabras:** las del glosario, [`docs/lenguaje-ubicuo.md`](../docs/lenguaje-ubicuo.md).
- **Estado:** versión 2, del 2026-09-30. Las preguntas abiertas 1 a 6 se resolvieron ese día, y la 9 la resolvió el orquestador. Lo que dice "por confirmar" todavía no está decidido.

## Cómo leer esta carpeta

| Archivo | Qué tiene |
|---|---|
| [01-alcance.md](01-alcance.md) | Objetivo, actores, qué entra y qué no, lo que agregamos, supuestos y riesgos. |
| [02-requerimientos-funcionales.md](02-requerimientos-funcionales.md) | Lo que AIPOS hace (RF), sus reglas de negocio (RN) y los criterios de aceptación. |
| [03-requerimientos-no-funcionales.md](03-requerimientos-no-funcionales.md) | Lo que AIPOS cumple (RNF): tecnologías, seguridad, errores, Git, uso del agente y README. |
| [04-entregables.md](04-entregables.md) | Entregables, tarjetas del tablero AIPOS, secuencia y definición de terminado. |
| [flujos/](flujos/) | Un archivo por flujo, con sus pasos y su diagrama BPMN. |
| [diagramas/](diagramas/) | Los diagramas: `.drawio` para editar con draw.io y `.png` para ver. |

Un diagrama BPMN dibuja un flujo con una notación estándar. Cada actor tiene su carril (una franja), y dentro
van sus tareas, sus decisiones y los puntos de inicio y fin.

## Flujos

| # | Flujo | Requerimientos |
|---|---|---|
| 00 | [Mapa de procesos](flujos/00-mapa-de-procesos.md) | Todos |
| 01 | [Crear producto](flujos/01-crear-producto.md) | RF-01, RF-10 |
| 02 | [Buscar producto](flujos/02-buscar-producto.md) | RF-02, RF-12 |
| 03 | [Armar la venta actual](flujos/03-armar-la-venta-actual.md) | RF-03 a RF-08 |
| 04 | [Registrar venta](flujos/04-registrar-venta.md) | RF-09, RF-10, RF-11 |
| 05 | [Entregar un entregable](flujos/05-entregar-un-entregable.md) | RNF-09, RNF-10 |
| 06 | [Trabajar una tarjeta con el agente](flujos/06-trabajar-una-tarjeta-con-el-agente.md) | RNF-08, RNF-10 |

## Matriz del PDF

Cada parte del PDF, el requerimiento que la cubre, su flujo y sus tarjetas.

| Parte del PDF | Requerimiento | Flujo | Tarjetas |
|---|---|---|---|
| Propósito de la evaluación: full-stack, MySQL y procedimientos almacenados, Git y trabajo con un agente | RF-11; RNF-02, RNF-09, RNF-10 | 00 | — |
| Objetivo: una sola pantalla con frontend, backend y base de datos | RNF-01, RNF-02 | 00 | B-02, B-03, B-04 |
| 1. Administración de productos | RF-01; RN-01 a RN-04 | 01 | P-01, P-02, P-03 |
| 2. Búsqueda de productos | RF-02 | 02 | P-04, P-05 |
| 3. Registro de una venta | RF-03 a RF-09 | 03, 04 | V-03 a V-08 |
| 4. Persistencia de datos | RF-10 | 01, 04 | P-01, V-01 |
| 5. Procedimiento almacenado MySQL | RF-11 | 04 | V-02, V-03, E-02 |
| Alcance: lo que no se hace | [Fuera de alcance](01-alcance.md#fuera-de-alcance) | — | — |
| Tecnologías requeridas | RNF-02 | — | T-01, T-02, B-02, B-03, B-04 |
| Requerimientos de Git y GitHub | RNF-09 | 05 | B-01, E-03 |
| Uso de inteligencia artificial | RNF-10 | 05, 06 | R-03, E-01 |
| README.md obligatorio (12 puntos) | RNF-11 | — | E-02 |
| Entrega en un repositorio público | RNF-12 | 05 | E-03 |
| Revisión técnica: se evalúan el resultado y la trazabilidad del proceso | RNF-09, RNF-10 | 05, 06 | R-03, E-01 |
| Aspectos que se evaluarán | [Tabla de abajo](#aspectos-que-se-evaluarán) | — | — |

### Aspectos que se evaluarán

| Aspecto del PDF | Dónde se cubre |
|---|---|
| Cumplimiento funcional | RF-01 a RF-11 |
| Dominio de Vue.js 2, Vuetify y Axios | RNF-02, RNF-06; tarjetas B-04, P-03, P-05, V-04 a V-08 |
| Dominio de Node.js, Express.js y Sequelize | RNF-02, RNF-06; tarjetas B-02, P-02, P-04, V-03 |
| Diseño y uso correcto de MySQL | RF-10, RNF-07; tarjetas P-01, V-01 |
| Crear e integrar procedimientos almacenados | RF-11; tarjetas V-02, V-03 |
| Calidad, claridad y mantenibilidad del código | RNF-06, RNF-13 |
| Manejo de errores, seguridad básica y validación | RNF-03, RNF-04, RNF-05 |
| Arquitectura y separación de responsabilidades | RNF-06 |
| Uso profesional de Git, ramas y commits | RNF-09; flujo 05 |
| Calidad del README y reproducibilidad | RNF-07, RNF-11; tarjetas E-02, E-03 |
| Uso efectivo del agente | RNF-10; flujo 06 |
| Criterio al revisar, aceptar, corregir o descartar propuestas de IA | RNF-10; [bitácora de IA](../docs/bitacora-ia.md) |

## Preguntas abiertas

Cada una es una subtarea de la tarjeta R-04 del tablero AIPOS. La persona desarrolladora resolvió la 1, la 3, la 4, la 5 y la 6 con la propuesta, y la 2 con una decisión distinta, el 2026-09-30. La 7 sigue abierta y la 8 se resolvió el 2026-09-29. La 9 la resolvió el orquestador con el consentimiento general de la persona desarrolladora, y sigue por confirmar.

| # | Pregunta | Propuesta | Qué cambia |
|---|---|---|---|
| 1 | ¿Se permite un precio aplicado de 0? | **Resuelta el 2026-09-30**: sí, para regalar un producto. | RN-05 |
| 2 | ¿La venta actual debe seguir ahí si se recarga la página? | **Resuelta el 2026-09-30, distinta de la propuesta** (que era "no"): sí. La venta actual se guarda en el navegador (`localStorage`, con `try/catch`) y se vacía al registrar la venta. | Flujo 03, RF-04, RF-09 y el supuesto de `01-alcance.md` |
| 3 | ¿Se busca desde 2 caracteres y se muestran 20 resultados como máximo? | **Resuelta el 2026-09-30**: sí. | RF-02 |
| 4 | ¿Qué límites tienen el precio y la cantidad? | **Resuelta el 2026-09-30**: precio hasta 99 999.99 y cantidad de 1 a 999. El precio y el precio aplicado usan `DECIMAL(10,2)`, y el subtotal y el total usan `DECIMAL(12,2)` para que no se desborden. | RN-02, RN-06 |
| 5 | ¿Entra RF-12 (Enter con un código de barras exacto)? | **Resuelta el 2026-09-30**: sí, si sobra tiempo. | RF-12 |
| 6 | ¿Cómo se muestran los precios? | **Resuelta el 2026-09-30**: con 2 decimales y sin símbolo de moneda. | RNF-01 |
| 7 | ¿Cómo llega la versión final a `main` sin perder los merge commits? La regla "Protect main" de GitHub solo deja squash o rebase. | Se evalúa `ProductionEnv`, que guarda los merge commits, y a `main` se lleva con rebase. La otra opción es permitir un merge commit solo en ese PR. | E-03 |
| 8 | ¿Cerramos los PR #5 y #6 de Dependabot, que suben a Vue 3 y Vuetify 3? | **Resuelta el 2026-09-29**: se cerraron. `.github/dependabot.yml` (PR #8) no alcanzó a frenar los PR de seguridad, así que el PR #12 los apagó en el repositorio; las alertas de Vue 2 y Vuetify 2 se revisan a mano. | B-04 |
| 9 | ¿Se limita a 100 los detalles de una venta? | **Sí, resuelta por el orquestador, por confirmar**, con el consentimiento general de la persona desarrolladora (2026-09-30). Con 101 detalles de 999 unidades a 99 999.99 el total pasaría de `DECIMAL(12,2)` y daría un error 500. La otra opción era ampliar `ventas.total` a `DECIMAL(14,2)`. | RN-14, RF-03, RF-09, RF-11 |
