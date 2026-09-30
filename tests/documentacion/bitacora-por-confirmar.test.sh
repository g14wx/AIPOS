#!/usr/bin/env bash
# Tarjeta E-01 (cerrar la bitácora): ninguna entrada «por confirmar» queda sin revisar.
#  - La sección "Por confirmar con la persona" existe.
#  - Cada entrada de la bitácora que dice «por confirmar» tiene su enlace en esa sección, con lo que hay que decidir.
#    Una entrada no se borra ni se reescribe: cuando la persona confirma, la fila se queda y su estado dice «confirmada»
#    con la fecha. Por eso la prueba pide el enlace y no mira el estado.
#  - Todos los enlaces internos (](#ancla)) de la bitácora apuntan a un título que existe. Las anclas se arman como las arma
#    GitHub: minúsculas, sin signos de puntuación y con guiones en lugar de espacios.
# Dice todas las fallas, no solo la primera.
#
# Uso: bash tests/documentacion/bitacora-por-confirmar.test.sh [archivo]   (por defecto, docs/bitacora-ia.md)
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

archivo="${1:-docs/bitacora-ia.md}"
[ -f "$archivo" ] || { echo "FALLA: falta $archivo"; exit 1; }
command -v python3 >/dev/null || { echo "FALLA: esta prueba necesita python3"; exit 1; }

python3 - "$archivo" <<'PY'
import re
import sys
import unicodedata

texto = open(sys.argv[1], encoding="utf-8").read()
lineas = texto.split("\n")
fallas = []
SECCION = "## Por confirmar con la persona"


def falla(mensaje):
    fallas.append(mensaje)
    print("FALLA:", mensaje)


def ok(mensaje):
    print("ok:", mensaje)


def ancla(titulo, vistos):
    """El ancla que GitHub le da a un título; si el mismo título sale otra vez, le suma -1, -2..."""
    t = re.sub(r"^#{1,6} ", "", titulo).strip().lower()
    base = "".join(c for c in t if unicodedata.category(c)[0] in "LMN" or unicodedata.category(c) == "Pc" or c in "- ")
    base = base.replace(" ", "-")
    n = vistos.get(base, 0)
    vistos[base] = n + 1
    return base if n == 0 else f"{base}-{n}"


# Los títulos con su ancla, y las entradas (### con fecha y hora) con todo su texto hasta el título siguiente.
vistos, anclas, entradas, actual = {}, set(), [], None
for linea in lineas:
    if re.match(r"^#{1,6} ", linea):
        esta = ancla(linea, vistos)
        anclas.add(esta)
        if re.match(r"^### \d{4}-\d{2}-\d{2} \d{2}:\d{2} — ", linea):
            actual = {"titulo": linea[4:], "ancla": esta, "texto": [linea]}
            entradas.append(actual)
        else:
            actual = None
    elif actual is not None:
        actual["texto"].append(linea)

# 1. Todos los enlaces internos apuntan a un título que existe.
enlaces = re.findall(r"\[([^\]]*)\]\(#([^)\s]+)\)", texto)
rotos = [(t, a) for t, a in enlaces if a not in anclas]
for t, a in rotos:
    falla(f"el enlace «{t}» apunta a #{a} y ningún título de la bitácora tiene esa ancla")
if enlaces and not rotos:
    ok(f"los {len(enlaces)} enlaces internos de la bitácora apuntan a un título que existe")

# 2. La sección «Por confirmar con la persona» existe y enlaza cada entrada que dice «por confirmar».
if SECCION not in lineas:
    falla(f'falta la sección "{SECCION}"')
else:
    inicio = lineas.index(SECCION)
    fin = next((i for i in range(inicio + 1, len(lineas)) if lineas[i].startswith("## ")), len(lineas))
    enlazadas = set(re.findall(r"\]\(#([^)\s]+)\)", "\n".join(lineas[inicio:fin])))
    pendientes = [e for e in entradas if re.search(r"por confirmar", "\n".join(e["texto"]), re.I)]
    faltan = [e for e in pendientes if e["ancla"] not in enlazadas]
    for e in faltan:
        falla(f"la entrada «{e['titulo']}» dice «por confirmar» y no tiene su fila en la sección «Por confirmar con la persona»")
    if pendientes and not faltan:
        ok(f"las {len(pendientes)} entradas que dicen «por confirmar» tienen su fila en la sección «Por confirmar con la persona»")
    if not pendientes:
        falla("ninguna entrada dice «por confirmar»: la prueba no está mirando las entradas")

if fallas:
    print(f"{len(fallas)} falla(s)")
    sys.exit(1)
print("todo bien")
PY
