#!/usr/bin/env bash
# Spec: specs/despliegue.spec.md, sección "Docker Compose de producción" ("Nunca docker compose down -v ...").
# Los datos de producción viven en un volumen de Docker. Busca las órdenes que lo borran:
#   - En el workflow, los scripts de despliegue/, los bloques de Caddy y el compose: ni una mención (ni en comentarios).
#   - En las guías (docs/despliegue.md, README.md, el flujo 07): solo pueden nombrarlas en una línea que advierte
#     ("nunca", "borra", "pierdes", "cuidado", "peligro").
# shellcheck source=comun.sh
source "$(dirname "${BASH_SOURCE[0]}")/comun.sh"

# down con -v o --volumes, --volumes solo, prune (volume, system, container...), volume rm, la carpeta de los
# volúmenes de Docker, y `down` a secas (para detener se usa `docker compose stop`).
PELIGROSAS='down[^#|;&]*[[:space:]](-[A-Za-z]*v[A-Za-z]*|--volumes)([[:space:]]|$)|--volumes|prune|volume[[:space:]]+rm|/var/lib/docker/volumes|(^|[[:space:]])down([[:space:]]|$)'
ADVERTENCIA='[Nn]unca|[Nn]o uses|borra|pierd|peligro|cuidado'

echo "# workflow, scripts, Caddy y compose: ni una mención"
ESTRICTOS=""
for f in "$RAIZ"/.github/workflows/*.yml "$RAIZ"/despliegue/* "$RAIZ"/despliegue/caddy/* "$RAIZ/docker-compose.produccion.yml"; do
  [ -f "$f" ] && ESTRICTOS="$ESTRICTOS $f"
done
for obligatorio in .github/workflows/despliegue.yml despliegue/desplegar.sh docker-compose.produccion.yml; do
  if [ -f "$RAIZ/$obligatorio" ]; then ok "existe $obligatorio"; else falla "falta $obligatorio (sin él no hay nada que revisar)"; fi
done
for f in $ESTRICTOS; do
  rel="${f#"$RAIZ"/}"
  if grep -nE -- "$PELIGROSAS" "$f" >/dev/null; then
    falla "$rel nombra una orden que puede borrar datos o usa down"
    grep -nE -- "$PELIGROSAS" "$f" | head -3 | sed 's/^/    /'
  else
    ok "$rel no nombra órdenes que borran datos"
  fi
done

echo "# guías: solo como advertencia"
for rel in docs/despliegue.md README.md requerimientos/flujos/07-desplegar-una-version.md; do
  f="$RAIZ/$rel"
  if [ ! -f "$f" ]; then falla "falta $rel"; continue; fi
  sin_aviso="$(grep -nE -- "$PELIGROSAS" "$f" | grep -vE -- "$ADVERTENCIA" || true)"
  if [ -n "$sin_aviso" ]; then
    falla "$rel nombra una orden que borra datos sin advertirlo"
    echo "$sin_aviso" | head -3 | sed 's/^/    /'
  else
    ok "$rel no nombra órdenes que borran datos, o solo para advertir"
  fi
done

echo "# cómo detienen los scripts"
if [ -f "$RAIZ/despliegue/desplegar.sh" ]; then
  tiene "desplegar.sh detiene con docker compose stop backend frontend" "$(cat "$RAIZ/despliegue/desplegar.sh")" "stop backend frontend"
fi

terminar
