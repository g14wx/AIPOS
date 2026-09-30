#!/usr/bin/env bash
# Spec: specs/despliegue.spec.md, "Revisión desde internet (despliegue/revisar-produccion.sh)" y criterios de
# aceptación 4, 13 y 14.
# El script recibe la dirección de la pantalla, la del backend y el origen permitido, y revisa cinco cosas: el backend
# está vivo, la pantalla responde, /api/docs responde, el backend deja pasar a la pantalla y no deja pasar a otros.
# Aquí la pantalla y el backend son un servidor HTTP local de mentira (python3) que responde según el modo.
# shellcheck source=comun.sh disable=SC2015
source "$(dirname "${BASH_SOURCE[0]}")/comun.sh"
SCRIPT="$RAIZ/despliegue/revisar-produccion.sh"
command -v python3 >/dev/null 2>&1 || omitir "no hay python3 para el servidor de mentira"
TMP="$(mktemp -d)"
trap 'parar; rm -rf "$TMP"' EXIT

cat >"$TMP/servidor.py" <<'PY'
import json, os, sys
from http.server import BaseHTTPRequestHandler, HTTPServer

MODO = os.environ.get("MODO", "ok")
PERMITIDO = "https://aipos.salsalvador.io"
FALLAS_INICIALES = int(os.environ.get("FALLAS_INICIALES", "0"))
vistas = {"n": 0}


class Manejador(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def responder(self, codigo, cuerpo=b"ok", cabeceras=None):
        self.send_response(codigo)
        for k, v in (cabeceras or {}).items():
            self.send_header(k, v)
        self.send_header("Content-Length", str(len(cuerpo)))
        self.end_headers()
        self.wfile.write(cuerpo)

    def do_GET(self):
        vistas["n"] += 1
        if vistas["n"] <= FALLAS_INICIALES:
            return self.responder(503)
        origen = self.headers.get("Origin", "")
        if self.path == "/":
            return self.responder(500 if MODO == "pantalla-500" else 200, b"<html>AIPOS</html>")
        if self.path == "/api/docs":
            if MODO == "docs-404":
                return self.responder(404)
            return self.responder(301, b"", {"Location": "/api/docs/"})
        if self.path == "/api/docs/":
            return self.responder(404 if MODO == "docs-404" else 200, b"<html>docs</html>")
        if self.path == "/api/salud":
            if MODO == "salud-500":
                return self.responder(500, b'{"error":{"codigo":"ERROR_INTERNO"}}')
            cuerpo = b'{"estado":"mal"}' if MODO == "salud-mal" else b'{"estado":"ok","baseDeDatos":"ok"}'
            cab = {"Content-Type": "application/json"}
            if MODO == "sin-cors":
                pass
            elif MODO == "cors-abierto":
                cab["Access-Control-Allow-Origin"] = "*"
            elif MODO == "cors-refleja":
                if origen:
                    cab["Access-Control-Allow-Origin"] = origen
            elif origen == PERMITIDO:
                cab["Access-Control-Allow-Origin"] = PERMITIDO
            return self.responder(200, cuerpo, cab)
        return self.responder(404)


servidor = HTTPServer(("127.0.0.1", 0), Manejador)
print(servidor.server_address[1], flush=True)
servidor.serve_forever()
PY

parar() {
  if [ -n "${PID:-}" ]; then
    kill "$PID" 2>/dev/null || true
    wait "$PID" 2>/dev/null || true
    PID=""
  fi
}

# arrancar <modo> [fallas iniciales]: deja PUERTO con el puerto del servidor de mentira.
arrancar() {
  parar
  MODO="$1" FALLAS_INICIALES="${2:-0}" python3 "$TMP/servidor.py" >"$TMP/puerto" 2>/dev/null &
  PID=$!
  for _ in $(seq 1 50); do
    [ -s "$TMP/puerto" ] && break
    sleep 0.1
  done
  PUERTO="$(head -1 "$TMP/puerto")"
  : >"$TMP/puerto"
}

# revisar: corre el script contra el servidor de mentira; deja SALIDA y CODIGO.
revisar() {
  local url="http://127.0.0.1:$PUERTO"
  set +e
  SALIDA="$(AIPOS_REINTENTOS="${REINTENTOS:-2}" AIPOS_ESPERA=0 \
    bash "$SCRIPT" "$url" "$url" "https://aipos.salsalvador.io" 2>&1)"
  CODIGO=$?
  set -e
}

if [ -f "$SCRIPT" ]; then
  ok "existe despliegue/revisar-produccion.sh"
else
  falla "falta despliegue/revisar-produccion.sh"
  terminar
fi

echo "--- todo bien ---"
arrancar ok
revisar
igual "con todo bien termina con 0" "0" "$CODIGO"
[ "$CODIGO" = 0 ] || echo "$SALIDA"

echo "--- cada revisión que falla dice cuál fue ---"
arrancar salud-500
revisar
[ "$CODIGO" -ne 0 ] && ok "/api/salud en 500 termina con error" || falla "/api/salud en 500 terminó bien"
tiene "el mensaje nombra /api/salud" "$SALIDA" "/api/salud"

arrancar salud-mal
revisar
[ "$CODIGO" -ne 0 ] && ok "/api/salud sin \"estado\":\"ok\" termina con error" || falla "aceptó un cuerpo sin estado ok"

arrancar pantalla-500
revisar
[ "$CODIGO" -ne 0 ] && ok "la pantalla en 500 termina con error" || falla "la pantalla en 500 terminó bien"
tiene "el mensaje nombra la pantalla" "$SALIDA" "pantalla"

arrancar docs-404
revisar
[ "$CODIGO" -ne 0 ] && ok "/api/docs en 404 termina con error" || falla "/api/docs en 404 terminó bien"
tiene "el mensaje nombra /api/docs" "$SALIDA" "/api/docs"

echo "--- CORS ---"
arrancar sin-cors
revisar
[ "$CODIGO" -ne 0 ] && ok "sin Access-Control-Allow-Origin para la pantalla termina con error" \
  || falla "aceptó un backend que no deja pasar a la pantalla"
tiene "el mensaje nombra CORS" "$SALIDA" "CORS"

arrancar cors-abierto
revisar
[ "$CODIGO" -ne 0 ] && ok "Access-Control-Allow-Origin: * termina con error" || falla "aceptó CORS abierto con *"

arrancar cors-refleja
revisar
[ "$CODIGO" -ne 0 ] && ok "un backend que deja pasar a otro origen termina con error" \
  || falla "aceptó un backend que deja pasar a https://otro.example"

echo "--- reintentos: los primeros intentos dan 503 y luego todo funciona ---"
arrancar ok 3
REINTENTOS=1 revisar
[ "$CODIGO" -ne 0 ] && ok "con un solo intento y el servidor caído, falla" || falla "con un solo intento no falló"
arrancar ok 3
REINTENTOS=10 revisar
igual "con 10 intentos espera y termina bien" "0" "$CODIGO"
unset REINTENTOS

echo "--- el script nunca desactiva la validación del certificado ---"
if [ -f "$SCRIPT" ]; then
  if grep -E 'curl' "$SCRIPT" | grep -Eq -- '(^|[[:space:]])(-[a-zA-Z]*k[a-zA-Z]*|--insecure)([[:space:]]|$)'; then
    falla "el script usa -k o --insecure"
  else
    ok "el script no usa -k ni --insecure"
  fi
  comprobar "el script usa set -euo pipefail" grep -q 'set -euo pipefail' "$SCRIPT"
  comprobar "pasa shellcheck" shellcheck "$SCRIPT"
fi

terminar
