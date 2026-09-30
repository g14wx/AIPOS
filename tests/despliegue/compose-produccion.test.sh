#!/usr/bin/env bash
# Spec: specs/despliegue.spec.md, sección "Docker Compose de producción" y criterio 6.
# Lee docker-compose.produccion.yml con `docker compose config` y variables de mentira (sin tocar Docker ni la red) y
# revisa: los tres servicios, las imágenes, que cada puerto empiece con 127.0.0.1, MySQL 8.4, el volumen, los límites
# de memoria, la salud, los permisos, que backend no reciba MYSQL_ROOT_PASSWORD y que AIPOS_VERSION sea obligatoria.
# shellcheck source=comun.sh
source "$(dirname "${BASH_SOURCE[0]}")/comun.sh"
COMPOSE="${AIPOS_COMPOSE:-$RAIZ/docker-compose.produccion.yml}" # AIPOS_COMPOSE solo sirve para calibrar la prueba
if [ -f "$COMPOSE" ]; then ok "existe docker-compose.produccion.yml"; else falla "falta docker-compose.produccion.yml"; terminar; fi

echo "# el texto del archivo"
texto="$(cat "$COMPOSE")"
tiene "MySQL es la imagen mysql:8.4" "$texto" "image: mysql:8.4"
no_tiene "nunca mysql:latest" "$texto" "mysql:latest"
no_tiene "nunca MySQL 9" "$texto" "mysql:9"
# El texto se busca tal cual, con su $: no debe expandirse.
# shellcheck disable=SC2016
tiene "AIPOS_VERSION es obligatoria" "$texto" '${AIPOS_VERSION:?falta AIPOS_VERSION}'
no_tiene "ningún puerto en 0.0.0.0" "$texto" "0.0.0.0"
no_tiene "nada crea el esquema desde docker-entrypoint-initdb.d" "$texto" "initdb"
no_tiene "ningún contenedor privilegiado" "$texto" "privileged"
no_tiene "ningún contenedor usa la red del servidor" "$texto" "network_mode"
no_tiene "ningún servicio fija user: root" "$texto" "user: root"
no_tiene "ningún servicio fija user: \"0\"" "$texto" 'user: "0"'

command -v python3 >/dev/null || omitir "falta python3 para leer la configuración"
docker compose version >/dev/null 2>&1 || omitir "falta docker compose para leer la configuración (docker compose config)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
: >"$TMP/vacio.env" # un .env vacío: solo cuentan las variables de mentira de abajo

# compose_config [VARIABLE=valor ...]: la configuración resuelta, en JSON, con variables de mentira.
compose_config() {
  env -i PATH="$PATH" HOME="$HOME" COMPOSE_PROJECT_NAME=aipos AIPOS_VERSION=release-0.0.1 CORS_ORIGIN=https://ejemplo.test \
    MYSQL_DATABASE=aipos MYSQL_USER=aipos MYSQL_PASSWORD=clave-de-mentira MYSQL_ROOT_PASSWORD=clave-de-mentira-de-root "$@" \
    docker compose --env-file "$TMP/vacio.env" -f "$COMPOSE" config --format json
}
compose_config >"$TMP/config.json" 2>"$TMP/error.txt" || {
  falla "docker compose config no pudo leer el archivo"
  sed 's/^/    /' "$TMP/error.txt"
  terminar
}
compose_config MYSQL_PORT=3309 >"$TMP/config-3309.json"

# dato <archivo> <consulta> [servicio] [variable]: una consulta sobre el JSON, escrita en texto.
dato() {
  python3 - "$@" <<'PY'
import json, sys
c = json.load(open(sys.argv[1])); q = sys.argv[2]
s = c["services"].get(sys.argv[3], {}) if len(sys.argv) > 3 else {}
if q == "servicios": print(" ".join(sorted(c["services"])))
elif q == "imagen": print(s.get("image", ""))
elif q == "puertos": print(",".join(f'{p.get("host_ip", "")}:{p["published"]}:{p["target"]}' for p in s.get("ports", [])))
elif q == "memoria": print(s.get("mem_limit", ""))
elif q == "reinicio": print(s.get("restart", ""))
elif q == "registros": l = s.get("logging", {}); o = l.get("options", {}); print(f'{l.get("driver")} {o.get("max-size")} {o.get("max-file")}')
elif q == "cap_drop": print(" ".join(s.get("cap_drop", [])))
elif q == "security_opt": print(" ".join(s.get("security_opt", [])))
elif q == "depende": print(",".join(f"{k}:{v['condition']}" for k, v in s.get("depends_on", {}).items()))
elif q == "variables": print(" ".join(sorted(s.get("environment", {}))))
elif q == "variable": print(s.get("environment", {}).get(sys.argv[4], "(no está)"))
elif q == "salud": print(" ".join(s.get("healthcheck", {}).get("test", [])))
elif q == "volumen-declarado": print(c.get("volumes", {}).get("mysql_datos", {}).get("name", "(no está)"))
elif q == "volumen-de": print(",".join(v["source"] + ":" + v["target"] for v in s.get("volumes", [])))
elif q == "usuario": print(s.get("user", ""))
elif q == "comando": print(" ".join(s.get("command") or []))
PY
}
J="$TMP/config.json"

echo "# servicios, imágenes y puertos"
igual "tres servicios: backend, frontend y mysql" "backend frontend mysql" "$(dato "$J" servicios)"
igual "mysql usa mysql:8.4" "mysql:8.4" "$(dato "$J" imagen mysql)"
igual "backend usa la imagen de ghcr.io con la etiqueta de AIPOS_VERSION" "ghcr.io/g14wx/aipos-backend:release-0.0.1" "$(dato "$J" imagen backend)"
igual "frontend usa la imagen de ghcr.io con la etiqueta de AIPOS_VERSION" "ghcr.io/g14wx/aipos-frontend:release-0.0.1" "$(dato "$J" imagen frontend)"
igual "mysql publica solo en 127.0.0.1 (3306 por defecto)" "127.0.0.1:3306:3306" "$(dato "$J" puertos mysql)"
igual "MYSQL_PORT cambia el puerto del host de mysql, sin salir de 127.0.0.1" "127.0.0.1:3309:3306" "$(dato "$TMP/config-3309.json" puertos mysql)"
igual "backend publica 127.0.0.1:8140 hacia el 3000" "127.0.0.1:8140:3000" "$(dato "$J" puertos backend)"
igual "frontend publica 127.0.0.1:8141 hacia el 8080" "127.0.0.1:8141:8080" "$(dato "$J" puertos frontend)"

echo "# volumen, salud y orden de arranque"
igual "el volumen de MySQL se llama aipos_mysql_datos en el proyecto aipos" "aipos_mysql_datos" "$(dato "$J" volumen-declarado)"
igual "mysql guarda sus datos en ese volumen" "mysql_datos:/var/lib/mysql" "$(dato "$J" volumen-de mysql)"
tiene "mysql tiene healthcheck con mysqladmin ping" "$(dato "$J" salud mysql)" "mysqladmin ping"
igual "backend espera a que mysql esté sano" "mysql:service_healthy" "$(dato "$J" depende backend)"
COMANDO_MYSQL="$(dato "$J" comando mysql)"
tiene "mysql usa utf8mb4 (como el compose de desarrollo)" "$COMANDO_MYSQL" "--character-set-server=utf8mb4"
tiene "mysql usa el orden utf8mb4_0900_ai_ci" "$COMANDO_MYSQL" "--collation-server=utf8mb4_0900_ai_ci"
tiene "mysql guarda la hora en UTC (RN-12)" "$COMANDO_MYSQL" "--default-time-zone=+00:00"

echo "# límites, reinicio y registros"
igual "mysql tiene mem_limit de 1g" "1073741824" "$(dato "$J" memoria mysql)"
igual "backend tiene mem_limit de 384m" "402653184" "$(dato "$J" memoria backend)"
igual "frontend tiene mem_limit de 128m" "134217728" "$(dato "$J" memoria frontend)"
for s in mysql backend frontend; do
  igual "$s: restart unless-stopped" "unless-stopped" "$(dato "$J" reinicio "$s")"
  igual "$s: registros json-file de 10m y 3 archivos" "json-file 10m 3" "$(dato "$J" registros "$s")"
done

echo "# sin privilegios"
for s in backend frontend; do
  igual "$s: cap_drop ALL" "ALL" "$(dato "$J" cap_drop "$s")"
  igual "$s: no-new-privileges" "no-new-privileges:true" "$(dato "$J" security_opt "$s")"
done
for s in mysql backend frontend; do
  igual "$s: no fija un usuario root" "" "$(dato "$J" usuario "$s" | grep -E '^(root|0)(:|$)' || true)"
done

echo "# variables de entorno"
igual "mysql lee las cuatro variables de MySQL" "MYSQL_DATABASE MYSQL_PASSWORD MYSQL_ROOT_PASSWORD MYSQL_USER" "$(dato "$J" variables mysql)"
igual "backend recibe solo lo que usa, sin MYSQL_ROOT_PASSWORD" \
  "CORS_ORIGIN MYSQL_DATABASE MYSQL_HOST MYSQL_PASSWORD MYSQL_PORT MYSQL_USER NODE_ENV PORT" "$(dato "$J" variables backend)"
igual "backend: NODE_ENV=production" "production" "$(dato "$J" variable backend NODE_ENV)"
igual "backend: PORT=3000" "3000" "$(dato "$J" variable backend PORT)"
igual "backend: MYSQL_HOST=mysql (la red interna de Docker)" "mysql" "$(dato "$J" variable backend MYSQL_HOST)"
igual "backend: MYSQL_PORT=3306 dentro de Docker, aunque el host use otro" "3306" "$(dato "$TMP/config-3309.json" variable backend MYSQL_PORT)"
igual "backend: CORS_ORIGIN viene del .env" "https://ejemplo.test" "$(dato "$J" variable backend CORS_ORIGIN)"
igual "frontend no recibe variables de entorno (VITE_API_URL se graba al construir)" "" "$(dato "$J" variables frontend)"

echo "# AIPOS_VERSION es obligatoria"
sin_version="$(env -i PATH="$PATH" HOME="$HOME" MYSQL_PASSWORD=clave-de-mentira docker compose --env-file "$TMP/vacio.env" -f "$COMPOSE" config 2>&1 || true)"
tiene "sin AIPOS_VERSION, docker compose se niega y dice por qué" "$sin_version" "falta AIPOS_VERSION"

terminar
