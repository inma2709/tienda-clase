import pool from './config/db.js'; // Ajusta tu import según tu configuración

async function crearBBDD() {
  // TABLA CLIENTES
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // TABLA PRODUCTOS
  await pool.query(`
    CREATE TABLE IF NOT EXISTS productos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      descripcion TEXT,
      precio DECIMAL(10,2) NOT NULL,
      stock INT DEFAULT 0,
      categoria VARCHAR(50) NOT NULL,
      imagen_url VARCHAR(500),
      activo BOOLEAN DEFAULT TRUE,
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // TABLA PEDIDOS
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cliente_id INT NOT NULL,
      estado ENUM('pendiente', 'pagado', 'enviado', 'entregado') DEFAULT 'pendiente',
      total DECIMAL(10,2) DEFAULT 0.00,
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
    )
  `);

  // TABLA DETALLE DE PEDIDOS
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pedidos_productos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      pedido_id INT NOT NULL,
      producto_id INT NOT NULL,
      cantidad INT DEFAULT 1,
      precio_unitario DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
      FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
    )
  `);

  console.log("✅ Base de datos creada correctamente");
}

async function insertarDatosEjemplo() {
  try {
    // PRODUCTOS DE EJEMPLO (solo 3 categorías)
    await pool.query(`
      INSERT INTO productos (nombre, descripcion, precio, stock, categoria, imagen_url) VALUES
      ('Camiseta Básica', 'Camiseta de algodón cómoda', 19.99, 50, 'Ropa', 'https://via.placeholder.com/300x300/4CAF50/FFFFFF?text=Camiseta'),
      ('Pantalón Vaquero', 'Vaqueros clásicos azules', 49.99, 30, 'Ropa', 'https://via.placeholder.com/300x300/2196F3/FFFFFF?text=Pantalon'),
      ('Zapatillas Sport', 'Zapatillas cómodas para deporte', 79.99, 25, 'Ropa', 'https://via.placeholder.com/300x300/FF9800/FFFFFF?text=Zapatillas'),
      ('El Quijote', 'Clásico de la literatura española', 12.50, 20, 'Libros', 'https://via.placeholder.com/300x300/9C27B0/FFFFFF?text=Libro'),
      ('Guía JavaScript', 'Manual para programadores', 35.99, 15, 'Libros', 'https://via.placeholder.com/300x300/3F51B5/FFFFFF?text=JS+Book'),
      ('Smartphone Basic', 'Teléfono inteligente sencillo', 199.99, 10, 'Electrónica', 'https://via.placeholder.com/300x300/F44336/FFFFFF?text=Phone'),
      ('Auriculares', 'Auriculares con buen sonido', 29.99, 40, 'Electrónica', 'https://via.placeholder.com/300x300/795548/FFFFFF?text=Audio')
    `);

    // USUARIOS DE PRUEBA (password '123456' hasheada)
    await pool.query(`
      INSERT INTO clientes (nombre, email, password) VALUES
      ('Juan Pérez', 'test@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.JfVK7fCQpNpCPq9QdoW6lQk1K6kMSO'),
      ('Ana García', 'ana@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.JfVK7fCQpNpCPq9QdoW6lQk1K6kMSO'),
      ('Carlos López', 'carlos@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.JfVK7fCQpNpCPq9QdoW6lQk1K6kMSO')
    `);

    // PEDIDOS DE EJEMPLO
    await pool.query(`
      INSERT INTO pedidos (cliente_id, estado, total) VALUES
      (1, 'pendiente', 69.98),
      (2, 'enviado', 45.48),
      (1, 'entregado', 25.99)
    `);

    // DETALLE DE PEDIDOS
    await pool.query(`
      INSERT INTO pedidos_productos (pedido_id, producto_id, cantidad, precio_unitario) VALUES
      (1, 1, 2, 19.99),
      (1, 6, 1, 199.99),
      (2, 4, 1, 12.50),
      (2, 5, 1, 35.99),
      (3, 3, 1, 79.99)
    `);

    console.log("✅ Datos de ejemplo insertados correctamente");
  } catch (error) {
    console.error("❌ Error insertando datos:", error.message);
  }
}

// Ejecutar todo
(async () => {
  await crearBBDD();
  await insertarDatosEjemplo();
})();
