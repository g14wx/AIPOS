// Spec crear-producto, "P-03 > El formulario": las reglas de cada campo son funciones puras (entra el texto que escribió
// el cajero, sale true o el mensaje) y usan los mismos textos que la API. Se prueban sin montar la pantalla.
import { describe, it, expect } from 'vitest';
import {
  LARGO_MAXIMO_NOMBRE,
  LARGO_MAXIMO_CODIGO_BARRAS,
  MENSAJES,
  reglasNombre,
  reglasPrecio,
  reglasCodigoBarras,
  primerMensaje,
  revisarProducto,
  limpiarProducto,
  leerErrorDeLaApi,
} from '../src/reglasProducto.js';

// Los textos de la tabla del contrato de la spec. Las pruebas los escriben tal cual, sin leerlos del módulo.
const TEXTO = {
  obligatorio: 'Es obligatorio.',
  nombreLargo: 'No puede pasar de 120 caracteres.',
  codigoBarrasLargo: 'No puede pasar de 50 caracteres.',
  precioSinFormato: 'Debe ser un número con punto decimal, por ejemplo 25.50.',
  precioDecimales: 'No puede tener más de 2 decimales.',
  precioMaximo: 'No puede ser mayor que 99999.99.',
  precioEnCero: 'Debe ser mayor que 0.',
  codigoRepetido: 'Ya existe un producto con ese código de barras.',
};

const mensajeDe = (reglas, valor) => primerMensaje(reglas, valor);

describe('los textos son los mismos que los de la API (tabla del contrato de la spec)', () => {
  it('el módulo trae exactamente esos textos', () => {
    expect(Object.values(MENSAJES).sort()).toEqual(Object.values(TEXTO).sort());
  });

  it('los largos máximos son los de RN-04: 120 el nombre y 50 el código de barras', () => {
    expect(LARGO_MAXIMO_NOMBRE).toBe(120);
    expect(LARGO_MAXIMO_CODIGO_BARRAS).toBe(50);
  });
});

describe('las reglas siguen la forma de Vuetify: una función que devuelve true o el texto del error', () => {
  const valores = ['', '  ', 'Leche', '25.50', 'abc', null, undefined, 25, {}, []];

  for (const [campo, reglas] of [
    ['nombre', reglasNombre],
    ['precio', reglasPrecio],
    ['código de barras', reglasCodigoBarras],
  ]) {
    it(`las de ${campo} son funciones y nunca lanzan un error, ni con valores raros`, () => {
      expect(reglas.length).toBeGreaterThan(0);
      for (const regla of reglas) {
        expect(typeof regla).toBe('function');
        for (const valor of valores) {
          const resultado = regla(valor);
          expect(resultado === true || typeof resultado === 'string').toBe(true);
        }
      }
    });
  }
});

describe('reglasNombre (RN-01 y RN-04)', () => {
  it('un nombre con contenido pasa todas las reglas', () => {
    expect(reglasNombre.map((regla) => regla('Leche entera 1 L'))).toEqual(
      reglasNombre.map(() => true),
    );
    expect(mensajeDe(reglasNombre, 'Leche entera 1 L')).toBe('');
  });

  it.each([
    ['vacío', ''],
    ['solo espacios', '   '],
    ['null', null],
    ['undefined', undefined],
  ])('un nombre %s es obligatorio', (_nombre, valor) => {
    expect(mensajeDe(reglasNombre, valor)).toBe(TEXTO.obligatorio);
  });

  it('acepta 120 caracteres y rechaza 121', () => {
    expect(mensajeDe(reglasNombre, 'a'.repeat(120))).toBe('');
    expect(mensajeDe(reglasNombre, 'a'.repeat(121))).toBe(TEXTO.nombreLargo);
  });

  it('los espacios de los extremos no cuentan en el largo, porque se quitan antes de mandar', () => {
    expect(mensajeDe(reglasNombre, `  ${'a'.repeat(120)}  `)).toBe('');
  });

  it('el largo se cuenta en caracteres, como en MySQL: un emoji cuenta 1 y no 2', () => {
    expect(mensajeDe(reglasNombre, '😀'.repeat(120))).toBe('');
    expect(mensajeDe(reglasNombre, '😀'.repeat(121))).toBe(TEXTO.nombreLargo);
  });
});

describe('reglasCodigoBarras (RN-01, RN-03 y RN-04)', () => {
  it('un código de barras con ceros a la izquierda es válido: es texto y no se convierte', () => {
    expect(mensajeDe(reglasCodigoBarras, '0012345')).toBe('');
    expect(mensajeDe(reglasCodigoBarras, ' 7501055300075 ')).toBe('');
  });

  it.each([
    ['vacío', ''],
    ['solo espacios', '   '],
    ['null', null],
    ['undefined', undefined],
  ])('un código de barras %s es obligatorio', (_nombre, valor) => {
    expect(mensajeDe(reglasCodigoBarras, valor)).toBe(TEXTO.obligatorio);
  });

  it('acepta 50 caracteres y rechaza 51, contados como caracteres', () => {
    expect(mensajeDe(reglasCodigoBarras, '1'.repeat(50))).toBe('');
    expect(mensajeDe(reglasCodigoBarras, '1'.repeat(51))).toBe(TEXTO.codigoBarrasLargo);
    expect(mensajeDe(reglasCodigoBarras, '😀'.repeat(50))).toBe('');
    expect(mensajeDe(reglasCodigoBarras, '😀'.repeat(51))).toBe(TEXTO.codigoBarrasLargo);
  });
});

describe('reglasPrecio (RN-01 y RN-02)', () => {
  // Iguales a la API: hasta 5 dígitos enteros y 2 decimales, con punto. "00025" cuenta 5 enteros, como en la API.
  it.each(['25', '25.5', '25.50', '0.01', '99999.99', '1', '00025'])(
    'el precio %s es válido',
    (precio) => {
      expect(mensajeDe(reglasPrecio, precio)).toBe('');
    },
  );

  it.each([
    ['vacío', ''],
    ['null', null],
    ['undefined', undefined],
  ])('un precio %s es obligatorio', (_nombre, valor) => {
    expect(mensajeDe(reglasPrecio, valor)).toBe(TEXTO.obligatorio);
  });

  it.each(['abc', '-5', '+5', '1,5', '.5', '1e3', ' 25', '25 ', '10.', '1.2.3', '   '])(
    'el precio "%s" no es un número con punto decimal',
    (precio) => {
      expect(mensajeDe(reglasPrecio, precio)).toBe(TEXTO.precioSinFormato);
    },
  );

  it.each(['10.999', '0.001', '1.234', '99999.999'])(
    'el precio %s tiene más de 2 decimales',
    (precio) => {
      expect(mensajeDe(reglasPrecio, precio)).toBe(TEXTO.precioDecimales);
    },
  );

  it.each(['100000', '123456', '100000.5', '100000.00', '99999999999999999999.99'])(
    'el precio %s pasa de 99999.99',
    (precio) => {
      expect(mensajeDe(reglasPrecio, precio)).toBe(TEXTO.precioMaximo);
    },
  );

  it.each(['0', '0.0', '0.00', '000'])('el precio %s vale 0 y debe ser mayor que 0', (precio) => {
    expect(mensajeDe(reglasPrecio, precio)).toBe(TEXTO.precioEnCero);
  });

  it('cada campo muestra solo su primer problema, en el orden de la tabla del contrato', () => {
    // Decimales antes que máximo, y máximo antes que cero, como en la API.
    expect(mensajeDe(reglasPrecio, '100000.999')).toBe(TEXTO.precioDecimales);
    expect(mensajeDe(reglasPrecio, '0.000')).toBe(TEXTO.precioDecimales);
    expect(mensajeDe(reglasPrecio, '000000')).toBe(TEXTO.precioMaximo);
  });

  it('criterio 2 de P-03: -5, abc, 10.999, 100000, 0 y " 25" se marcan cada uno con su motivo', () => {
    const esperados = [
      ['-5', TEXTO.precioSinFormato],
      ['abc', TEXTO.precioSinFormato],
      ['10.999', TEXTO.precioDecimales],
      ['100000', TEXTO.precioMaximo],
      ['0', TEXTO.precioEnCero],
      [' 25', TEXTO.precioSinFormato],
    ];
    for (const [precio, mensaje] of esperados) {
      expect(mensajeDe(reglasPrecio, precio), `precio "${precio}"`).toBe(mensaje);
    }
  });

  it('no recorta el precio, igual que la API: " 25" es un error y no un 25', () => {
    expect(mensajeDe(reglasPrecio, ' 25')).not.toBe('');
  });
});

describe('primerMensaje', () => {
  it('devuelve un texto vacío cuando todas las reglas pasan', () => {
    expect(primerMensaje([() => true, () => true], 'x')).toBe('');
    expect(primerMensaje([], 'x')).toBe('');
  });

  it('devuelve el texto de la primera regla que falla y no revisa las siguientes', () => {
    const revisadas = [];
    const regla = (nombre, resultado) => () => {
      revisadas.push(nombre);
      return resultado;
    };
    const reglas = [regla('a', true), regla('b', 'falla b'), regla('c', 'falla c')];
    expect(primerMensaje(reglas, 'x')).toBe('falla b');
    expect(revisadas).toEqual(['a', 'b']);
  });
});

describe('revisarProducto', () => {
  it('con el formulario vacío marca los tres campos como obligatorios', () => {
    expect(revisarProducto({ nombre: '', precio: '', codigoBarras: '' })).toEqual({
      nombre: TEXTO.obligatorio,
      precio: TEXTO.obligatorio,
      codigoBarras: TEXTO.obligatorio,
    });
  });

  it('con un producto válido no marca nada', () => {
    const producto = { nombre: 'Leche entera 1 L', precio: '25.50', codigoBarras: '7501055300075' };
    expect(revisarProducto(producto)).toEqual({ nombre: '', precio: '', codigoBarras: '' });
  });

  it('marca solo los campos con problema, cada uno con su primer motivo', () => {
    const producto = { nombre: 'Pan', precio: '10.999', codigoBarras: '   ' };
    expect(revisarProducto(producto)).toEqual({
      nombre: '',
      precio: TEXTO.precioDecimales,
      codigoBarras: TEXTO.obligatorio,
    });
  });
});

describe('limpiarProducto (lo que la pantalla manda a la API)', () => {
  it('quita los espacios de los extremos del nombre y del código de barras', () => {
    const producto = { nombre: '  Leche  ', precio: '25.50', codigoBarras: ' 0012345 ' };
    expect(limpiarProducto(producto)).toEqual({
      nombre: 'Leche',
      precio: '25.50',
      codigoBarras: '0012345',
    });
  });

  it('no recorta el precio: lo manda como texto, tal como lo escribió el cajero', () => {
    expect(limpiarProducto({ nombre: 'a', precio: ' 25', codigoBarras: 'b' }).precio).toBe(' 25');
    expect(limpiarProducto({ nombre: 'a', precio: '25.50', codigoBarras: 'b' }).precio).toBe(
      '25.50',
    );
  });

  it('solo devuelve los tres campos y no modifica el objeto que recibe', () => {
    const producto = Object.freeze({ nombre: ' a ', precio: '1', codigoBarras: ' b ', id: 9 });
    const limpio = limpiarProducto(producto);
    expect(Object.keys(limpio)).toEqual(['nombre', 'precio', 'codigoBarras']);
    expect(producto.nombre).toBe(' a ');
  });
});

describe('leerErrorDeLaApi (lo que el cajero ve según lo que contesta la API)', () => {
  const errorDeLaApi = ({ status, codigo, mensaje, detalles = [] }) =>
    Object.assign(new Error(mensaje), { status, codigo, mensaje, detalles });
  const inesperado = 'Ocurrió un error inesperado. Intenta de nuevo.';

  it('un 400 pone el mensaje de cada elemento de detalles junto a su campo', () => {
    const error = errorDeLaApi({
      status: 400,
      codigo: 'DATOS_INVALIDOS',
      mensaje: 'Los datos del producto no son válidos. Revisa los campos marcados.',
      detalles: [
        { campo: 'nombre', mensaje: 'Es obligatorio.' },
        { campo: 'precio', mensaje: 'No puede tener más de 2 decimales.' },
        { campo: 'codigoBarras', mensaje: 'No puede pasar de 50 caracteres.' },
      ],
    });
    expect(leerErrorDeLaApi(error)).toEqual({
      campos: {
        nombre: 'Es obligatorio.',
        precio: 'No puede tener más de 2 decimales.',
        codigoBarras: 'No puede pasar de 50 caracteres.',
      },
      franja: '',
    });
  });

  it('si un campo trae varios mensajes, muestra solo el primero', () => {
    const error = errorDeLaApi({
      status: 400,
      codigo: 'DATOS_INVALIDOS',
      mensaje: 'x',
      detalles: [
        { campo: 'precio', mensaje: 'Primero.' },
        { campo: 'precio', mensaje: 'Segundo.' },
      ],
    });
    expect(leerErrorDeLaApi(error).campos).toEqual({ precio: 'Primero.' });
  });

  it('un campo que la pantalla no conoce va a la franja de error del modal', () => {
    const error = errorDeLaApi({
      status: 400,
      codigo: 'DATOS_INVALIDOS',
      mensaje: 'x',
      detalles: [
        { campo: 'descuento', mensaje: 'No puede ser negativo.' },
        { campo: 'precio', mensaje: 'Debe ser mayor que 0.' },
      ],
    });
    expect(leerErrorDeLaApi(error)).toEqual({
      campos: { precio: 'Debe ser mayor que 0.' },
      franja: 'No puede ser negativo.',
    });
  });

  it('un 400 sin campos, como un JSON mal escrito, va a la franja con el mensaje de la API', () => {
    const error = errorDeLaApi({
      status: 400,
      codigo: 'JSON_INVALIDO',
      mensaje: 'El cuerpo de la petición no es un JSON válido.',
    });
    expect(leerErrorDeLaApi(error)).toEqual({
      campos: {},
      franja: 'El cuerpo de la petición no es un JSON válido.',
    });
  });

  it('un 409 CODIGO_BARRAS_DUPLICADO pone su mensaje junto al campo Código de barras', () => {
    const error = errorDeLaApi({
      status: 409,
      codigo: 'CODIGO_BARRAS_DUPLICADO',
      mensaje: 'Ya existe un producto con ese código de barras.',
      detalles: [{ campo: 'codigoBarras', mensaje: TEXTO.codigoRepetido }],
    });
    expect(leerErrorDeLaApi(error)).toEqual({
      campos: { codigoBarras: TEXTO.codigoRepetido },
      franja: '',
    });
  });

  it('el 409 no depende de que la API mande detalles', () => {
    const error = errorDeLaApi({ status: 409, codigo: 'CODIGO_BARRAS_DUPLICADO', mensaje: 'x' });
    expect(leerErrorDeLaApi(error).campos).toEqual({ codigoBarras: TEXTO.codigoRepetido });
  });

  it('un 409 con otro código no se adivina: va a la franja con el mensaje de la API', () => {
    const error = errorDeLaApi({
      status: 409,
      codigo: 'CONFLICTO',
      mensaje: 'Ya existe ese dato.',
    });
    expect(leerErrorDeLaApi(error)).toEqual({ campos: {}, franja: 'Ya existe ese dato.' });
  });

  it('sin respuesta (status 0) muestra en la franja el mensaje de http.js', () => {
    const mensaje = 'No se pudo conectar con el servidor. Intenta de nuevo.';
    const error = errorDeLaApi({ status: 0, codigo: 'SIN_CONEXION', mensaje });
    expect(leerErrorDeLaApi(error)).toEqual({ campos: {}, franja: mensaje });
  });

  it('un 500 muestra en la franja el mensaje de la API', () => {
    const error = errorDeLaApi({ status: 500, codigo: 'ERROR_INTERNO', mensaje: inesperado });
    expect(leerErrorDeLaApi(error)).toEqual({ campos: {}, franja: inesperado });
  });

  it('un error que no tiene la forma de la API muestra el texto genérico y nunca su mensaje interno', () => {
    for (const error of [new TypeError('x is not a function'), null, undefined, 'texto']) {
      expect(leerErrorDeLaApi(error)).toEqual({ campos: {}, franja: inesperado });
    }
  });

  it('un error de la API sin mensaje usa el texto genérico', () => {
    const error = Object.assign(new Error(''), { status: 503, codigo: 'X', detalles: [] });
    expect(leerErrorDeLaApi(error).franja).toBe(inesperado);
  });
});
