#!/usr/bin/env bash
# Spec: specs/arquitectura.spec.md, secciones "Versiones" y "Git y entrega".
# La spec de arquitectura tiene el formato del tile spec-driven-development (frontmatter y enlaces [@test]),
# dice las versiones y las decisiones que otras tarjetas usan, y ni ella ni los documentos que toca dejan
# rutas de una máquina, el alias de un servidor ni enlaces a sesiones del agente.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

spec=specs/arquitectura.spec.md
[ -f "$spec" ] || { echo "FALLA: falta $spec"; exit 1; }

fallas=0
falla() {
  echo "FALLA: $1"
  fallas=$((fallas + 1))
}
ok() { echo "ok: $1"; }

# Frontmatter: name, description y al menos un target relativo.
frontmatter="$(awk 'NR==1 && $0!="---" {exit} NR>1 && $0=="---" {exit} NR>1 {print}' "$spec")"
for campo in name description targets; do
  if grep -q "^$campo:" <<<"$frontmatter"; then ok "el frontmatter tiene $campo"; else falla "el frontmatter no tiene $campo"; fi
done
targets="$(grep -c '^  - \.\./' <<<"$frontmatter" || true)"
if [ "$targets" -ge 1 ]; then ok "hay $targets targets relativos"; else falla "no hay targets que empiecen con ../"; fi
if grep '^  - ' <<<"$frontmatter" | grep -qv '^  - \.\./'; then falla "hay un target que no es una ruta relativa desde specs/"; else ok "todos los targets son rutas relativas"; fi

# Enlaces [@test]: relativos desde specs/. Los de shell de la raíz ya tienen que existir.
enlaces="$(grep -o '\[@test\] [^ ]*' "$spec" | sed 's/^\[@test\] //; s/`$//' | sort -u)"
[ -n "$enlaces" ] || falla "la spec no tiene enlaces [@test]"
while IFS= read -r ruta; do
  [ -n "$ruta" ] || continue
  case "$ruta" in
    ../*) ;;
    *) falla "el [@test] $ruta no es una ruta relativa desde specs/" ;;
  esac
  case "$ruta" in
    ../tests/*)
      if [ -f "specs/$ruta" ]; then ok "existe $ruta"; else falla "no existe $ruta"; fi ;;
  esac
done <<<"$enlaces"

# Decisiones que las tarjetas B-02, B-03 y B-04 leen tal cual.
revisar() {
  if grep -qF -- "$1" "$spec"; then ok "la spec dice $1"; else falla "la spec no dice $1"; fi
}
for texto in \
  '`express` | 5.2.1' '`sequelize` | 6.37.8' '`mysql2` | 3.24.5' '`sequelize-cli` | 6.6.5' \
  '`vue` | 2.7.16' '`vuetify` | 2.7.2' '`vite` | 7.3.6' '`@vitejs/plugin-vue2` | 2.3.4' \
  '`axios` | 1.20.0' '`@mdi/font` | 7.4.47' '`lottie-web` | 5.13.0' '`vitest` | 5.0.2' \
  'mysql:8.4' 'DECIMAL(12,2)' 'DECIMAL(10,2)' 'MYSQL_PORT' 'npm run migrar' 'npm run deshacer' 'npm run rehacer' \
  '#292F36' '#4ECDC4' '#F7FFF7' '#FF6B6B' '#FFE66D' 'supuesto' 'impeccable' 'prefers-reduced-motion' \
  'aipos.ventaActual' 'ErrorApi' 'GET /api/salud' 'chrome-devtools' 'gh issue create' 'design-patterns' \
  'feature/b-02-base-del-backend'; do
  revisar "$texto"
done

# Sin datos privados en la spec ni en los documentos que toca.
archivos=("$spec" AGENTS.md docs/lenguaje-ubicuo.md)
while IFS= read -r archivo; do archivos+=("$archivo"); done < <(find requerimientos -name '*.md' | sort)
for archivo in "${archivos[@]}"; do
  if grep -nE '/Users/|/private/|ssh contabo|contabo|claude\.ai/code/session|sleepy-napping' "$archivo" >/dev/null; then
    falla "$archivo tiene una ruta de la máquina, el alias de un servidor o un enlace a una sesión"
    grep -nE '/Users/|/private/|ssh contabo|contabo|claude\.ai/code/session|sleepy-napping' "$archivo" || true
  fi
done
[ "$fallas" -eq 0 ] && ok "ningún documento deja datos privados"

# Coherencia entre las 7 specs, el glosario y requerimientos/ (tarjeta S-02, tras la revisión cruzada).
# Cada dato tiene un solo dueño y las demás specs dicen lo mismo. Se busca en el texto unido en una sola
# línea, para que un salto de línea dentro de una frase no importe.
unido() { tr '\n' ' ' <"$1" | tr -s ' '; }
debe_decir() { # debe_decir <archivo> <texto>
  local texto
  texto="$(unido "$1")"
  if grep -qF -- "$2" <<<"$texto"; then ok "$1 dice: $2"; else falla "$1 no dice: $2"; fi
}
ya_no_debe_decir() { # ya_no_debe_decir <archivo> <expresión regular>
  local texto
  texto="$(unido "$1")"
  if grep -qiE -- "$2" <<<"$texto"; then falla "$1 todavía dice: $2"; else ok "$1 ya no dice: $2"; fi
}
A=specs/arquitectura.spec.md
CP=specs/crear-producto.spec.md
BP=specs/buscar-producto.spec.md
AVA=specs/armar-venta-actual.spec.md
RV=specs/registrar-venta.spec.md
DOC=specs/documentacion-de-la-api.spec.md
DES=specs/despliegue.spec.md
G=docs/lenguaje-ubicuo.md

# Límite de 100 detalles por venta: el total nunca se sale de DECIMAL(12,2).
debe_decir "$A" 'una venta tiene como máximo 100 detalles'
debe_decir "$A" '9 989 999 001.00'
ya_no_debe_decir "$A" 'y no se desborda'
debe_decir "$AVA" '**RN-14.**'
debe_decir "$AVA" 'Una venta puede tener como máximo 100 productos.'
debe_decir "$AVA" 'de 1 a 100 detalles'
debe_decir "$RV" 'RN-14'
ya_no_debe_decir "$RV" 'Propuesta de esta spec'

# Sin «importe» ni «monto»: el glosario los tiene en "No decir".
for spec in "$A" "$AVA"; do ya_no_debe_decir "$spec" '\b(importes?|monto)\b'; done

# La CSP por defecto de helmet no bloquea Swagger UI (lo comprobó la spec de la documentación de la API).
ya_no_debe_decir "$A" 'bloquea los estilos en línea'
debe_decir "$A" "'unsafe-inline'"

# `montajes` lo crea B-02 con `salud`; A-01 suma `docs` fuera de `montajes` (PR de B-02).
debe_decir "$A" '`crearRouterApi(lista = montajes)`'
debe_decir "$A" '{ ruta, router }'
debe_decir "$DOC" "{ ruta: '/salud', router: salud }"
ya_no_debe_decir "$DOC" 'prefijo:'
ya_no_debe_decir "$DOC" '`montajes` en `src/routes/index.js` y la política'

# `validarDinero`: el precio de un producto es mayor que 0 (RN-02) y el precio aplicado puede ser 0 (RN-05).
debe_decir "$A" '`validarDinero(valor, campo, { permiteCero })`'
debe_decir "$CP" 'sin `permiteCero`'
debe_decir "$RV" '`permiteCero: true`'

# Los archivos compartidos de productos: P-02 y P-04 corren a la vez, y la primera que se integra los crea.
for spec in "$A" "$CP" "$BP" "$DOC"; do debe_decir "$spec" 'P-02 y P-04 corren a la vez'; done
ya_no_debe_decir "$BP" 'P-01 crea el router'
ya_no_debe_decir "$BP" 'ruta propuesta'

# Ramas: cada tarjeta trabaja en su rama de tarjeta; `chore/despliegue` es la única excepción.
ya_no_debe_decir "$RV" 'Las cuatro tarjetas van en la rama de entregable'
debe_decir "$RV" '`feature/v-01-tablas-ventas`'
debe_decir "$RV" '`feature/v-08-boton-registrar-venta`'
debe_decir "$A" '`chore/despliegue`'
debe_decir "$DES" 'la única excepción a `<tipo>/<id>-<resumen>`'

# Después de registrar, `VentaActual.vue` emite la venta vacía y `App.vue` la guarda (manda la spec de armar la venta actual).
debe_decir "$RV" '`App.vue` la guarda con `guardarVentaActual`'
ya_no_debe_decir "$RV" '`VentaActual.vue` vacía la venta actual'

# Despliegue y documentación de la API: la imagen copia `docs/` y `release-0.1.0` incluye A-01.
debe_decir "$DES" '`.sequelizerc`, `db/`, `docs/` y `src/`'
debe_decir "$DES" 'Se integraron el entregable base (B-01 a B-04 y A-01) y D-01'
ya_no_debe_decir "$DES" 'cuando exista A-01'
ya_no_debe_decir "$DES" 'Para el dueño de la arquitectura'
ya_no_debe_decir "$DES" 'Aún no están en'
debe_decir "$DES" 'Ya están en `docs/lenguaje-ubicuo.md`'
ya_no_debe_decir "$DOC" 'Entrada propuesta:'
debe_decir "$DOC" 'El glosario ya trae «documentación de la API» y «formato de error»'

# Nombres de las pruebas: por operación y en la carpeta de su recurso.
debe_decir "$A" 'documentacion-<operación>.test.js'
debe_decir "$CP" '../frontend/tests/api/crear-producto.test.js'
ya_no_debe_decir "$CP" 'frontend/tests/api/productos\.test\.js'
debe_decir "$RV" '../frontend/tests/api/registrar-venta.test.js'
ya_no_debe_decir "$RV" 'frontend/tests/api/ventas\.test\.js'
debe_decir "$RV" '../backend/tests/ventas/validador-venta.test.js'
ya_no_debe_decir "$RV" 'backend/tests/validators/ventas\.test\.js'
debe_decir "$RV" '../backend/tests/ventas/documentacion-registrar-venta.test.js'

# `AnimacionLottie` y `http.js`, como los dejó B-04 en sus pruebas.
for propiedad in animacion loop alto cuadroFijo; do debe_decir "$A" "\`$propiedad\`"; done
debe_decir "$CP" '`cuadroFijo`'
ya_no_debe_decir "$CP" 'muestra otro cuadro por defecto'
debe_decir "$RV" 'le pasa `animacion` y `loop` en `false`'
debe_decir "$A" '`codigo` `SIN_CONEXION`'
debe_decir "$A" 'No se pudo conectar con el servidor. Intenta de nuevo.'
debe_decir "$CP" '`SIN_CONEXION`'

# Glosario: «Cantidad» va de 1 a 999 y entran las palabras que las specs ya usaban.
debe_decir "$G" 'Es un número entero de 1 a 999.'
ya_no_debe_decir "$G" 'entero, 1 o más'
for termino in 'Editar el precio aplicado' 'Cambiar la cantidad' 'Eliminar detalle' \
  'Volver a la versión anterior' 'Detalles del error'; do
  debe_decir "$G" "| $termino |"
done
for nombre in '`cambiarPrecioAplicado`' '`cambiarCantidad`' '`eliminarDetalle`' '`despliegue/desplegar.sh volver`'; do
  debe_decir "$G" "$nombre"
done
debe_decir "$G" '«detalles del error»'

# requerimientos/: la regla de negocio nueva y la pregunta abierta 9. La resolvió el orquestador con el consentimiento
# general de la persona desarrolladora, que puede confirmarla o revertirla: ningún documento la deja a la vez
# "resuelta" y "por confirmar".
R=requerimientos/README.md
RF=requerimientos/02-requerimientos-funcionales.md
debe_decir "$RF" '| RN-14 | Una venta tiene como máximo 100 detalles.'
debe_decir "$R" '| 9 | ¿Se limita a 100 los detalles de una venta?'
debe_decir "$R" 'Resuelta el 2026-09-30 por el orquestador'
debe_decir "$R" 'consentimiento general que la persona desarrolladora dio para todo el proceso (01:40 y 01:45)'
debe_decir "$R" 'puede confirmarla o revertirla'
ya_no_debe_decir "$R" 'orquestador, por confirmar|sigue por confirmar'
debe_decir "$RF" 'resuelta el 2026-09-30 por el orquestador'
ya_no_debe_decir "$RF" 'por confirmar \(pregunta abierta 9'
debe_decir "$AVA" 'que resolvió el orquestador'
ya_no_debe_decir "$AVA" 'que sigue por confirmar'
debe_decir "$RV" 'puede confirmarla o revertirla'
ya_no_debe_decir "$RV" 'Por confirmar con la persona desarrolladora'
debe_decir "$G" 'ella puede confirmarla o revertirla'
ya_no_debe_decir "$G" 'sigue por confirmar|El máximo de 100 detalles y «orquestador» son propuestas'

# Flujos 03 y 04: el texto dice el máximo de 100 detalles y su línea de Requerimientos cita RN-14. Los diagramas
# BPMN no se tocan: el texto del flujo manda y lo dice cada flujo, hasta que otra tarea actualice el diagrama.
F3=requerimientos/flujos/03-armar-la-venta-actual.md
F4=requerimientos/flujos/04-registrar-venta.md
debe_decir "$F3" 'RN-05 a RN-09 y RN-14.'
debe_decir "$F3" 'no lo agrega y avisa «Una venta puede tener como máximo 100 productos.»'
debe_decir "$F3" 'ya tiene 100 detalles'
debe_decir "$F3" 'no muestra todavía el máximo de 100 detalles'
debe_decir "$F4" 'RN-08 a RN-12 y RN-14.'
debe_decir "$F4" 'tiene de 1 a 100 detalles'
debe_decir "$F4" 'más de 100 detalles'
debe_decir "$F4" 'DEMASIADOS_DETALLES'
debe_decir "$F4" 'no muestra todavía el máximo de 100 detalles'

# Las specs dicen lo mismo que el código de B-02 y de B-04, ya integrado en feature/base (PR #35 y PR #48).
# Backend (B-02): CORS_ORIGIN, puertos, salud, servidor, errores y cuerpos que no son un objeto.
debe_decir "$A" 'como lo manda el navegador en la cabecera `Origin`'
debe_decir "$A" 'sin escribir el puerto 80 ni el 443'
ya_no_debe_decir "$A" 'con esquema y puerto y sin barra final'
debe_decir "$A" 'son enteros de 1 a 65535'
debe_decir "$A" 'Cada archivo CommonJS (`src/`, `db/` y `.sequelizerc`)'
debe_decir "$A" 'la lógica de negocio: salud.js, productos.js, ventas.js'
debe_decir "$A" '`controllers/salud.js` (`obtenerSalud`)'
debe_decir "$A" '`services/salud.js` (`consultarSalud`)'
debe_decir "$A" 'sale con código 1'
debe_decir "$A" '`app.crearApp(config, { montajes })`'
debe_decir "$A" '[@test] ../backend/tests/servidor.test.js'
debe_decir "$A" '[@test] ../backend/tests/database.test.js'
debe_decir "$A" '[@test] ../backend/tests/vitest-commonjs.test.js'
debe_decir "$A" 'La petición no se pudo leer.'
debe_decir "$A" 'antes de llegar al validador'
debe_decir "$A" 'mayúsculas, dígitos y guion bajo'
debe_decir "$A" 'Lanza un `Error` si el estado no es uno de los cinco'
debe_decir "$A" 'Desde B-03 necesita MySQL levantado'
debe_decir "$A" 'el script y `docker-compose.yml` los crea B-03'
debe_decir "$CP" 'o que es un arreglo se trata como un objeto vacío'
ya_no_debe_decir "$CP" 'o que no es un objeto se trata como un objeto'
debe_decir "$RV" 'que no es un objeto ni un arreglo'
ya_no_debe_decir "$RV" 'o un cuerpo que no es un objeto JSON'
debe_decir "$DOC" 'del código y de las pruebas de B-02'
ya_no_debe_decir "$DOC" 'de las pruebas de errores de B-02'

# Frontend (B-04): alias de pruebas, ESLint, arranque, tema, AnimacionLottie, http.js, zonas y lo que B-04 ya dejó hecho.
debe_decir "$A" 'vue/dist/vue.runtime.common.js'
debe_decir "$A" 'Multiple instances of Vue detected'
ya_no_debe_decir "$A" 'sin configuración extra'
debe_decir "$A" '`vue/multi-word-component-names`'
debe_decir "$A" 'ese archivo exporta la instancia'
debe_decir "$A" '`info` y `success` en `#4ECDC4`'
debe_decir "$A" '`customProperties: true`'
debe_decir "$A" 'y la marca y el foco sobre la barra oscura'
debe_decir "$A" '120 por defecto'
debe_decir "$A" 'sin barras al final'
debe_decir "$A" 'el `status` es el de la respuesta'
debe_decir "$A" 'y el total de `VentaActual.vue` lleva `data-total`'
debe_decir "$A" '`frontend/DESIGN.md`'
for spec in "$A" "$BP" "$RV"; do debe_decir "$spec" 'la ruta exacta que importa `AnimacionLottie`'; done
ya_no_debe_decir "$A" '`lottie-web` se sustituye en las pruebas con `vi.mock`'
ya_no_debe_decir "$RV" '`lottie-web` se sustituye con `vi.mock`'
debe_decir "$CP" 'solo se llama con un texto que ya tiene la forma del dinero'
ya_no_debe_decir "$CP" 'se compara en centavos con `aCentavos`'
debe_decir "$CP" 'primera zona de la pantalla (`data-zona="nuevo-producto"`)'
ya_no_debe_decir "$CP" 'en la barra superior de la pantalla principal'
debe_decir "$BP" 'B-04 deja `BuscadorProductos.vue`'
debe_decir "$AVA" 'B-04 ya dejó en `src/ventaActual/ventaActual.js`'
debe_decir "$AVA" 'B-04 ya dejó `VentaActual.vue`'
debe_decir "$AVA" 'un anillo de 3 px en `#292F36`'
ya_no_debe_decir "$AVA" 'si `src/dinero.js` de B-04 no lo hace'

# Segunda revisión de Codex y segunda revisión cruzada: A-01 en el entregable base, tarjetas que corren a la vez y
# comparten archivos, y las frases que todavía decían otra cosa.
F2=requerimientos/flujos/02-buscar-producto.md
debe_decir requerimientos/04-entregables.md 'y la documentación de la API (A-01), en `feature/base`'
debe_decir "$DES" 'D-01 depende del entregable base integrado (B-01 a B-04 y A-01)'
debe_decir "$DES" 'Su PR suma su fila a `requerimientos/04-entregables.md`'
debe_decir "$AVA" 'V-04 va primero'
debe_decir "$AVA" 'pueden correr a la vez'
ya_no_debe_decir "$AVA" 'Cada una depende de la anterior'
debe_decir "$AVA" 'la primera de V-05 y V-06 que se integra'
for spec in "$A" "$CP" "$BP"; do debe_decir "$spec" 'P-03 y P-05 corren a la vez'; done
debe_decir "$A" 'V-05, V-06 y V-07 corren a la vez'
debe_decir "$A" '`frontend/src/api/productos.js`'
# Tercera revisión de Codex (P2): P-02 y P-04 también comparten backend/docs/openapi.yaml, en la ruta /productos.
for spec in "$A" "$CP" "$BP"; do debe_decir "$spec" 'P-02 agrega `post` y P-04 `get`'; done
debe_decir "$CP" 'le pasa `animacion`, `loop` en `false` y `alto` en 32'
ya_no_debe_decir "$CP" 'solo le pasa `animacion` y `loop` en `false`'
debe_decir "$RV" 'ya antepone `/api`'
debe_decir "$RV" '`VentaActual.vue` lo reemite y `App.vue` lo usa con `:enviando.sync`'
ya_no_debe_decir "$RV" '`VentaActual.vue` lo usa con `:enviando.sync`'
debe_decir "$RV" '**Error 500 u otro estado**'
debe_decir "$RV" '[@test] ../frontend/tests/pantalla-venta-actual.test.js'
debe_decir "$F2" 'entra si sobra tiempo'
ya_no_debe_decir "$F2" 'por confirmar|si se confirma|hasta que se confirme'
debe_decir "$A" 'base-de-datos/modelo-producto.test.js'
debe_decir "$A" 'base-de-datos/modelos-venta.test.js'
debe_decir "$A" 'base-de-datos/sp-registrar-venta-migracion.test.js'
ya_no_debe_decir "$A" 'base-de-datos/modelos\.test\.js|base-de-datos/procedimientos\.test\.js'
debe_decir "$A" 'lo prueba `pantalla-venta-actual.test.js`'
# «Código de barras» se dice completo: el glosario tiene «código» a secas en "No decir".
ya_no_debe_decir "$BP" 'con código "|el código "7501055300075"|de ese código va primero|el nombre, el código y el precio'
ya_no_debe_decir "$CP" 'y el código conserva sus ceros|con el código `"0012345"`'

if [ "$fallas" -gt 0 ]; then
  echo "$fallas fallas"
  exit 1
fi
echo "todo bien"
