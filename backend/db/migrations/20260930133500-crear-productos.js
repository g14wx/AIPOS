'use strict';

// Crea la tabla productos (spec crear-producto, tarjeta P-01). MySQL protege RN-01 a RN-04 por sí solo,
// aunque alguien llame a la base sin pasar por la API (RNF-03).
const TABLA = 'productos';

module.exports = {
  async up(queryInterface, Sequelize) {
    // El motor, el juego de caracteres y el orden van dichos aquí y no se heredan de la base.
    await queryInterface.createTable(
      TABLA,
      {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        nombre: { type: Sequelize.STRING(120), allowNull: false },
        // DECIMAL sin tamaño se vuelve DECIMAL(10,0) y pierde los centavos.
        precio: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
        // Texto y no número: un número perdería los ceros de la izquierda.
        codigo_barras: { type: Sequelize.STRING(50), allowNull: false },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_0900_ai_ci' },
    );

    // El nombre es fijo porque la API reconoce el 409 por él (error 1062).
    await queryInterface.addIndex(TABLA, ['codigo_barras'], {
      name: 'uq_productos_codigo_barras',
      unique: true,
    });

    // Un solo ALTER para que los tres CHECK se agreguen juntos o ninguno. Los textos no quedan vacíos ni
    // con espacios en los extremos: con utf8mb4_0900_ai_ci (sin relleno) la comparación sí ve los finales.
    await queryInterface.sequelize.query(`
      ALTER TABLE ${TABLA}
        ADD CONSTRAINT chk_productos_precio CHECK (precio > 0 AND precio <= 99999.99),
        ADD CONSTRAINT chk_productos_nombre CHECK (CHAR_LENGTH(nombre) > 0 AND nombre = TRIM(nombre)),
        ADD CONSTRAINT chk_productos_codigo_barras
          CHECK (CHAR_LENGTH(codigo_barras) > 0 AND codigo_barras = TRIM(codigo_barras))
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable(TABLA);
  },
};
