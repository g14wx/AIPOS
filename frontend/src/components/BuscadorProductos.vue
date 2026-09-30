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
      @keydown.enter="buscarAlPresionarEnter"
    />

    <!-- La región de estado siempre está en la página, vacía cuando no hay nada que decir: así un lector de pantalla
         anuncia lo que aparezca en ella. Solo lleva mensajes cortos; la lista de resultados va aparte. -->
    <div class="estado" role="status" aria-live="polite">
      <p v-if="estado === 'pocosCaracteres'" class="mensaje">
        <v-icon class="mensaje__icono" color="secondary">mdi-information-outline</v-icon>
        <span>{{ textos.pocosCaracteres }}</span>
      </p>

      <div v-else-if="estado === 'buscando'" class="mensaje mensaje--buscando">
        <AnimacionLottie :animacion="animacionBuscando" :alto="48" class="mensaje__animacion" />
        <span>{{ textos.buscando }}</span>
      </div>

      <div v-else-if="estado === 'error'" class="mensaje mensaje--error">
        <v-icon class="mensaje__icono" color="error">mdi-alert-circle-outline</v-icon>
        <span class="mensaje__texto">{{ textos.error }}</span>
        <v-btn class="mensaje__accion" color="primary" large depressed @click="reintentar">
          <v-icon left>mdi-refresh</v-icon>
          Reintentar
        </v-btn>
      </div>

      <p v-else-if="codigoNoEncontrado" class="mensaje">
        <v-icon class="mensaje__icono" color="secondary">mdi-barcode-off</v-icon>
        <span>{{ textos.codigoNoEncontrado }}</span>
      </p>

      <p v-else-if="estado === 'sinResultados'" class="mensaje">
        <v-icon class="mensaje__icono" color="secondary">mdi-magnify-remove-outline</v-icon>
        <span>{{ textos.sinResultados }}</span>
      </p>

      <p v-if="estado === 'conResultados'" class="solo-lectores">{{ cuantosResultados }}</p>
    </div>

    <ul v-if="estado === 'conResultados'" class="lista" role="list">
      <li v-for="producto in resultados" :key="producto.id">
        <button
          type="button"
          class="resultado"
          :aria-label="describir(producto)"
          @click="elegir(producto)"
        >
          <span class="resultado__texto">
            <span class="resultado__nombre">{{ producto.nombre }}</span>
            <span class="resultado__codigo">{{ producto.codigoBarras }}</span>
          </span>
          <span class="resultado__precio">{{ producto.precio }}</span>
        </button>
      </li>
    </ul>
    <p v-if="hayMasQueMostrar" class="nota">{{ textos.limite }}</p>
  </div>
</template>

<script>
import { buscarProductos } from '../api/productos.js';
import animacionBuscando from '../assets/animaciones/buscando.json';
import AnimacionLottie from './AnimacionLottie.vue';

// La espera y el mínimo de caracteres de la spec de buscar producto (RF-02), con nombre para no repetir los números.
const ESPERA_MS = 300;
const MINIMO_CARACTERES = 2;
// Lo máximo que devuelve la API. Con tantos resultados puede haber más, y la pantalla lo avisa.
const RESULTADOS_MAXIMOS = 20;

const TEXTOS = Object.freeze({
  pocosCaracteres: `Escribe al menos ${MINIMO_CARACTERES} caracteres`,
  buscando: 'Buscando…',
  sinResultados: 'Sin resultados',
  codigoNoEncontrado: 'No hay un producto con ese código de barras',
  error: 'No se pudo buscar. Intenta de nuevo.',
  limite: `Se muestran los primeros ${RESULTADOS_MAXIMOS}. Escribe más para afinar la búsqueda`,
});

// Los caracteres se cuentan como los cuenta la API (MySQL): un emoji es uno solo, aunque JavaScript lo mida en dos.
const largoEnCaracteres = (texto) => [...texto].length;

// El campo "Buscar producto" con su lista de resultados. La zona de resultados está siempre en uno de seis estados:
// inicial (texto vacío), pocosCaracteres (1 carácter), buscando, conResultados, sinResultados o error. Avisa con el
// evento producto-elegido y no sabe nada de la venta actual: App.vue lo conecta con agregarAVentaActual.
export default {
  name: 'BuscadorProductos',
  components: { AnimacionLottie },
  data() {
    return {
      texto: '',
      estado: 'inicial',
      resultados: [],
      // RF-12: con Enter no hubo un producto con ese código de barras exacto. Se ve junto a la lista, si la hay.
      codigoNoEncontrado: false,
      // La animación de la espera, para pasársela a AnimacionLottie.
      animacionBuscando,
      textos: TEXTOS,
      // Cada búsqueda lleva un número que crece: la respuesta solo cuenta si su número es el último (SwitchMap).
      numeroDeBusqueda: 0,
      // La última búsqueda que salió, para repetirla con "Reintentar".
      ultimaBusqueda: null,
    };
  },
  computed: {
    // El texto sin espacios en los extremos. El botón de borrar de Vuetify deja el campo en null.
    textoLimpio() {
      return (this.texto || '').trim();
    },
    hayMasQueMostrar() {
      return this.estado === 'conResultados' && this.resultados.length >= RESULTADOS_MAXIMOS;
    },
    cuantosResultados() {
      const cuantos = this.resultados.length;
      return `${cuantos} ${cuantos === 1 ? 'resultado' : 'resultados'}`;
    },
  },
  watch: {
    // Todo cambio del texto recortado (escribir, borrar, elegir un resultado) pasa por aquí: cancela lo que esperaba,
    // invalida la búsqueda en curso y deja la zona de resultados como corresponde al texto nuevo.
    textoLimpio(texto) {
      this.cancelarEspera();
      this.numeroDeBusqueda += 1;
      this.codigoNoEncontrado = false;
      const largo = largoEnCaracteres(texto);
      if (largo === 0) {
        this.estado = 'inicial';
      } else if (largo < MINIMO_CARACTERES) {
        this.estado = 'pocosCaracteres';
      } else {
        // Debounce: la llamada sale cuando pasan 300 ms sin cambios. Mientras tanto ya se ve "Buscando…", para no dejar
        // a la vista una lista o un aviso que ya no corresponden al texto.
        this.estado = 'buscando';
        this.temporizador = setTimeout(() => this.buscar(texto), ESPERA_MS);
      }
    },
  },
  created() {
    this.temporizador = null;
  },
  mounted() {
    // El foco está en el campo al abrir la pantalla: el cajero escribe o escanea sin tocar nada. Se pide aquí y no
    // con la propiedad autofocus, que también pone el atributo HTML y Chrome avisa en la consola cuando ya hay foco.
    this.$refs.campo.focus();
  },
  beforeDestroy() {
    this.cancelarEspera();
    this.numeroDeBusqueda += 1;
  },
  methods: {
    cancelarEspera() {
      clearTimeout(this.temporizador);
      this.temporizador = null;
    },
    async buscar(texto, { alEntrar = false } = {}) {
      this.temporizador = null;
      this.numeroDeBusqueda += 1;
      const numero = this.numeroDeBusqueda;
      this.ultimaBusqueda = { texto, alEntrar };
      this.estado = 'buscando';
      let productos;
      try {
        productos = await buscarProductos(texto);
      } catch {
        // Sin respuesta, un 400 o un 500 se ven igual: la pantalla no muestra el mensaje interno del error.
        productos = null;
      }
      // Una respuesta que llega tarde, buena o mala, se ignora: el texto cambió o salió una búsqueda más nueva.
      if (numero !== this.numeroDeBusqueda) return;
      if (!Array.isArray(productos)) {
        this.estado = 'error';
        return;
      }
      this.mostrar(productos, texto, alEntrar);
    },
    mostrar(productos, texto, alEntrar) {
      // RF-12: con Enter, un código de barras exacto (letra por letra) entra directo, sin pasar por la lista.
      const exacto = alEntrar
        ? productos.find((producto) => producto.codigoBarras === texto)
        : null;
      if (exacto) {
        this.elegir(exacto);
        return;
      }
      this.resultados = productos;
      this.codigoNoEncontrado = alEntrar;
      this.estado = productos.length > 0 ? 'conResultados' : 'sinResultados';
    },
    // RF-12: Enter salta la espera de 300 ms y busca de inmediato, porque un lector de código de barras escribe y
    // presiona Enter más rápido que la espera. Con menos de 2 caracteres no hace nada.
    buscarAlPresionarEnter() {
      // En nextTick, para que el watcher del texto (que arma la espera y cambia el número de búsqueda) corra antes de
      // esta búsqueda y no la invalide, aunque Enter llegue en el mismo turno que el último carácter (#69).
      this.$nextTick(() => {
        if (largoEnCaracteres(this.textoLimpio) < MINIMO_CARACTERES) return;
        this.cancelarEspera();
        this.buscar(this.textoLimpio, { alEntrar: true });
      });
    },
    // Retry manual: repite la misma búsqueda, sin esperar, cuando el cajero lo pide.
    reintentar() {
      const { texto, alEntrar } = this.ultimaBusqueda;
      this.buscar(texto, { alEntrar });
      // El botón desaparece al empezar a buscar: el foco vuelve al campo para que el teclado siga (#68).
      this.$refs.campo.focus();
    },
    // Domain Event: avisa que el cajero eligió un producto. Después el campo queda vacío y con el foco, para buscar el
    // siguiente sin tocar el ratón. El foco se pide en nextTick: la fila que lo tenía desaparece con la lista.
    elegir(producto) {
      this.$emit('producto-elegido', producto);
      this.texto = '';
      this.$nextTick(() => this.$refs.campo?.focus());
    },
    // Lo que oye un lector de pantalla en cada fila: dice cuál número es el código de barras y cuál el precio.
    describir(producto) {
      return `${producto.nombre}, código de barras ${producto.codigoBarras}, precio ${producto.precio}`;
    },
  },
};
</script>

<style scoped>
.buscador {
  position: relative;
}

/* La región de estado no tiene caja propia: cada mensaje lleva la suya, y vacía no ocupa lugar. */
.estado {
  margin: 0;
}

/* Un mensaje de estado: superficie blanca con el filete de tinta al 16 % de DESIGN.md, sin sombra. */
.mensaje {
  display: flex;
  min-height: 3.5rem;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  margin: 0.5rem 0 0;
  font-size: 1rem;
  line-height: 1.5rem;
  background: var(--v-surface-base);
  border: 1px solid color-mix(in srgb, var(--v-secondary-base) 16%, transparent);
  border-radius: 0.25rem;
}

.mensaje--buscando {
  padding-block: 0.25rem;
}

.mensaje__icono {
  flex: none;
}

.mensaje__animacion {
  flex: none;
  width: 3rem;
}

/* El error se escribe en tinta, dentro de una franja con el borde y el ícono en el rojo de los errores. */
.mensaje--error {
  background: color-mix(in srgb, var(--v-error-base) 12%, var(--v-surface-base));
  border-color: var(--v-error-base);
}

.mensaje__texto {
  flex: 1 1 12rem;
}

/* La lista de resultados. Con muchos resultados se desplaza por dentro, para que el total de la venta actual no se
   vaya de la pantalla. */
.lista {
  max-height: 26rem;
  padding: 0;
  margin: 0.5rem 0 0;
  overflow-y: auto;
  list-style: none;
  background: var(--v-surface-base);
  border: 1px solid color-mix(in srgb, var(--v-secondary-base) 16%, transparent);
  border-radius: 0.25rem;
}

.lista > li + li {
  border-top: 1px solid color-mix(in srgb, var(--v-secondary-base) 16%, transparent);
}

/* Cada fila es un botón: mide 48 px o más (se usa con el dedo), se alcanza con Tab y se elige con Enter o espacio. */
.resultado {
  display: flex;
  width: 100%;
  min-height: 3rem;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.resultado:hover {
  background: color-mix(in srgb, var(--v-primary-base) 18%, var(--v-surface-base));
}

.resultado:active {
  background: color-mix(in srgb, var(--v-primary-base) 32%, var(--v-surface-base));
}

/* El foco de teclado queda dentro de la fila: un contorno de afuera lo cortaría el borde de la lista. */
.resultado:focus-visible {
  outline: 3px solid var(--v-secondary-base);
  outline-offset: -3px;
}

.resultado__texto {
  flex: 1;
  min-width: 0;
}

/* El nombre y el código de barras pasan a otra línea si no caben: nunca se cortan sin poder leerse. */
.resultado__nombre {
  display: block;
  overflow-wrap: anywhere;
  font-weight: 600;
}

.resultado__codigo {
  display: block;
  overflow-wrap: anywhere;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

/* El precio no se corta: ocupa lo que necesita y el nombre cede el lugar. */
.resultado__precio {
  flex: none;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.nota {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

/* Texto solo para lectores de pantalla: cuántos resultados hay. */
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

/* En un teléfono, "Reintentar" ocupa todo el ancho, al alcance del pulgar. */
@media (max-width: 599px) {
  .mensaje__accion {
    width: 100%;
  }
}
</style>
