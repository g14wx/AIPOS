import { describe, it, expect, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { carpetaBackend, correrCli, correrNpm } from './ayudas.js';
import {
  ARCHIVO_SQL,
  ER_SIGNAL_EXCEPTION,
  buscarClienteMysql,
  consultar,
  correrSql,
  errorDe,
  leerProcedimiento,
  prepararPrueba,
} from './ayudas-sp-registrar-venta.js';

// Necesita MySQL levantado y la base de prueba migrada (npm run migrar:prueba).
// Corre db/procedimientos/sp_registrar_venta.sql con el cliente mysql, como lo haría una persona (spec registrar-venta,
// "Archivos"): con el servicio mysql de Docker Compose (`docker compose exec -T mysql mysql`) o con el cliente del
// PATH, contra la base de prueba y con el usuario de la app, nunca con root. Si no hay ninguno de los dos, las pruebas
// se omiten y la persona desarrolladora las hace a mano con el comando de "Pruebas en local".
const TIEMPO = 120_000;
const cliente = buscarClienteMysql();
const omitida = cliente
  ? ''
  : ' [omitida: no hay docker compose con mysql ni un cliente mysql en el PATH]';
const textoSql = fs.existsSync(ARCHIVO_SQL) ? fs.readFileSync(ARCHIVO_SQL, 'utf8') : '';
const archivoProcedimiento = fs
  .readdirSync(path.join(carpetaBackend, 'db', 'migrations'))
  .find((nombre) => /^\d{14}-crear-sp-registrar-venta\.c?js$/.test(nombre));

const contexto = prepararPrueba({ productos: 2 });
const detalle = (productoId, cantidad, precioAplicado) => ({
  productoId,
  cantidad,
  precioAplicado,
});

afterAll(() => {
  if (!cliente) return;
  // Deja el procedimiento como lo crea la migración, que es como lo encuentran las demás pruebas.
  correrCli('db:migrate:undo', '--name', archivoProcedimiento, '--env', 'test');
  correrNpm('migrar:prueba');
}, TIEMPO);

describe('correr db/procedimientos/sp_registrar_venta.sql con el cliente mysql', () => {
  it.skipIf(!cliente)(
    `crea el procedimiento con el usuario de la app y no con root${omitida}`,
    async () => {
      expect(textoSql, 'falta db/procedimientos/sp_registrar_venta.sql').not.toBe('');
      await consultar('DROP PROCEDURE IF EXISTS sp_registrar_venta');
      expect(await leerProcedimiento()).toBeUndefined();
      correrSql(cliente, textoSql);
      const procedimiento = await leerProcedimiento();
      expect(procedimiento, 'el cliente no creó sp_registrar_venta').toBeDefined();
      expect(procedimiento.definidor).toMatch(new RegExp(`^${process.env.MYSQL_USER}@`));
      expect(procedimiento.definidor).not.toMatch(/^root@/);
    },
    TIEMPO,
  );

  it.skipIf(!cliente)(
    `se puede correr dos veces seguidas: el DROP PROCEDURE IF EXISTS del script va primero${omitida}`,
    () => {
      expect(textoSql, 'falta db/procedimientos/sp_registrar_venta.sql').not.toBe('');
      correrSql(cliente, textoSql);
      correrSql(cliente, textoSql);
    },
    TIEMPO,
  );

  it.skipIf(!cliente)(
    `el procedimiento que crea el cliente registra una venta: 2 × 22.00 y 1 × 3.50 dan 47.50${omitida}`,
    async () => {
      correrSql(cliente, textoSql);
      const [leche, pan] = contexto.productoIds;
      const resultado = await contexto.llamador.llamar([
        detalle(leche, 2, '22.00'),
        detalle(pan, 1, '3.50'),
      ]);
      expect(resultado).toEqual({ ventaId: expect.any(Number), total: '47.50' });
    },
    TIEMPO,
  );

  it.skipIf(!cliente)(
    `aplica las reglas igual que el de la migración: el precio 10.999 y el que termina en salto de línea se rechazan${omitida}`,
    async () => {
      correrSql(cliente, textoSql);
      const [leche] = contexto.productoIds;
      const antes = await contexto.llamador.contar();
      for (const [precioAplicado, codigo] of [
        ['10.999', 'PRECIO_FUERA_DE_RANGO'],
        ['10\n', 'PRECIO_FUERA_DE_RANGO'],
        ['-1', 'PRECIO_FUERA_DE_RANGO'],
      ]) {
        const error = await errorDe(contexto.llamador.llamar([detalle(leche, 1, precioAplicado)]));
        expect(error, `precio ${JSON.stringify(precioAplicado)}`).toEqual({
          errno: ER_SIGNAL_EXCEPTION,
          estado: '45000',
          mensaje: codigo,
        });
      }
      expect(await contexto.llamador.contar()).toEqual(antes);
    },
    TIEMPO,
  );
});
