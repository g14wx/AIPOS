// Spec de arquitectura, sección "Íconos y animaciones": AnimacionLottie.vue adapta lottie-web (imperativa) a un
// componente de Vue 2 con propiedades y ciclo de vida. Usa la versión ligera, crea la animación en mounted, la
// destruye en beforeDestroy, es decorativa (aria-hidden) y con prefers-reduced-motion muestra un solo cuadro fijo.
// jsdom no dibuja: lottie-web se sustituye con vi.mock.
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import Vue from 'vue';
import Vuetify from 'vuetify';
import { mount } from '@vue/test-utils';

const { loadAnimation, instancias } = vi.hoisted(() => {
  const instancias = [];
  const loadAnimation = vi.fn((opciones) => {
    const instancia = {
      opciones,
      totalFrames: 60,
      destroy: vi.fn(),
      goToAndStop: vi.fn(),
      play: vi.fn(),
    };
    instancias.push(instancia);
    return instancia;
  });
  return { loadAnimation, instancias };
});

vi.mock('lottie-web/build/player/lottie_light', () => ({ default: { loadAnimation } }));

import AnimacionLottie from '../../src/components/AnimacionLottie.vue';

Vue.use(Vuetify);

const animacion = { v: '5.7.0', fr: 30, ip: 0, op: 60, w: 100, h: 100, layers: [] };

function preferirMenosMovimiento(reducir) {
  window.matchMedia = vi.fn((consulta) => ({
    matches: reducir && consulta.includes('prefers-reduced-motion'),
    media: consulta,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));
}

function montar(propsData = {}) {
  return mount(AnimacionLottie, { propsData: { animacion, ...propsData } });
}

beforeEach(() => {
  loadAnimation.mockClear();
  instancias.length = 0;
  preferirMenosMovimiento(false);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AnimacionLottie: dibujo', () => {
  it('crea la animación en mounted con SVG, sobre su propio elemento y con el JSON recibido', () => {
    const wrapper = montar();
    expect(loadAnimation).toHaveBeenCalledTimes(1);
    const opciones = loadAnimation.mock.calls[0][0];
    expect(opciones.container).toBe(wrapper.element);
    expect(opciones.renderer).toBe('svg');
    expect(opciones.animationData).toEqual(animacion);
    expect(opciones.autoplay).toBe(true);
  });

  it('se repite por defecto (loop) y deja de repetirse con :loop="false"', () => {
    montar();
    expect(loadAnimation.mock.calls[0][0].loop).toBe(true);
    montar({ loop: false });
    expect(loadAnimation.mock.calls[1][0].loop).toBe(false);
  });

  it('tiene un solo elemento raíz y es decorativa: aria-hidden="true"', () => {
    const wrapper = montar();
    expect(wrapper.element.nodeType).toBe(1);
    expect(wrapper.attributes('aria-hidden')).toBe('true');
  });

  it('aplica el alto en píxeles que recibe', () => {
    const wrapper = montar({ alto: 140 });
    expect(wrapper.element.style.height).toBe('140px');
  });
});

describe('AnimacionLottie: ciclo de vida', () => {
  it('destruye la animación en beforeDestroy', () => {
    const wrapper = montar();
    expect(instancias[0].destroy).not.toHaveBeenCalled();
    wrapper.destroy();
    expect(instancias[0].destroy).toHaveBeenCalledTimes(1);
  });

  it('si cambia la animación, destruye la anterior y crea la nueva', async () => {
    const wrapper = montar();
    const otra = { ...animacion, nm: 'otra' };
    await wrapper.setProps({ animacion: otra });
    expect(instancias[0].destroy).toHaveBeenCalledTimes(1);
    expect(loadAnimation).toHaveBeenCalledTimes(2);
    expect(loadAnimation.mock.calls[1][0].animationData).toEqual(otra);
  });
});

describe('AnimacionLottie: menos movimiento (prefers-reduced-motion: reduce)', () => {
  it('no anima: no reproduce ni se repite, y muestra el último cuadro por defecto', () => {
    preferirMenosMovimiento(true);
    montar();
    const opciones = loadAnimation.mock.calls[0][0];
    expect(opciones.autoplay).toBe(false);
    expect(opciones.loop).toBe(false);
    expect(instancias[0].goToAndStop).toHaveBeenCalledWith(59, true);
    expect(instancias[0].play).not.toHaveBeenCalled();
  });

  it('con cuadroFijo="primero" muestra el primer cuadro', () => {
    preferirMenosMovimiento(true);
    montar({ cuadroFijo: 'primero' });
    expect(instancias[0].goToAndStop).toHaveBeenCalledWith(0, true);
  });

  it('sin la preferencia, no fija ningún cuadro', () => {
    montar();
    expect(instancias[0].goToAndStop).not.toHaveBeenCalled();
  });
});

describe('AnimacionLottie: la librería solo la conoce el adaptador', () => {
  // Los demás componentes sí pueden usar <AnimacionLottie>: lo que no pueden es importar ni llamar a lottie-web.
  it('ningún otro archivo de src/ importa lottie-web (Adapter)', async () => {
    const { readdirSync, readFileSync, statSync } = await import('node:fs');
    const { join, relative } = await import('node:path');
    const raiz = join(import.meta.dirname, '../../src');
    const archivos = (carpeta) =>
      readdirSync(carpeta).flatMap((nombre) => {
        const ruta = join(carpeta, nombre);
        if (statSync(ruta).isDirectory()) return archivos(ruta);
        return /\.(vue|js)$/.test(nombre) ? [ruta] : [];
      });
    const otros = archivos(raiz).filter(
      (ruta) => relative(raiz, ruta) !== 'components/AnimacionLottie.vue',
    );
    expect(otros.length).toBeGreaterThan(0);
    for (const ruta of otros) {
      expect(readFileSync(ruta, 'utf8'), relative(raiz, ruta)).not.toMatch(
        /lottie-web|lottie_light/,
      );
    }
  });
});
