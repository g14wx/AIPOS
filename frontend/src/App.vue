<!--
  Contrato de diseño (skill impeccable, modo Operate). No hubo entrevista: lo infirió el agente de PRODUCT.md y de la spec.
  TESIS: una caja registradora que se lee de un vistazo. Solo llaman dos cosas: dónde buscar y el total en amarillo.
  Rechaza el tablero de tarjetas iguales.
  OWN-WORLD: fondo menta #F7FFF7, superficies blancas con un filete de tinta, barra tinta #292F36 con la marca en
  turquesa #4ECDC4, botones turquesa con texto tinta y el total en una franja amarilla #FFE66D. Todo el texto es tinta,
  con la tipografía del sistema y cifras tabulares.
  STORY: en un segundo el cajero sabe dónde buscar, dónde ve lo que va a cobrar y cómo crear un producto.
  FIRST VIEWPORT: barra de 48 px. A la izquierda, «Nuevo producto» y el campo «Buscar producto»; a la derecha, «Venta
  actual» con su total abajo. En móvil, una columna en ese orden.
  FORM: herramienta de dos columnas. Sin tirada de semillas: la estructura la fijan RNF-01 y la spec de arquitectura.
-->
<template>
  <v-app>
    <v-app-bar app dense flat color="secondary" class="barra">
      <div class="pantalla">
        <h1 class="marca">AIPOS</h1>
      </div>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pantalla py-4 py-md-6">
        <v-row>
          <v-col cols="12" md="7" lg="8">
            <NuevoProducto data-zona="nuevo-producto" />
            <BuscadorProductos data-zona="busqueda" class="mt-4" />
          </v-col>

          <v-col cols="12" md="5" lg="4">
            <VentaActual data-zona="venta-actual" :venta-actual="ventaActual" />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import BuscadorProductos from './components/BuscadorProductos.vue';
import NuevoProducto from './components/NuevoProducto.vue';
import VentaActual from './components/VentaActual.vue';
import { vaciarVentaActual } from './ventaActual/ventaActual.js';

// La pantalla única (RNF-01). App.vue guarda la venta actual y los componentes la reciben por propiedad: así la
// lógica se queda en src/ventaActual/ y los componentes solo muestran.
export default {
  name: 'App',
  components: { BuscadorProductos, NuevoProducto, VentaActual },
  data() {
    return { ventaActual: vaciarVentaActual() };
  },
};
</script>

<style scoped>
/* El contenido y la marca de la barra comparten ancho máximo y márgenes, así que quedan alineados. */
.pantalla {
  width: 100%;
  max-width: 90rem;
  margin: 0 auto;
  padding-right: 1rem;
  padding-left: 1rem;
}

@media (min-width: 960px) {
  .pantalla {
    padding-right: 1.5rem;
    padding-left: 1.5rem;
  }
}

.barra ::v-deep .v-toolbar__content {
  padding: 0;
}

.marca {
  margin: 0;
  color: var(--v-primary-base);
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.75rem;
  letter-spacing: normal;
}
</style>
