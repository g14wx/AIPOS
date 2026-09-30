-- sp_registrar_venta: guarda una venta y todos sus detalles de una sola vez, dentro de MySQL (spec registrar-venta,
-- tarjeta V-02). Es todo o nada: si algo falla no queda nada guardado, y el error original llega a quien llamó.
--
-- Parámetro: p_detalles, un arreglo JSON de 1 a 100 objetos, uno por detalle de venta:
--   [{ "productoId": 3, "cantidad": 2, "precioAplicado": "22.00" }, ...]
-- Respuesta: un solo SELECT al final, con una fila: ventaId (el número de la venta) y total (texto con 2 decimales).
-- No recibe un total ni un subtotal: los calcula MySQL (RN-08 y RN-09). La fecha la pone la base (RN-12).
--
-- Reglas (RN-05, RN-06, RN-07, RN-10 y RN-14). Si una falla, SIGNAL SQLSTATE 45000 con el código en MESSAGE_TEXT.
-- Se revisan en este orden y gana la primera que falle:
--   VENTA_SIN_DETALLES, DEMASIADOS_DETALLES, DETALLE_INVALIDO, CANTIDAD_FUERA_DE_RANGO, PRECIO_FUERA_DE_RANGO,
--   PRODUCTO_REPETIDO y PRODUCTO_NO_EXISTE.
--
-- Cómo correrlo con el cliente mysql (con el usuario de la app y nunca con root: si root lo crea, la app ya no puede
-- borrarlo ni cambiarlo y la migración falla):
--   docker compose exec -T mysql mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" < backend/db/procedimientos/sp_registrar_venta.sql
-- La migración db/migrations/*-crear-sp-registrar-venta.js lee este mismo archivo y manda el DROP y solo el bloque
-- CREATE PROCEDURE ... END (lo que está entre la línea DELIMITER y su cierre), nunca la línea DELIMITER.

DROP PROCEDURE IF EXISTS sp_registrar_venta;

DELIMITER $$
CREATE PROCEDURE sp_registrar_venta(IN p_detalles JSON)
BEGIN
  DECLARE v_venta_id INT;
  DECLARE v_total DECIMAL(12,2);
  DECLARE v_con_problema INT;

  -- Cualquier error, sea una regla o no, deshace todo y deja llegar el error original (con su número) a quien llamó.
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- Las reglas se revisan leyendo el TEXTO de cada campo (columnas VARCHAR de JSON_TABLE) y su tipo JSON. Las
  -- columnas con tipo (INT, DECIMAL) nunca fallan: convierten en silencio (3.7 pasa a 4, true a 1 y "10.999" a
  -- 11.00). Cada revisión trata un campo que falta como un campo inválido (NULL cuenta como falla).
  -- En las expresiones regulares el fin de texto es \\z y no $: el $ de MySQL acepta un salto de línea al final,
  -- y "10" seguido de un salto de línea pasaría.

  -- RN-10: una venta sin detalles no se registra.
  IF p_detalles IS NULL OR JSON_TYPE(p_detalles) <> 'ARRAY' OR JSON_LENGTH(p_detalles) = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'VENTA_SIN_DETALLES';
  END IF;

  -- RN-14: como máximo 100 detalles. Con 101 de 999 x 99999.99 el total se pasaría de DECIMAL(12,2).
  IF JSON_LENGTH(p_detalles) > 100 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'DEMASIADOS_DETALLES';
  END IF;

  -- Cada elemento es un objeto, y su productoId es un entero JSON de 1 a 2147483647 (lo que cabe en INT).
  SELECT COUNT(*) INTO v_con_problema
  FROM JSON_TABLE(p_detalles, '$[*]' COLUMNS (
    elemento JSON PATH '$',
    producto_json JSON PATH '$.productoId',
    producto_texto VARCHAR(50) PATH '$.productoId'
  )) AS j
  WHERE NOT COALESCE(
    JSON_TYPE(j.elemento) = 'OBJECT'
    AND JSON_TYPE(j.producto_json) IN ('INTEGER', 'UNSIGNED INTEGER')
    AND CASE WHEN j.producto_texto REGEXP '^[0-9]{1,10}\\z'
             THEN CAST(j.producto_texto AS UNSIGNED) BETWEEN 1 AND 2147483647
        END, 0);
  IF v_con_problema > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'DETALLE_INVALIDO';
  END IF;

  -- RN-06: la cantidad es un entero de 1 a 999, escrito con solo dígitos, como texto o como número JSON.
  SELECT COUNT(*) INTO v_con_problema
  FROM JSON_TABLE(p_detalles, '$[*]' COLUMNS (
    cantidad_texto VARCHAR(50) PATH '$.cantidad'
  )) AS j
  WHERE NOT COALESCE(
    CASE WHEN j.cantidad_texto REGEXP '^[0-9]{1,3}\\z'
         THEN CAST(j.cantidad_texto AS UNSIGNED) BETWEEN 1 AND 999
    END, 0);
  IF v_con_problema > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'CANTIDAD_FUERA_DE_RANGO';
  END IF;

  -- RN-05: el precio aplicado es de 0 a 99999.99 con 2 decimales como máximo, y esta forma ya lo asegura. Un
  -- "10.999" se rechaza, no se redondea a 11.00. Un 1e2 escrito como número JSON llega aquí ya convertido a 100.0.
  SELECT COUNT(*) INTO v_con_problema
  FROM JSON_TABLE(p_detalles, '$[*]' COLUMNS (
    precio_texto VARCHAR(50) PATH '$.precioAplicado'
  )) AS j
  WHERE NOT COALESCE(j.precio_texto REGEXP '^[0-9]{1,5}([.][0-9]{1,2})?\\z', 0);
  IF v_con_problema > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'PRECIO_FUERA_DE_RANGO';
  END IF;

  -- RN-07: un producto tiene un solo detalle en la venta. Aquí todos los productoId ya son enteros válidos.
  SELECT COUNT(*) - COUNT(DISTINCT j.producto_id) INTO v_con_problema
  FROM JSON_TABLE(p_detalles, '$[*]' COLUMNS (
    producto_id INT PATH '$.productoId'
  )) AS j;
  IF v_con_problema > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'PRODUCTO_REPETIDO';
  END IF;

  -- Cada producto existe.
  SELECT COUNT(*) INTO v_con_problema
  FROM JSON_TABLE(p_detalles, '$[*]' COLUMNS (
    producto_id INT PATH '$.productoId'
  )) AS j
  LEFT JOIN productos AS p ON p.id = j.producto_id
  WHERE p.id IS NULL;
  IF v_con_problema > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'PRODUCTO_NO_EXISTE';
  END IF;

  -- La venta nace con total 0, y la fecha la pone DEFAULT CURRENT_TIMESTAMP (RN-12). Su id se guarda enseguida:
  -- el INSERT de los detalles cambiaría LAST_INSERT_ID().
  INSERT INTO ventas (total) VALUES (0);
  SET v_venta_id = LAST_INSERT_ID();

  -- Los detalles salen del JSON de una sola vez. Aquí sí se usan las columnas con tipo: los valores ya se revisaron.
  -- El subtotal se calcula en SQL (RN-08). El precio aplicado es DECIMAL(10,2), como pide la spec de arquitectura.
  INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio_aplicado, subtotal)
  SELECT v_venta_id, j.producto_id, j.cantidad, j.precio_aplicado, ROUND(j.precio_aplicado * j.cantidad, 2)
  FROM JSON_TABLE(p_detalles, '$[*]' COLUMNS (
    producto_id INT PATH '$.productoId',
    cantidad INT PATH '$.cantidad',
    precio_aplicado DECIMAL(10,2) PATH '$.precioAplicado'
  )) AS j;

  -- El total es la suma de los subtotales de los detalles recién creados (RN-08).
  SELECT SUM(subtotal) INTO v_total FROM detalles_venta WHERE venta_id = v_venta_id;
  UPDATE ventas SET total = v_total WHERE id = v_venta_id;

  COMMIT;

  -- Lo único que devuelve: un SELECT, sin parámetros OUT. Sequelize lo lee como la primera fila del CALL.
  SELECT id AS ventaId, total FROM ventas WHERE id = v_venta_id;
END$$
DELIMITER ;
