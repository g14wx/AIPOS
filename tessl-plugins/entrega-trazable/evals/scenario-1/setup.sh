#!/usr/bin/env bash
set -euo pipefail
git init -q -b main
git config user.email "persona@example.com"
git config user.name "Persona"
git add README.md docs
git commit -qm "chore: estructura inicial del proyecto"
git branch ProductionEnv
git switch -q -c feature/productos ProductionEnv
mkdir -p src
cat > src/productos.js <<'JS'
const productos = [];

function agregarProducto({ nombre, precio, codigoBarras }) {
  if (productos.some((p) => p.codigoBarras === codigoBarras)) {
    throw new Error('CODIGO_BARRAS_REPETIDO');
  }
  const producto = { id: productos.length + 1, nombre, precio, codigoBarras };
  productos.push(producto);
  return producto;
}

module.exports = { agregarProducto, productos };
JS
git add src/productos.js
git commit -qm "feat(productos): agregar producto con nombre, precio y código de barras"
cat >> src/productos.js <<'JS'

function buscarProductos(texto) {
  const t = texto.toLowerCase();
  return productos.filter((p) => p.nombre.toLowerCase().includes(t) || p.codigoBarras === texto);
}

module.exports.buscarProductos = buscarProductos;
JS
git add src/productos.js
git commit -qm "feat(productos): buscar producto por nombre o código de barras"
