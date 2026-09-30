import { insertarProducto } from './ayudas-productos.js';

// Ayudas de las pruebas de las tablas ventas y detalles_venta. No es un archivo de pruebas: Vitest solo
// corre *.test.js. Se usan dentro de `conTransaccionDescartada` (ayudas-productos.js): lo que guardan
// lo descarta esa transacción, así una prueba no deja filas en ninguna tabla, ni siquiera cuando falla.

// Los números de error de MySQL que estas pruebas esperan (los que la API lee en err.parent.errno).
export const ER_BAD_NULL_ERROR = 1048;
export const ER_DUP_ENTRY = 1062;
export const ER_WARN_DATA_OUT_OF_RANGE = 1264;
export const ER_NO_DEFAULT_FOR_FIELD = 1364;
export const ER_ROW_IS_REFERENCED = 1451;
export const ER_NO_REFERENCED_ROW = 1452;
export const ER_CHECK_CONSTRAINT_VIOLATED = 3819;

// Guarda una venta con SQL directo. No manda `fecha`: la pone MySQL (RN-12). Devuelve el id de la venta.
export function insertarVenta(consultar, { total = '0.00' } = {}) {
  return consultar('INSERT INTO ventas (total) VALUES (:total)', { total });
}

// Guarda un detalle de venta con SQL directo, sin pasar por el modelo ni por el procedimiento.
export function insertarDetalle(
  consultar,
  { ventaId, productoId, cantidad = 1, precioAplicado = '10.00', subtotal = '10.00' },
) {
  return consultar(
    `INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio_aplicado, subtotal)
     VALUES (:ventaId, :productoId, :cantidad, :precioAplicado, :subtotal)`,
    { ventaId, productoId, cantidad, precioAplicado, subtotal },
  );
}

// Guarda un producto y una venta sin detalles. Devuelve sus ids.
export async function insertarProductoYVenta(consultar, codigoBarras = 'LECHE-1') {
  const productoId = await insertarProducto(consultar, {
    nombre: 'Leche entera 1 L',
    precio: '25.00',
    codigoBarras,
  });
  const ventaId = await insertarVenta(consultar);
  return { productoId, ventaId };
}

// Guarda `cuantos` productos distintos, con un solo INSERT, y devuelve sus ids en orden.
export async function insertarProductos(consultar, cuantos) {
  const codigos = Array.from({ length: cuantos }, (_, i) => `MASIVO-${i + 1}`);
  const valores = codigos.map((_, i) => `('Producto ${i + 1}', '10.00', :codigo${i})`).join(', ');
  const replacements = Object.fromEntries(codigos.map((codigo, i) => [`codigo${i}`, codigo]));
  await consultar(
    `INSERT INTO productos (nombre, precio, codigo_barras) VALUES ${valores}`,
    replacements,
  );
  const filas = await consultar(
    "SELECT id FROM productos WHERE codigo_barras LIKE 'MASIVO-%' ORDER BY id",
  );
  return filas.map((fila) => fila.id);
}
