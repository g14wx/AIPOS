'use strict';

// Antepone \ a cada \, % y _ para que el LIKE de MySQL los tome como texto normal y no como comodines (RNF-04).
// MySQL usa \ como carácter de escape del LIKE por defecto. Es una función pura: no toca la base de datos.
// Sin esto, buscar "50%" devolvería todos los productos con "50" en el nombre.
function escaparParaLike(texto) {
  return texto.replace(/[\\%_]/g, '\\$&');
}

module.exports = { escaparParaLike };
