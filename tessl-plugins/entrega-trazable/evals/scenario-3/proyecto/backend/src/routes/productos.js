'use strict';
const { Router } = require('express');
const { agregarProducto, buscarProductos } = require('../services/productos');

const router = Router();
router.get('/', async (req, res) => res.json(await buscarProductos(req.query.q || '')));
router.post('/', async (req, res) => res.status(201).json(await agregarProducto(req.body)));

module.exports = router;
