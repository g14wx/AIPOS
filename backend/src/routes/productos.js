'use strict';

const { Router } = require('express');
const { buscarProductos } = require('../controllers/productos');

const router = Router();

router.get('/', buscarProductos);

module.exports = router;
