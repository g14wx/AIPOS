<template>
  <v-dialog
    ref="dialogo"
    :value="value"
    :persistent="persistente"
    :fullscreen="pantallaCompleta"
    :transition="pantallaCompleta ? 'dialog-bottom-transition' : 'dialog-transition'"
    max-width="480"
    overlay-color="secondary"
    :overlay-opacity="0.5"
    @input="$emit('input', $event)"
  >
    <v-card
      ref="tarjeta"
      flat
      class="formulario"
      :class="{ 'formulario--completo': pantallaCompleta }"
      @keydown.native.tab="darLaVueltaAlFoco"
    >
      <h2 :id="idDelTitulo" class="formulario__titulo">Nuevo producto</h2>

      <!-- lazy-validation y validate-on-blur: nada se marca antes de que el cajero salga de un campo o presione
           "Guardar". La clave nueva en cada apertura deja los campos como recién creados. -->
      <v-form :key="apertura" lazy-validation class="formulario__cuerpo" @submit.prevent="guardar">
        <div class="formulario__campos">
          <v-alert v-if="franja" type="error" text dense class="formulario__franja">{{
            franja
          }}</v-alert>

          <v-text-field
            ref="nombre"
            v-model="valores.nombre"
            label="Nombre"
            :rules="reglas.nombre"
            :error-messages="errores.nombre"
            :aria-invalid="marca('nombre')"
            aria-required="true"
            :counter="largos.nombre"
            autocomplete="off"
            background-color="surface"
            color="secondary"
            outlined
            validate-on-blur
            @input="borrarError('nombre')"
            @blur="alSalir('nombre')"
          />
          <v-text-field
            ref="precio"
            v-model="valores.precio"
            label="Precio"
            hint="Con punto decimal, por ejemplo 25.50"
            persistent-hint
            inputmode="decimal"
            class="formulario__precio"
            :rules="reglas.precio"
            :error-messages="errores.precio"
            :aria-invalid="marca('precio')"
            aria-required="true"
            autocomplete="off"
            background-color="surface"
            color="secondary"
            outlined
            validate-on-blur
            @input="borrarError('precio')"
            @blur="alSalir('precio')"
          />
          <v-text-field
            ref="codigoBarras"
            v-model="valores.codigoBarras"
            label="Código de barras"
            :rules="reglas.codigoBarras"
            :error-messages="errores.codigoBarras"
            :aria-invalid="marca('codigoBarras')"
            aria-required="true"
            :counter="largos.codigoBarras"
            autocomplete="off"
            background-color="surface"
            color="secondary"
            outlined
            validate-on-blur
            @input="borrarError('codigoBarras')"
            @blur="alSalir('codigoBarras')"
          />
        </div>

        <div class="formulario__acciones">
          <v-btn text large :disabled="guardando" @click="cancelar">Cancelar</v-btn>
          <v-btn
            ref="guardar"
            type="submit"
            color="primary"
            large
            depressed
            :disabled="guardando"
            :loading="guardando"
          >
            Guardar
          </v-btn>
        </div>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import { crearProducto } from '../api/productos.js';
import {
  CAMPOS,
  LARGO_MAXIMO_CODIGO_BARRAS,
  LARGO_MAXIMO_NOMBRE,
  leerErrorDeLaApi,
  limpiarProducto,
  primerMensaje,
  reglasCodigoBarras,
  reglasNombre,
  reglasPrecio,
  revisarProducto,
} from '../reglasProducto.js';

const vacio = () => Object.fromEntries(CAMPOS.map((campo) => [campo, '']));

// El modal con el formulario de producto. Recibe `value` (si está abierto) y emite `input` (para abrir o cerrar) y
// `creado`, con el producto que devolvió la API. Quien lo abre decide qué mostrar cuando se crea (Domain Event).
// Lo que la API o la red contesten nunca borra lo escrito (RNF-05).
export default {
  name: 'FormularioProducto',
  props: {
    value: { type: Boolean, default: false },
  },
  data() {
    return {
      idDelTitulo: 'formulario-producto-titulo',
      // Lo que escribió el cajero, y el mensaje que se ve junto a cada campo: sale de "Guardar", de la API o de salir
      // del campo (alSalir). Un campo tiene error, y aria-invalid, mientras su mensaje no esté vacío.
      valores: vacio(),
      errores: vacio(),
      // El mensaje de la franja de error: red caída, un 500 o un campo que la pantalla no conoce.
      franja: '',
      guardando: false,
      // Sube cada vez que se abre el modal: es la clave del formulario, que así empieza limpio.
      apertura: 0,
      reglas: { nombre: reglasNombre, precio: reglasPrecio, codigoBarras: reglasCodigoBarras },
      largos: { nombre: LARGO_MAXIMO_NOMBRE, codigoBarras: LARGO_MAXIMO_CODIGO_BARRAS },
    };
  },
  computed: {
    hayTexto() {
      return CAMPOS.some((campo) => this.valores[campo] !== '');
    },
    // Con texto escrito o guardando, un clic fuera o Esc no lo cierran: lo escrito no se pierde por un descuido, y
    // cerrarlo no cancelaría la petición.
    persistente() {
      return this.guardando || this.hayTexto;
    },
    pantallaCompleta() {
      return this.$vuetify.breakpoint.xsOnly;
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(abierto) {
        if (abierto) this.alAbrir();
        // Si se cierra antes de que llegue el foco a "Nombre", el foco ya no va.
        else clearTimeout(this.temporizador);
      },
    },
  },
  beforeDestroy() {
    clearTimeout(this.temporizador);
  },
  methods: {
    alAbrir() {
      this.vaciar();
      this.apertura += 1;
      // Cuando termina de abrir, Vuetify mueve el contenido del modal y le da el foco a la ventana. El foco al campo
      // Nombre va después de eso, y en una tarea aparte para que no se lo quite.
      clearTimeout(this.temporizador);
      this.temporizador = setTimeout(() => {
        this.enlazarTitulo();
        this.enfocar('nombre');
      }, 0);
    },
    // v-dialog pone role="dialog" en su contenido y no deja pasarle aria-labelledby: se lo pone aquí.
    enlazarTitulo() {
      const contenido = this.$refs.dialogo?.$refs.content;
      if (contenido) contenido.setAttribute('aria-labelledby', this.idDelTitulo);
    },
    enfocar(campo) {
      this.$refs[campo]?.focus();
    },
    // El foco da la vuelta dentro del modal: Tab desde el último elemento va al primero, y Shift+Tab desde el primero va
    // al último. Vuetify solo lo devuelve cuando el foco ya cayó fuera, y ese primer Tab se pierde en el navegador.
    darLaVueltaAlFoco(evento) {
      const enfocables = [...this.$refs.tarjeta.$el.querySelectorAll('input, button')].filter(
        (elemento) => !elemento.disabled,
      );
      if (enfocables.length === 0) return;
      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
      } else if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
      }
    },
    vaciar() {
      this.valores = vacio();
      this.errores = vacio();
      this.franja = '';
    },
    cerrar() {
      this.$emit('input', false);
      this.vaciar();
    },
    cancelar() {
      this.cerrar();
    },
    // El mensaje de un campo se quita cuando el cajero lo edita.
    borrarError(campo) {
      if (this.errores[campo]) this.errores = { ...this.errores, [campo]: '' };
    },
    // Vuetify 2 no marca aria-invalid en el campo, y el mensaje de sus reglas desaparece en cuanto el campo vuelve a
    // tener el foco. Al salir de un campo se copia el mensaje de sus reglas a `errores`: se queda a la vista hasta que
    // el cajero lo edite, y el campo se marca con aria-invalid para los lectores de pantalla.
    alSalir(campo) {
      if (!this.value) return;
      const mensaje = primerMensaje(this.reglas[campo], this.valores[campo]);
      if (mensaje !== this.errores[campo]) this.errores = { ...this.errores, [campo]: mensaje };
    },
    marca(campo) {
      return this.errores[campo] ? 'true' : null;
    },
    async guardar() {
      // La bandera se marca antes de esperar nada: un doble clic o un doble Enter mandan una sola petición, aun antes
      // de que el botón se vuelva a pintar deshabilitado.
      if (this.guardando) return;
      const mensajes = revisarProducto(this.valores);
      const primero = CAMPOS.find((campo) => mensajes[campo] !== '');
      if (primero) {
        this.errores = mensajes;
        this.franja = '';
        this.$nextTick(() => this.enfocar(primero));
        return;
      }
      this.guardando = true;
      this.errores = vacio();
      this.franja = '';
      try {
        const producto = await crearProducto(limpiarProducto(this.valores));
        this.$emit('creado', producto);
        this.cerrar();
      } catch (error) {
        this.mostrarError(error);
      } finally {
        this.guardando = false;
      }
    },
    mostrarError(error) {
      // Un error que no viene de la API es un fallo de programación: queda en la consola y el cajero ve el aviso genérico.
      if (!(error instanceof Error) || typeof error.status !== 'number') console.error(error);
      const { campos, franja } = leerErrorDeLaApi(error);
      this.errores = { ...vacio(), ...campos };
      this.franja = franja;
      // El foco va al primer campo con error. Sin campos, vuelve a "Guardar" para reintentar con los mismos datos.
      const primero = CAMPOS.find((campo) => campos[campo]);
      this.$nextTick(() => (primero ? this.enfocar(primero) : this.$refs.guardar?.$el.focus()));
    },
  },
};
</script>

<style scoped>
.formulario {
  display: flex;
  flex-direction: column;
  background: var(--v-surface-base);
  border-radius: 0.25rem;
}

.formulario__titulo {
  padding: 1rem 1.25rem;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.75rem;
  border-bottom: 1px solid color-mix(in srgb, var(--v-secondary-base) 16%, transparent);
}

.formulario__cuerpo {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.formulario__campos {
  flex: 1;
  padding: 1.5rem 1.25rem 0.5rem;
}

.formulario__franja {
  margin-bottom: 1.25rem;
}

.formulario__precio ::v-deep input {
  font-variant-numeric: tabular-nums;
}

/* Aire entre un campo y el siguiente: el mensaje de error o la ayuda no pegan con el campo de abajo. */
.formulario__campos ::v-deep .v-text-field + .v-text-field {
  margin-top: 0.5rem;
}

.formulario__acciones {
  position: sticky;
  bottom: 0;
  display: flex;
  background: var(--v-surface-base);
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 0.75rem 1.25rem max(1.25rem, env(safe-area-inset-bottom));
}

/* En un teléfono el modal ocupa toda la pantalla y los dos botones se reparten el ancho, al alcance del pulgar. */
.formulario--completo .formulario__acciones > .v-btn {
  flex: 1;
}
</style>
