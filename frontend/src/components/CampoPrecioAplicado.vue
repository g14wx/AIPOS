<template>
  <v-text-field
    :value="texto"
    class="campo-precio-aplicado"
    :aria-label="`Precio aplicado de ${nombre}`"
    :aria-invalid="error ? 'true' : null"
    :aria-describedby="error ? idDelMensaje : null"
    inputmode="decimal"
    enterkeyhint="done"
    autocomplete="off"
    :error-messages="error"
    :disabled="disabled"
    background-color="surface"
    color="secondary"
    hide-details="auto"
    outlined
    @input="alEscribir"
    @focus="enfocado = true"
    @blur="alSalir"
    @keydown.enter="mostrarElValorValido"
  >
    <!-- El error lleva un ícono además del borde coral: el mensaje se entiende sin depender solo del color. -->
    <template #message="{ message }">
      <span :id="idDelMensaje" class="campo-precio-aplicado__mensaje">
        <v-icon small color="error">mdi-alert-circle</v-icon>
        <span>{{ message }}</span>
      </span>
    </template>
  </v-text-field>
</template>

<script>
// El campo donde el cajero edita el precio aplicado de un detalle de la venta actual (RF-05). Es un campo controlado
// (value + input): recibe el precio aplicado válido del detalle y el mensaje de error, y solo emite lo que escribió el
// cajero, tal cual. La regla RN-05 no vive aquí sino en src/ventaActual/: quien lo usa la aplica con cambiarPrecioAplicado
// y le devuelve el valor con 2 decimales (value) o el mensaje (error). Es un campo de texto y no type="number", que acepta
// 1e3 y cambia el valor con la rueda del ratón.
export default {
  name: 'CampoPrecioAplicado',
  props: {
    // El precio aplicado válido del detalle, con 2 decimales.
    value: { type: String, required: true },
    // El mensaje de error del campo, o ''.
    error: { type: String, default: '' },
    // El nombre del producto, para la etiqueta accesible: en la tabla el encabezado de la columna no basta.
    nombre: { type: String, required: true },
    // true mientras V-08 registra la venta.
    disabled: { type: Boolean, default: false },
  },
  data() {
    return {
      // Lo que se ve en el campo. Mientras el cajero escribe es lo que escribió, aunque no sea válido, y no se pisa con
      // lo que llega en value (escribir «22.5» no se interrumpe con «22.00» al teclear el «22»).
      texto: this.value,
      enfocado: false,
      // Un id por campo para que aria-describedby apunte al mensaje de su fila.
      idDelMensaje: `error-precio-aplicado-${this._uid}`,
    };
  },
  watch: {
    // Si value cambia desde afuera y el campo no tiene el foco, el campo lo muestra.
    value(nuevo) {
      if (!this.enfocado) this.texto = nuevo;
    },
  },
  methods: {
    alEscribir(texto) {
      this.texto = texto;
      this.$emit('input', texto);
    },
    alSalir() {
      this.enfocado = false;
      this.mostrarElValorValido();
    },
    // Al salir del campo o con Enter: si lo escrito era válido (no hay error), quien usa el campo ya tiene el valor con
    // 2 decimales y el campo lo muestra («22» pasa a «22.00»). Con un error deja lo escrito, con su mensaje.
    mostrarElValorValido() {
      if (!this.error) this.texto = this.value;
    },
  },
};
</script>

<style scoped>
/* La raíz ocupa el ancho de su celda, para que el mensaje de error use ese ancho; el campo mide 7.5 rem. Sin el margen
   con que Vuetify deja lugar a la etiqueta y a la ayuda: es un campo compacto para la celda de una tabla. */
.campo-precio-aplicado {
  width: 100%;
  padding-top: 0;
  margin: 0;
}

/* El campo mide al menos 44 px de alto (se usa con el dedo) y lo justo para 99999.99. */
.campo-precio-aplicado ::v-deep .v-input__control > .v-input__slot {
  width: 7.5rem;
  max-width: 100%;
  min-height: 2.75rem;
}

/* En la tabla ancha, la celda está alineada al final (text-end): el campo queda a la derecha, bajo su encabezado y junto
   a las demás cifras. En las filas apiladas la celda mide lo que el campo y no hay nada que alinear. */
td.text-end .campo-precio-aplicado ::v-deep .v-input__slot {
  margin-left: auto;
}

td.text-end .campo-precio-aplicado__mensaje {
  justify-content: flex-end;
}

/* El precio aplicado va a la derecha y en cifras del mismo ancho, para que los decimales queden en columna. */
.campo-precio-aplicado ::v-deep input {
  font-variant-numeric: tabular-nums;
  text-align: right;
}

/* El mensaje de error: el ícono coral fijo a la izquierda y el texto en tinta (vuetify.css) que pasa a otra línea. */
.campo-precio-aplicado__mensaje {
  display: flex;
  gap: 0.25rem;
  align-items: flex-start;
  padding-top: 0.25rem;
}

.campo-precio-aplicado__mensaje .v-icon {
  flex: none;
  margin-top: 0.125rem;
}
</style>
