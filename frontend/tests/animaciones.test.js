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

// P-05: buscando.json es la espera de la búsqueda, y se repite mientras dura: un código de barras que un haz turquesa
// recorre de arriba abajo y de vuelta. Su primer y su último cuadro son iguales, así que no salta al repetirse y, con
// menos movimiento, el cuadro fijo (el último) es el código de barras con el haz en el centro.
describe('animación buscando.json (P-05)', () => {
  const ruta = join(carpeta, 'buscando.json');
  const datos = existsSync(ruta) ? JSON.parse(readFileSync(ruta, 'utf8')) : {};

  // Las propiedades animadas de Lottie: { a: 1, k: [cuadros clave con t y s] }.
  function animadas(nodo, encontradas = []) {
    if (Array.isArray(nodo)) {
      nodo.forEach((hijo) => animadas(hijo, encontradas));
    } else if (nodo && typeof nodo === 'object') {
      if (nodo.a === 1 && Array.isArray(nodo.k)) encontradas.push(nodo.k);
      Object.values(nodo).forEach((hijo) => animadas(hijo, encontradas));
    }
    return encontradas;
  }

  it('existe en src/assets/animaciones/', () => {
    expect(existsSync(ruta)).toBe(true);
  });

  it('cada vuelta dura de 1 a 2,5 segundos', () => {
    const segundos = (datos.op - datos.ip) / datos.fr;
    expect(segundos).toBeGreaterThanOrEqual(1);
    expect(segundos).toBeLessThanOrEqual(2.5);
  });

  it('es cuadrada, para que a 48 px de alto se vea entera', () => {
    expect(datos.w).toBe(datos.h);
  });

  it('usa la tinta y el turquesa de la paleta', () => {
    const colores = coloresDe(datos);
    expect(colores).toContain('#292F36');
    expect(colores).toContain('#4ECDC4');
  });

  it('no tiene fondo: se ve sobre la superficie blanca de la zona de resultados', () => {
    expect((datos.layers ?? []).some((capa) => capa.ty === 1)).toBe(false);
  });

  it('se mueve: tiene al menos una propiedad animada', () => {
    expect(animadas(datos).length).toBeGreaterThan(0);
  });

  it('es un ciclo: cada propiedad animada termina donde empezó, sin salto al repetirse', () => {
    for (const claves of animadas(datos)) {
      const primera = claves[0];
      const ultima = claves[claves.length - 1];
      expect(ultima.s, 'el último cuadro clave debe valer lo mismo que el primero').toEqual(
        primera.s,
      );
      expect(primera.t).toBe(datos.ip);
      expect(ultima.t).toBe(datos.op);
    }
  });

  it('solo una capa se mueve, el haz: el código de barras queda quieto', () => {
    const conMovimiento = (datos.layers ?? []).filter((capa) => animadas(capa).length > 0);
    expect(conMovimiento).toHaveLength(1);
  });
});

// V-04: venta-vacia.json es el estado vacío de la venta actual («Busca un producto para empezar la venta»): un comprobante
// en blanco que flota despacio, con su primera fila en turquesa respirando (esperando el primer producto) y la franja
// amarilla del total. Se repite mientras la venta actual está vacía, así que su primer y su último cuadro son iguales y no
// salta al repetirse. Con menos movimiento se ve el último cuadro, y ese ya es el comprobante completo.
describe('animación venta-vacia.json (V-04)', () => {
  const ruta = join(carpeta, 'venta-vacia.json');
  const datos = existsSync(ruta) ? JSON.parse(readFileSync(ruta, 'utf8')) : {};

  // Las propiedades animadas de Lottie: { a: 1, k: [cuadros clave con t y s] }.
  function animadas(nodo, encontradas = []) {
    if (Array.isArray(nodo)) {
      nodo.forEach((hijo) => animadas(hijo, encontradas));
    } else if (nodo && typeof nodo === 'object') {
      if (nodo.a === 1 && Array.isArray(nodo.k)) encontradas.push(nodo.k);
      Object.values(nodo).forEach((hijo) => animadas(hijo, encontradas));
    }
    return encontradas;
  }

  it('existe en src/assets/animaciones/', () => {
    expect(existsSync(ruta)).toBe(true);
  });

  it('cada vuelta dura de 2 a 4 segundos: es calma, no llama la atención', () => {
    const segundos = (datos.op - datos.ip) / datos.fr;
    expect(segundos).toBeGreaterThanOrEqual(2);
    expect(segundos).toBeLessThanOrEqual(4);
  });

  it('es cuadrada, para que a 112 px de alto se vea entera', () => {
    expect(datos.w).toBe(datos.h);
  });

  it('usa la tinta, el turquesa y el amarillo de la paleta: las tres partes de la pantalla', () => {
    const colores = coloresDe(datos);
    expect(colores).toContain('#292F36');
    expect(colores).toContain('#4ECDC4');
    expect(colores).toContain('#FFE66D');
  });

  it('no tiene fondo: se ve sobre la superficie blanca de la tarjeta', () => {
    expect((datos.layers ?? []).some((capa) => capa.ty === 1)).toBe(false);
  });

  it('se mueve: tiene al menos una propiedad animada', () => {
    expect(animadas(datos).length).toBeGreaterThan(0);
  });

  it('es un ciclo: cada propiedad animada termina donde empezó, sin salto al repetirse', () => {
    for (const claves of animadas(datos)) {
      const primera = claves[0];
      const ultima = claves[claves.length - 1];
      expect(ultima.s, 'el último cuadro clave debe valer lo mismo que el primero').toEqual(
        primera.s,
      );
      expect(primera.t).toBe(datos.ip);
      expect(ultima.t).toBe(datos.op);
    }
  });

  it('con menos movimiento se ve el último cuadro y ahí nada está apagado: la opacidad empieza y termina en 100', () => {
    const opacidades = (datos.layers ?? []).flatMap((capa) =>
      capa.ks?.o?.a === 1 ? [capa.ks.o.k] : [],
    );
    expect(opacidades.length).toBeGreaterThan(0);
    for (const claves of opacidades) {
      expect(claves[0].s).toEqual([100]);
      expect(claves[claves.length - 1].s).toEqual([100]);
    }
  });
});

// V-08: venta-registrada.json es el aviso «Venta registrada»: el comprobante de la venta ya completo, con su franja amarilla
// del total y un sello de palomita. Se anima una sola vez en cerca de 1,5 segundos (RegistrarVenta.vue la pasa con loop en
// false) y se queda quieta unos cuadros al final: ese estado completo es el cuadro fijo que se ve con menos movimiento.
describe('animación venta-registrada.json (V-08)', () => {
  const ruta = join(carpeta, 'venta-registrada.json');
  const datos = existsSync(ruta) ? JSON.parse(readFileSync(ruta, 'utf8')) : {};
  const ultimoCuadro = datos.op - 1;

  // Las propiedades animadas de Lottie: { a: 1, k: [cuadros clave con t y s] }.
  function animadas(nodo, encontradas = []) {
    if (Array.isArray(nodo)) {
      nodo.forEach((hijo) => animadas(hijo, encontradas));
    } else if (nodo && typeof nodo === 'object') {
      if (nodo.a === 1 && Array.isArray(nodo.k)) encontradas.push(nodo.k);
      Object.values(nodo).forEach((hijo) => animadas(hijo, encontradas));
    }
    return encontradas;
  }
  const capa = (nombre) => (datos.layers ?? []).find((candidata) => candidata.nm === nombre);

  it('existe en src/assets/animaciones/', () => {
    expect(existsSync(ruta)).toBe(true);
  });

  it('dura cerca de 1,5 segundos', () => {
    const segundos = (datos.op - datos.ip) / datos.fr;
    expect(segundos).toBeGreaterThanOrEqual(1.3);
    expect(segundos).toBeLessThanOrEqual(1.7);
  });

  it('es cuadrada, para que a 48 px de alto se vea entera', () => {
    expect(datos.w).toBe(datos.h);
  });

  it('usa la tinta, el turquesa y el amarillo de la paleta: el papel, el sello y la franja del total', () => {
    const colores = coloresDe(datos);
    expect(colores).toContain('#292F36');
    expect(colores).toContain('#4ECDC4');
    expect(colores).toContain('#FFE66D');
  });

  it('no tiene fondo: se ve sobre la franja de éxito', () => {
    expect((datos.layers ?? []).some((capa) => capa.ty === 1)).toBe(false);
  });

  it('se mueve: tiene al menos una propiedad animada', () => {
    expect(animadas(datos).length).toBeGreaterThan(0);
  });

  it('ningún cuadro clave pasa del último cuadro, y todo termina de moverse antes de una pausa de al menos 5 cuadros', () => {
    const tiempos = animadas(datos).flatMap((claves) => claves.map((clave) => clave.t));
    expect(Math.max(...tiempos)).toBeLessThanOrEqual(ultimoCuadro - 5);
  });

  it('cada capa se ve hasta el último cuadro: con menos movimiento no falta nada en el cuadro fijo', () => {
    for (const capaDelDibujo of datos.layers) {
      expect(capaDelDibujo.op, capaDelDibujo.nm).toBeGreaterThanOrEqual(datos.op);
    }
  });

  it('en el último cuadro todo está completo: la opacidad y las escalas animadas terminan en 100', () => {
    const opacidades = (datos.layers ?? []).flatMap((capaDelDibujo) =>
      capaDelDibujo.ks?.o?.a === 1 ? [capaDelDibujo.ks.o.k] : [],
    );
    expect(opacidades.length).toBeGreaterThan(0);
    for (const claves of opacidades) expect(claves[claves.length - 1].s).toEqual([100]);
    const escalas = animadas(datos).filter(
      (claves) => claves[0].s.length >= 2 && claves[0].s[0] === 0,
    );
    expect(escalas.length).toBeGreaterThan(0);
    for (const claves of escalas) {
      expect(claves[claves.length - 1].s.slice(0, 2)).toEqual([100, 100]);
    }
  });

  it('el sello aparece con un pequeño rebote: su escala pasa de 100 y vuelve a 100', () => {
    const claves = capa('Sello').ks.s.k;
    expect(Math.max(...claves.map((clave) => clave.s[0]))).toBeGreaterThan(100);
    expect(claves[claves.length - 1].s[0]).toBe(100);
  });

  it('la palomita se dibuja con un trazo recortado y ya está completa antes de la pausa final', () => {
    const recorte = buscar(datos, (nodo) => nodo.ty === 'tm');
    expect(recorte, 'debe haber un recorte de trazo (trim path)').not.toBeNull();
    const claves = recorte.e.k;
    expect(Array.isArray(claves)).toBe(true);
    const ultima = claves[claves.length - 1];
    expect(ultima.s[0]).toBe(100);
    expect(ultima.t).toBeLessThanOrEqual(ultimoCuadro - 5);
  });

  it('la palomita llega después que el sello: primero se estampa y luego se dibuja', () => {
    const inicioDelSello = capa('Sello').ks.s.k[0].t;
    const inicioDeLaPalomita = buscar(datos, (nodo) => nodo.ty === 'tm').e.k[0].t;
    expect(inicioDeLaPalomita).toBeGreaterThan(inicioDelSello);
  });
});
