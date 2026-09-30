import http from './http.js';

// Facade: una función por operación, con nombres del glosario. Los componentes llaman a estas funciones y nunca saben
// de rutas ni de axios. Los errores llegan como los deja el interceptor de http.js: un Error con status, codigo,
// mensaje y detalles del error (status 0 si no hubo respuesta).

// Manda POST /ventas con los detalles de la venta actual y devuelve { ventaId, total }: el número de la venta y el total
// que calculó MySQL, como texto con 2 decimales (RN-09). De cada detalle solo salen el producto, la cantidad y el precio
// aplicado: el nombre es para mostrarlo en la pantalla, y el subtotal y el total no se mandan, porque los calcula MySQL.
export async function registrarVenta(detalles) {
  const cuerpo = {
    detalles: detalles.map(({ productoId, cantidad, precioAplicado }) => ({
      productoId,
      cantidad,
      precioAplicado,
    })),
  };
  const respuesta = await http.post('/ventas', cuerpo);
  const { ventaId, total } = respuesta.data;
  return { ventaId, total };
}
