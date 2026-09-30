import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const modelos = require('../../src/models/index.js');

// No necesita MySQL: solo lee cómo están definidos los modelos. Es la prueba de la spec de arquitectura,
// sección "Capas": los modelos se crean con tableName explícito, freezeTableName, underscored y sin timestamps.
// Es una prueba parametrizada: corre lo mismo por cada modelo registrado, así que Venta y DetalleVenta
// entran solos cuando su tarjeta los agregue a models/index.js. Solo hay que sumarlos al mapa del glosario.
const carpetaModelos = path.resolve(import.meta.dirname, '..', '..', 'src', 'models');

// Los nombres de las tablas que fija el glosario (docs/lenguaje-ubicuo.md), por nombre de modelo.
const tablasDelGlosario = {
  Producto: 'productos',
  Venta: 'ventas',
  DetalleVenta: 'detalles_venta',
};

const registrados = Object.values(modelos.sequelize.models);

const aSnakeCase = (texto) => texto.replace(/[A-Z]/g, (letra) => `_${letra.toLowerCase()}`);

describe('los modelos registrados en src/models/index.js', () => {
  it('hay al menos uno, y cada archivo de src/models/ (menos index.js) exporta un modelo que index.js también exporta', () => {
    expect(registrados.length).toBeGreaterThan(0);
    const archivos = fs
      .readdirSync(carpetaModelos)
      .filter((n) => n.endsWith('.js') && n !== 'index.js');
    expect(archivos.length).toBeGreaterThan(0);
    for (const archivo of archivos) {
      const modelo = require(path.join(carpetaModelos, archivo));
      expect(modelos[modelo.name], `index.js no exporta el modelo de ${archivo}`).toBe(modelo);
    }
  });
});

describe.each(registrados.map((modelo) => [modelo.name, modelo]))(
  'el modelo %s',
  (nombre, modelo) => {
    it('usa el nombre de tabla del glosario, fijado con tableName y freezeTableName', () => {
      expect(tablasDelGlosario[nombre], `el modelo ${nombre} no está en el glosario`).toBeDefined();
      expect(modelo.tableName).toBe(tablasDelGlosario[nombre]);
      expect(modelo.options.freezeTableName).toBe(true);
    });

    it('usa underscored y no tiene timestamps', () => {
      expect(modelo.options.underscored).toBe(true);
      expect(modelo.options.timestamps).toBe(false);
    });

    it('no tiene createdAt ni updatedAt: la única fecha del sistema es ventas.fecha', () => {
      const atributos = Object.entries(modelo.getAttributes());
      const prohibidos = ['createdAt', 'updatedAt', 'created_at', 'updated_at'];
      for (const [atributo, definicion] of atributos) {
        expect(prohibidos, `atributo ${atributo}`).not.toContain(atributo);
        expect(prohibidos, `columna ${definicion.field}`).not.toContain(definicion.field);
      }
    });

    it('cada atributo va en camelCase y su columna en snake_case', () => {
      for (const [atributo, definicion] of Object.entries(modelo.getAttributes())) {
        expect(atributo, `atributo ${atributo}`).toMatch(/^[a-z][a-zA-Z0-9]*$/);
        expect(definicion.field, `columna de ${atributo}`).toBe(aSnakeCase(atributo));
      }
    });
  },
);
