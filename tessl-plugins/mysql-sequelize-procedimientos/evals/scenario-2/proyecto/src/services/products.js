'use strict';
const { sequelize } = require('../db');
const { Product } = require('../models/product');

async function listProducts() {
  return Product.findAll({ order: [['name', 'ASC']] });
}

// All price changes are saved together or not at all.
async function updatePrices(changes) {
  await sequelize.transaction(async (transaction) => {
    for (const { productId, price } of changes) {
      await Product.update({ price }, { where: { id: productId }, transaction });
    }
  });
}

module.exports = { listProducts, updatePrices };
