# Setup de Graphify

[← Volver al README](../../README.md)

## Qué es y para qué sirve

[Graphify](https://github.com/Graphify-Labs/graphify) arma el **grafo del proyecto**: un mapa de qué archivos,
funciones, documentos y specs hay en AIPOS y cómo se conectan. Vive en `graphify-out/`. El agente lo consulta
antes de empezar una tarea, en lugar de abrir archivos sueltos, y el hook de git `pre-commit` lo actualiza en cada
commit. Las palabras de esta guía (grafo del proyecto, hook de git, hook de Claude Code, spec) están en el
[glosario](../lenguaje-ubicuo.md), y lo que tiene que cumplir todo esto está en la spec
[`specs/grafo-del-proyecto.spec.md`](../../specs/grafo-del-proyecto.spec.md).

| Pieza | Dónde vive | Qué hace |
|---|---|---|
| Regla del tile `grafo-del-proyecto` | `tessl-plugins/grafo-del-proyecto/` | Le pide al agente consultar el grafo antes de la tarea y revisar que el grafo entre en el commit. |
| Hook de git `pre-commit` | `.githooks/pre-commit` | Antes de cada commit corre `graphify update .` y agrega `graph.json` y `GRAPH_REPORT.md`. Nunca bloquea un commit. |
| Hook de Claude Code | `.claude/settings.json` | Antes de cada búsqueda o lectura de archivos, le recuerda al agente consultar el grafo. |
| Arranque | `AGENTS.md`, sección "Antes de empezar" | En la primera sesión de un clon nuevo, el agente activa el hook de git y ofrece instalar Graphify. |

Sin Graphify, el proyecto funciona igual: el hook de git avisa y deja pasar el commit, y el hook de Claude Code no
hace nada.

### Requisitos

- Python 3.10 o más nuevo.
- [uv](https://docs.astral.sh/uv/), para instalar Graphify en su propio entorno. En macOS: `brew install uv`.

### 1. Instalar Graphify

En un clon nuevo, el agente lo ofrece en la primera sesión. A mano:

```bash
uv tool install "graphifyy[sql]==0.9.72"
graphify --version
```

El paquete se llama `graphifyy`, con doble y. Los otros paquetes `graphify` de PyPI no son de Graphify-Labs. El
extra `sql` lee los procedimientos almacenados de MySQL. Esta guía se probó con la versión `0.9.72`.

### 2. Activar el hook de git

El agente lo activa en la primera sesión. A mano, desde la raíz del proyecto:

```bash
git config core.hooksPath .githooks
```

Se hace una vez por clon y vale para todos los worktrees del repo. Reemplaza a `.git/hooks`, donde git solo trae
ejemplos.

### 3. Verificar

```bash
graphify query "grafo del proyecto"
git config core.hooksPath
bash tests/hook-de-git/agrega-el-grafo.test.sh
```

La consulta devuelve las secciones de la spec con archivo y línea, `core.hooksPath` responde `.githooks` y la
prueba termina con "ok".

## Flujo de una tarea

Es el mismo orden del [flujo 06](../../requerimientos/flujos/06-trabajar-una-tarjeta-con-el-agente.md):

1. `graphify query "<la tarea>"` y leer primero los archivos que devuelve.
2. `requirement-gathering`: reunir requisitos, una pregunta a la vez.
3. `spec-writer`: escribir o actualizar la spec en `specs/`. El grafo ayuda a elegir sus `targets`.
4. La persona desarrolladora aprueba la spec.
5. Implementar y correr las pruebas.
6. `spec-verification` y `work-review`.
7. La bitácora y el commit. El hook de git actualiza el grafo y lo agrega al commit.

## Comandos útiles

| Comando | Qué hace |
|---|---|
| `graphify query "<pregunta>"` | Devuelve la parte del grafo que responde la pregunta, con archivo y línea. |
| `graphify path "<A>" "<B>"` | Muestra cómo se conectan dos cosas. |
| `graphify explain "<A>"` | Explica una sola cosa y sus conexiones. |
| `graphify update .` | Arma o actualiza el grafo con el código y los documentos, en local y sin usar el modelo. Si nada cambió, no toca los archivos. |

`graphify-out/graph.html` es una vista del grafo para abrir en el navegador. Queda fuera de git.

### Qué va a git y qué no

| Va a git | Queda fuera de git |
|---|---|
| `graphify-out/graph.json`, `graphify-out/GRAPH_REPORT.md`, `.githooks/pre-commit`, `.claude/settings.json` y `.graphifyignore` | El resto de `graphify-out/` (`.graphify_root`, `manifest.json`, `graph.html`, `cache/`): guarda rutas de la máquina o se regenera. |

`.graphifyignore` deja fuera del grafo los evals de los tiles, la bitácora de IA, las carpetas de los agentes y las
imágenes.

### Qué no usamos, y por qué

- **La skill `/graphify` y `graphify install`.** En la 0.9.72, `graphify install --project` también escribe su
  propia regla, en inglés, en `CLAUDE.md` y `AGENTS.md`, y crea `.codex/hooks.json`. `AGENTS.md` lo maneja Tessl, y
  `graphify update .` ya alcanza para armar y actualizar el grafo.
- **`graphify claude install` y `graphify codex install`.** Escriben esa misma regla.
- **`graphify hook install`.** Instala hooks de git que corren después del commit y dejan `graph.json` cambiado. Nuestro
  hook de git corre antes y mete el grafo en el mismo commit.
- **El "graphify" del registro de Tessl.** No es el oficial de Graphify-Labs.

### Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| `graphify: command not found` | La carpeta de uv no está en el `PATH`. | Corre `uv tool update-shell` y abre una terminal nueva. |
| El commit no trae el grafo | El hook de git no está activo. | `git config core.hooksPath` tiene que responder `.githooks`. Si no, corre `git config core.hooksPath .githooks`. |
| `pre-commit: 'graphify update .' falló` con "Refusing to overwrite" | Se borró código y el grafo nuevo tiene menos nodos, así que Graphify se niega a achicarlo. | Si lo borraste a propósito, corre `graphify update . --force` y agrega el grafo en otro commit. |
| `graph.json` choca en un merge o un rebase | Dos ramas cambiaron el grafo. | No lo arregles a mano: quédate con la versión de la rama de destino y haz commit. El hook de git lo regenera. |
| El grafo del commit muestra un archivo que no entró al commit | El hook de git arma el grafo con lo que hay en la carpeta, no solo con lo que agregaste al commit. | Se corrige solo en el commit siguiente. Para evitarlo, haz commit de todo lo de la tarea junto. |
| Después de `graphify install` cambiaron `CLAUDE.md` o `AGENTS.md` | Graphify escribió su propia regla. | Si no tenías otros cambios en esos archivos, corre `git restore CLAUDE.md AGENTS.md` y borra `.codex/hooks.json`. |

### Privacidad

- `graphify update .` lee el código y los documentos en tu máquina y no usa el modelo.
- Graphify respeta el `.gitignore`: `.mcp.json`, `.codex/config.toml` y `devdoc/` no entran al grafo.
- El grafo va a git y el repositorio es público. `tests/grafo-del-proyecto/sin-rutas-ni-evals.test.sh` revisa que no
  guarde rutas de la máquina.
