<template>
  <div class="campo-cantidad">
    <div class="campo-cantidad__fila">
      <v-btn
        class="campo-cantidad__boton px-0"
        outlined
        color="secondary"
        width="44"
        min-width="44"
        height="44"
        :disabled="menosDeshabilitado"
        :aria-label="`Disminuir la cantidad de ${nombre}`"
        @click="cambiarA(value - 1)"
      >
        <v-icon>mdi-minus</v-icon>
      </v-btn>

      <!-- :value y no v-model: el campo muestra lo que escribe el cajero (texto), que puede no ser una cantidad válida.
           El mensaje va aparte, debajo de los tres controles: bajo el campo solo tendría el ancho de tres cifras. -->
      <v-text-field
        class="campo-cantidad__campo"
        :value="texto"
        :aria-label="`Cantidad de ${nombre}`"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error ? idDelError : undefined"
        :error="Boolean(error)"
        :disabled="disabled"
        inputmode="numeric"
        autocomplete="off"
        background-color="surface"
        color="secondary"
        outlined
        dense
        single-line
        hide-details
        @input="alEscribir"
        @blur="alSalir"
      />

      <v-btn
        class="campo-cantidad__boton px-0"
        outlined
        color="secondary"
        width="44"
        min-width="44"
        height="44"
        :disabled="masDeshabilitado"
        :aria-label="`Aumentar la cantidad de ${nombre}`"
        @click="cambiarA(value + 1)"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </div>

    <v-messages
      v-if="error"
      :id="idDelError"
      class="campo-cantidad__error"
      role="alert"
      color="error"
      :value="[error]"
    >
      <template #default="{ message }">
        <v-icon class="campo-cantidad__icono" small color="error">mdi-alert-circle</v-icon>
        {{ message }}
      </template>
    </v-messages>
  </div>
</template>

<script>
import { CANTIDAD_MAXIMA, CANTIDAD_MINIMA, validarCantidad } from '../ventaActual/validaciones.js';

// Cada campo con error necesita un id propio para ligar su mensaje con aria-describedby.
let contador = 0;

// El botón «−», el campo y el botón «+» de la cantidad de un detalle de la venta actual (RF-06). Es un campo controlado
// (Controlled Forms): quien lo usa manda la cantidad válida (value) y el mensaje de error (error), y el campo solo emite
// input con lo que escribió el cajero, tal cual, o con el número nuevo al presionar «+» o «−». No decide nada de la
// venta actual: VentaActual.vue pasa ese valor a cambiarCantidad. Lo único propio es el texto que se ve en el campo,
// porque mientras el cajero escribe puede no ser una cantidad válida y no se le borra.
export default {
  name: 'CampoCantidad',
  props: {
    // La cantidad válida del detalle.
    value: { type: Number, required: true },
    // El mensaje de error del campo, o ''.
    error: { type: String, default: '' },
    // El nombre del producto, para las etiquetas de los tres controles.
    nombre: { type: String, required: true },
    // true mientras V-08 registra la venta.
    disabled: { type: Boolean, default: false },
  },
  data() {
    contador += 1;
    return {
      texto: String(this.value),
      idDelError: `campo-cantidad-error-${contador}`,
    };
  },
  computed: {
    // «−» no baja de 1 (para quitar el producto se usa «Eliminar») y «+» no sube de 999. Se miden con la cantidad válida
    // del detalle, no con el texto que haya en el campo.
    menosDeshabilitado() {
      return this.disabled || this.value <= CANTIDAD_MINIMA;
    },
    masDeshabilitado() {
      return this.disabled || this.value >= CANTIDAD_MAXIMA;
    },
  },
  watch: {
    // Si la cantidad cambia desde afuera (por ejemplo, el cajero agrega otra vez el mismo producto), el campo la
    // muestra, salvo que el cajero esté escribiendo ahí mismo: lo que escribe no se le cambia.
    value(cantidad) {
      if (!this.estaEscribiendo()) this.texto = String(cantidad);
    },
  },
  methods: {
    estaEscribiendo() {
      const campo = this.$el.querySelector('input');
      return campo !== null && !campo.disabled && campo === document.activeElement;
    },
    alEscribir(texto) {
      this.texto = texto;
      this.$emit('input', texto);
    },
    // Al salir del campo, un texto válido se ve normalizado («007» pasa a «7»); uno inválido se deja con su error.
    alSalir() {
      const resultado = validarCantidad(this.texto);
      if (resultado.valido) this.texto = String(resultado.valor);
    },
    // «+» y «−»: siempre parten de la cantidad válida del detalle, nunca del texto que haya en el campo.
    cambiarA(cantidad) {
      this.texto = String(cantidad);
      this.$emit('input', cantidad);
    },
  },
};
</script>

<style scoped>
/* Un contador de unidades: «−», el campo y «+» en una fila de 44 px, y debajo el mensaje si hay error. En línea, para que
   la celda de la tabla lo alinee con su texto (a la derecha en la tabla, a la izquierda en las filas apiladas). */
.campo-cantidad {
  display: inline-flex;
  flex-direction: column;
  vertical-align: top;
}

.campo-cantidad__fila {
  display: flex;
  gap: 0.25rem;
}

/* Los botones llevan el borde del campo en reposo, la tinta al 55 %, y no el turquesa: la acción principal de la pantalla
   es «Registrar venta». Deshabilitados, el filete más tenue de las superficies. */
.campo-cantidad__boton {
  flex: none;
  border-color: color-mix(in srgb, var(--v-secondary-base) 55%, transparent);
}

.campo-cantidad__boton.v-btn--disabled {
  border-color: color-mix(in srgb, var(--v-secondary-base) 16%, transparent);
}

/* El campo de Vuetify trae margen de arriba y un ancho que se estira: aquí mide lo que tres cifras y un cuarto dígito
   de «1000» necesitan, y la misma altura que los botones. */
.campo-cantidad__campo {
  flex: none;
  width: 3.5rem;
  margin: 0;
  padding: 0;
}

/* Las clases repetidas de Vuetify (.v-text-field, .v-input--dense y .v-text-field--outlined) son para ganarle a su regla
   de los campos compactos, que fija el alto en 40 px con cinco clases de especificidad. */
.campo-cantidad__campo.v-text-field.v-input--dense.v-text-field--outlined ::v-deep .v-input__slot {
  min-height: 2.75rem;
  padding: 0 0.25rem;
}

.campo-cantidad__campo ::v-deep input {
  font-size: 1rem;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

/* El mensaje ocupa el ancho de los tres controles y baja de línea: con width 0 y min-width 100% no cuenta para el ancho
   de la celda, y una frase larga no ensancha la columna de la tabla. El texto en tinta lo pone vuetify.css. */
.campo-cantidad__error {
  width: 0;
  min-width: 100%;
  margin-top: 0.25rem;
}

.campo-cantidad__icono {
  vertical-align: text-bottom;
}
</style>
