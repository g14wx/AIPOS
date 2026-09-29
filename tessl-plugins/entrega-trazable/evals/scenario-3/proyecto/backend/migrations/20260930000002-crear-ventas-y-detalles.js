'use strict';
module.exports = {
  async up(qi, S) {
    await qi.createTable('ventas', {
      id: { type: S.INTEGER, autoIncrement: true, primaryKey: true },
      total: { type: S.DECIMAL(10, 2), allowNull: false },
      created_at: { type: S.DATE, allowNull: false, defaultValue: S.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: S.DATE, allowNull: false, defaultValue: S.literal('CURRENT_TIMESTAMP') },
    });
    await qi.createTable('detalles_venta', {
      id: { type: S.INTEGER, autoIncrement: true, primaryKey: true },
      venta_id: { type: S.INTEGER, allowNull: false, references: { model: 'ventas', key: 'id' } },
      producto_id: { type: S.INTEGER, allowNull: false, references: { model: 'productos', key: 'id' } },
      precio_aplicado: { type: S.DECIMAL(10, 2), allowNull: false },
      created_at: { type: S.DATE, allowNull: false, defaultValue: S.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: S.DATE, allowNull: false, defaultValue: S.literal('CURRENT_TIMESTAMP') },
    });
  },
  async down(qi) { await qi.dropTable('detalles_venta'); await qi.dropTable('ventas'); },
};
