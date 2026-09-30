import { aCentavos } from './dinero.js';

// Las reglas del formulario de producto (RN-01, RN-02 y RN-04) como funciones puras: reciben lo que escribió el cajero y
// devuelven true o el texto del error, que es la forma que Vuetify espera en `rules`. No tocan la pantalla, así que se
// prueban sin montar nada. Revisan lo mismo y dicen lo mismo que la API (specs/crear-producto.spec.md, tabla del
// contrato), en el mismo orden: cada campo muestra solo su primer problema.
// También leen lo que contesta la API (leerErrorDeLaApi): traducen su formato de error al del formulario.

export const LARGO_MAXIMO_NOMBRE = 120;
export const LARGO_MAXIMO_CODIGO_BARRAS = 50;

export const MENSAJES = Object.freeze({
  obligatorio: 'Es obligatorio.',
  nombreLargo: 'No puede pasar de 120 caracteres.',
  codigoBarrasLargo: 'No puede pasar de 50 caracteres.',
  precioSinFormato: 'Debe ser un número con punto decimal, por ejemplo 25.50.',
  precioConDemasiadosDecimales: 'No puede tener más de 2 decimales.',
  precioMayorQueElMaximo: 'No puede ser mayor que 99999.99.',
  precioEnCero: 'Debe ser mayor que 0.',
  codigoBarrasRepetido: 'Ya existe un producto con ese código de barras.',
});

const MENSAJE_INESPERADO = 'Ocurrió un error inesperado. Intenta de nuevo.';

const recortar = (valor) => (typeof valor === 'string' ? valor.trim() : '');
// Los largos se cuentan en caracteres, como los cuenta MySQL, y no en unidades de UTF-16: un emoji cuenta 1.
const largoEnCaracteres = (texto) => [...texto].length;
const estaVacio = (valor) => valor === null || valor === undefined || valor === '';

const reglasDeTexto = (maximo, mensajeLargo) => [
  (valor) => recortar(valor) !== '' || MENSAJES.obligatorio,
  (valor) => largoEnCaracteres(recortar(valor)) <= maximo || mensajeLargo,
];

export const reglasNombre = reglasDeTexto(LARGO_MAXIMO_NOMBRE, MENSAJES.nombreLargo);
export const reglasCodigoBarras = reglasDeTexto(
  LARGO_MAXIMO_CODIGO_BARRAS,
  MENSAJES.codigoBarrasLargo,
);

// Dígitos con un punto opcional. Los enteros y los decimales se cuentan aparte, como los revisa la API.
const FORMA_DEL_PRECIO = /^(\d+)(?:\.(\d+))?$/;

function partesDelPrecio(valor) {
  const partes = typeof valor === 'string' ? FORMA_DEL_PRECIO.exec(valor) : null;
  return partes ? { enteros: partes[1], decimales: partes[2] ?? '' } : null;
}

// El precio no se recorta, igual que en la API: " 25" es un error. Cada regla deja pasar lo que ya marcó una anterior.
export const reglasPrecio = [
  (valor) => !estaVacio(valor) || MENSAJES.obligatorio,
  (valor) => estaVacio(valor) || partesDelPrecio(valor) !== null || MENSAJES.precioSinFormato,
  (valor) => {
    const partes = partesDelPrecio(valor);
    return !partes || partes.decimales.length <= 2 || MENSAJES.precioConDemasiadosDecimales;
  },
  // El máximo se revisa con la forma del texto, igual que en la API: más de 5 dígitos enteros pasa de 99999.99. Así no se
  // comparan ni se suman decimales de JavaScript.
  (valor) => {
    const partes = partesDelPrecio(valor);
    if (!partes || partes.decimales.length > 2) return true;
    return partes.enteros.length <= 5 || MENSAJES.precioMayorQueElMaximo;
  },
  // aCentavos solo se llama con un texto que ya tiene la forma del dinero (hasta 5 enteros y 2 decimales): con otro
  // lanza un Error.
  (valor) => {
    const partes = partesDelPrecio(valor);
    if (!partes || partes.decimales.length > 2 || partes.enteros.length > 5) return true;
    return aCentavos(valor) > 0 || MENSAJES.precioEnCero;
  },
];

// El texto de la primera regla que falla, o '' si todas pasan.
export function primerMensaje(reglas, valor) {
  for (const regla of reglas) {
    const resultado = regla(valor);
    if (resultado !== true) return resultado;
  }
  return '';
}

export const CAMPOS = ['nombre', 'precio', 'codigoBarras'];

const REGLAS_POR_CAMPO = {
  nombre: reglasNombre,
  precio: reglasPrecio,
  codigoBarras: reglasCodigoBarras,
};

// El mensaje de cada campo ('' si está bien).
export function revisarProducto(producto) {
  return Object.fromEntries(
    CAMPOS.map((campo) => [campo, primerMensaje(REGLAS_POR_CAMPO[campo], producto[campo])]),
  );
}

// Lo que la pantalla manda: nombre y código de barras sin espacios en los extremos, y el precio tal como se escribió.
export function limpiarProducto({ nombre, precio, codigoBarras }) {
  return { nombre: recortar(nombre), precio, codigoBarras: recortar(codigoBarras) };
}

// Anti-Corruption Layer: convierte el error de la API (status, codigo, mensaje y los detalles del error, como los deja http.js) en lo
// que muestra el formulario: el mensaje de cada campo y, si no es de un campo, el de la franja de error del modal.
export function leerErrorDeLaApi(error) {
  if (!(error instanceof Error) || typeof error.status !== 'number') {
    return { campos: {}, franja: MENSAJE_INESPERADO };
  }
  if (error.status === 409 && error.codigo === 'CODIGO_BARRAS_DUPLICADO') {
    return { campos: { codigoBarras: MENSAJES.codigoBarrasRepetido }, franja: '' };
  }
  const campos = {};
  const deCamposDesconocidos = [];
  const detalles = error.status === 400 && Array.isArray(error.detalles) ? error.detalles : [];
  for (const detalle of detalles) {
    if (!detalle || typeof detalle.mensaje !== 'string' || detalle.mensaje === '') continue;
    if (!CAMPOS.includes(detalle.campo)) deCamposDesconocidos.push(detalle.mensaje);
    else if (!(detalle.campo in campos)) campos[detalle.campo] = detalle.mensaje;
  }
  if (Object.keys(campos).length > 0 || deCamposDesconocidos.length > 0) {
    return { campos, franja: deCamposDesconocidos.join(' ') };
  }
  return { campos: {}, franja: error.mensaje || MENSAJE_INESPERADO };
}
