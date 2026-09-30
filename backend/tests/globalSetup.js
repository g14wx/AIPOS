import { execFileSync } from 'node:child_process';
import path from 'node:path';

// Test Fixture: antes de correr las pruebas, deja la base de prueba con todas las migraciones aplicadas.
// Es el mismo script que corre una persona (`npm run migrar:prueba`), que solo toca la base de prueba.
// Necesita MySQL levantado y la base de prueba creada (`npm run preparar-prueba`).
const carpetaBackend = path.resolve(import.meta.dirname, '..');

export async function setup() {
  try {
    execFileSync('npm', ['run', '--silent', 'migrar:prueba'], {
      cwd: carpetaBackend,
      env: process.env,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    const detalle = `${error.stdout ?? ''}${error.stderr ?? ''}`.trim();
    throw new Error(
      'No se pudo migrar la base de prueba. ¿Está MySQL levantado (docker compose up -d --wait mysql) ' +
        `y creada la base de prueba (npm run preparar-prueba)?\n${detalle}`,
      { cause: error },
    );
  }
}
