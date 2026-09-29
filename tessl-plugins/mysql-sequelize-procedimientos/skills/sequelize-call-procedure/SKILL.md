---
name: sequelize-call-procedure
description: "Calls MySQL stored procedures from Node with Sequelize 6 and mysql2 and turns their errors into HTTP responses in Express. Covers CALL with named replacements and JSON.stringify for lists, reading rows[0], why QueryTypes.SELECT, OUT parameters and sequelize.transaction() break a CALL, errno mapping (1644, 1452, 3140, 1062) to 400, 404 and 409, money kept as DECIMAL strings, and safe name or barcode search with Op symbols. Use when writing a service or route that runs CALL, when a CALL returns nested arrays, objects with numeric keys or undefined, when adding status codes for procedure errors, when someone wants to wrap a procedure call in a transaction, or when searching products by name or barcode."
---

# Calling a stored procedure from Sequelize

For `sequelize` ^6.37.8 with `mysql2` ^3.24.5 and Express 4. Never import from `@sequelize/*` (v7 is still an alpha).

## 1. Service

```js
'use strict';
const { sequelize } = require('../db');

async function registerSale(items) {
  const rows = await sequelize.query('CALL sp_register_sale(:items)', {
    replacements: { items: JSON.stringify(items) },
  });
  return rows[0]; // { saleId: 12, total: '39.80' }
}

module.exports = { registerSale };
```

- For SQL that starts with `CALL`, Sequelize (default query type) returns the rows of the first result set, not `[results, metadata]`. `rows[0]` is the first row of the procedure's final `SELECT`.
- Nothing before `CALL`, not even a comment: Sequelize detects a call by the SQL starting with `CALL`.
- Always `JSON.stringify` lists. In `replacements`, an array expands into a comma-separated list and a plain object throws.
- No `type: QueryTypes.SELECT`: it returns objects with numeric keys and throws when the procedure returns no rows.
- No `OUT` parameters: reading them needs `SELECT @var` on the same connection. The procedure returns its data with one final `SELECT`.
- Money comes back as a string (`'39.80'`) because mysql2 returns `DECIMAL` as strings. Return it as is. Do not turn on `decimalNumbers` and do not add prices with JS numbers.

## 2. No outer transaction

Call the procedure without `sequelize.transaction()` and without a `transaction` option. The procedure runs its own `START TRANSACTION … COMMIT`, and MySQL cannot nest transactions: that `START TRANSACTION` commits whatever the outer transaction had done, and a later rollback cannot undo it. The procedure already makes the sale all or nothing.

If the app really must combine the call with other writes, pick one owner: remove `START TRANSACTION`/`COMMIT` from the procedure and wrap the call in the app.

## 3. Validate before calling

```js
const PRICE = /^\d+(\.\d{1,2})?$/;

function findItemsProblem(items) {
  if (!Array.isArray(items) || items.length === 0) return 'SALE_WITHOUT_ITEMS';
  for (const item of items) {
    if (!Number.isInteger(item.productId) || item.productId < 1) return 'INVALID_PRODUCT_ID';
    if (!Number.isInteger(item.quantity) || item.quantity < 1) return 'INVALID_QUANTITY';
    if (typeof item.unitPrice !== 'string' || !PRICE.test(item.unitPrice)) return 'INVALID_UNIT_PRICE';
  }
  return null;
}
```

MySQL only warns when a price has more than two decimals (`'19.999'` is cut to two), so validate in the app and send prices as strings.

## 4. Map database errors to HTTP

Sequelize wraps the mysql2 error (`DatabaseError`; `UniqueConstraintError` for 1062; `ForeignKeyConstraintError` for 1451/1452). The original error is in `err.parent`, with `errno`, `code`, `sqlState` and `sqlMessage`.

| errno | Meaning | Status |
|---|---|---|
| 1644 | `SIGNAL SQLSTATE '45000'` from the procedure; the code is in `sqlMessage` | 400 for bad input (`SALE_WITHOUT_ITEMS`), 409 for a rule on current data (for example no stock) |
| 1452 | a line points to a product that does not exist | 404 (or 400) |
| 3140 | the JSON parameter is not valid JSON | 400 |
| 1062 | duplicate key (for example the same product twice in one sale) | 409 |

```js
function httpErrorFromDatabase(err) {
  const db = err.parent;
  if (!db) return null;
  switch (db.errno) {
    case 1644: return { status: 400, error: db.sqlMessage };
    case 1452: return { status: 404, error: 'PRODUCT_NOT_FOUND' };
    case 3140: return { status: 400, error: 'INVALID_ITEMS' };
    case 1062: return { status: 409, error: 'DUPLICATE_ITEM' };
    default: return null;
  }
}

router.post('/', async (req, res, next) => {
  const problem = findItemsProblem(req.body.items);
  if (problem) return res.status(400).json({ error: problem });
  try {
    res.status(201).json(await registerSale(req.body.items));
  } catch (err) {
    const httpError = httpErrorFromDatabase(err);
    if (httpError) return res.status(httpError.status).json({ error: httpError.error });
    next(err); // 500 from the error middleware, without SQL details
  }
});
```

Express 4 does not catch rejected promises: keep the `try/catch` and `next(err)`.

## 5. Search products by name or barcode

```js
const { Op } = require('sequelize');

const escapeLike = (s) => s.replace(/[\\%_]/g, '\\$&');

function searchProducts(q) {
  return Product.findAll({
    where: { [Op.or]: [{ barcode: q }, { name: { [Op.like]: `%${escapeLike(q)}%` } }] },
    order: [['name', 'ASC']],
    limit: 20,
  });
}
```

- `Op.like` does not escape `%` or `_`. Without `escapeLike`, searching `50%` matches every name that contains `50`.
- `barcode` is `UNIQUE`, so the exact match uses its index. The index on `name` cannot help a pattern that starts with `%`, so keep the `limit`.
- Use `Op.*` symbols only.
