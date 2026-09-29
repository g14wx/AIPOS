# Plantilla: docs/bitacora-ia.md

Copia esta estructura. Borra la entrada de ejemplo.

```markdown
# Bitácora de IA — <nombre del proyecto>

Registro de cómo se usó el agente de código en cada tarea. De aquí salen los puntos 8 a 11 del README.

## Resumen

| Entregable | Tiempo aprox. | Tareas con agente | Propuestas cambiadas o descartadas |
|---|---|---|---|
| Productos | 3 h | 6 | 2 |

## Entradas

### 2026-09-29 14:05 — Tabla de productos

- **Tarea:** "Crea la tabla de productos con nombre, precio y código de barras."
- **Agente:** Claude Code (Opus 5.5)
- **Qué hizo el agente:** creó la migración `001-crear-productos.js` y el modelo `Producto`.
- **Revisión de la persona:** revisó la migración y pidió que el código de barras fuera único.
- **Propuestas cambiadas o descartadas:** proponía `FLOAT` para el precio → se usó `DECIMAL(10,2)` → `FLOAT` redondea mal el dinero.
- **Tiempo:** 14:05–14:30 (25 min)
- **Commits:** `a1b2c3d`
```
