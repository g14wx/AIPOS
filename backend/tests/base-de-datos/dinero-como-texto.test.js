import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { DataTypes } = require('sequelize');
const sequelize = require('../../src/database.js');

// El dinero es un texto en JavaScript ("25.00"), en la API y en el backend. Necesita MySQL levantado.
// Las pruebas usan una tabla temporal, que vive solo en su conexión y no deja nada en la base:
// por eso cada una corre dentro de una transacción administrada.
async function conTablaDeDinero(trabajo) {
  return sequelize.transaction(async (transaccion) => {
    const consultar = async (sql, opciones = {}) => {
      const [filas] = await sequelize.query(sql, { ...opciones, transaction: transaccion });
      return filas;
    };
    // El pool reutiliza conexiones: la tabla temporal de una prueba seguiría viva en la siguiente.
    await consultar('DROP TEMPORARY TABLE IF EXISTS prueba_dinero');
    await consultar(`CREATE TEMPORARY TABLE prueba_dinero (
      id INT AUTO_INCREMENT PRIMARY KEY,
      precio DECIMAL(10,2) NOT NULL,
      cantidad INT NOT NULL,
      subtotal DECIMAL(12,2) NOT NULL
    )`);
    try {
      return await trabajo(consultar, transaccion);
    } finally {
      await consultar('DROP TEMPORARY TABLE IF EXISTS prueba_dinero');
    }
  });
}

describe('el dinero llega como texto', () => {
  it('no activa decimalNumbers en la instancia de Sequelize', () => {
    expect(sequelize.options.dialectOptions?.decimalNumbers).toBeFalsy();
  });

  it('DECIMAL(10,2) vuelve como texto con 2 decimales', async () => {
    const filas = await conTablaDeDinero(async (consultar) => {
      await consultar('INSERT INTO prueba_dinero (precio, cantidad, subtotal) VALUES (25, 1, 25)');
      return consultar('SELECT precio FROM prueba_dinero');
    });
    expect(filas[0].precio).toBe('25.00');
    expect(typeof filas[0].precio).toBe('string');
  });

  it('el precio máximo (99999.99) y el subtotal máximo de DECIMAL(12,2) no pierden centavos', async () => {
    const filas = await conTablaDeDinero(async (consultar) => {
      await consultar(
        "INSERT INTO prueba_dinero (precio, cantidad, subtotal) VALUES ('99999.99', 999, '99899990.01')",
      );
      return consultar('SELECT precio, subtotal FROM prueba_dinero');
    });
    expect(filas[0]).toEqual({ precio: '99999.99', subtotal: '99899990.01' });
  });

  it('el subtotal se calcula en SQL con ROUND y sale como texto', async () => {
    const filas = await conTablaDeDinero(async (consultar) => {
      await consultar(
        "INSERT INTO prueba_dinero (precio, cantidad, subtotal) VALUES ('22.50', 2, 0), ('2.75', 1, 0)",
      );
      await consultar('UPDATE prueba_dinero SET subtotal = ROUND(precio * cantidad, 2)');
      return consultar('SELECT subtotal FROM prueba_dinero ORDER BY id');
    });
    expect(filas).toEqual([{ subtotal: '45.00' }, { subtotal: '2.75' }]);
  });

  it('el total (SUM) lo suma MySQL: 0.10 + 0.20 da "0.30" y no 0.30000000000000004', async () => {
    const filas = await conTablaDeDinero(async (consultar) => {
      await consultar(
        "INSERT INTO prueba_dinero (precio, cantidad, subtotal) VALUES ('0.10', 1, '0.10'), ('0.20', 1, '0.20')",
      );
      return consultar('SELECT SUM(subtotal) AS total FROM prueba_dinero');
    });
    expect(filas[0].total).toBe('0.30');
    expect(typeof filas[0].total).toBe('string');
  });

  it('un total de varios subtotales grandes cabe en DECIMAL(12,2)', async () => {
    const filas = await conTablaDeDinero(async (consultar) => {
      await consultar(
        `INSERT INTO prueba_dinero (precio, cantidad, subtotal)
         VALUES ('99999.99', 999, '99899990.01'), ('99999.99', 999, '99899990.01')`,
      );
      return consultar('SELECT SUM(subtotal) AS total FROM prueba_dinero');
    });
    expect(filas[0].total).toBe('199799980.02');
  });

  it('una columna DECIMAL(10,2) de un modelo de Sequelize también devuelve texto', async () => {
    await conTablaDeDinero(async (consultar, transaccion) => {
      const Precio = sequelize.define(
        'PruebaDinero',
        {
          precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
          cantidad: { type: DataTypes.INTEGER, allowNull: false },
          subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        },
        { tableName: 'prueba_dinero', freezeTableName: true, timestamps: false },
      );
      await Precio.create(
        { precio: '12.50', cantidad: 2, subtotal: '25.00' },
        { transaction: transaccion },
      );
      const fila = await Precio.findOne({ transaction: transaccion, raw: true });
      expect(fila.precio).toBe('12.50');
      expect(fila.subtotal).toBe('25.00');
      sequelize.modelManager.removeModel(Precio);
    });
  });

  it('MySQL solo avisa cuando recibe 3 decimales: no falla, redondea (por eso la API los rechaza antes)', async () => {
    const filas = await conTablaDeDinero(async (consultar) => {
      await consultar(
        "INSERT INTO prueba_dinero (precio, cantidad, subtotal) VALUES ('10.999', 1, 0)",
      );
      return consultar('SELECT precio FROM prueba_dinero');
    });
    expect(filas[0].precio).toBe('11.00');
  });
});
