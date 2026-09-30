import { describe, it, expect, vi } from 'vitest';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { enviarCrudo } from './servidor-de-prueba.js';

// Estas pruebas arrancan `node src/servidor.js` como lo hace `npm start`: el código de salida
// y el mensaje son lo que ve quien levanta la API, y no se pueden probar con supertest(app).
vi.setConfig({ testTimeout: 20000 });

const backend = path.resolve(import.meta.dirname, '..');

// Abre un puerto libre y lo deja abierto: la API que se arranque en él encuentra el puerto ocupado.
function abrirUnPuerto() {
  return new Promise((resolver, rechazar) => {
    const ocupante = net.createServer();
    ocupante.once('error', rechazar);
    ocupante.listen(0, () => resolver(ocupante));
  });
}

async function buscarPuertoLibre() {
  const ocupante = await abrirUnPuerto();
  const { port } = ocupante.address();
  await new Promise((resolver) => ocupante.close(resolver));
  return port;
}

// Variables de mentira: la prueba no depende del .env de nadie ni de MySQL (la API no lo usa al arrancar).
function arrancarServidor(puerto) {
  const hijo = spawn(process.execPath, ['src/servidor.js'], {
    cwd: backend,
    env: {
      ...process.env,
      NODE_ENV: 'development',
      PORT: String(puerto),
      CORS_ORIGIN: 'http://localhost:5173',
      MYSQL_DATABASE: 'aipos',
      MYSQL_USER: 'aipos',
      MYSQL_PASSWORD: 'clave-solo-para-pruebas',
    },
  });
  const proceso = { hijo, salida: '', errores: '' };
  hijo.stdout.on('data', (trozo) => (proceso.salida += trozo));
  hijo.stderr.on('data', (trozo) => (proceso.errores += trozo));
  proceso.termino = new Promise((resolver) => hijo.once('close', resolver));
  return proceso;
}

// Si algo se cuelga, la prueba falla con un mensaje y no deja el servidor vivo.
function conPlazo(proceso, promesa, queEspera) {
  let plazo;
  const vencido = new Promise((_, rechazar) => {
    plazo = setTimeout(() => {
      proceso.hijo.kill('SIGKILL');
      rechazar(new Error(`Pasaron 10 segundos y no ${queEspera}. Salida: ${proceso.salida}`));
    }, 10000);
  });
  return Promise.race([promesa, vencido]).finally(() => clearTimeout(plazo));
}

function esperarQueEscuche(proceso) {
  return new Promise((resolver) =>
    proceso.hijo.stdout.on('data', () => proceso.salida.includes('escuchando') && resolver()),
  );
}

describe('servidor.js', () => {
  it('con el puerto ocupado avisa que está ocupado, no dice que escucha y sale con código 1', async () => {
    const ocupante = await abrirUnPuerto();
    try {
      const puerto = ocupante.address().port;
      const proceso = arrancarServidor(puerto);
      const codigo = await conPlazo(proceso, proceso.termino, 'terminó');
      expect(proceso.errores).toContain('EADDRINUSE');
      expect(proceso.errores).toContain(`puerto ${puerto}`);
      expect(proceso.salida).not.toMatch(/escuchando/);
      expect(codigo).toBe(1);
    } finally {
      ocupante.close();
    }
  });

  it('con el puerto libre escucha, lo avisa y se apaga con SIGTERM sin error', async () => {
    const puerto = await buscarPuertoLibre();
    const proceso = arrancarServidor(puerto);
    await conPlazo(proceso, esperarQueEscuche(proceso), 'escuchó');
    expect(proceso.salida).toContain(`escuchando en el puerto ${puerto}`);
    proceso.hijo.kill('SIGTERM');
    const codigo = await conPlazo(proceso, proceso.termino, 'se apagó');
    expect(codigo).toBe(0);
    expect(proceso.errores).toBe('');
  });
  // Issue #60: Node contesta un 431 vacío antes de que la petición llegue a Express. El arreglo vive en
  // crearServidor, y esta prueba comprueba que servidor.js lo usa: con la API arrancada como la arranca `npm start`.
  it('una dirección de más de 16 KB recibe un 400 con el formato de error, no el 431 vacío de Node', async () => {
    const puerto = await buscarPuertoLibre();
    const proceso = arrancarServidor(puerto);
    try {
      await conPlazo(proceso, esperarQueEscuche(proceso), 'escuchó');
      const pedida = (x) =>
        `GET /api/no-existe?x=${x} HTTP/1.1\r\nHost: prueba\r\nConnection: close\r\n\r\n`;

      const larga = await enviarCrudo(puerto, pedida('a'.repeat(20_000)));
      expect(larga).toMatch(/^HTTP\/1\.1 400 Bad Request\r\n/);
      expect(larga).toMatch(/^Content-Type: application\/json/im);
      expect(JSON.parse(larga.split('\r\n\r\n')[1])).toEqual({
        error: { codigo: 'DATOS_INVALIDOS', mensaje: expect.any(String) },
      });

      // Bajo el límite de 16 KB, la petición llega a Express y responde como siempre: un 404 con el formato de error.
      const normal = await enviarCrudo(puerto, pedida('a'.repeat(15_000)));
      expect(normal).toMatch(/^HTTP\/1\.1 404 Not Found\r\n/);
      expect(JSON.parse(normal.split('\r\n\r\n')[1]).error.codigo).toBe('NO_ENCONTRADO');
    } finally {
      proceso.hijo.kill('SIGTERM');
      await proceso.termino;
    }
  });
});
