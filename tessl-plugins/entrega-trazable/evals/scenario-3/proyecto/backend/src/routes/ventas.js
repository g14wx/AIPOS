'use strict';
const { Router } = require('express');
const { registrarVenta } = require('../services/ventas');

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const venta = await registrarVenta(req.body.detalles);
    res.status(201).json(venta);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
