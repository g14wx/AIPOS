# AIPOS

## Base de datos: MySQL y migraciones

AIPOS guarda sus datos en MySQL 8.4, que corre con Docker Compose. Las tablas y los procedimientos almacenados
se crean solo con migraciones de Sequelize: Docker no crea nada, solo levanta MySQL. Necesitas Docker con Compose
v2 y Node 24 (el archivo `.nvmrc`).

### Desde un clon limpio

```bash
# 1. Copia las variables de entorno y cambia las claves que empiezan con "cambiar-". El .env no va a git.
cp .env.example .env

# 2. Levanta MySQL. --wait espera a que responda: sin él, el primer arranque tarda unos segundos
#    y la migración puede fallar por llegar antes que MySQL.
docker compose up -d --wait mysql

# 3. Instala el backend y aplica las migraciones.
cd backend
npm ci
npm run migrar

# 4. Arranca la API y, en otra terminal, comprueba que llega a MySQL.
npm start
curl http://localhost:3000/api/salud   # {"estado":"ok","baseDeDatos":"ok"}
```

`GET /api/salud` dice si la API está viva y si MySQL responde. Si MySQL no responde, contesta 500 con el formato
de error de la API.

### Comandos del backend

Se corren dentro de `backend/`.

| Comando | Qué hace |
|---|---|
| `npm run migrar` | Aplica las migraciones que faltan. Si no falta ninguna, no cambia nada. |
| `npm run deshacer` | Deshace la última migración. |
| `npm run rehacer` | Deshace todas las migraciones y las aplica otra vez. Borra los datos de las tablas. |
| `npm run migrar:prueba`, `deshacer:prueba`, `rehacer:prueba` | Lo mismo, pero en la base de prueba. |
| `npm run preparar-prueba` | Crea la base de prueba y le da permisos al usuario de la app. Se puede correr más de una vez. |

- Nunca se edita una migración que ya se aplicó: se crea otra.
- Cada migración lleva `up` y `down`, para poder deshacerla.

### Base de prueba

Las pruebas automáticas usan una base aparte, `aipos_prueba`, y nunca tocan la de desarrollo (`aipos`). La primera
vez, con MySQL levantado, se crea con `npm run preparar-prueba`. Después, `npm test` la migra solo antes de correr
las pruebas. `preparar-prueba` es lo único que entra a MySQL como `root`, con `MYSQL_ROOT_PASSWORD`: la API nunca
lo hace.

### Puertos, varias copias y empezar de cero

- MySQL se abre en tu máquina en el puerto `MYSQL_PORT` (3306 si no lo cambias) y solo en `127.0.0.1`. Si ya tienes
  otro MySQL, o otra copia de AIPOS, cambia `MYSQL_PORT` y `COMPOSE_PROJECT_NAME` en el `.env`: así los contenedores
  y los volúmenes de las dos copias no chocan.
- `docker compose stop mysql` apaga MySQL y los datos se quedan.
- `docker compose down` borra el contenedor, pero los datos se quedan en el volumen.
- `docker compose down -v` borra también los datos de esa copia. Después de eso, los pasos de arriba dejan la base
  como en un clon limpio.

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
