import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { carpetaBackend, correrNpm, correrNpmSinFallar } from './ayudas.js';

const require = createRequire(import.meta.url);
const sequelize = require('../../src/database.js');

// Necesita MySQL levantado. `npm run preparar-prueba` (scripts/crear-base-de-prueba.js) crea la base de prueba
// con root y le da todos los permisos al usuario de la app. Estas pruebas miran con el usuario de la app.
const TIEMPO = 60_000;
const baseDePrueba = process.env.MYSQL_TEST_DATABASE;
const baseDeDesarrollo = process.env.MYSQL_DATABASE;

async function consultar(sql, reemplazos = {}) {
  const [filas] = await sequelize.query(sql, { replacements: reemplazos });
  return filas;
}

async function permisosDelUsuario() {
  const filas = await consultar('SHOW GRANTS FOR CURRENT_USER()');
  return filas.map((fila) => Object.values(fila)[0]);
}

async function tablasDe(base) {
  const filas = await consultar(
    'SELECT table_name AS nombre FROM information_schema.tables WHERE table_schema = :base ORDER BY table_name',
    { base },
  );
  return filas.map((fila) => fila.nombre);
}

describe('npm run preparar-prueba', () => {
  it('el script existe en backend/scripts/', () => {
    expect(fs.existsSync(path.join(carpetaBackend, 'scripts', 'crear-base-de-prueba.js'))).toBe(
      true,
    );
  });

  it(
    'crea la base de prueba con utf8mb4 y el orden utf8mb4_0900_ai_ci',
    () => {
      correrNpm('preparar-prueba');
      return consultar(
        `SELECT default_character_set_name AS juego, default_collation_name AS orden
           FROM information_schema.schemata WHERE schema_name = :base`,
        { base: baseDePrueba },
      ).then((filas) => {
        expect(filas).toEqual([{ juego: 'utf8mb4', orden: 'utf8mb4_0900_ai_ci' }]);
      });
    },
    TIEMPO,
  );

  it(
    'se puede correr más de una vez sin error',
    () => {
      expect(correrNpmSinFallar('preparar-prueba').codigo).toBe(0);
      expect(correrNpmSinFallar('preparar-prueba').codigo).toBe(0);
    },
    TIEMPO,
  );

  it(
    'le da todos los permisos al usuario de la app sobre la base de prueba',
    async () => {
      const permisos = await permisosDelUsuario();
      // MySQL escribe el guion bajo del nombre con o sin barra, según el permiso sea literal o de patrón.
      const patron = new RegExp(
        `^GRANT ALL PRIVILEGES ON \`${baseDePrueba.replaceAll('_', '\\\\?_')}\`\\.\\* TO `,
      );
      expect(permisos.some((permiso) => patron.test(permiso))).toBe(true);
    },
    TIEMPO,
  );

  it(
    'no toca la base de desarrollo: ni sus tablas ni los permisos que el usuario tiene sobre ella',
    async () => {
      const antes = {
        tablas: await tablasDe(baseDeDesarrollo),
        permisos: await permisosDelUsuario(),
      };
      correrNpm('preparar-prueba');
      const despues = {
        tablas: await tablasDe(baseDeDesarrollo),
        permisos: await permisosDelUsuario(),
      };
      const mencionaLaDePrueba = (permiso) => permiso.replaceAll('\\', '').includes(baseDePrueba);
      const sinLaDePrueba = (permisos) =>
        permisos.filter((permiso) => !mencionaLaDePrueba(permiso));
      expect(despues.tablas).toEqual(antes.tablas);
      expect(sinLaDePrueba(despues.permisos)).toEqual(sinLaDePrueba(antes.permisos));
    },
    TIEMPO,
  );

  it(
    'falla y nombra MYSQL_ROOT_PASSWORD si esa variable está vacía',
    () => {
      const resultado = correrNpmSinFallar('preparar-prueba', { MYSQL_ROOT_PASSWORD: '' });
      expect(resultado.codigo).not.toBe(0);
      expect(resultado.salida).toContain('MYSQL_ROOT_PASSWORD');
    },
    TIEMPO,
  );

  it(
    'falla y nombra MYSQL_TEST_DATABASE si es igual a MYSQL_DATABASE',
    () => {
      const resultado = correrNpmSinFallar('preparar-prueba', {
        MYSQL_TEST_DATABASE: baseDeDesarrollo,
      });
      expect(resultado.codigo).not.toBe(0);
      expect(resultado.salida).toContain('MYSQL_TEST_DATABASE');
    },
    TIEMPO,
  );
});

describe('quién usa MYSQL_ROOT_PASSWORD', () => {
  function archivosDe(carpeta) {
    const dentro = path.join(carpetaBackend, carpeta);
    if (!fs.existsSync(dentro)) return [];
    return fs
      .readdirSync(dentro, { recursive: true, withFileTypes: true })
      .filter((entrada) => entrada.isFile())
      .map((entrada) => path.join(entrada.parentPath, entrada.name));
  }

  it('solo scripts/crear-base-de-prueba.js la lee: ni src/ ni db/ la nombran', () => {
    for (const archivo of [...archivosDe('src'), ...archivosDe('db')]) {
      expect(fs.readFileSync(archivo, 'utf8'), archivo).not.toContain('MYSQL_ROOT_PASSWORD');
    }
  });

  it('la API nunca entra a MySQL como root', () => {
    expect(sequelize.config.username).not.toBe('root');
  });
});

describe('la base de prueba es aparte', () => {
  it('las pruebas trabajan en MYSQL_TEST_DATABASE, distinta de MYSQL_DATABASE', async () => {
    expect(baseDePrueba).toBeTruthy();
    expect(baseDePrueba).not.toBe(baseDeDesarrollo);
    const [{ base }] = await consultar('SELECT DATABASE() AS base');
    expect(base).toBe(baseDePrueba);
  });
});
