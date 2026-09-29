---
name: readme-entrega
description: Escribe o revisa el README.md de entrega de una prueba técnica hecha con agentes de código, con los 12 puntos obligatorios (funcionalidades, tecnologías y versiones, estructura, cumplimiento de requisitos, instalación, base de datos, procedimiento almacenado, tiempo, herramientas de IA, uso del agente, decisiones técnicas y consideraciones). Toma los datos del código, del historial de git, de la bitácora de IA y del glosario. Úsala al preparar la entrega, al cerrar un entregable o cuando pidan revisar si el README cumple.
---

# README de entrega

Quien evalúa lee el README antes que el código, y puede revisarlo con herramientas de IA. Cada afirmación tiene que poder comprobarse en el repositorio. La estructura está en [references/plantilla-readme.md](references/plantilla-readme.md).

## De dónde sale cada punto

| # | Punto | Fuente |
|---|---|---|
| 1 | Funcionalidades desarrolladas | El código y los PR de cada entregable |
| 2 | Tecnologías y versiones | `package.json` y `package-lock.json` (versiones instaladas), imagen de `docker-compose.yml` |
| 3 | Estructura (frontend, backend y base de datos) | Árbol de carpetas real |
| 4 | Cumplimiento de requisitos | Requisitos de la prueba contra el código. Incluye lo no completado |
| 5 | Instalación y ejecución | Scripts de `package.json` y `docker-compose.yml` |
| 6 | Base de datos MySQL | Migraciones, scripts SQL y variables de entorno (`.env.example`) |
| 7 | Procedimiento almacenado | Archivo SQL, cómo se crea, y el archivo y la función que lo llaman (`grep -rn "CALL " backend/`) |
| 8 | Tiempo | Tabla de resumen de la bitácora de IA |
| 9 | Herramientas de IA | Bitácora y líneas `Co-Authored-By` de los commits |
| 10 | Cómo se usó el agente | Entradas de la bitácora: tareas delegadas, ejemplos y qué revisó o corrigió la persona |
| 11 | Decisiones técnicas | "Propuestas cambiadas o descartadas" de la bitácora y las decisiones del glosario |
| 12 | Consideraciones | Trampas conocidas, requisitos de versión (Node, MySQL) y lo que falta |

## Flujo

1. Reúne los datos de las fuentes de la tabla. Si la bitácora está vacía o incompleta, pregunta a la persona. No rellenes.
2. Escribe el README con la plantilla y las palabras del glosario.
3. Verifica:
   - Corre las instrucciones de instalación en limpio. Si no puedes, dilo en el punto 12.
   - Cada versión coincide con la instalada, no con "latest".
   - Cada archivo y comando que mencionas existe.
   - La tabla de cumplimiento marca con honestidad lo que no se completó.
4. Relee el README con la regla de comunicación clara: frases cortas y siglas explicadas.

## Reglas

- No inventes funcionalidades, tests, herramientas ni revisiones. Si algo no existe, no se menciona, o se declara como pendiente.
- El punto 7 nombra el procedimiento, el archivo SQL, el comando que lo crea y la ruta y función que lo llaman. Ejemplo: "`backend/src/services/ventas.js`, función `registrarVenta`".
- Los puntos 9 a 11 usan ejemplos reales de la bitácora, con al menos una propuesta del agente que la persona cambió o descartó y su motivo.
- Los comandos van en bloques de código y se pueden copiar y pegar.
