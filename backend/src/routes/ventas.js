'use strict';

const { Router } = require('express');
const { registrarVenta } = require('../controllers/ventas');

const router = Router();

// Solo POST: registrar una venta es lo único que hace la API con las ventas. Cualquier otro verbo cae en noEncontrado (404).
router.post('/', registrarVenta);

module.exports = router;
