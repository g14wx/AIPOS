---
name: flujo-entregable
description: Crea la rama de un entregable, abre el pull request y lo integra en la rama de integración (por ejemplo ProductionEnv) con merge commit y etiqueta, sin borrar la rama, para que cada entregable se vea claro en el historial de git. Úsala al empezar o terminar un entregable, al integrar una rama, al preparar la entrega final hacia main, o cuando pregunten cómo dejar el historial de git listo para una revisión.
---

# Flujo de un entregable

Un entregable (por ejemplo "productos" o "ventas") vive en su propia rama. Entra a la rama de integración con un pull request (PR) y un merge commit, y queda marcado con una etiqueta (tag). Así, quien revise ve en `git log --graph` dónde empezó y dónde se integró cada entregable.

Toma del glosario (`docs/lenguaje-ubicuo.md`) el nombre de la rama de integración y de los entregables. Si no están, pregunta. En los comandos, `<integracion>` es esa rama y `<entregable>` es el nombre del entregable.

Si el proyecto todavía no tiene remoto, omite los `git pull` y `git push`, y usa el camino "Solo local" de los pasos 4 y 5.

## 0. Revisar el repositorio (una vez por proyecto)

```bash
gh repo view --json mergeCommitAllowed,deleteBranchOnMerge
gh api repos/{owner}/{repo}/rules/branches/<integracion>
```

- `mergeCommitAllowed` tiene que ser `true`. Si es `false`, GitHub no deja integrar con merge commit.
- `deleteBranchOnMerge` tiene que ser `false`. Si es `true`, GitHub borra la rama al integrar el PR.
- Si las reglas de `<integracion>` incluyen `required_linear_history` (historial lineal), GitHub bloquea los merge commits. Avisa.
- Para cambiar la configuración, explica en una frase qué cambia y pide permiso antes:
  `gh api -X PATCH repos/{owner}/{repo} -F allow_merge_commit=true -F delete_branch_on_merge=false`
- Si `<integracion>` no existe en el remoto, créala desde `main`, también con permiso:
  `git switch -c <integracion> main && git push -u origin <integracion>`

## 1. Empezar el entregable

```bash
git switch <integracion> && git pull
git switch -c feature/<entregable>
git push -u origin feature/<entregable>
```

## 2. Trabajar

- Haz commits pequeños con Conventional Commits en español: `feat(<entregable>): ...`.
- Cada tarea del agente lleva su entrada en la bitácora (skill `bitacora-ia`).
- Sube la rama seguido: `git push`.

## 3. Abrir el PR

```bash
gh pr create --base <integracion> --head feature/<entregable> \
  --title "feat(<entregable>): <resumen en español>" --body-file <archivo>
```

El cuerpo del PR dice qué incluye el entregable, cómo probarlo, qué hizo el agente y qué revisó la persona (enlaza la bitácora).

## 4. Integrar

**Con GitHub**, que es el caso normal:

```bash
gh pr merge <numero> --merge --subject "Merge: entregable <entregable> (#<numero>)"
```

- Usa siempre `--merge`: nunca `--squash`, nunca `--rebase` y nunca `--delete-branch`.
- `--subject` deja el mensaje del merge en español. Sin esa opción, GitHub escribe "Merge pull request #… from …".
- Si falta `gh`, integra el PR desde la web de GitHub con "Create a merge commit" y el mismo mensaje. No integres en local: el entregable tiene que entrar por el PR.

**Solo local**, si el proyecto todavía no tiene remoto:

```bash
git switch <integracion>
git merge --no-ff feature/<entregable> -m "Merge: entregable <entregable>"
```

Comprueba el resultado:
- `git log --graph --oneline -15 <integracion>` muestra el merge commit. Con GitHub, corre antes `git fetch origin` y mira `origin/<integracion>`.
- `git branch -a` sigue mostrando `feature/<entregable>`.

## 5. Etiquetar

Etiqueta el commit exacto del merge, no la punta de la rama: si otro PR entra justo después, la punta ya es otro commit.

**Con GitHub:**

```bash
sha=$(gh pr view <numero> --json mergeCommit --jq .mergeCommit.oid)
git fetch origin
git tag -a entregable-<entregable> "$sha" -m "Entregable: <entregable>"
git push origin entregable-<entregable>
```

**Solo local**, justo después del merge del paso 4:

```bash
git tag -a entregable-<entregable> -m "Entregable: <entregable>"
```

## 6. Entrega final

Cuando todos los entregables están en `<integracion>`:

1. Etiqueta la versión final: `git tag -a v1.0.0 -m "Entrega final"` y súbela.
2. Abre un PR de `<integracion>` hacia `main` con el método que permita la protección de `main`.
3. No borres `<integracion>` ni las ramas de entregable.

## Qué no hacer

- Integrar un entregable con squash o rebase: se pierde la separación entre entregables.
- Borrar ramas de entregable.
- Usar `git push --force` o reescribir commits que ya se subieron.
- Hacer commits directos en `main` o en `<integracion>`.
