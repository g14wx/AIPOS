// Spec de arquitectura, sección "Diseño de la pantalla > Paleta": el tema de Vuetify 2 usa la paleta de la persona
// desarrolladora, el texto es #292F36, y ningún par de colores que la pantalla usa para texto baja de 4.5 de
// contraste (AA). src/plugins/vuetify.js exporta por defecto la instancia de Vuetify ya configurada.
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
