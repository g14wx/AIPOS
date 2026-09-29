-- Registra una venta y todos sus detalles en una sola operación.
-- p_detalles: JSON con la forma [{"productoId": 1, "precioAplicado": "22.00"}, ...]
CREATE PROCEDURE sp_registrar_venta(IN p_detalles JSON)
BEGIN
  DECLARE v_venta_id INT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;

  IF p_detalles IS NULL OR JSON_LENGTH(p_detalles) = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'VENTA_SIN_DETALLES';
  END IF;

  START TRANSACTION;
  INSERT INTO ventas (total) VALUES (0);
  SET v_venta_id = LAST_INSERT_ID();

  INSERT INTO detalles_venta (venta_id, producto_id, precio_aplicado)
  SELECT v_venta_id, d.producto_id, d.precio_aplicado
  FROM JSON_TABLE(p_detalles, '$[*]' COLUMNS (
    producto_id INT PATH '$.productoId' ERROR ON EMPTY,
    precio_aplicado DECIMAL(10,2) PATH '$.precioAplicado' ERROR ON EMPTY
  )) AS d;

  UPDATE ventas
  SET total = (SELECT SUM(precio_aplicado) FROM detalles_venta WHERE venta_id = v_venta_id)
  WHERE id = v_venta_id;
  COMMIT;

  SELECT id AS ventaId, total FROM ventas WHERE id = v_venta_id;
END
