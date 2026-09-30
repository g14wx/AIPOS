import { describe, it, expect, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { carpetaBackend, correrNpm, correrNpmSinFallar } from './ayudas.js';

const require = createRequire(import.meta.url);
const sequelize = require('../../src/database.js');
const { cargarClaveRoot, cargarConfig, cargarConfigDeEntorno } = require('../../src/config.js');
const mysql = require('mysql2/promise');

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
    'MySQL deja entrar a root desde el host (root@%), que es como entra el script',
    async () => {
      // La imagen mysql:8.4 crea root@% por defecto (MYSQL_ROOT_HOST vale %): el script corre en el host y
      // entra por el puerto publicado, que Docker hace llegar al contenedor desde otra dirección.
      const { baseDeDatos } = cargarConfigDeEntorno('test');
      const conexion = await mysql.createConnection({
        host: baseDeDatos.host,
        port: baseDeDatos.puerto,
        user: 'root',
        password: process.env.MYSQL_ROOT_PASSWORD,
      });
      try {
        const [filas] = await conexion.query("SELECT host FROM mysql.user WHERE user = 'root'");
        expect(filas.map((fila) => fila.host)).toContain('%');
      } finally {
        await conexion.end();
      }
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

  // src/config.js es el único lugar donde el backend lee process.env, y por eso le da la clave de root al
  // script (cargarClaveRoot). La API nunca la usa: no está en `config` y ningún otro archivo de src/ o db/
  // la nombra.
  it('solo el script la usa: en src/ y db/ solo la nombra src/config.js, para dársela al script', () => {
    const unico = path.join(carpetaBackend, 'src', 'config.js');
    for (const archivo of [...archivosDe('src'), ...archivosDe('db')]) {
      if (archivo === unico) continue;
      expect(fs.readFileSync(archivo, 'utf8'), archivo).not.toContain('MYSQL_ROOT_PASSWORD');
    }
  });

  it('el script no lee process.env: pide la clave de root y la configuración a src/config.js', () => {
    const script = fs.readFileSync(
      path.join(carpetaBackend, 'scripts', 'crear-base-de-prueba.js'),
      'utf8',
    );
    expect(script).not.toMatch(/process\.env/);
    expect(script).toContain('cargarClaveRoot');
  });

  it('la API nunca entra a MySQL como root', () => {
    expect(sequelize.config.username).not.toBe('root');
  });
});

describe('cargarClaveRoot (src/config.js)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('devuelve la clave de root del entorno que se le da', () => {
    expect(cargarClaveRoot({ MYSQL_ROOT_PASSWORD: 'clave-de-root' })).toBe('clave-de-root');
  });

  it('quita los espacios de los lados, como el resto de la configuración', () => {
    expect(cargarClaveRoot({ MYSQL_ROOT_PASSWORD: '  clave-de-root \n' })).toBe('clave-de-root');
  });

  it('falla y nombra MYSQL_ROOT_PASSWORD si falta o está vacía', () => {
    expect(() => cargarClaveRoot({})).toThrow(/MYSQL_ROOT_PASSWORD/);
    expect(() => cargarClaveRoot({ MYSQL_ROOT_PASSWORD: '   ' })).toThrow(/MYSQL_ROOT_PASSWORD/);
  });

  it('sin argumentos lee el entorno del proceso', () => {
    vi.stubEnv('MYSQL_ROOT_PASSWORD', 'clave-del-proceso');
    expect(cargarClaveRoot()).toBe('clave-del-proceso');
  });

  it('la configuración de la API no la trae, aunque la variable esté puesta', () => {
    const entorno = {
      CORS_ORIGIN: 'http://localhost:5173',
      MYSQL_DATABASE: 'aipos',
      MYSQL_USER: 'aipos',
      MYSQL_PASSWORD: 'clave-de-la-app',
      MYSQL_ROOT_PASSWORD: 'clave-secreta-de-root',
    };
    expect(JSON.stringify(cargarConfig(entorno))).not.toContain('clave-secreta-de-root');
  });

  it('no es obligatoria para arrancar la API: cargarConfig no la pide', () => {
    const sinRoot = {
      CORS_ORIGIN: 'http://localhost:5173',
      MYSQL_DATABASE: 'aipos',
      MYSQL_USER: 'aipos',
      MYSQL_PASSWORD: 'clave-de-la-app',
    };
    expect(() => cargarConfig(sinRoot)).not.toThrow();
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
