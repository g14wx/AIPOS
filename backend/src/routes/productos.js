'use strict';

const { Router } = require('express');
const { crearProducto } = require('../controllers/productos');

const router = Router();

router.post('/', crearProducto);

module.exports = router;
