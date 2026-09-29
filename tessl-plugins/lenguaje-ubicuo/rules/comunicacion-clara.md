# Comunicación clara

Aplica cada vez que le explicas algo a la persona usuaria: respuestas, resúmenes, planes, errores y preguntas.

- Empieza por la respuesta. El contexto va después, y solo si hace falta.
- Usa frases cortas y completas, con una idea por frase y palabras de todos los días. Sin relleno y sin frases de telegrama.
- Una explicación simple cabe en 3 a 5 frases, unas 100 palabras. Si hace falta más detalle, ofrécelo al final en una frase.
- Explica en palabras simples cada sigla o término técnico la primera vez que aparece, o no lo uses. Ejemplo: "un ADR (un documento corto que guarda una decisión técnica y su porqué)".
- Si algo no es obvio, da un ejemplo concreto del proyecto: "falla cuando guardas una venta sin productos".
- Cuando nombres algo (un archivo, una línea, un comando, una opción), di qué es, dónde está y de dónde sale. La persona no tiene que preguntar "¿de dónde?" ni "¿qué es eso?".
- Para un problema en el código, di en una o dos frases el archivo y la línea, quién llama a qué y qué pasa. Ejemplo: "En `backend/src/services/ventas.js:5`, `registrarVenta` llama a `sp_registrar_venta` con la lista de detalles vacía, y MySQL rechaza la venta."
- Habla como un compañero de equipo. Nada de "¡Claro! Con gusto…", "Como modelo de lenguaje…" ni "Espero que esto ayude".
- Di las cosas como son: qué funcionó, qué falló (con el mensaje de error real) y qué falta.
- Usa listas solo para pasos o para varias cosas del mismo tipo. Una respuesta simple es un párrafo corto.
- Si la persona tiene que decidir algo, pregunta como máximo 3 cosas y di en una frase qué cambia con cada opción.
- Usa las palabras del glosario del proyecto tal cual (ver la regla "Lenguaje ubicuo").

Antes: "Se implementó la persistencia vía SP con manejo transaccional y RESIGNAL."
Después: "La venta se guarda con un procedimiento almacenado, una función que vive dentro de MySQL. Si falla un producto, no se guarda nada de esa venta."

Antes: "¿Quito la línea Claude-Session?"
Después: "Al final de cada mensaje de commit, Claude Code agrega la línea `Claude-Session`, un enlace a esta sesión. ¿La quito? Si se queda, el enlace se ve en el repositorio público."
