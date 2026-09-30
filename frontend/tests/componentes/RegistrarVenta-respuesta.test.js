// Issue #93, de punta a punta: RegistrarVenta.vue con la fachada real (src/api/ventas.js) y http.js reales, y solo el
// adaptador de axios sustituido (sin red). Las pruebas del componente sustituyen registrarVenta y las de la API no montan
// el componente, así que ninguna mostraba qué ve el cajero cuando el servidor responde un 2xx que no es el 201 de la spec.
// Con el 201 de la spec el componente muestra «Venta N registrada · Total X» y emite registrada; con cualquier otra cosa
// muestra el error inesperado, no emite registrada y deja el botón habilitado: la venta actual sigue intacta (RNF-05).
import { afterEach, beforeAll, beforeEach, describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

let vuetify;
let RegistrarVenta;
let http;
let wrapper;
let contenedor;
let consola;

const INESPERADO = 'Ocurrió un error inesperado. Intenta de nuevo.';
const detalles = [
  { productoId: 1, cantidad: 2, precioAplicado: '22.00' },
  { productoId: 2, cantidad: 1, precioAplicado: '3.50' },
];

beforeAll(async () => {
  vi.stubEnv('VITE_API_URL', 'http://localhost:3124');
  // lottie-web no dibuja en jsdom: se sustituye con la ruta exacta que importa AnimacionLottie.
  vi.doMock('lottie-web/build/player/lottie_light', () => ({
    default: { loadAnimation: () => ({ totalFrames: 46, destroy() {}, goToAndStop() {} }) },
  }));
  ({ default: vuetify } = await import('../../src/plugins/vuetify.js'));
  ({ default: http } = await import('../../src/api/http.js'));
  ({ default: RegistrarVenta } = await import('../../src/components/RegistrarVenta.vue'));
});

beforeEach(() => {
  contenedor = document.createElement('div');
  contenedor.setAttribute('data-app', 'true');
  document.body.appendChild(contenedor);
  // RegistrarVenta deja en la consola lo que no viene de la API (un TypeError, por ejemplo): aquí no debe haber nada.
  consola = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  wrapper?.destroy();
  wrapper = null;
  contenedor.remove();
  consola.mockRestore();
});

// El servidor contesta lo que se le pida, con el estado y el cuerpo que se le den, como si axios lo hubiera recibido.
function responderCon(estado, datos) {
  http.defaults.adapter = async (config) => ({
    status: estado,
    statusText: '',
    headers: {},
    config,
    data: datos,
  });
}

async function registrar() {
  wrapper = mount(RegistrarVenta, {
    vuetify,
    propsData: { detalles, valida: true },
    attachTo: contenedor.appendChild(document.createElement('div')),
  });
  const boton = wrapper
    .findAll('button')
    .wrappers.find((candidato) => candidato.text() === 'Registrar venta');
  await boton.trigger('click');
  // El componente espera a la API con await: unos cuantos ciclos dejan que termine y que Vue vuelva a pintar.
  for (let vuelta = 0; vuelta < 6; vuelta += 1) await wrapper.vm.$nextTick();
  return boton;
}

describe('RegistrarVenta con la fachada real y una respuesta 2xx (#93)', () => {
  it('un 201 con { ventaId, total }: «Venta 15 registrada · Total 47.50» y emite registrada', async () => {
    responderCon(201, { ventaId: 15, total: '47.50' });
    await registrar();
    expect(wrapper.find('[role="status"]').text()).toBe('Venta 15 registrada · Total 47.50');
    expect(wrapper.emitted('registrada')).toEqual([[{ ventaId: 15, total: '47.50' }]]);
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(consola).not.toHaveBeenCalled();
  });

  it.each([
    ['un 200 con el cuerpo vacío', 200, ''],
    ['un 202 con el cuerpo vacío', 202, ''],
    ['un 204 sin cuerpo', 204, undefined],
    ['un 200 con el HTML de un proxy', 200, '<html><body>Bienvenido a nginx/1.27</body></html>'],
    ['un 200 con otro JSON', 200, { ok: true }],
    ['un 201 sin total', 201, { ventaId: 15 }],
  ])(
    '%s: muestra el error inesperado, no emite registrada y deja el botón habilitado',
    async (_caso, estado, datos) => {
      responderCon(estado, datos);
      const boton = await registrar();
      expect(wrapper.find('[role="alert"]').text()).toBe(INESPERADO);
      expect(wrapper.find('[role="status"]').text()).toBe('');
      expect(wrapper.emitted('registrada')).toBeUndefined();
      expect(wrapper.text()).not.toMatch(/nginx|html|undefined/i);
      expect(boton.attributes('disabled')).toBeUndefined();
      expect(consola).not.toHaveBeenCalled();
    },
  );
});
