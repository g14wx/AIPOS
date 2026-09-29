'use strict';
module.exports = {
  async up(qi, S) {
    await qi.createTable('productos', {
      id: { type: S.INTEGER, autoIncrement: true, primaryKey: true },
      nombre: { type: S.STRING(120), allowNull: false },
      precio: { type: S.DECIMAL(10, 2), allowNull: false },
      codigo_barras: { type: S.STRING(64), allowNull: false, unique: true },
      created_at: { type: S.DATE, allowNull: false, defaultValue: S.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: S.DATE, allowNull: false, defaultValue: S.literal('CURRENT_TIMESTAMP') },
    });
  },
  async down(qi) { await qi.dropTable('productos'); },
};
