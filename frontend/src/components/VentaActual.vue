<template>
  <section class="venta-actual" aria-labelledby="venta-actual-titulo">
    <!-- Con tabindex -1 recibe el foco con código al eliminar el último detalle, sin entrar en el orden de Tab. -->
    <h2 id="venta-actual-titulo" ref="titulo" class="venta-actual__titulo" tabindex="-1">
      Venta actual
    </h2>

    <div class="venta-actual__cuerpo">
      <div v-if="!hayDetalles" class="venta-actual__vacia">
        <AnimacionLottie
          class="venta-actual__animacion"
          :animacion="animacionVentaVacia"
          :alto="112"
        />
        <p class="venta-actual__mensaje">Busca un producto para empezar la venta</p>
      </div>

      <v-data-table
        v-else
        class="detalles"
        :headers="columnas"
        :items="ventaActual.detalles"
        item-key="productoId"
        :item-class="claseDeFila"
        :mobile-breakpoint="puntoDeApilado"
        disable-sort
        disable-pagination
        hide-default-footer
      >
        <template #item.nombre="{ item }">
          <span class="detalle__nombre">{{ item.nombre }}</span>
        </template>

        <template #item.precioAplicado="{ item }">
          <span class="detalle__precio-aplicado">{{ item.precioAplicado }}</span>
        </template>

        <template #item.cantidad="{ item }">
          <span class="detalle__cantidad">{{ item.cantidad }}</span>
        </template>

        <template #item.subtotal="{ item }">
          <span class="detalle__subtotal">{{ subtotalDe(item) }}</span>
        </template>

        <template #header.acciones>
          <span class="solo-lectores">Acciones</span>
        </template>

        <template #item.acciones="{ item }">
          <div class="detalle__acciones">
            <v-btn
              class="detalle__eliminar"
              icon
              large
              color="error"
              :aria-label="`Eliminar ${item.nombre} de la venta actual`"
              :disabled="enviando"
              @click="alEliminar(item, $event)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </div>

    <div class="venta-actual__pie">
      <div class="venta-actual__franja-total" aria-live="polite" aria-atomic="true">
        <span class="venta-actual__etiqueta">Total</span>
        <span class="venta-actual__total" data-total>{{ total }}</span>
      </div>
      <div class="venta-actual__registro">
        <v-btn color="primary" large depressed block :disabled="!puedeRegistrar">
          Registrar venta
        </v-btn>
      </div>
    </div>
  </section>
</template>

<script>
import animacionVentaVacia from '../assets/animaciones/venta-vacia.json';
import { formatearCentavos } from '../dinero.js';
import {
  calcularSubtotal,
  calcularTotal,
  eliminarDetalle,
  vaciarVentaActual,
  ventaActualEsValida,
} from '../ventaActual/ventaActual.js';
import AnimacionLottie from './AnimacionLottie.vue';

// Vuetify apila las filas de una tabla cuando el ancho de la ventana es menor que su punto de apilado. La tarjeta de la
// venta actual puede ser angosta aunque la ventana no lo sea (desde 960 px hay dos columnas y la tarjeta mide unos
// 400 px), así que aquí se mide la tarjeta: con menos de este ancho las cinco columnas no caben y las filas se apilan,
// cada valor con la etiqueta de su columna.
const ANCHO_MINIMO_DE_TABLA = 640;
const SIEMPRE_APILADAS = 100000;
const NUNCA_APILADAS = 0;
// Sin medida (todavía no se midió, o el navegador no trae ResizeObserver) rige el punto de apilado que trae Vuetify.
const APILADO_DE_VUETIFY = 600;

// Muestra la venta actual, su total y el botón «Registrar venta». No la guarda ni la cambia: la recibe de App.vue por
// propiedad. Cambiar el precio aplicado y la cantidad y eliminar un detalle lo suman V-05, V-06 y V-07, cada uno en la
// celda de su columna; V-08 reemplaza el botón «Registrar venta» provisional.
export default {
  name: 'VentaActual',
  components: { AnimacionLottie },
  props: {
    ventaActual: { type: Object, default: vaciarVentaActual },
    // El productoId del detalle recién agregado: su fila se pinta con el acento unos segundos. Lo decide App.vue.
    resaltarId: { type: Number, default: null },
    // true mientras V-08 registra la venta: deshabilita los campos y el botón «Eliminar».
    enviando: { type: Boolean, default: false },
  },
  data() {
    return {
      animacionVentaVacia,
      anchoDeLaTarjeta: null,
      columnas: [
        { text: 'Producto', value: 'nombre', sortable: false },
        { text: 'Precio aplicado', value: 'precioAplicado', align: 'end', sortable: false },
        { text: 'Cantidad', value: 'cantidad', align: 'end', sortable: false },
        { text: 'Subtotal', value: 'subtotal', align: 'end', sortable: false },
        { text: 'Acciones', value: 'acciones', align: 'end', sortable: false, width: '1%' },
      ],
    };
  },
  computed: {
    hayDetalles() {
      return this.ventaActual.detalles.length > 0;
    },
    total() {
      return formatearCentavos(calcularTotal(this.ventaActual));
    },
    puedeRegistrar() {
      return ventaActualEsValida(this.ventaActual);
    },
    puntoDeApilado() {
      if (!this.anchoDeLaTarjeta) return APILADO_DE_VUETIFY;
      return this.anchoDeLaTarjeta < ANCHO_MINIMO_DE_TABLA ? SIEMPRE_APILADAS : NUNCA_APILADAS;
    },
  },
  watch: {
    // V-07: cuando llega la venta actual sin el detalle que se eliminó, el foco pasa a un lugar con sentido. Si el detalle
    // sigue ahí (la propiedad cambió por otra cosa), el pedido se descarta y el foco no se mueve.
    ventaActual(nueva) {
      const pedido = this.focoPorEliminar;
      this.focoPorEliminar = null;
      if (!pedido) return;
      const sigueAhi = nueva.detalles.some((detalle) => detalle.productoId === pedido.productoId);
      if (!sigueAhi) this.$nextTick(() => this.enfocarTrasEliminar(pedido.indice));
    },
    resaltarId(productoId) {
      if (productoId !== null) this.$nextTick(this.mostrarFilaResaltada);
    },
  },
  created() {
    // Qué fila se pidió eliminar (V-07). No es reactivo, porque no se dibuja: no va en data.
    this.focoPorEliminar = null;
  },
  mounted() {
    this.anchoDeLaTarjeta = this.$el.clientWidth || null;
    if (typeof ResizeObserver === 'function') {
      this.observador = new ResizeObserver(([medida]) => {
        this.anchoDeLaTarjeta = medida.contentRect.width;
      });
      this.observador.observe(this.$el);
    }
  },
  beforeDestroy() {
    this.observador?.disconnect();
  },
  methods: {
    // El cajero presionó «Eliminar» en la fila de un detalle: se emite la venta actual sin él y App.vue la reemplaza. No pide
    // confirmación: el producto se puede volver a agregar desde la búsqueda. Antes de emitir se anota qué fila era, para
    // llevar el foco a la que ocupe su lugar cuando la venta nueva llegue.
    alEliminar(detalle, evento) {
      // El segundo clic de un doble clic (detail 2 o más) cae sobre el botón de la fila que subió a ocupar el lugar del
      // detalle eliminado, y no debe eliminar otro (#79). El clic suelto trae detail 1 y el teclado (Enter o Espacio), 0.
      if (evento?.detail > 1) return;
      const indice = this.ventaActual.detalles.findIndex(
        (d) => d.productoId === detalle.productoId,
      );
      this.focoPorEliminar = { productoId: detalle.productoId, indice };
      this.$emit('update:ventaActual', eliminarDetalle(this.ventaActual, detalle.productoId));
    },
    // El botón que tenía el foco ya no está: el foco pasa al «Eliminar» de la fila que ocupó su lugar (o al de la anterior,
    // si era la última) y, si no quedó ninguna, al título «Venta actual», para que quien usa el teclado no pierda su lugar.
    enfocarTrasEliminar(indice) {
      const botones = this.$el.querySelectorAll('.detalle__eliminar');
      if (botones.length === 0) this.$refs.titulo.focus();
      else botones[Math.min(indice, botones.length - 1)].focus();
    },
    subtotalDe(detalle) {
      return formatearCentavos(calcularSubtotal(detalle));
    },
    claseDeFila(detalle) {
      return detalle.productoId === this.resaltarId ? 'detalle-resaltado' : '';
    },
    // La fila recién agregada queda a la vista, sin animación de movimiento, si el navegador sabe hacerlo.
    mostrarFilaResaltada() {
      this.$el.querySelector('.detalle-resaltado')?.scrollIntoView?.({ block: 'nearest' });
    },
  },
};
</script>

<style scoped>
/* La tarjeta no recorta su contenido (overflow: hidden): la franja de abajo es sticky y, con un ancestro que recorta, se
   quedaría pegada a la tarjeta y no al borde de la pantalla. */
.venta-actual {
  --filete: color-mix(in srgb, var(--v-secondary-base) 16%, transparent);
  display: flex;
  flex-direction: column;
  min-height: 22rem;
  background: var(--v-surface-base);
  border: 1px solid var(--filete);
  border-radius: 0.25rem;
}

.venta-actual__titulo {
  padding: 1rem 1.25rem;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.75rem;
  border-bottom: 1px solid var(--filete);
}

.venta-actual__cuerpo {
  display: flex;
  flex: 1;
  flex-direction: column;
}

/* Sin detalles: la animación y lo que hay que hacer, en el centro de la tarjeta. */
.venta-actual__vacia {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1.25rem;
  text-align: center;
}

.venta-actual__animacion {
  width: 7rem;
}

.venta-actual__mensaje {
  max-width: 18rem;
  margin: 0.5rem 0 0;
  font-size: 1rem;
  line-height: 1.5rem;
  text-wrap: balance;
}

/* El total y el botón para registrar la venta van en una franja que se queda pegada al borde de abajo cuando la lista es
   larga: el cajero nunca busca cuánto va a cobrar. */
.venta-actual__pie {
  position: sticky;
  bottom: 0;
  background: var(--v-surface-base);
  border-top: 1px solid var(--filete);
  border-radius: 0 0 0.25rem 0.25rem;
}

/* Si la cifra más grande (13 caracteres) no cabe junto a «Total» en una pantalla muy angosta, pasa a la línea de abajo. */
.venta-actual__franja-total {
  display: flex;
  flex-wrap: wrap;
  column-gap: 0.75rem;
  align-items: baseline;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: var(--v-accent-base);
}

.venta-actual__etiqueta {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.75rem;
}

.venta-actual__total {
  margin-left: auto;
  font-size: 2rem;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  line-height: 2.5rem;
}

.venta-actual__registro {
  padding: 1rem 1.25rem;
}

/* La tabla de detalles. El color del texto de la tabla (tinta) lo pone src/plugins/vuetify.css. */
.venta-actual .detalles {
  background: transparent;
}

.detalle__nombre {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.5rem;
  overflow-wrap: anywhere;
}

.detalle__precio-aplicado,
.detalle__cantidad,
.detalle__subtotal {
  font-size: 1rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.5rem;
}

.solo-lectores {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  white-space: nowrap;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

/* Celdas más compactas que las de Vuetify, con aire arriba y abajo para un nombre que pasa a otra línea. */
.detalles ::v-deep td,
.detalles ::v-deep th {
  padding: 0.5rem 0.75rem;
}

.detalles ::v-deep td:first-child,
.detalles ::v-deep th:first-child {
  padding-left: 1.25rem;
}

.detalles ::v-deep td:last-child,
.detalles ::v-deep th:last-child {
  padding-right: 1.25rem;
}

/* Las filas no se pulsan: sin el gris con que Vuetify responde al puntero. Los !important son por la especificidad de
   las reglas de Vuetify para el puntero, los separadores y el modo apilado. */
.detalles ::v-deep tbody tr:hover {
  background: transparent !important;
}

.detalles ::v-deep tbody td {
  border-bottom-color: var(--filete) !important;
}

/* El detalle recién agregado se pinta con el acento y el texto en tinta, sin animación. */
.detalles ::v-deep tbody tr.detalle-resaltado,
.detalles ::v-deep tbody tr.detalle-resaltado:hover {
  color: var(--v-secondary-base);
  background: var(--v-accent-base) !important;
  /* El total queda pegado abajo: al dejar la fila a la vista, no debe quedar debajo de él. */
  scroll-margin-bottom: 10rem;
}

/* Filas apiladas (el modo móvil de Vuetify, ver puntoDeApilado): arriba el nombre y las acciones, y debajo el precio
   aplicado, la cantidad y el subtotal, cada uno con su etiqueta encima. Las celdas de abajo pasan a otra línea cuando
   no caben (por ejemplo, con las cifras más grandes en una pantalla de 320 px) en vez de montarse unas sobre otras.
   V-05 a V-07 ponen sus campos en estas mismas celdas. */
.detalles ::v-deep .v-data-table__mobile-table-row {
  display: flex;
  flex-wrap: wrap;
  column-gap: 1rem;
  align-items: flex-end;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--filete);
}

.detalles ::v-deep .v-data-table__mobile-table-row:last-child {
  border-bottom: 0;
}

/* Un corte de línea entre el nombre con las acciones y los tres valores de abajo. */
.detalles ::v-deep .v-data-table__mobile-table-row::before {
  order: 3;
  flex-basis: 100%;
  height: 0;
  content: '';
}

.detalles ::v-deep .v-data-table__mobile-row {
  flex-direction: column;
  align-items: flex-start;
  min-height: 0 !important;
  padding: 0 !important;
  border-bottom: 0 !important;
}

.detalles ::v-deep .v-data-table__mobile-row__header {
  padding: 0 !important;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.25rem;
}

.detalles ::v-deep .v-data-table__mobile-row__cell {
  text-align: left !important;
}

/* El orden de las celdas: el nombre, las acciones, el corte de línea, y el precio aplicado, la cantidad y el subtotal. */
.detalles ::v-deep .v-data-table__mobile-row:nth-child(1) {
  order: 1;
  flex: 1 1 0;
  min-width: 0;
}

.detalles ::v-deep .v-data-table__mobile-row:nth-child(5) {
  order: 2;
  align-items: flex-end;
  align-self: flex-start;
}

.detalles ::v-deep .v-data-table__mobile-row:nth-child(2) {
  order: 4;
  margin-top: 0.25rem;
}

.detalles ::v-deep .v-data-table__mobile-row:nth-child(3) {
  order: 5;
  margin-top: 0.25rem;
}

.detalles ::v-deep .v-data-table__mobile-row:nth-child(4) {
  order: 6;
  align-items: flex-end;
  margin-top: 0.25rem;
  margin-left: auto;
}

/* El nombre y las acciones no llevan etiqueta: el nombre se explica solo y cada acción tiene su aria-label. */
.detalles ::v-deep .v-data-table__mobile-row:nth-child(1) .v-data-table__mobile-row__header,
.detalles ::v-deep .v-data-table__mobile-row:nth-child(5) .v-data-table__mobile-row__header {
  display: none;
}
</style>
