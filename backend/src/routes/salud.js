'use strict';

const { Router } = require('express');
const { obtenerSalud } = require('../controllers/salud');

const router = Router();

router.get('/', obtenerSalud);

module.exports = router;
