// Spec armar-venta-actual, "Guardar la venta actual en el navegador (V-04)" y criterio 12 de V-04: src/ventaActual/
// almacenamiento.js es el único archivo que toca localStorage. Guarda solo los detalles (nunca los errores de un campo
// del detalle) con la llave aipos.ventaActual, borra la llave cuando la venta actual queda vacía, valida entero lo que
// lee y ante cualquier fallo del navegador no lanza: lee una venta actual vacía y guardar devuelve false.
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { leerVentaActual, guardarVentaActual } from '../../src/ventaActual/almacenamiento.js';
import { agregarAVentaActual, vaciarVentaActual } from '../../src/ventaActual/ventaActual.js';

// La llave y la forma del valor, escritas otra vez a propósito: si cambian en el módulo, esta prueba avisa.
const LLAVE = 'aipos.ventaActual';

const congelar = (valor) => {
  Object.values(valor).forEach(
    (hijo) => typeof hijo === 'object' && hijo !== null && congelar(hijo),
  );
  return Object.freeze(valor);
};

const leche = { productoId: 1, nombre: 'Leche entera 1 L', precioAplicado: '22.00', cantidad: 2 };
const pan = { productoId: 2, nombre: 'Pan de caja', precioAplicado: '3.50', cantidad: 1 };

// Lo que hay en el navegador, tal cual: un texto o un valor que se guarda como JSON.
const dejarGuardado = (valor) =>
  localStorage.setItem(LLAVE, typeof valor === 'string' ? valor : JSON.stringify(valor));
const guardado = () => JSON.parse(localStorage.getItem(LLAVE));
const version1 = (detalles) => ({ version: 1, detalles });

beforeEach(() => localStorage.clear());
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('guardarVentaActual', () => {
  it('guarda un JSON con version 1 y los detalles, con la llave aipos.ventaActual', () => {
    expect(guardarVentaActual({ detalles: [leche, pan], errores: {} })).toBe(true);
    expect(guardado()).toEqual({ version: 1, detalles: [leche, pan] });
  });

  it('cada detalle guardado tiene productoId, nombre, precioAplicado y cantidad, y nada más', () => {
    const conDeMas = { ...leche, codigoBarras: '7501055300075', precio: '25.00' };
    guardarVentaActual({ detalles: [conDeMas], errores: {} });
    expect(Object.keys(guardado().detalles[0]).sort()).toEqual([
      'cantidad',
      'nombre',
      'precioAplicado',
      'productoId',
    ]);
  });

  it('no guarda los errores de un campo del detalle: un valor que no se aceptó no vuelve al recargar', () => {
    const errores = { 2: { cantidad: 'La cantidad debe ser un número entero de 1 a 999.' } };
    guardarVentaActual({ detalles: [leche, pan], errores });
    expect(localStorage.getItem(LLAVE)).not.toMatch(/errores|cantidad debe/);
    expect(Object.keys(guardado()).sort()).toEqual(['detalles', 'version']);
  });

  it('guarda los detalles en el orden de la venta actual y reemplaza lo que había', () => {
    guardarVentaActual({ detalles: [leche, pan], errores: {} });
    guardarVentaActual({ detalles: [pan], errores: {} });
    expect(guardado().detalles).toEqual([pan]);
  });

  it('si la venta actual queda sin detalles borra la llave en vez de guardar una lista vacía', () => {
    guardarVentaActual({ detalles: [leche], errores: {} });
    expect(localStorage.getItem(LLAVE)).not.toBeNull();
    expect(guardarVentaActual(vaciarVentaActual())).toBe(true);
    expect(localStorage.getItem(LLAVE)).toBeNull();
    expect(localStorage.length).toBe(0);
  });

  it('vaciar una venta actual que nunca se guardó también da true y no deja nada', () => {
    expect(guardarVentaActual(vaciarVentaActual())).toBe(true);
    expect(localStorage.getItem(LLAVE)).toBeNull();
  });

  it('una venta actual vacía con errores también borra la llave: sin detalles no hay nada que guardar', () => {
    guardarVentaActual({ detalles: [leche], errores: {} });
    guardarVentaActual({ detalles: [], errores: { 1: { cantidad: 'x' } } });
    expect(localStorage.getItem(LLAVE)).toBeNull();
  });

  it('no modifica la venta actual que recibe (criterio 13)', () => {
    const actual = congelar({ detalles: [{ ...leche }, { ...pan }], errores: {} });
    expect(() => guardarVentaActual(actual)).not.toThrow();
    expect(actual.detalles[0]).toEqual(leche);
  });
});

describe('leerVentaActual', () => {
  it('sin nada guardado devuelve una venta actual vacía', () => {
    expect(leerVentaActual()).toEqual({ detalles: [], errores: {} });
  });

  it('devuelve una venta actual nueva cada vez: nadie comparte un objeto que otro pueda cambiar', () => {
    const primera = leerVentaActual();
    const segunda = leerVentaActual();
    expect(primera).not.toBe(segunda);
    primera.detalles.push(leche);
    expect(leerVentaActual().detalles).toEqual([]);
  });

  it('criterio 8: lo guardado vuelve igual, con sus detalles, precios aplicados y cantidades, y sin errores', () => {
    guardarVentaActual({ detalles: [leche, pan], errores: { 1: { precioAplicado: 'x' } } });
    expect(leerVentaActual()).toEqual({ detalles: [leche, pan], errores: {} });
  });

  it('una venta actual vacía que se guardó vuelve vacía', () => {
    guardarVentaActual({ detalles: [leche], errores: {} });
    guardarVentaActual(vaciarVentaActual());
    expect(leerVentaActual()).toEqual({ detalles: [], errores: {} });
  });

  it('un detalle guardado con 0.00 de precio aplicado es válido', () => {
    dejarGuardado(version1([{ ...pan, precioAplicado: '0.00' }]));
    expect(leerVentaActual().detalles[0].precioAplicado).toBe('0.00');
  });

  it('lo que lee sale con el precio aplicado de 2 decimales', () => {
    dejarGuardado(
      version1([
        { ...leche, precioAplicado: '22' },
        { ...pan, precioAplicado: '3.5' },
        { productoId: 3, nombre: 'Bolsa', precioAplicado: '0', cantidad: 1 },
      ]),
    );
    expect(leerVentaActual().detalles.map((d) => d.precioAplicado)).toEqual([
      '22.00',
      '3.50',
      '0.00',
    ]);
  });

  it('un nombre de 120 caracteres es válido (un emoji cuenta 1, como en la API), y los 100 detalles también', () => {
    const nombres = ['a'.repeat(120), '🥛'.repeat(120)];
    dejarGuardado(version1(nombres.map((nombre, i) => ({ ...leche, productoId: i + 1, nombre }))));
    expect(leerVentaActual().detalles.map((d) => d.nombre)).toEqual(nombres);
    const cien = Array.from({ length: 100 }, (_, i) => ({ ...leche, productoId: i + 1 }));
    dejarGuardado(version1(cien));
    expect(leerVentaActual().detalles).toHaveLength(100);
  });

  it('ignora los campos que no conoce, en el valor guardado y en cada detalle', () => {
    dejarGuardado({ version: 1, detalles: [{ ...leche, extra: 'x' }], otro: true });
    expect(leerVentaActual()).toEqual({ detalles: [leche], errores: {} });
  });
});

// Lo guardado es un dato que no controla el programa: otra versión, una edición a mano o una escritura que se cortó.
// Si algo no cumple se ignora todo y se empieza con la venta actual vacía, sin errores y sin lanzar.
describe('leerVentaActual: lo guardado dañado o con otra forma se ignora entero (criterio 12)', () => {
  const vacia = { detalles: [], errores: {} };

  describe.each([
    ['un JSON cortado', '{'],
    ['un texto vacío', ''],
    ['texto que no es JSON', 'hola'],
    ['null', 'null'],
    ['un número', '5'],
    ['un texto JSON', '"venta"'],
    ['una lista', '[]'],
    ['una lista de detalles sin el objeto', JSON.stringify([leche])],
    ['otra versión (2)', JSON.stringify({ version: 2, detalles: [leche] })],
    ['la versión como texto', JSON.stringify({ version: '1', detalles: [leche] })],
    ['sin versión', JSON.stringify({ detalles: [leche] })],
    ['sin detalles', JSON.stringify({ version: 1 })],
    ['detalles null', JSON.stringify({ version: 1, detalles: null })],
    ['detalles que es un objeto', JSON.stringify({ version: 1, detalles: { 1: leche } })],
    ['detalles que es un texto', JSON.stringify({ version: 1, detalles: 'leche' })],
  ])('%s', (_nombre, valor) => {
    it('se ignora y empieza la venta actual vacía', () => {
      dejarGuardado(valor);
      expect(leerVentaActual()).toEqual(vacia);
    });
  });

  it('con más de 100 detalles (RN-14) se ignora todo', () => {
    const ciento1 = Array.from({ length: 101 }, (_, i) => ({ ...leche, productoId: i + 1 }));
    dejarGuardado(version1(ciento1));
    expect(leerVentaActual()).toEqual(vacia);
  });

  // Cada valor malo va en el segundo detalle: el primero es válido, y aun así se ignora todo.
  const malo = (cambios) => version1([leche, { ...pan, ...cambios }]);
  const sin = (campo) => {
    const detalle = { ...pan };
    delete detalle[campo];
    return version1([leche, detalle]);
  };

  describe.each([
    ['productoId 0', malo({ productoId: 0 })],
    ['productoId negativo', malo({ productoId: -2 })],
    ['productoId decimal', malo({ productoId: 1.5 })],
    ['productoId de texto', malo({ productoId: '2' })],
    ['productoId null', malo({ productoId: null })],
    ['sin productoId', sin('productoId')],
    ['un productoId repetido', malo({ productoId: 1 })],
    ['nombre vacío', malo({ nombre: '' })],
    ['nombre que no es texto', malo({ nombre: 7 })],
    ['nombre de 121 caracteres', malo({ nombre: 'a'.repeat(121) })],
    ['sin nombre', sin('nombre')],
    ['precio aplicado negativo', malo({ precioAplicado: '-1' })],
    ['precio aplicado de letras', malo({ precioAplicado: 'abc' })],
    ['precio aplicado de 6 enteros', malo({ precioAplicado: '100000' })],
    ['precio aplicado de 3 decimales', malo({ precioAplicado: '22.999' })],
    ['precio aplicado número', malo({ precioAplicado: 22.5 })],
    ['precio aplicado vacío', malo({ precioAplicado: '' })],
    ['precio aplicado con coma', malo({ precioAplicado: '22,50' })],
    ['precio aplicado en notación científica', malo({ precioAplicado: '1e3' })],
    ['sin precio aplicado', sin('precioAplicado')],
    ['cantidad 0', malo({ cantidad: 0 })],
    ['cantidad 1000', malo({ cantidad: 1000 })],
    ['cantidad negativa', malo({ cantidad: -1 })],
    ['cantidad decimal', malo({ cantidad: 1.5 })],
    ['cantidad de texto', malo({ cantidad: '1' })],
    ['cantidad null', malo({ cantidad: null })],
    ['sin cantidad', sin('cantidad')],
    ['un detalle null', version1([leche, null])],
    ['un detalle que es un número', version1([leche, 5])],
    ['un detalle que es una lista', version1([leche, [pan]])],
  ])('un detalle con %s', (_nombre, valor) => {
    it('se ignora todo y empieza la venta actual vacía', () => {
      dejarGuardado(valor);
      expect(leerVentaActual()).toEqual(vacia);
    });
  });

  it('leer no escribe ni borra: lo dañado se queda hasta que la venta actual se vuelva a guardar', () => {
    dejarGuardado('{');
    leerVentaActual();
    expect(localStorage.getItem(LLAVE)).toBe('{');
  });
});

describe('guardar y leer de una venta actual armada con agregarAVentaActual', () => {
  it('todo lo que agregarAVentaActual arma se puede guardar y leer igual, también en los extremos', () => {
    let actual = vaciarVentaActual();
    for (let id = 1; id <= 100; id++) {
      const producto = {
        id,
        nombre: '🥛'.repeat(id === 100 ? 120 : 10),
        precio: id === 1 ? '99999.99' : '0.05',
      };
      actual = agregarAVentaActual(actual, producto);
    }
    for (let i = 0; i < 998; i++)
      actual = agregarAVentaActual(actual, { id: 1, nombre: '🥛'.repeat(10), precio: '99999.99' });
    expect(actual.detalles[0].cantidad).toBe(999);
    guardarVentaActual(actual);
    expect(leerVentaActual()).toEqual(actual);
  });
});

// El navegador puede negarse de varias maneras: en una ventana privada o con los datos del sitio bloqueados,
// localStorage puede lanzar al pedirlo o al usarlo, no existir, o estar lleno (QuotaExceededError).
describe('un navegador que no deja usar localStorage: nada lanza', () => {
  const denegar = (nombre) => () => {
    throw new DOMException('El navegador no deja', nombre);
  };
  const conDetalles = { detalles: [leche, pan], errores: {} };

  it('si el almacenamiento está lleno, guardar devuelve false y la venta actual no se pierde', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(denegar('QuotaExceededError'));
    expect(() => guardarVentaActual(conDetalles)).not.toThrow();
    expect(guardarVentaActual(conDetalles)).toBe(false);
    expect(conDetalles.detalles).toEqual([leche, pan]);
  });

  it('si borrar la llave falla, guardar una venta actual vacía devuelve false', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(denegar('SecurityError'));
    expect(guardarVentaActual(vaciarVentaActual())).toBe(false);
  });

  it('si leer falla, devuelve una venta actual vacía', () => {
    dejarGuardado(version1([leche]));
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(denegar('SecurityError'));
    expect(() => leerVentaActual()).not.toThrow();
    expect(leerVentaActual()).toEqual({ detalles: [], errores: {} });
  });

  it('si pedir localStorage lanza un SecurityError, leer da vacía y guardar da false', () => {
    vi.spyOn(globalThis, 'localStorage', 'get').mockImplementation(denegar('SecurityError'));
    expect(leerVentaActual()).toEqual({ detalles: [], errores: {} });
    expect(guardarVentaActual(conDetalles)).toBe(false);
    expect(guardarVentaActual(vaciarVentaActual())).toBe(false);
  });

  it('si localStorage no existe, leer da vacía y guardar da false', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(leerVentaActual()).toEqual({ detalles: [], errores: {} });
    expect(guardarVentaActual(conDetalles)).toBe(false);
  });

  it('si usar localStorage lanza en cualquier método, tampoco lanza', () => {
    const bloqueado = new Proxy({}, { get: denegar('SecurityError') });
    vi.stubGlobal('localStorage', bloqueado);
    expect(() => leerVentaActual()).not.toThrow();
    expect(() => guardarVentaActual(conDetalles)).not.toThrow();
    expect(guardarVentaActual(conDetalles)).toBe(false);
  });

  it('cuando el navegador vuelve a dejar, guardar y leer funcionan otra vez', () => {
    const espia = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(denegar('QuotaExceededError'));
    expect(guardarVentaActual(conDetalles)).toBe(false);
    espia.mockRestore();
    expect(guardarVentaActual(conDetalles)).toBe(true);
    expect(leerVentaActual()).toEqual(conDetalles);
  });
});
