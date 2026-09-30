// Spec de arquitectura, sección "Íconos y animaciones": los JSON de Lottie viven en src/assets/animaciones/, pesan
// menos de 50 KB cada uno, usan los colores de la paleta y solo hay cuatro (venta-vacia, producto-creado,
// venta-registrada y buscando). B-04 crea la carpeta y el componente; cada tarjeta agrega la animación que le toca,
// así que esta prueba revisa las que existan y no exige que estén las cuatro.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

// Con jsdom, Vite reescribe new URL(ruta, import.meta.url) a una dirección http: y fileURLToPath falla.
const carpeta = resolve(import.meta.dirname, '../src/assets/animaciones');
const permitidas = [
  'venta-vacia.json',
  'producto-creado.json',
  'venta-registrada.json',
  'buscando.json',
];
const paleta = ['#292F36', '#4ECDC4', '#F7FFF7', '#FF6B6B', '#FFE66D', '#FFFFFF'];

const archivos = existsSync(carpeta)
  ? readdirSync(carpeta).filter((nombre) => nombre.endsWith('.json'))
  : [];

function aHex([r, g, b]) {
  return (
    '#' +
    [r, g, b]
      .map((c) =>
        Math.round(c * 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
      .toUpperCase()
  );
}

// Recorre el JSON y junta cada color fijo de relleno (fl) o trazo (st): { ty: 'fl', c: { k: [r, g, b, a] } }.
function coloresDe(nodo, encontrados = []) {
  if (Array.isArray(nodo)) {
    nodo.forEach((hijo) => coloresDe(hijo, encontrados));
  } else if (nodo && typeof nodo === 'object') {
    if (
      (nodo.ty === 'fl' || nodo.ty === 'st') &&
      nodo.c &&
      Array.isArray(nodo.c.k) &&
      typeof nodo.c.k[0] === 'number'
    ) {
      encontrados.push(aHex(nodo.c.k));
    }
    Object.values(nodo).forEach((hijo) => coloresDe(hijo, encontrados));
  }
  return encontrados;
}

function distancia(a, b) {
  const [ra, ga, ba] = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const [rb, gb, bb] = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return Math.max(Math.abs(ra - rb), Math.abs(ga - gb), Math.abs(ba - bb));
}

describe('carpeta de animaciones', () => {
  it('existe src/assets/animaciones/', () => {
    expect(existsSync(carpeta)).toBe(true);
  });

  it('solo trae las cuatro animaciones de la spec', () => {
    for (const nombre of archivos) {
      expect(permitidas, `${nombre} no es una de las cuatro`).toContain(nombre);
    }
  });
});

describe.each(archivos)('animación %s', (nombre) => {
  const ruta = join(carpeta, nombre);

  it('pesa menos de 50 KB', () => {
    expect(statSync(ruta).size).toBeLessThan(50 * 1024);
  });

  it('es un Lottie válido: JSON con versión, cuadros por segundo, cuadros, tamaño y capas', () => {
    const datos = JSON.parse(readFileSync(ruta, 'utf8'));
    for (const clave of ['v', 'fr', 'ip', 'op', 'w', 'h', 'layers']) {
      expect(datos, clave).toHaveProperty(clave);
    }
    expect(datos.op).toBeGreaterThan(datos.ip);
    expect(Array.isArray(datos.layers)).toBe(true);
    expect(datos.layers.length).toBeGreaterThan(0);
  });

  it('usa solo los colores de la paleta (más el blanco de la superficie)', () => {
    const colores = coloresDe(JSON.parse(readFileSync(ruta, 'utf8')));
    for (const color of colores) {
      const cercano = Math.min(...paleta.map((p) => distancia(color, p)));
      expect(cercano, `${nombre} usa ${color}, que no es de la paleta`).toBeLessThanOrEqual(2);
    }
  });

  it('no evalúa expresiones: lottie_light no las soporta', () => {
    expect(readFileSync(ruta, 'utf8')).not.toMatch(/"x"\s*:\s*"var\s/);
  });
});

// P-03: producto-creado.json es el aviso "Producto creado": una palomita que se dibuja en 1 a 1,5 segundos, en el
// turquesa y la tinta de la paleta, y que al terminar queda dibujada por completo (es el cuadro que se ve con menos
// movimiento).
function buscar(nodo, predicado) {
  if (Array.isArray(nodo)) {
    for (const hijo of nodo) {
      const encontrado = buscar(hijo, predicado);
      if (encontrado) return encontrado;
    }
  } else if (nodo && typeof nodo === 'object') {
    if (predicado(nodo)) return nodo;
    for (const hijo of Object.values(nodo)) {
      const encontrado = buscar(hijo, predicado);
      if (encontrado) return encontrado;
    }
  }
  return null;
}

describe('animación producto-creado.json (P-03)', () => {
  const ruta = join(carpeta, 'producto-creado.json');
  const datos = existsSync(ruta) ? JSON.parse(readFileSync(ruta, 'utf8')) : {};

  it('existe en src/assets/animaciones/', () => {
    expect(existsSync(ruta)).toBe(true);
  });

  it('dura de 1 a 1,5 segundos', () => {
    const segundos = (datos.op - datos.ip) / datos.fr;
    expect(segundos).toBeGreaterThanOrEqual(1);
    expect(segundos).toBeLessThanOrEqual(1.5);
  });

  it('es cuadrada, para que a 32 px de alto se vea entera', () => {
    expect(datos.w).toBe(datos.h);
  });

  it('usa el turquesa y la tinta de la paleta', () => {
    const colores = coloresDe(datos);
    expect(colores).toContain('#4ECDC4');
    expect(colores).toContain('#292F36');
  });

  it('la palomita se dibuja con un trazo recortado y ya está completa antes del último cuadro', () => {
    const recorte = buscar(datos, (nodo) => nodo.ty === 'tm');
    expect(recorte, 'debe haber un recorte de trazo (trim path)').not.toBeNull();
    const claves = recorte.e.k;
    expect(Array.isArray(claves)).toBe(true);
    const ultima = claves[claves.length - 1];
    expect(ultima.s[0]).toBe(100);
    expect(ultima.t).toBeLessThanOrEqual(datos.op - datos.ip - 1);
  });
});
