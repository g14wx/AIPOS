import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [{ find: /^vue$/, replacement: 'vue/dist/vue.esm.js' }],
    dedupe: ['vue'],
  },
  server: { proxy: { '/api': 'http://localhost:3000' } },
});
