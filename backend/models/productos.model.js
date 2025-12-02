// models/productos.model.js
import pool from '../config/db.js';

/**
 * ==========================================
 * MODELO DE PRODUCTOS 
 * ==========================================
 * 
 * PROPÓSITO:
 * Versión   que usa categoría como string
 * en lugar de relación con tabla separada.
 * 
 * ESTRUCTURA SIMPLE:
 * - productos: tabla única con categoria VARCHAR
 * - Sin JOINs complejos
 * 
 * 
 * FUNCIONES:
 * - obtenerTodos() - Lista todos los productos activos
 * - obtenerPorId(id) - Obtiene un producto específico
 * - obtenerPorCategoria(categoria) - Filtra productos por categoría
 * - crear(datos) - Crea un nuevo producto
 * - actualizar(id, datos) - Actualiza un producto existente
 * - eliminar(id) - Elimina (desactiva) un producto
 * - obtenerCategorias() - Lista categorías únicas disponibles
 */

/**
 * Obtener todos los productos activos
 * CONSULTA SIMPLE: SELECT directo sin JOINs
 */
export async function obtenerTodos() {
  const [rows] = await pool.query(
    `SELECT id, nombre, descripcion, precio, stock, categoria, imagen_url, activo, creado_en
     FROM productos
     WHERE activo = 1
     ORDER BY nombre ASC`
  );
  return rows;
}
