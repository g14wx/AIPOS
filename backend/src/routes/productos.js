'use strict';

const { Router } = require('express');
const { buscarProductos, crearProducto } = require('../controllers/productos');

const router = Router();

router.get('/', buscarProductos);
router.post('/', crearProducto);

module.exports = router;
