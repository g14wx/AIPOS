# Entregables y tarjetas

Cómo se reparte el trabajo. Cada entregable vive en su propia rama y entra a `ProductionEnv` con un PR y un
merge commit ([flujo 05](flujos/05-entregar-un-entregable.md)). Cada entregable se divide en tarjetas del
[tablero AIPOS](https://trello.com/b/K5mkgcdl/aipos), una por área, y cada tarjeta se trabaja con el agente
([flujo 06](flujos/06-trabajar-una-tarjeta-con-el-agente.md)). Los ids de esta página son los mismos que los de
las tarjetas.

## Tablero AIPOS

| Lista | Qué hay |
|---|---|
| Requerimientos | Tarjetas de referencia: alcance, requerimientos no funcionales, cómo trabajamos y preguntas abiertas. No se mueven. |
| Backlog | Lo que falta hacer, de más a menos prioritario. |
| Por hacer | Lo próximo que se hace. |
| En progreso | Lo que se está trabajando con el agente. |
| En revisión | Tarjetas con su PR abierto, en revisión del agente revisor y de la persona desarrolladora. |
| Hecho | Integrado y con la definición de terminado cumplida. |

Etiquetas de Trello:
- **Área**, una por tarjeta: Frontend (azul), Backend (verde), Base de datos (morado), DevOps (negro),
  Documentación (amarillo), Agente y tiles (rosa), Requerimientos (naranja). Duda / bloqueo (rojo) se suma
  cuando algo detiene la tarjeta.
- **Entregable**, en gris: Entregable: base, Entregable: productos, Entregable: ventas, Entrega final.

Cada tarjeta trae:
- Una descripción: la historia de usuario o la tarea, qué incluye, las reglas, las notas técnicas con las
  trampas conocidas, la rama, de qué depende, la estimación inicial y las rutas a esta carpeta.
- El checklist "Subtareas", con sus pruebas.
- El checklist "Criterios de aceptación", copiado de [02-requerimientos-funcionales.md](02-requerimientos-funcionales.md).
- Su diagrama BPMN adjunto, que también se ve dentro de la descripción.

## Secuencia de los entregables

1. **Requerimientos** (esta carpeta), en la rama `docs/requerimientos` hacia `main`.
2. **Tiles de Tessl** que faltan, en la rama `chore/tiles-mysql-vue2` hacia `main` (PR #9), antes del código.
3. **ProductionEnv**: se crea desde `main` cuando ya tiene los tiles y los requerimientos.
4. **Entregable base**: backend, base de datos y frontend vacíos, y la documentación de la API (A-01), en `feature/base`.
5. **Entregable productos**, en `feature/productos`.
6. **Entregable ventas**, en `feature/ventas`.
7. **Entrega final**: bitácora, README y prueba desde cero, en `docs/entrega-final`, y después el PR de
   `ProductionEnv` a `main`.

## Ramas de tarjeta

Cada tarjeta trabaja en su propia rama de tarjeta, `<tipo>/<id>-<resumen>` en minúsculas y con guiones, por ejemplo
`feature/b-02-base-del-backend` o `docs/e-01-bitacora-y-tiempos`. Hay dos niveles de PR:

1. **De tarjeta:** la rama de tarjeta sale de la rama de su entregable y su PR va a esa rama, con merge commit y sin
   borrar la rama. Antes de integrarlo pasa la revisión del agente revisor.
2. **De entregable:** cuando todas las tarjetas del entregable están integradas, la rama del entregable
   (`feature/base`, `feature/productos`, `feature/ventas` o `docs/entrega-final`) va a `ProductionEnv` con merge
   commit y la etiqueta `entregable-<x>` ([flujo 05](flujos/05-entregar-un-entregable.md)).

Las tarjetas sin entregable van directo a su destino: B-01 y D-01 a `ProductionEnv`, y S-01 a `main`. La columna "Rama"
de las tablas de abajo es la rama del entregable, de donde sale la rama de tarjeta.

## Tarjetas

Estimación inicial en horas, con el agente. Sirve para comparar con el tiempo real de la bitácora.

### Requerimientos

| Id | Tarjeta | Área | Lista | Diagrama |
|---|---|---|---|---|
| R-00 | Levantar requerimientos y diagramas BPMN | Requerimientos | En progreso | 00 |
| R-01 | Alcance y mapa de procesos | Requerimientos | Requerimientos | 00 |
| R-02 | Requerimientos no funcionales | Requerimientos | Requerimientos | — |
| R-03 | Cómo trabajamos: definición de terminado | Requerimientos | Requerimientos | 05, 06 |
| R-04 | Preguntas abiertas | Requerimientos, Duda / bloqueo | Requerimientos | — |

### Tiles y entregable base

| Id | Tarjeta | Área | Rama | Depende de | Diagrama | Horas |
|---|---|---|---|---|---|---|
| T-01 | Tile mysql-sequelize-procedimientos | Agente y tiles | `chore/tiles-mysql-vue2` (PR #9, en revisión) | — | — | 1.5 |
| T-02 | Tile vue2-vuetify2-vite | Agente y tiles | `chore/tiles-mysql-vue2` (PR #9, en revisión) | — | — | 1.5 |
| T-03 | Grafo del proyecto con Graphify | Agente y tiles | `chore/grafo-del-proyecto` | — | 06 | 2 |
| B-01 | Preparar GitHub y crear ProductionEnv | DevOps | `chore/b-01-preparar-github` → `ProductionEnv` (la configuración de GitHub no está en git; la rama lleva la entrada de la bitácora) | R-00, T-01 y T-02 en `main` | 05 | 0.5 |
| B-02 | Base del backend | Backend | `feature/base` | B-01, T-01 | — | 1 |
| B-03 | MySQL con Docker Compose y migraciones | Base de datos, DevOps | `feature/base` | B-01, T-01 | — | 1 |
| B-04 | Base del frontend con la pantalla única | Frontend | `feature/base` | B-01, T-02 | — | 1.5 |

### Despliegue

| Id | Tarjeta | Área | Rama | Depende de | Diagrama | Horas |
|---|---|---|---|---|---|---|
| D-01 | Pipeline de despliegue con etiquetas release-* | DevOps | `chore/despliegue` → `ProductionEnv` (la configuración del servidor y de GitHub no está en git; queda descrita en `docs/despliegue.md`) | Entregable base integrado (B-01 a B-04), para probar con `release-0.1.0` | 07 | 4 |

### Entregable productos

| Id | Tarjeta | Área | Depende de | Diagrama | Horas |
|---|---|---|---|---|---|
| P-01 | Tabla `productos` | Base de datos | Entregable base integrado | 01 | 0.5 |
| P-02 | API para crear producto | Backend | P-01 | 01 | 1 |
| P-03 | Botón "Nuevo producto" y formulario | Frontend | P-02 | 01 | 1.5 |
| P-04 | API para buscar productos | Backend | P-01 | 02 | 1 |
| P-05 | Campo de búsqueda y resultados | Frontend | P-04 | 02 | 1.5 |

Rama: `feature/productos`.

### Entregable ventas

| Id | Tarjeta | Área | Depende de | Diagrama | Horas |
|---|---|---|---|---|---|
| V-01 | Tablas `ventas` y `detalles_venta` | Base de datos | Entregable productos integrado | 04 | 0.5 |
| V-02 | Procedimiento `sp_registrar_venta` | Base de datos | V-01 | 04 | 2 |
| V-03 | API para registrar venta | Backend | V-02 | 04 | 1 |
| V-04 | Venta actual: agregar productos y ver el total | Frontend | P-05 | 03 | 1.5 |
| V-05 | Venta actual: editar el precio aplicado | Frontend | V-04 | 03 | 0.5 |
| V-06 | Venta actual: cambiar la cantidad | Frontend | V-04 | 03 | 0.5 |
| V-07 | Venta actual: eliminar un producto | Frontend | V-04 | 03 | 0.5 |
| V-08 | Botón "Registrar venta" y resultado | Frontend | V-03, V-04 a V-07 | 04 | 1 |

Rama: `feature/ventas`.

### Entrega final

| Id | Tarjeta | Área | Depende de | Diagrama | Horas |
|---|---|---|---|---|---|
| E-01 | Cerrar la bitácora y los tiempos | Documentación | Entregable ventas integrado | — | 0.5 |
| E-02 | README de la entrega | Documentación | E-01 | — | 1.5 |
| E-03 | Prueba desde cero y entrega final | DevOps | E-02, pregunta abierta 7 | 05 | 1 |

Rama: `docs/entrega-final` para E-01 y E-02; E-03 etiqueta `v1.0.0` y abre el PR de `ProductionEnv` a `main`.

Total estimado: 29 horas, con D-01 y sin contar R-00.

## Definición de terminado

Una tarjeta pasa a "Hecho" solo si:
1. Cumple sus criterios de aceptación.
2. Tiene pruebas y pasan.
3. Si cambia código, su spec está aprobada en `specs/` antes de escribir el código, y pasó `spec-verification` y
   `work-review`.
4. La persona desarrolladora validó el cambio y las pruebas.
5. Usa las palabras del glosario. Si apareció una palabra nueva, ya está en el glosario.
6. Sus commits siguen Conventional Commits, llevan `Co-Authored-By` si participó el agente y no llevan
   `Claude-Session`.
7. Tiene su entrada en la bitácora de IA, en el mismo commit que el cambio.
8. Su commit trae el grafo del proyecto al día: `graphify-out/graph.json` y `graphify-out/GRAPH_REPORT.md`, que
   agrega el hook de git `pre-commit`.
9. Su PR pasó la revisión del agente revisor, con cada hallazgo corregido o explicado.
10. Está integrada: su rama de tarjeta entró a la rama de su entregable, y el entregable entró a `ProductionEnv` con
    merge commit; o entró a `main` si es de requerimientos o de tiles. La tarjeta pasa a "Hecho" cuando el
    entregable entra a `ProductionEnv`.
11. Si cambió cómo se instala o se usa AIPOS, el README está al día.
12. Sus subtareas están marcadas en el tablero AIPOS.
