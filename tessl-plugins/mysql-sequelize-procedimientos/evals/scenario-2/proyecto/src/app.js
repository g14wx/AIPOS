'use strict';
const express = require('express');
const products = require('./routes/products');

const app = express();
app.use(express.json());
app.use('/api/products', products);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode;
  if (status >= 400 && status < 500) return res.status(status).json({ error: err.type || 'BAD_REQUEST' });
  console.error(err);
  res.status(500).json({ error: 'INTERNAL_ERROR' });
});

app.listen(process.env.PORT || 3000);
