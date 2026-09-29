# Entrega trazable

Todo el trabajo tiene que poder seguirse en el historial de git y en la bitácora de IA (`docs/bitacora-ia.md`).

- Nunca hagas commit directo en `main` ni en la rama de integración (el glosario dice cuál es; en AIPOS es `ProductionEnv`). Todo entra por una rama y un pull request (PR, la solicitud para unir una rama con otra). Solo si el proyecto todavía no tiene remoto, entra por una rama y un merge local `--no-ff`.
- Cada entregable tiene su propia rama, y esa rama no se borra al integrarla.
- Un entregable se integra con un PR y un merge commit, que es un commit que une las dos ramas y deja ver que existieron. Nunca con squash ni con rebase. Sigue la skill `flujo-entregable`.
- Los mensajes de commit siguen Conventional Commits: prefijo en inglés (`feat`, `fix`, `docs`, `chore`, `refactor`, `test`) y descripción en español con las palabras del glosario. Ejemplo: `feat(ventas): registrar venta con procedimiento almacenado`. Un cambio lógico por commit.
- Si el agente escribió o cambió el código, el commit lleva la línea `Co-Authored-By` del agente.
- Al terminar cada tarea hecha por el agente, agrega una entrada en la bitácora con la skill `bitacora-ia`, en el mismo commit que el cambio.
- No inventes lo que la persona revisó, corrigió o decidió. Si no lo sabes, pregúntale o márcalo "por confirmar".
