'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sale_items', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      sale_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'sales', key: 'id' } },
      product_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'products', key: 'id' } },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      unit_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      subtotal: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('sale_items', ['sale_id', 'product_id'], {
      unique: true,
      name: 'sale_items_sale_id_product_id_unique',
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('sale_items');
  },
};
