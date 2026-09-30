import { describe, it, expect, afterEach, vi } from 'vitest';
import request from 'supertest';
import { createRequire } from 'node:module';
import SwaggerParser from '@apidevtools/swagger-parser';

const require = createRequire(import.meta.url);
const app = require('../../src/app.js');
const { montajes } = require('../../src/routes/index.js');
const { Producto } = require('../../src/models/index.js');
const { cargarDocumentacionApi } = require('../../src/documentacion.js');

// GET /api/productos en la documentación de la API (backend/docs/openapi.yaml, de A-01): lo que dice el documento
// y que la ruta real responda lo mismo. La prueba de A-01 ya exige que la ruta esté en `montajes` y en el documento;
// esta revisa cómo está documentada. Necesita MySQL levantado y migrado (llama a la ruta de verdad).
const documento = cargarDocumentacionApi();
// El mismo documento con cada $ref reemplazado por lo que apunta.
const resuelto = await SwaggerParser.dereference(structuredClone(documento));
const operacion = documento.paths['/api/productos']?.get;
const respuestas = operacion?.responses ?? {};
const contenidoDelExito = respuestas['200']?.content?.['application/json'];

const idsCreados = [];

afterEach(async () => {
  vi.restoreAllMocks();
  if (idsCreados.length > 0) await Producto.destroy({ where: { id: idsCreados.splice(0) } });
});

function buscar(texto) {
  return request(app).get('/api/productos').query({ busqueda: texto });
}

describe('GET /api/productos está documentada', () => {
  it('la ruta está en montajes y en la documentación de la API', () => {
    expect(montajes.map((montaje) => montaje.ruta)).toContain('/productos');
    expect(operacion, 'falta GET /api/productos en backend/docs/openapi.yaml').toBeDefined();
  });

  it('es buscarProductos, con la etiqueta Productos, sin cuerpo y con un resumen de una línea', () => {
    expect(operacion.operationId).toBe('buscarProductos');
    expect(operacion.tags).toEqual(['Productos']);
    expect(
      documento.tags.find((etiqueta) => etiqueta.name === 'Productos')?.description,
    ).toBeTruthy();
    expect(operacion.summary).toMatch(/^[^\n]+$/);
    expect(operacion).not.toHaveProperty('requestBody');
  });

  it('el parámetro busqueda es obligatorio, va en la dirección y es un texto de 2 a 120 caracteres', () => {
    expect(operacion.parameters).toHaveLength(1);
    const [busqueda] = operacion.parameters;
    expect(busqueda).toMatchObject({ name: 'busqueda', in: 'query', required: true });
    expect(busqueda.schema).toMatchObject({ type: 'string', minLength: 2, maxLength: 120 });
    expect(busqueda.description).toBeTruthy();
  });

  it('documenta el 200, el 400 con DatosInvalidos y el 500 con ErrorInterno, y nada más (la ruta no escribe)', () => {
    expect(Object.keys(respuestas).sort()).toEqual(['200', '400', '500']);
    expect(respuestas['400']).toEqual({ $ref: '#/components/responses/DatosInvalidos' });
    expect(respuestas['500']).toEqual({ $ref: '#/components/responses/ErrorInterno' });
  });

  it('el 200 es una lista de productos de 20 como máximo', () => {
    expect(contenidoDelExito.schema).toMatchObject({ type: 'array', maxItems: 20 });
    expect(contenidoDelExito.schema.items).toEqual({ $ref: '#/components/schemas/Producto' });
  });

  it('el esquema Producto tiene id, nombre, codigoBarras y precio (texto con 2 decimales), y ningún campo más', () => {
    const { Producto: esquema } = resuelto.components.schemas;
    expect(esquema).toMatchObject({ type: 'object', additionalProperties: false });
    expect([...esquema.required].sort()).toEqual(['codigoBarras', 'id', 'nombre', 'precio']);
    expect(Object.keys(esquema.properties).sort()).toEqual([
      'codigoBarras',
      'id',
      'nombre',
      'precio',
    ]);
    expect(esquema.properties.id.type).toBe('integer');
    expect(esquema.properties.nombre).toMatchObject({ type: 'string', maxLength: 120 });
    expect(esquema.properties.codigoBarras).toMatchObject({ type: 'string', maxLength: 50 });
    expect(esquema.properties.precio).toMatchObject({
      type: 'string',
      pattern: '^\\d{1,5}(\\.\\d{1,2})?$',
    });
  });

  it('los ejemplos de la ruta no muestran el stack ni el SQL', () => {
    const ejemplos = [
      operacion.parameters[0].example,
      contenidoDelExito.example,
      ...Object.values(contenidoDelExito.examples ?? {}).map((ejemplo) => ejemplo.value),
    ].filter((ejemplo) => ejemplo !== undefined);
    expect(ejemplos.length).toBeGreaterThan(0);
    for (const ejemplo of ejemplos) {
      expect(JSON.stringify(ejemplo)).not.toMatch(/sql|stack|node_modules|errno|sequelize|mysql/i);
    }
  });
});

describe('la ruta real dice lo mismo que su documentación', () => {
  it('el ejemplo del 200 es lo que responde la API para ese producto (salvo el id)', async () => {
    const ejemplo = contenidoDelExito.example ?? Object.values(contenidoDelExito.examples)[0].value;
    expect(ejemplo.length).toBeGreaterThan(0);
    const { id, ...datos } = ejemplo[0];
    expect(typeof id).toBe('number');
    expect(typeof datos.precio).toBe('string');
    idsCreados.push((await Producto.create(datos)).id);

    const respuesta = await buscar(datos.nombre.slice(0, 4));
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual([{ ...datos, id: respuesta.body[0].id }]);
  });

  it('la respuesta real cumple el esquema Producto: tipos, pattern y ningún campo de más', async () => {
    const { properties, required } = resuelto.components.schemas.Producto;
    idsCreados.push(
      (await Producto.create({ nombre: 'Leche', codigoBarras: '1', precio: '25' })).id,
    );
    const [producto] = (await buscar('lech')).body;
    expect(Object.keys(producto).sort()).toEqual([...required].sort());
    expect(Number.isInteger(producto.id)).toBe(true);
    expect(typeof producto.nombre).toBe('string');
    expect(typeof producto.codigoBarras).toBe('string');
    expect(producto.precio).toMatch(new RegExp(properties.precio.pattern));
  });

  it('el 400 real tiene la forma de RespuestaDeError y el código que documenta DatosInvalidos', async () => {
    const ejemplo =
      resuelto.components.responses.DatosInvalidos.content['application/json'].example;
    const respuesta = await buscar('a');
    expect(respuesta.status).toBe(400);
    expect(Object.keys(respuesta.body)).toEqual(['error']);
    expect(respuesta.body.error.codigo).toBe(ejemplo.error.codigo);
    expect(Object.keys(respuesta.body.error).sort()).toEqual(['codigo', 'detalles', 'mensaje']);
    for (const detalle of respuesta.body.error.detalles) {
      expect(Object.keys(detalle).sort()).toEqual(['campo', 'mensaje']);
    }
  });

  it('el 500 real es el ejemplo de ErrorInterno, sin nada del error original', async () => {
    const ejemplo = resuelto.components.responses.ErrorInterno.content['application/json'].example;
    vi.spyOn(Producto, 'findAll').mockRejectedValueOnce(new Error('SELECT * FROM productos falló'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const respuesta = await buscar('lech');
    expect(respuesta.status).toBe(500);
    expect(respuesta.body).toEqual(ejemplo);
  });
});
