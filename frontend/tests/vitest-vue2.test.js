// Prueba mínima de la tarjeta B-04 (spec de arquitectura, secciones "Versiones" y "Pruebas").
// Tapa la trampa de S-01: Vitest 5 tiene que compilar un .vue con @vitejs/plugin-vue2 y dibujar un v-btn de
// Vuetify 2 en jsdom, y lottie-web no puede cargarse en jsdom sin sustituirlo con vi.mock.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect, vi } from 'vitest';
import Vue from 'vue';
import Vuetify from 'vuetify';
import { mount } from '@vue/test-utils';
import BotonDePrueba from './fixtures/BotonDePrueba.vue';

// Con dos copias de Vue, Vuetify lo avisa con console.error al instalarse. Se guarda el aviso para revisarlo abajo.
const avisosAlInstalar = [];
const espia = vi
  .spyOn(console, 'error')
  .mockImplementation((...partes) => avisosAlInstalar.push(partes.join(' ')));
Vue.use(Vuetify);
espia.mockRestore();

// Con jsdom, Vite reescribe new URL(ruta, import.meta.url) a una dirección http: y readFileSync falla.
const paquete = JSON.parse(readFileSync(resolve(import.meta.dirname, '../package.json'), 'utf8'));
const declaradas = { ...paquete.dependencies, ...paquete.devDependencies };

// Tabla "Versiones" de specs/arquitectura.spec.md, solo las del frontend.
const versionesDelFrontend = {
  vue: '2.7.16',
  vuetify: '2.7.2',
  vite: '7.3.6',
  '@vitejs/plugin-vue2': '2.3.4',
  axios: '1.20.0',
  '@mdi/font': '7.4.47',
  'lottie-web': '5.13.0',
  vitest: '5.0.2',
  jsdom: '30.1.1',
  '@vue/test-utils': '1.3.6',
  'vue-template-compiler': '2.7.16',
  eslint: '10.11.0',
  '@eslint/js': '10.0.1',
  globals: '17.12.0',
  'eslint-config-prettier': '10.1.8',
  prettier: '3.9.9',
  'eslint-plugin-vue': '10.11.1',
  'vue-eslint-parser': '10.4.1',
};

describe('Vitest con Vue 2 y Vuetify 2', () => {
  it('compila un .vue con @vitejs/plugin-vue2 y dibuja un v-btn de Vuetify', () => {
    const wrapper = mount(BotonDePrueba, {
      vuetify: new Vuetify(),
      propsData: { texto: 'Hola AIPOS' },
    });
    const boton = wrapper.find('button.v-btn');
    expect(boton.exists()).toBe(true);
    expect(boton.text()).toBe('Hola AIPOS');
  });

  it('el v-btn responde al clic (Vue 2 detecta el cambio de estado)', async () => {
    const wrapper = mount(BotonDePrueba, { vuetify: new Vuetify() });
    await wrapper.find('button.v-btn').trigger('click');
    await wrapper.find('button.v-btn').trigger('click');
    expect(wrapper.find('.pulsaciones').text()).toBe('2');
  });

  it('usa una sola copia de Vue 2.7.16 y Vuetify 2.7.2', () => {
    expect(Vue.version).toBe('2.7.16');
    expect(Vuetify.version).toBe('2.7.2');
    // Dos copias de Vue dan "Multiple instances of Vue detected" y después "$attrs is readonly" en los componentes.
    expect(avisosAlInstalar.join('\n')).not.toMatch(/Multiple instances of Vue/);
  });

  it('lottie-web no carga en jsdom: por eso las pruebas lo sustituyen con vi.mock', async () => {
    await expect(import('lottie-web/build/player/lottie_light')).rejects.toThrow();
  });
});

describe('Versiones fijas del package.json del frontend', () => {
  it('cada paquete de la spec lleva la versión exacta, sin ^ ni ~', () => {
    for (const [nombre, version] of Object.entries(versionesDelFrontend)) {
      expect(declaradas[nombre], nombre).toBe(version);
    }
  });

  it('ninguna versión declarada usa ^, ~, * ni latest', () => {
    for (const [nombre, version] of Object.entries(declaradas)) {
      expect(version, nombre).toMatch(/^\d+\.\d+\.\d+$/);
    }
  });

  it('Vue 2.7.16 y Vuetify 2.7.2 están en dependencies (criterio de la tarjeta)', () => {
    expect(paquete.dependencies.vue).toBe('2.7.16');
    expect(paquete.dependencies.vuetify).toBe('2.7.2');
  });

  it('no trae paquetes que la spec prohíbe', () => {
    const prohibidos = [
      'sass',
      'vite-plugin-vuetify',
      'unplugin-vue-components',
      'vue-router',
      'vuex',
      'pinia',
      'express-validator',
      'joi',
      'zod',
    ];
    for (const nombre of prohibidos) {
      expect(declaradas[nombre], nombre).toBeUndefined();
    }
  });
});
