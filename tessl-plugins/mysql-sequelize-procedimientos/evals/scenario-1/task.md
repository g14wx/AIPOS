# Register a sale in one call

This is the backend of a small point of sale (Express 5, Sequelize 6, sequelize-cli and MySQL 8.4). The tables `products`, `sales` and `sale_items` already exist; see `migrations/`.

The user asked:

> I need a stored procedure `sp_register_sale` that registers a sale with all its items in a single call. The backend sends the list of items (product id, quantity and unit price) and gets back the new sale's id and total. If anything fails, nothing of that sale may stay in the database. Also add the sequelize-cli migration that creates the procedure, so `npm run db:migrate` sets everything up on a fresh database.

You don't need to install dependencies or start the database.
