# Despliegue de AIPOS

[← Volver al README](../README.md)

## Qué es y para qué sirve

Desplegar es poner en producción una versión de AIPOS que ya pasó las pruebas. Producción es el servidor real donde
se usa AIPOS: la pantalla está en `https://aipos.salsalvador.io` y el backend en `https://aipos-back.salsalvador.io`.
El pipeline es la cadena de pasos automáticos de GitHub Actions que revisa, prueba, construye y despliega. Arranca
cuando la persona desarrolladora sube una etiqueta `release-*`, y después de probar y construir espera su aprobación.

Las palabras de esta guía (desplegar, producción, pipeline, etiqueta `release-*`) están en el
[glosario](lenguaje-ubicuo.md). Lo que tiene que cumplir todo esto está en la spec
[`specs/despliegue.spec.md`](../specs/despliegue.spec.md), y el flujo dibujado está en el
[flujo 07](../requerimientos/flujos/07-desplegar-una-version.md).

| Pieza | Dónde vive | Qué hace |
|---|---|---|
| Workflow | `.github/workflows/despliegue.yml` | Revisa la etiqueta, prueba, construye las dos imágenes, espera la aprobación y despliega. |
| Imágenes | `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf` | El backend y la pantalla como imágenes de Docker (un contenedor es un programa empaquetado con lo que necesita). |
| Docker Compose de producción | `docker-compose.produccion.yml` | Describe los tres contenedores: MySQL 8.4, el backend y la pantalla. |
| Scripts del servidor | `despliegue/*.sh` | `desplegar.sh`, `crear-env.sh`, `instalar-caddy.sh`, `revisar-etiqueta.sh` y `revisar-produccion.sh`. |
| Bloques de Caddy | `despliegue/caddy/*.caddy` | Un archivo por dominio: dónde manda Caddy el tráfico y qué certificado HTTPS saca. |
| Pruebas | `tests/despliegue/*.test.sh` | Se corren una por una con `bash tests/despliegue/<nombre>.test.sh`. |

## Cómo desplegar una versión

1. Integra el entregable en `ProductionEnv` con su pull request y su merge commit
   ([flujo 05](../requerimientos/flujos/05-entregar-un-entregable.md)).
2. Pon la etiqueta en el commit del merge y súbela. La forma es `release-MAYOR.MENOR.PARCHE`:
   `release-0.1.0` con el entregable base, `release-0.2.0` con productos y `release-1.0.0` con ventas.

   ```bash
   git fetch origin
   git tag release-0.1.0 origin/ProductionEnv
   git push origin release-0.1.0
   ```

   Solo la persona desarrolladora puede crear etiquetas `release-*` (ver "Regla de etiquetas"). Una etiqueta con otra
   forma (`release-hoy`, `release-1.0`) falla en el primer job, sin desplegar.
3. En GitHub, pestaña **Actions**, abre la ejecución "Despliegue". Los jobs `revisar`, `probar-backend`,
   `probar-frontend` y `construir` corren solos. Si uno falla, los que siguen no corren y no cambia nada en el servidor.
4. El job `desplegar` se detiene y pide tu aprobación: **Review deployments**, marca `production` y pulsa
   **Approve and deploy**. El agente no aprueba por ti.
5. Cuando termina en verde, comprueba a mano:

   ```bash
   curl -si https://aipos-back.salsalvador.io/api/salud     # 200 con {"estado":"ok","baseDeDatos":"ok"}
   curl -si -o /dev/null -w '%{http_code}\n' https://aipos.salsalvador.io/     # 200
   nc -zv aipos.salsalvador.io 3306                          # no debe conectar: MySQL no se ve desde internet
   ```

Cada despliegue deja en el servidor, dentro de `/srv/aipos`, `version-actual` y `version-anterior` (una línea con
la etiqueta) y una carpeta `versiones/<etiqueta>/` con el compose con el que corrió esa versión.

## Volver a la versión anterior

Hay tres caminos, y los tres dejan el servidor en una versión que ya funcionaba.

| Cuándo falla | Quién vuelve | Qué queda |
|---|---|---|
| El backend o la pantalla no quedan sanos, o `127.0.0.1` no da 200 | `desplegar.sh` mismo | La versión que ya corría, con los archivos de estado sin cambiar. |
| `revisar-produccion.sh` falla desde internet (Caddy, DNS, certificado, CORS) | El workflow, con `desplegar.sh volver` | La versión de `version-anterior`; `version-actual` pasa a valer esa etiqueta. |
| Tú decides volver a mano | En GitHub, **Re-run all jobs** sobre la ejecución de una etiqueta anterior | Esa etiqueta, otra vez con tu aprobación. |

Para volver a mano sin el workflow, entra al servidor con el usuario de despliegue y corre el script de la versión
que está activa:

```bash
ssh <usuario-de-despliegue>@aipos.salsalvador.io
bash /srv/aipos/versiones/<etiqueta-actual>/desplegar.sh volver
```

- Si no hay `version-anterior` (es el primer despliegue), no hay a dónde volver: el script detiene el backend y la
  pantalla, deja MySQL y su volumen como estaban y termina con error. Caddy responde 502 hasta el siguiente despliegue.
- Si `version-actual` ya es igual a `version-anterior`, no hace nada y termina bien.
- Las migraciones no se deshacen solas: `db:migrate:undo` puede borrar datos. Por eso una migración de un release solo
  agrega (tablas, columnas nuevas con valor por defecto, un procedimiento nuevo o reemplazado), y la versión anterior del
  código tiene que seguir funcionando con ese esquema.
- Si una migración falla a la mitad, MySQL no deshace los cambios de esquema y la base puede quedar con una parte
  aplicada. El script lo dice en su mensaje: revisa la base antes de repetir el despliegue.

<!-- La parte 2 (el servidor, GitHub y los errores) sigue en el mismo archivo. -->
