<!--
  Contrato de diseño (skill impeccable, modo Operate). No hubo entrevista: lo infirió el agente de PRODUCT.md, DESIGN.md y de
  la spec registrar-venta.
  TESIS: una sola acción principal y un resultado que se lee de un vistazo. «Registrar venta» es el único botón de peso, y el
  resultado aparece pegado a él, en la franja de abajo, donde el cajero ya está mirando el total.
  OWN-WORLD: el de la pantalla, sin nada nuevo. Éxito: turquesa al 18 % con borde turquesa, el comprobante sellado (la
  animación) y el total que calculó MySQL, un poco más grande. Error: la franja de error de siempre (borde e ícono coral, texto
  en tinta). Sin sombras, sin movimiento fuera de la animación.
  STORY: el cajero presiona, ve sellarse el comprobante con el número y el total de la venta, y la venta actual queda vacía. Si
  falla, ve qué pasó y qué hacer, y su venta sigue ahí.
  FOCAL MOMENT: el sello que rebota y la palomita que se dibuja, una sola vez. Lo demás está quieto.
-->
<template>
  <div class="registrar-venta">
    <!-- La región de estado existe desde el principio, vacía: así el lector de pantalla anuncia la venta cuando llega. -->
    <div class="exito" :class="{ 'exito--visible': exito }">
      <AnimacionLottie
        v-if="exito"
        class="exito__animacion"
        :animacion="animacionVentaRegistrada"
        :loop="false"
        :alto="48"
      />
      <p class="exito__texto" role="status">
        <template v-if="exito"
          ><span class="exito__dato">Venta {{ exito.ventaId }} registrada</span>{{ ' · '
          }}<span class="exito__dato exito__total">Total {{ exito.total }}</span></template
        >
      </p>
      <v-btn
        v-if="exito"
        class="exito__cerrar"
        text
        large
        aria-label="Cerrar el aviso de la venta registrada"
        @click="exito = null"
      >
        Cerrar
      </v-btn>
    </div>

    <v-alert v-if="error" type="error" text dense class="registrar-venta__error">
      <p class="error__mensaje">{{ error.mensaje }}</p>
      <ul v-if="error.lineas.length > 0" class="error__lineas">
        <li v-for="(linea, indice) in error.lineas" :key="indice">{{ linea }}</li>
      </ul>
    </v-alert>

    <v-alert
      v-if="pasaDelMaximo"
      :id="idDelAviso"
      type="error"
      text
      dense
      class="registrar-venta__error"
    >
      {{ avisoDelMaximo }}
    </v-alert>

    <v-btn
      ref="boton"
      color="primary"
      large
      depressed
      block
      :disabled="!puedeRegistrar || enviando"
      :loading="enviando"
      :aria-describedby="pasaDelMaximo ? idDelAviso : null"
      @click="registrar"
      @keydown="ignorarRepeticionDeEnter"
    >
      <v-icon left>mdi-cash-register</v-icon>
      Registrar venta
    </v-btn>
  </div>
</template>

<script>
import { registrarVenta } from '../api/ventas.js';
import animacionVentaRegistrada from '../assets/animaciones/venta-registrada.json';
import { MAXIMO_DETALLES } from '../ventaActual/ventaActual.js';
import AnimacionLottie from './AnimacionLottie.vue';

const AVISO_DEL_MAXIMO = `Una venta puede tener como máximo ${MAXIMO_DETALLES} productos.`;
const SIN_CONEXION = 'No se pudo conectar con el servidor. Tu venta sigue aquí: intenta de nuevo.';
const INESPERADO = 'Ocurrió un error inesperado. Intenta de nuevo.';
// Cómo nombra el cajero cada campo de un detalle: «detalles[1].cantidad» es «Detalle 2, cantidad».
const CAMPOS = Object.freeze({
  productoId: 'producto',
  cantidad: 'cantidad',
  precioAplicado: 'precio aplicado',
});
const CAMPO_DE_UN_DETALLE = /^detalles\[(\d+)\](?:\.(productoId|cantidad|precioAplicado))?$/;

// Una línea por cada detalle del error de un 400: el campo en palabras del cajero y el motivo. Un campo que la pantalla no
// conoce, o la lista entera («detalles»), va sin nombre: el mensaje ya dice todo y «cuerpo.raro» no le sirve al cajero.
function lineaDelError(detalleDelError) {
  if (typeof detalleDelError?.mensaje !== 'string' || detalleDelError.mensaje === '') return '';
  const partes = CAMPO_DE_UN_DETALLE.exec(detalleDelError.campo);
  if (!partes) return detalleDelError.mensaje;
  const detalle = `Detalle ${Number(partes[1]) + 1}`;
  const campo = partes[2] ? `${detalle}, ${CAMPOS[partes[2]]}` : detalle;
  return `${campo}: ${detalleDelError.mensaje}`;
}

// Anti-Corruption Layer: traduce el Error de la API (status, codigo, mensaje y los detalles del error, como los deja
// http.js) a lo que muestra la franja: un mensaje y, en un 400, una línea por cada detalle del error.
function traducirError(error) {
  if (!(error instanceof Error) || typeof error.status !== 'number') {
    return { mensaje: INESPERADO, lineas: [] };
  }
  // Sin respuesta (API caída o más de 10 segundos): el mensaje de http.js es genérico; aquí se le dice al cajero que su venta
  // sigue en la pantalla.
  if (error.status === 0) return { mensaje: SIN_CONEXION, lineas: [] };
  const detalles = error.status === 400 && Array.isArray(error.detalles) ? error.detalles : [];
  return {
    mensaje: error.mensaje || INESPERADO,
    lineas: detalles.map(lineaDelError).filter(Boolean),
  };
}

// El botón «Registrar venta» y su resultado. Recibe los detalles que se van a mandar y si la venta actual es válida (lo
// calcula src/ventaActual/, no este componente), y avisa con `registrada` (Domain Event) cuando MySQL la guardó: quien vacía
// la venta actual es VentaActual.vue y quien la guarda es App.vue. Con `update:enviando` dice cuándo empieza y termina el
// envío. Un error, del tipo que sea, nunca toca la venta actual (RNF-05).
export default {
  name: 'RegistrarVenta',
  components: { AnimacionLottie },
  props: {
    detalles: { type: Array, default: () => [] },
    valida: { type: Boolean, default: false },
  },
  data() {
    return {
      // true desde que se presiona el botón hasta que la API contesta: es la guardia del doble clic.
      enviando: false,
      // { ventaId, total } de la venta que registró la API, o null. Se queda hasta que el cajero la cierra o registra otra.
      exito: null,
      // { mensaje, lineas } del último error, o null. Se quita al empezar otro envío.
      error: null,
      animacionVentaRegistrada,
      avisoDelMaximo: AVISO_DEL_MAXIMO,
      idDelAviso: 'registrar-venta-aviso',
    };
  },
  computed: {
    pasaDelMaximo() {
      return this.detalles.length > MAXIMO_DETALLES;
    },
    // El componente revisa el máximo por su cuenta: no depende de que `valida` lo haya tenido en cuenta.
    puedeRegistrar() {
      return this.valida && this.detalles.length > 0 && !this.pasaDelMaximo;
    },
  },
  methods: {
    async registrar() {
      // La marca se pone antes de esperar nada: un doble clic manda una sola petición, aun antes de que el botón se vuelva
      // a pintar deshabilitado.
      if (this.enviando || !this.puedeRegistrar) return;
      this.enviando = true;
      this.exito = null;
      this.error = null;
      this.$emit('update:enviando', true);
      let fallo = false;
      try {
        const { ventaId, total } = await registrarVenta(this.detalles);
        this.exito = { ventaId, total };
        this.$emit('registrada', { ventaId, total });
      } catch (error) {
        fallo = true;
        this.mostrarError(error);
      } finally {
        this.enviando = false;
        this.$emit('update:enviando', false);
      }
      // Con el botón otra vez habilitado, el foco vuelve a él: el cajero puede intentarlo de nuevo sin buscarlo.
      if (fallo) this.$nextTick(() => this.$refs.boton?.$el.focus());
    },
    mostrarError(error) {
      // Un error que no viene de la API es un fallo de programación: queda en la consola y el cajero ve el aviso genérico.
      if (!(error instanceof Error) || typeof error.status !== 'number') console.error(error);
      this.error = traducirError(error);
    },
    // Mantener presionado Enter repite la tecla, y el navegador hace un clic por cada repetición: tras un error, con el botón
    // otra vez habilitado, mandaría una petición tras otra (como en «Eliminar», #83). El keydown de una repetición trae
    // repeat en true: se cancela y no llega a hacer clic.
    ignorarRepeticionDeEnter(evento) {
      if (evento.key === 'Enter' && evento.repeat) evento.preventDefault();
    },
  },
};
</script>

<style scoped>
.registrar-venta {
  display: flex;
  flex-direction: column;
}

/* La franja de éxito. Su región de estado está siempre en la página, vacía, y la franja solo se ve con un resultado:
   turquesa al 18 % con borde turquesa, como el tinte de los resultados de la búsqueda. */
.exito {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 0.75rem;
}

.exito--visible {
  padding: 0.5rem 0.5rem 0.5rem 0.75rem;
  margin-bottom: 0.75rem;
  background: color-mix(in srgb, var(--v-primary-base) 18%, var(--v-surface-base));
  border: 1px solid var(--v-primary-base);
  border-radius: 0.25rem;
}

.exito__animacion {
  flex: none;
  width: 3rem;
}

.exito__texto {
  flex: 1 1 10rem;
  min-width: 0;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.5rem;
}

/* «Venta 15 registrada» y «Total 47.50» pasan enteros a otra línea cuando no caben: el corte cae en el punto medio. */
.exito__dato {
  display: inline-block;
  overflow-wrap: anywhere;
}

.exito__total {
  font-size: 1.25rem;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}

/* Si «Cerrar» no cabe junto al texto (un teléfono), pasa a su propia línea, a la derecha. */
.exito__cerrar {
  margin-left: auto;
}

/* El error: la franja de error de siempre (borde e ícono coral, texto en tinta). El mensaje de la API va en 600 y, si es un
   400, una línea de 14 px por cada detalle del error. */
.registrar-venta__error {
  margin-bottom: 0.75rem;
}

.error__mensaje {
  margin: 0;
  font-weight: 600;
}

.error__lineas {
  padding-left: 1.25rem;
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  line-height: 1.25rem;
}
</style>
