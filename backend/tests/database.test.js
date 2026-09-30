import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { Sequelize } = require('sequelize');
const { config } = require('../src/config.js');
const sequelize = require('../src/database.js');
const modelos = require('../src/models/index.js');
const dbConfig = require('../db/config.js');
const sequelizerc = require('../.sequelizerc');

// No abre ninguna conexión: revisa cómo se arma la instancia de Sequelize, sin necesitar MySQL.
// La prueba contra un MySQL corriendo es de B-03 (base-de-datos/conexion.test.js).
describe('src/database.js', () => {
  it('exporta una instancia de Sequelize con el dialecto mysql', () => {
    expect(sequelize).toBeInstanceOf(Sequelize);
    expect(sequelize.getDialect()).toBe('mysql');
  });

  it('usa el host, el puerto, la base y el usuario de src/config.js', () => {
    const { host, puerto, nombre, usuario } = config.baseDeDatos;
    expect(sequelize.config).toMatchObject({
      host,
      port: puerto,
      database: nombre,
      username: usuario,
    });
  });

  it('en pruebas usa la base de prueba, nunca la de desarrollo', () => {
    expect(config.entorno).toBe('test');
    expect(sequelize.config.database).toBe('aipos_prueba');
  });

  it('trabaja en UTC y no activa decimalNumbers (el dinero se queda como texto)', () => {
    expect(sequelize.options.timezone).toBe('+00:00');
    expect(sequelize.options.dialectOptions?.decimalNumbers).toBeFalsy();
  });

  it('no usa el usuario root', () => {
    expect(sequelize.config.username).not.toBe('root');
  });

  it('src/models/index.js exporta la instancia para los modelos que vengan', () => {
    expect(modelos.sequelize).toBe(sequelize);
  });
});

describe('db/config.js (sequelize-cli)', () => {
  it('trae development, test y production con el dialecto mysql', () => {
    for (const entorno of ['development', 'test', 'production']) {
      expect(dbConfig[entorno], entorno).toMatchObject({ dialect: 'mysql', timezone: '+00:00' });
    }
  });

  it('development y production usan MYSQL_DATABASE, y test usa MYSQL_TEST_DATABASE', () => {
    expect(dbConfig.development.database).toBe('aipos');
    expect(dbConfig.production.database).toBe('aipos');
    expect(dbConfig.test.database).toBe('aipos_prueba');
  });

  it('usa el usuario de la app y no root', () => {
    for (const entorno of ['development', 'test', 'production']) {
      expect(dbConfig[entorno].username, entorno).toBe('aipos');
    }
  });
});

describe('.sequelizerc', () => {
  it('apunta con rutas absolutas a db/config.js, db/migrations y src/models', () => {
    const backend = path.resolve(import.meta.dirname, '..');
    expect(sequelizerc.config).toBe(path.join(backend, 'db', 'config.js'));
    expect(sequelizerc['migrations-path']).toBe(path.join(backend, 'db', 'migrations'));
    expect(sequelizerc['models-path']).toBe(path.join(backend, 'src', 'models'));
    expect(fs.existsSync(sequelizerc.config)).toBe(true);
    expect(fs.statSync(sequelizerc['migrations-path']).isDirectory()).toBe(true);
  });
});
