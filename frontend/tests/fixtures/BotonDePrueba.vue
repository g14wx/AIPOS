<template>
  <div>
    <v-btn color="primary" @click="pulsaciones += 1">{{ texto }}</v-btn>
    <span class="pulsaciones">{{ pulsaciones }}</span>
  </div>
</template>

<script>
// Componente de prueba: comprueba que @vitejs/plugin-vue2 compila un .vue y que Vuetify 2 lo dibuja.
export default {
  name: 'BotonDePrueba',
  props: { texto: { type: String, default: 'Pulsar' } },
  data() {
    return { pulsaciones: 0 };
  },
};
</script>
