import Vue from 'vue';
import Vuetify from 'vuetify';
import traduccionAlEspanol from 'vuetify/lib/locale/es';
import './vuetify.css';

Vue.use(Vuetify);

// La traducción al español de Vuetify deja en inglés estas cadenas, y un lector de pantalla diría "Clear".
const es = {
  ...traduccionAlEspanol,
  input: {
    clear: 'Borrar lo escrito en {0}',
    prependAction: '{0}: acción previa',
    appendAction: '{0}: acción posterior',
  },
  loading: 'Cargando...',
};

// El tema: la paleta de la persona desarrolladora (specs/arquitectura.spec.md, "Diseño de la pantalla").
// El quinto color, #FFE66D, es un supuesto: si la persona dice otro, se cambia aquí y en la spec.
// Los colores que la paleta no usa (info, success y warning) también salen de ella, para que ningún componente de
// Vuetify pinte un azul o un verde ajenos.
export default new Vuetify({
  // Los textos que Vuetify pone solos (el botón de borrar un campo, el pie de las tablas) salen en español.
  lang: { locales: { es }, current: 'es' },
  icons: { iconfont: 'mdi' },
  theme: {
    dark: false,
    // Crea --v-primary-base, --v-secondary-base y demás: vuetify.css las usa en vez de repetir los colores.
    options: { customProperties: true },
    themes: {
      light: {
        primary: '#4ECDC4', // acciones principales: botones, foco y selección
        secondary: '#292F36', // barra superior y todo el texto
        accent: '#FFE66D', // resalta el total y lo recién agregado
        error: '#FF6B6B', // errores y acciones que borran
        info: '#4ECDC4',
        success: '#4ECDC4',
        warning: '#FFE66D',
        background: '#F7FFF7', // fondo de la pantalla
        surface: '#FFFFFF',
      },
    },
  },
});
