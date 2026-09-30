import { execFileSync } from 'node:child_process';
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
