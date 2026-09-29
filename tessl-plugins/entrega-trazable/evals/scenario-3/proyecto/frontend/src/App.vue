<template>
  <v-app>
    <v-main>
      <v-container>
        <v-btn color="primary" @click="dialogoProducto = true">Agregar producto</v-btn>
        <v-autocomplete v-model="seleccionado" :items="resultados" :search-input.sync="busqueda"
          item-text="nombre" item-value="id" return-object label="Buscar por nombre o código de barras" />
        <v-data-table :headers="encabezados" :items="detalles" item-key="productoId">
          <template #item.precioAplicado="{ item }">
            <v-text-field v-model="item.precioAplicado" dense type="number" />
          </template>
          <template #item.acciones="{ index }">
            <v-btn icon @click="detalles.splice(index, 1)"><v-icon>mdi-delete</v-icon></v-btn>
          </template>
        </v-data-table>
        <div class="text-h5">Total: {{ total }}</div>
        <v-btn color="success" :disabled="!detalles.length" @click="registrarVenta">Registrar venta</v-btn>
      </v-container>
    </v-main>
  </v-app>
</template>
