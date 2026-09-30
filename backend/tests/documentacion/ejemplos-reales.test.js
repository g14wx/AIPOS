import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import { createRequire } from 'node:module';
import SwaggerParser from '@apidevtools/swagger-parser';

const require = createRequire(import.meta.url);
const { Router } = require('express');
const app = require('../../src/app.js');
const { cargarDocumentacionApi } = require('../../src/documentacion.js');

const documento = cargarDocumentacionApi();
// El mismo documento con cada $ref reemplazado por lo que apunta, para revisar un cuerpo contra un esquema.
const resuelto = await SwaggerParser.dereference(structuredClone(documento));

afterEach(() => vi.restoreAllMocks());

// Revisa solo lo que usan los esquemas de este documento: type, enum, pattern, required, properties,
// additionalProperties: false e items. Devuelve la lista de problemas, vacía si el valor cumple.
function problemas(valor, esquema, lugar = 'cuerpo') {
  const tipo = Array.isArray(valor) ? 'array' : valor === null ? 'null' : typeof valor;
  if (esquema.type && esquema.type !== tipo)
    return [`${lugar} debe ser ${esquema.type}, es ${tipo}`];
  const lista = [];
  if (esquema.enum && !esquema.enum.includes(valor)) lista.push(`${lugar} no está en enum`);
  if (esquema.pattern && !new RegExp(esquema.pattern).test(valor))
    lista.push(`${lugar} no cumple pattern`);
  if (tipo === 'object') {
    for (const campo of esquema.required ?? []) {
      if (!(campo in valor)) lista.push(`${lugar} no tiene ${campo}`);
    }
    for (const [campo, subvalor] of Object.entries(valor)) {
      const sub = esquema.properties?.[campo];
      if (sub) lista.push(...problemas(subvalor, sub, `${lugar}.${campo}`));
      else if (esquema.additionalProperties === false) lista.push(`${lugar} trae ${campo} de más`);
    }
  }
  if (tipo === 'array' && esquema.items) {
    valor.forEach((elemento, i) =>
      lista.push(...problemas(elemento, esquema.items, `${lugar}[${i}]`)),
    );
  }
  return lista;
}

function ejemploDe(contenido) {
  return contenido.example ?? Object.values(contenido.examples)[0].value;
}

describe('el revisor de esquemas de esta prueba', () => {
  const { RespuestaDeError } = resuelto.components.schemas;

  it('acepta el formato de error y rechaza un campo de más como stack', () => {
    const bueno = { error: { codigo: 'NO_ENCONTRADO', mensaje: 'La ruta no existe.' } };
    expect(problemas(bueno, RespuestaDeError)).toEqual([]);
    const malo = { error: { ...bueno.error, stack: 'at algo (archivo.js:1:1)' } };
    expect(problemas(malo, RespuestaDeError)).toEqual(['cuerpo.error trae stack de más']);
  });

  it('rechaza un código que no está en mayúsculas con guion bajo', () => {
    const malo = { error: { codigo: 'no encontrado', mensaje: 'x' } };
    expect(problemas(malo, RespuestaDeError)).toEqual(['cuerpo.error.codigo no cumple pattern']);
  });
});

describe('GET /api/salud dice lo mismo que su documentación', () => {
  const contenido = documento.paths['/api/salud'].get.responses['200'].content['application/json'];

  it('el ejemplo del 200 tiene la misma forma que la respuesta real', async () => {
    const respuesta = await request(app).get('/api/salud');
    expect(respuesta.status).toBe(200);
    const ejemplo = ejemploDe(contenido);
    expect(Object.keys(respuesta.body).sort()).toEqual(Object.keys(ejemplo).sort());
    expect(respuesta.body).toEqual(ejemplo);
  });

  it('la respuesta real y el ejemplo cumplen el esquema Salud', async () => {
    const { Salud } = resuelto.components.schemas;
    const respuesta = await request(app).get('/api/salud');
    expect(problemas(respuesta.body, Salud)).toEqual([]);
    expect(problemas(ejemploDe(contenido), Salud)).toEqual([]);
  });
});

describe('los errores reales dicen lo que documentan', () => {
  const { RespuestaDeError } = resuelto.components.schemas;
  const respuestas = documento.components.responses;

  it('el 404 de una ruta que no existe usa el código de NoEncontrado y cumple RespuestaDeError', async () => {
    const respuesta = await request(app).get('/api/no-existe');
    const ejemplo = ejemploDe(respuestas.NoEncontrado.content['application/json']);
    expect(respuesta.status).toBe(404);
    expect(respuesta.body.error.codigo).toBe(ejemplo.error.codigo);
    expect(respuesta.body).toEqual(ejemplo);
    expect(problemas(respuesta.body, RespuestaDeError)).toEqual([]);
  });

  it('el 500 real es el ejemplo de ErrorInterno, sin nada del error original', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const roto = Router();
    roto.get('/', () => {
      throw new Error('SELECT * FROM productos falló: errno 1146 en /app/src/x.js:3:9');
    });
    const laApp = app.crearApp(undefined, { montajes: [{ ruta: '/roto', router: roto }] });
    const respuesta = await request(laApp).get('/api/roto');
    const ejemplo = ejemploDe(respuestas.ErrorInterno.content['application/json']);
    expect(respuesta.status).toBe(500);
    expect(respuesta.body).toEqual(ejemplo);
    expect(problemas(respuesta.body, RespuestaDeError)).toEqual([]);
  });
});
