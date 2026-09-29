# Bitácora de IA — AIPOS

Registro de cómo se usó el agente de código en cada tarea. De aquí salen los puntos 8 a 11 del README.

## Resumen

| Entregable | Tiempo aprox. | Tareas con agente | Propuestas cambiadas o descartadas |
|---|---|---|---|
| Productos | 2 h 55 min | 3 | 3 |
| Ventas | 2 h 15 min | 2 | 1 |

## Entradas

### 2026-09-30 09:10 — Base del backend
- **Tarea:** "Arma el backend con Express, Sequelize y MySQL."
- **Agente:** Claude Code (Opus 5.5)
- **Qué hizo el agente:** creó `backend/` con Express, la conexión de Sequelize y `docker-compose.yml` con MySQL.
- **Revisión de la persona:** pidió fijar la imagen `mysql:8.4` en vez de `mysql:latest`.
- **Propuestas cambiadas o descartadas:** proponía `mysql:latest` → se usa `mysql:8.4` → `latest` hoy es una versión que Sequelize 6 no soporta.
- **Tiempo:** 09:10–10:00 (50 min)

### 2026-09-30 10:05 — Tabla de productos
- **Tarea:** "Crea la tabla de productos con nombre, precio y código de barras."
- **Agente:** Claude Code (Opus 5.5)
- **Qué hizo el agente:** migración `20260930000001-crear-productos.js` y modelo `Producto`.
- **Revisión de la persona:** revisó la migración y pidió que el código de barras fuera único.
- **Propuestas cambiadas o descartadas:** proponía `FLOAT` para el precio → se usa `DECIMAL(10,2)` → `FLOAT` redondea mal el dinero.
- **Tiempo:** 10:05–10:40 (35 min)

### 2026-09-30 11:00 — Frontend con Vue 2
- **Tarea:** "Crea el frontend con Vue 2, Vuetify y Axios."
- **Agente:** Claude Code (Opus 5.5)
- **Qué hizo el agente:** creó `frontend/` con Vite 7, `@vitejs/plugin-vue2`, Vuetify 2.7.2 y el cliente `src/api/http.js`.
- **Revisión de la persona:** probó la pantalla en el navegador.
- **Propuestas cambiadas o descartadas:** proponía Vue CLI → se usa Vite 7 → Vue CLI está en modo mantenimiento y es más lento.
- **Tiempo:** 11:00–12:30 (1 h 30 min)

### 2026-09-30 15:00 — Procedimiento almacenado para registrar venta
- **Tarea:** "Registra la venta y sus detalles con un procedimiento almacenado."
- **Agente:** Claude Code (Opus 5.5)
- **Qué hizo el agente:** escribió `backend/db/procedures/sp_registrar_venta.sql`, la migración que lo crea y `registrarVenta` en `backend/src/services/ventas.js`.
- **Revisión de la persona:** probó registrar una venta con 3 detalles y una sin detalles.
- **Propuestas cambiadas o descartadas:** proponía llamar al procedimiento dentro de `sequelize.transaction()` → se llama sin transacción externa → el procedimiento abre su propia transacción y MySQL no permite transacciones anidadas.
- **Tiempo:** 15:00–16:45 (1 h 45 min)

### 2026-09-30 17:00 — Revisión del PR de ventas con Codex
- **Tarea:** "Revisa el PR del entregable de ventas."
- **Agente:** Codex
- **Qué hizo el agente:** señaló que la búsqueda no escapaba `%` y `_`.
- **Revisión de la persona:** aceptó el cambio; se agregó `escaparLike` en `backend/src/services/productos.js`.
- **Propuestas cambiadas o descartadas:** ninguna.
- **Tiempo:** 17:00–17:30 (30 min)

## Pendientes

- No hay tests automáticos.
- La venta en pantalla se pierde si se recarga la página.
