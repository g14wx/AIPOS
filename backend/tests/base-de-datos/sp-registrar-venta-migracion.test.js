import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { carpetaBackend, correrCli, correrNpm, tablasDeLaBase } from './ayudas.js';
import {
  ARCHIVO_SQL,
  buscarClienteMysql,
  correrSql,
  leerProcedimiento,
  sinComentariosNiEspacios,
} from './ayudas-sp-registrar-venta.js';

const require = createRequire(import.meta.url);
const sequelize = require('../../src/database.js');

// Necesita MySQL levantado y la base de prueba creada. Las pruebas de MySQL deshacen y rehacen las migraciones de
// la base de prueba: al terminar la dejan migrada, como la encontró el globalSetup.
const TIEMPO = 120_000;
const carpetaMigraciones = path.join(carpetaBackend, 'db', 'migrations');
const nombres = fs
  .readdirSync(carpetaMigraciones)
  .filter((nombre) => !nombre.startsWith('.'))
  .sort();
const archivoDe = (patron) => nombres.find((nombre) => patron.test(nombre));
const archivoVentas = archivoDe(/^\d{14}-crear-ventas\.c?js$/);
const archivoDetalles = archivoDe(/^\d{14}-crear-detalles-venta\.c?js$/);
const archivoProcedimiento = archivoDe(/^\d{14}-crear-sp-registrar-venta\.c?js$/);
const rutaMigracion = archivoProcedimiento && path.join(carpetaMigraciones, archivoProcedimiento);
const textoSql = fs.existsSync(ARCHIVO_SQL) ? fs.readFileSync(ARCHIVO_SQL, 'utf8') : '';
// Lo que hay entre la línea `DELIMITER $$` y el `$$` final: el bloque CREATE PROCEDURE ... END.
const bloqueCreate = textoSql.match(/^DELIMITER \$\$\r?\n([\s\S]*?)\$\$\r?\nDELIMITER ;/m)?.[1];

describe('el archivo de la migración y el script SQL', () => {
  it('existe db/migrations/AAAAMMDDHHMMSS-crear-sp-registrar-venta.js, en CommonJS, con up y down', () => {
    expect(archivoProcedimiento, 'falta la migración crear-sp-registrar-venta').toBeDefined();
    const migracion = require(rutaMigracion);
    expect(typeof migracion.up).toBe('function');
    expect(typeof migracion.down).toBe('function');
  });

  it('es la migración más nueva de las de ventas: corre después de crear-ventas y de crear-detalles-venta', () => {
    expect(archivoProcedimiento, 'falta la migración crear-sp-registrar-venta').toBeDefined();
    expect(nombres.indexOf(archivoProcedimiento)).toBeGreaterThan(nombres.indexOf(archivoVentas));
    expect(nombres.indexOf(archivoProcedimiento)).toBeGreaterThan(nombres.indexOf(archivoDetalles));
  });

  it('db/procedimientos/sp_registrar_venta.sql empieza con el DROP y pone el CREATE PROCEDURE entre DELIMITER $$ y $$', () => {
    expect(textoSql, 'falta db/procedimientos/sp_registrar_venta.sql').not.toBe('');
    const sinComentarios = textoSql.replace(/^--.*$/gm, '');
    expect(sinComentarios.trimStart()).toMatch(/^DROP PROCEDURE IF EXISTS sp_registrar_venta;/);
    expect(
      bloqueCreate,
      'no hay un bloque DELIMITER $$ ... $$ seguido de DELIMITER ;',
    ).toBeDefined();
    expect(bloqueCreate.trim()).toMatch(
      /^CREATE PROCEDURE sp_registrar_venta\(IN p_detalles JSON\)/,
    );
    expect(bloqueCreate.trim()).toMatch(/END$/);
  });

  it('el script no lleva DEFINER=, CREATE OR REPLACE, USE ni CREATE DATABASE: el cliente ya entra a la base con el usuario de la app', () => {
    expect(textoSql, 'falta db/procedimientos/sp_registrar_venta.sql').not.toBe('');
    expect(textoSql).not.toMatch(/DEFINER\s*=/i);
    expect(textoSql).not.toMatch(/CREATE\s+OR\s+REPLACE/i);
    expect(textoSql).not.toMatch(/^\s*USE\s/im);
    expect(textoSql).not.toMatch(/CREATE\s+DATABASE/i);
  });
});

describe('lo que la migración manda a MySQL', () => {
  // Un queryInterface de mentira: guarda cada llamada a sequelize.query con sus argumentos.
  const queryInterfaceDeMentira = () => {
    const llamadas = [];
    return { llamadas, sequelize: { query: async (...argumentos) => llamadas.push(argumentos) } };
  };

  it('up manda el DROP y el CREATE en dos llamadas separadas, en ese orden', async () => {
    const queryInterface = queryInterfaceDeMentira();
    await require(rutaMigracion).up(queryInterface);
    expect(queryInterface.llamadas).toHaveLength(2);
    const [[drop], [create]] = queryInterface.llamadas;
    expect(drop).toBe('DROP PROCEDURE IF EXISTS sp_registrar_venta');
    expect(create).toMatch(/^CREATE PROCEDURE sp_registrar_venta\(IN p_detalles JSON\)/);
    expect(create).toMatch(/END$/);
  });

  it('el CREATE no lleva DELIMITER, $$, DEFINER, CREATE OR REPLACE ni un punto y coma final, y se manda sin replacements ni opciones', async () => {
    const queryInterface = queryInterfaceDeMentira();
    await require(rutaMigracion).up(queryInterface);
    const [drop, create] = queryInterface.llamadas;
    expect(create[0]).not.toMatch(/DELIMITER/i);
    expect(create[0]).not.toContain('$$');
    expect(create[0]).not.toMatch(/DEFINER\s*=/i);
    expect(create[0]).not.toMatch(/CREATE\s+OR\s+REPLACE/i);
    expect(create[0]).not.toMatch(/;\s*$/);
    // Con replacements, Sequelize cambiaría cualquier :nombre que hubiera en el cuerpo.
    expect(create).toHaveLength(1);
    expect(drop).toHaveLength(1);
  });

  it('el CREATE es el mismo texto que el .sql trae entre DELIMITER $$ y $$: la migración lee ese archivo', async () => {
    expect(bloqueCreate, 'falta el bloque DELIMITER $$ ... $$ del .sql').toBeDefined();
    const queryInterface = queryInterfaceDeMentira();
    await require(rutaMigracion).up(queryInterface);
    expect(queryInterface.llamadas[1][0]).toBe(bloqueCreate.trim());
  });

  it('down manda solo DROP PROCEDURE IF EXISTS', async () => {
    const queryInterface = queryInterfaceDeMentira();
    await require(rutaMigracion).down(queryInterface);
    expect(queryInterface.llamadas).toEqual([['DROP PROCEDURE IF EXISTS sp_registrar_venta']]);
  });
});

describe('el procedimiento en MySQL, con sequelize-cli', () => {
  beforeAll(() => {
    correrCli('db:migrate:undo:all', '--env', 'test');
  }, TIEMPO);

  afterAll(() => {
    correrCli('db:migrate', '--env', 'test');
  }, TIEMPO);

  const tablas = async () => (await tablasDeLaBase(sequelize)).filter((n) => n !== 'SequelizeMeta');

  it(
    'desde cero, migrar:prueba lo crea, con el usuario de la app como definidor y no con root',
    async () => {
      expect(await leerProcedimiento(), 'antes de migrar ya existía').toBeUndefined();
      correrNpm('migrar:prueba');
      const procedimiento = await leerProcedimiento();
      expect(procedimiento, 'la migración no creó sp_registrar_venta').toBeDefined();
      expect(procedimiento.definidor).toMatch(new RegExp(`^${process.env.MYSQL_USER}@`));
      expect(procedimiento.definidor).not.toMatch(/^root@/);
      expect(procedimiento.seguridad).toBe('DEFINER');
    },
    TIEMPO,
  );

  it(
    'deshacer solo esta migración borra el procedimiento y deja las tablas; migrar lo vuelve a crear',
    async () => {
      const cuerpo = (await leerProcedimiento()).cuerpo;
      correrCli('db:migrate:undo', '--name', archivoProcedimiento, '--env', 'test');
      expect(await leerProcedimiento()).toBeUndefined();
      expect(await tablas()).toEqual(
        expect.arrayContaining(['productos', 'ventas', 'detalles_venta']),
      );
      correrNpm('migrar:prueba');
      expect((await leerProcedimiento()).cuerpo).toBe(cuerpo);
    },
    TIEMPO,
  );

  it(
    'es la última migración: deshacer:prueba lo quita, y migrar:prueba lo pone otra vez',
    async () => {
      correrNpm('deshacer:prueba');
      expect(await leerProcedimiento()).toBeUndefined();
      correrNpm('migrar:prueba');
      expect(await leerProcedimiento()).toBeDefined();
    },
    TIEMPO,
  );

  it(
    'rehacer:prueba lo borra y lo vuelve a crear con el mismo cuerpo',
    async () => {
      const antes = await leerProcedimiento();
      expect(antes, 'el procedimiento no existe antes de rehacer').toBeDefined();
      correrNpm('rehacer:prueba');
      expect(await leerProcedimiento()).toEqual(antes);
    },
    TIEMPO,
  );

  it(
    'up se puede correr dos veces seguidas sin error: el DROP IF EXISTS va primero',
    async () => {
      const { up } = require(rutaMigracion);
      await up(sequelize.getQueryInterface());
      await up(sequelize.getQueryInterface());
      expect(await leerProcedimiento()).toBeDefined();
    },
    TIEMPO,
  );

  it(
    'deshacerlo todo lo borra, y migrar lo crea otra vez',
    async () => {
      correrCli('db:migrate:undo:all', '--env', 'test');
      expect(await leerProcedimiento()).toBeUndefined();
      correrNpm('migrar:prueba');
      expect(await leerProcedimiento()).toBeDefined();
    },
    TIEMPO,
  );
});

// Criterio 5: la migración y el cliente mysql crean el mismo procedimiento, con el usuario de la app. Si no hay
// un cliente mysql (ni el de Docker Compose ni el del PATH), la prueba se omite y se hace a mano (spec,
// "Pruebas en local").
const cliente = buscarClienteMysql();
const omitida = cliente
  ? ''
  : ' [omitida: no hay docker compose con mysql ni un cliente mysql en el PATH]';

describe('criterio 5: la migración y el cliente mysql crean el mismo procedimiento', () => {
  afterAll(() => {
    // Deja el procedimiento como lo crea la migración, que es como lo encuentran las demás pruebas.
    correrCli('db:migrate:undo', '--name', archivoProcedimiento, '--env', 'test');
    correrNpm('migrar:prueba');
  }, TIEMPO);

  it.skipIf(!cliente)(
    `el cuerpo y el definidor son los mismos, con el usuario de la app${omitida}`,
    async () => {
      correrNpm('migrar:prueba');
      const porMigracion = await leerProcedimiento();
      correrSql(cliente, textoSql);
      const porCliente = await leerProcedimiento();
      expect(porCliente.definidor).toBe(porMigracion.definidor);
      expect(porCliente.definidor).toMatch(new RegExp(`^${process.env.MYSQL_USER}@`));
      expect(porCliente.definidor).not.toMatch(/^root@/);
      expect(sinComentariosNiEspacios(porCliente.cuerpo)).toBe(
        sinComentariosNiEspacios(porMigracion.cuerpo),
      );
    },
    TIEMPO,
  );
});
