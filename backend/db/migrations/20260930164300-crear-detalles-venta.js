'use strict';

// Crea la tabla detalles_venta (spec registrar-venta, tarjeta V-01). MySQL protege RN-05, RN-06, RN-07 y RN-13
// por sí solo, aunque alguien llame a la base sin pasar por la API ni por el procedimiento (RNF-03).
// Va después de ventas y de productos, porque sus llaves foráneas apuntan a las dos.
const TABLA = 'detalles_venta';

module.exports = {
  async up(queryInterface, Sequelize) {
    // El motor, el juego de caracteres y el orden van dichos aquí y no se heredan de la base.
    await queryInterface.createTable(
      TABLA,
      {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        venta_id: { type: Sequelize.INTEGER, allowNull: false },
        producto_id: { type: Sequelize.INTEGER, allowNull: false },
        cantidad: { type: Sequelize.INTEGER, allowNull: false },
        // DECIMAL sin tamaño se vuelve DECIMAL(10,0) y pierde los centavos.
        precio_aplicado: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
        // DECIMAL(12,2): 999 × 99 999.99 = 99 899 990.01 no cabe con margen en DECIMAL(10,2).
        subtotal: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_0900_ai_ci' },
    );

    // RN-07: un producto tiene un solo detalle en cada venta. El nombre es fijo para que el error 1062 diga
    // cuál índice falló. Va antes que las llaves foráneas: MySQL lo usa para la de venta_id (empieza por esa
    // columna) y solo crea un índice más, el de la llave foránea de producto_id.
    await queryInterface.addIndex(TABLA, ['venta_id', 'producto_id'], {
      name: 'uq_detalles_venta_venta_producto',
      unique: true,
    });

    // Un solo ALTER para que las dos llaves foráneas (ON DELETE RESTRICT: un producto que está en una venta,
    // o una venta con detalles, no se borra, RN-13) y los dos CHECK (RN-06 y RN-05) se agreguen juntos o
    // ninguno. Los nombres son fijos: MySQL los dice en sus errores 1451, 1452 y 3819.
    await queryInterface.sequelize.query(`
      ALTER TABLE ${TABLA}
        ADD CONSTRAINT fk_detalles_venta_venta
          FOREIGN KEY (venta_id) REFERENCES ventas (id) ON DELETE RESTRICT,
        ADD CONSTRAINT fk_detalles_venta_producto
          FOREIGN KEY (producto_id) REFERENCES productos (id) ON DELETE RESTRICT,
        ADD CONSTRAINT chk_detalles_venta_cantidad CHECK (cantidad BETWEEN 1 AND 999),
        ADD CONSTRAINT chk_detalles_venta_precio_aplicado
          CHECK (precio_aplicado BETWEEN 0 AND 99999.99)
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable(TABLA);
  },
};
