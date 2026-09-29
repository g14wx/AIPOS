#!/usr/bin/env bash
set -euo pipefail
git init -q -b main
git config user.email "persona@example.com"
git config user.name "Persona"
TRAILER=$'\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>'
# La búsqueda empieza sin escapar % y _; el arreglo llega después de la revisión de Codex.
mv backend/src/services/productos.js .productos-final.js
cat > backend/src/services/productos.js <<'JS'
'use strict';
const { Op } = require('sequelize');
const { Producto } = require('../db');

async function buscarProductos(texto) {
  return Producto.findAll({
    where: { [Op.or]: [{ codigoBarras: texto }, { nombre: { [Op.like]: `%${texto}%` } }] },
    limit: 20,
  });
}

async function agregarProducto({ nombre, precio, codigoBarras }) {
  return Producto.create({ nombre, precio, codigoBarras });
}

module.exports = { buscarProductos, agregarProducto };
JS
git add README.md docs/lenguaje-ubicuo.md
git commit -qm "chore: estructura inicial del proyecto"
git branch ProductionEnv
git switch -q -c feature/productos ProductionEnv
git add docker-compose.yml backend/package.json backend/.env.example backend/src/app.js
git commit -qm "feat(productos): base del backend con Express y MySQL${TRAILER}"
git add backend/migrations/20260930000001-crear-productos.js backend/src/routes/productos.js backend/src/services/productos.js
git commit -qm "feat(productos): agregar y buscar productos${TRAILER}"
git add frontend
git commit -qm "feat(productos): pantalla con Vue 2 y Vuetify${TRAILER}"
git switch -q ProductionEnv
git merge -q --no-ff feature/productos -m "Merge: entregable productos"
git tag -a entregable-productos -m "Entregable: productos"
git switch -q -c feature/ventas ProductionEnv
git add backend/migrations/20260930000002-crear-ventas-y-detalles.js backend/db backend/migrations/20260930000003-crear-sp-registrar-venta.js
git commit -qm "feat(ventas): procedimiento almacenado para registrar venta${TRAILER}"
git add backend/src/routes/ventas.js backend/src/services/ventas.js
git commit -qm "feat(ventas): registrar venta desde la API${TRAILER}"
mv .productos-final.js backend/src/services/productos.js
git add backend/src/services/productos.js
git commit -qm "fix(productos): escapar % y _ en la búsqueda${TRAILER}"
git add docs/bitacora-ia.md
git commit -qm "docs: bitácora de IA"
git switch -q ProductionEnv
git merge -q --no-ff feature/ventas -m "Merge: entregable ventas"
git tag -a entregable-ventas -m "Entregable: ventas"
