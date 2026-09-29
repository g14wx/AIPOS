'use strict';
const express = require('express');
const products = require('./routes/products');

const app = express();
app.use(express.json());
app.use('/api/products', products);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'INTERNAL_ERROR' });
});

app.listen(process.env.PORT || 3000);
