// models/clientes.model.js
// Importamos el pool de conexiones a la base de datos MySQL.
// Este pool se configuró previamente en config/db.js
import pool from '../config/db.js';

/**
 * Buscar cliente por email
 * ------------------------
 * - Recibe un email.
 * - Lanza una consulta SELECT con un placeholder (?).
 * - Devuelve el primer registro que coincida (o undefined si no hay resultados).
 */
export async function buscarPorEmail(email) {
  // Ejecutamos la consulta de forma parametrizada:
  // El ? se sustituye por el valor de [email] que le vendrá del frontend.
  const [rows] = await pool.query(
    'SELECT id, nombre, email, password, creado_en FROM clientes WHERE email = ? ',
    [email]
  );

  // Devolvemos solo la primera fila.
  // Si no hay filas, rows[0] será undefined.
  return rows[0];
}

/**
 * Crear nuevo cliente
 * -------------------
 * - Recibe un objeto con nombre, email y password (ya hasheado).
 * - Inserta un nuevo registro en la tabla clientes.
 * - Devuelve un objeto "limpio" con la información básica del cliente creado.
 */
export async function crearCliente({ nombre, email, password }) {
  // INSERT parametrizado. Los ? se rellenan con [nombre, email, password]
  const [result] = await pool.query(
    'INSERT INTO clientes (nombre, email, password) VALUES (?, ?, ?)',
    [nombre, email, password]
  );

  // Devolvemos un objeto con los datos principales.
  // result.insertId contiene el id autoincrement generado por MySQL.
  return {
    insertId: result.insertId,
    id: result.insertId,
    nombre,
    email
  };
}