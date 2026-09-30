import { describe, it, expect, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import {
  consultar,
  detalle,
  prepararVentas,
  registrarVentaPorApi,
} from './ayudas-registrar-venta.js';
import { borrarVentas } from '../base-de-datos/ayudas-sp-registrar-venta.js';
import { carpetaBackend } from '../base-de-datos/ayudas.js';

const require = createRequire(import.meta.url);
const sequelize = require('../../src/database.js');

// Necesita MySQL levantado y la base de prueba migrada (npm run migrar:prueba).
// El CALL no va dentro de sequelize.transaction() (criterio 5 de V-03): el procedimiento maneja su propia
// transacción (START TRANSACTION ... COMMIT), y MySQL no anida transacciones. Con una transacción de afuera, el
// START TRANSACTION del procedimiento confirmaría sin avisar lo que Sequelize tuviera abierto.
const contexto = prepararVentas({ productos: 1 });
afterEach(() => vi.restoreAllMocks());

// El código de un archivo de src/ sin los comentarios: los comentarios explican la trampa y la nombran.
function codigoSinComentarios(...partes) {
  const ruta = path.join(carpetaBackend, 'src', ...partes);
  return fs.readFileSync(ruta, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
}

describe('el código de la ruta de ventas no abre transacciones', () => {
  it.each([
    ['services', 'ventas.js'],
    ['controllers', 'ventas.js'],
    ['routes', 'ventas.js'],
  ])('src/%s/%s no usa transaction, QueryTypes ni parámetros OUT', (capa, archivo) => {
    const codigo = codigoSinComentarios(capa, archivo);
    expect(codigo).not.toMatch(/\btransaction\b/i);
    expect(codigo).not.toMatch(/\bQueryTypes\b/);
    expect(codigo).not.toMatch(/\bOUT\b|@\w+/);
  });

  it('el servicio tiene un solo CALL, y es a sp_registrar_venta con :detalles', () => {
    const codigo = codigoSinComentarios('services', 'ventas.js');
    const llamadas = codigo.match(/\bCALL\b[^'"`]*/g) ?? [];
    expect(llamadas).toEqual(['CALL sp_registrar_venta(:detalles)']);
  });

  it('al registrar una venta por la API no se abre ninguna transacción de Sequelize', async () => {
    const abrir = vi.spyOn(sequelize, 'transaction');
    const respuesta = await registrarVentaPorApi({
      detalles: [detalle(contexto.productoIds[0], { cantidad: 2 })],
    });
    expect(respuesta.status).toBe(201);
    expect(abrir).not.toHaveBeenCalled();
  });
});

describe('por qué: la trampa conocida es real', () => {
  it('con una transacción de afuera, el START TRANSACTION del procedimiento la confirma y el rollback no deshace nada', async () => {
    const codigoBarras = 'SP-REG-TRAMPA';
    let ventaId;
    const afuera = await sequelize.transaction();
    try {
      await sequelize.query(
        'INSERT INTO productos (nombre, precio, codigo_barras) VALUES (:nombre, :precio, :codigoBarras)',
        {
          replacements: {
            nombre: 'Producto de la transacción de afuera',
            precio: '1.00',
            codigoBarras,
          },
          transaction: afuera,
        },
      );
      const filas = await sequelize.query('CALL sp_registrar_venta(:detalles)', {
        replacements: { detalles: JSON.stringify([detalle(contexto.productoIds[0])]) },
        transaction: afuera,
      });
      ventaId = filas[0].ventaId;
    } finally {
      await afuera.rollback();
    }

    // El rollback no pudo deshacer el producto: el procedimiento ya lo había confirmado.
    const productos = await consultar(
      'SELECT id FROM productos WHERE codigo_barras = :codigoBarras',
      {
        codigoBarras,
      },
    );
    expect(productos).toHaveLength(1);
    if (ventaId) await borrarVentas([ventaId]);
    await consultar('DELETE FROM productos WHERE codigo_barras = :codigoBarras', { codigoBarras });
  });
});
