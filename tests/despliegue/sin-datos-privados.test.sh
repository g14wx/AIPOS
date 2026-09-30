#!/usr/bin/env bash
# Spec: specs/despliegue.spec.md, criterio de aceptación 15 y sección "Pruebas en local".
# Busca en lo que sube git (archivos versionados y archivos nuevos que no están ignorados) y en los mensajes de commit
# de esta rama: direcciones IP (menos 127.0.0.1 y 0.0.0.0), rutas de una máquina, el alias de acceso al servidor, el
# nombre del archivo del plan, enlaces a sesiones del agente, usuarios del sistema y credenciales.
# shellcheck source=comun.sh
source "$(dirname "${BASH_SOURCE[0]}")/comun.sh"
command -v python3 >/dev/null || omitir "falta python3"
command -v git >/dev/null || omitir "falta git"
git -C "$RAIZ" rev-parse --git-dir >/dev/null 2>&1 || omitir "esta carpeta no es un repositorio de git"

# Base de los commits de la rama: origin/ProductionEnv (si no está, solo se revisan los archivos).
BASE=""
if git -C "$RAIZ" rev-parse --verify -q origin/ProductionEnv >/dev/null; then BASE="origin/ProductionEnv"; fi

HALLAZGOS="$(mktemp)"
trap 'rm -f "$HALLAZGOS"' EXIT

# Cada hallazgo sale como: categoría <TAB> dónde <TAB> texto (recortado).
python3 - "$RAIZ" "$BASE" >"$HALLAZGOS" <<'PY'
import os, re, subprocess, sys

raiz, base = sys.argv[1], sys.argv[2]
os.chdir(raiz)

# Las palabras y el encabezado de clave privada se arman por partes, para que esta prueba no se encuentre a sí misma.
ALIAS = re.compile("con" + "tabo|sleepy-" + "napping|\\.claude/" + "plans", re.I)
ENCABEZADO = re.compile("-----BEGIN [A-Z ]*PRIVATE " + "KEY-----")
# Estos dos archivos nombran esas palabras a propósito, como texto que buscan (no como dato).
NOMBRAN_ALIAS = {"tests/arquitectura/spec-arquitectura.test.sh", "tests/arranque/agents-md-tarjeta.test.sh"}

IP = re.compile(r"(?<![\d.])(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(?!\.?\d)")
RUTA = re.compile(r"/Users/[A-Za-z0-9._-]+|/private/(?:tmp|var|etc)/|/home/[a-z][a-z0-9_-]*/")
SESION = re.compile(r"claude\.ai/code/session|^Claude-Session:", re.M)
USUARIO = re.compile(r"(?P<u>[^\s@'\"`(]*)@aipos(?:-back)?\.salsalvador\.io")
FICHAS = re.compile(r"\bgh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|ssh-(?:ed25519|rsa) AAAA[A-Za-z0-9+/]{20,}")
# Asignaciones de una variable secreta: NOMBRE=valor en cualquier parte, una línea entera NOMBRE: valor (YAML),
# nombre=valor en minúsculas o un campo de JSON. Una frase que dice "NOMBRE: ..." no cuenta.
_NOMBRE = "(?:PASSWORD|PASSWD|SECRET|TOKEN|API_?KEY|CLAVE)"
_VALOR = "\\s*[\"']?([^\\s\"'#]+)"
ASIGNA = [
    re.compile(r"\b[A-Z][A-Z0-9_]*" + _NOMBRE + r"[A-Z0-9_]*\s*=" + _VALOR),
    re.compile(r"^\s*(?:-\s*)?[\"']?[A-Z][A-Z0-9_]*" + _NOMBRE + r"[A-Z0-9_]*[\"']?\s*:" + _VALOR + r"[\"']?\s*$"),
    re.compile(r"(?i)\b" + _NOMBRE + r"\s*=" + _VALOR),
    re.compile(r"(?i)[\"']" + _NOMBRE + r"[\"']\s*:" + _VALOR),
]
VALOR_BUENO = re.compile(r"^(?:[$<{*]|cambiar-|tu-|clave-de-mentira|ci-clave-de-prueba|secrets\.|[A-Z][A-Z0-9_]*$)")
# Código que lee un valor y no lo escribe: una comparación (`clave === ''`), una flecha (`clave => ...`), una llamada
# (`const clave = texto(env, ...)`) o una comilla invertida que no se cierra en el mismo valor (la que cierra un
# fragmento de código en un texto, o la que abre una sustitución de comandos, cuyo valor se corta en el primer espacio).
# Un valor escrito a mano sigue contando: con comillas simples, dobles o invertidas (una plantilla literal de
# JavaScript cierra su comilla en el mismo valor) y sin comillas (issues #67 y #72).
# Límite: la revisión lee una línea a la vez y corta el valor en el primer espacio, comilla o #. Una plantilla literal
# con uno de ellos dentro, o que sigue en otra línea, deja su comilla sin cerrar y pasa.
NO_ES_UN_VALOR = re.compile(r"^(?:[=>]|`[^`]*$|[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*\()")

def revisar_texto(donde, texto, es_commit=False, nombra_alias=False):
    for n, linea in enumerate(texto.split("\n"), 1):
        lugar = donde if es_commit else f"{donde}:{n}"
        def avisar(categoria):
            print(f"{categoria}\t{lugar}\t{linea.strip()[:90]}")
        for m in IP.finditer(linea):
            octetos = [int(x) for x in m.groups()]
            previo = linea[: m.start()]
            if max(octetos) > 255 or m.group(0) in ("127.0.0.1", "0.0.0.0") or re.search(r"(?:release-|\bv)$", previo):
                continue
            avisar("ip")
        if RUTA.search(linea):
            avisar("ruta")
        if not nombra_alias and ALIAS.search(linea):
            avisar("alias")
        if SESION.search(linea):
            avisar("sesion")
        if any(m.group("u") and not re.search(r"[$<>{}]", m.group("u")) for m in USUARIO.finditer(linea)):
            avisar("usuario")
        if FICHAS.search(linea) or ENCABEZADO.search(linea):
            avisar("credencial")
        for patron in ASIGNA:
            for m in patron.finditer(linea):
                if not VALOR_BUENO.match(m.group(1)) and not NO_ES_UN_VALOR.match(m.group(1)):
                    avisar("credencial")

archivos = subprocess.run(["git", "ls-files", "-co", "--exclude-standard", "-z"], capture_output=True, check=True).stdout
for a in sorted(set(x for x in archivos.decode().split("\0") if x)):
    # El grafo y los archivos de otras herramientas tienen sus propias pruebas o son de mentira a propósito.
    if a.startswith("graphify-out/") or a.endswith("package-lock.json") or re.match(r"tessl-plugins/[^/]+/evals/", a):
        continue
    if re.search(r"(^|/)\.env(\.(?!example$).+)?$", a):
        print(f"env\t{a}\tun archivo .env no se sube a git")
        continue
    try:
        texto = open(a, encoding="utf-8").read()
    except (OSError, UnicodeDecodeError):
        continue
    revisar_texto(a, texto, nombra_alias=a in NOMBRAN_ALIAS or a == "tests/despliegue/sin-datos-privados.test.sh")

if base:
    mensajes = subprocess.run(["git", "log", "--format=%H%n%B%x00", f"{base}..HEAD"], capture_output=True, text=True).stdout
    for bloque in [b for b in mensajes.split("\0") if b.strip()]:
        hash_, _, cuerpo = bloque.strip().partition("\n")
        revisar_texto(f"commit {hash_[:7]}", cuerpo, es_commit=True)
PY

# Muestra hasta 5 hallazgos de una categoría y devuelve 0 si no hay ninguno.
resumir() { # categoría, descripción
  local n
  n="$(grep -c "^$1"$'\t' "$HALLAZGOS" || true)"
  if [ "$n" -eq 0 ]; then
    ok "$2"
  else
    falla "$2 ($n hallazgos)"
    grep "^$1"$'\t' "$HALLAZGOS" | head -5 | while IFS=$'\t' read -r _ donde texto; do echo "    $donde: $texto"; done
  fi
}

echo "# archivos y mensajes de commit"
resumir ip "sin direcciones IP (salvo 127.0.0.1 y 0.0.0.0)"
resumir ruta "sin rutas de una máquina (/Users/<nombre>, /private/tmp, /home/<nombre>)"
resumir alias "sin el alias de acceso al servidor ni el archivo del plan"
resumir sesion "sin enlaces a sesiones del agente ni la línea Claude-Session"
resumir usuario "sin un usuario del sistema delante de @aipos.salsalvador.io"
resumir credencial "sin credenciales (contraseñas, claves privadas, fichas de GitHub)"
resumir env "sin archivos .env versionados (solo .env.example)"
if [ -n "$BASE" ]; then ok "se revisaron también los commits de la rama desde $BASE"; else echo "OMITIDA: no hay origin/ProductionEnv; solo se revisaron los archivos"; fi

terminar
