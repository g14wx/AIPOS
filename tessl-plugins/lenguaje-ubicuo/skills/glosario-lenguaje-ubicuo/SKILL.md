---
name: glosario-lenguaje-ubicuo
description: Crea, actualiza y revisa el glosario de lenguaje ubicuo del proyecto (docs/lenguaje-ubicuo.md), el vocabulario compartido entre la persona usuaria y el agente que se usa igual en la conversación, el código, los tests y la base de datos. Úsala al empezar un proyecto desde un documento de requisitos, al nombrar tablas, modelos, funciones o rutas, cuando aparece un término nuevo o ambiguo, cuando hay dos palabras para lo mismo (por ejemplo "tile" y "plugin"), o cuando piden revisar si el código habla igual que el negocio.
---

# Glosario de lenguaje ubicuo

El lenguaje ubicuo es el conjunto de palabras que la persona usuaria (quien conoce el negocio) y el agente usan igual en todas partes. Si ella dice "venta", el código dice `venta`, no `registro` ni `setStatus(3)`. El glosario vive en `docs/lenguaje-ubicuo.md` y sigue la plantilla de [references/plantilla-glosario.md](references/plantilla-glosario.md).

Las palabras salen del negocio, no del programador. Si una palabra es fea pero es la que usa el negocio, se queda.

## Crear el glosario

1. Lee la fuente: el documento de requisitos, el README y la conversación. Anota las palabras exactas que usa la fuente, sin reemplazarlas por otras que te parezcan mejores.
2. Separa dos grupos:
   - **Negocio**: cosas (sustantivos como "producto" o "venta") y acciones (verbos como "registrar una venta").
   - **Herramientas y proceso**: las palabras con las que se trabaja (tile, skill, rama, entregable, agente).
3. Busca problemas:
   - **Ambigüedad**: una palabra con dos significados. Ejemplo: "precio" puede ser el del producto o el que se cobró en una venta.
   - **Sinónimos**: dos palabras para lo mismo. Ejemplo: "tile" y "plugin". Elige una y escribe la otra en "No decir".
   - **Choques**: la misma palabra en dos herramientas distintas. Ejemplo: "plugin de Claude Code" y "tile de Tessl".
4. Propón a la persona usuaria una tabla corta con la palabra, qué significa en una frase y el nombre en código. Marca lo dudoso como "por confirmar". Pregunta como máximo 3 cosas por ronda.
5. Escribe `docs/lenguaje-ubicuo.md` solo con lo confirmado. Lo dudoso va a la sección "Pendientes".

## Cuando aparece una palabra nueva o dudosa

1. Para antes de escribir código con ella.
2. Busca en el glosario si ya existe con otro nombre.
3. Si no existe, pregunta qué significa con un ejemplo concreto: "¿el descuento se aplica a un producto de la venta o al total?".
4. Agrega la entrada al glosario y, en el mismo cambio, úsala en el código.

## Revisar si el código habla igual que el negocio

1. Por cada término, busca en el código su "Nombre en código" y las palabras de "No decir". Por ejemplo: `grep -rniE "sale|order|transaction" src/`.
2. Busca también nombres vagos: `Manager`, `Helper`, `Processor`, `Data`, `Info`, `Util`.
3. Reporta en lenguaje simple con archivo y línea: "`src/services/orderHelper.js:12` dice 'order'; en el glosario es 'venta'".
4. Propón los cambios de nombre. No renombres nada sin el visto bueno de la persona usuaria.

## Cuando un término cambia

En un solo cambio se hace todo esto:
- Se actualiza el glosario y se anota en su "Historial de cambios".
- Se renombra en el código y en los tests.
- Si el término es una tabla o una columna, se renombra con una migración nueva (un script que cambia la base de datos paso a paso). Nunca se edita una migración vieja.
- El mensaje del commit usa el término nuevo.

## Cómo escribir cada entrada

- La definición va en palabras del negocio, en una frase, sin jerga.
- Cada término tiene un ejemplo concreto del proyecto.
- El nombre en código sigue la convención escrita al inicio del glosario.
- Se usa una fila por término, nunca dos términos en la misma fila.
- El glosario es corto: solo entran palabras que el equipo usa de verdad.
