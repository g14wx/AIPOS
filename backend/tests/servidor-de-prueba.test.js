import { describe, it, expect } from 'vitest';
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import { promisify } from 'node:util';
import {
  abrirServidorDePrueba,
  cerrarServidorDePrueba,
  enviarCrudo,
  pedir,
  PEDIR_DESDE_UN_PROGRAMA,
} from './servidor-de-prueba.js';

// Pruebas del ayudante que abre el servidor de las pruebas con supertest (issues #58 y #59). No necesitan MySQL:
// usan una app de Express de mentira.
//
// Con request(app), supertest abre un servidor en todas las interfaces y le manda la petición a 127.0.0.1. Si otro
// programa de la máquina (el IDE, Docker, Postman) escucha solo en 127.0.0.1 en ese puerto, el sistema le entrega la
// petición a ese programa, y la prueba recibe una respuesta que no es de la API: un 403, un 400 o un socket hang up.
const require = createRequire(import.meta.url);
const express = require('express');

// Una app de mentira que dice quién la atiende y por dónde le llegó la conexión.
function appDeMentira() {
  const app = express();
  app.get('/donde', (req, res) => {
    res.json({
      origen: 'app de mentira',
      direccion: req.socket.localAddress,
      puerto: req.socket.localPort,
    });
  });
  return app;
}

// true si el servidor acepta una conexión TCP en esa dirección y ese puerto.
function aceptaConexiones(host, puerto) {
  return new Promise((resolver) => {
    const socket = net.connect({ host, port: puerto });
    socket.setTimeout(3000, () => {
      socket.destroy();
      resolver(false);
    });
    socket.once('connect', () => {
      socket.destroy();
      resolver(true);
    });
    socket.once('error', () => resolver(false));
  });
}

// Las direcciones IPv4 de la máquina que no son de loopback: la de la red local, la de Docker...
function direccionesDeLaMaquina() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((interfaz) => interfaz.family === 'IPv4' && !interfaz.internal)
    .map((interfaz) => interfaz.address);
}

describe('abrirServidorDePrueba', () => {
  it('escucha solo en 127.0.0.1 y ya tiene dirección cuando la promesa se cumple', async () => {
    const servidor = await abrirServidorDePrueba(appDeMentira());
    try {
      // Con un host, listen() se ata de forma asíncrona: sin esperar 'listening', address() sería null.
      expect(servidor.address()).toMatchObject({ address: '127.0.0.1', family: 'IPv4' });
    } finally {
      await cerrarServidorDePrueba(servidor);
    }
  });

  it('no acepta conexiones por otra dirección de la máquina ni por ::1', async () => {
    const servidor = await abrirServidorDePrueba(appDeMentira());
    try {
      const { port } = servidor.address();
      // Control: por 127.0.0.1 sí acepta, así que un "no acepta" de abajo es cierto y no un fallo de la ayuda.
      expect(await aceptaConexiones('127.0.0.1', port)).toBe(true);
      for (const host of [...direccionesDeLaMaquina(), '::1']) {
        expect(await aceptaConexiones(host, port), host).toBe(false);
      }
    } finally {
      await cerrarServidorDePrueba(servidor);
    }
  });

  it('cerrarServidorDePrueba cierra también las conexiones que quedaron abiertas', async () => {
    const servidor = await abrirServidorDePrueba(appDeMentira());
    const socket = net.connect(servidor.address().port, '127.0.0.1');
    await once(socket, 'connect');
    socket.write('GET /donde HTTP/1.1\r\nHost: prueba\r\nConnection: keep-alive\r\n\r\n');
    await once(socket, 'data');
    const inicio = Date.now();
    await cerrarServidorDePrueba(servidor);
    // Sin cerrar la conexión abierta, close() esperaría hasta que el cliente la cierre.
    expect(Date.now() - inicio).toBeLessThan(1000);
    socket.destroy();
  });
});

describe('pedir', () => {
  it('le manda la petición a la app que se le pasa y devuelve la respuesta', async () => {
    const respuesta = await pedir(appDeMentira(), (api) => api.get('/donde'));
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.origen).toBe('app de mentira');
  });

  it('la atiende un servidor atado a 127.0.0.1 y no uno en todas las interfaces', async () => {
    const respuesta = await pedir(appDeMentira(), (api) => api.get('/donde'));
    // Un servidor en todas las interfaces ve la conexión como ::ffff:127.0.0.1.
    expect(respuesta.body.direccion).toBe('127.0.0.1');
  });

  it('cierra el servidor al terminar', async () => {
    const respuesta = await pedir(appDeMentira(), (api) => api.get('/donde'));
    expect(await aceptaConexiones('127.0.0.1', respuesta.body.puerto)).toBe(false);
  });

  it('cierra el servidor aunque la petición falle, y deja pasar el error', async () => {
    let puerto;
    const app = express();
    app.get('/falla', (req, res) => {
      puerto = req.socket.localPort;
      res.status(500).json({});
    });
    await expect(pedir(app, (api) => api.get('/falla').expect(200))).rejects.toThrow(/200/);
    expect(await aceptaConexiones('127.0.0.1', puerto)).toBe(false);
  });

  it('deja pasar el error de la función que arma la petición', async () => {
    await expect(
      pedir(appDeMentira(), () => {
        throw new Error('se rompió al armar la petición');
      }),
    ).rejects.toThrow('se rompió al armar la petición');
  });
});

describe('enviarCrudo', () => {
  it('manda la petición tal cual y devuelve la respuesta completa, con la línea de estado', async () => {
    const servidor = await abrirServidorDePrueba(appDeMentira());
    try {
      const pedida = 'GET /donde HTTP/1.1\r\nHost: prueba\r\nConnection: close\r\n\r\n';
      const respuesta = await enviarCrudo(servidor, pedida);
      expect(respuesta).toMatch(/^HTTP\/1\.1 200 OK\r\n/);
      expect(JSON.parse(respuesta.split('\r\n\r\n')[1])).toMatchObject({
        origen: 'app de mentira',
      });
      // Con el puerto en lugar del servidor habla con el mismo.
      expect(await enviarCrudo(servidor.address().port, pedida)).toMatch(/^HTTP\/1\.1 200 OK/);
    } finally {
      await cerrarServidorDePrueba(servidor);
    }
  });
});

// Programas de la máquina que escuchan solo en 127.0.0.1, en puertos altos, y contestan otra cosa. Con request(app) el
// sistema entrega a uno de ellos cerca del 1 % de las peticiones cuando hay unos 200 (issue #58).
async function abrirProgramasAjenos(cantidad) {
  const ajenos = [];
  while (ajenos.length < cantidad) {
    const ajeno = http.createServer((req, res) => res.writeHead(403).end('Invalid CSRF token'));
    ajeno.listen(49152 + Math.floor(Math.random() * 16383), '127.0.0.1');
    try {
      await once(ajeno, 'listening');
      ajenos.push(ajeno);
    } catch {
      // El puerto ya lo tenía otro programa: se prueba con otro.
    }
  }
  return ajenos;
}

describe('con otros programas escuchando en 127.0.0.1', () => {
  it('ninguna petición cae en ellos: todas llegan a la app de la prueba', async () => {
    const ajenos = await abrirProgramasAjenos(150);
    const app = appDeMentira();
    try {
      const ajenas = [];
      for (let i = 0; i < 600; i += 1) {
        const respuesta = await pedir(app, (api) => api.get('/donde'));
        if (respuesta.status !== 200 || respuesta.body.origen !== 'app de mentira') {
          ajenas.push(`${i}: ${respuesta.status} ${respuesta.text}`);
        }
      }
      expect(ajenas).toEqual([]);
    } finally {
      await Promise.all(ajenos.map((ajeno) => cerrarServidorDePrueba(ajeno)));
    }
  }, 60_000);
});

// Algunas pruebas arrancan un programa aparte con `node -e`, que no puede importar el ayudante (es un módulo de
// Vitest): reciben el mismo pedir(app, ...) como texto de CommonJS.
describe('PEDIR_DESDE_UN_PROGRAMA', () => {
  it('define pedir(app, ...) con un servidor en 127.0.0.1 y deja que el programa termine solo', async () => {
    const programa = `
      ${PEDIR_DESDE_UN_PROGRAMA}
      const app = require('express')();
      app.get('/donde', (req, res) => res.json({ direccion: req.socket.localAddress }));
      (async () => {
        const respuesta = await pedir(app, (api) => api.get('/donde'));
        console.log(JSON.stringify({ estado: respuesta.status, direccion: respuesta.body.direccion }));
      })();
    `;
    // Si el servidor quedara abierto, el programa no terminaría y execFile lo mataría a los 15 segundos.
    const { stdout } = await promisify(execFile)('node', ['-e', programa], {
      cwd: path.resolve(import.meta.dirname, '..'),
      encoding: 'utf8',
      timeout: 15_000,
    });
    expect(JSON.parse(stdout)).toEqual({ estado: 200, direccion: '127.0.0.1' });
  }, 20_000);
});

// Todas las pruebas con supertest usan esta ayuda. Sin esta revisión, una prueba nueva con request(app) vuelve a
// abrir el servidor en todas las interfaces y falla al azar en la máquina de quien la corre (issues #58 y #59).
function archivosJs(carpeta) {
  return fs.readdirSync(carpeta, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = path.join(carpeta, entrada.name);
    if (entrada.isDirectory()) return archivosJs(ruta);
    return ruta.endsWith('.js') ? [ruta] : [];
  });
}

// El código de un archivo sin los comentarios, con el mismo número de líneas.
function sinComentarios(codigo) {
  return codigo
    .replace(/\/\*[\s\S]*?\*\//g, (comentario) => comentario.replace(/[^\n]/g, ''))
    .replace(/(^|\s)\/\/.*$/gm, '$1');
}

// request(x) o supertest(x) con algo que no es `servidor`, el servidor que abre abrirServidorDePrueba.
const LLAMADA_CON_UNA_APP = /\b(?:request|supertest)\(\s*(?!servidor\b)[\w$'"`]/;

describe('las pruebas del backend', () => {
  it('ninguna le pasa una app a supertest: piden con pedir(app, ...) de servidor-de-prueba.js', () => {
    const esta = path.join(import.meta.dirname, 'servidor-de-prueba.test.js');
    const infractoras = archivosJs(import.meta.dirname)
      .filter((ruta) => ruta !== esta)
      .flatMap((ruta) =>
        sinComentarios(fs.readFileSync(ruta, 'utf8'))
          .split('\n')
          .flatMap((linea, i) =>
            LLAMADA_CON_UNA_APP.test(linea)
              ? [`${path.relative(import.meta.dirname, ruta)}:${i + 1}  ${linea.trim()}`]
              : [],
          ),
      );
    expect(infractoras).toEqual([]);
  });

  it('la revisión reconoce las llamadas que busca y deja pasar las que no', () => {
    for (const linea of [
      'await request(app).get(ruta)',
      'request(laApp).post(ruta)',
      "const r = supertest('http://localhost:3000')",
      'request(appConRequire)',
    ]) {
      expect(LLAMADA_CON_UNA_APP.test(linea), linea).toBe(true);
    }
    for (const linea of [
      'return request(servidor).get(ruta)',
      'export const api = () => request(servidor);',
      'const pedir = (direccion) => request(servidor).get(direccion);',
      "import request from 'supertest';",
    ]) {
      expect(LLAMADA_CON_UNA_APP.test(linea), linea).toBe(false);
    }
  });
});
