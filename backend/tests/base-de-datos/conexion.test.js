import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sequelize = require('../../src/database.js');

// Necesita MySQL levantado (docker compose up -d --wait mysql) y la base de prueba creada
// (npm run preparar-prueba). Habla con la base de prueba, nunca con la de desarrollo.
async function consultar(sql) {
  const [filas] = await sequelize.query(sql);
  return filas;
}

describe('conexión a MySQL', () => {
  it('sequelize.authenticate() responde', async () => {
    await expect(sequelize.authenticate()).resolves.toBeUndefined();
  });

  it('es un MySQL 8.4', async () => {
    const [{ version }] = await consultar('SELECT VERSION() AS version');
    expect(version).toMatch(/^8\.4\./);
  });

  it('está conectado a la base de prueba y no a la de desarrollo', async () => {
    const [{ base }] = await consultar('SELECT DATABASE() AS base');
    expect(base).toBe(process.env.MYSQL_TEST_DATABASE);
    expect(base).not.toBe(process.env.MYSQL_DATABASE);
  });

  it('entra con el usuario de la app y no con root', async () => {
    const [{ usuario }] = await consultar('SELECT CURRENT_USER() AS usuario');
    expect(usuario).toMatch(new RegExp(`^${process.env.MYSQL_USER}@`));
    expect(usuario).not.toMatch(/^root@/);
  });

  it('la base de prueba usa utf8mb4 con el orden utf8mb4_0900_ai_ci', async () => {
    const [{ juego, orden }] = await consultar(
      'SELECT @@character_set_database AS juego, @@collation_database AS orden',
    );
    expect(juego).toBe('utf8mb4');
    expect(orden).toBe('utf8mb4_0900_ai_ci');
  });

  it('la conexión habla en utf8mb4: las tildes y la eñe llegan sin cambiar', async () => {
    const [{ texto }] = await consultar("SELECT 'Ñandú café' AS texto");
    expect(texto).toBe('Ñandú café');
    const [{ juego }] = await consultar('SELECT @@character_set_connection AS juego');
    expect(juego).toBe('utf8mb4');
  });

  it('la sesión trabaja en UTC', async () => {
    const [{ zona }] = await consultar('SELECT @@session.time_zone AS zona');
    expect(zona).toBe('+00:00');
  });

  it('el orden por defecto no distingue mayúsculas ni tildes: "lech" encuentra "Leche"', async () => {
    // Una tabla temporal vive solo en su conexión, por eso todo va en una transacción administrada.
    const encontrados = await sequelize.transaction(async (transaccion) => {
      const consulta = (sql) => sequelize.query(sql, { transaction: transaccion });
      await consulta('CREATE TEMPORARY TABLE prueba_orden (nombre VARCHAR(50))');
      await consulta("INSERT INTO prueba_orden (nombre) VALUES ('Leche'), ('Café'), ('Pan')");
      const [porLeche] = await consulta(
        "SELECT nombre FROM prueba_orden WHERE nombre LIKE 'lech%'",
      );
      const [porCafe] = await consulta("SELECT nombre FROM prueba_orden WHERE nombre LIKE 'cafe%'");
      return { porLeche, porCafe };
    });
    expect(encontrados.porLeche).toEqual([{ nombre: 'Leche' }]);
    expect(encontrados.porCafe).toEqual([{ nombre: 'Café' }]);
  });
});
