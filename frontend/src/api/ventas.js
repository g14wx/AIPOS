import http, { errorInesperado } from './http.js';

// Facade: una función por operación, con nombres del glosario. Los componentes llaman a estas funciones y nunca saben
// de rutas ni de axios. Los errores llegan como los deja el interceptor de http.js: un Error con status, codigo,
// mensaje y detalles del error (status 0 si no hubo respuesta).

// El total que calcula MySQL (DECIMAL(12,2)) llega como texto con 2 decimales (RN-09).
const FORMA_DEL_TOTAL = /^\d+\.\d{2}$/;

// Lo que fija la spec de registrar venta para una venta guardada: un 201 con ventaId entero de 1 o más y el total como
// texto con 2 decimales. axios resuelve cualquier 2xx, y un 200, 202 o 204 (un proxy, por ejemplo) o un 201 sin esa forma
// no dicen qué venta se guardó (#93).
function esUnaVentaRegistrada({ status, data }) {
  return (
    status === 201 &&
    Number.isInteger(data?.ventaId) &&
    data.ventaId >= 1 &&
    typeof data.total === 'string' &&
    FORMA_DEL_TOTAL.test(data.total)
  );
}

// Manda POST /ventas con los detalles de la venta actual y devuelve { ventaId, total }: el número de la venta y el total
// que calculó MySQL, como texto con 2 decimales (RN-09). De cada detalle solo salen el producto, la cantidad y el precio
// aplicado: el nombre es para mostrarlo en la pantalla, y el subtotal y el total no se mandan, porque los calcula MySQL.
// Anti-Corruption Layer: lo que no es la respuesta de la spec no entra a la pantalla como venta registrada. Es un Error con
// la misma forma que los de http.js (el status de la respuesta, ERROR_INTERNO y el mensaje genérico) y la pantalla lo
// muestra como el de cualquier otro estado, sin vaciar la venta actual.
export async function registrarVenta(detalles) {
  const cuerpo = {
    detalles: detalles.map(({ productoId, cantidad, precioAplicado }) => ({
      productoId,
      cantidad,
      precioAplicado,
    })),
  };
  const respuesta = await http.post('/ventas', cuerpo);
  if (!esUnaVentaRegistrada(respuesta)) throw errorInesperado(respuesta.status);
  const { ventaId, total } = respuesta.data;
  return { ventaId, total };
}
