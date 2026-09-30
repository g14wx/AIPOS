#!/usr/bin/env bash
# Spec: specs/despliegue.spec.md, sección "El workflow" y criterios 1 y 3.
# Revisa la estructura de .github/workflows/despliegue.yml: disparador, orden de los jobs (needs), environment,
# permisos, concurrencia, tiempos, versiones de las acciones, pasos de `desplegar`, y que no haya `set -x`, `down -v`
# ni credenciales. Si hay `actionlint` (o Docker con la imagen), lo corre también.
# shellcheck source=comun.sh disable=SC2015
source "$(dirname "${BASH_SOURCE[0]}")/comun.sh"
WF="${AIPOS_WORKFLOW:-$RAIZ/.github/workflows/despliegue.yml}" # AIPOS_WORKFLOW solo sirve para calibrar la prueba
if [ -f "$WF" ]; then ok "existe .github/workflows/despliegue.yml"; else falla "falta .github/workflows/despliegue.yml"; terminar; fi
command -v python3 >/dev/null || omitir "falta python3"
python3 -c 'import yaml' 2>/dev/null || omitir "falta PyYAML (pip install pyyaml)"

# Lee el workflow con PyYAML y responde con `python3 -c`. `on` se lee como True en YAML 1.1.
py() {
  python3 - "$WF" "$@" <<'PY'
import sys, yaml, json
wf = yaml.safe_load(open(sys.argv[1]))
cmd = sys.argv[2]
arg = sys.argv[3] if len(sys.argv) > 3 else None
on = wf.get("on", wf.get(True))
jobs = wf["jobs"]
def needs(j):
    n = jobs[j].get("needs", [])
    return [n] if isinstance(n, str) else list(n)
if cmd == "disparadores": print(" ".join(sorted(on.keys() if isinstance(on, dict) else on)))
elif cmd == "etiquetas": print(" ".join(on["push"].get("tags", [])))
elif cmd == "ramas": print(" ".join(on["push"].get("branches", [])))
elif cmd == "jobs": print(" ".join(jobs.keys()))
elif cmd == "needs": print(" ".join(sorted(needs(arg))))
elif cmd == "environment":
    e = jobs[arg].get("environment", "")
    print(e if isinstance(e, str) else e.get("name", ""))
elif cmd == "permisos-workflow": print(json.dumps(wf.get("permissions"), sort_keys=True))
elif cmd == "permisos-job": print(json.dumps(jobs[arg].get("permissions"), sort_keys=True))
elif cmd == "concurrency": print(json.dumps(wf.get("concurrency", jobs.get("desplegar", {}).get("concurrency")), sort_keys=True))
elif cmd == "timeout": print(jobs[arg].get("timeout-minutes", ""))
elif cmd == "usos": print("\n".join(s["uses"] for j in jobs.values() for s in j.get("steps", []) if "uses" in s))
elif cmd == "pasos": print("\n".join((s.get("name", "") or s.get("uses", "") or "(sin nombre)") for s in jobs[arg]["steps"]))
elif cmd == "servicios": print(" ".join(jobs[arg].get("services", {}).keys()))
elif cmd == "imagen-servicio": print(jobs[arg]["services"]["mysql"]["image"])
PY
}

echo "# disparador"
igual "arranca solo con push" "push" "$(py disparadores)"
igual "el push es solo de etiquetas release-*" "release-*" "$(py etiquetas)"
igual "no arranca con ramas" "" "$(py ramas)"
no_tiene "sin workflow_dispatch" "$(py disparadores)" "workflow_dispatch"

echo "# jobs y orden (needs)"
igual "los cinco jobs, en este orden" "revisar probar-backend probar-frontend construir desplegar" "$(py jobs)"
igual "revisar no necesita nada" "" "$(py needs revisar)"
igual "probar-backend necesita revisar" "revisar" "$(py needs probar-backend)"
igual "probar-frontend necesita revisar" "revisar" "$(py needs probar-frontend)"
igual "construir necesita las dos pruebas" "probar-backend probar-frontend" "$(py needs construir)"
igual "desplegar necesita construir" "construir" "$(py needs desplegar)"

echo "# environment production solo en desplegar"
igual "desplegar usa el environment production" "production" "$(py environment desplegar)"
for j in revisar probar-backend probar-frontend construir; do
  igual "$j no usa environment" "" "$(py environment "$j")"
done

echo "# permisos, concurrencia y tiempos"
igual "permisos del workflow: contents read" '{"contents": "read"}' "$(py permisos-workflow)"
igual "construir agrega packages write" '{"contents": "read", "packages": "write"}' "$(py permisos-job construir)"
igual "desplegar agrega packages read" '{"contents": "read", "packages": "read"}' "$(py permisos-job desplegar)"
igual "concurrency: grupo despliegue-produccion sin cancelar" '{"cancel-in-progress": false, "group": "despliegue-produccion"}' "$(py concurrency)"
for j in revisar probar-backend probar-frontend construir; do igual "timeout-minutes de $j es 15" "15" "$(py timeout "$j")"; done
igual "timeout-minutes de desplegar es 20" "20" "$(py timeout desplegar)"

echo "# acciones de terceros con su versión mayor"
usos="$(py usos)"
tiene "actions/checkout@v7" "$usos" "actions/checkout@v7"
tiene "actions/setup-node@v7" "$usos" "actions/setup-node@v7"
tiene "docker/login-action@v4" "$usos" "docker/login-action@v4"
tiene "docker/setup-buildx-action@v4" "$usos" "docker/setup-buildx-action@v4"
tiene "docker/build-push-action@v7" "$usos" "docker/build-push-action@v7"
if grep -E '^[^#]*uses:' "$WF" | grep -vE '@v[0-9]+\s*$' >/dev/null; then
  falla "alguna acción no está fijada a su versión mayor (@vN)"
else ok "todas las acciones están fijadas a su versión mayor (@vN)"; fi
contenido="$(cat "$WF")"
tiene "Node sale de .nvmrc" "$contenido" "node-version-file"
tiene "revisar corre despliegue/revisar-etiqueta.sh" "$contenido" "despliegue/revisar-etiqueta.sh"
tiene "revisar baja el historial completo (fetch-depth: 0)" "$contenido" "fetch-depth: 0"

echo "# pruebas y construcción"
igual "probar-backend levanta un servicio de MySQL" "mysql" "$(py servicios probar-backend)"
igual "el MySQL de las pruebas es 8.4" "mysql:8.4" "$(py imagen-servicio probar-backend)"
tiene "probar-backend corre npm ci" "$contenido" "npm ci"
tiene "probar-backend corre npm run preparar-prueba" "$contenido" "npm run preparar-prueba"
tiene "corre npm test" "$contenido" "npm test"
tiene "las contraseñas de las pruebas son de mentira" "$contenido" "ci-clave-de-prueba"
tiene "la pantalla se construye con VITE_API_URL de producción" "$contenido" "VITE_API_URL=https://aipos-back.salsalvador.io"
tiene "sube la imagen del backend a ghcr.io" "$contenido" "ghcr.io/g14wx/aipos-backend"
tiene "sube la imagen de la pantalla a ghcr.io" "$contenido" "ghcr.io/g14wx/aipos-frontend"

echo "# desplegar: secretos, variable y pasos"
tiene "usa el secreto SSH_CLAVE_PRIVADA" "$contenido" "secrets.SSH_CLAVE_PRIVADA"
tiene "usa el secreto SSH_HOSTS_CONOCIDOS" "$contenido" "secrets.SSH_HOSTS_CONOCIDOS"
tiene "usa la variable SERVIDOR_USUARIO" "$contenido" "vars.SERVIDOR_USUARIO"
tiene "el servidor se nombra por su dominio" "$contenido" "aipos.salsalvador.io"
tiene "SSH comprueba el servidor (StrictHostKeyChecking yes)" "$contenido" "StrictHostKeyChecking yes"
tiene "copia los archivos con scp" "$contenido" "scp"
tiene "copia docker-compose.produccion.yml" "$contenido" "docker-compose.produccion.yml"
tiene "copia despliegue/desplegar.sh" "$contenido" "despliegue/desplegar.sh"
tiene "entra a ghcr.io por entrada estándar" "$contenido" "--password-stdin"
tiene "usa el GITHUB_TOKEN del job" "$contenido" "GITHUB_TOKEN"
tiene "corre desplegar.sh desplegar <etiqueta>" "$contenido" "desplegar.sh desplegar"
tiene "corre revisar-produccion.sh" "$contenido" "despliegue/revisar-produccion.sh"
tiene "corre desplegar.sh volver" "$contenido" "desplegar.sh volver"
tiene "sale de ghcr.io con docker logout" "$contenido" "docker logout ghcr.io"
tiene "la clave privada se borra con if: always()" "$contenido" "if: always()"
tiene "la clave privada queda con permisos 600" "$contenido" "chmod 600"
n_desplegar="$(grep -n 'desplegar.sh desplegar' "$WF" | head -1 | cut -d: -f1)"
n_revisar="$(grep -n 'revisar-produccion.sh' "$WF" | head -1 | cut -d: -f1)"
n_volver="$(grep -n 'desplegar.sh volver' "$WF" | head -1 | cut -d: -f1)"
n_logout="$(grep -n 'docker logout ghcr.io' "$WF" | head -1 | cut -d: -f1)"
if [ -n "$n_desplegar" ] && [ -n "$n_revisar" ] && [ -n "$n_volver" ] && [ -n "$n_logout" ] &&
  [ "$n_desplegar" -lt "$n_revisar" ] && [ "$n_revisar" -lt "$n_volver" ] && [ "$n_volver" -lt "$n_logout" ]; then
  ok "orden: desplegar, revisar desde internet, volver, cerrar sesión"
else falla "orden esperado: desplegar, revisar desde internet, volver, cerrar sesión"; fi
tiene "volver solo corre si la revisión falló (no si falló desplegar.sh)" "$contenido" "steps."

echo "# lo que el workflow no puede tener"
no_tiene "sin set -x" "$contenido" "set -x"
no_tiene "sin down -v" "$contenido" "down -v"
no_tiene "sin --volumes" "$contenido" "--volumes"
no_tiene "sin prune" "$contenido" "prune"
no_tiene "sin sudo" "$contenido" "sudo"
no_tiene "sin StrictHostKeyChecking no" "$contenido" "StrictHostKeyChecking no"
no_tiene "sin ssh-keyscan (la llave sale del secreto)" "$contenido" "ssh-keyscan"
no_tiene "sin curl -k" "$contenido" "curl -k"
if grep -E '([0-9]{1,3}\.){3}[0-9]{1,3}' "$WF" | grep -vE '127\.0\.0\.1|0\.0\.0\.0' >/dev/null; then
  falla "el workflow no debe llevar direcciones IP"
else ok "el workflow no lleva direcciones IP"; fi

echo "# actionlint (si está)"
if command -v actionlint >/dev/null 2>&1; then
  if actionlint "$WF"; then ok "actionlint sin advertencias"; else falla "actionlint encontró problemas"; fi
elif docker info >/dev/null 2>&1 && docker image inspect rhysd/actionlint >/dev/null 2>&1; then
  if docker run --rm -v "$RAIZ:/repo" -w /repo rhysd/actionlint .github/workflows/despliegue.yml; then ok "actionlint (Docker) sin advertencias"; else falla "actionlint encontró problemas"; fi
else
  echo "OMITIDA: actionlint no está instalado y la imagen rhysd/actionlint no está en Docker (docker pull rhysd/actionlint)"
fi

terminar
