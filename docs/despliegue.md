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

## Cómo queda armado el servidor

```text
internet ── 80/443 ──> Caddy (ya existe, no se reinicia)
                        ├─ aipos.salsalvador.io       ──> 127.0.0.1:8141  contenedor frontend (nginx)
                        └─ aipos-back.salsalvador.io  ──> 127.0.0.1:8140  contenedor backend (Node)
                                                                  │  red interna de Docker
                                                                  └──> contenedor mysql (mysql:8.4)
                                                                       también en 127.0.0.1:3306
```

- Caddy es el servidor web que ya corre en el servidor: recibe el tráfico en los puertos 80 y 443, saca los
  certificados HTTPS y sirve otros sitios. AIPOS agrega dos archivos a su carpeta `conf.d` y no toca ningún otro.
- Solo entran por internet los puertos que ya estaban abiertos (22, 80 y 443). AIPOS no abre ninguno.
- Docker se salta el firewall (`ufw`) en los puertos que publica. Por eso los tres contenedores publican solo en
  `127.0.0.1`, nunca en `0.0.0.0`.
- MySQL en `127.0.0.1:3306` sirve para entrar desde el mismo servidor o con un túnel SSH (`ssh -L 3307:127.0.0.1:3306
  <usuario>@aipos.salsalvador.io` abre el puerto 3307 de tu máquina hacia el MySQL del servidor).
- Las imágenes se construyen en GitHub Actions y se guardan en `ghcr.io` (el registro de imágenes de GitHub). El
  servidor solo las baja: entra con el `GITHUB_TOKEN` del propio job y sale con `docker logout` al terminar, así que
  no queda ninguna clave de larga duración en el servidor.

## Configuración del servidor (una sola vez)

La hace el agente con el acceso que le da la persona desarrolladora, antes de subir la primera etiqueta. No la repite
el pipeline: el usuario de despliegue no tiene `sudo`. Se hace en este orden y **sin tocar lo que ya corre**. En los
comandos, `<usuario-de-despliegue>` es el nombre que elijas para ese usuario y `<administración>` es el usuario con el
que entras tú para administrar. Ninguno de los dos se escribe en el repositorio.

1. **Leer primero, sin cambiar nada.** Sistema, puertos, rutas, sitios de Caddy, firewall y servicios caídos. Guarda esa
   foto en un archivo para compararla al final.

   ```bash
   ssh <administración>@aipos.salsalvador.io
   cat /etc/os-release; nproc; free -h; df -h /
   ss -ltn                                  # 8140, 8141 y 3306 tienen que estar libres
   ip route                                 # las redes de Docker no deben chocar con una ruta que ya exista
   ls /etc/caddy /etc/caddy/conf.d          # los sitios que ya sirve Caddy
   sudo ufw status verbose
   systemctl --failed
   ```

2. **Docker Engine y el plugin de Compose** desde el repositorio apt oficial de Docker, no desde el paquete `docker.io`
   de Ubuntu. No cambia el firewall: Docker publica solo en `127.0.0.1` y Caddy sigue entrando por 80 y 443.

   ```bash
   sudo apt-get update && sudo apt-get install -y ca-certificates curl
   sudo install -m 0755 -d /etc/apt/keyrings
   sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
   sudo apt-get update
   sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   sudo docker run --rm hello-world
   ```

3. **El usuario de despliegue**: sin contraseña, sin `sudo`, en el grupo `docker`, con su propia clave SSH. La clave se
   crea en una carpeta temporal de tu máquina; la clave pública va al `authorized_keys` del usuario con la opción
   `restrict` (sin reenvío de puertos, sin agente, sin terminal), y la privada va solo como secreto del environment
   (ver el paso 6, porque el environment tiene que existir antes). Después borras la copia local de la clave privada.
   La línea `known_hosts` sale de la llave pública del propio servidor, no de un escaneo de red. No se usan la cuenta
   root ni tu clave personal.

   ```bash
   # En tu máquina
   CARPETA="$(mktemp -d)"
   ssh-keygen -t ed25519 -N '' -C 'despliegue de AIPOS' -f "$CARPETA/clave"

   # En el servidor
   sudo adduser --disabled-password --gecos '' <usuario-de-despliegue>
   sudo usermod -aG docker <usuario-de-despliegue>
   sudo install -d -m 700 -o <usuario-de-despliegue> -g <usuario-de-despliegue> /home/<usuario-de-despliegue>/.ssh
   echo "restrict <el contenido de $CARPETA/clave.pub>" | sudo tee /home/<usuario-de-despliegue>/.ssh/authorized_keys >/dev/null
   sudo chown <usuario-de-despliegue>: /home/<usuario-de-despliegue>/.ssh/authorized_keys
   sudo chmod 600 /home/<usuario-de-despliegue>/.ssh/authorized_keys

   # Los secretos y la variable (después del paso 6)
   gh secret set SSH_CLAVE_PRIVADA --env production --repo g14wx/AIPOS < "$CARPETA/clave"
   LLAVE="$(ssh <administración>@aipos.salsalvador.io cat /etc/ssh/ssh_host_ed25519_key.pub | cut -d' ' -f1,2)"
   gh secret set SSH_HOSTS_CONOCIDOS --env production --repo g14wx/AIPOS --body "aipos.salsalvador.io $LLAVE"
   gh variable set SERVIDOR_USUARIO --env production --repo g14wx/AIPOS --body '<usuario-de-despliegue>'
   rm -rf "$CARPETA"
   ```

4. **La carpeta de la app**, `/srv/aipos`, con el usuario de despliegue como dueño y permisos 750. Ahí
   `despliegue/crear-env.sh` crea el `.env` con permisos 600, con dos contraseñas aleatorias que no se imprimen. Se niega
   a sobrescribir un `.env` que ya existe: MySQL solo lee las contraseñas al crear su volumen, y cambiarlas en el archivo
   no las cambia en la base.

   ```bash
   sudo install -d -m 750 -o <usuario-de-despliegue> -g <usuario-de-despliegue> /srv/aipos /srv/aipos/versiones
   ssh <administración>@aipos.salsalvador.io "sudo -u <usuario-de-despliegue> bash -s" < despliegue/crear-env.sh
   ```

5. **Caddy**, con `despliegue/instalar-caddy.sh`. Guarda un respaldo, anota el código HTTP de cada sitio, copia los dos
   archivos, corre `caddy validate` y recarga con `systemctl reload caddy`. Si `caddy validate` falla, deja todo como
   estaba y no recarga. Nunca reinicia Caddy: un archivo inválido invalida toda la configuración y haría caer los otros
   sitios en el siguiente reinicio.

   ```bash
   ssh <administración>@aipos.salsalvador.io mkdir -p /tmp/aipos-caddy
   scp -r despliegue/instalar-caddy.sh despliegue/caddy <administración>@aipos.salsalvador.io:/tmp/aipos-caddy/
   ssh <administración>@aipos.salsalvador.io "sudo bash /tmp/aipos-caddy/instalar-caddy.sh; rm -rf /tmp/aipos-caddy"
   ```

6. **GitHub**, con `gh api`: el environment `production` y la regla de etiquetas (ver la sección de abajo). Se hace antes
   de cargar los secretos del paso 3.

7. **Al final**, repite la foto del paso 1 y comprueba que todo lo que ya corría sigue igual: los otros sitios de Caddy dan
   el mismo código HTTP, y los puertos y servicios de antes siguen en su lugar.

Nunca: activar o cambiar el firewall sin comprobar antes que SSH sigue entrando, reiniciar Caddy, editar el archivo de
otro sitio, escribir credenciales, direcciones IP o el alias de acceso en el repositorio o en el tablero.

El grupo `docker` equivale a ser root sobre el servidor: quien pueda correr `docker` puede montar cualquier carpeta. Se
acepta porque la clave está limitada con `restrict`, solo vive como secreto del environment (que exige tu aprobación) y
el workflow solo corre `desplegar.sh`. Docker sin root (rootless) se descartó por su complejidad para una sola aplicación.

<!-- La parte 3 (GitHub, errores y lo que nunca se hace) sigue en el mismo archivo. -->
