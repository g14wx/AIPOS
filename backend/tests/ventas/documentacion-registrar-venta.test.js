import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import SwaggerParser from '@apidevtools/swagger-parser';
import { listarRutasDocumentadas, listarRutasRegistradas } from '../documentacion/rutas.js';
import { detalle, prepararVentas, registrarVentaPorApi } from './ayudas-registrar-venta.js';

const require = createRequire(import.meta.url);
const ErrorApi = require('../../src/errors/ErrorApi.js');
const { cargarDocumentacionApi } = require('../../src/documentacion.js');
const { montajes } = require('../../src/routes/index.js');
const { validarVentaNueva } = require('../../src/validators/ventas.js');
const { registrarVenta, MENSAJES_DE_LAS_REGLAS } = require('../../src/services/ventas.js');

// Necesita MySQL levantado y la base de prueba migrada (npm run migrar:prueba).
// POST /api/ventas en la documentación de la API (subtarea de V-03; spec de la documentación de la API). La prueba
// de A-01 ya falla si una ruta de Express no está documentada; esta revisa lo que dice la de registrar venta.
const documento = cargarDocumentacionApi();
const resuelto = await SwaggerParser.dereference(structuredClone(documento));
const operacion = documento.paths['/api/ventas']?.post;
const operacionResuelta = resuelto.paths['/api/ventas']?.post;
const PATRON_DEL_PRECIO = '^\\d{1,5}(\\.\\d{1,2})?$';
const ejemploDe = (contenido) => contenido.example ?? Object.values(contenido.examples)[0].value;
const contexto = prepararVentas({ productos: 2 });

describe('POST /api/ventas está documentada', () => {
  it('está en Express (montajes) y en el documento, como registrarVenta de la etiqueta Ventas', () => {
    expect(listarRutasRegistradas(montajes)).toContain('POST /api/ventas');
    expect(listarRutasDocumentadas(documento)).toContain('POST /api/ventas');
    expect(operacion.operationId).toBe('registrarVenta');
    expect(operacion.tags).toEqual(['Ventas']);
    expect(documento.tags.find((etiqueta) => etiqueta.name === 'Ventas')?.description).toBeTruthy();
  });

  it('documenta sus cuatro respuestas: 201, 400, 422 y 500, y ninguna más', () => {
    expect(Object.keys(operacion.responses).sort()).toEqual(['201', '400', '422', '500']);
    expect(operacion.responses['400']).toEqual({ $ref: '#/components/responses/DatosInvalidos' });
    expect(operacion.responses['422']).toEqual({ $ref: '#/components/responses/ReglaDeNegocio' });
    expect(operacion.responses['500']).toEqual({ $ref: '#/components/responses/ErrorInterno' });
    expect(operacion.responses['201'].description).toBeTruthy();
  });

  it('el cuerpo es obligatorio: detalles es una lista de 1 a 100 detalles de venta, y nada más', () => {
    expect(operacion.requestBody.required).toBe(true);
    const esquema = operacionResuelta.requestBody.content['application/json'].schema;
    expect(esquema.type).toBe('object');
    expect(esquema.required).toEqual(['detalles']);
    // Ni un total ni un subtotal: los calcula MySQL (RN-09).
    expect(Object.keys(esquema.properties)).toEqual(['detalles']);
    expect(esquema.properties.detalles).toMatchObject({
      type: 'array',
      minItems: 1,
      maxItems: 100,
    });
  });

  it('cada detalle tiene productoId y cantidad enteros con su rango, y el precio aplicado como texto con su pattern', () => {
    const { items } =
      operacionResuelta.requestBody.content['application/json'].schema.properties.detalles;
    expect(items.type).toBe('object');
    expect([...items.required].sort()).toEqual(['cantidad', 'precioAplicado', 'productoId']);
    expect(Object.keys(items.properties).sort()).toEqual([
      'cantidad',
      'precioAplicado',
      'productoId',
    ]);
    expect(items.properties.productoId).toMatchObject({
      type: 'integer',
      minimum: 1,
      maximum: 2147483647,
    });
    expect(items.properties.cantidad).toMatchObject({ type: 'integer', minimum: 1, maximum: 999 });
    expect(items.properties.precioAplicado).toMatchObject({
      type: 'string',
      pattern: PATRON_DEL_PRECIO,
    });
  });

  it('el 201 devuelve ventaId (entero) y total (texto con 2 decimales y su pattern), sin campos de más', () => {
    const esquema = operacionResuelta.responses['201'].content['application/json'].schema;
    expect(esquema.type).toBe('object');
    expect([...esquema.required].sort()).toEqual(['total', 'ventaId']);
    expect(esquema.additionalProperties).toBe(false);
    expect(esquema.properties.ventaId.type).toBe('integer');
    expect(esquema.properties.total.type).toBe('string');
    // El pattern deja pasar los totales que MySQL puede dar (hasta 9989999001.00) y ninguno sin 2 decimales.
    const patron = new RegExp(esquema.properties.total.pattern);
    for (const total of ['0.00', '47.50', '99899990.01', '9989999001.00']) {
      expect(patron.test(total), total).toBe(true);
    }
    for (const total of ['47.5', '47', '-1.00', 'abc', '99999999999.00']) {
      expect(patron.test(total), total).toBe(false);
    }
  });
});

describe('los ejemplos de POST /api/ventas dicen lo que la API hace', () => {
  const contenidoDelCuerpo = operacion?.requestBody.content['application/json'];
  const contenidoDel201 = operacion?.responses['201'].content['application/json'];
  const ejemploDelError = (nombre) =>
    ejemploDe(documento.components.responses[nombre].content['application/json']);

  it('el ejemplo del cuerpo pasa el validador de la API', () => {
    expect(validarVentaNueva(ejemploDe(contenidoDelCuerpo))).toEqual(ejemploDe(contenidoDelCuerpo));
  });

  it('mandar el ejemplo del cuerpo (con productos de prueba) da el ejemplo del 201: el mismo total y el número que ponga MySQL', async () => {
    const ejemplo = ejemploDe(contenidoDelCuerpo);
    const cuerpo = {
      detalles: ejemplo.detalles.map((d, i) => ({ ...d, productoId: contexto.productoIds[i] })),
    };

    const respuesta = await registrarVentaPorApi(cuerpo);

    expect(respuesta.status).toBe(201);
    expect(respuesta.body).toEqual({ ...ejemploDe(contenidoDel201), ventaId: expect.any(Number) });
  });

  it('el 400 real trae el código del ejemplo de DatosInvalidos y detalles del error con campo y mensaje', async () => {
    const ejemplo = ejemploDelError('DatosInvalidos');
    const respuesta = await registrarVentaPorApi({
      detalles: [detalle(contexto.productoIds[0], { precioAplicado: '10.999' })],
    });
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error.codigo).toBe(ejemplo.error.codigo);
    expect(respuesta.body.error.detalles.length).toBeGreaterThan(0);
    for (const detalleDelError of respuesta.body.error.detalles) {
      expect(Object.keys(detalleDelError).sort()).toEqual(['campo', 'mensaje']);
    }
  });

  it('el ejemplo del 422 es lo que da el servicio para una venta sin detalles: el mismo código y el mismo mensaje', async () => {
    const error = await registrarVenta([]).catch((err) => err);
    expect(error).toBeInstanceOf(ErrorApi);
    expect({ codigo: error.codigo, mensaje: error.message }).toEqual(
      ejemploDelError('ReglaDeNegocio').error,
    );
  });

  it('la descripción de la operación nombra todos los códigos del 422 que da el servicio', () => {
    for (const codigo of Object.keys(MENSAJES_DE_LAS_REGLAS)) {
      expect(operacion.description, codigo).toContain(codigo);
    }
  });
});

describe('los límites del documento son los del validador', () => {
  const esquema = operacionResuelta?.requestBody.content['application/json'].schema;
  const propiedades = esquema?.properties.detalles.items.properties;
  const ventaCon = (cambios) => ({
    detalles: [{ productoId: 3, cantidad: 2, precioAplicado: '22.00', ...cambios }],
  });
  const listaDe = (cuantos) => ({
    detalles: Array.from({ length: cuantos }, (_, i) => ({
      productoId: i + 1,
      cantidad: 1,
      precioAplicado: '1.00',
    })),
  });
  function validoParaLaApi(cuerpo) {
    try {
      validarVentaNueva(cuerpo);
      return true;
    } catch {
      return false;
    }
  }

  it.each(['productoId', 'cantidad'])(
    'el validador acepta el mínimo y el máximo de %s y rechaza uno menos y uno más',
    (campo) => {
      const { minimum, maximum } = propiedades[campo];
      expect(validoParaLaApi(ventaCon({ [campo]: minimum }))).toBe(true);
      expect(validoParaLaApi(ventaCon({ [campo]: maximum }))).toBe(true);
      expect(validoParaLaApi(ventaCon({ [campo]: minimum - 1 }))).toBe(false);
      expect(validoParaLaApi(ventaCon({ [campo]: maximum + 1 }))).toBe(false);
    },
  );

  it('el validador acepta el mínimo y el máximo de detalles (minItems y maxItems) y rechaza uno menos y uno más', () => {
    const { minItems, maxItems } = esquema.properties.detalles;
    expect(validoParaLaApi(listaDe(minItems))).toBe(true);
    expect(validoParaLaApi(listaDe(maxItems))).toBe(true);
    expect(validoParaLaApi(listaDe(minItems - 1))).toBe(false);
    expect(validoParaLaApi(listaDe(maxItems + 1))).toBe(false);
  });

  it('el pattern del precio aplicado acepta y rechaza lo mismo que el validador', () => {
    const patron = new RegExp(propiedades.precioAplicado.pattern);
    const textos = ['0', '0.0', '0.00', '22', '22.5', '22.50', '99999.99', '00022'];
    textos.push('10.999', '100000', '-1', 'abc', '1e2', '22.', '.5', ' 22', '22\n');
    for (const texto of textos) {
      expect(patron.test(texto), texto).toBe(validoParaLaApi(ventaCon({ precioAplicado: texto })));
    }
  });
});
