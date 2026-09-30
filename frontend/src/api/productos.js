import http from './http.js';

// Facade: una función por operación, con nombres del glosario. Los componentes llaman a estas funciones y nunca saben
// de rutas ni de axios. Los errores llegan como los deja el interceptor de http.js: un Error con status, codigo,
// mensaje y detalles del error (status 0 si no hubo respuesta).

// Manda POST /productos con los tres campos y devuelve el producto que creó la API, con su id y el precio de 2
// decimales. El precio viaja como texto, como lo escribió el cajero (arquitectura, "Dinero").
export async function crearProducto({ nombre, precio, codigoBarras }) {
  const respuesta = await http.post('/productos', { nombre, precio, codigoBarras });
  return respuesta.data;
}

// Manda GET /productos?busqueda=<texto> y devuelve la lista de productos, que puede estar vacía: cada uno trae id,
// nombre, codigoBarras y el precio como texto con 2 decimales. Axios codifica el texto en la dirección. El texto viaja
// como llega: recortarlo es cosa de la pantalla, y validarlo, de la API.
export async function buscarProductos(texto) {
  const respuesta = await http.get('/productos', { params: { busqueda: texto } });
  return respuesta.data;
}
