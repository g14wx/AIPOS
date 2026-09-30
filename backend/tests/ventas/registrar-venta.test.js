import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import {
  RUTA,
  api,
  contarFilas,
  detalle,
  leerDetalles,
  leerVenta,
  leerVentaConProductos,
  prepararVentas,
  registrarVentaPorApi,
} from './ayudas-registrar-venta.js';

const require = createRequire(import.meta.url);
const { config } = require('../../src/config.js');

// Necesita MySQL levantado y la base de prueba migrada (npm run migrar:prueba).
// POST /api/ventas con una venta válida (criterio 1 de V-03): responde 201 con el número de la venta y el total
// que calculó MySQL, y lo guardado es lo que se mandó. 100 productos de prueba: el máximo de una venta (RN-14).
const contexto = prepararVentas({ productos: 100 });

// La venta del ejemplo de la spec: 2 × 22.00 y 1 × 3.50.
const ventaDelEjemplo = () => ({
  detalles: [
    detalle(contexto.productoIds[0], { cantidad: 2, precioAplicado: '22.00' }),
    detalle(contexto.productoIds[1], { cantidad: 1, precioAplicado: '3.50' }),
  ],
});

describe('POST /api/ventas con una venta válida', () => {
  it('responde 201 con el número de la venta y el total 47.50, y hay 1 fila nueva en ventas y 2 en detalles_venta', async () => {
    const antes = await contarFilas();

    const respuesta = await registrarVentaPorApi(ventaDelEjemplo());

    expect(respuesta.status).toBe(201);
    expect(respuesta.headers['content-type']).toMatch(/application\/json/);
    expect(respuesta.body).toEqual({ ventaId: expect.any(Number), total: '47.50' });
    expect(await contarFilas()).toEqual({ ventas: antes.ventas + 1, detalles: antes.detalles + 2 });
  });

  it('el cuerpo tiene solo ventaId (un entero) y total (un texto con 2 decimales), y ninguna cabecera Location', async () => {
    const respuesta = await registrarVentaPorApi(ventaDelEjemplo());
    expect(Object.keys(respuesta.body)).toEqual(['ventaId', 'total']);
    expect(Number.isInteger(respuesta.body.ventaId)).toBe(true);
    expect(typeof respuesta.body.total).toBe('string');
    expect(respuesta.body.total).toMatch(/^\d+\.\d{2}$/);
    expect(respuesta.headers).not.toHaveProperty('location');
  });

  it('lo guardado es lo que se mandó: cada detalle con su subtotal, el total de la venta y la fecha que pone MySQL', async () => {
    const respuesta = await registrarVentaPorApi(ventaDelEjemplo());
    const { ventaId } = respuesta.body;

    const filas = await leerVentaConProductos(ventaId);

    expect(filas).toHaveLength(2);
    expect(
      filas.map(({ nombre, cantidad, precioAplicado, subtotal }) => ({
        nombre,
        cantidad,
        precioAplicado,
        subtotal,
      })),
    ).toEqual([
      { nombre: 'Producto de prueba 1', cantidad: 2, precioAplicado: '22.00', subtotal: '44.00' },
      { nombre: 'Producto de prueba 2', cantidad: 1, precioAplicado: '3.50', subtotal: '3.50' },
    ]);
    const venta = await leerVenta(ventaId);
    expect(venta.total).toBe('47.50');
    expect(venta.fecha).toBeInstanceOf(Date);
    expect(Number.isNaN(venta.fecha.getTime())).toBe(false);
  });

  it('el total lo calcula MySQL con decimales exactos: 3 × 0.10 y 1 × 0.20 suman 0.50, no 0.5000000000000001', async () => {
    const respuesta = await registrarVentaPorApi({
      detalles: [
        detalle(contexto.productoIds[0], { cantidad: 3, precioAplicado: '0.10' }),
        detalle(contexto.productoIds[1], { cantidad: 1, precioAplicado: '0.20' }),
      ],
    });
    expect(respuesta.status).toBe(201);
    expect(respuesta.body.total).toBe('0.50');
  });

  it('con el precio aplicado "0" en los dos detalles responde 201 y total "0.00" (RN-05)', async () => {
    const respuesta = await registrarVentaPorApi({
      detalles: ventaDelEjemplo().detalles.map((d) => ({ ...d, precioAplicado: '0' })),
    });
    expect(respuesta.status).toBe(201);
    expect(respuesta.body.total).toBe('0.00');
    const guardados = await leerDetalles(respuesta.body.ventaId);
    expect(guardados.map((d) => [d.precioAplicado, d.subtotal])).toEqual([
      ['0.00', '0.00'],
      ['0.00', '0.00'],
    ]);
  });

  it('un precio aplicado sin decimales ("22") se guarda con 2 decimales y su subtotal también', async () => {
    const respuesta = await registrarVentaPorApi({
      detalles: [detalle(contexto.productoIds[0], { cantidad: 2, precioAplicado: '22' })],
    });
    expect(respuesta.status).toBe(201);
    expect(respuesta.body.total).toBe('44.00');
    const [guardado] = await leerDetalles(respuesta.body.ventaId);
    expect(guardado).toMatchObject({ precioAplicado: '22.00', subtotal: '44.00' });
  });
});

describe('los valores más grandes que acepta (RN-05, RN-06 y RN-14)', () => {
  it('con cantidad 999 y precio aplicado 99999.99 responde 201 y total "99899990.01"', async () => {
    const respuesta = await registrarVentaPorApi({
      detalles: [detalle(contexto.productoIds[0], { cantidad: 999, precioAplicado: '99999.99' })],
    });
    expect(respuesta.status).toBe(201);
    expect(respuesta.body.total).toBe('99899990.01');
  });

  it('con 100 detalles de 999 × 99999.99 la venta se registra y el total es "9989999001.00"', async () => {
    const detalles = contexto.productoIds.map((id) =>
      detalle(id, { cantidad: 999, precioAplicado: '99999.99' }),
    );
    expect(detalles).toHaveLength(100);
    const antes = await contarFilas();

    const respuesta = await registrarVentaPorApi({ detalles });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.total).toBe('9989999001.00');
    expect(await contarFilas()).toEqual({
      ventas: antes.ventas + 1,
      detalles: antes.detalles + 100,
    });
  });
});

describe('lo que la API ignora del cuerpo', () => {
  it('no recibe un total ni un subtotal: si el cuerpo trae uno, el que vale es el de MySQL (RN-09)', async () => {
    const cuerpo = ventaDelEjemplo();
    Object.assign(cuerpo, { total: '1.00', id: 999999, fecha: '2000-01-01' });
    Object.assign(cuerpo.detalles[0], { subtotal: '0.01', nombre: 'Otro nombre' });

    const respuesta = await registrarVentaPorApi(cuerpo);

    expect(respuesta.status).toBe(201);
    expect(respuesta.body).toEqual({ ventaId: expect.any(Number), total: '47.50' });
    const venta = await leerVenta(respuesta.body.ventaId);
    expect(venta.total).toBe('47.50');
    expect(venta.id).not.toBe(999999);
    expect(venta.fecha.getUTCFullYear()).toBeGreaterThan(2000);
    const [primero] = await leerDetalles(respuesta.body.ventaId);
    expect(primero.subtotal).toBe('44.00');
  });
});

describe('dos peticiones iguales, una tras otra', () => {
  it('son dos ventas distintas, cada una con sus detalles: la spec deja la idempotencia como riesgo conocido', async () => {
    const antes = await contarFilas();

    const primera = await registrarVentaPorApi(ventaDelEjemplo());
    const segunda = await registrarVentaPorApi(ventaDelEjemplo());

    expect([primera.status, segunda.status]).toEqual([201, 201]);
    expect(segunda.body.ventaId).toBeGreaterThan(primera.body.ventaId);
    expect(await contarFilas()).toEqual({ ventas: antes.ventas + 2, detalles: antes.detalles + 4 });
  });
});

describe('la ruta solo acepta POST, y la pantalla la llama desde otro origen', () => {
  it.each(['get', 'put', 'patch', 'delete'])(
    '%s /api/ventas responde 404 NO_ENCONTRADO con el formato de error',
    async (metodo) => {
      const respuesta = await api()[metodo](RUTA);
      expect(respuesta.status).toBe(404);
      expect(respuesta.body).toEqual({
        error: { codigo: 'NO_ENCONTRADO', mensaje: 'La ruta no existe.' },
      });
    },
  );

  it('la petición previa de CORS (OPTIONS) deja pasar el POST del origen de la pantalla', async () => {
    const origen = config.corsOrigenes[0];
    const respuesta = await api()
      .options(RUTA)
      .set('Origin', origen)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type');
    expect(respuesta.status).toBe(204);
    expect(respuesta.headers['access-control-allow-origin']).toBe(origen);
    expect(respuesta.headers['access-control-allow-methods']).toMatch(/POST/);
  });
});
