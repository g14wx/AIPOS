import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { cargarConfig } = require('../src/config');

const base = {
  CORS_ORIGIN: 'http://localhost:5173',
  MYSQL_DATABASE: 'aipos',
  MYSQL_USER: 'aipos',
  MYSQL_PASSWORD: 'x',
};

describe('src/config.js', () => {
  it('usa los valores por defecto de PORT, MYSQL_HOST y MYSQL_PORT', () => {
    const config = cargarConfig(base);
    expect(config.puerto).toBe(3000);
    expect(config.baseDeDatos.host).toBe('127.0.0.1');
    expect(config.baseDeDatos.puerto).toBe(3306);
  });

  it('lee los valores que sí se pusieron', () => {
    const config = cargarConfig({ ...base, PORT: '3121', MYSQL_HOST: 'mysql', MYSQL_PORT: '3321' });
    expect(config.puerto).toBe(3121);
    expect(config.baseDeDatos).toMatchObject({ host: 'mysql', puerto: 3321, nombre: 'aipos' });
  });

  for (const variable of ['MYSQL_DATABASE', 'MYSQL_USER', 'MYSQL_PASSWORD', 'CORS_ORIGIN']) {
    it(`falla con un mensaje que nombra ${variable} si falta`, () => {
      const env = { ...base };
      delete env[variable];
      expect(() => cargarConfig(env)).toThrow(variable);
    });

    it(`falla si ${variable} está vacía`, () => {
      expect(() => cargarConfig({ ...base, [variable]: '  ' })).toThrow(variable);
    });
  }

  it('acepta varios orígenes separados por coma', () => {
    const config = cargarConfig({ ...base, CORS_ORIGIN: 'http://a.test, https://b.test:8443' });
    expect(config.corsOrigenes).toEqual(['http://a.test', 'https://b.test:8443']);
  });

  it('rechaza * como origen', () => {
    expect(() => cargarConfig({ ...base, CORS_ORIGIN: '*' })).toThrow('CORS_ORIGIN');
  });

  it('rechaza un origen con barra final', () => {
    expect(() => cargarConfig({ ...base, CORS_ORIGIN: 'http://localhost:5173/' })).toThrow(
      'CORS_ORIGIN',
    );
  });

  it('acepta un origen con esquema, servidor y puerto, y el que no escribe el puerto por defecto', () => {
    const validos = [
      'http://localhost:5173',
      'https://pos.example.com',
      'http://127.0.0.1:5191',
      'http://[::1]:5173',
    ];
    for (const origen of validos) {
      expect(cargarConfig({ ...base, CORS_ORIGIN: origen }).corsOrigenes).toEqual([origen]);
    }
  });

  it('rechaza un origen que nunca coincidiría con el Origin que manda el navegador', () => {
    const invalidos = [
      'localhost:5173', // sin esquema
      'pantalla', // texto suelto
      'http://', // sin servidor
      'http://localhost:5173/app', // con ruta
      'http://localhost:5173?x=1', // con parámetros
      'http://localhost:5173#inicio', // con fragmento
      'http://usuario@localhost:5173', // con usuario
      'http://localhost:80', // el puerto por defecto no se escribe
      'https://pos.example.com:443', // el puerto por defecto no se escribe
      'HTTP://localhost:5173', // el navegador manda el esquema en minúsculas
      'http://LOCALHOST:5173', // y el servidor en minúsculas
    ];
    for (const origen of invalidos) {
      expect(() => cargarConfig({ ...base, CORS_ORIGIN: origen }), origen).toThrow('CORS_ORIGIN');
    }
  });

  it('con varios orígenes, uno mal escrito hace fallar el arranque y el mensaje lo nombra', () => {
    expect(() => cargarConfig({ ...base, CORS_ORIGIN: 'http://a.test, b.test:8080' })).toThrow(
      /CORS_ORIGIN.*"b\.test:8080"/,
    );
  });

  it('rechaza un PORT que no es un puerto', () => {
    expect(() => cargarConfig({ ...base, PORT: 'abc' })).toThrow('PORT');
    expect(() => cargarConfig({ ...base, PORT: '70000' })).toThrow('PORT');
  });

  it('con NODE_ENV=test usa la base de prueba', () => {
    const config = cargarConfig({
      ...base,
      NODE_ENV: 'test',
      MYSQL_TEST_DATABASE: 'aipos_prueba',
    });
    expect(config.entorno).toBe('test');
    expect(config.baseDeDatos.nombre).toBe('aipos_prueba');
  });

  it('con NODE_ENV=test falla si la base de prueba es la misma que la de desarrollo', () => {
    expect(() => cargarConfig({ ...base, NODE_ENV: 'test', MYSQL_TEST_DATABASE: 'aipos' })).toThrow(
      'MYSQL_TEST_DATABASE',
    );
  });

  it('con NODE_ENV=test falla si falta MYSQL_TEST_DATABASE', () => {
    expect(() => cargarConfig({ ...base, NODE_ENV: 'test' })).toThrow('MYSQL_TEST_DATABASE');
  });

  it('una variable que ya está en el entorno gana sobre el .env', () => {
    process.env.AIPOS_PRUEBA_DOTENV = 'del-entorno';
    const { cargarArchivoEnv } = require('../src/config');
    cargarArchivoEnv();
    expect(process.env.AIPOS_PRUEBA_DOTENV).toBe('del-entorno');
    delete process.env.AIPOS_PRUEBA_DOTENV;
  });
});
