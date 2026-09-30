// Spec de arquitectura, sección "Diseño de la pantalla > Paleta": el tema de Vuetify 2 usa la paleta de la persona
// desarrolladora, el texto es #292F36, y ningún par de colores que la pantalla usa para texto baja de 4.5 de
// contraste (AA). src/plugins/vuetify.js exporta por defecto la instancia de Vuetify ya configurada.
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import vuetify from '../src/plugins/vuetify.js';

const claro = vuetify.framework.theme.themes.light;

// Relación de contraste de WCAG 2.x entre dos colores #RRGGBB.
function luminancia(hex) {
  const canales = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = canales.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contraste(a, b) {
  const [claroL, oscuroL] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claroL + 0.05) / (oscuroL + 0.05);
}

// El color que queda al poner `frente` sobre `fondo` con esa proporción (0 a 1), como una capa transparente.
function mezclar(frente, fondo, proporcion) {
  const canal = (hex, i) => parseInt(hex.slice(i, i + 2), 16);
  const mezcla = [1, 3, 5].map((i) =>
    Math.round(canal(frente, i) * proporcion + canal(fondo, i) * (1 - proporcion)),
  );
  return (
    '#' +
    mezcla
      .map((c) => c.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

const mayusculas = (color) => String(color).toUpperCase();

describe('la paleta del tema de Vuetify', () => {
  it('asigna cada color de la paleta a su papel en el tema claro', () => {
    expect(mayusculas(claro.secondary)).toBe('#292F36');
    expect(mayusculas(claro.primary)).toBe('#4ECDC4');
    expect(mayusculas(claro.background)).toBe('#F7FFF7');
    expect(mayusculas(claro.surface)).toBe('#FFFFFF');
    expect(mayusculas(claro.error)).toBe('#FF6B6B');
    expect(mayusculas(claro.accent)).toBe('#FFE66D');
  });

  it('usa los íconos MDI', () => {
    expect(vuetify.framework.icons.iconfont).toBe('mdi');
  });

  it('el tema oscuro no cambia el diseño: la pantalla es de un solo tema claro', () => {
    expect(vuetify.framework.theme.dark).toBe(false);
  });

  it('los colores que la paleta no usa (info, success y warning) también salen de ella', () => {
    const paleta = ['#292F36', '#4ECDC4', '#F7FFF7', '#FF6B6B', '#FFE66D', '#FFFFFF'];
    for (const papel of ['info', 'success', 'warning']) {
      expect(paleta, papel).toContain(mayusculas(claro[papel]));
    }
  });
});

describe('el idioma de Vuetify', () => {
  const t = (clave, ...parametros) => vuetify.framework.lang.t(clave, ...parametros);

  it('los textos que Vuetify pone solos salen en español', () => {
    expect(vuetify.framework.lang.current).toBe('es');
    expect(t('$vuetify.close')).toBe('Cerrar');
  });

  // La traducción al español de Vuetify deja en inglés estas cadenas: un lector de pantalla diría "Clear".
  it('el botón de borrar un campo y el texto de carga no se anuncian en inglés', () => {
    expect(t('$vuetify.input.clear', 'Buscar producto')).toBe(
      'Borrar lo escrito en Buscar producto',
    );
    expect(t('$vuetify.loading')).toBe('Cargando...');
  });
});

describe('contraste de los pares que la pantalla usa para texto (mínimo 4.5)', () => {
  const texto = '#292F36';
  const pares = [
    ['texto sobre el turquesa de las acciones principales', texto, '#4ECDC4', 6.98],
    ['texto sobre el fondo de la pantalla', texto, '#F7FFF7', 13.26],
    ['texto sobre el acento del total', texto, '#FFE66D', 10.8],
    ['texto sobre el rojo de los errores', texto, '#FF6B6B', 4.87],
    ['texto turquesa sobre la barra superior', '#4ECDC4', texto, 6.98],
    // P-03: el modal y el aviso son superficies blancas; la franja de error es el rojo al 12 % sobre el modal.
    ['texto sobre la superficie blanca del modal, el aviso y los campos', texto, '#FFFFFF', 13.51],
    ['texto sobre la franja de error', texto, mezclar('#FF6B6B', '#FFFFFF', 0.12), 11.96],
  ];

  for (const [nombre, letra, fondo, esperado] of pares) {
    it(`${nombre} llega a 4.5 o más`, () => {
      const relacion = contraste(letra, fondo);
      expect(relacion).toBeGreaterThanOrEqual(4.5);
      expect(relacion).toBeCloseTo(esperado, 1);
    });
  }

  it('los colores del tema son los de esos pares, así que el test cubre lo que la pantalla usa', () => {
    expect(contraste(claro.secondary, claro.primary)).toBeGreaterThanOrEqual(4.5);
    expect(contraste(claro.secondary, claro.background)).toBeGreaterThanOrEqual(4.5);
    expect(contraste(claro.secondary, claro.accent)).toBeGreaterThanOrEqual(4.5);
    expect(contraste(claro.secondary, claro.error)).toBeGreaterThanOrEqual(4.5);
    expect(contraste(claro.primary, claro.secondary)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('pares que nunca sirven para texto', () => {
  // La spec los prohíbe como texto: solo relleno, borde o ícono. El test deja escrito por qué.
  const prohibidos = [
    ['blanco sobre el turquesa', '#FFFFFF', '#4ECDC4'],
    ['rojo sobre el fondo claro', '#FF6B6B', '#F7FFF7'],
    ['turquesa sobre el fondo claro', '#4ECDC4', '#F7FFF7'],
    ['amarillo sobre el fondo claro', '#FFE66D', '#F7FFF7'],
  ];

  for (const [nombre, letra, fondo] of prohibidos) {
    it(`${nombre} no llega a 4.5`, () => {
      expect(contraste(letra, fondo)).toBeLessThan(4.5);
    });
  }
});

// P-03: el CSS que el tema de Vuetify no hace solo. jsdom no calcula los estilos de Vuetify, así que se revisa el
// texto de src/plugins/vuetify.css: cada regla que pinta un error, la franja o el aviso usa las variables del tema.
describe('el CSS del tema pinta los errores y el aviso con la paleta (specs/arquitectura.spec.md, "Paleta")', () => {
  const carpeta = resolve(import.meta.dirname, '../src');
  const sinComentarios = (texto) => texto.replace(/\/\*[\s\S]*?\*\//g, '');
  const css = sinComentarios(readFileSync(join(carpeta, 'plugins/vuetify.css'), 'utf8'));
  const reglas = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selectores, cuerpo]) => ({
    selectores: selectores.split(',').map((s) => s.trim().replace(/\s+/g, ' ')),
    cuerpo,
  }));
  const escapar = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // ¿Hay una regla cuyo selector contiene `fragmento` y que declara `propiedad: valor`?
  const pintaCon = (fragmento, propiedad, valor) =>
    reglas.some(
      ({ selectores, cuerpo }) =>
        selectores.some((s) => s.includes(fragmento)) &&
        new RegExp(`(^|[;\\s])${propiedad}\\s*:\\s*${escapar(valor)}\\s*(;|$)`).test(cuerpo),
    );

  it('la etiqueta, el mensaje y el contador de un campo con error siguen en tinta: nunca texto rojo', () => {
    for (const fragmento of [
      '.v-label.error--text',
      '.v-messages.error--text',
      '.v-counter.error--text',
      // El contador de un campo con error no lleva la clase: hereda el rojo del campo (#55).
      '.v-input.error--text .v-counter',
    ]) {
      expect(pintaCon(fragmento, 'color', 'var(--v-secondary-base) !important'), fragmento).toBe(
        true,
      );
    }
  });

  it('la franja de error escribe en tinta y tiene el borde en el rojo de los errores', () => {
    expect(pintaCon('.v-alert__content', 'color', 'var(--v-secondary-base)')).toBe(true);
    expect(pintaCon('.v-alert', 'border', '1px solid var(--v-error-base)')).toBe(true);
  });

  it('el aviso tiene fondo de superficie, texto en tinta y un borde primary de 1 px, sin franja gruesa', () => {
    expect(pintaCon('.v-snack__wrapper', 'background-color', 'var(--v-surface-base)')).toBe(true);
    expect(pintaCon('.v-snack__wrapper', 'color', 'var(--v-secondary-base)')).toBe(true);
    expect(
      pintaCon('.v-snack__wrapper', 'border', '1px solid var(--v-primary-base) !important'),
    ).toBe(true);
    // La sombra de elevación de Vuetify lleva más peso que una regla normal (#56).
    expect(pintaCon('.v-snack__wrapper', 'box-shadow', 'none !important')).toBe(true);
    expect(css).not.toMatch(/border-(left|right)\s*:\s*[2-9]\d*px/);
  });

  it('el botón "Guardar" guardando conserva el turquesa y el texto en tinta, sin depender de la clase primary', () => {
    // Vuetify 2 no le pone la clase primary a un botón deshabilitado, y guardando lo está (#57).
    const selectores = reglas.flatMap((regla) => regla.selectores);
    const guardando = selectores.filter((selector) => selector.includes('.v-btn--loading'));
    expect(guardando.length).toBeGreaterThan(0);
    for (const selector of guardando) expect(selector).not.toContain('.primary');
    expect(
      pintaCon('.v-btn--loading', 'background-color', 'var(--v-primary-base) !important'),
    ).toBe(true);
    expect(pintaCon('.v-btn--loading', 'color', 'var(--v-secondary-base) !important')).toBe(true);
  });

  it('con menos movimiento, el modal no sacude la ventana cuando un clic fuera no puede cerrarlo', () => {
    expect(pintaCon('.v-dialog--animated', 'animation', 'none !important')).toBe(true);
  });

  it('ningún color se repite en hexadecimal: el CSS y los componentes leen las variables del tema', () => {
    const hexadecimal = /#[0-9a-fA-F]{3,8}\b/;
    expect(css).not.toMatch(hexadecimal);
    const componentes = join(carpeta, 'components');
    for (const nombre of readdirSync(componentes).filter((n) => n.endsWith('.vue'))) {
      const estilos = [
        ...readFileSync(join(componentes, nombre), 'utf8').matchAll(
          /<style[^>]*>([\s\S]*?)<\/style>/g,
        ),
      ];
      for (const [, bloque] of estilos)
        expect(sinComentarios(bloque), nombre).not.toMatch(hexadecimal);
    }
  });
});
