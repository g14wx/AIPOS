import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue2';

// El .env vive en la raíz del repositorio y lo leen el backend y el frontend (envDir: '..').
// Una variable que ya esté en el entorno gana sobre el archivo, igual que en el backend.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '..', '');

  return {
    plugins: [vue()],
    envDir: '..',
    resolve: {
      // Una sola copia de Vue. Sin el alias y el dedupe, el build falla con "Multiple instances of Vue detected".
      alias: [{ find: /^vue$/, replacement: 'vue/dist/vue.esm.js' }],
      dedupe: ['vue'],
    },
    server: {
      // strictPort: si el puerto está ocupado, falla en vez de cambiar. CORS_ORIGIN apunta a este puerto.
      port: Number(env.FRONTEND_PORT || 5173),
      strictPort: true,
    },
    test: {
      environment: 'jsdom',
      include: ['tests/**/*.test.js'],
      // Vuetify y @vue/test-utils piden 'vue' con require y Node les da vue.runtime.common.js. Con el alias de
      // arriba, las pruebas cargarían otra copia (vue.esm.js) y Vuetify avisaría "Multiple instances of Vue
      // detected". Este alias, solo para las pruebas, deja una sola copia.
      alias: [{ find: /^vue$/, replacement: 'vue/dist/vue.runtime.common.js' }],
    },
  };
});
