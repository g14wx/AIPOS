// Spec armar-venta-actual, "Guardar la venta actual en el navegador (V-04)": src/ventaActual/almacenamiento.js es el único
// archivo del proyecto que toca localStorage, y el módulo de la venta actual (src/ventaActual/) no importa vue, vuetify ni
// axios. Sus funciones son puras: sin componentes, sin fechas ni azar. La prueba lee los archivos de src/ y lo comprueba,
// igual que sin-axios-en-componentes.test.js.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { describe, it, expect } from 'vitest';

// Con jsdom, Vite reescribe new URL(ruta, import.meta.url) a una dirección http: y fileURLToPath falla.
const raiz = resolve(import.meta.dirname, '../../src');

function archivosDe(carpeta, extensiones) {
  if (!existsSync(carpeta)) return [];
  return readdirSync(carpeta).flatMap((nombre) => {
    const ruta = join(carpeta, nombre);
    if (statSync(ruta).isDirectory()) return archivosDe(ruta, extensiones);
    return extensiones.some((extension) => nombre.endsWith(extension)) ? [ruta] : [];
  });
}

const enSrc = (ruta) => relative(raiz, ruta).split(sep).join('/');
const todos = archivosDe(raiz, ['.vue', '.js']);
const delModulo = archivosDe(join(raiz, 'ventaActual'), ['.js', '.vue']);
// Las funciones puras: todo el módulo menos almacenamiento.js, que es quien habla con el navegador.
const puras = delModulo.filter((ruta) => enSrc(ruta) !== 'ventaActual/almacenamiento.js');
const leer = (ruta) => readFileSync(ruta, 'utf8');
const sinComentarios = (texto) =>
  texto.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

// Todo lo que el archivo importa: import ... from 'x', import 'x', import('x') y require('x').
function importaciones(texto) {
  const patrones = [
    /\bfrom\s+['"]([^'"]+)['"]/g,
    /\bimport\s+['"]([^'"]+)['"]/g,
    /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  return patrones.flatMap((patron) =>
    [...texto.matchAll(patron)].map((coincidencia) => coincidencia[1]),
  );
}

describe('el módulo de la venta actual tiene lo que estas pruebas revisan', () => {
  it('existen ventaActual.js y almacenamiento.js, así que las revisiones de abajo no pasan por estar vacías', () => {
    const rutas = delModulo.map(enSrc);
    expect(rutas).toContain('ventaActual/ventaActual.js');
    expect(rutas).toContain('ventaActual/almacenamiento.js');
  });
});

describe('solo almacenamiento.js toca localStorage', () => {
  it('ningún otro archivo de src/ nombra localStorage ni sessionStorage', () => {
    const quienLoToca = todos
      .filter((ruta) => /localStorage|sessionStorage/.test(sinComentarios(leer(ruta))))
      .map(enSrc);
    expect(quienLoToca).toEqual(['ventaActual/almacenamiento.js']);
  });

  it('los componentes se enteran del navegador solo por almacenamiento.js: ninguno toca el almacenamiento', () => {
    for (const ruta of todos.filter((r) => r.endsWith('.vue'))) {
      expect(leer(ruta), enSrc(ruta)).not.toMatch(/localStorage|sessionStorage|indexedDB/);
    }
  });
});

describe('el módulo no depende de la pantalla ni de la red', () => {
  it('ningún archivo de src/ventaActual/ importa vue, vuetify ni axios (ni nada de sus subcarpetas)', () => {
    for (const ruta of delModulo) {
      for (const importado of importaciones(leer(ruta))) {
        expect(importado, `${enSrc(ruta)} importa ${importado}`).not.toMatch(
          /^(vue|vuetify|axios)(\/|$)/,
        );
      }
    }
  });

  it('ni un componente .vue, ni src/api/, ni lottie: el módulo solo conoce dinero.js y a sí mismo', () => {
    for (const ruta of delModulo) {
      for (const importado of importaciones(leer(ruta))) {
        expect(importado, `${enSrc(ruta)} importa ${importado}`).not.toMatch(
          /\.vue$|\/components\/|\/api\/|lottie/,
        );
        expect(importado, `${enSrc(ruta)} importa ${importado}`).toMatch(/^\.\.?\//);
      }
    }
  });

  it('no hay componentes en src/ventaActual/', () => {
    expect(delModulo.filter((ruta) => ruta.endsWith('.vue'))).toEqual([]);
  });
});

describe('las funciones del módulo son puras', () => {
  it('ventaActual.js y validaciones.js no usan el navegador, ni fechas, ni azar', () => {
    expect(puras.length).toBeGreaterThan(0);
    for (const ruta of puras) {
      const codigo = sinComentarios(leer(ruta));
      expect(codigo, enSrc(ruta)).not.toMatch(
        /\b(window|document|navigator|localStorage|sessionStorage|fetch)\b/,
      );
      expect(codigo, enSrc(ruta)).not.toMatch(/\bDate\b|Math\.random|crypto\.|performance\.now/);
      expect(codigo, enSrc(ruta)).not.toMatch(/\bsetTimeout\b|\bsetInterval\b|\bconsole\./);
    }
  });
});
