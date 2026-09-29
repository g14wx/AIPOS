# Vue 2 + Vuetify 2 + Vite

This frontend runs on Vue 2.7 and Vuetify 2, built with Vite. npm `latest` is wrong for every core package here, and most examples online are Vue 3 or Vuetify 3. Follow the skills `vue2-vuetify2-vite-setup` (project and config) and `vuetify2-components` (screens).

- Pin exact versions: `vue@2.7.16`, `vuetify@2.7.2`, `@vitejs/plugin-vue2@2.3.4`, `@mdi/font@7.4.47` and `vite@^7`. Never install `latest` of these: Vue 3 breaks Vue 2 code, Vuetify 3 and 4 need Vue 3, and Vite 8 breaks `@vitejs/plugin-vue2`.
- Use `axios@^1.20.0`, never `1.14.1` or `0.30.4` (malicious releases), and commit the lockfile. Use Node 22 or 24, written in `.nvmrc`.
- Add only if needed: `vue-router@3.6.5`, `vuex@3.6.2` or `pinia@2.3.1`, `@vue/test-utils@1`.
- Never use `npm create vue@latest`, `vue create -d`, `vite-plugin-vuetify`, `createVuetify` or `unplugin-vue-components` 31 or later. Do not install `sass`: import the prebuilt `vuetify/dist/vuetify.min.css`.
- Start the app with `Vue.use(Vuetify)` and `new Vue({ vuetify, render: h => h(App) }).$mount('#app')`, never `createApp`. `vite.config.js` aliases `vue` to `vue/dist/vue.esm.js` and sets `dedupe: ['vue']`.
- Read config from `import.meta.env.VITE_*` (`process.env` does not exist in client code). Components call functions from `src/api/`, never axios or a hardcoded URL.
- One root element per component. No fragments, `Teleport`, `defineModel`, `modelValue` or `v-model:foo`: a custom `v-model` is prop `value` + event `input`, and other two-way props use `:foo.sync` + `$emit('update:foo', v)`.
- Use `beforeDestroy` and `destroyed`, put `key` on the children of `<template v-for>`, and never put `v-if` and `v-for` on the same element.
- Vue 2 does not detect `this.items[i] = x`, `this.items.length = 0` or new object keys. Use `splice`, `this.$set` or a new array.
- Use Vuetify 2 APIs: headers `{ text, value }`, slots `#item.<value>="{ item }"`, `item-text` and `item-value`, `:search-input.sync`, activators `#activator="{ on, attrs }"`. Vuetify 3 props (`variant`, `density`, `location`, `item-title`, `bg-color`) do nothing in v2, and `<v-table>` does not exist.
- Wrap the app in `<v-app>` + `<v-main>`. Prefer the Options API, as the Vuetify 2 docs do.
- For ESLint use the `flat/vue2-recommended` config of `eslint-plugin-vue`. Since v10, `recommended` means Vue 3.
