'use strict';

// Los cinco estados que la API puede devolver (RNF-05).
const ESTADOS = [400, 404, 409, 422, 500];

class ErrorApi extends Error {
  constructor(estado, codigo, mensaje, detalles) {
    super(mensaje);
    if (!ESTADOS.includes(estado)) {
      throw new Error(`Estado ${estado} no permitido: la API solo usa ${ESTADOS.join(', ')}.`);
    }
    this.name = 'ErrorApi';
    this.estado = estado;
    this.codigo = codigo;
    this.detalles = detalles;
  }
}

module.exports = ErrorApi;
