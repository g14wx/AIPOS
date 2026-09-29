---
name: bitacora-ia
description: Registra en docs/bitacora-ia.md cada tarea hecha con un agente de código (Claude Code, Codex u otro), con lo que se le pidió, lo que hizo, lo que revisó o corrigió la persona, las propuestas descartadas y su motivo, y el tiempo que tomó. Úsala al terminar una tarea hecha por el agente, cuando la persona corrige o descarta una propuesta del agente, al cerrar un entregable, o para reconstruir la bitácora desde el historial de git antes de escribir el README.
---

# Bitácora de IA

La bitácora cuenta cómo se usó el agente, tarea por tarea. De ella salen los puntos 8 a 11 del README: tiempo, herramientas de IA, cómo se usó el agente y qué propuestas se cambiaron o descartaron. Esos datos no se pueden reconstruir después, así que se anotan en el momento.

Formato: [references/plantilla-bitacora.md](references/plantilla-bitacora.md). Si `docs/bitacora-ia.md` no existe, créalo con esa plantilla.

## Cuándo escribir

- Al terminar cada tarea hecha por el agente, antes del commit, para que la entrada entre en el mismo commit que el cambio.
- Cuando la persona corrige al agente o descarta una de sus propuestas. Es lo más valioso de la bitácora: muestra el criterio de la persona.
- Al cerrar un entregable: actualiza la tabla de resumen con el tiempo total.

## Cómo escribir una entrada

1. **Tarea:** lo que pidió la persona, con sus palabras.
2. **Agente:** herramienta y modelo, por ejemplo "Claude Code (Opus 5.5)".
3. **Qué hizo el agente:** archivos y cambios concretos. Nada de "se mejoró el código".
4. **Revisión de la persona:** solo lo que de verdad pasó en la conversación: qué revisó, qué probó y qué pidió cambiar. Si no lo sabes, escribe "por confirmar" y pregúntale.
5. **Propuestas cambiadas o descartadas:** qué propuso el agente → qué se decidió → por qué. Ejemplo: "Proponía `FLOAT` para el precio → se usó `DECIMAL(10,2)` → `FLOAT` redondea mal el dinero."
6. **Tiempo:** hora de inicio y de fin, tomadas de la conversación o de los commits. Si la persona da un estimado, se usa el suyo.
7. **Commits:** hash corto, o "este commit" si la entrada va en el commit que se está preparando.

## Reglas

- Solo hechos. No escribas "se revisó con cuidado" ni "se probó todo" si no consta.
- Cada entrada ocupa de 5 a 10 líneas, con las palabras del glosario.
- Las entradas van en orden de fecha, con la más nueva al final.
- Nunca borres una entrada. Si algo estaba mal, agrega una corrección con fecha.

## Reconstruir desde git

Si faltan entradas, ármalas desde el historial y después confírmalas con la persona:

```bash
git log --reverse --date=iso --format='%h %ad %an%n  %s%n%b' | grep -v '^$'
```

La línea `Co-Authored-By` de cada commit dice qué agente participó. Marca todo lo reconstruido como "reconstruido desde git, por confirmar".
