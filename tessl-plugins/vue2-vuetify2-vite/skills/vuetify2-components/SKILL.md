---
name: vuetify2-components
description: "Builds Vue 2.7 + Vuetify 2 screens with the correct v2 props, slots and events and with Vue 2 reactivity, for example a point-of-sale screen with product search, a table of editable sale lines, a total, a confirmation dialog, forms and snackbars. Covers v-data-table headers and item slots, v-autocomplete with server search, v-dialog activators, v-form validation, v-snackbar, custom v-model with value and input, and array updates with splice or $set. Use when writing or reviewing .vue components in a Vue 2 or Vuetify 2 project, when a Vuetify prop or slot seems to do nothing, when a table does not update after a change, or when porting a Vue 3 or Vuetify 3 example to Vue 2."
---

# Vuetify 2 components (Vue 2.7)

Most examples online are Vue 3 or Vuetify 3. In Vuetify 2 their props do nothing, their slots never render, and some tags do not exist. Write components with the Options API, as the Vuetify 2 docs do. The names below are examples; use the project's glossary terms.

## Vue 3 / Vuetify 3 habit and its Vue 2 / Vuetify 2 form

| Don't (Vue 3 / Vuetify 3) | Do (Vue 2 / Vuetify 2) |
|---|---|
| Several root nodes, `<Teleport>` | Exactly one root element per template |
| `modelValue` + `update:modelValue`, `defineModel`, `v-model:discount="d"` | Prop `value` + event `input` (or `model: { prop, event }`). Other props use `:discount.sync="d"` + `$emit('update:discount', v)` |
| `beforeUnmount`, `unmounted` | `beforeDestroy`, `destroyed` |
| `key` on `<template v-for>` | `key` on its children |
| Headers `{ title, key }` | Headers `{ text, value, align, sortable }` |
| `item.raw` or `item.columns` in `#item.x` | `#item.x="{ item }"`, where `item` is the row itself |
| `@click:row="(event, { item }) => ..."` | `@click:row="(item, data, event) => ..."` |
| `item-title` | `item-text` + `item-value` |
| `v-model:search` | `:search-input.sync="query"` |
| `#activator="{ props }"` + `v-bind="props"` | `#activator="{ on, attrs }"` + `v-bind="attrs" v-on="on"` |
| `variant="outlined"`, `variant="text"`, `density="compact"`, `size="small"`, `bg-color`, `location="top right"`, `<v-table>`, `text-primary` | `outlined`, `text`, `dense`, `small`, `background-color`, `top right`, `<v-simple-table>`, `primary--text` |
| `v-snackbar` `#actions` slot | `#action="{ attrs }"` slot, `timeout` in ms (`-1` stays open) |
| `const { valid } = await form.validate()` | `this.$refs.form.validate()` returns a boolean right away |

Also: never put `v-if` and `v-for` on the same element, set `item-key` when rows have no `id` field (the default key), and format money with methods, not filters.

## Reactivity

Vue 2 does not see index assignment, length changes or new keys. Changing a key that already exists (`line.price = 9`) is detected, so create each object with all its keys.
```js
this.lines[i] = line;    // not detected -> this.lines.splice(i, 1, line)
this.lines.length = 0;   // not detected -> this.lines.splice(0) or this.lines = []
this.line.discount = 5;  // new key, not detected -> this.$set(this.line, 'discount', 5)
```

## Example: point-of-sale screen

```vue
<template>
  <v-card>
    <v-card-text>
      <v-autocomplete v-model="selected" :items="results" :search-input.sync="query" :loading="searching"
        item-text="name" item-value="id" return-object no-filter hide-no-data clearable
        label="Search by name or barcode" @change="addLine" />
      <v-data-table :headers="headers" :items="lines" item-key="productId" hide-default-footer disable-pagination>
        <template #item.price="{ item }"><v-text-field v-model.number="item.price" type="number" dense hide-details /></template>
        <template #item.subtotal="{ item }">{{ money(item.price * item.quantity) }}</template>
        <template #item.actions="{ item }"><v-btn icon small @click="removeLine(item)"><v-icon>mdi-delete</v-icon></v-btn></template>
      </v-data-table>
      <div class="text-h5 text-right my-4">Total: {{ money(total) }}</div>
      <v-dialog v-model="confirming" max-width="400">
        <template #activator="{ on, attrs }">
          <v-btn color="primary" depressed :disabled="!lines.length" v-bind="attrs" v-on="on">Register sale</v-btn>
        </template>
        <v-card>
          <v-card-title>Register the sale for {{ money(total) }}?</v-card-title>
          <v-card-actions><v-spacer /><v-btn text @click="confirming = false">Cancel</v-btn>
            <v-btn color="primary" depressed :loading="saving" @click="register">Confirm</v-btn></v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-text>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="4000" top right>
      {{ snackbar.text }}
      <template #action="{ attrs }"><v-btn text v-bind="attrs" @click="snackbar.show = false">Close</v-btn></template>
    </v-snackbar>
  </v-card>
</template>

<script>
import { searchProducts } from '../api/products';
import { registerSale } from '../api/sales';
export default {
  name: 'PointOfSale',
  data: () => ({
    query: null, selected: null, results: [], lines: [], searching: false, saving: false, confirming: false,
    snackbar: { show: false, text: '', color: '' },
    headers: [
      { text: 'Product', value: 'name' }, { text: 'Quantity', value: 'quantity', align: 'end' },
      { text: 'Price', value: 'price', width: 140 }, { text: 'Subtotal', value: 'subtotal', align: 'end', sortable: false },
      { text: '', value: 'actions', sortable: false },
    ],
  }),
  computed: { total() { return this.lines.reduce((sum, line) => sum + Number(line.price) * line.quantity, 0); } },
  watch: {
    query(text) { // debounced server search
      clearTimeout(this.timer);
      if (text && text.length >= 2) this.timer = setTimeout(() => this.search(text), 300);
    },
  },
  beforeDestroy() { clearTimeout(this.timer); },
  methods: {
    async search(text) {
      this.searching = true;
      try { this.results = await searchProducts(text); } catch (error) { this.notify(error.message, 'error'); }
      this.searching = false;
    },
    addLine(product) {
      if (!product) return;
      const line = this.lines.find((l) => l.productId === product.id);
      if (line) line.quantity += 1;
      else this.lines.push({ productId: product.id, name: product.name, price: Number(product.price), quantity: 1 });
      this.$nextTick(() => { this.selected = null; });
    },
    removeLine(line) { // the slot index follows sorting and paging, so find the line
      const i = this.lines.indexOf(line); if (i !== -1) this.lines.splice(i, 1);
    },
    async register() {
      this.saving = true;
      try {
        await registerSale({ lines: this.lines.map(({ productId, quantity, price }) => ({ productId, quantity, price })) });
        this.lines.splice(0);
        this.notify('Sale registered', 'success');
      } catch (error) { this.notify(error.message, 'error'); } // keep the lines so the cashier can retry
      this.saving = false; this.confirming = false;
    },
    notify(text, color) { this.snackbar = { show: true, text, color }; },
    money(value) { return Number(value || 0).toFixed(2); },
  },
};
</script>
```

## Custom v-model

A child used as `<price-field v-model="line.price" />` takes prop `value` and emits `input`:
```vue
<template><v-text-field :value="value" type="number" dense hide-details @input="$emit('input', Number($event))" /></template>
<script>
export default { name: 'PriceField', props: { value: { type: Number, default: 0 } } };
</script>
```
