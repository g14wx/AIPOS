import path from 'node:path';
import dotenv from 'dotenv';
import { defineConfig } from 'vitest/config';

// Las pruebas de MySQL usan el .env de la raíz (el mismo que el backend); una variable que ya está
// en el entorno gana sobre el archivo. Lo que ni el entorno ni el .env traen se llena con valores
// de mentira, para que las pruebas que no tocan MySQL corran sin .env.
dotenv.config({
  path: path.resolve(import.meta.dirname, '..', '.env'),
  override: false,
  quiet: true,
});

const porDefecto = {
  CORS_ORIGIN: 'http://localhost:5173',
  MYSQL_DATABASE: 'aipos',
  MYSQL_TEST_DATABASE: 'aipos_prueba',
  MYSQL_USER: 'aipos',
  MYSQL_PASSWORD: 'clave-solo-para-pruebas',
};
for (const [nombre, valor] of Object.entries(porDefecto)) {
  if ((process.env[nombre] ?? '').trim() === '') process.env[nombre] = valor;
}

// Un archivo de pruebas a la vez: todos comparten la base de prueba. Antes de correr, globalSetup migra.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    fileParallelism: false,
    globalSetup: ['tests/globalSetup.js'],
    env: { NODE_ENV: 'test' },
  },
});
