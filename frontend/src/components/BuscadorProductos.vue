<template>
  <div class="buscador" role="search">
    <v-text-field
      v-model="texto"
      label="Buscar producto"
      hint="Por nombre o código de barras"
      prepend-inner-icon="mdi-magnify"
      autocomplete="off"
      background-color="surface"
      color="secondary"
      autofocus
      clearable
      outlined
      persistent-hint
    />
  </div>
</template>

<script>
// El campo de búsqueda. Por ahora solo guarda lo que escribe el cajero: buscar en la API y mostrar los
// resultados lo agrega la spec de buscar producto.
export default {
  name: 'BuscadorProductos',
  data() {
    return { texto: '' };
  },
};
</script>
