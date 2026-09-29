import { http } from './http';

// GET /productos?q=texto -> [{ id, nombre, precio, codigoBarras }]
// Matches the name partially or the barcode exactly. precio is a string such as "12.50".
export async function buscarProductos(texto) {
  const { data } = await http.get('/productos', { params: { q: texto } });
  return data;
}

// POST /ventas with { detalles: [{ productoId, cantidad, precioAplicado }] } -> { id, total }
export async function registrarVenta(venta) {
  const { data } = await http.post('/ventas', venta);
  return data;
}
