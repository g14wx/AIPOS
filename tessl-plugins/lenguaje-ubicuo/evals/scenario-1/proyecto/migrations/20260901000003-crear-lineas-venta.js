'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lineas_venta', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      venta_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'ventas', key: 'id' } },
      producto_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'productos', key: 'id' } },
      precio_aplicado: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('lineas_venta');
  },
};
