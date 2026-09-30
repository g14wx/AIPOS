import { execFileSync } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';

// Ayudas de las pruebas que hablan con MySQL. No es un archivo de pruebas: Vitest solo corre *.test.js.
export const carpetaBackend = path.resolve(import.meta.dirname, '..', '..');
export const carpetaRaiz = path.resolve(carpetaBackend, '..');

// Corre un script de package.json del backend (por ejemplo `migrar:prueba`) y devuelve su salida.
// Si el script termina con error, lanza una excepción con lo que escribió.
export function correrNpm(script, env = {}) {
  return execFileSync('npm', ['run', '--silent', script], {
    cwd: carpetaBackend,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

// Corre sequelize-cli directo (por ejemplo `db:migrate:undo:all --env test`), desde la carpeta del backend.
export function correrCli(...argumentos) {
  return execFileSync('npx', ['--no-install', 'sequelize-cli', ...argumentos], {
    cwd: carpetaBackend,
    env: process.env,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

// Igual que correrNpm, pero no lanza: devuelve el código de salida y lo que escribió.
export function correrNpmSinFallar(script, env = {}) {
  try {
    return { codigo: 0, salida: correrNpm(script, env) };
  } catch (error) {
    return {
      codigo: error.status ?? 1,
      salida: `${error.stdout ?? ''}${error.stderr ?? ''}`,
    };
  }
}

// Nombres de las tablas que hay ahora en la base a la que apunta `sequelize`, ordenados.
export async function tablasDeLaBase(sequelize) {
  const [filas] = await sequelize.query(
    'SELECT table_name AS nombre FROM information_schema.tables WHERE table_schema = DATABASE() ORDER BY table_name',
  );
  return filas.map((fila) => fila.nombre);
}

// Un intermediario TCP entre la API y MySQL. Mientras no esté congelado, reenvía todo tal cual. Con
// `congelar()` deja de reenviar datos en los dos sentidos sin cerrar ninguna conexión: para el cliente,
// MySQL sigue conectado pero ya no contesta, igual que con `docker compose pause mysql`.
export async function crearProxyCongelable(host, puerto) {
  let congelado = false;
  const sockets = new Set();
  const servidor = net.createServer((cliente) => {
    const mysql = net.connect({ host, port: puerto });
    for (const socket of [cliente, mysql]) {
      sockets.add(socket);
      socket.on('error', () => {});
      socket.on('close', () => sockets.delete(socket));
    }
    cliente.on('data', (datos) => {
      if (!congelado) mysql.write(datos);
    });
    mysql.on('data', (datos) => {
      if (!congelado) cliente.write(datos);
    });
    cliente.on('close', () => mysql.destroy());
    mysql.on('close', () => cliente.destroy());
  });
  await new Promise((resolve) => servidor.listen(0, '127.0.0.1', resolve));
  return {
    puerto: servidor.address().port,
    congelar: () => {
      congelado = true;
    },
    cerrar: async () => {
      sockets.forEach((socket) => socket.destroy());
      await new Promise((resolve) => servidor.close(resolve));
    },
  };
}
