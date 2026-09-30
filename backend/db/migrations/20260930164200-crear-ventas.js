'use strict';

// Crea la tabla ventas (spec registrar-venta, tarjeta V-01). La fecha la pone MySQL (RN-12). El total lo
// calcula el procedimiento sp_registrar_venta al registrar la venta (RN-08 y RN-09): esta tabla no lo calcula.
const TABLA = 'ventas';

module.exports = {
  async up(queryInterface, Sequelize) {
    // El motor, el juego de caracteres y el orden van dichos aquí y no se heredan de la base.
    await queryInterface.createTable(
      TABLA,
      {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        // DATETIME en UTC: el servidor de MySQL y la conexión de Sequelize usan +00:00 (RN-12).
        fecha: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        // DECIMAL(12,2), no (10,2): con 100 detalles de 999 × 99 999.99 el total llega a 9 989 999 001.00 (RN-14).
        total: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_0900_ai_ci' },
    );
  },

  // detalles_venta apunta a esta tabla: su migración se deshace antes que esta.
  async down(queryInterface) {
    await queryInterface.dropTable(TABLA);
  },
};
