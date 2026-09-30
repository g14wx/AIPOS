#!/usr/bin/env bash
# Tarjeta E-01 (cerrar la bitácora y los tiempos): las sumas de docs/bitacora-ia.md tienen que cuadrar.
#  - "Resumen > Por tarea": el tiempo de cada fila es la suma de sus rangos de horas (04:21–08:19 son 3 h 58 min).
#  - "Resumen > Por entregable": cada columna suma lo mismo que la tabla por tarea, y el total suma los entregables.
#  - Hay una tarea con agente por cada entrada de la bitácora: si falta una fila, la suma no cuadra.
#  - "Estimación contra tiempo real": la diferencia de cada tarjeta es el tiempo real menos la estimación, y el total
#    suma las tarjetas que ya tienen tiempo real.
# Dice todas las fallas, no solo la primera.
#
# Uso: bash tests/documentacion/bitacora-sumas.test.sh [archivo]   (por defecto, docs/bitacora-ia.md)
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

archivo="${1:-docs/bitacora-ia.md}"
[ -f "$archivo" ] || { echo "FALLA: falta $archivo"; exit 1; }
command -v python3 >/dev/null || { echo "FALLA: esta prueba necesita python3"; exit 1; }

python3 - "$archivo" <<'PY'
import re
import sys

lineas = open(sys.argv[1], encoding="utf-8").read().split("\n")
fallas = []


def falla(mensaje):
    fallas.append(mensaje)
    print("FALLA:", mensaje)


def ok(mensaje):
    print("ok:", mensaje)


def minutos(celda):
    """'4 h 08 min' -> 248, '57 min' -> 57, '1.5 h' -> 90, '+3 h 08 min' -> 188. None si la celda no empieza con una duración."""
    m = re.match(r"^([+-])?\s*(?:(\d+(?:\.\d+)?) h)?\s*(?:(\d+) min)?", celda.strip())
    if not m or (m.group(2) is None and m.group(3) is None):
        return None
    total = round(float(m.group(2) or 0) * 60) + int(m.group(3) or 0)
    return -total if m.group(1) == "-" else total


def horas(total):
    signo = "-" if total < 0 else ""
    h, m = divmod(abs(total), 60)
    return f"{signo}{h} h {m:02d} min" if h else f"{signo}{m} min"


def entero(celda):
    m = re.match(r"^\s*(\d+)", celda)
    return int(m.group(1)) if m else None


def sin_tiempo(celda):
    return re.match(r"^\s*(sin medir|en curso|pendiente|—|-)", celda) is not None


def tabla(titulo):
    """Las filas de la primera tabla bajo el título, sin el encabezado ni la línea de guiones. None si no hay título."""
    inicio = next((i for i, l in enumerate(lineas) if l.strip() == titulo), None)
    if inicio is None:
        return None
    filas, en_tabla = [], False
    for linea in lineas[inicio + 1:]:
        if re.match(r"^#{1,6} ", linea):
            break
        if not linea.startswith("|"):
            if en_tabla:
                break
            continue
        en_tabla = True
        celdas = [c.strip() for c in linea.strip().strip("|").split("|")]
        if not all(re.match(r"^:?-+:?$", c) for c in celdas):
            filas.append(celdas)
    return filas[1:]


def rangos(celda):
    """Suma de los rangos HH:MM–HH:MM de una celda; uno que cruza la medianoche suma hasta el día siguiente."""
    total = 0
    for h1, m1, h2, m2 in re.findall(r"(\d{2}):(\d{2})–(\d{2}):(\d{2})", celda):
        total += (int(h2) * 60 + int(m2) - int(h1) * 60 - int(m1)) % (24 * 60)
    return total


def es_total(celdas):
    return celdas[0].strip("* ").lower().startswith("total")


def comparar(donde, que, dicho, calculado, como=str):
    if dicho is None or dicho != calculado:
        falla(f"{donde}: el {que} dice {como(dicho) if dicho is not None else 'nada'} y las filas suman {como(calculado)}")


def firmado(total):
    return ("+" if total > 0 else "") + horas(total)


# 1. Resumen > Por tarea: el tiempo de cada fila es la suma de sus rangos de horas.
por_tarea, por_entregable = tabla("### Por tarea"), tabla("### Por entregable")
suma = {"min": 0, "tareas": 0, "props": 0}
antes = len(fallas)
if not por_tarea:
    falla('el Resumen no tiene la tabla bajo "### Por tarea"')
for celdas in por_tarea or []:
    nombre, tiempo = celdas[0], celdas[1]
    tareas, props, m = entero(celdas[2]), entero(celdas[3]), minutos(tiempo)
    if tareas is None or props is None:
        falla(f"Por tarea, {nombre}: las columnas de tareas y de propuestas tienen que empezar con un número")
    else:
        suma["tareas"] += tareas
        suma["props"] += props
    if m is None:
        if not sin_tiempo(tiempo):
            falla(f"Por tarea, {nombre}: el tiempo «{tiempo}» no empieza con una duración")
    else:
        suma["min"] += m
        if rangos(tiempo) and rangos(tiempo) != m:
            falla(f"Por tarea, {nombre}: dice {horas(m)} y sus rangos de horas suman {horas(rangos(tiempo))}")
if por_tarea and len(fallas) == antes:
    ok(f"las {len(por_tarea)} filas del Resumen por tarea suman los rangos de horas que dicen")

# 2. Resumen > Por entregable: suma lo mismo que la tabla por tarea, y el total suma los entregables.
antes = len(fallas)
if not por_entregable:
    falla('el Resumen no tiene la tabla bajo "### Por entregable"')
else:
    filas = [c for c in por_entregable if not es_total(c)]
    total = next((c for c in por_entregable if es_total(c)), None)
    suma_e = {
        "min": sum(minutos(c[1]) or 0 for c in filas),
        "tareas": sum(entero(c[2]) or 0 for c in filas),
        "props": sum(entero(c[3]) or 0 for c in filas),
    }
    if total is None:
        falla("la tabla por entregable no tiene la fila Total")
    else:
        comparar("Por entregable", "tiempo del Total", minutos(total[1]), suma_e["min"], horas)
        comparar("Por entregable", "Total de tareas con agente", entero(total[2]), suma_e["tareas"])
        comparar("Por entregable", "Total de propuestas", entero(total[3]), suma_e["props"])
    comparar("Por entregable contra Por tarea", "tiempo de los entregables", suma_e["min"], suma["min"], horas)
    comparar("Por entregable contra Por tarea", "número de tareas con agente", suma_e["tareas"], suma["tareas"])
    comparar("Por entregable contra Por tarea", "número de propuestas", suma_e["props"], suma["props"])
    if len(fallas) == antes:
        ok(f"los {len(filas)} entregables y el Total suman lo mismo que las filas por tarea ({horas(suma['min'])})")

# 3. Una tarea con agente por cada entrada de la bitácora.
entradas = sum(1 for l in lineas if re.match(r"^### \d{4}-\d{2}-\d{2} \d{2}:\d{2} — ", l))
if suma["tareas"] == entradas:
    ok(f"el Resumen cuenta una tarea por cada una de las {entradas} entradas")
else:
    falla(f"la bitácora tiene {entradas} entradas y el Resumen cuenta {suma['tareas']} tareas con agente: falta una fila o sobra una")

# 4. Estimación contra tiempo real: la diferencia es el tiempo real menos la estimación, y el total suma las tarjetas con tiempo real.
estimacion = tabla("## Estimación contra tiempo real")
antes = len(fallas)
if not estimacion:
    falla('falta la sección "## Estimación contra tiempo real" con su tabla')
else:
    e_est = e_real = medidas = 0
    for celdas in estimacion:
        if es_total(celdas):
            continue
        nombre, est, real, dif = celdas[0], minutos(celdas[1]), minutos(celdas[2]), minutos(celdas[3])
        if est is None:
            falla(f"Estimación, {nombre}: la estimación «{celdas[1]}» no empieza con una duración")
        elif real is None:
            if not sin_tiempo(celdas[2]):
                falla(f"Estimación, {nombre}: el tiempo real «{celdas[2]}» no empieza con una duración")
        else:
            e_est, e_real, medidas = e_est + est, e_real + real, medidas + 1
            if dif is None or dif != real - est:
                falla(f"Estimación, {nombre}: la diferencia dice «{celdas[3]}» y real menos estimación es {firmado(real - est)}")
    total = next((c for c in estimacion if es_total(c)), None)
    if total is None:
        falla("la tabla de estimación no tiene la fila Total")
    else:
        comparar("Estimación", "total de la estimación", minutos(total[1]), e_est, horas)
        comparar("Estimación", "total del tiempo real", minutos(total[2]), e_real, horas)
        comparar("Estimación", "total de la diferencia", minutos(total[3]), e_real - e_est, firmado)
    if len(fallas) == antes:
        ok(f"las {medidas} tarjetas con tiempo real restan bien y el Total suma sus estimaciones y sus tiempos")

if fallas:
    print(f"{len(fallas)} falla(s)")
    sys.exit(1)
print("todo bien")
PY
