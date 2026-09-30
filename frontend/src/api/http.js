import axios from 'axios';

const MENSAJE_SIN_CONEXION = 'No se pudo conectar con el servidor. Intenta de nuevo.';
const MENSAJE_INESPERADO = 'Ocurrió un error inesperado. Intenta de nuevo.';

// Vite solo deja pasar al navegador lo que empieza con VITE_. Sin esta variable no hay a quién llamar.
const urlDeLaApi = import.meta.env.VITE_API_URL;
if (!urlDeLaApi) {
  throw new Error(
    'Falta la variable de entorno VITE_API_URL: es la dirección del backend, sin /api al final.',
  );
}

const http = axios.create({ baseURL: `${urlDeLaApi.replace(/\/+$/, '')}/api`, timeout: 10000 });

function crearError({ status, codigo, mensaje, detalles = [] }) {
  return Object.assign(new Error(mensaje), { status, codigo, mensaje, detalles });
}

// El error de una respuesta que no es la de la API ni la que la spec espera (el HTML de un 502, o un 2xx que no es el que
// fija la spec): el status de la respuesta, ERROR_INTERNO y un mensaje genérico. Su cuerpo nunca se muestra tal cual.
export function errorInesperado(status) {
  return crearError({ status, codigo: 'ERROR_INTERNO', mensaje: MENSAJE_INESPERADO });
}

// Todo error sale con la misma forma: status, codigo, mensaje y detalles (el formato de error de la API).
// Sin respuesta (sin red, servidor apagado o más de 10 segundos) el status vale 0.
function traducirError(errorDeAxios) {
  const { response } = errorDeAxios;
  if (!response) {
    return crearError({ status: 0, codigo: 'SIN_CONEXION', mensaje: MENSAJE_SIN_CONEXION });
  }
  const cuerpo = response.data?.error;
  if (typeof cuerpo?.codigo === 'string' && typeof cuerpo?.mensaje === 'string') {
    const detalles = Array.isArray(cuerpo.detalles) ? cuerpo.detalles : [];
    return crearError({
      status: response.status,
      codigo: cuerpo.codigo,
      mensaje: cuerpo.mensaje,
      detalles,
    });
  }
  // Una respuesta que no viene de la API (por ejemplo, el HTML de un 502): nunca se muestra tal cual.
  return errorInesperado(response.status);
}

http.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => Promise.reject(traducirError(error)),
);

export default http;
