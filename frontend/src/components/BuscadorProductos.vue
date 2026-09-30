<template>
  <div class="buscador" role="search">
    <v-text-field
      ref="campo"
      v-model="texto"
      label="Buscar producto"
      hint="Nombre o código de barras"
      prepend-inner-icon="mdi-magnify"
      autocomplete="off"
      background-color="surface"
      color="secondary"
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
  mounted() {
    // El foco está en el campo al abrir la pantalla: el cajero escribe o escanea sin tocar nada. Se pide aquí y no
    // con la propiedad autofocus, que también pone el atributo HTML y Chrome avisa en la consola cuando ya hay foco.
    this.$refs.campo.focus();
  },
};
</script>
