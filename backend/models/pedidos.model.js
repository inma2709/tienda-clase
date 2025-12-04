
// backend-bazar/models/pedidos.model.js
import pool from "../config/db.js";

/**
 * ==========================================
 * MODELO DE DATOS: PEDIDOS
 * ==========================================
 * 
 * Este archivo contiene todas las funciones que interactúan
 * con la base de datos para gestionar pedidos.
 * 
 * ESTRUCTURA DE TABLAS RELACIONADAS: 
 * 
 * 1. TABLA 'pedidos' (cabecera del pedido):
 *    - id (PRIMARY KEY, AUTO_INCREMENT)
 *    - cliente_id (FOREIGN KEY a tabla clientes)
 *    - estado (VARCHAR: 'pendiente', 'pagado', 'enviado', 'entregado', 'cancelado')
 *    - fecha (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
 * 
 * 2. TABLA 'pedidos_productos' (líneas de pedido):
 *    - id (PRIMARY KEY, AUTO_INCREMENT)
 *    - pedido_id (FOREIGN KEY a tabla pedidos)
 *    - producto_id (FOREIGN KEY a tabla productos)
 *    - cantidad (INT)
 * 
 * Esta estructura permite un pedido con múltiples productos
 * y diferentes cantidades para cada producto.
 */

/**
 * Crear un pedido nuevo para un cliente
 * ==========================================
 * 
 * PROPÓSITO:
 * Crea la "cabecera" del pedido en la tabla pedidos.
 * Solo necesita el ID del cliente autenticado.
 * El pedido se crea vacío (sin productos) y con estado "pendiente".
 * 
 * PARÁMETROS:
 * @param {number} clienteId - ID del cliente autenticado
 * 
 * RETORNA:
 * @returns {Object} - Objeto con información del pedido creado:
 *   - id: ID del pedido creado (auto-generado por MySQL)
 *   - cliente_id: ID del cliente que creó el pedido
 *   - estado: Estado inicial del pedido ("pendiente")
 * 
 * EJEMPLO DE USO:
 * const pedido = await crearPedido(123);
 * // Resultado: { id: 456, cliente_id: 123, estado: "pendiente" }
 */
export async function crearPedido(clienteId) {
  // Ejecutar INSERT en la tabla pedidos
  // MySQL asignará automáticamente el ID y la fecha actual
  const [result] = await pool.query(
    "INSERT INTO pedidos (cliente_id) VALUES (?)",
    [clienteId]
  );

  // Devolver la información del pedido creado
  return {
    id: result.insertId,      // ID generado automáticamente por MySQL
    cliente_id: clienteId,    // ID del cliente que creó el pedido
    estado: "pendiente",      // Estado por defecto
  };
}

/**
 * Añadir un producto al pedido (línea de pedido)
 * ==========================================
 * 
 * PROPÓSITO:
 * Inserta una línea en la tabla pedidos_productos.
 * Esta tabla funciona como tabla intermedia N:M entre
 * pedidos y productos, permitiendo múltiples productos por pedido.
 * 
 * PARÁMETROS:
 * @param {Object} datos - Objeto con los siguientes campos:
 *   @param {number} datos.pedidoId - ID del pedido al que agregar el producto
 *   @param {number} datos.productoId - ID del producto a agregar
 *   @param {number} datos.cantidad - Cantidad del producto a agregar
 * 
 * RETORNA:
 * @returns {Object} - Información de la línea de pedido creada:
 *   - id: ID de la línea de pedido creada
 *   - pedido_id: ID del pedido
 *   - producto_id: ID del producto
 *   - cantidad: Cantidad del producto
 * 
 * EJEMPLO DE USO:
 * const linea = await agregarProductoAPedido({
 *   pedidoId: 456,
 *   productoId: 789,
 *   cantidad: 2
 * });
 */
export async function agregarProductoAPedido({ pedidoId, productoId, cantidad }) {
  // Insertar línea de pedido en la tabla pedidos_productos
  const [result] = await pool.query(
    "INSERT INTO pedidos_productos (pedido_id, producto_id, cantidad) VALUES (?, ?, ?)",
    [pedidoId, productoId, cantidad]
  );

  // Devolver información de la línea de pedido creada
  return {
    id: result.insertId,     // ID de la línea de pedido
    pedido_id: pedidoId,     // ID del pedido padre
    producto_id: productoId, // ID del producto agregado
    cantidad,                // Cantidad del producto
  };
}

/**
 * Obtener un pedido por ID (solo cabecera)
 * ==========================================
 * 
 * PROPÓSITO:
 * Devuelve la información general del pedido desde la tabla 'pedidos'.
 * No incluye la lista de productos, solo los datos generales.
 * 
 * PARÁMETROS:
 * @param {number} id - ID del pedido a buscar
 * 
 * RETORNA:
 * @returns {Object|undefined} - Información del pedido o undefined si no existe:
 *   - id: ID del pedido
 *   - cliente_id: ID del cliente que creó el pedido
 *   - estado: Estado actual del pedido
 *   - fecha: Fecha y hora de creación del pedido
 * 
 * EJEMPLO DE USO:
 * const pedido = await obtenerPedidoPorId(456);
 * if (!pedido) {
 *   console.log("Pedido no encontrado");
 * }
 */
export async function obtenerPedidoPorId(id) {
  const [rows] = await pool.query(
    `SELECT p.id, p.cliente_id, p.estado, p.fecha
     FROM pedidos p
     WHERE p.id = ?`,
    [id]
  );
  
  // Devolver el primer resultado (o undefined si no hay resultados)
  return rows[0];
}

/**
 * Obtener las líneas de un pedido con información del producto
 * ==========================================
 * 
 * PROPÓSITO:
 * Devuelve todas las líneas (productos) de un pedido específico.
 * Hace JOIN entre pedidos_productos y productos para obtener
 * información completa de cada producto en el pedido.
 * 
 * PARÁMETROS:
 * @param {number} idPedido - ID del pedido del que obtener las líneas
 * 
 * RETORNA:
 * @returns {Array} - Array de líneas de pedido, cada una con:
 *   - id: ID de la línea de pedido
 *   - cantidad: Cantidad del producto en esta línea
 *   - producto_id: ID del producto
 *   - producto_nombre: Nombre del producto
 *   - producto_precio: Precio unitario del producto
 *   - producto_imagen: URL de la imagen del producto
 * 
 * EJEMPLO DE USO:
 * const lineas = await obtenerLineasDePedido(456);
 * // Resultado: [
 * //   { id: 1, cantidad: 2, producto_id: 789, producto_nombre: "Camiseta", ... },
 * //   { id: 2, cantidad: 1, producto_id: 790, producto_nombre: "Pantalón", ... }
 * // ]
 */
export async function obtenerLineasDePedido(idPedido) {
  const [rows] = await pool.query(
    `SELECT 
        pp.id,
        pp.cantidad,
        pr.id AS producto_id,
        pr.nombre AS producto_nombre,
        pr.precio AS producto_precio,
        pr.imagen_url AS producto_imagen
      FROM pedidos_productos pp
      JOIN productos pr ON pp.producto_id = pr.id
      WHERE pp.pedido_id = ?`,
    [idPedido]
  );
  
  return rows;
}

/**
 * Obtener todos los pedidos de un cliente
 * ==========================================
 * 
 * PROPÓSITO:
 * Devuelve una lista de todos los pedidos que ha creado un cliente,
 * ordenados por fecha (más recientes primero).
 * Solo devuelve información de cabecera, no los productos de cada pedido.
 * 
 * PARÁMETROS:
 * @param {number} clienteId - ID del cliente del que obtener los pedidos
 * 
 * RETORNA:
 * @returns {Array} - Array de pedidos del cliente, cada uno con:
 *   - id: ID del pedido
 *   - cliente_id: ID del cliente
 *   - estado: Estado actual del pedido
 *   - fecha: Fecha y hora de creación
 * 
 * EJEMPLO DE USO:
 * const pedidos = await obtenerPedidosDeCliente(123);
 * // Resultado: [
 * //   { id: 456, cliente_id: 123, estado: "pendiente", fecha: "2024-01-15 10:30:00" },
 * //   { id: 455, cliente_id: 123, estado: "entregado", fecha: "2024-01-10 15:45:00" }
 * // ]
 */
export async function obtenerPedidosDeCliente(clienteId) {
  const [rows] = await pool.query(
    `SELECT id, cliente_id, estado, fecha
     FROM pedidos
     WHERE cliente_id = ?
     ORDER BY fecha DESC`,
    [clienteId]
  );
  
  return rows;
}

/**
 * Actualizar el estado de un pedido
 * ==========================================
 * 
 * PROPÓSITO:
 * Permite actualizar el estado del pedido a medida que progresa
 * en su ciclo de vida (pendiente → pagado → enviado → entregado).
 * 
 * ESTADOS TÍPICOS:
 * - "pendiente": Pedido creado pero no pagado
 * - "pagado": Pago confirmado
 * - "enviado": Pedido en camino al cliente
 * - "entregado": Pedido recibido por el cliente
 * - "cancelado": Pedido cancelado por algún motivo
 * 
 * PARÁMETROS:
 * @param {number} idPedido - ID del pedido a actualizar
 * @param {string} nuevoEstado - Nuevo estado para el pedido
 * 
 * RETORNA:
 * @returns {Object} - Confirmación del cambio:
 *   - id: ID del pedido actualizado
 *   - estado: Nuevo estado aplicado
 * 
 * EJEMPLO DE USO:
 * const resultado = await actualizarEstado(456, "pagado");
 * // Resultado: { id: 456, estado: "pagado" }
 */
export async function actualizarEstado(idPedido, nuevoEstado) {
  // Actualizar el estado en la base de datos
  await pool.query(
    "UPDATE pedidos SET estado = ? WHERE id = ?",
    [nuevoEstado, idPedido]
  );

  // Devolver confirmación del cambio
  return { 
    id: idPedido, 
    estado: nuevoEstado 
  };
}

/**
 * Crear pedido completo con productos
 * ==========================================
 * 
 * PROPÓSITO:
 * Crea un pedido completo con sus productos en una sola operación.
 * Esta función maneja la transacción completa:
 * 1. Crear la cabecera del pedido
 * 2. Agregar todos los productos al pedido
 * 
 * PARÁMETROS:
 * @param {Object} datos - Datos del pedido
 *   @param {number} datos.cliente_id - ID del cliente
 *   @param {Array} datos.productos - Array de productos
 *     @param {number} datos.productos[].producto_id - ID del producto
 *     @param {number} datos.productos[].cantidad - Cantidad del producto
 * 
 * RETORNA:
 * @returns {Object} - Pedido creado con sus productos
 * 
 * EJEMPLO DE USO:
 * const pedido = await crear({
 *   cliente_id: 123,
 *   productos: [
 *     { producto_id: 1, cantidad: 2 },
 *     { producto_id: 3, cantidad: 1 }
 *   ]
 * });
 */
export async function crear({ cliente_id, productos = [] }) {
  try {
    // Paso 1: Crear la cabecera del pedido
    const pedido = await crearPedido(cliente_id);
    
    // Paso 2: Agregar productos al pedido (si hay productos)
    const productosAgregados = [];
    
    for (const producto of productos) {
      const lineaPedido = await agregarProductoAPedido({
        pedidoId: pedido.id,
        productoId: producto.producto_id,
        cantidad: producto.cantidad
      });
      productosAgregados.push(lineaPedido);
    }
    
    // Paso 3: Calcular el total de productos (suma de cantidades)
    const totalProductos = productos.reduce((total, producto) => total + producto.cantidad, 0);
    
    // Paso 3: Devolver el pedido completo
    return {
      id: pedido.id,
      cliente_id: pedido.cliente_id,
      estado: pedido.estado,
      productos: productosAgregados,
      total_productos: totalProductos  // Suma total de cantidades, no número de tipos
    };
    
  } catch (error) {
    console.error('Error al crear pedido completo:', error);
    throw error;
  }
}

/**
 * Alias para compatibilidad con el controlador
 */
export const obtenerPorCliente = obtenerPedidosDeCliente;
