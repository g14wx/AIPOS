import { describe, it, expect } from 'vitest';
import {
  consultar,
  contarFilas,
  detalle,
  idDeUnProductoBorrado,
  leerDetalles,
  prepararVentas,
  registrarVentaPorApi,
} from './ayudas-registrar-venta.js';

// Necesita MySQL levantado y la base de prueba migrada (npm run migrar:prueba).
// Registrar venta es todo o nada (RN-11), visto desde la API: si algo falla no queda ningún detalle, y las
// peticiones al mismo tiempo no mezclan sus filas. 100 productos de prueba: el máximo de una venta (RN-14).
const contexto = prepararVentas({ productos: 100 });

// Cuántos detalles de venta hay de los productos de prueba, sea de la venta que sea.
async function contarDetallesDeLosProductos() {
  const [fila] = await consultar(
    'SELECT COUNT(*) AS total FROM detalles_venta WHERE producto_id IN (:productoIds)',
    { productoIds: contexto.productoIds },
  );
  return Number(fila.total);
}

describe('todo o nada, desde la API', () => {
  it.each([
    ['al principio', 0],
    ['en medio', 1],
    ['al final', 2],
  ])(
    'un producto que no existe %s de dos productos válidos responde 422 y no queda ningún detalle',
    async (_donde, posicion) => {
      const [primero, segundo] = contexto.productoIds;
      const detalles = [detalle(primero, { cantidad: 2 }), detalle(segundo, { cantidad: 3 })];
      detalles.splice(posicion, 0, detalle(await idDeUnProductoBorrado()));
      const antes = await contarFilas();
      const detallesAntes = await contarDetallesDeLosProductos();

      const respuesta = await registrarVentaPorApi({ detalles });

      expect(respuesta.status).toBe(422);
      expect(respuesta.body.error.codigo).toBe('PRODUCTO_NO_EXISTE');
      expect(await contarFilas()).toEqual(antes);
      expect(await contarDetallesDeLosProductos()).toBe(detallesAntes);
    },
  );

  it('con 99 productos válidos y uno que no existe al final responde 422 y no queda ninguno de los 99', async () => {
    const detalles = [
      ...contexto.productoIds.slice(0, 99).map((id) => detalle(id)),
      detalle(await idDeUnProductoBorrado()),
    ];
    expect(detalles).toHaveLength(100);
    const antes = await contarFilas();

    const respuesta = await registrarVentaPorApi({ detalles });

    expect(respuesta.status).toBe(422);
    expect(respuesta.body.error.codigo).toBe('PRODUCTO_NO_EXISTE');
    expect(await contarFilas()).toEqual(antes);
  });

  it('después de un 422, la misma venta sin el producto que no existe se registra completa', async () => {
    const [primero, segundo] = contexto.productoIds;
    const borrado = await idDeUnProductoBorrado();
    const buenos = [detalle(primero, { cantidad: 2 }), detalle(segundo)];

    const rechazada = await registrarVentaPorApi({ detalles: [...buenos, detalle(borrado)] });
    const aceptada = await registrarVentaPorApi({ detalles: buenos });

    expect(rechazada.status).toBe(422);
    expect(aceptada.status).toBe(201);
    expect(aceptada.body.total).toBe('30.00');
    expect(await leerDetalles(aceptada.body.ventaId)).toHaveLength(2);
  });
});

describe('peticiones al mismo tiempo', () => {
  it('dos peticiones iguales crean dos ventas distintas, cada una completa y sin filas mezcladas', async () => {
    const [a, b, c] = contexto.productoIds;
    const cuerpo = {
      detalles: [
        detalle(a, { cantidad: 2, precioAplicado: '22.00' }),
        detalle(b, { cantidad: 1, precioAplicado: '3.50' }),
        detalle(c, { cantidad: 4, precioAplicado: '1.25' }),
      ],
    };
    const antes = await contarFilas();

    const respuestas = await Promise.all([
      registrarVentaPorApi(cuerpo),
      registrarVentaPorApi(cuerpo),
    ]);

    expect(respuestas.map((respuesta) => respuesta.status)).toEqual([201, 201]);
    const [una, otra] = respuestas.map((respuesta) => respuesta.body);
    expect(una.ventaId).not.toBe(otra.ventaId);
    expect([una.total, otra.total]).toEqual(['52.50', '52.50']);
    expect(await contarFilas()).toEqual({ ventas: antes.ventas + 2, detalles: antes.detalles + 6 });
    for (const { ventaId } of [una, otra]) {
      const guardados = await leerDetalles(ventaId);
      expect(
        guardados.map((d) => [d.productoId, d.cantidad, d.precioAplicado, d.subtotal]),
      ).toEqual([
        [a, 2, '22.00', '44.00'],
        [b, 1, '3.50', '3.50'],
        [c, 4, '1.25', '5.00'],
      ]);
    }
  });

  it('diez peticiones distintas a la vez guardan cada una sus propios detalles, sin mezclar filas', async () => {
    const [a, b] = contexto.productoIds;
    // La petición i lleva la cantidad i + 1 del primer producto: su total dice de qué petición es la venta.
    const cuerpos = Array.from({ length: 10 }, (_, i) => ({
      detalles: [
        detalle(a, { cantidad: i + 1, precioAplicado: '10.00' }),
        detalle(b, { cantidad: 1, precioAplicado: '0.50' }),
      ],
    }));
    const antes = await contarFilas();

    const respuestas = await Promise.all(cuerpos.map((cuerpo) => registrarVentaPorApi(cuerpo)));

    respuestas.forEach((respuesta, i) => {
      expect(respuesta.status).toBe(201);
      expect(respuesta.body.total).toBe(`${(i + 1) * 10}.50`);
    });
    expect(new Set(respuestas.map((respuesta) => respuesta.body.ventaId)).size).toBe(10);
    expect(await contarFilas()).toEqual({
      ventas: antes.ventas + 10,
      detalles: antes.detalles + 20,
    });
    for (const [i, respuesta] of respuestas.entries()) {
      const guardados = await leerDetalles(respuesta.body.ventaId);
      expect(guardados.map((d) => [d.productoId, d.cantidad])).toEqual([
        [a, i + 1],
        [b, 1],
      ]);
    }
  });

  it('ventas válidas y ventas con un producto que no existe, a la vez: las válidas quedan completas y las otras no dejan nada', async () => {
    const [a, b] = contexto.productoIds;
    const buena = { detalles: [detalle(a, { cantidad: 2 }), detalle(b)] };
    const mala = { detalles: [detalle(a), detalle(await idDeUnProductoBorrado()), detalle(b)] };
    const antes = await contarFilas();

    const respuestas = await Promise.all(
      [buena, mala, buena, mala, buena, mala].map((cuerpo) => registrarVentaPorApi(cuerpo)),
    );

    expect(respuestas.map((respuesta) => respuesta.status)).toEqual([201, 422, 201, 422, 201, 422]);
    expect(await contarFilas()).toEqual({ ventas: antes.ventas + 3, detalles: antes.detalles + 6 });
    for (const respuesta of respuestas.filter((r) => r.status === 201)) {
      expect(await leerDetalles(respuesta.body.ventaId)).toHaveLength(2);
    }
  });
});
