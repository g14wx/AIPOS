import js from '@eslint/js';
import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import prettier from 'eslint-config-prettier';

// Desde la versión 10 de eslint-plugin-vue, "recommended" a secas es de Vue 3: para Vue 2 es flat/vue2-recommended.
export default [
  { ignores: ['node_modules/', 'dist/', 'coverage/'] },
  js.configs.recommended,
  ...pluginVue.configs['flat/vue2-recommended'],
  {
    files: ['**/*.{js,vue}'],
    languageOptions: { sourceType: 'module', globals: globals.browser },
    rules: {
      // Las ranuras de Vuetify 2 llevan un punto: #item.<value>="{ item }".
      'vue/valid-v-slot': ['error', { allowModifiers: true }],
      // App.vue es la única pantalla y se llama así en la spec de arquitectura.
      'vue/multi-word-component-names': ['error', { ignores: ['App'] }],
    },
  },
  {
    // Las pruebas corren en Node, con jsdom que les da window y document.
    files: ['tests/**/*.js'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  prettier,
];
