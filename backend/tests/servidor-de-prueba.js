import net from 'node:net';
import { once } from 'node:events';
import request from 'supertest';
import crearServidor from '../src/crearServidor.js';

// Servidor de las pruebas que llaman a la API con supertest. No es un archivo de pruebas: Vitest solo corre *.test.js.
//
// Con request(app), supertest abre un servidor nuevo en todas las interfaces y le manda la petición a 127.0.0.1. Si
// otro programa de la máquina (el IDE, Docker, Postman) ya escucha solo en 127.0.0.1 en ese puerto, la petición cae en
// ese programa y la prueba recibe una respuesta que no es de la API (issues #58 y #59). Un servidor atado a 127.0.0.1
// no puede compartir el puerto con otro que escuche en esa misma dirección. Ninguna prueba usa request(app): pide con
// pedir(app, ...), o abre un servidor con abrirServidorDePrueba y le pasa ese servidor a request().

// Abre la app en un puerto al azar de 127.0.0.1 y devuelve el servidor, para usarlo como request(servidor). El servidor
// es el de crearServidor, el mismo que arranca servidor.js: las pruebas hablan con lo que corre en producción.
// Con un host, listen() se ata de forma asíncrona: hay que esperar 'listening'. Si no, supertest ve que el servidor
// todavía no tiene dirección y abre el suyo en todas las interfaces, y no se arregla nada.
export async function abrirServidorDePrueba(app) {
  const servidor = crearServidor(app).listen(0, '127.0.0.1');
  await once(servidor, 'listening');
  return servidor;
}

// Cierra el servidor, también las conexiones que quedaron abiertas.
export function cerrarServidorDePrueba(servidor) {
  return new Promise((resolver) => {
    servidor.close(resolver);
    servidor.closeAllConnections();
  });
}

// Lo que usa una prueba en lugar de request(app): abre un servidor en 127.0.0.1 para la app, le pasa a `peticion` el
// request de supertest que habla con él y lo cierra al terminar, aunque la petición falle. Devuelve lo que devuelva
// `peticion`, que casi siempre es la petición de supertest, y `await` la convierte en la respuesta:
//
//   const respuesta = await pedir(app, (api) => api.get('/api/salud').set('Origin', origen));
export async function pedir(app, peticion) {
  const servidor = await abrirServidorDePrueba(app);
  try {
    return await peticion(request(servidor));
  } finally {
    await cerrarServidorDePrueba(servidor);
  }
}

// Escribe una petición HTTP a mano en un socket y devuelve, como texto, todo lo que el servidor contesta hasta que
// cierra la conexión. Sirve para lo que supertest no puede mandar: una petición mal formada, o una que Node contesta
// antes de que llegue a Express (issue #60). `destino` es un servidor abierto o un puerto de 127.0.0.1. La petición
// tiene que llevar `Connection: close`, para que el servidor cierre al contestar.
export function enviarCrudo(destino, peticion) {
  const puerto = typeof destino === 'number' ? destino : destino.address().port;
  return new Promise((resolver, rechazar) => {
    const socket = net.connect({ host: '127.0.0.1', port: puerto });
    let respuesta = '';
    let error;
    socket.setEncoding('utf8');
    socket.setTimeout(5000, () => {
      socket.destroy(new Error('El servidor no cerró la conexión en 5 segundos.'));
    });
    socket.on('data', (trozo) => {
      respuesta += trozo;
    });
    // Un servidor que cierra con datos sin leer puede terminar con ECONNRESET después de contestar.
    socket.on('error', (err) => {
      error = err;
    });
    socket.on('close', () => (respuesta === '' && error ? rechazar(error) : resolver(respuesta)));
    socket.write(peticion);
  });
}

// El mismo pedir(app, ...) como texto de CommonJS, para los programas que una prueba arranca con `node -e`: no pueden
// importar este módulo, que es de Vitest. Se pega al principio del programa, que corre en la carpeta del backend, y
// define `once`, `request`, `crearServidor` y `pedir`. Como en el módulo, pedir cierra su servidor al terminar: si quedara abierto, el programa no terminaría.
export const PEDIR_DESDE_UN_PROGRAMA = `
  const { once } = require('node:events');
  const request = require('supertest');
  const crearServidor = require('./src/crearServidor.js');
  async function pedir(app, peticion) {
    const servidor = crearServidor(app).listen(0, '127.0.0.1');
    await once(servidor, 'listening');
    try {
      return await peticion(request(servidor));
    } finally {
      await new Promise((resolver) => {
        servidor.close(resolver);
        servidor.closeAllConnections();
      });
    }
  }
`;
