'use strict';
const { Router } = require('express');
const { listProducts, updatePrices } = require('../services/products');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    res.json(await listProducts());
  } catch (err) {
    next(err);
  }
});

router.patch('/prices', async (req, res, next) => {
  try {
    await updatePrices(req.body.changes);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
