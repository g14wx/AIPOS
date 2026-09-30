<template>
  <div class="nuevo-producto">
    <v-btn
      ref="boton"
      color="primary"
      large
      depressed
      :block="$vuetify.breakpoint.xsOnly"
      @click="abierto = true"
    >
      <v-icon left>mdi-plus</v-icon>
      Nuevo producto
    </v-btn>

    <FormularioProducto v-model="abierto" @creado="mostrarAviso" />

    <!-- El aviso dura 4 segundos. Vuetify lo anuncia con aria-live="polite": el texto dice lo mismo que la animación. -->
    <v-snackbar v-model="aviso" :timeout="4000" light>
      <span class="aviso">
        <AnimacionLottie
          v-if="aviso"
          :key="numeroDeAviso"
          :animacion="productoCreado"
          :loop="false"
          :alto="32"
          class="aviso__animacion"
        />
        Producto creado
      </span>
    </v-snackbar>
  </div>
</template>

<script>
import productoCreado from '../assets/animaciones/producto-creado.json';
import AnimacionLottie from './AnimacionLottie.vue';
import FormularioProducto from './FormularioProducto.vue';

// El botón "Nuevo producto", el formulario en un modal y el aviso "Producto creado". El formulario captura y guarda;
// aquí solo se abre, se recibe su aviso "creado" y se decide qué mostrar (Domain Event). App.vue solo lo incluye.
export default {
  name: 'NuevoProducto',
  components: { AnimacionLottie, FormularioProducto },
  data() {
    return {
      abierto: false,
      aviso: false,
      // Sube con cada aviso: la animación se crea de nuevo y vuelve a dibujar la palomita.
      numeroDeAviso: 0,
      productoCreado,
    };
  },
  watch: {
    // Cierre como cierre, por "Cancelar", por Esc o al crear el producto, el foco vuelve al botón que lo abrió.
    // No se deja a Vuetify: en Safari y en Firefox un clic no enfoca el botón, y no habría a dónde volver.
    abierto(abierto, estabaAbierto) {
      if (estabaAbierto && !abierto) this.$nextTick(() => this.$refs.boton.$el.focus());
    },
  },
  methods: {
    // Si se crea otro producto con el aviso a la vista, el aviso se quita y vuelve a salir: así empieza de nuevo el
    // tiempo de 4 segundos y la animación.
    async mostrarAviso() {
      this.aviso = false;
      await this.$nextTick();
      this.numeroDeAviso += 1;
      this.aviso = true;
    },
  },
};
</script>

<style scoped>
.aviso {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.aviso__animacion {
  flex: none;
  width: 2rem;
}
</style>
