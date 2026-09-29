# Setup de Tessl

[← Volver al README](../../README.md)

## Usar los tiles del proyecto

[Tessl](https://tessl.io) reparte **tiles**: paquetes con reglas y skills que el agente lee mientras trabaja.
En AIPOS los tiles están en `tessl-plugins/` y se instalan en Claude Code y en Codex. Las palabras de esta
guía (tile, regla, skill, eval) están definidas en el [glosario](../lenguaje-ubicuo.md).

| Tile | Qué trae | Para qué sirve |
|---|---|---|
| `g14wxz/lenguaje-ubicuo` | 2 reglas y la skill `glosario-lenguaje-ubicuo` | Que el agente explique corto y sin jerga, y use las palabras del glosario. |
| `g14wxz/entrega-trazable` | 1 regla y las skills `flujo-entregable`, `bitacora-ia` y `readme-entrega` | Que cada entregable se vea claro en git, que cada tarea del agente quede en la bitácora y que el README cumpla los 12 puntos. |
| `g14wxz/mysql-sequelize-procedimientos` | 1 regla y las skills `mysql-stored-procedure-authoring` y `sequelize-call-procedure` | Que el procedimiento almacenado se cree y se llame bien desde Sequelize 6: sin `DELIMITER`, dinero en `DECIMAL(10,2)` y errores de MySQL traducidos a respuestas HTTP. |

La lista completa de tiles instalados está en `tessl.json`.

### Requisitos

- Claude Code o Codex
- Una cuenta de Tessl, solo para medir o publicar tiles (pasos 6 y 7). Para instalarlos y usarlos no hace falta.

### 1. Instalar Tessl

```bash
curl -fsSL https://get.tessl.io | sh
```

También se puede instalar con Homebrew:

```bash
brew tap tesslio/tap
brew trust tesslio/tap
brew install tesslio/tap/tessl
```

Comprueba que quedó instalado:

```bash
tessl --version
```

Esta guía se probó con la versión `0.112.0`.

### 2. Instalar los tiles del proyecto

Desde la raíz del proyecto:

```bash
tessl install
```

`tessl install` lee `tessl.json` e instala cada tile desde su carpeta en `tessl-plugins/`. No hace falta
correr `tessl init`: `tessl.json`, `CLAUDE.md` y `AGENTS.md` ya vienen en el repositorio.

Tessl está en modo "managed": los archivos que genera se tratan como `node_modules`. Quedan fuera de git
y `tessl install` los vuelve a crear.

| Archivo | Qué es |
|---|---|
| `.tessl/plugins/` | Copia instalada de los tiles. Es la que lee el agente. |
| `.tessl/RULES.md` | Las reglas de todos los tiles juntas. `CLAUDE.md` y `AGENTS.md` apuntan a este archivo. |
| `.claude/skills/tessl__*` | Las skills para Claude Code. |
| `.agents/skills/tessl__*` y `.codex/skills/tessl__*` | Las skills para Codex y otros agentes. |

### 3. Conectar el MCP de Tessl (opcional)

Con el MCP de Tessl, el agente puede buscar e instalar tiles por su cuenta. Para usar las reglas y skills
del proyecto no hace falta.

Las plantillas ya lo declaran:

- Claude Code: el servidor `tessl` en `.mcp.json.example`.
- Codex: el bloque `[mcp_servers.tessl]` en `.codex/config.toml.example`.

Los agentes no leen las plantillas `.example`: hay que copiarlas primero. Si todavía no lo hiciste, sigue el
[paso 4 de la guía de agentes](agents-setup.md#4-agregar-el-servidor-a-claude-code): copia `.mcp.json.example`
a `.mcp.json` y `.codex/config.toml.example` a `.codex/config.toml`, y marca el proyecto como confiable en Codex.

Si copiaste la plantilla de Codex antes de que tuviera este bloque, agrégalo a tu `.codex/config.toml`:

```toml
[mcp_servers.tessl]
type = "stdio"
command = "tessl"
args = ["mcp", "start"]
```

Verifica desde la raíz del proyecto:

```bash
codex mcp get tessl   # debe decir "enabled: true"
```

### 4. Verificar

1. Abre una sesión nueva de Claude Code o de Codex en la raíz del proyecto. Las reglas se cargan al
   empezar la sesión.
2. Pregunta `¿qué reglas de Tessl tienes cargadas?`. Deben aparecer "Comunicación clara",
   "Lenguaje ubicuo" y "Entrega trazable".
3. Revisa las skills instaladas:

   ```bash
   ls .claude/skills .agents/skills
   ```

   Deben aparecer `tessl__glosario-lenguaje-ubicuo`, `tessl__flujo-entregable`, `tessl__bitacora-ia`
   y `tessl__readme-entrega`.

## Trabajar en un tile

### 5. Cambiar un tile

Cada tile tiene esta forma:

```
tessl-plugins/<tile>/
├── .tessl-plugin/plugin.json   # nombre, versión y descripción
├── rules/                      # reglas: el agente las lee siempre
├── skills/<skill>/SKILL.md     # skills: el agente las carga cuando la tarea las necesita
└── evals/scenario-N/           # evals: tarea, criterios y proyecto de ejemplo
```

1. Edita los archivos del tile.
2. Reinstálalo. El agente lee la copia instalada en `.tessl/`, no la carpeta `tessl-plugins/`:

   ```bash
   tessl install
   ```

   Mientras editas, `tessl install --watch-local` lo reinstala cada vez que guardas.

3. Valida la estructura y revisa qué archivos entran al paquete:

   ```bash
   tessl plugin lint tessl-plugins/<tile>
   tessl plugin pack tessl-plugins/<tile> --output /tmp/<tile>.tgz
   tar tzf /tmp/<tile>.tgz
   ```

4. Abre una sesión nueva del agente para que lea las reglas cambiadas.

### 6. Medir un tile con evals (necesita cuenta)

Un eval hace que el agente resuelva la misma tarea con el tile y sin él, y compara las notas. Así se ve
si el tile ayuda de verdad.

1. Inicia sesión y vincula el proyecto (una sola vez). `<tu-workspace>` es el nombre de tu workspace de
   Tessl; lo ves con `tessl workspace list`.

   ```bash
   tessl login
   tessl project create aipos --workspace <tu-workspace>
   ```

2. Revisa la calidad de cada skill. Tessl le da una nota de 0 a 100:

   ```bash
   tessl review run tessl-plugins/<tile>/skills/<skill>
   ```

3. Corre los evals del tile y mira el resultado:

   ```bash
   tessl eval run tessl-plugins/<tile>
   tessl eval view --last
   ```

Criterio del proyecto: un tile se queda si con él la nota sube al menos 0.10. Si no mejora, se recorta
o se descarta.

Los reviews y los evals gastan créditos de Tessl. El plan gratis trae 1000 créditos al mes.

### 7. Publicar un tile (necesita cuenta)

Los tiles de AIPOS son públicos: tienen `"private": false` en `plugin.json`.

1. Revisa todo sin publicar:

   ```bash
   tessl plugin publish tessl-plugins/<tile> --dry-run
   ```

2. Publica:

   ```bash
   tessl plugin publish tessl-plugins/<tile>
   ```

3. Pide que sea público desde la página del tile en el registro de Tessl (Actions → Make Public).
   **Hacerlo público no tiene vuelta atrás.**

Una versión publicada no se puede reemplazar. Para publicar cambios, sube la versión en `plugin.json`
o usa `--bump patch`.

### Qué va a git y qué no

| Va a git | Queda fuera de git (lo regenera `tessl install`) |
|---|---|
| `tessl.json`, `tessl-plugins/`, `CLAUDE.md`, `AGENTS.md` y los `.gitignore` que crea Tessl | `.tessl/plugins/`, `.tessl/RULES.md` y los `tessl__*` de `.claude/skills/`, `.agents/skills/` y `.codex/skills/` |

### Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| `Failed to parse YAML frontmatter: Nested mappings are not allowed in compact mappings` | La descripción de una skill tiene dos puntos seguidos de un espacio, por ejemplo "u otro): qué". | Reescribe la frase sin esos dos puntos o pon la descripción entre comillas. |
| `Please authenticate with Tessl to continue` | El comando necesita cuenta: evals, reviews, publicar o consultar el registro. | Corre `tessl login`. |
| `Too many arguments, expected 0 but encountered "codex"` | `--agent` recibe un solo agente por vez. | Usa `tessl init --agent claude-code --agent codex`. |
| El agente no sigue un cambio que hiciste en un tile | El agente lee la copia instalada en `.tessl/`, y las reglas se cargan al abrir la sesión. | Corre `tessl install` y abre una sesión nueva. |
| Las reglas no aparecen en el agente | Falta `tessl install` en esta copia del repositorio. | Corre `tessl install` desde la raíz. |

### Seguridad

- Los tiles de AIPOS son públicos. No pongas credenciales ni datos privados en `tessl-plugins/`.
- Los evals corren en los servidores de Tessl: el tile y sus proyectos de ejemplo se suben allá.
