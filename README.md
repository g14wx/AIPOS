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
