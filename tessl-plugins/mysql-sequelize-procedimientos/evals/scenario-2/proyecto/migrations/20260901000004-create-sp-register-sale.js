'use strict';
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../db/procedures/sp_register_sale.sql');
// Send only what sits between the `DELIMITER $$` line and the closing `$$`: the CREATE PROCEDURE … END block.
const block = fs.readFileSync(file, 'utf8').match(/^[ \t]*DELIMITER[ \t]+\$\$[ \t]*\r?\n([\s\S]*?)\$\$[ \t]*\r?$/im);
if (!block) throw new Error(`${file} has no DELIMITER $$ … $$ block`);

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_register_sale');
    await queryInterface.sequelize.query(block[1].trim());
  },
  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_register_sale');
  },
};
