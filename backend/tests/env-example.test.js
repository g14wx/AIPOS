import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const raiz = path.resolve(import.meta.dirname, '../..');
const ejemplo = fs.readFileSync(path.join(raiz, '.env.example'), 'utf8');

function variablesDelEjemplo() {
  return Object.fromEntries(
    ejemplo
      .split('\n')
      .filter((linea) => /^[A-Z_]+=/.test(linea))
      .map((linea) => [linea.slice(0, linea.indexOf('=')), linea.slice(linea.indexOf('=') + 1)]),
  );
}

function archivosJs(carpeta) {
  return fs.readdirSync(carpeta, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = path.join(carpeta, entrada.name);
    if (entrada.isDirectory()) return archivosJs(ruta);
    return ruta.endsWith('.js') ? [ruta] : [];
  });
}

describe('.env.example', () => {
  it('tiene cada variable que lee src/config.js', () => {
    const codigo = fs.readFileSync(path.join(raiz, 'backend/src/config.js'), 'utf8');
    // config.js nombra las variables de dos formas: env.NOMBRE y 'NOMBRE' entre comillas
    // (texto(env, 'NOMBRE'), entero(env, 'NOMBRE', ...) y la lista OBLIGATORIAS). Se buscan las dos.
    const usadas = new Set(
      [
        ...codigo.matchAll(/\b(?:env|process\.env)\.([A-Z][A-Z0-9_]*)/g),
        ...codigo.matchAll(/['"]([A-Z][A-Z0-9_]*)['"]/g),
      ].map((m) => m[1]),
    );
    // Si la búsqueda deja de ver las variables, la prueba pasaría sin revisar nada
    // (antes veía 1 de 9): con menos de 8 falla.
    expect(usadas.size).toBeGreaterThanOrEqual(8);
    // NODE_ENV no va en .env.example: la pone quien corre el comando, y los scripts de prueba la fijan.
    const sinEjemplo = new Set(['NODE_ENV']);
    const ejemploVars = variablesDelEjemplo();
    for (const variable of usadas) {
      if (sinEjemplo.has(variable)) continue;
      expect(ejemploVars, `falta ${variable} en .env.example`).toHaveProperty(variable);
    }
  });

  it('solo src/config.js lee process.env en el backend (src/, db/ y scripts/)', () => {
    const unico = path.join(raiz, 'backend/src/config.js');
    const otros = ['backend/src', 'backend/db', 'backend/scripts']
      .flatMap((carpeta) => archivosJs(path.join(raiz, carpeta)))
      .filter((ruta) => ruta !== unico && /process\.env/.test(fs.readFileSync(ruta, 'utf8')))
      .map((ruta) => path.relative(raiz, ruta));
    expect(otros).toEqual([]);
  });

  it('ninguna clave lleva un valor que parezca un secreto real', () => {
    for (const [nombre, valor] of Object.entries(variablesDelEjemplo())) {
      if (/PASSWORD|SECRET|TOKEN|KEY/.test(nombre)) {
        expect(valor, nombre).toMatch(/^cambiar-/);
      }
    }
  });

  it('avisa con un comentario que las claves cambiar- son de ejemplo', () => {
    expect(ejemplo).toMatch(/^# .*cambiar-/m);
  });

  it('.env.example está en git y .env no', () => {
    const versionados = execFileSync('git', ['ls-files', '.env.example', '.env'], {
      cwd: raiz,
      encoding: 'utf8',
    })
      .split('\n')
      .filter(Boolean);
    expect(versionados).toEqual(['.env.example']);
    // git check-ignore sale con 0 si .env está ignorado
    expect(() => execFileSync('git', ['check-ignore', '-q', '.env'], { cwd: raiz })).not.toThrow();
  });
});
