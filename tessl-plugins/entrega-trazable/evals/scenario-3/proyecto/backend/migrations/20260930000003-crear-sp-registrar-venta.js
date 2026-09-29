'use strict';
const fs = require('fs');
const path = require('path');

const sql = fs.readFileSync(path.join(__dirname, '../db/procedures/sp_registrar_venta.sql'), 'utf8');

module.exports = {
  async up(qi) {
    await qi.sequelize.query('DROP PROCEDURE IF EXISTS sp_registrar_venta');
    await qi.sequelize.query(sql);
  },
  async down(qi) {
    await qi.sequelize.query('DROP PROCEDURE IF EXISTS sp_registrar_venta');
  },
};
