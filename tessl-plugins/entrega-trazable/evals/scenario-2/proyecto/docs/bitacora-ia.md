# Bitácora de IA — AIPOS

Registro de cómo se usó el agente de código en cada tarea. De aquí salen los puntos 8 a 11 del README.

## Resumen

| Entregable | Tiempo aprox. | Tareas con agente | Propuestas cambiadas o descartadas |
|---|---|---|---|
| Productos | 2 h (en curso) | 2 | 1 |

## Entradas

### 2026-09-30 10:00 — Agregar producto

- **Tarea:** "Crea el alta de productos con nombre, precio y código de barras."
- **Agente:** Claude Code (Opus 5.5)
- **Qué hizo el agente:** creó `src/productos.js` con la función `agregarProducto`.
- **Revisión de la persona:** pidió validar que el código de barras no se repita.
- **Propuestas cambiadas o descartadas:** proponía guardar el precio como número flotante → se usa texto con dos decimales → evita errores de redondeo.
- **Tiempo:** 10:00–10:50 (50 min)
- **Commits:** ver rama `feature/productos`
