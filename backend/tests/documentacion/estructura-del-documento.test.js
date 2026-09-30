import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { cargarDocumentacionApi } = require('../../src/documentacion.js');

const documento = cargarDocumentacionApi();

const METODOS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
// Los estados de RNF-05 y la respuesta reusable que documenta cada error.
const RESPUESTA_DE_CADA_ERROR = {
  400: 'DatosInvalidos',
  404: 'NoEncontrado',
  409: 'Conflicto',
  422: 'ReglaDeNegocio',
  500: 'ErrorInterno',
};
const ESTADOS_PERMITIDOS = ['200', '201', ...Object.keys(RESPUESTA_DE_CADA_ERROR)];

// Todas las operaciones del documento, con su ruta, su método y los parámetros de la ruta.
function operaciones(doc) {
  const lista = [];
  for (const [ruta, item] of Object.entries(doc.paths ?? {})) {
    for (const metodo of Object.keys(item).filter((clave) => METODOS.includes(clave))) {
      lista.push({
        ruta,
        metodo,
        operacion: item[metodo],
        parametrosDeLaRuta: item.parameters ?? [],
      });
    }
  }
  return lista;
}

const todas = operaciones(documento);

describe('la cabecera del documento', () => {
  it('es OpenAPI 3.0.3', () => {
    expect(documento.openapi).toBe('3.0.3');
  });

  it('info dice qué es AIPOS, que no hay login y que el dinero va como texto con 2 decimales', () => {
    expect(documento.info.title).toBe('API de AIPOS');
    expect(documento.info.version).toBe('1.0.0');
    expect(documento.info.description).toMatch(/punto de venta/i);
    expect(documento.info.description).toMatch(/login/i);
    expect(documento.info.description).toMatch(/2 decimales/);
  });

  it('servers tiene una sola entrada relativa, para que "Try it out" llame al mismo servidor', () => {
    expect(documento.servers).toEqual([{ url: '/' }]);
  });

  it('tags lleva una entrada con descripción por cada recurso en uso', () => {
    expect(documento.tags.map((etiqueta) => etiqueta.name)).toContain('Salud');
    for (const etiqueta of documento.tags) {
      expect(etiqueta.description, `la etiqueta ${etiqueta.name}`).toBeTruthy();
    }
    const declaradas = documento.tags.map((etiqueta) => etiqueta.name).sort();
    const usadas = [...new Set(todas.flatMap(({ operacion }) => operacion.tags ?? []))].sort();
    expect(declaradas).toEqual(usadas);
  });
});

describe('las rutas', () => {
  it('cada ruta empieza con /api y escribe los parámetros como {id}, no como :id', () => {
    expect(todas.length).toBeGreaterThan(0);
    for (const { ruta } of todas) {
      expect(ruta, ruta).toMatch(/^\/api\/[a-z0-9\-/{}]+$/i);
      expect(ruta, ruta).not.toContain(':');
    }
  });

  it('cada operación tiene operationId único, summary de una línea, tags y responses', () => {
    const ids = todas.map(({ operacion }) => operacion.operationId);
    expect(new Set(ids).size, 'operationId repetido').toBe(ids.length);
    for (const { ruta, metodo, operacion } of todas) {
      const nombre = `${metodo.toUpperCase()} ${ruta}`;
      expect(operacion.operationId, nombre).toMatch(/^[a-z][A-Za-z0-9]*$/);
      expect(operacion.summary, nombre).toMatch(/^[^\n]+$/);
      expect(operacion.tags?.length, `${nombre} sin tags`).toBeGreaterThan(0);
      expect(
        Object.keys(operacion.responses ?? {}).length,
        `${nombre} sin responses`,
      ).toBeGreaterThan(0);
    }
  });

  it('solo se documentan los estados de RNF-05: 200 y 201, y 400, 404, 409, 422 y 500', () => {
    for (const { ruta, metodo, operacion } of todas) {
      for (const estado of Object.keys(operacion.responses)) {
        expect(ESTADOS_PERMITIDOS, `${metodo} ${ruta}: el estado ${estado}`).toContain(estado);
      }
    }
  });

  it('todas documentan el 500 con la respuesta reusable ErrorInterno', () => {
    for (const { ruta, metodo, operacion } of todas) {
      expect(operacion.responses['500'], `${metodo} ${ruta}`).toEqual({
        $ref: '#/components/responses/ErrorInterno',
      });
    }
  });

  it('las que reciben cuerpo o parámetros documentan también el 400 con DatosInvalidos', () => {
    for (const { ruta, metodo, operacion, parametrosDeLaRuta } of todas) {
      const recibe =
        operacion.requestBody || operacion.parameters?.length || parametrosDeLaRuta.length;
      if (!recibe) continue;
      expect(operacion.responses['400'], `${metodo} ${ruta}`).toEqual({
        $ref: '#/components/responses/DatosInvalidos',
      });
    }
  });

  it('cada respuesta de error usa $ref a la respuesta reusable de su estado, sin esquema propio', () => {
    for (const { ruta, metodo, operacion } of todas) {
      for (const [estado, nombre] of Object.entries(RESPUESTA_DE_CADA_ERROR)) {
        if (!(estado in operacion.responses)) continue;
        expect(operacion.responses[estado], `${metodo} ${ruta} ${estado}`).toEqual({
          $ref: `#/components/responses/${nombre}`,
        });
      }
    }
  });
});

describe('el formato de error como esquema compartido', () => {
  const { schemas, responses } = documento.components;

  it('components.schemas tiene RespuestaDeError, DetalleDeError y Salud', () => {
    for (const nombre of ['RespuestaDeError', 'DetalleDeError', 'Salud']) {
      expect(schemas, `falta el esquema ${nombre}`).toHaveProperty(nombre);
    }
  });

  it('RespuestaDeError tiene error con codigo, mensaje y detalles, sin campos de más', () => {
    expect(schemas.RespuestaDeError).toMatchObject({
      type: 'object',
      required: ['error'],
      additionalProperties: false,
      properties: {
        error: {
          type: 'object',
          required: ['codigo', 'mensaje'],
          additionalProperties: false,
          properties: {
            codigo: { type: 'string', pattern: '^[A-Z][A-Z0-9_]*$' },
            mensaje: { type: 'string' },
            detalles: { type: 'array', items: { $ref: '#/components/schemas/DetalleDeError' } },
          },
        },
      },
    });
  });

  it('DetalleDeError tiene campo y mensaje, sin campos de más', () => {
    expect(schemas.DetalleDeError).toMatchObject({
      type: 'object',
      required: ['campo', 'mensaje'],
      additionalProperties: false,
      properties: { campo: { type: 'string' }, mensaje: { type: 'string' } },
    });
  });

  it('components.responses tiene una respuesta reusable por cada estado de error', () => {
    for (const [estado, nombre] of Object.entries(RESPUESTA_DE_CADA_ERROR)) {
      expect(responses, `falta la respuesta ${nombre} (${estado})`).toHaveProperty(nombre);
      expect(responses[nombre].description, nombre).toBeTruthy();
      expect(responses[nombre].content['application/json'].schema, nombre).toEqual({
        $ref: '#/components/schemas/RespuestaDeError',
      });
    }
  });
});

describe('GET /api/salud', () => {
  const operacion = documento.paths['/api/salud']?.get;
  const { Salud } = documento.components.schemas;

  it('es consultarSalud, con la etiqueta Salud, sin parámetros y sin cuerpo', () => {
    expect(operacion, 'falta GET /api/salud').toBeDefined();
    expect(operacion.operationId).toBe('consultarSalud');
    expect(operacion.tags).toEqual(['Salud']);
    expect(operacion.parameters ?? []).toEqual([]);
    expect(operacion).not.toHaveProperty('requestBody');
  });

  it('documenta el 200 con el esquema Salud y el 500 con ErrorInterno, y nada más', () => {
    expect(Object.keys(operacion.responses).sort()).toEqual(['200', '500']);
    expect(operacion.responses['200'].content['application/json'].schema).toEqual({
      $ref: '#/components/schemas/Salud',
    });
  });

  it('Salud tiene estado obligatorio y baseDeDatos opcional, los dos siempre "ok"', () => {
    expect(Salud.type).toBe('object');
    expect(Salud.required).toEqual(['estado']);
    expect(Salud.properties.estado.enum).toEqual(['ok']);
    expect(Salud.properties.baseDeDatos.enum).toEqual(['ok']);
  });
});

// Lo que sigue revisa el dinero y el nombre de los campos, en todo el documento.
const DINERO = ['precio', 'precioAplicado', 'subtotal', 'total'];
const PATRON_DEL_PRECIO = '^\\d{1,5}(\\.\\d{1,2})?$';

function recorrer(nodo, alEncontrar, lugar = '#') {
  if (Array.isArray(nodo)) nodo.forEach((x, i) => recorrer(x, alEncontrar, `${lugar}/${i}`));
  else if (nodo && typeof nodo === 'object') {
    alEncontrar(nodo, lugar);
    for (const [clave, valor] of Object.entries(nodo))
      recorrer(valor, alEncontrar, `${lugar}/${clave}`);
  }
}

function problemasDeDinero(doc) {
  const problemas = [];
  recorrer(doc, (nodo, lugar) => {
    for (const nombre of DINERO) {
      const campo = nodo.properties?.[nombre];
      if (campo && (campo.type !== 'string' || !campo.pattern)) {
        problemas.push(`${lugar}/properties/${nombre} es dinero: debe ser type string con pattern`);
      }
      if (
        campo &&
        ['precio', 'precioAplicado'].includes(nombre) &&
        campo.pattern !== PATRON_DEL_PRECIO
      ) {
        problemas.push(`${lugar}/properties/${nombre} debe tener el pattern ${PATRON_DEL_PRECIO}`);
      }
    }
    for (const clave of ['example', 'value']) {
      recorrer(nodo[clave], (ejemplo, lugarDelEjemplo) => {
        for (const nombre of DINERO) {
          if (typeof ejemplo[nombre] === 'number') {
            problemas.push(
              `${lugar}/${clave}${lugarDelEjemplo.slice(1)}/${nombre} es dinero escrito como número`,
            );
          }
        }
      });
    }
  });
  return problemas;
}

// Los nombres de los campos del JSON: los de `properties` y los de cada ejemplo.
function nombresDeCampos(doc) {
  const nombres = [];
  recorrer(doc, (nodo) => {
    if (nodo.properties && typeof nodo.properties === 'object')
      nombres.push(...Object.keys(nodo.properties));
    for (const clave of ['example', 'value']) {
      recorrer(nodo[clave], (ejemplo) => {
        if (!Array.isArray(ejemplo)) nombres.push(...Object.keys(ejemplo));
      });
    }
  });
  return nombres;
}

describe('el dinero y los campos del JSON', () => {
  it('el dinero va como texto con pattern, nunca como número', () => {
    expect(problemasDeDinero(documento)).toEqual([]);
  });

  it('los campos van en camelCase, sin guiones ni mayúscula inicial', () => {
    for (const nombre of nombresDeCampos(documento)) {
      expect(nombre, `el campo ${nombre}`).toMatch(/^[a-z][a-zA-Z0-9]*$/);
    }
  });

  describe('el revisor se prueba con documentos rotos a propósito', () => {
    it('atrapa un precio que no es texto', () => {
      const roto = {
        components: { schemas: { P: { properties: { precio: { type: 'number' } } } } },
      };
      expect(problemasDeDinero(roto)[0]).toMatch(/precio es dinero: debe ser type string/);
    });

    it('atrapa un precio con otro pattern', () => {
      const roto = { properties: { precioAplicado: { type: 'string', pattern: '^\\d+$' } } };
      expect(problemasDeDinero(roto)[0]).toMatch(/debe tener el pattern/);
    });

    it('atrapa un ejemplo con el dinero como número, también dentro de una lista', () => {
      const roto = { example: { detalles: [{ productoId: 1, precioAplicado: 10 }] } };
      expect(problemasDeDinero(roto)[0]).toMatch(/precioAplicado es dinero escrito como número/);
    });

    it('deja pasar el dinero como texto con pattern', () => {
      const bueno = {
        properties: { precio: { type: 'string', pattern: PATRON_DEL_PRECIO } },
        example: { precio: '25.00' },
      };
      expect(problemasDeDinero(bueno)).toEqual([]);
    });

    it('encuentra los campos que no son camelCase, en propiedades y en ejemplos', () => {
      const roto = {
        properties: { codigo_barras: { type: 'string' } },
        example: { CodigoBarras: 'x' },
      };
      const malos = nombresDeCampos(roto).filter((nombre) => !/^[a-z][a-zA-Z0-9]*$/.test(nombre));
      expect(malos).toEqual(['codigo_barras', 'CodigoBarras']);
    });
  });
});
