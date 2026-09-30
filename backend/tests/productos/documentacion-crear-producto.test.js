import { describe, it, expect, afterEach } from 'vitest';
import { createRequire } from 'node:module';
import SwaggerParser from '@apidevtools/swagger-parser';
import { listarRutasDocumentadas, listarRutasRegistradas } from '../documentacion/rutas.js';
import {
  borrarProductosDePrueba,
  codigoDeBarrasNuevo,
  crearProductoPorApi,
} from './ayudas-crear-producto.js';

const require = createRequire(import.meta.url);
const { cargarDocumentacionApi } = require('../../src/documentacion.js');
const { montajes } = require('../../src/routes/index.js');
const { validarProductoNuevo } = require('../../src/validators/productos.js');

// Necesita MySQL levantado y la base de prueba migrada (npm run migrar:prueba).
// POST /api/productos en la documentación de la API (criterio 8 de P-02; spec de la documentación de la API).
// La prueba de A-01 ya falla si una ruta de Express no está documentada; esta revisa lo que dice la de crear producto.
const documento = cargarDocumentacionApi();
const resuelto = await SwaggerParser.dereference(structuredClone(documento));
const operacion = documento.paths['/api/productos']?.post;
const PATRON_DEL_PRECIO = '^\\d{1,5}(\\.\\d{1,2})?$';
const ejemploDe = (contenido) => contenido.example ?? Object.values(contenido.examples)[0].value;

afterEach(borrarProductosDePrueba);

describe('POST /api/productos está documentada', () => {
  it('está en Express (montajes) y en el documento, como crearProducto de la etiqueta Productos', () => {
    expect(listarRutasRegistradas(montajes)).toContain('POST /api/productos');
    expect(listarRutasDocumentadas(documento)).toContain('POST /api/productos');
    expect(operacion.operationId).toBe('crearProducto');
    expect(operacion.tags).toEqual(['Productos']);
    expect(
      documento.tags.find((etiqueta) => etiqueta.name === 'Productos')?.description,
    ).toBeTruthy();
  });

  it('documenta sus cuatro respuestas: 201, 400, 409 y 500, y ninguna más', () => {
    expect(Object.keys(operacion.responses).sort()).toEqual(['201', '400', '409', '500']);
    expect(operacion.responses['400']).toEqual({ $ref: '#/components/responses/DatosInvalidos' });
    expect(operacion.responses['409']).toEqual({ $ref: '#/components/responses/Conflicto' });
    expect(operacion.responses['500']).toEqual({ $ref: '#/components/responses/ErrorInterno' });
    expect(operacion.responses['201'].description).toBeTruthy();
  });

  it('el cuerpo es obligatorio y tiene nombre, precio como texto con su pattern y código de barras, con sus largos', () => {
    expect(operacion.requestBody.required).toBe(true);
    const esquema =
      resuelto.paths['/api/productos'].post.requestBody.content['application/json'].schema;
    expect(esquema.type).toBe('object');
    expect(esquema.required).toEqual(['nombre', 'precio', 'codigoBarras']);
    expect(esquema.properties.nombre).toMatchObject({
      type: 'string',
      minLength: 1,
      maxLength: 120,
    });
    expect(esquema.properties.precio).toMatchObject({ type: 'string', pattern: PATRON_DEL_PRECIO });
    expect(esquema.properties.codigoBarras).toMatchObject({
      type: 'string',
      minLength: 1,
      maxLength: 50,
    });
  });

  it('el 201 devuelve un producto con id, nombre, precio como texto con su pattern y código de barras', () => {
    const esquema =
      resuelto.paths['/api/productos'].post.responses['201'].content['application/json'].schema;
    expect(esquema.type).toBe('object');
    expect(esquema.required).toEqual(['id', 'nombre', 'precio', 'codigoBarras']);
    expect(esquema.additionalProperties).toBe(false);
    expect(esquema.properties.id.type).toBe('integer');
    expect(esquema.properties.precio).toMatchObject({ type: 'string', pattern: PATRON_DEL_PRECIO });
  });
});

describe('los ejemplos de POST /api/productos dicen lo que la API hace', () => {
  const contenidoDelCuerpo = operacion?.requestBody.content['application/json'];
  const contenidoDel201 = operacion?.responses['201'].content['application/json'];

  it('el ejemplo del cuerpo pasa el validador de la API', () => {
    expect(validarProductoNuevo(ejemploDe(contenidoDelCuerpo))).toEqual(
      ejemploDe(contenidoDelCuerpo),
    );
  });

  it('mandar el ejemplo del cuerpo da el ejemplo del 201 (con otro código de barras y el id que ponga MySQL)', async () => {
    const codigoBarras = codigoDeBarrasNuevo();
    const respuesta = await crearProductoPorApi({ ...ejemploDe(contenidoDelCuerpo), codigoBarras });
    expect(respuesta.status).toBe(201);
    expect(respuesta.body).toEqual({
      ...ejemploDe(contenidoDel201),
      id: expect.any(Number),
      codigoBarras,
    });
  });

  it('el 409 real es el ejemplo de Conflicto y el 400 real trae los mismos detalles del error que DatosInvalidos', async () => {
    const cuerpo = { ...ejemploDe(contenidoDelCuerpo), codigoBarras: codigoDeBarrasNuevo() };
    await crearProductoPorApi(cuerpo);
    const conflicto = await crearProductoPorApi(cuerpo);
    expect(conflicto.status).toBe(409);
    expect(conflicto.body).toEqual(
      ejemploDe(documento.components.responses.Conflicto.content['application/json']),
    );

    const invalido = await crearProductoPorApi({ ...cuerpo, precio: '10.999' });
    const ejemplo = ejemploDe(
      documento.components.responses.DatosInvalidos.content['application/json'],
    );
    expect(invalido.status).toBe(400);
    expect(invalido.body.error.codigo).toBe(ejemplo.error.codigo);
    expect(invalido.body.error.detalles).toEqual(ejemplo.error.detalles);
  });
});
