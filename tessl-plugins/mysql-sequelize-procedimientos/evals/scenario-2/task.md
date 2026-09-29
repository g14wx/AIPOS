# Sale endpoint

This is the backend of a small point of sale (Express 4, Sequelize 6 and MySQL 8.4). The stored procedure `sp_register_sale` already exists: see `db/procedures/sp_register_sale.sql` and the migration that creates it.

The user asked:

> Add `POST /api/sales` so the cash register can save a sale. The body looks like `{"items": [{"productId": 3, "quantity": 2, "unitPrice": "19.90"}]}`. Use the stored procedure `sp_register_sale`. A sale must be all or nothing: if one item fails, nothing of that sale may be saved. Answer 201 with the sale id and total, and when something is wrong with the request (no items, a product that doesn't exist, a bad price…) answer with the right HTTP status code instead of a generic 500.

You don't need to install dependencies or start the database.
