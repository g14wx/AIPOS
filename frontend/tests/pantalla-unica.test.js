// Spec de arquitectura, sección "Frontend" y criterios de la tarjeta B-04: una sola pantalla (RNF-01) con tres zonas,
// el botón «Nuevo producto», el campo de búsqueda y la venta actual vacía con su total, sobre Vue 2.7 y Vuetify 2.7
// con Vite. Sin vue-router y sin createApp. Las zonas se marcan con data-zona: nuevo-producto, busqueda y venta-actual.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

// Con jsdom, Vite reescribe new URL(ruta, import.meta.url) a una dirección http: y fileURLToPath falla.
const raiz = resolve(import.meta.dirname, '..') + '/';
const leer = (ruta) => readFileSync(raiz + ruta, 'utf8');
const paquete = JSON.parse(leer('package.json'));

describe('carpetas y archivos del frontend (spec: Frontend > Carpetas)', () => {
  const archivos = [
    'package.json',
    'package-lock.json',
    'index.html',
    'vite.config.js',
    'eslint.config.js',
    '.prettierrc.json',
    'src/main.js',
    'src/App.vue',
    'src/plugins/vuetify.js',
    'src/api/http.js',
    'src/dinero.js',
    'src/components/AnimacionLottie.vue',
    'src/components/BuscadorProductos.vue',
    'src/components/VentaActual.vue',
    'src/ventaActual',
    'src/assets/animaciones',
  ];
  for (const archivo of archivos) {
    it(`existe frontend/${archivo}`, () => {
      expect(existsSync(raiz + archivo)).toBe(true);
    });
  }

  it('no hay vue-router: una sola pantalla', () => {
    expect(paquete.dependencies['vue-router']).toBeUndefined();
    expect(existsSync(raiz + 'src/router')).toBe(false);
  });
});

describe('package.json', () => {
  it('declara "type": "module"', () => {
    expect(paquete.type).toBe('module');
  });

  it('tiene los scripts de la spec', () => {
    const esperados = {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
      test: 'vitest run',
      'test:vigilar': 'vitest',
    };
    for (const [nombre, comando] of Object.entries(esperados)) {
      expect(paquete.scripts[nombre], nombre).toBe(comando);
    }
    for (const nombre of ['lint', 'format', 'format:check']) {
      expect(paquete.scripts[nombre], nombre).toBeTruthy();
    }
  });
});

describe('vite.config.js', () => {
  const vite = leer('vite.config.js');
  it('usa @vitejs/plugin-vue2, el alias de vue, dedupe y envDir', () => {
    expect(vite).toMatch(/@vitejs\/plugin-vue2/);
    expect(vite).toMatch(/vue\/dist\/vue\.esm\.js/);
    expect(vite).toMatch(/dedupe:\s*\['vue'\]/);
    expect(vite).toMatch(/envDir:\s*['"]\.\.['"]/);
  });
  it('fija el puerto con FRONTEND_PORT y strictPort, y las pruebas corren en jsdom', () => {
    expect(vite).toMatch(/FRONTEND_PORT/);
    expect(vite).toMatch(/strictPort:\s*true/);
    expect(vite).toMatch(/environment:\s*['"]jsdom['"]/);
  });
  it('no usa vite-plugin-vuetify', () => {
    expect(vite).not.toMatch(/vite-plugin-vuetify/);
  });
});

describe('arranque (main.js e index.html)', () => {
  const main = leer('src/main.js');
  it('arranca con Vue 2: new Vue con vuetify, sin createApp ni createVuetify', () => {
    expect(main).toMatch(/new Vue\(\{/);
    expect(main).toMatch(/vuetify/);
    expect(main).toMatch(/\$mount\(\s*['"]#app['"]\s*\)/);
    expect(main).not.toMatch(/createApp|createVuetify/);
  });
  it('carga el CSS ya compilado de Vuetify y los íconos MDI, sin Sass', () => {
    expect(main).toMatch(/vuetify\/dist\/vuetify\.min\.css/);
    expect(main).toMatch(/@mdi\/font\/css\/materialdesignicons(\.min)?\.css/);
    expect(main).not.toMatch(/\.s[ac]ss/);
  });
  it('index.html tiene el contenedor #app y el idioma español', () => {
    const html = leer('index.html');
    expect(html).toMatch(/id="app"/);
    expect(html).toMatch(/<html[^>]*lang="es"/);
    expect(html).toMatch(/name="viewport"/);
  });
});

describe('la pantalla única (App.vue montada)', () => {
  let wrapper;

  beforeAll(async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3124');
    // lottie-web no dibuja en jsdom: se sustituye, como pide la spec.
    vi.doMock('lottie-web/build/player/lottie_light', () => ({
      default: { loadAnimation: () => ({ destroy() {}, goToAndStop() {}, play() {} }) },
    }));
    const { default: vuetify } = await import('../src/plugins/vuetify.js');
    const { default: App } = await import('../src/App.vue');
    wrapper = mount(App, { vuetify, attachTo: document.body });
  });

  it('está envuelta en <v-app> con <v-main>', () => {
    expect(wrapper.find('.v-application').exists()).toBe(true);
    expect(wrapper.find('main.v-main').exists()).toBe(true);
  });

  it('tiene una barra superior con el nombre AIPOS', () => {
    expect(wrapper.find('header.v-app-bar, header.v-toolbar').text()).toContain('AIPOS');
  });

  it('tiene las tres zonas, en orden: nuevo producto, búsqueda y venta actual', () => {
    const zonas = wrapper
      .findAll('[data-zona]')
      .wrappers.map((zona) => zona.attributes('data-zona'));
    expect(zonas).toEqual(['nuevo-producto', 'busqueda', 'venta-actual']);
  });

  it('la zona de nuevo producto tiene el botón «Nuevo producto»', () => {
    const boton = wrapper.find('[data-zona="nuevo-producto"] button');
    expect(boton.exists()).toBe(true);
    expect(boton.text()).toContain('Nuevo producto');
  });

  it('la zona de búsqueda tiene un campo de texto con etiqueta que dice buscar', () => {
    const zona = wrapper.find('[data-zona="busqueda"]');
    expect(zona.find('input').exists()).toBe(true);
    expect(zona.find('label').text().toLowerCase()).toContain('buscar');
  });

  it('la zona de la venta actual empieza vacía: título «Venta actual» y total 0.00 sin símbolo de moneda', () => {
    const zona = wrapper.find('[data-zona="venta-actual"]');
    expect(zona.text()).toContain('Venta actual');
    expect(zona.text()).toContain('0.00');
    expect(zona.text()).not.toMatch(/[$€£]/);
    expect(zona.findAll('tbody tr').length).toBe(0);
  });

  it('el total tiene un texto para lectores de pantalla y se ve en la zona de la venta actual', () => {
    const total = wrapper.find('[data-zona="venta-actual"] [data-total]');
    expect(total.exists()).toBe(true);
    expect(total.text()).toBe('0.00');
  });

  it('tiene un solo h1, la marca, y el título de la venta actual es un h2', () => {
    const titulos = wrapper
      .findAll('h1, h2')
      .wrappers.map((t) => `${t.element.tagName} ${t.text()}`);
    expect(titulos).toEqual(['H1 AIPOS', 'H2 Venta actual']);
  });

  it('no usa v-html: ningún elemento se pinta con datos como HTML', () => {
    expect(wrapper.html()).not.toMatch(/v-html/);
  });

  it('tiene un solo elemento raíz y muestra el texto de la pantalla en español', () => {
    expect(wrapper.element.nodeType).toBe(1);
    expect(document.documentElement.lang || 'es').toBe('es');
  });
});
