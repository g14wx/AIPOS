# Flujo 06 · Trabajar una tarjeta con el agente

Cómo se hace una tarjeta del tablero AIPOS con el agente. El agente propone, implementa y prueba; la persona
desarrolladora decide, valida y aprueba. Cada corrección y cada propuesta descartada queda en la bitácora de IA,
porque de ahí salen los puntos 8 a 11 del README.

![Diagrama BPMN del flujo 06](../diagramas/06-trabajar-una-tarjeta-con-el-agente.png)

Fuente editable: [`06-trabajar-una-tarjeta-con-el-agente.drawio`](../diagramas/06-trabajar-una-tarjeta-con-el-agente.drawio).

- **Carriles:** Persona desarrolladora · Agente (Claude Code) · Tablero AIPOS.
- **Empieza:** hay una tarjeta en "Por hacer".
- **Termina bien:** el cambio está en un commit con su entrada en la bitácora, y la tarjeta está lista para el
  PR de su entregable ([flujo 05](05-entregar-un-entregable.md)).
- **Requerimientos:** [RNF-08](../03-requerimientos-no-funcionales.md#rnf-08-pruebas),
  [RNF-10](../03-requerimientos-no-funcionales.md#rnf-10-uso-del-agente).
- **Tarjetas:** R-03 (definición de terminado) y todas las del tablero.

## Pasos

1. **Persona desarrolladora:** elige la tarjeta y se la pasa al agente.
2. **Agente:** lee la tarjeta con el MCP de Trello, su flujo en `requerimientos/` y el glosario.
3. **Tablero AIPOS:** la tarjeta pasa a "En progreso".
4. **Agente:** propone un plan corto.
5. **Persona desarrolladora:** aprueba el plan.
6. **Agente:** implementa y escribe las pruebas.
7. **Agente:** corre las pruebas.
8. **Persona desarrolladora:** valida el código y las pruebas, y lo prueba en la pantalla.
9. **Agente:** escribe la entrada en la bitácora de IA.
10. **Agente:** hace el commit con Conventional Commits y `Co-Authored-By`, sin `Claude-Session`, y lo sube.
11. **Tablero AIPOS:** se marcan las subtareas de la tarjeta.

## Otros caminos

| En el paso | Qué pasa | Resultado |
|---|---|---|
| 5 | La persona desarrolladora corrige o descarta el plan. | Queda anotado para la bitácora. El agente ajusta el plan y vuelve al paso 4. |
| 6 | Aparece una palabra del negocio que no está en el glosario. | El agente para, le pregunta a la persona desarrolladora y propone la entrada. Sigue cuando está en el glosario. |
| 7 | Una prueba falla. | El agente depura y vuelve al paso 6. |
| 8 | La persona desarrolladora pide cambios. | Queda anotado para la bitácora y vuelve al paso 6. |
