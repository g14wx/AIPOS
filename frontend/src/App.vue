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
            <BuscadorProductos
              data-zona="busqueda"
              class="mt-4"
              @producto-elegido="alElegirProducto"
            />
          </v-col>

          <v-col cols="12" md="5" lg="4">
            <!-- Cuando la venta actual no cambió (999 de cantidad o 100 detalles): se quita sola a los 4 segundos. -->
            <v-alert v-if="aviso" type="error" text dense class="mb-4">{{ aviso }}</v-alert>
            <VentaActual
              data-zona="venta-actual"
              :venta-actual="ventaActual"
              :resaltar-id="resaltarId"
              :enviando.sync="enviando"
              @update:ventaActual="reemplazarVentaActual"
            />
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
import { guardarVentaActual, leerVentaActual } from './ventaActual/almacenamiento.js';
import {
  CANTIDAD_MAXIMA,
  MAXIMO_DETALLES,
  agregarAVentaActual,
} from './ventaActual/ventaActual.js';

// Cuánto se ve el aviso de un límite y cuánto se pinta la fila recién agregada (spec de armar la venta actual).
const AVISO_MS = 4000;
const RESALTADO_MS = 2000;
const AVISOS = Object.freeze({
  cantidadMaxima: `La cantidad máxima de un producto es ${CANTIDAD_MAXIMA}.`,
  detallesMaximos: `Una venta puede tener como máximo ${MAXIMO_DETALLES} productos.`,
});

// La pantalla única (RNF-01). App.vue es el mediador entre la búsqueda y la venta actual: los dos componentes no se
// conocen. Es el único que guarda la venta actual (en memoria y en el navegador): la recibe de la búsqueda con
// agregarAVentaActual y de VentaActual con update:ventaActual, y los componentes la muestran por propiedad. La lógica
// se queda en src/ventaActual/ y los componentes solo muestran.
export default {
  name: 'App',
  components: { BuscadorProductos, NuevoProducto, VentaActual },
  data() {
    return {
      // Lo que quedó guardado en el navegador, o una venta actual vacía: si se recarga la página, sigue igual.
      ventaActual: leerVentaActual(),
      // true mientras V-08 registra la venta: la venta actual no puede cambiar a la mitad de un envío.
      enviando: false,
      // El productoId del detalle recién agregado, o null.
      resaltarId: null,
      // El aviso de un límite, o ''.
      aviso: '',
    };
  },
  created() {
    // Los temporizadores no son reactivos: no van en data.
    this.temporizadorDelAviso = null;
    this.temporizadorDelResaltado = null;
  },
  beforeDestroy() {
    clearTimeout(this.temporizadorDelAviso);
    clearTimeout(this.temporizadorDelResaltado);
  },
  methods: {
    // El cajero eligió un producto en la búsqueda. Si la venta actual no cambió (la cantidad ya está en 999 o ya hay
    // 100 detalles), agregarAVentaActual devuelve la misma venta y se avisa.
    alElegirProducto(producto) {
      if (this.enviando) return;
      const anterior = this.ventaActual;
      const nueva = agregarAVentaActual(anterior, producto);
      if (nueva === anterior) {
        const yaEstaba = anterior.detalles.some((detalle) => detalle.productoId === producto.id);
        this.avisar(yaEstaba ? AVISOS.cantidadMaxima : AVISOS.detallesMaximos);
        return;
      }
      this.reemplazarVentaActual(nueva);
      this.resaltar(producto.id);
    },
    // Toda venta actual nueva, de la búsqueda o de VentaActual, reemplaza a la anterior entera y se guarda. Si el
    // navegador no deja guardar, la pantalla sigue igual: la venta actual vive en memoria.
    reemplazarVentaActual(nueva) {
      this.ventaActual = nueva;
      guardarVentaActual(nueva);
    },
    avisar(texto) {
      this.aviso = texto;
      clearTimeout(this.temporizadorDelAviso);
      this.temporizadorDelAviso = setTimeout(() => {
        this.aviso = '';
      }, AVISO_MS);
    },
    resaltar(productoId) {
      this.resaltarId = productoId;
      clearTimeout(this.temporizadorDelResaltado);
      this.temporizadorDelResaltado = setTimeout(() => {
        this.resaltarId = null;
      }, RESALTADO_MS);
    },
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
