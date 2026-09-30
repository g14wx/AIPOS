#!/usr/bin/env bash
# Tarjeta E-02: README de la entrega. No hay spec (es documentación): mandan la tarjeta, RNF-11
# (requerimientos/03-requerimientos-no-funcionales.md) y la skill readme-entrega
# (tessl-plugins/entrega-trazable/skills/readme-entrega/SKILL.md).
# Comprueba que README.md tenga los 12 puntos (un título por punto, en orden y sin otros títulos de nivel 2), que no
# diga «único agente», que las versiones que nombra sean las instaladas (package-lock.json, .nvmrc y
# docker-compose.yml), que nombre el archivo SQL del procedimiento almacenado, la migración que lo crea y la función
# del servicio que lo llama, que los archivos y los comandos que nombra existan, y que diga lo que agregamos y lo que
# no se completó.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

README=README.md
fallas=0
falla() {
  echo "FALLA: $1"
  fallas=$((fallas + 1))
}
ok() { echo "ok: $1"; }

[ -f "$README" ] || { echo "FALLA: falta $README"; exit 1; }

# El README sin sus bloques de código: un "## comentario" dentro de un bloque no es un título.
sin_bloques() { awk '/^```/ { dentro = !dentro; next } !dentro' "$README"; }

# Lo que hay dentro del punto N: desde su título "## N. ..." hasta el siguiente título de nivel 2.
punto() {
  awk -v n="$1" '
    /^```/ { bloque = !bloque }
    !bloque && /^## / { en = ($0 ~ "^## " n "\\. "); next }
    en' "$README"
}

# La celda número $2 (1 es la primera) de la fila de tabla $1, sin espacios ni comillas invertidas.
celda() {
  awk -F'|' -v k="$2" '{ c = $(k + 1); gsub(/`/, "", c); gsub(/^[ \t]+|[ \t]+$/, "", c); print c }' <<<"$1"
}

# Que el valor real sea igual al esperado.
igual() { # descripción, esperado, real
  if [ "$2" = "$3" ]; then ok "$1"; else falla "$1 (esperado '$2', el README dice '$3')"; fi
}

echo "# los 12 puntos de la skill readme-entrega"
TITULOS=(
  "Funcionalidades"
  "Tecnologías y versiones"
  "Estructura"
  "Cumplimiento de requisitos"
  "Instalación y ejecución"
  "Base de datos MySQL"
  "Procedimiento almacenado"
  "Tiempo"
  "Herramientas de IA"
  "Cómo se usó el agente"
  "Decisiones técnicas"
  "Consideraciones"
)
esperados=""
n=1
for titulo in "${TITULOS[@]}"; do
  esperados+="## $n. $titulo"$'\n'
  cantidad="$(sin_bloques | grep -c -x -F "## $n. $titulo" || true)"
  if [ "$cantidad" -eq 1 ]; then ok "hay un título «## $n. ${titulo}»"; else falla "el README tiene $cantidad títulos «## $n. ${titulo}» y tiene que tener uno"; fi
  if [ "$(punto "$n" | grep -c '[^[:space:]]' || true)" -ge 3 ]; then ok "el punto $n tiene contenido"; else falla "el punto $n está vacío o tiene menos de 3 líneas"; fi
  n=$((n + 1))
done
reales="$(sin_bloques | grep '^## ' || true)"
if [ "$reales" = "${esperados%$'\n'}" ]; then
  ok "los títulos de nivel 2 son los 12 puntos, en orden y sin otros"
else
  falla "los títulos de nivel 2 no son exactamente los 12 puntos en orden (los demás títulos van con ###)"
  echo "    hay: $(tr '\n' '|' <<<"$reales")"
fi
if [ "$(head -1 "$README")" = "# AIPOS" ]; then ok "el README empieza con el título «# AIPOS»"; else falla "la primera línea del README no es «# AIPOS»"; fi

echo "# quién revisó: nada de «único agente»"
if grep -qiE 'únic[oa] agente|un solo agente|solo un agente' "$README"; then
  falla "el README dice que hubo un único agente: Codex también revisó los PR"
else
  ok "el README no dice «único agente»"
fi
for punto_del_agente in 9 10; do
  if punto "$punto_del_agente" | grep -q 'Codex'; then ok "el punto $punto_del_agente nombra a Codex"; else falla "el punto $punto_del_agente no nombra a Codex (el agente revisor)"; fi
done

echo "# versiones: las instaladas, no las de memoria"
# La versión instalada de un paquete en un package-lock.json (lockfileVersion 3): la línea "version" que sigue a su llave.
version_en_lock() { # archivo, paquete
  awk -v llave="\"node_modules/$2\": {" 'index($0, llave) { dentro = 1; next } dentro && /"version":/ { gsub(/[",]/, "", $2); print $2; exit }' "$1"
}
# La versión que el README pone en la tabla del punto 2: la fila cuya celda «Tecnología» es $1, y su celda «Versión».
version_del_readme() { # tecnología
  punto 2 | awk -F'|' -v tec="$1" '
    function recortar(t) { gsub(/`/, "", t); gsub(/^[ \t]+|[ \t]+$/, "", t); return t }
    /^\|/ && recortar($3) == tec { print recortar($4); exit }'
}
comprobar_version() { # tecnología, versión esperada, dónde se lee
  if [ -z "$2" ]; then falla "no pude leer la versión de $1 en $3"; return; fi
  igual "$1 ${2} (de $3)" "$2" "$(version_del_readme "$1")"
}
node_nvmrc="$(tr -d '[:space:]v' <.nvmrc)"
mysql_compose="$(sed -n 's/^[[:space:]]*image:[[:space:]]*mysql:\([^[:space:]]*\).*/\1/p' docker-compose.yml | head -1)"
comprobar_version "Node.js" "$node_nvmrc" ".nvmrc"
comprobar_version "Vue" "$(version_en_lock frontend/package-lock.json vue)" "frontend/package-lock.json"
comprobar_version "Vuetify" "$(version_en_lock frontend/package-lock.json vuetify)" "frontend/package-lock.json"
comprobar_version "Vite" "$(version_en_lock frontend/package-lock.json vite)" "frontend/package-lock.json"
comprobar_version "Axios" "$(version_en_lock frontend/package-lock.json axios)" "frontend/package-lock.json"
comprobar_version "Express" "$(version_en_lock backend/package-lock.json express)" "backend/package-lock.json"
comprobar_version "Sequelize" "$(version_en_lock backend/package-lock.json sequelize)" "backend/package-lock.json"
comprobar_version "mysql2" "$(version_en_lock backend/package-lock.json mysql2)" "backend/package-lock.json"
comprobar_version "MySQL" "$mysql_compose" "docker-compose.yml"
if grep -qiE '\blatest\b' <(punto 2); then falla "el punto 2 habla de «latest»: las versiones van fijas"; else ok "el punto 2 no usa «latest»"; fi

echo "# el procedimiento almacenado (punto 7): archivo SQL, migración y quién lo llama"
archivo_sql=backend/db/procedimientos/sp_registrar_venta.sql
migracion="$(find backend/db/migrations -name '*-crear-sp-registrar-venta.js' 2>/dev/null | head -1 || true)"
servicio="$(grep -rl 'CALL sp_registrar_venta' backend/src 2>/dev/null | head -1 || true)"
funcion=""
if [ -n "$servicio" ]; then
  # La función que contiene el CALL: la última "function nombre" que aparece antes de esa línea.
  funcion="$(awk '/^(async )?function [A-Za-z_]+/ { f = $0; sub(/^(async )?function /, "", f); sub(/\(.*/, "", f) } /CALL sp_registrar_venta/ { print f; exit }' "$servicio")"
fi
if [ -f "$archivo_sql" ]; then ok "existe $archivo_sql"; else falla "falta $archivo_sql"; fi
if [ -n "$migracion" ]; then ok "existe la migración $migracion"; else falla "no hay una migración *-crear-sp-registrar-venta.js"; fi
if [ -n "$servicio" ] && [ -n "$funcion" ]; then ok "$servicio, función $funcion, llama a sp_registrar_venta"; else falla "ningún archivo de backend/src llama a sp_registrar_venta"; fi
siete="$(punto 7)"
for texto in "sp_registrar_venta" "$archivo_sql" "$migracion" "$servicio" "$funcion" "npm run migrar" "POST /api/ventas"; do
  if [ -z "$texto" ]; then continue; fi
  if grep -qF -- "$texto" <<<"$siete"; then ok "el punto 7 nombra $texto"; else falla "el punto 7 no nombra $texto"; fi
done
for etiqueta in "Nombre" "Objetivo" "Archivo SQL" "Cómo se crea" "Dónde se usa"; do
  if grep -qE "^- \*\*$etiqueta:\*\*" <<<"$siete"; then ok "el punto 7 tiene «${etiqueta}»"; else falla "el punto 7 no tiene «- **$etiqueta:**»"; fi
done

echo "# las dos URL desplegadas y la documentación de la API"
if grep -qE 'https://aipos\.salsalvador\.io($|[^A-Za-z0-9.-])' "$README"; then ok "el README nombra la pantalla: https://aipos.salsalvador.io"; else falla "el README no nombra https://aipos.salsalvador.io"; fi
if grep -qE 'https://aipos-back\.salsalvador\.io($|[^/A-Za-z0-9.-])' "$README"; then ok "el README nombra la API: https://aipos-back.salsalvador.io"; else falla "el README no nombra https://aipos-back.salsalvador.io"; fi
if grep -qF 'https://aipos-back.salsalvador.io/api/docs' "$README"; then ok "el README nombra la documentación de la API: /api/docs"; else falla "el README no nombra https://aipos-back.salsalvador.io/api/docs"; fi

echo "# lo que agregamos y lo que no se completó (punto 4)"
# Lo que hay bajo un título ### del punto $1 que empieza con $2.
subseccion() {
  punto "$1" | awk -v t="### $2" 'index($0, t) == 1 { en = 1; next } /^### / { en = 0 } en'
}
agregado="$(subseccion 4 'Lo que agregamos')"
if [ -n "$agregado" ]; then ok "el punto 4 tiene «### Lo que agregamos…»"; else falla "el punto 4 no tiene un título «### Lo que agregamos…» con contenido"; fi
for texto in 'Swagger UI' 'release-' 'localStorage' '100 detalles'; do
  if grep -qF -- "$texto" <<<"$agregado"; then ok "lo que agregamos dice $texto"; else falla "lo que agregamos no dice $texto"; fi
done
pendiente="$(subseccion 4 'Lo que no se completó')"
if [ "$(grep -c '[^[:space:]]' <<<"$pendiente" || true)" -ge 3 ]; then ok "el punto 4 dice lo que no se completó"; else falla "el punto 4 no tiene «### Lo que no se completó» con al menos 3 líneas"; fi

echo "# cumplimiento: cada requerimiento funcional y un estado honesto"
cuatro="$(punto 4)"
while IFS= read -r rf; do
  if grep -qF -- "$rf" <<<"$cuatro"; then ok "el punto 4 nombra $rf"; else falla "el punto 4 no nombra $rf"; fi
done < <(grep -o '^| \[RF-[0-9][0-9]*\]' requerimientos/02-requerimientos-funcionales.md | grep -o 'RF-[0-9]*')
tabla_cuatro="$(awk '/^### / { exit } 1' <<<"$cuatro")"
filas_cuatro="$(grep '^|' <<<"$tabla_cuatro" | grep -v '^|[-| :]*$' | tail -n +2 || true)"
estados_malos=0
while IFS= read -r fila; do
  [ -z "$fila" ] && continue
  case "$(celda "$fila" 2)" in Cumplido | Parcial | "No completado") ;; *) estados_malos=$((estados_malos + 1)); echo "    estado que no vale: $(celda "$fila" 2)" ;; esac
done <<<"$filas_cuatro"
if [ -z "$filas_cuatro" ]; then falla "el punto 4 no tiene su tabla de requisitos"; elif [ "$estados_malos" -eq 0 ]; then ok "todos los estados son Cumplido, Parcial o No completado"; else falla "$estados_malos estado(s) no son Cumplido, Parcial ni No completado"; fi

echo "# tiempo, uso del agente y decisiones salen de la bitácora"
for p in 8 10; do
  if punto "$p" | grep -qF 'docs/bitacora-ia.md'; then ok "el punto $p enlaza docs/bitacora-ia.md"; else falla "el punto $p no enlaza docs/bitacora-ia.md"; fi
done
filas_once="$(punto 11 | grep '^|' | grep -v '^|[-| :]*$' | tail -n +2 || true)"
total_once=0
con_propuesta=0
incompletas=0
while IFS= read -r fila; do
  [ -z "$fila" ] && continue
  total_once=$((total_once + 1))
  if [ -z "$(celda "$fila" 1)" ] || [ -z "$(celda "$fila" 2)" ] || [ -z "$(celda "$fila" 3)" ]; then incompletas=$((incompletas + 1)); fi
  case "$(celda "$fila" 2)" in "—" | "-" | "") ;; *) con_propuesta=$((con_propuesta + 1)) ;; esac
done <<<"$filas_once"
if [ "$total_once" -ge 5 ]; then ok "el punto 11 tiene $total_once decisiones"; else falla "el punto 11 tiene $total_once decisiones y tiene que tener al menos 5"; fi
if [ "$incompletas" -eq 0 ]; then ok "cada decisión dice su propuesta original (o —) y su motivo"; else falla "$incompletas decisión(es) del punto 11 tienen una celda vacía"; fi
if [ "$con_propuesta" -ge 1 ]; then ok "hay $con_propuesta propuesta(s) del agente que se cambiaron o descartaron, con su motivo"; else falla "el punto 11 no trae ninguna propuesta del agente que se cambió o descartó"; fi

echo "# tiempo: el punto 8 copia el resumen de la bitácora"
bitacora=docs/bitacora-ia.md
# Las filas de la tabla «Por entregable» del Resumen de la bitácora, tal cual.
filas_bitacora="$(awk '/^### Por entregable/ { en = 1; next } /^### / { en = 0 } en && /^\|/' "$bitacora")"
if [ -z "$filas_bitacora" ]; then falla "no encontré la tabla «Por entregable» en $bitacora"; fi
while IFS= read -r fila; do
  [ -z "$fila" ] && continue
  if punto 8 | grep -qxF -- "$fila"; then ok "el punto 8 trae la fila «$(celda "$fila" 1)» de la bitácora"; else falla "el punto 8 no trae, tal cual, la fila de la bitácora: $fila"; fi
done <<<"$filas_bitacora"
for duracion in '26 h 39 min' '33 h 30 min' '56 h 25 min'; do
  if grep -qF -- "$duracion" "$bitacora" && punto 8 | grep -qF -- "$duracion"; then ok "$duracion está en la bitácora y en el punto 8"; else falla "$duracion no está en los dos: la bitácora y el punto 8"; fi
done

echo "# sin marcas pendientes"
if grep -nE 'se completa con E-01|llegan? con F-01' "$README"; then
  falla "el README todavía tiene marcas pendientes (están arriba, con su línea)"
else
  ok "el README no tiene marcas «se completa con E-01» ni «llega con F-01»"
fi

echo "# los archivos, los enlaces y los comandos que nombra existen"
# Se revisan los nombres entre comillas invertidas que empiezan con una carpeta del repositorio (y unos pocos archivos de
# la raíz). Una línea que dice «llega con F-01» o «llegan con F-01» nombra archivos de una tarjeta que todavía no se integra.
RAICES='backend|frontend|docs|specs|tests|requerimientos|despliegue|tessl-plugins|\.github|\.githooks|graphify-out'
SUELTOS=' .env.example .nvmrc docker-compose.yml docker-compose.produccion.yml AGENTS.md CLAUDE.md tessl.json PRODUCT.md '
inexistentes=""
while IFS= read -r linea; do
  case "$linea" in *"llega con F-01"* | *"llegan con F-01"*) continue ;; esac
  # shellcheck disable=SC2016  # las comillas invertidas son lo que se busca, no una sustitución
  while IFS= read -r trozo; do
    ruta="$(sed -E 's/`//g; s/:[0-9]+(-[0-9]+)?$//' <<<"$trozo")"
    if grep -qE "^($RAICES)/[A-Za-z0-9_./-]+$" <<<"$ruta" || [[ "$SUELTOS" == *" $ruta "* ]]; then
      [ -e "${ruta%/}" ] || inexistentes+="$ruta "
    fi
  done < <(grep -o '`[^`]*`' <<<"$linea" || true)
done < <(sin_bloques)
while IFS= read -r destino; do
  destino="${destino#\](}"
  destino="${destino%)}"
  destino="${destino%%#*}"
  case "$destino" in "" | http* | mailto:*) continue ;; esac
  [ -e "$destino" ] || inexistentes+="$destino "
done < <(sin_bloques | grep -o '\]([^)]*)' || true)
if [ -z "$inexistentes" ]; then ok "todos los archivos y enlaces que el README nombra existen"; else falla "el README nombra archivos que no existen: $inexistentes"; fi
while IFS= read -r script; do
  if grep -qF "\"$script\":" backend/package.json frontend/package.json; then ok "existe el script npm run $script"; else falla "el README nombra npm run $script y ningún package.json lo tiene"; fi
done < <(grep -o 'npm run [a-z:-]*' "$README" | awk '{ print $3 }' | sort -u)
cinco="$(punto 5)"
for comando in 'cp .env.example .env' 'docker compose up -d --wait mysql' 'npm ci' 'npm run migrar' 'npm start' 'npm run dev'; do
  if grep -qF -- "$comando" <<<"$cinco"; then ok "el punto 5 trae el comando $comando"; else falla "el punto 5 no trae el comando $comando"; fi
done

echo "# palabras que el glosario no deja"
# carrito, checkout, deployar, rollback, servidor en vivo, doc de la API, board, card y prod; «Swagger» solo se dice con UI.
if sin_bloques | grep -nE '\b(carrito|checkout|deployar|rollback|board|card|prod)\b|servidor en vivo|doc de la API|Swagger([^ -]| [^U]|$)'; then
  falla "el README usa una palabra que el glosario no deja (está arriba, con su línea)"
else
  ok "el README no usa palabras que el glosario no deja"
fi

if [ "$fallas" -gt 0 ]; then
  echo "$fallas falla(s)"
  exit 1
fi
echo "todo bien"
