---
name: vue2-vuetify2-vite-setup
description: "Scaffolds and configures a Vue 2.7 + Vuetify 2.7 frontend built with Vite 7 and Axios, with pinned versions, the vite.config.js alias and dedupe for Vue, the main.js bootstrap with new Vue and new Vuetify, MDI icons, VITE_ environment variables and an axios API module. Use when creating a frontend with Vite for a project that requires Vue 2 or Vuetify 2, migrating a Vue 2 app from Vue CLI to Vite, adding or upgrading dependencies in a Vue 2 project, setting up ESLint for Vue 2, or fixing errors such as Multiple instances of Vue detected, Vuetify is not properly initialized, or an npm peer conflict on vite."
---

# Vue 2 + Vuetify 2 + Vite setup

npm `latest` now installs Vue 3.5, Vuetify 4 and Vite 8, and none of them work in a Vue 2 app. Vue 2.7 (end of life 2023-12-31) and Vuetify 2.7 (LTS ended 2025-01-23) still run well on Vite 7 when every version is pinned and Vuetify is loaded from its prebuilt bundle.

## 1. Versions

| Package | Version | Why |
|---|---|---|
| `vue` | `2.7.16` | Last Vue 2 release |
| `vuetify` | `2.7.2` | Last Vuetify 2 (`v2-stable` tag). Vuetify 3 and 4 need Vue 3 |
| `vite` | `^7` | Vite 8 breaks `@vitejs/plugin-vue2`, whose peer range is `vite` 3 to 7 |
| `@vitejs/plugin-vue2` | `2.3.4` | Final release. The repo is archived and will never support Vite 8 |
| `@mdi/font` | `7.4.47` | Icon font for `iconfont: 'mdi'` |
| `axios` | `^1.20.0` | Never `1.14.1` or `0.30.4` (malicious releases). Commit the lockfile |

Only if needed: `vue-router@3.6.5`, `vuex@3.6.2` or `pinia@2.3.1`, `@vue/test-utils@1`.

Node 22 or 24, written in `.nvmrc`. Vite 7 needs Node `^20.19` or `>=22.12`, and Node 20 is end of life since 2026-04-30.

Never use:
- `npm create vue@latest` or `vue create -d`: both generate Vue 3. `npm create vue@legacy` is an outdated Vite 3 template.
- `vite-plugin-vuetify` or `createVuetify` (Vuetify 3+), `unplugin-vue-components` 31 or later (dropped Vue 2), `sass-loader` 16 or 17.
- `sass`: Vite 7 needs sass 1.70 or later, and Vuetify 2 sources expect about 1.32. The prebuilt `vuetify/dist/vuetify.min.css` needs no Sass and no component resolver.

## 2. Project files

Write the files by hand; no generator gives this stack.

`package.json`
```json
{
  "name": "frontend",
  "private": true,
  "type": "module",
  "scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview" },
  "dependencies": { "@mdi/font": "7.4.47", "axios": "^1.20.0", "vue": "2.7.16", "vuetify": "2.7.2" },
  "devDependencies": { "@vitejs/plugin-vue2": "2.3.4", "vite": "^7.3.6" },
  "engines": { "node": ">=22.12.0" }
}
```

`vite.config.js`
```js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    // One copy of Vue. Without it the build fails with "Multiple instances of Vue detected".
    alias: [{ find: /^vue$/, replacement: 'vue/dist/vue.esm.js' }],
    dedupe: ['vue'],
  },
  server: { proxy: { '/api': 'http://localhost:3000' } }, // optional, avoids CORS in dev
});
```

`index.html` sits at the project root with `<div id="app"></div>` and `<script type="module" src="/src/main.js"></script>`.

`src/main.js`
```js
import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import '@mdi/font/css/materialdesignicons.css';
import App from './App.vue';

Vue.use(Vuetify);

new Vue({
  vuetify: new Vuetify({ icons: { iconfont: 'mdi' } }),
  render: (h) => h(App),
}).$mount('#app');
```

No `createApp` and no `createVuetify`. Vuetify 2 has no composables: read screen sizes from `this.$vuetify.breakpoint`.

`src/App.vue` has a single root `<v-app>`, with `<v-app-bar app>` and the screens inside `<v-main>`. Vuetify 2 components need that root to get their theme and layout.

## 3. Environment and API client

Only variables that start with `VITE_` reach the browser, through `import.meta.env`; `process.env` does not exist in Vite client code. Document them in a committed `.env.example` (keep `.env` out of git): `VITE_API_URL=http://localhost:3000/api`, or `VITE_API_URL=/api` with the dev proxy above.

`src/api/http.js`
```js
import axios from 'axios';

export const http = axios.create({ baseURL: import.meta.env.VITE_API_URL, timeout: 10000 });

// Every caller gets an Error with a readable message and the HTTP status.
http.interceptors.response.use((response) => response, (error) => {
  const normalized = new Error(error.response?.data?.message ?? error.message);
  normalized.status = error.response?.status ?? 0;
  return Promise.reject(normalized);
});
```

Add one module per resource in `src/api/`, named with the project's glossary terms. Components import these functions, never axios or a URL.
```js
// src/api/products.js
import { http } from './http';
export const searchProducts = (text) => http.get('/products', { params: { q: text } }).then((res) => res.data);
```

## 4. ESLint (optional)

`eslint-plugin-vue` v10 renamed its presets, and `recommended` now means Vue 3. ESLint 9 and 10 only read flat config.
```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue';

export default [
  ...pluginVue.configs['flat/vue2-recommended'],
  { rules: { 'vue/valid-v-slot': ['error', { allowModifiers: true }] } }, // allows #item.name slots
];
```

## 5. Check

Run `npm install`, commit `package-lock.json`, then `npm ls vue vuetify vite` must show one `vue@2.7.16`, `vuetify@2.7.2` and `vite@7.x`. `npm run build` must finish, and `npm run preview` must show styled components and icons with no console errors.

| Symptom | Fix |
|---|---|
| `ERESOLVE` peer conflict on `vite` | Install `vite@^7`, not 8 |
| `Multiple instances of Vue detected`, `Vuetify is not properly initialized` | Add the `alias` and `dedupe` above |
| `Unknown custom element: <v-btn>` | Add `Vue.use(Vuetify)` and the `vuetify` option in `new Vue` |
| Components without styles, or icons as empty squares | Import `vuetify/dist/vuetify.min.css` and the `@mdi/font` CSS |
