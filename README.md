# AIPOS

## Setup de agents

Todo el desarrollo de esta prueba se hizo con [Claude Code](https://claude.com/claude-code)
como único agente, conectado a Trello mediante un servidor MCP para gestionar
el board del proyecto.

El flujo también se puede repartir entre dos agentes: Codex en el rol de PM o PO
(define y prioriza las cards en Trello) y Claude Code como worker (implementa
cada card). Para efectos prácticos, y para avanzar más rápido, aquí se usó
Claude Code en ambos roles.

La guía de configuración está en [docs/setup/agents-setup.md](docs/setup/agents-setup.md) e incluye:

- Crear el board `AIPOS` en Trello
- Obtener el API key y el token de Trello
- Configurar el MCP de Trello en Claude Code a partir de `.mcp.json.example`
- Configurar el mismo MCP en Codex CLI a partir de `.codex/config.toml.example` (opcional)
- Verificación y solución de problemas

## Tiles de Tessl

Las reglas y skills del agente se reparten con [Tessl](https://tessl.io) en forma de tiles,
que están en `tessl-plugins/`. La guía está en [docs/setup/tessl-setup.md](docs/setup/tessl-setup.md) e incluye:

- Instalar Tessl y los tiles del proyecto
- Conectar el MCP de Tessl en Claude Code y Codex (opcional)
- Cambiar un tile, validarlo y reinstalarlo
- Medir un tile con evals y publicarlo en el registro de Tessl
- Solución de problemas

## Grafo del proyecto

El grafo del proyecto es un mapa de los archivos, funciones, documentos y specs de AIPOS, armado con
[Graphify](https://github.com/Graphify-Labs/graphify). El agente lo consulta antes de empezar cada tarea, y un
hook de git lo actualiza en cada commit. La guía está en [docs/setup/graphify-setup.md](docs/setup/graphify-setup.md)
e incluye:

- Instalar Graphify y activar el hook de git
- El flujo de una tarea con el grafo y las specs
- Qué va a git y qué no
- Solución de problemas
