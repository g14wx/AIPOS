'use strict';

const http = require('node:http');
const ErrorApi = require('./errors/ErrorApi');
const aFormatoDeError = require('./errors/aFormatoDeError');

// Node lee la dirección y las cabeceras de una petición antes de que llegue a Express. Si pasan de 16 KB (su límite),
// contesta un 431 sin cuerpo y ni helmet ni el manejador de errores lo ven: la API respondería con un estado que no es
// uno de los cinco de RNF-05 y fuera del formato de error (issue #60). Aquí se contesta con el formato de error.
// El mensaje es el mismo para todos y no repite lo que mandó el cliente.
const CABECERAS_MUY_GRANDES = new ErrorApi(
  400,
  'DATOS_INVALIDOS',
  'La dirección o las cabeceras de la petición son demasiado grandes.',
);

// La respuesta completa, lista para escribirla en el socket: no hay objeto de respuesta de Express para armarla.
function respuestaHttp(errorApi) {
  const cuerpo = JSON.stringify(aFormatoDeError(errorApi));
  return Buffer.from(
    [
      `HTTP/1.1 ${errorApi.estado} ${http.STATUS_CODES[errorApi.estado]}`,
      'Content-Type: application/json; charset=utf-8',
      `Content-Length: ${Buffer.byteLength(cuerpo)}`,
      'Connection: close',
      '',
      cuerpo,
    ].join('\r\n'),
  );
}

const RESPUESTA_CABECERAS_MUY_GRANDES = respuestaHttp(CABECERAS_MUY_GRANDES);

// Igual que la respuesta por defecto de Node: solo se escribe si el socket se puede escribir y si ninguna respuesta en
// curso ya mandó sus cabeceras (un 400 en medio de ella la corrompería). Después se destruye el socket, sin pasarle el
// error: así no sale un evento 'error' del socket que nadie escuche.
function responderCabecerasMuyGrandes(socket) {
  if (socket.writable && !socket._httpMessage?._headerSent) {
    socket.write(RESPUESTA_CABECERAS_MUY_GRANDES);
  }
  socket.destroy();
}

// Un servidor de Node que contesta con el formato de error a las cabeceras de más de 16 KB. Node avisa de un error del
// cliente con el evento `clientError`; aquí se atiende ese (código HPE_HEADER_OVERFLOW) y todos los demás pasan sin
// cambios. No se agrega un oyente con `server.on('clientError', ...)` porque, con un oyente, Node deja de contestar
// por su cuenta a los demás errores del cliente (408 al agotarse el tiempo, 400 a una petición mal formada) y habría
// que copiar esas respuestas. Sin oyente, siguen siendo las de Node.
class Servidor extends http.Server {
  emit(evento, ...argumentos) {
    if (evento === 'clientError') {
      const [err, socket] = argumentos;
      if (err?.code === 'HPE_HEADER_OVERFLOW') {
        responderCabecerasMuyGrandes(socket);
        return true;
      }
    }
    return super.emit(evento, ...argumentos);
  }
}

// Crea el servidor de la app, sin ponerlo a escuchar: servidor.js lo abre en PORT y las pruebas, en un puerto al azar
// de 127.0.0.1. Así las pruebas hablan con el mismo servidor que corre en producción.
function crearServidor(app) {
  return new Servidor(app);
}

module.exports = crearServidor;
