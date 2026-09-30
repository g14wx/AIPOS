import http from 'node:http';
import { once } from 'node:events';
import request from 'supertest';

// Servidor de las pruebas que llaman a la API con supertest. No es un archivo de pruebas: Vitest solo corre *.test.js.
//
// Con request(app), supertest abre un servidor nuevo en todas las interfaces y le manda la petición a 127.0.0.1. Si
// otro programa de la máquina (el IDE, Docker, Postman) ya escucha solo en 127.0.0.1 en ese puerto, la petición cae en
// ese programa y la prueba recibe una respuesta que no es de la API (issues #58 y #59). Un servidor atado a 127.0.0.1
// no puede compartir el puerto con otro que escuche en esa misma dirección. Ninguna prueba usa request(app): pide con
// pedir(app, ...), o abre un servidor con abrirServidorDePrueba y le pasa ese servidor a request().

// Abre la app en un puerto al azar de 127.0.0.1 y devuelve el servidor, para usarlo como request(servidor).
// Con un host, listen() se ata de forma asíncrona: hay que esperar 'listening'. Si no, supertest ve que el servidor
// todavía no tiene dirección y abre el suyo en todas las interfaces, y no se arregla nada.
export async function abrirServidorDePrueba(app) {
  const servidor = http.createServer(app).listen(0, '127.0.0.1');
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

// El mismo pedir(app, ...) como texto de CommonJS, para los programas que una prueba arranca con `node -e`: no pueden
// importar este módulo, que es de Vitest. Se pega al principio del programa y define `http`, `once`, `request` y
// `pedir`. Como en el módulo, pedir cierra su servidor al terminar: si quedara abierto, el programa no terminaría.
export const PEDIR_DESDE_UN_PROGRAMA = `
  const http = require('node:http');
  const { once } = require('node:events');
  const request = require('supertest');
  async function pedir(app, peticion) {
    const servidor = http.createServer(app).listen(0, '127.0.0.1');
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
