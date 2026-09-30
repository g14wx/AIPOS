import { afterAll, afterEach, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { carpetaBackend, carpetaRaiz } from './ayudas.js';

const require = createRequire(import.meta.url);
const mysql = require('mysql2/promise');
const sequelize = require('../../src/database.js');
const { config } = require('../../src/config.js');

// Ayudas de las pruebas del procedimiento sp_registrar_venta. No es un archivo de pruebas: Vitest solo corre
// *.test.js.
//
// El procedimiento hace su propio COMMIT: lo que crea no se puede descartar con una transacción, así que
// `conTransaccionDescartada` (ayudas-productos.js) no sirve aquí. Test Fixture con limpieza explícita: cada
// prueba borra las ventas que creó, y cada archivo borra sus productos de prueba al empezar y al terminar.

// Todos los productos de prueba llevan este comienzo en el código de barras, para borrarlos sin tocar otros.
export const PREFIJO_PRODUCTOS = 'SP-REG-';

// El script del procedimiento: el que corre el cliente mysql y el que lee la migración.
export const ARCHIVO_SQL = path.join(
  carpetaBackend,
  'db',
  'procedimientos',
  'sp_registrar_venta.sql',
);

// Los números de error de MySQL que estas pruebas esperan (los que la API lee en err.parent.errno).
export const ER_LOCK_WAIT_TIMEOUT = 1205;
export const ER_SP_DOES_NOT_EXIST = 1305;
export const ER_SIGNAL_EXCEPTION = 1644;
export const ER_INVALID_JSON_TEXT = 3140;

// SQL directo con autocommit, por el pool de Sequelize: devuelve las filas de un SELECT o el id de un INSERT.
export async function consultar(sql, replacements) {
  const [resultado] = await sequelize.query(sql, { replacements });
  return resultado;
}

// Inserta `cuantos` productos de prueba con un solo INSERT y devuelve sus ids, en orden.
export async function crearProductos(cuantos, etiqueta = 'P') {
  const codigos = Array.from(
    { length: cuantos },
    (_, i) => `${PREFIJO_PRODUCTOS}${etiqueta}-${i + 1}`,
  );
  const valores = codigos.map((_, i) => `('Producto de prueba ${i + 1}', '10.00', :codigo${i})`);
  const replacements = Object.fromEntries(codigos.map((codigo, i) => [`codigo${i}`, codigo]));
  await consultar(
    `INSERT INTO productos (nombre, precio, codigo_barras) VALUES ${valores.join(', ')}`,
    replacements,
  );
  const filas = await consultar(
    'SELECT id FROM productos WHERE codigo_barras IN (:codigos) ORDER BY id',
    { codigos },
  );
  return filas.map((fila) => fila.id);
}

// Borra las ventas dadas con sus detalles. Las llaves foráneas son RESTRICT: primero los detalles.
export async function borrarVentas(ventaIds) {
  if (ventaIds.length === 0) return;
  await consultar('DELETE FROM detalles_venta WHERE venta_id IN (:ventaIds)', { ventaIds });
  await consultar('DELETE FROM ventas WHERE id IN (:ventaIds)', { ventaIds });
}

// Borra los productos de prueba y todo lo que los usa, también lo que dejó una corrida anterior que se cortó.
export async function borrarDatosDePrueba() {
  const patron = `${PREFIJO_PRODUCTOS}%`;
  const ventas = await consultar(
    `SELECT DISTINCT d.venta_id AS id FROM detalles_venta d
       JOIN productos p ON p.id = d.producto_id WHERE p.codigo_barras LIKE :patron`,
    { patron },
  );
  await borrarVentas(ventas.map((venta) => venta.id));
  await consultar('DELETE FROM productos WHERE codigo_barras LIKE :patron', { patron });
}

// Lo que quedó guardado de una venta: su fila y sus detalles, en el orden en que se guardaron.
export async function leerVenta(ventaId) {
  const [venta] = await consultar('SELECT id, fecha, total FROM ventas WHERE id = :ventaId', {
    ventaId,
  });
  return venta;
}

export function leerDetalles(ventaId) {
  return consultar(
    `SELECT producto_id AS productoId, cantidad, precio_aplicado AS precioAplicado, subtotal
       FROM detalles_venta WHERE venta_id = :ventaId ORDER BY id`,
    { ventaId },
  );
}

// Espera una promesa que MySQL puede rechazar. Devuelve { errno, estado, mensaje }, lo mismo que la API lee en
// err.parent.errno, err.parent.sqlState y err.parent.sqlMessage (un error de Sequelize) o en el error de mysql2;
// si la promesa no se rechaza, devuelve null.
export async function errorDe(promesa) {
  try {
    await promesa;
  } catch (error) {
    const original = error.parent ?? error.original ?? error;
    return { errno: original.errno, estado: original.sqlState, mensaje: original.sqlMessage };
  }
  return null;
}

// Una conexión propia a la base de prueba, con el usuario de la app. Llama al procedimiento y cuenta las filas
// DESDE LA MISMA SESIÓN: así una prueba ve un ROLLBACK que falte. Si un error dejara la transacción abierta,
// el COUNT(*) de esa sesión vería las filas sin confirmar, y las de otra sesión no. `registrar` recibe el id de
// cada venta que el procedimiento confirma, para que la prueba la borre al terminar.
export async function crearLlamador(registrar) {
  const { host, puerto, nombre, usuario, clave } = config.baseDeDatos;
  const conexion = await mysql.createConnection({
    host,
    port: puerto,
    user: usuario,
    password: clave,
    database: nombre,
  });
  return {
    conexion,
    // `textoJson` va tal cual (puede ser un JSON mal escrito) o es null para un NULL de SQL. Devuelve todos los
    // conjuntos de resultados del CALL: [filas del SELECT final, paquete OK].
    async llamarCrudo(textoJson) {
      const [resultados] = await conexion.query('CALL sp_registrar_venta(?)', [textoJson]);
      const ventaId = resultados?.[0]?.[0]?.ventaId;
      if (ventaId !== undefined) registrar(ventaId);
      return resultados;
    },
    // Llama con los detalles como JSON y devuelve la fila del SELECT final: { ventaId, total }.
    async llamar(detalles) {
      const resultados = await this.llamarCrudo(JSON.stringify(detalles));
      return resultados[0][0];
    },
    async contar() {
      const [[fila]] = await conexion.query(
        `SELECT (SELECT COUNT(*) FROM ventas) AS ventas,
                (SELECT COUNT(*) FROM detalles_venta) AS detalles`,
      );
      return { ventas: Number(fila.ventas), detalles: Number(fila.detalles) };
    },
    cerrar: () => conexion.end(),
  };
}

// Registra los ganchos de Vitest del archivo que la llama (a nivel del archivo o dentro de un describe).
// Al empezar borra lo que dejó una corrida cortada y crea `productos` productos de prueba. Después de cada
// prueba borra las ventas que creó. Al terminar borra todo y cierra la conexión.
export function prepararPrueba({ productos = 3 } = {}) {
  const ventasCreadas = [];
  const contexto = {
    productoIds: [],
    llamador: null,
    // La llamada tal como la hará src/services/ventas.js (V-03): sequelize.query con CALL, sin transacción,
    // sin `type`, y la primera fila del resultado.
    async llamarComoElServicio(detalles) {
      const filas = await sequelize.query('CALL sp_registrar_venta(:detalles)', {
        replacements: { detalles: JSON.stringify(detalles) },
      });
      if (filas[0]?.ventaId !== undefined) ventasCreadas.push(filas[0].ventaId);
      return filas[0];
    },
  };
  beforeAll(async () => {
    await verificarProcedimientoDelSql();
    await borrarDatosDePrueba();
    contexto.productoIds = await crearProductos(productos);
    contexto.llamador = await crearLlamador((ventaId) => ventasCreadas.push(ventaId));
  });
  afterEach(() => borrarVentas(ventasCreadas.splice(0)));
  afterAll(async () => {
    await contexto.llamador?.cerrar();
    await borrarDatosDePrueba();
  });
  return contexto;
}

// Lo que MySQL sabe del procedimiento que hay ahora en la base de prueba, o undefined si no existe: `cuerpo` (el
// CREATE PROCEDURE completo, como lo devuelve SHOW CREATE PROCEDURE, que es lo que usa mysqldump) y `definidor` (la
// cuenta que lo creó, por ejemplo aipos@%). El cuerpo NO se lee de information_schema.routines: esa vista muestra las
// barras invertidas ya interpretadas (\\z se ve como \z), aunque MySQL ejecuta y respalda el texto original.
export async function leerProcedimiento() {
  const [fila] = await consultar(
    `SELECT definer AS definidor, security_type AS seguridad
       FROM information_schema.routines
      WHERE routine_schema = DATABASE() AND routine_type = 'PROCEDURE'
        AND routine_name = 'sp_registrar_venta'`,
  );
  if (!fila) return undefined;
  const [creacion] = await consultar('SHOW CREATE PROCEDURE sp_registrar_venta');
  return { ...fila, cuerpo: creacion['Create Procedure'] };
}

// El texto sin comentarios y con los espacios juntos, para comparar dos cuerpos: el cliente mysql quita los
// comentarios antes de mandar el script, y la migración los manda.
export function sinComentariosNiEspacios(texto) {
  return texto
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/--[^\n]*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// El procedimiento de la base de prueba tiene que ser el del .sql. Una migración que ya corrió no se repite: si
// alguien cambia el .sql, la base de prueba sigue con el cuerpo de antes y las pruebas fallarían sin decir por qué.
export async function verificarProcedimientoDelSql() {
  const texto = fs.readFileSync(ARCHIVO_SQL, 'utf8');
  const bloque = texto.match(/^DELIMITER \$\$\r?\n([\s\S]*?)\$\$\r?\nDELIMITER ;/m)?.[1];
  const procedimiento = await leerProcedimiento();
  // Se compara desde el primer BEGIN: antes de él, MySQL escribe DEFINER=... y el nombre entre comillas.
  const desdeBegin = (cuerpo) => sinComentariosNiEspacios(cuerpo.slice(cuerpo.indexOf('BEGIN')));
  if (!bloque || !procedimiento || desdeBegin(procedimiento.cuerpo) !== desdeBegin(bloque)) {
    throw new Error(
      'El procedimiento sp_registrar_venta de la base de prueba no existe o no es el de ' +
        'db/procedimientos/sp_registrar_venta.sql. Si cambiaste el .sql, vuelve a crearlo: npm run rehacer:prueba.',
    );
  }
}

// Busca un cliente `mysql` que entre a la base de prueba con el usuario de la app (nunca con root): primero el
// del servicio mysql de Docker Compose, como dice la spec (`docker compose exec -T mysql mysql`), y si no, el
// `mysql` del PATH. Devuelve null si no hay ninguno que sirva. La clave va en MYSQL_PWD, no en la línea de comandos.
export function buscarClienteMysql() {
  const { host, puerto, nombre, usuario } = config.baseDeDatos;
  const candidatos = [
    {
      descripcion: 'docker compose exec -T mysql mysql',
      comando: 'docker',
      argumentos: [
        'compose',
        'exec',
        '-T',
        '-e',
        'MYSQL_PWD',
        'mysql',
        'mysql',
        '-u',
        usuario,
        nombre,
      ],
      cwd: carpetaRaiz,
    },
    {
      descripcion: 'el cliente mysql del PATH',
      comando: 'mysql',
      argumentos: ['-h', host, '-P', String(puerto), '-u', usuario, nombre],
      cwd: carpetaRaiz,
    },
  ];
  for (const candidato of candidatos) {
    try {
      correrSql(candidato, 'SELECT 1');
      return candidato;
    } catch {
      // Ese cliente no está, o no entra a la base de prueba: se prueba el siguiente.
    }
  }
  return null;
}

// Corre `sql` con el cliente, igual que `mysql ... < archivo.sql`: el texto entra por la entrada estándar.
// Si el cliente termina con error, lanza una excepción con lo que escribió.
export function correrSql(cliente, sql) {
  return execFileSync(cliente.comando, cliente.argumentos, {
    cwd: cliente.cwd,
    env: { ...process.env, MYSQL_PWD: config.baseDeDatos.clave },
    input: sql,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 60_000,
  });
}
