import Vue from 'vue';
import 'vuetify/dist/vuetify.min.css';
import '@mdi/font/css/materialdesignicons.css';
import vuetify from './plugins/vuetify';
import App from './App.vue';

Vue.config.productionTip = false;

new Vue({ vuetify, render: (h) => h(App) }).$mount('#app');
