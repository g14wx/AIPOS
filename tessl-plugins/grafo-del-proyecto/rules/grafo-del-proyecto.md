# Grafo del proyecto

El grafo del proyecto es el mapa que arma Graphify en `graphify-out/`: qué archivos, funciones, documentos y specs hay y cómo se conectan. Úsalo para ubicarte antes de abrir archivos sueltos.

## Antes de empezar una tarea

- Antes de reunir requisitos o de escribir la spec, pregúntale al grafo por lo que vas a tocar: `graphify query "<la tarea en pocas palabras>"`. Para ver cómo se conectan dos cosas, usa `graphify path "<A>" "<B>"`. Para una sola, usa `graphify explain "<A>"`.
- Usa la respuesta para encontrar las specs y el código relacionados, y para elegir los `targets` de la spec.
- Al implementar, lee primero los archivos que salen en la respuesta. Busca a mano solo si el grafo no tiene lo que necesitas.
- Si falta `graphify-out/graph.json`, ármalo con `graphify update .`.
- Si el comando `graphify` no está instalado, pregúntale a la persona si lo instalas. Si dice que sí, corre `uv tool install "graphifyy[sql]==0.9.72"`. Nunca lo instales sin preguntar. Mientras tanto, lee `graphify-out/GRAPH_REPORT.md`.

## Al terminar una tarea

- El hook de git `pre-commit` del repo corre `graphify update .` y agrega `graphify-out/graph.json` y `graphify-out/GRAPH_REPORT.md` a cada commit. Revisa que los dos archivos entren al commit.
- Si el hook de git no está activo (`git config core.hooksPath` no responde `.githooks`), actívalo con `git config core.hooksPath .githooks`. Si no puedes, corre `graphify update .` antes del commit y agrega los dos archivos.
- No saltes el hook de git con `--no-verify`.
- No subas otros archivos de `graphify-out/`: guardan rutas de tu máquina.

## Cuándo no usarlo

- Si la tarea es revisar si el grafo está bien, no uses el grafo como prueba. Lee el código.
