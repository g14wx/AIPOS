---
name: mysql-stored-procedure-authoring
description: "Writes MySQL 8.4 stored procedures and the sequelize-cli migration that creates them, for Node backends on Sequelize 6 and mysql2. Covers a .sql script that also runs with the mysql client through DELIMITER, a migration that sends DROP and only the CREATE PROCEDURE block in separate queries, a JSON parameter read with JSON_TABLE for header-plus-lines data such as a sale and its items, an EXIT HANDLER with ROLLBACK and RESIGNAL, SIGNAL SQLSTATE 45000 for business rules, totals computed in SQL as DECIMAL(10,2), and exactly one final SELECT. Use when asked to create or change a stored procedure, to save a sale with its items (or any header with lines) in one call, when a migration fails with ER_PARSE_ERROR 1064 near DELIMITER, when deciding between docker-entrypoint-initdb.d and migrations, or when a procedure must validate input and roll back."
---

# MySQL stored procedure authoring

Write MySQL 8.4 stored procedures that Node can create through sequelize-cli and mysql2, that save everything or nothing, and that fail with errors the app can map to HTTP status codes.

## 1. Files

- `db/procedures/sp_<name>.sql` (or the folder the project's glossary names, such as `db/procedimientos/`): the reproducible script. `DROP PROCEDURE IF EXISTS`, then the `CREATE PROCEDURE … END` block wrapped in `DELIMITER $$ … $$`, so it also runs with the `mysql` client.
- `migrations/<timestamp>-create-sp-<name>.js`: how the app creates it. It sends `DROP` and only the `CREATE PROCEDURE … END` block, never `DELIMITER`. CommonJS like the other migrations (`.cjs` if `package.json` has `"type": "module"`).

Whoever runs the script with the client must use the app's database user, never `root`. `root` has `SYSTEM_USER`, so a procedure defined by `root` can no longer be dropped or replaced by the app user, and the migration fails. For the same reason, do not create it from `docker-entrypoint-initdb.d` (those scripts run as `root`). Never write `DEFINER=`: the definer is whoever creates it.

## 2. Migration

```js
'use strict';
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../db/procedures/sp_register_sale.sql');
// Send only what sits between the `DELIMITER $$` line and the closing `$$`: the CREATE PROCEDURE … END block.
const block = fs.readFileSync(file, 'utf8').match(/^[ \t]*DELIMITER[ \t]+\$\$[ \t]*\r?\n([\s\S]*?)\$\$[ \t]*\r?$/im);
if (!block) throw new Error(`${file} has no DELIMITER $$ … $$ block`);

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_register_sale');
    await queryInterface.sequelize.query(block[1].trim());
  },
  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_register_sale');
  },
};
```

- `DROP` and `CREATE` go in two separate `query()` calls. Never send `DELIMITER` and do not enable `multipleStatements`: `CREATE PROCEDURE … BEGIN … END` is one statement. `DELIMITER` sent through mysql2 fails with `ER_PARSE_ERROR` (1064).
- Pass no `replacements` and no `type` to the CREATE call: a `:name` inside the body would be replaced.
- MySQL has no `CREATE OR REPLACE PROCEDURE` (that is MariaDB). `CREATE PROCEDURE IF NOT EXISTS` (8.0.29+) skips an existing procedure, so it never updates the body.
- To change a procedure that already shipped, add a new migration that drops and creates it again. Do not edit a migration that already ran.
- The app runs `npx sequelize-cli db:migrate`. With the client, run the script as the app user: `mysql -u <app_user> -p <database> < db/procedures/sp_<name>.sql`. Without the `DELIMITER` wrapper the client would split the body at every `;`.

## 3. Template: a sale with its items

```sql
DROP PROCEDURE IF EXISTS sp_register_sale;

DELIMITER $$
CREATE PROCEDURE sp_register_sale(IN p_items JSON)
BEGIN
  DECLARE v_sale_id INT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  IF p_items IS NULL OR JSON_TYPE(p_items) <> 'ARRAY' OR JSON_LENGTH(p_items) = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'SALE_WITHOUT_ITEMS';
  END IF;

  START TRANSACTION;

  INSERT INTO sales (total, created_at, updated_at) VALUES (0, NOW(), NOW());
  SET v_sale_id = LAST_INSERT_ID();

  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal, created_at, updated_at)
  SELECT v_sale_id, j.product_id, j.quantity, j.unit_price, ROUND(j.quantity * j.unit_price, 2), NOW(), NOW()
  FROM JSON_TABLE(p_items, '$[*]' COLUMNS (
    product_id INT PATH '$.productId' ERROR ON EMPTY,
    quantity INT PATH '$.quantity' ERROR ON EMPTY,
    unit_price DECIMAL(10,2) PATH '$.unitPrice' ERROR ON EMPTY
  )) AS j;

  UPDATE sales
  SET total = (SELECT SUM(subtotal) FROM sale_items WHERE sale_id = v_sale_id)
  WHERE id = v_sale_id;

  COMMIT;

  SELECT id AS saleId, total FROM sales WHERE id = v_sale_id;
END$$
DELIMITER ;
```

The caller sends `[{"productId": 3, "quantity": 2, "unitPrice": "19.90"}]` and gets one row: `{ saleId, total }`.

## 4. Rules inside the body

- Declare in this order: variables and conditions, then cursors, then handlers.
- `DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;`. `RESIGNAL` sends the original error, with its errno, to Node. Never swallow the error or return a success row from the handler.
- Validate with `SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'UPPER_SNAKE_CODE'` before `START TRANSACTION`. Node receives errno 1644 (`ER_SIGNAL_EXCEPTION`) with the code as the message.
- MySQL has no array parameters. Lists arrive as one `JSON` parameter read with `JSON_TABLE`; the alias after `JSON_TABLE(...)` is required. Use `ERROR ON EMPTY` for required fields.
- `JSON_TABLE` inside a procedure needs MySQL 8.0.19+ (before that, the second call could return no rows). `mysql:8.4` is fine.
- Money is `DECIMAL(10,2)`, also in `JSON_TABLE` columns. Compute subtotals with `ROUND(quantity * unit_price, 2)` and the total with `SUM` in SQL. Never trust a total sent by the caller.
- Set every `NOT NULL` column that has no default. Migrations generated by sequelize-cli create `createdAt`/`updatedAt` with no default: either the migration gives them `defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')` or the `INSERT` sets `NOW()`.
- Return data with exactly one `SELECT`, at the end. Each extra `SELECT` (debugging, checks) adds a result set that the caller reads by mistake; use `SELECT … INTO v_var` for checks. No `OUT` parameters: reading them needs a second query on the same connection.
- The procedure owns its transaction. The app must call it without `sequelize.transaction()`, because MySQL cannot nest transactions and this `START TRANSACTION` would commit the outer work.

## 5. Final check

- [ ] `grep -rniE '^[[:space:]]*DELIMITER[[:space:]]' migrations` finds nothing, and the block the migration sends has no `DELIMITER` and no `$$`. `DELIMITER` lives only in the `.sql` script, for the client.
- [ ] No `DEFINER=`, no `CREATE OR REPLACE`, no copy in `docker-entrypoint-initdb.d`.
- [ ] The handler runs `ROLLBACK` and then `RESIGNAL`.
- [ ] Empty or invalid input raises `SIGNAL SQLSTATE '45000'` before anything is inserted.
- [ ] Exactly one result `SELECT`, at the end, returning what the app needs (for example `saleId` and `total`).
