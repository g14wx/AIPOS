import { defineConfig } from 'vitest/config';

// Valores de mentira para que las pruebas no dependan del .env de nadie ni de MySQL.
// Una variable que ya está en el entorno gana sobre el .env (ver src/config.js).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    fileParallelism: false,
    env: {
      NODE_ENV: 'test',
      CORS_ORIGIN: 'http://localhost:5173',
      MYSQL_DATABASE: 'aipos',
      MYSQL_TEST_DATABASE: 'aipos_prueba',
      MYSQL_USER: 'aipos',
      MYSQL_PASSWORD: 'clave-solo-para-pruebas',
    },
  },
});
