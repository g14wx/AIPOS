#!/usr/bin/env bash
# Instala los dos bloques de Caddy de AIPOS sin romper los otros sitios que ya sirve el mismo Caddy.
# Spec: specs/despliegue.spec.md, sección "Caddy".
#
#   sudo bash instalar-caddy.sh        (los dos archivos están en la carpeta caddy/, junto a este script)
#
# Un archivo inválido en conf.d no rompe solo su sitio: invalida toda la configuración de Caddy, y todos los otros
# sitios caen en el siguiente reinicio del servicio. Por eso este script hace siempre lo mismo, en este orden:
#   1. guarda una copia de respaldo del Caddyfile y de conf.d;
#   2. anota qué código HTTP da cada sitio que ya sirve Caddy;
#   3. copia los dos archivos de AIPOS a conf.d;
#   4. corre `caddy validate`; si falla, deja conf.d como estaba y termina con error, SIN recargar;
#   5. recarga con `systemctl reload caddy` (nunca restart);
#   6. vuelve a pedir cada sitio y avisa, con su nombre, los que cambiaron de código.
# Nunca edita el archivo de otro sitio ni el Caddyfile. CADDY_DIR (/etc/caddy) y AIPOS_RESPALDOS
# (/var/backups/aipos-caddy) se pueden cambiar para las pruebas.
set -euo pipefail

CADDY_DIR="${CADDY_DIR:-/etc/caddy}"
RESPALDOS="${AIPOS_RESPALDOS:-/var/backups/aipos-caddy}"
ESPERA="${AIPOS_ESPERA_CADDY:-1}"
ORIGEN="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/caddy"
ARCHIVOS="aipos.caddy aipos-back.caddy"

fallar() {
  echo "ERROR: $*" >&2
  exit 1
}

[ -f "$CADDY_DIR/Caddyfile" ] || fallar "no encuentro $CADDY_DIR/Caddyfile"
[ -d "$CADDY_DIR/conf.d" ] || fallar "no encuentro la carpeta $CADDY_DIR/conf.d"
[ -w "$CADDY_DIR/conf.d" ] || fallar "no puedo escribir en $CADDY_DIR/conf.d: corre este script con sudo"
for f in $ARCHIVOS; do [ -f "$ORIGEN/$f" ] || fallar "falta $ORIGEN/$f"; done

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# sitios: los dominios que sirven los archivos de conf.d, menos los de AIPOS. Una línea abre un sitio cuando empieza
# en la columna 0 y termina en `{`; se ignoran los bloques globales `{`, los fragmentos `(nombre)` y los comodines.
sitios() {
  local f
  for f in "$CADDY_DIR"/conf.d/*.caddy; do
    [ -f "$f" ] || continue
    case "${f##*/}" in aipos.caddy | aipos-back.caddy) continue ;; esac
    grep -E '^[^[:space:]#{(}][^{]*\{[[:space:]]*$' "$f" | sed 's/{[[:space:]]*$//' | tr ',' ' ' | tr -s ' ' '\n' |
      sed -e 's#^https\{0,1\}://##' -e 's#/.*$##' | grep -E '^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$' || true
  done | sort -u
}

# codigos <archivo de salida>: pide cada sitio a este mismo servidor (con --resolve, sin depender del DNS) y anota
# "sitio código". Un fallo de red da 000.
codigos() {
  local sitio codigo
  : >"$1"
  while read -r sitio; do
    [ -n "$sitio" ] || continue
    codigo="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 --resolve "$sitio:443:127.0.0.1" "https://$sitio/" || true)"
    echo "$sitio ${codigo:-000}" >>"$1"
  done < <(sitios)
}

# --- 1. Respaldo ---------------------------------------------------------------------------------------------
DESTINO="$RESPALDOS/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DESTINO/conf.d"
cp -p "$CADDY_DIR/Caddyfile" "$DESTINO/Caddyfile"
for f in "$CADDY_DIR"/conf.d/*; do [ -f "$f" ] && cp -p "$f" "$DESTINO/conf.d/"; done
echo "1. Respaldo del Caddyfile y de conf.d en $DESTINO"

# --- 2. Código HTTP de cada sitio que ya sirve Caddy ----------------------------------------------------------
codigos "$TMP/antes"
echo "2. Anoté el código HTTP de $(grep -c . "$TMP/antes" || true) sitios que ya sirve Caddy (no son de AIPOS)"
cp "$TMP/antes" "$DESTINO/codigos-antes.txt"

# --- 3. Copiar los dos archivos de AIPOS -----------------------------------------------------------------------
for f in $ARCHIVOS; do install -m 644 "$ORIGEN/$f" "$CADDY_DIR/conf.d/$f"; done
echo "3. Copié $ARCHIVOS a $CADDY_DIR/conf.d"

# --- 4. Validar, y si falla dejar todo como estaba ------------------------------------------------------------
if ! validacion="$(caddy validate --config "$CADDY_DIR/Caddyfile" 2>&1)"; then
  for f in $ARCHIVOS; do
    if [ -f "$DESTINO/conf.d/$f" ]; then cp -p "$DESTINO/conf.d/$f" "$CADDY_DIR/conf.d/$f"; else rm -f "$CADDY_DIR/conf.d/$f"; fi
  done
  while IFS= read -r linea; do echo "   caddy: $linea" >&2; done <<<"$validacion"
  fallar "caddy validate dijo que la configuración es inválida. Dejé conf.d como estaba y no recargué Caddy."
fi
echo "4. caddy validate: la configuración es válida"

# --- 5. Recargar (nunca reiniciar) -------------------------------------------------------------------------------
systemctl reload caddy
echo "5. Recargué Caddy con systemctl reload (sin reiniciarlo)"

# --- 6. Comparar los códigos: los otros sitios tienen que dar lo mismo ----------------------------------------
# Caddy aplica la configuración nueva en cuanto termina la recarga; se le dan unos segundos y hasta 3 comprobaciones.
intento=1
while :; do
  sleep "$ESPERA"
  codigos "$TMP/despues"
  cambiaron="$(while read -r sitio codigo; do
    nuevo="$(grep "^$sitio " "$TMP/despues" | head -1 | cut -d' ' -f2)"
    [ "${nuevo:-000}" = "$codigo" ] || echo "$sitio $codigo ${nuevo:-000}"
  done <"$TMP/antes")"
  [ -z "$cambiaron" ] && break
  [ "$intento" -ge 3 ] && break
  intento=$((intento + 1))
done
cp "$TMP/despues" "$DESTINO/codigos-despues.txt"
if [ -n "$cambiaron" ]; then
  echo "$cambiaron" | while read -r sitio antes ahora; do
    echo "AVISO: $sitio cambió de código HTTP: daba $antes y ahora da $ahora." >&2
  done
  fallar "algún sitio que no es de AIPOS dio otro código después de recargar. Revisa Caddy (journalctl -u caddy) antes de seguir; el respaldo está en $DESTINO"
fi
echo "6. Los otros sitios siguen dando el mismo código HTTP. Listo."
