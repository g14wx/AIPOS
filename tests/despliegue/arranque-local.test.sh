#!/usr/bin/env bash
# Spec: specs/despliegue.spec.md, sección "Pruebas en local" (arranque-local.test.sh) y criterios 4, 6 y 12.
# Construye las dos imágenes con la etiqueta release-0.0.1 (no `local`: desplegar.sh solo acepta release-X.Y.Z, y la
# spec pide release-0.0.N para las pruebas), levanta el compose de producción en esta máquina con un .env temporal
# (CORS_ORIGIN=http://127.0.0.1:8141, VITE_API_URL=http://127.0.0.1:8140), corre despliegue/desplegar.sh contra ese
# compose y revisa: las migraciones, /api/salud 200, MySQL solo en 127.0.0.1, el uid del proceso 1 de cada contenedor
# y que el volumen conserva una tabla después de desplegar otra versión.
# Al terminar baja los contenedores SIN -v (con `down`, del proyecto temporal) y borra su volumen por su nombre.
# Necesita Docker y el código de backend/ y frontend/ (B-02, B-03, B-04); si falta algo, se omite y lo dice.
# shellcheck source=comun.sh
source "$(dirname "${BASH_SOURCE[0]}")/comun.sh"
PROYECTO="aipos-prueba-arranque" # el proyecto temporal de Compose: nada más usa este nombre
PUERTO_MYSQL="${AIPOS_PRUEBA_MYSQL_PORT:-3309}"
V1=release-0.0.1
V2=release-0.0.2
IMG_B=ghcr.io/g14wx/aipos-backend
IMG_F=ghcr.io/g14wx/aipos-frontend

docker info >/dev/null 2>&1 || omitir "Docker no está corriendo"
if [ ! -f "$RAIZ/backend/package.json" ] || [ ! -f "$RAIZ/frontend/package.json" ]; then
  omitir "faltan backend/ y frontend/ (B-02, B-03 y B-04); no hay imágenes que construir"
fi
if [ ! -f "$RAIZ/despliegue/desplegar.sh" ] || [ ! -f "$RAIZ/docker-compose.produccion.yml" ]; then
  falla "faltan despliegue/desplegar.sh o docker-compose.produccion.yml"
  terminar
fi
for p in 8140 8141 "$PUERTO_MYSQL"; do
  if (exec 3<>"/dev/tcp/127.0.0.1/$p") 2>/dev/null; then omitir "el puerto $p de 127.0.0.1 ya está en uso"; fi
done

TMP="$(mktemp -d)"
SRV="$TMP/srv-aipos" # hace de /srv/aipos
BIN="$TMP/bin"
mkdir -p "$SRV/versiones" "$BIN"
(
  umask 077
  {
    echo "COMPOSE_PROJECT_NAME=$PROYECTO"
    echo "CORS_ORIGIN=http://127.0.0.1:8141"
    echo "MYSQL_PORT=$PUERTO_MYSQL"
    echo "MYSQL_DATABASE=aipos"
    echo "MYSQL_USER=aipos"
    echo "MYSQL_PASSWORD=$(openssl rand -hex 16)"
    echo "MYSQL_ROOT_PASSWORD=$(openssl rand -hex 16)"
  } >"$SRV/.env"
)
valor_env() { grep "^$1=" "$SRV/.env" | cut -d= -f2-; }

# macOS no trae flock: se usa uno de mentira (el candado de verdad lo prueba desplegar-en-fila.test.sh).
if ! command -v flock >/dev/null 2>&1; then
  printf '#!/usr/bin/env bash\nexit 0\n' >"$BIN/flock"
  chmod +x "$BIN/flock"
  echo "info: esta máquina no trae flock; se usa uno de mentira"
fi
PATH="$BIN:$PATH"
export PATH

# compose <etiqueta> <argumentos>: Compose sobre la carpeta temporal, como lo llama desplegar.sh.
compose() {
  local v="$1"
  shift
  AIPOS_VERSION="$v" docker compose --env-file "$SRV/.env" --project-directory "$SRV" \
    -f "$SRV/versiones/$v/docker-compose.produccion.yml" "$@"
}
# mysql_app <etiqueta> <argumentos del cliente mysql>: entra a MySQL con el usuario de la app, nunca con root.
mysql_app() {
  local v="$1"
  shift
  compose "$v" exec -T -e MYSQL_PWD="$(valor_env MYSQL_PASSWORD)" mysql mysql -u"$(valor_env MYSQL_USER)" "$(valor_env MYSQL_DATABASE)" "$@"
}
# desplegar <etiqueta>: corre desplegar.sh contra la carpeta temporal; deja SALIDA y CODIGO.
desplegar() {
  set +e
  SALIDA="$(AIPOS_RAIZ="$SRV" AIPOS_BAJAR_SOLO_SI_FALTA=1 bash "$RAIZ/despliegue/desplegar.sh" desplegar "$1" 2>&1)"
  CODIGO=$?
  set -e
}
# Solo toca el proyecto temporal, por su nombre exacto. Nunca down -v: el volumen se borra aparte, por nombre.
restos_del_proyecto() {
  docker ps -aq --filter "label=com.docker.compose.project=$PROYECTO" | while read -r c; do docker rm -f "$c" >/dev/null 2>&1 || true; done
  docker volume rm "${PROYECTO}_mysql_datos" >/dev/null 2>&1 || true
}
# La llama trap limpiar EXIT, no una línea del script.
# shellcheck disable=SC2329
limpiar() {
  restos_del_proyecto
  docker rmi "$IMG_B:$V1" "$IMG_B:$V2" "$IMG_F:$V1" "$IMG_F:$V2" >/dev/null 2>&1 || true
  rm -rf "$TMP"
}
trap limpiar EXIT
restos_del_proyecto

echo "# imágenes con la etiqueta $V1"
if docker build -q -t "$IMG_B:$V1" "$RAIZ/backend" >"$TMP/backend.log" 2>&1; then ok "se construye la imagen del backend"; else
  falla "no se construyó la imagen del backend"; tail -10 "$TMP/backend.log" | sed 's/^/    /'; terminar
fi
if docker build -q --build-arg VITE_API_URL=http://127.0.0.1:8140 -t "$IMG_F:$V1" "$RAIZ/frontend" >"$TMP/frontend.log" 2>&1; then
  ok "se construye la imagen de la pantalla con VITE_API_URL=http://127.0.0.1:8140"
else falla "no se construyó la imagen de la pantalla"; tail -10 "$TMP/frontend.log" | sed 's/^/    /'; terminar; fi
docker tag "$IMG_B:$V1" "$IMG_B:$V2"
docker tag "$IMG_F:$V1" "$IMG_F:$V2"
for v in "$V1" "$V2"; do
  mkdir -p "$SRV/versiones/$v"
  cp "$RAIZ/docker-compose.produccion.yml" "$SRV/versiones/$v/"
done

echo "# primer despliegue ($V1)"
desplegar "$V1"
igual "desplegar.sh termina bien" "0" "$CODIGO"
[ "$CODIGO" = 0 ] || echo "$SALIDA"
igual "version-actual dice $V1" "$V1" "$(cat "$SRV/version-actual" 2>/dev/null || echo '(no hay)')"
SALUD="$(curl -si http://127.0.0.1:8140/api/salud || true)"
tiene "GET /api/salud da 200" "$(head -1 <<<"$SALUD")" "200"
tiene "GET /api/salud dice estado ok" "$SALUD" '"estado":"ok"'
tiene "GET /api/salud dice baseDeDatos ok (el backend llega a MySQL)" "$SALUD" '"baseDeDatos":"ok"'
tiene "la pantalla responde 200" "$(curl -si http://127.0.0.1:8141/ | head -1 || true)" "200"
tiene "el backend deja pasar a la pantalla (CORS_ORIGIN)" \
  "$(curl -si -H 'Origin: http://127.0.0.1:8141' http://127.0.0.1:8140/api/salud | tr '[:upper:]' '[:lower:]')" \
  "access-control-allow-origin: http://127.0.0.1:8141"
no_tiene "el backend no deja pasar a otro origen" \
  "$(curl -si -H 'Origin: https://otro.example' http://127.0.0.1:8140/api/salud | tr '[:upper:]' '[:lower:]')" "access-control-allow-origin"
tiene "una ruta que no existe usa el formato de error de la arquitectura" "$(curl -si http://127.0.0.1:8140/api/no-existe)" '"codigo":"NO_ENCONTRADO"'
comprobar "las migraciones corrieron con el usuario de la app (existe SequelizeMeta)" mysql_app "$V1" -e 'SELECT COUNT(*) FROM SequelizeMeta'
if compose "$V1" exec -T backend printenv MYSQL_ROOT_PASSWORD >/dev/null 2>&1; then falla "el backend recibió MYSQL_ROOT_PASSWORD"; else ok "el backend no recibe MYSQL_ROOT_PASSWORD"; fi

echo "# puertos y usuarios"
PUERTOS="$(docker ps --filter "label=com.docker.compose.project=$PROYECTO" --format '{{.Names}} {{.Ports}}')"
igual "hay tres contenedores en el proyecto" "3" "$(grep -c . <<<"$PUERTOS")"
no_tiene "ningún puerto se publica en 0.0.0.0" "$PUERTOS" "0.0.0.0"
no_tiene "ningún puerto se publica en [::]" "$PUERTOS" "[::]"
tiene "MySQL se publica en 127.0.0.1:$PUERTO_MYSQL" "$PUERTOS" "127.0.0.1:$PUERTO_MYSQL->3306"
for servicio in mysql backend frontend; do
  c="$(compose "$V1" ps -q "$servicio")"
  uid="$(docker exec "$c" sh -c 'while read -r k v _; do if [ "$k" = "Uid:" ]; then echo "$v"; fi; done </proc/1/status')"
  if [ -n "$uid" ] && [ "$uid" != 0 ]; then ok "$servicio: el proceso 1 tiene uid $uid (no es root)"; else falla "$servicio: el proceso 1 corre como root o no se pudo leer su uid"; fi
done

echo "# segundo despliegue ($V2): el volumen conserva los datos"
mysql_app "$V1" -e 'CREATE TABLE IF NOT EXISTS prueba_arranque_local (id INT PRIMARY KEY); INSERT INTO prueba_arranque_local VALUES (1) ON DUPLICATE KEY UPDATE id = id' >/dev/null
VOLUMENES="$(docker volume ls -q --filter "label=com.docker.compose.project=$PROYECTO")"
tiene "el volumen se llama ${PROYECTO}_mysql_datos" "$VOLUMENES" "${PROYECTO}_mysql_datos"
desplegar "$V2"
igual "el segundo despliegue termina bien" "0" "$CODIGO"
[ "$CODIGO" = 0 ] || echo "$SALIDA"
igual "version-actual dice $V2" "$V2" "$(cat "$SRV/version-actual" 2>/dev/null || echo '(no hay)')"
igual "version-anterior dice $V1" "$V1" "$(cat "$SRV/version-anterior" 2>/dev/null || echo '(no hay)')"
igual "la tabla de la prueba sigue en el volumen después de desplegar otra vez" "1" "$(mysql_app "$V2" -N -e 'SELECT COUNT(*) FROM prueba_arranque_local' | tr -d '[:space:]')"
igual "el volumen es el mismo" "$VOLUMENES" "$(docker volume ls -q --filter "label=com.docker.compose.project=$PROYECTO")"

echo "# la misma revisión que hace el pipeline, contra 127.0.0.1"
if [ -f "$RAIZ/backend/docs/openapi.yaml" ] && [ -f "$RAIZ/despliegue/revisar-produccion.sh" ]; then
  set +e
  SALIDA="$(AIPOS_REINTENTOS=3 AIPOS_ESPERA=2 bash "$RAIZ/despliegue/revisar-produccion.sh" http://127.0.0.1:8141 http://127.0.0.1:8140 http://127.0.0.1:8141 2>&1)"
  CODIGO=$?
  set -e
  igual "revisar-produccion.sh termina bien contra el sistema local" "0" "$CODIGO"
  [ "$CODIGO" = 0 ] || echo "$SALIDA"
else
  echo "OMITIDA: revisar-produccion.sh también pide /api/docs (A-01); todavía no hay backend/docs/openapi.yaml o el script"
fi

terminar
