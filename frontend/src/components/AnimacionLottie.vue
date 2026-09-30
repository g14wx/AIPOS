<template>
  <div class="animacion-lottie" aria-hidden="true" :style="estilo"></div>
</template>

<script>
// Adapter: convierte lottie-web, una librería imperativa (loadAnimation, destroy), en un componente con
// propiedades y ciclo de vida. Usa la versión ligera, que solo dibuja con SVG y no evalúa expresiones.
// El resto de la pantalla usa este componente y nunca llama a la librería.
// Es decorativa (aria-hidden): el texto que la acompaña dice lo mismo.
import lottie from 'lottie-web/build/player/lottie_light';

export default {
  name: 'AnimacionLottie',
  props: {
    // El JSON de la animación, de src/assets/animaciones/.
    animacion: { type: Object, required: true },
    // Si se repite. Con menos movimiento del sistema nunca se repite.
    loop: { type: Boolean, default: true },
    // Alto en píxeles. El ancho lo da el contenedor y la animación conserva su proporción.
    alto: { type: Number, default: 120 },
    // Cuadro que se muestra fijo con menos movimiento: 'ultimo' (el resultado) o 'primero'.
    cuadroFijo: {
      type: String,
      default: 'ultimo',
      validator: (valor) => ['ultimo', 'primero'].includes(valor),
    },
  },
  computed: {
    estilo() {
      return { height: `${this.alto}px` };
    },
  },
  watch: {
    animacion() {
      this.destruir();
      this.crear();
    },
  },
  mounted() {
    this.crear();
  },
  beforeDestroy() {
    this.destruir();
  },
  methods: {
    crear() {
      const menosMovimiento = this.pideMenosMovimiento();
      this.instancia = lottie.loadAnimation({
        container: this.$el,
        renderer: 'svg',
        loop: menosMovimiento ? false : this.loop,
        autoplay: !menosMovimiento,
        animationData: this.animacion,
      });
      if (menosMovimiento) {
        const ultimo = this.instancia.totalFrames - 1;
        this.instancia.goToAndStop(this.cuadroFijo === 'primero' ? 0 : ultimo, true);
      }
    },
    destruir() {
      if (this.instancia) this.instancia.destroy();
      this.instancia = null;
    },
    pideMenosMovimiento() {
      return (
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    },
  },
};
</script>
