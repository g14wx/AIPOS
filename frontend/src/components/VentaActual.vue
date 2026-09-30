<template>
  <section class="venta-actual" aria-labelledby="venta-actual-titulo">
    <h2 id="venta-actual-titulo" class="venta-actual__titulo">Venta actual</h2>

    <div class="venta-actual__cuerpo">
      <div v-if="!hayDetalles" class="venta-actual__vacia">
        <span class="venta-actual__icono" aria-hidden="true">
          <v-icon large color="secondary">mdi-barcode-scan</v-icon>
        </span>
        <p class="venta-actual__mensaje">Busca un producto para empezar la venta</p>
      </div>
    </div>

    <div class="venta-actual__total" aria-live="polite" aria-atomic="true">
      <span class="venta-actual__etiqueta">Total</span>
      <span class="venta-actual__importe" data-total>{{ total }}</span>
    </div>
  </section>
</template>

<script>
import { formatearCentavos } from '../dinero.js';
import { calcularTotal, vaciarVentaActual } from '../ventaActual/ventaActual.js';

// Muestra la venta actual y su total. No la guarda ni la cambia: la recibe de App.vue por propiedad.
// La tabla de detalles la agrega la spec de armar la venta actual.
export default {
  name: 'VentaActual',
  props: {
    ventaActual: { type: Object, default: vaciarVentaActual },
  },
  computed: {
    hayDetalles() {
      return this.ventaActual.detalles.length > 0;
    },
    total() {
      return formatearCentavos(calcularTotal(this.ventaActual));
    },
  },
};
</script>

<style scoped>
.venta-actual {
  display: flex;
  flex-direction: column;
  min-height: 22rem;
  overflow: hidden;
  background: var(--v-surface-base);
  border: 1px solid color-mix(in srgb, var(--v-secondary-base) 16%, transparent);
  border-radius: 0.5rem;
}

.venta-actual__titulo {
  padding: 1rem 1.25rem;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.75rem;
  border-bottom: 1px solid color-mix(in srgb, var(--v-secondary-base) 16%, transparent);
}

.venta-actual__cuerpo {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  padding: 1.5rem 1.25rem;
}

.venta-actual__vacia {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.venta-actual__icono {
  display: grid;
  width: 3.5rem;
  height: 3.5rem;
  place-items: center;
  background: color-mix(in srgb, var(--v-primary-base) 25%, var(--v-surface-base));
  border-radius: 50%;
}

.venta-actual__mensaje {
  max-width: 18rem;
  margin: 1rem 0 0;
  font-size: 1rem;
  line-height: 1.5rem;
  text-wrap: balance;
}

.venta-actual__total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: var(--v-accent-base);
}

.venta-actual__etiqueta {
  font-size: 1.125rem;
  font-weight: 600;
}

.venta-actual__importe {
  font-size: 2rem;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  line-height: 2.5rem;
}
</style>
