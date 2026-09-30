const productos = [
  { id: 1, nombre: 'Leche entera 1 L', precio: '25.00', codigoBarras: '7501055300075' },
  { id: 2, nombre: 'Pan de caja', precio: '42.50', codigoBarras: '7501000111206' },
];

function agregarProducto({ nombre, precio, codigoBarras }) {
  if (productos.some((p) => p.codigoBarras === codigoBarras)) {
    throw new Error('CODIGO_BARRAS_REPETIDO');
  }
  const producto = { id: productos.length + 1, nombre, precio, codigoBarras };
  productos.push(producto);
  return producto;
}

function buscarProductos(texto) {
  const t = texto.toLowerCase();
  return productos.filter((p) => p.nombre.toLowerCase().includes(t) || p.codigoBarras === texto);
}

module.exports = { agregarProducto, buscarProductos, productos };
