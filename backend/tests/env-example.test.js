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
    const usadas = [...codigo.matchAll(/\b(?:env|process\.env)\.([A-Z][A-Z0-9_]*)/g)].map(
      (m) => m[1],
    );
    expect(usadas.length).toBeGreaterThan(0);
    const ejemploVars = variablesDelEjemplo();
    for (const variable of new Set(usadas)) {
      expect(ejemploVars, `falta ${variable} en .env.example`).toHaveProperty(variable);
    }
  });

  it('solo src/config.js lee process.env en el backend', () => {
    const src = path.join(raiz, 'backend/src');
    const otros = archivosJs(src).filter(
      (ruta) =>
        path.basename(ruta) !== 'config.js' && /process\.env/.test(fs.readFileSync(ruta, 'utf8')),
    );
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
