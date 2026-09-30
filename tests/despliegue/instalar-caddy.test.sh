#!/usr/bin/env bash
# Spec: specs/despliegue.spec.md, sección "Caddy" (despliegue/instalar-caddy.sh) y criterios 7 y 9.
# El script corre con `caddy`, `systemctl` y `curl` de mentira al inicio del PATH y con CADDY_DIR en una carpeta
# temporal (en el servidor es /etc/caddy). Comprueba, en orden: respaldo, código HTTP de cada sitio, copia de los dos
# archivos de AIPOS, `caddy validate`, `systemctl reload caddy` (nunca restart) y la comparación final.
# Interfaz que fija esta prueba: CADDY_DIR (carpeta de Caddy) y AIPOS_RESPALDOS (dónde guarda el respaldo).
# shellcheck source=comun.sh disable=SC2015
source "$(dirname "${BASH_SOURCE[0]}")/comun.sh"
SCRIPT="$RAIZ/despliegue/instalar-caddy.sh"
if [ -f "$SCRIPT" ]; then ok "existe despliegue/instalar-caddy.sh"; else falla "falta despliegue/instalar-caddy.sh"; terminar; fi
for f in aipos.caddy aipos-back.caddy; do
  if [ -f "$RAIZ/despliegue/caddy/$f" ]; then ok "existe despliegue/caddy/$f"; else falla "falta despliegue/caddy/$f"; fi
done
[ "$FALLAS" -eq 0 ] || terminar

TMP=""
BIN=""
REGISTRO=""
armar() {
  if [ -n "$TMP" ]; then rm -rf "$TMP"; fi
  TMP="$(mktemp -d)"
  trap 'rm -rf "$TMP"' EXIT
  BIN="$TMP/bin"
  REGISTRO="$TMP/registro.log"
  CADDY_DIR="$TMP/etc-caddy"
  AIPOS_RESPALDOS="$TMP/respaldos"
  CODIGOS="$TMP/codigos"
  mkdir -p "$BIN" "$CADDY_DIR/conf.d" "$AIPOS_RESPALDOS" "$CODIGOS"
  : >"$REGISTRO"
  printf 'import /etc/caddy/conf.d/*.caddy\n' >"$CADDY_DIR/Caddyfile"
  printf 'vecino.example.com {\n\treverse_proxy 127.0.0.1:9000\n}\n' >"$CADDY_DIR/conf.d/vecino.caddy"
  printf 'otro.example.com {\n\troot * /var/www\n\tfile_server\n}\n' >"$CADDY_DIR/conf.d/otro.caddy"
  echo 200 >"$CODIGOS/vecino.example.com"
  echo 301 >"$CODIGOS/otro.example.com"
  cat >"$BIN/caddy" <<'EOF'
#!/usr/bin/env bash
echo "caddy $*" >>"$REGISTRO"
if [ "${1:-}" = validate ]; then
  if [ -e "$CADDY_DIR/conf.d/aipos.caddy" ]; then echo "caddy validate: aipos presentes" >>"$REGISTRO"; fi
  [ "${CADDY_FALLA:-0}" = 1 ] && { echo "caddy de mentira: configuración inválida" >&2; exit 1; }
fi
exit 0
EOF
  cat >"$BIN/systemctl" <<'EOF'
#!/usr/bin/env bash
echo "systemctl $*" >>"$REGISTRO"
if [ "${1:-}" = reload ] && [ "${CAMBIA_VECINO:-0}" = 1 ]; then echo 502 >"$CODIGOS/vecino.example.com"; fi
exit 0
EOF
  cat >"$BIN/curl" <<'EOF'
#!/usr/bin/env bash
url=""
for a in "$@"; do case "$a" in http://* | https://*) url="$a" ;; esac; done
sitio="${url#*://}"
sitio="${sitio%%/*}"
echo "curl $sitio" >>"$REGISTRO"
[ -f "$CODIGOS/$sitio" ] || { printf '000'; exit 7; }
case " $* " in *"http_code"*) printf '%s' "$(cat "$CODIGOS/$sitio")" ;; *) echo "respuesta de $sitio" ;; esac
exit 0
EOF
  chmod +x "$BIN/caddy" "$BIN/systemctl" "$BIN/curl"
  export REGISTRO CADDY_DIR AIPOS_RESPALDOS CODIGOS
  unset CADDY_FALLA CAMBIA_VECINO
  PATH="$BIN:$PATH"
  export PATH
}

correr_script() {
  set +e
  SALIDA="$(bash "$SCRIPT" 2>&1)"
  CODIGO=$?
  set -e
}

linea() { grep -nF -- "$1" "$REGISTRO" | head -1 | cut -d: -f1 || true; }
lista_conf() { (cd "$CADDY_DIR/conf.d" && ls | tr '\n' ' '); }

# --- 1. Todo válido -------------------------------------------------------------------------------------------
echo "# caso: la configuración es válida"
armar
suma_caddyfile="$(suma "$CADDY_DIR/Caddyfile")"
suma_vecino="$(suma "$CADDY_DIR/conf.d/vecino.caddy")"
suma_otro="$(suma "$CADDY_DIR/conf.d/otro.caddy")"
correr_script
igual "termina bien" "0" "$CODIGO"
[ "$CODIGO" = 0 ] || echo "$SALIDA"
comprobar "copia aipos.caddy a conf.d" cmp -s "$RAIZ/despliegue/caddy/aipos.caddy" "$CADDY_DIR/conf.d/aipos.caddy"
comprobar "copia aipos-back.caddy a conf.d" cmp -s "$RAIZ/despliegue/caddy/aipos-back.caddy" "$CADDY_DIR/conf.d/aipos-back.caddy"
igual "no cambia el Caddyfile" "$suma_caddyfile" "$(suma "$CADDY_DIR/Caddyfile")"
igual "no cambia el archivo de otro sitio (vecino)" "$suma_vecino" "$(suma "$CADDY_DIR/conf.d/vecino.caddy")"
igual "no cambia el archivo de otro sitio (otro)" "$suma_otro" "$(suma "$CADDY_DIR/conf.d/otro.caddy")"
registro="$(cat "$REGISTRO")"
tiene "valida con el Caddyfile de CADDY_DIR" "$registro" "caddy validate --config $CADDY_DIR/Caddyfile"
tiene "valida con los archivos de AIPOS ya copiados" "$registro" "caddy validate: aipos presentes"
tiene "recarga Caddy con systemctl reload caddy" "$registro" "systemctl reload caddy"
no_tiene "nunca reinicia Caddy" "$registro" "systemctl restart"
no_tiene "nunca detiene Caddy" "$registro" "systemctl stop"
igual "recarga una sola vez" "1" "$(grep -cF 'systemctl reload caddy' "$REGISTRO")"
if [ "$(linea 'caddy validate --config')" -lt "$(linea 'systemctl reload caddy')" ] 2>/dev/null; then
  ok "valida antes de recargar"
else
  falla "valida antes de recargar"
fi
tiene "anota el código de un sitio que ya servía Caddy (vecino)" "$registro" "curl vecino.example.com"
tiene "anota el código de un sitio que ya servía Caddy (otro)" "$registro" "curl otro.example.com"
if [ "$(linea 'curl vecino.example.com')" -lt "$(linea 'systemctl reload caddy')" ] 2>/dev/null; then
  ok "anota los códigos antes de recargar"
else
  falla "anota los códigos antes de recargar"
fi
if [ "$(grep -cF 'curl vecino.example.com' "$REGISTRO")" -ge 2 ]; then
  ok "vuelve a pedir el sitio después de recargar"
else
  falla "vuelve a pedir el sitio después de recargar"
fi
no_tiene "no avisa cambios si nada cambió" "$SALIDA" "cambió"
respaldos="$(find "$AIPOS_RESPALDOS" -type f | wc -l | tr -d ' ')"
if [ "$respaldos" -ge 3 ]; then ok "guarda respaldo del Caddyfile y de conf.d ($respaldos archivos)"; else falla "guarda respaldo del Caddyfile y de conf.d (hay $respaldos archivos)"; fi
comprobar "el respaldo tiene una copia del Caddyfile" bash -c "find '$AIPOS_RESPALDOS' -type f -name Caddyfile | grep -q ."
comprobar "el respaldo tiene una copia de los otros sitios" bash -c "find '$AIPOS_RESPALDOS' -type f -name vecino.caddy | grep -q ."

# --- 2. Se puede correr otra vez -------------------------------------------------------------------------------
echo "# caso: correr otra vez"
: >"$REGISTRO"
correr_script
igual "la segunda vez también termina bien" "0" "$CODIGO"
comprobar "el archivo de AIPOS sigue igual al de despliegue/caddy" cmp -s "$RAIZ/despliegue/caddy/aipos.caddy" "$CADDY_DIR/conf.d/aipos.caddy"

# --- 3. caddy validate falla (criterio 9) --------------------------------------------------------------------
echo "# caso: caddy validate falla"
armar
suma_caddyfile="$(suma "$CADDY_DIR/Caddyfile")"
suma_vecino="$(suma "$CADDY_DIR/conf.d/vecino.caddy")"
export CADDY_FALLA=1
correr_script
[ "$CODIGO" != 0 ] && ok "termina con error" || falla "termina con error"
registro="$(cat "$REGISTRO")"
tiene "sí intentó validar" "$registro" "caddy validate"
no_tiene "no recarga Caddy" "$registro" "systemctl reload"
no_tiene "no reinicia Caddy" "$registro" "systemctl restart"
comprobar "borra aipos.caddy" test ! -e "$CADDY_DIR/conf.d/aipos.caddy"
comprobar "borra aipos-back.caddy" test ! -e "$CADDY_DIR/conf.d/aipos-back.caddy"
igual "deja conf.d como estaba" "otro.caddy vecino.caddy " "$(lista_conf)"
igual "deja el Caddyfile como estaba" "$suma_caddyfile" "$(suma "$CADDY_DIR/Caddyfile")"
igual "deja el archivo del vecino como estaba" "$suma_vecino" "$(suma "$CADDY_DIR/conf.d/vecino.caddy")"
tiene "el mensaje dice que falló la validación" "$SALIDA" "inválid"

# --- 4. Un vecino cambia de código HTTP -----------------------------------------------------------------------
echo "# caso: un vecino cambia de código"
armar
export CAMBIA_VECINO=1
correr_script
tiene "avisa con el nombre del sitio que cambió" "$SALIDA" "vecino.example.com"
no_tiene "no acusa a un sitio que no cambió" "$SALIDA" "otro.example.com"

# --- 5. Lo que el script nunca escribe -------------------------------------------------------------------------
echo "# caso: lectura del script"
contenido="$(cat "$SCRIPT")"
no_tiene "el script no reinicia Caddy" "$contenido" "systemctl restart"
no_tiene "el script no usa service caddy restart" "$contenido" "service caddy restart"
no_tiene "el script no toca el firewall (ufw)" "$contenido" "ufw"
comprobar "el script empieza con set -euo pipefail" grep -q '^set -euo pipefail' "$SCRIPT"
if command -v shellcheck >/dev/null 2>&1; then
  comprobar "shellcheck sin advertencias" shellcheck "$SCRIPT"
else
  echo "aviso: shellcheck no está instalado, se omite esa revisión"
fi

terminar
