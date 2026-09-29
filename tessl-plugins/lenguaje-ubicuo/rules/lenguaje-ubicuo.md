# Lenguaje ubicuo

El glosario del proyecto, `docs/lenguaje-ubicuo.md`, define las palabras oficiales. Es la fuente de verdad: si el código o la conversación dicen otra cosa, uno de los dos está mal.

- Usa los términos del glosario tal cual en la conversación, el código (tablas, modelos, funciones, variables, rutas, componentes), los tests, los commits y la documentación.
- Un término, un significado. No uses sinónimos: si el glosario dice "venta", no digas "orden" ni "transacción".
- Si una palabra puede nombrar dos cosas, di siempre cuál es: "tile de Tessl" o "plugin de Claude Code", nunca "plugin" a secas.
- Para nombrar algo en el código, usa la columna "Nombre en código" del glosario y su convención. No traduzcas por tu cuenta.
- No dejes que un framework o un ORM (la librería que conecta el código con la base de datos) elija el nombre, por ejemplo pluralizando en inglés. Fija el nombre de forma explícita.
- No uses nombres vagos para cosas del negocio: Manager, Helper, Processor, Data, Info, Util.
- Si aparece una palabra del negocio o del proceso que no está en el glosario, o dudas entre dos, para. Pregunta a la persona usuaria y propón la entrada. No la inventes.
- Si un término cambia, actualiza el glosario y renombra el código y los tests en el mismo cambio.
- Si el glosario no existe, créalo con la skill `glosario-lenguaje-ubicuo` antes de nombrar cosas del negocio.
