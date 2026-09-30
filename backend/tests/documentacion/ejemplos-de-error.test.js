import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { cargarDocumentacionApi } = require('../../src/documentacion.js');

const documento = cargarDocumentacionApi();

// Lo que ningún ejemplo puede mostrar (RNF-04): el stack, el SQL ni el mensaje original de MySQL.
const PROHIBIDO = [
  ['un marco de stack', /\bat\s+\S.*:\d+:\d+\)?/],
  ['node_modules', /node_modules/],
  ['un archivo .js con número de línea', /\.js:\d+/],
  ['la palabra stack', /stack/i],
  ['sql', /sql/i],
  ['sequelize', /sequelize/i],
  ['mysql', /mysql/i],
  ['errno', /errno/i],
  ['un código ER_ de MySQL', /(^|[^A-Za-z])ER_[A-Z]/],
  ['una sentencia SQL en mayúsculas', /\b(SELECT|INSERT|UPDATE|DELETE|CALL|DROP)\b/],
];

function detallesInternos(texto) {
  return PROHIBIDO.filter(([, patron]) => patron.test(texto)).map(([nombre]) => nombre);
}

// Cada `example` y cada `examples[*].value` del documento, con el lugar donde está.
function recogerEjemplos(nodo, lugar = '#', lista = []) {
  if (Array.isArray(nodo)) {
    nodo.forEach((elemento, i) => recogerEjemplos(elemento, `${lugar}/${i}`, lista));
  } else if (nodo && typeof nodo === 'object') {
    for (const [clave, valor] of Object.entries(nodo)) {
      if (clave === 'example') {
        lista.push({ lugar: `${lugar}/example`, valor });
      } else if (clave === 'examples') {
        for (const [nombre, ejemplo] of Object.entries(valor)) {
          lista.push({ lugar: `${lugar}/examples/${nombre}`, valor: ejemplo.value });
        }
      } else {
        recogerEjemplos(valor, `${lugar}/${clave}`, lista);
      }
    }
  }
  return lista;
}

describe('el detector de detalles internos', () => {
  it.each([
    ['un marco de stack', 'at Object.handle (/app/src/routes/salud.js:12:9)'],
    ['node_modules', '/app/node_modules/express/lib/router.js'],
    ['un archivo .js con número de línea', 'falló en salud.js:12'],
    ['la palabra stack', 'stack: Error en la línea 3'],
    ['sql', 'SQLSTATE 45000'],
    ['sequelize', 'SequelizeDatabaseError'],
    ['mysql', 'MySQL server has gone away'],
    ['errno', 'errno 1062'],
    ['un código ER_ de MySQL', 'ER_DUP_ENTRY'],
    ['una sentencia SQL en mayúsculas', 'SELECT id FROM productos'],
    ['una sentencia SQL en mayúsculas', 'CALL registrar_venta'],
  ])('atrapa %s', (nombre, texto) => {
    expect(detallesInternos(texto)).toContain(nombre);
  });

  it('deja pasar la frase genérica de la API', () => {
    expect(detallesInternos('Ocurrió un error inesperado. Intenta de nuevo.')).toEqual([]);
    expect(detallesInternos('ERROR_INTERNO')).toEqual([]);
  });
});

describe('los ejemplos del documento no muestran el stack ni el SQL', () => {
  const ejemplos = recogerEjemplos(documento);

  it('hay ejemplos que revisar', () => {
    expect(ejemplos.length).toBeGreaterThanOrEqual(6);
  });

  it('ningún ejemplo contiene detalles internos', () => {
    for (const { lugar, valor } of ejemplos) {
      expect(detallesInternos(JSON.stringify(valor)), `${lugar} muestra detalles internos`).toEqual(
        [],
      );
    }
  });
});

const RESPUESTAS_DE_ERROR = {
  DatosInvalidos: { estado: '400', codigo: 'DATOS_INVALIDOS' },
  NoEncontrado: { estado: '404', codigo: 'NO_ENCONTRADO' },
  Conflicto: { estado: '409', codigo: 'CODIGO_BARRAS_DUPLICADO' },
  ReglaDeNegocio: { estado: '422', codigo: 'VENTA_SIN_DETALLES' },
  ErrorInterno: { estado: '500', codigo: 'ERROR_INTERNO' },
};

// La forma de RespuestaDeError: `detalles` solo lo lleva el 400 y el 409 (arquitectura, "Errores").
function verLaForma({ lugar, valor }, estado) {
  expect(Object.keys(valor), `${lugar} debe tener solo "error"`).toEqual(['error']);
  const { codigo, mensaje, detalles, ...otros } = valor.error;
  expect(otros, `${lugar} tiene campos de más en "error"`).toEqual({});
  expect(codigo, lugar).toMatch(/^[A-Z][A-Z0-9_]*$/);
  expect(typeof mensaje, `${lugar}: mensaje`).toBe('string');
  expect(mensaje.length, `${lugar}: mensaje`).toBeGreaterThan(0);
  if (!['400', '409'].includes(estado)) {
    expect(detalles, `${lugar}: solo el 400 y el 409 llevan detalles`).toBeUndefined();
  }
  for (const detalle of detalles ?? []) {
    expect(Object.keys(detalle).sort(), `${lugar}: cada detalle`).toEqual(['campo', 'mensaje']);
    expect(typeof detalle.campo + typeof detalle.mensaje, lugar).toBe('stringstring');
  }
}

describe('cada ejemplo de error tiene la forma del esquema RespuestaDeError', () => {
  for (const [nombre, { estado, codigo }] of Object.entries(RESPUESTAS_DE_ERROR)) {
    describe(`components.responses.${nombre} (${estado})`, () => {
      const respuesta = documento.components?.responses?.[nombre];
      const ejemplos = recogerEjemplos(respuesta ?? {}, `#/components/responses/${nombre}`);

      it('usa el esquema RespuestaDeError con $ref', () => {
        expect(respuesta, `falta components.responses.${nombre}`).toBeDefined();
        expect(respuesta.content['application/json'].schema).toEqual({
          $ref: '#/components/schemas/RespuestaDeError',
        });
      });

      it(`tiene un ejemplo con el código ${codigo}`, () => {
        expect(ejemplos.length).toBeGreaterThanOrEqual(1);
        for (const ejemplo of ejemplos) {
          verLaForma(ejemplo, estado);
          expect(ejemplo.valor.error.codigo).toBe(codigo);
        }
      });
    });
  }

  it('el 400 trae un elemento en detalles, el del ejemplo de la arquitectura', () => {
    const [{ valor }] = recogerEjemplos(documento.components.responses.DatosInvalidos);
    expect(valor.error.detalles).toEqual([
      { campo: 'precio', mensaje: 'No puede tener más de 2 decimales.' },
    ]);
  });

  it('el 409 trae detalles que nombran codigoBarras', () => {
    const [{ valor }] = recogerEjemplos(documento.components.responses.Conflicto);
    expect(valor.error.detalles.map((detalle) => detalle.campo)).toContain('codigoBarras');
  });

  it('el 500 es la frase genérica que devuelve la API', () => {
    const [{ valor }] = recogerEjemplos(documento.components.responses.ErrorInterno);
    expect(valor.error.mensaje).toBe('Ocurrió un error inesperado. Intenta de nuevo.');
  });

  it('una respuesta de error escrita dentro de una ruta también tiene esa forma', () => {
    for (const [ruta, operaciones] of Object.entries(documento.paths)) {
      for (const [metodo, operacion] of Object.entries(operaciones)) {
        for (const [estado, respuesta] of Object.entries(operacion?.responses ?? {})) {
          if (respuesta.$ref || !['400', '404', '409', '422', '500'].includes(estado)) continue;
          const lugar = `#/paths/${ruta}/${metodo}/responses/${estado}`;
          for (const ejemplo of recogerEjemplos(respuesta, lugar)) verLaForma(ejemplo, estado);
        }
      }
    }
  });
});
