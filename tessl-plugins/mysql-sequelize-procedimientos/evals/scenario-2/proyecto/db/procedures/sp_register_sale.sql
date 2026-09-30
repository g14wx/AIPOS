-- Registers a sale and all its items in one call.
-- p_items is a JSON array, for example [{"productId": 3, "quantity": 2, "unitPrice": "19.90"}]
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

  INSERT INTO sales (total) VALUES (0);
  SET v_sale_id = LAST_INSERT_ID();

  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
  SELECT v_sale_id, j.product_id, j.quantity, j.unit_price, ROUND(j.quantity * j.unit_price, 2)
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
