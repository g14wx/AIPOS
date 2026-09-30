import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { carpetaRaiz } from './ayudas.js';

const archivo = path.join(carpetaRaiz, 'docker-compose.yml');
const texto = fs.existsSync(archivo) ? fs.readFileSync(archivo, 'utf8') : '';

// Lo que Docker Compose entiende de verdad: `docker compose config` resuelve las variables y
// devuelve el archivo ya interpretado. Las claves son de mentira, y las pruebas no levantan ningún contenedor.
// `--env-file /dev/null` evita que el .env de quien corre las pruebas cambie el resultado.
function leerConfiguracion(entorno = {}) {
  const salida = execFileSync(
    'docker',
    ['compose', '--env-file', '/dev/null', 'config', '--format', 'json'],
    {
      cwd: carpetaRaiz,
      env: {
        ...process.env,
        COMPOSE_PROJECT_NAME: 'aipos-prueba-compose',
        MYSQL_DATABASE: 'aipos',
        MYSQL_USER: 'aipos',
        MYSQL_PASSWORD: 'clave-de-mentira',
        MYSQL_ROOT_PASSWORD: 'clave-de-root-de-mentira',
        ...entorno,
      },
      encoding: 'utf8',
    },
  );
  return JSON.parse(salida);
}

describe('docker-compose.yml', () => {
  it('existe en la raíz del proyecto', () => {
    expect(fs.existsSync(archivo)).toBe(true);
  });

  it('tiene un solo servicio, mysql', () => {
    const { services } = leerConfiguracion();
    expect(Object.keys(services)).toEqual(['mysql']);
  });

  it('usa la imagen mysql:8.4, nunca latest ni una 9.x', () => {
    const { services } = leerConfiguracion();
    expect(services.mysql.image).toBe('mysql:8.4');
    expect(texto).not.toMatch(/mysql:latest/);
    expect(texto).not.toMatch(/image:\s*mysql:9/);
  });

  it('publica el puerto solo en 127.0.0.1 y con MYSQL_PORT como puerto del host', () => {
    const { services } = leerConfiguracion({ MYSQL_PORT: '3399' });
    const puertos = services.mysql.ports;
    expect(puertos).toHaveLength(1);
    expect(puertos[0]).toMatchObject({ host_ip: '127.0.0.1', published: '3399', target: 3306 });
    expect(texto).toContain('127.0.0.1:${MYSQL_PORT:-3306}:3306');
  });

  it('sin MYSQL_PORT publica el 3306', () => {
    const { services } = leerConfiguracion({ MYSQL_PORT: undefined });
    expect(services.mysql.ports[0].published).toBe('3306');
  });

  it('pasa a la imagen las cuatro variables MYSQL_* del .env', () => {
    const { services } = leerConfiguracion();
    expect(services.mysql.environment).toMatchObject({
      MYSQL_ROOT_PASSWORD: 'clave-de-root-de-mentira',
      MYSQL_DATABASE: 'aipos',
      MYSQL_USER: 'aipos',
      MYSQL_PASSWORD: 'clave-de-mentira',
    });
  });

  it('tiene un healthcheck con mysqladmin ping', () => {
    const { services } = leerConfiguracion();
    const { test } = services.mysql.healthcheck;
    expect(test.join(' ')).toContain('mysqladmin');
    expect(test.join(' ')).toContain('ping');
  });

  it('guarda los datos en un volumen con nombre, en /var/lib/mysql', () => {
    const configuracion = leerConfiguracion();
    const montaje = configuracion.services.mysql.volumes.find(
      (volumen) => volumen.target === '/var/lib/mysql',
    );
    expect(montaje).toBeDefined();
    expect(montaje.type).toBe('volume');
    expect(Object.keys(configuracion.volumes ?? {})).toContain(montaje.source);
  });

  it('nunca crea tablas ni procedimientos desde docker-entrypoint-initdb.d', () => {
    expect(texto).not.toMatch(/docker-entrypoint-initdb\.d/);
  });

  it('no escribe claves en el archivo: salen del .env', () => {
    expect(texto).not.toMatch(/PASSWORD:\s*(?!\$\{)\S+/);
  });
});
