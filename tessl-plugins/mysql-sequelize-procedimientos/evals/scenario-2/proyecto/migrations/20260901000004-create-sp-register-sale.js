'use strict';
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../db/procedures/sp_register_sale.sql');
// Only the CREATE PROCEDURE … END block: DELIMITER is a command of the mysql client, not SQL.
const create = fs.readFileSync(file, 'utf8').match(/CREATE PROCEDURE[\s\S]*?\bEND(?=\s*\$\$)/i);
if (!create) throw new Error(`${file} has no CREATE PROCEDURE … END$$ block`);

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_register_sale');
    await queryInterface.sequelize.query(create[0]);
  },
  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_register_sale');
  },
};
