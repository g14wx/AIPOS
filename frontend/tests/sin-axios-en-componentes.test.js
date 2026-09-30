// Spec de arquitectura, secciones "Servicio de API" y "La venta actual": ningún componente importa axios ni
// escribe una URL, ninguno toca localStorage ni contiene la lógica de la venta actual, y nada lee process.env.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { describe, it, expect } from 'vitest';

// Con jsdom, Vite reescribe new URL(ruta, import.meta.url) a una dirección http: y fileURLToPath falla.
const raiz = resolve(import.meta.dirname, '../src');

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
const componentes = archivosDe(raiz, ['.vue']);
const fueraDeApi = todos.filter((ruta) => !enSrc(ruta).startsWith('api/'));
const leer = (ruta) => readFileSync(ruta, 'utf8');

describe('src/ tiene lo que estas pruebas revisan', () => {
  it('existen App.vue y src/api/http.js, así que las revisiones de abajo no pasan por estar vacías', () => {
    const rutas = todos.map(enSrc);
    expect(rutas).toContain('App.vue');
    expect(rutas).toContain('api/http.js');
    expect(rutas).toContain('main.js');
  });
});

describe('solo src/api/ conoce a axios y las URL', () => {
  it('ningún archivo fuera de src/api/ importa axios', () => {
    for (const ruta of fueraDeApi) {
      expect(leer(ruta), enSrc(ruta)).not.toMatch(/from\s+['"]axios['"]|require\(\s*['"]axios['"]\s*\)|import\(\s*['"]axios['"]\s*\)/);
    }
  });

  it('ningún componente escribe una URL (http://, https:// o una ruta /api/)', () => {
    for (const ruta of componentes) {
      const texto = leer(ruta);
      expect(texto, enSrc(ruta)).not.toMatch(/https?:\/\//);
      expect(texto, enSrc(ruta)).not.toMatch(/['"`]\/api\//);
    }
  });

  it('ningún archivo fuera de src/api/ llama a http.js directamente: los componentes usan las funciones de productos.js y ventas.js', () => {
    for (const ruta of fueraDeApi) {
      expect(leer(ruta), enSrc(ruta)).not.toMatch(/from\s+['"][^'"]*api\/http(\.js)?['"]/);
    }
  });

  it('dentro de src/api/, solo http.js importa axios', () => {
    const deApi = todos.filter((ruta) => enSrc(ruta).startsWith('api/') && enSrc(ruta) !== 'api/http.js');
    for (const ruta of deApi) {
      expect(leer(ruta), enSrc(ruta)).not.toMatch(/from\s+['"]axios['"]/);
    }
  });
});

describe('el navegador no tiene process.env', () => {
  it('ningún archivo de src/ lee process.env: la configuración sale de import.meta.env.VITE_*', () => {
    for (const ruta of todos) {
      expect(leer(ruta), enSrc(ruta)).not.toMatch(/process\.env/);
    }
  });
});

describe('la venta actual no vive en los componentes', () => {
  it('ningún componente toca localStorage: solo src/ventaActual/almacenamiento.js', () => {
    for (const ruta of componentes) {
      expect(leer(ruta), enSrc(ruta)).not.toMatch(/localStorage|sessionStorage/);
    }
    const quienLoToca = todos.filter((ruta) => /localStorage/.test(leer(ruta))).map(enSrc);
    for (const ruta of quienLoToca) {
      expect(ruta).toBe('ventaActual/almacenamiento.js');
    }
  });

  it('ningún componente define las funciones de la venta actual, solo las importa de src/ventaActual/', () => {
    const funciones = ['agregarAVentaActual', 'cambiarPrecioAplicado', 'cambiarCantidad', 'eliminarDetalle', 'calcularTotal'];
    for (const ruta of componentes) {
      const texto = leer(ruta);
      for (const funcion of funciones) {
        expect(texto, `${enSrc(ruta)} define ${funcion}`).not.toMatch(
          new RegExp(`function\\s+${funcion}\\b|(const|let|var)\\s+${funcion}\\s*=|\\b${funcion}\\s*\\([^)]*\\)\\s*\\{`)
        );
      }
    }
  });

  it('src/ventaActual/ existe y no lleva componentes', () => {
    const carpeta = join(raiz, 'ventaActual');
    expect(existsSync(carpeta)).toBe(true);
    expect(archivosDe(carpeta, ['.vue'])).toEqual([]);
    expect(archivosDe(carpeta, ['.js']).length).toBeGreaterThan(0);
  });
});

describe('nada con datos del cajero se pinta como HTML (RNF-04)', () => {
  it('ningún componente usa v-html ni innerHTML', () => {
    for (const ruta of todos) {
      expect(leer(ruta), enSrc(ruta)).not.toMatch(/v-html|innerHTML|domProps\s*:\s*\{\s*innerHTML/);
    }
  });
});
