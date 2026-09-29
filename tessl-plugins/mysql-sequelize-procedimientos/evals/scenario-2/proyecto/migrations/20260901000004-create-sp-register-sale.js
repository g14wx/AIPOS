'use strict';
const fs = require('fs');
const path = require('path');

const sql = fs.readFileSync(path.join(__dirname, '../db/procedures/sp_register_sale.sql'), 'utf8');

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_register_sale');
    await queryInterface.sequelize.query(sql);
  },
  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_register_sale');
  },
};
