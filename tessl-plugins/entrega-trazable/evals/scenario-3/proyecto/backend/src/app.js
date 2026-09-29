'use strict';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productos = require('./routes/productos');
const ventas = require('./routes/ventas');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/productos', productos);
app.use('/api/ventas', ventas);

app.listen(process.env.PORT || 3000);
