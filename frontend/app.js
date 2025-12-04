/**
 * =====================================================================================
 * 🎓 MANUAL DIDÁCTICO: TIENDA ONLINE - FRONTEND COMPLETO
 * =====================================================================================
 * 
 * Este archivo implementa el FRONTEND COMPLETO de una tienda online moderna.
 * Trabaja en conjunto con nuestro backend Express.js para crear una experiencia
 * de e-commerce completa con autenticación JWT y gestión de carrito.
 * 
 * ARQUITECTURA FRONTEND-BACKEND:
 * 
 * 1. 🌐 COMUNICACIÓN: 
 *    Frontend (JavaScript) ←→ Backend (Express.js + MySQL)
 *    
 * 2. 🔄 FLUJO DE DATOS:
 *    HTML (Vista) ←→ JavaScript (Lógica) ←→ API REST (Datos)
 *    
 * 3. 🔐 AUTENTICACIÓN:
 *    JWT Token almacenado en localStorage para mantener sesión
 *    
 * 4. 🛒 GESTIÓN DE ESTADO:
 *    Objeto global 'estado' simula el comportamiento de React/Vue
 * 
 * TECNOLOGÍAS UTILIZADAS:
 * - JavaScript ES6+ (async/await, destructuring, arrow functions)
 * - Fetch API para comunicación con backend
 * - LocalStorage para persistencia de sesión
 * - DOM Manipulation para actualización de interfaz
 */

// ==============================================
// 🌍 CONFIGURACIÓN GLOBAL Y CONEXIÓN CON BACKEND
// ==============================================

/**
 * URL base de nuestro backend Express.js
 * 
 * EXPLICACIÓN DIDÁCTICA:
 * Esta constante define dónde está corriendo nuestro servidor backend.
 * En nuestro server.js configuramos el servidor para escuchar en puerto 3000,
 * por eso usamos "http://localhost:3000".
 * 
 * RELACIÓN CON BACKEND:
 * - Corresponde al servidor Express que configuramos en server.js
 * - Todas las rutas de API (productos, auth, pedidos) cuelgan de esta URL base
 * - En producción cambiaríamos localhost por el dominio real
 */
const URL_API = "http://localhost:3000/api";
console.log('✅ app.js cargado - Conectando con backend en:', URL_API);

/**
 * 📦 ESTADO GLOBAL DE LA APLICACIÓN
 * 
 * EXPLICACIÓN DIDÁCTICA:
 * Este objeto actúa como el "cerebro" de nuestra aplicación frontend.
 * Simula el comportamiento de frameworks como React o Vue, donde tenemos
 * un estado centralizado que controla toda la interfaz.
 * 
 * PATRÓN DE DISEÑO:
 * - Similar a Redux o Vuex en frameworks modernos
 * - Cuando el estado cambia → la interfaz se actualiza automáticamente
 * - Un solo lugar donde vive toda la información importante
 * 
 * SINCRONIZACIÓN CON BACKEND:
 * - usuario/token: Vienen del endpoint /api/auth/login
 * - productos: Vienen del endpoint /api/productos
 * - carrito: Se sincroniza con /api/pedidos cuando se crea un pedido
 */
let estado = {
  // 👤 INFORMACIÓN DEL USUARIO LOGUEADO
  // null = usuario no logueado | objeto = usuario autenticado
  // Estructura: { id: 1, nombre: "Juan", email: "juan@example.com" }
  // Origen: Respuesta del endpoint POST /api/auth/login
  usuario: null,
  
  // 🔑 TOKEN DE AUTENTICACIÓN JWT
  // null = sin autenticar | string = token válido
  // Formato: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  // Origen: Respuesta del endpoint POST /api/auth/login
  // Uso: Se envía en header Authorization: Bearer <token>
  token: null,
  
  // 📦 CATÁLOGO DE PRODUCTOS DISPONIBLES
  // Array vacío = aún no cargado | Array con objetos = productos del servidor
  // Estructura: [{ id: 1, nombre: "Producto", precio: 29.99, stock: 10 }]
  // Origen: Respuesta del endpoint GET /api/productos
  productos: [],
  
  // 🛒 CARRITO DE COMPRAS DEL USUARIO
  // Array de productos seleccionados con cantidades
  // Estructura: [{ id: 1, nombre: "Producto", precio: 29.99, cantidad: 2, stock: 10 }]
  // Flujo: Frontend → Backend cuando se crea pedido (POST /api/pedidos)
  carrito: []
};

// ==============================================
// 🔧 FUNCIONES AUXILIARES PARA COMUNICACIÓN CON BACKEND
// ==============================================

/**
 * 🔐 FUNCIÓN: getAuthHeaders()
 * 
 * PROPÓSITO EDUCATIVO:
 * Esta función es CRUCIAL para entender cómo funciona la autenticación JWT
 * en aplicaciones modernas. Prepara las cabeceras HTTP necesarias para
 * comunicarse con endpoints protegidos del backend.
 * 
 * RELACIÓN CON BACKEND:
 * En nuestro backend (auth.middleware.js) tenemos un middleware que verifica:
 * 1. Que existe la cabecera Authorization
 * 2. Que tiene el formato "Bearer <token>"
 * 3. Que el token es válido y no ha expirado
 * 
 * FLUJO DE AUTENTICACIÓN COMPLETO:
 * 1. Usuario hace login → Backend genera JWT → Frontend guarda token
 * 2. Frontend usa getAuthHeaders() → Envía token en peticiones protegidas
 * 3. Backend middleware verifica token → Permite o rechaza la petición
 * 
 * CONCEPTOS TÉCNICOS:
 * - JWT (JSON Web Token): Estándar para autenticación sin estado
 * - Bearer Token: Esquema estándar para enviar tokens en HTTP
 * - Content-Type: Le dice al servidor qué tipo de datos enviamos
 * 
 * ENDPOINTS QUE REQUIEREN AUTENTICACIÓN EN NUESTRO BACKEND:
 * - POST /api/pedidos (crear pedido)
 * - GET /api/pedidos/mis-pedidos (obtener mis pedidos)
 * 
 * @returns {Object} Objeto con cabeceras HTTP listas para fetch()
 * 
 * EJEMPLO DE USO:
 * fetch('/api/pedidos', {
 *   method: 'POST',
 *   headers: getAuthHeaders(), // ← Aquí se usa nuestra función
 *   body: JSON.stringify(datos)
 * });
 */
function getAuthHeaders() {
  // Cabeceras base que siempre necesitamos para enviar JSON
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // Si el usuario está autenticado, agregar token JWT
  if (estado.token) {
    // Formato estándar: "Bearer <token>"
    // Este es el formato que espera nuestro auth.middleware.js
    headers.Authorization = `Bearer ${estado.token}`;
  }
  
  return headers;
}

/**
 * 🔍 FUNCIÓN: estaLogueado()
 * 
 * PROPÓSITO EDUCATIVO:
 * Función de utilidad que verifica si el usuario tiene una sesión válida.
 * Es un ejemplo de cómo crear funciones pequeñas y reutilizables que
 * encapsulen lógica de negocio importante.
 * 
 * LÓGICA DE VERIFICACIÓN:
 * - Debe existir información del usuario (estado.usuario)
 * - Debe existir un token válido (estado.token)
 * - Ambas condiciones son necesarias para considerar al usuario autenticado
 * 
 * PATRÓN DE DISEÑO:
 * Esta es una "función pura" que siempre devuelve el mismo resultado
 * para el mismo estado. Facilita el testing y la comprensión del código.
 * 
 * USO EN LA APLICACIÓN:
 * - Mostrar/ocultar botones de "Agregar al carrito"
 * - Proteger funciones como crearPedido()
 * - Determinar qué secciones de la interfaz mostrar
 * 
 * @returns {boolean} true si está autenticado, false si no
 */
function estaLogueado() {
  // Usamos !! para convertir a boolean explícitamente
  // null && null = null → !!null = false
  // objeto && string = string → !!string = true
  return !!(estado.usuario && estado.token);
}

// ==============================================
// 🛒 SISTEMA DE CARRITO DE COMPRAS
// ==============================================

/**
 * 🛍️ FUNCIÓN: agregarAlCarrito(productoId, cantidad)
 * 
 * EXPLICACIÓN DIDÁCTICA COMPLETA:
 * Esta es una de las funciones más importantes de cualquier e-commerce.
 * Implementa toda la lógica necesaria para que un usuario pueda agregar
 * productos a su carrito de compras de manera segura y validada.
 * 
 * ARQUITECTURA DE VALIDACIÓN (Patrón de Seguridad por Capas):
 * 1. CAPA DE AUTENTICACIÓN: ¿El usuario puede comprar?
 * 2. CAPA DE DATOS: ¿El producto existe?
 * 3. CAPA DE NEGOCIO: ¿Hay stock suficiente?
 * 4. CAPA DE ESTADO: ¿Ya está en el carrito?
 * 5. CAPA DE INTERFAZ: Actualizar vista al usuario
 * 
 * RELACIÓN CON BACKEND:
 * - Los productos vienen del endpoint GET /api/productos
 * - La validación de stock se hace en frontend Y backend (doble validación)
 * - Cuando se crea el pedido, el backend vuelve a verificar stock
 * - El carrito se envía completo al endpoint POST /api/pedidos
 * 
 * PATRÓN DE DISEÑO UTILIZADO:
 * "Command Pattern" - Una función que encapsula una acción completa
 * con todas sus validaciones y efectos secundarios.
 * 
 * CONCEPTOS DE PROGRAMACIÓN:
 * - Validación temprana (early return) para evitar código anidado
 * - Inmutabilidad parcial (no modifica arrays originales)
 * - Separación de responsabilidades (lógica + interfaz)
 * 
 * @param {number} productoId - ID del producto a agregar
 * @param {number} cantidad - Cantidad a agregar (por defecto 1)
 */
function agregarAlCarrito(productoId, cantidad = 1) {
  // ============================================
  // 🔒 CAPA 1: VERIFICACIÓN DE AUTENTICACIÓN
  // ============================================
  
  /**
   * EXPLICACIÓN: ¿Por qué verificar autenticación aquí?
   * 
   * En una tienda real, solo los usuarios registrados pueden comprar.
   * Esto previene:
   * - Pedidos anónimos sin datos de contacto
   * - Problemas con el seguimiento de pedidos
   * - Carritos "fantasma" que no se pueden procesar
   * 
   * RELACIÓN CON BACKEND:
   * El backend también valida esto en auth.middleware.js cuando
   * se intenta crear un pedido. Esta es "validación por capas".
   */
  if (!estaLogueado()) {
    alert('⚠️ Debes iniciar sesión para agregar productos al carrito');
    return; // Termina la función inmediatamente (early return)
  }
  
  // ============================================
  // 🔍 CAPA 2: VERIFICACIÓN DE DATOS
  // ============================================
  
  /**
   * EXPLICACIÓN: Búsqueda del producto en el catálogo local
   * 
   * ¿Por qué buscar en estado.productos y no hacer fetch?
   * - Los productos ya están cargados en memoria (más rápido)
   * - Evitamos peticiones innecesarias al servidor
   * - Garantizamos que trabajamos con datos consistentes
   * 
   * MÉTODO find():
   * Devuelve el PRIMER elemento que cumple la condición
   * undefined si no encuentra nada
   */
  const producto = estado.productos.find(p => p.id === productoId);
  if (!producto) {
    alert('❌ Producto no encontrado');
    return;
  }
  
  // ============================================
  // ✅ CAPA 3: VERIFICACIÓN DE STOCK
  // ============================================
  
  /**
   * EXPLICACIÓN: Validación de stock disponible
   * 
   * ¿Por qué validar stock en frontend?
   * - Feedback inmediato al usuario (mejor UX)
   * - Evitamos peticiones destinadas a fallar
   * - Reducimos carga del servidor
   * 
   * NOTA IMPORTANTE:
   * Esta validación también se hace en backend porque el stock
   * puede cambiar entre que el usuario ve el producto y lo compra.
   */
  if (producto.stock < cantidad) {
    alert(`❌ Solo hay ${producto.stock} unidades disponibles`);
    return;
  }
  
  // ============================================
  // 🔍 CAPA 4: VERIFICACIÓN DE DUPLICADOS
  // ============================================
  
  /**
   * EXPLICACIÓN: ¿El producto ya está en el carrito?
   * 
   * Dos comportamientos posibles:
   * 1. SUMAR cantidades (más común en e-commerce)
   * 2. Reemplazar cantidad (menos común)
   * 
   * Elegimos SUMAR porque es más intuitivo para el usuario.
   * 
   * MÉTODO findIndex():
   * Devuelve la POSICIÓN del elemento encontrado
   * -1 si no encuentra nada
   */
  const productoEnCarrito = estado.carrito.find(item => item.id === productoId);
  
  if (productoEnCarrito) {
    // ========================================
    // 📈 ESCENARIO: PRODUCTO YA EN CARRITO
    // ========================================
    
    /**
     * Calcular nueva cantidad total y verificar que no exceda stock
     */
    const nuevaCantidad = productoEnCarrito.cantidad + cantidad;
    
    if (nuevaCantidad > producto.stock) {
      alert(`❌ No hay suficiente stock. Máximo: ${producto.stock}`);
      return;
    }
    
    // Actualizar cantidad directamente (modifica el objeto existente)
    productoEnCarrito.cantidad = nuevaCantidad;
    console.log(`📦 Cantidad actualizada: ${producto.nombre} x${nuevaCantidad}`);
    
  } else {
    // ========================================
    // ➕ ESCENARIO: PRODUCTO NUEVO EN CARRITO
    // ========================================
    
    /**
     * EXPLICACIÓN: Estructura del objeto carrito
     * 
     * Copiamos datos esenciales del producto pero agregamos:
     * - cantidad: Cuántas unidades quiere el usuario
     * - stock: Para validaciones futuras sin consultar catálogo
     * 
     * PATRÓN: No guardamos referencia al objeto original,
     * creamos un nuevo objeto con solo los datos que necesitamos.
     */
    estado.carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: cantidad,
      stock: producto.stock
    });
    console.log(`➕ Producto agregado al carrito: ${producto.nombre} x${cantidad}`);
  }
  
  // ============================================
  // 🎨 CAPA 5: ACTUALIZACIÓN DE INTERFAZ
  // ============================================
  
  /**
   * EXPLICACIÓN: Patrón de actualización reactiva
   * 
   * Cuando el estado cambia → la interfaz debe reflejarlo
   * Es el principio básico de frameworks como React/Vue
   * 
   * mostrarCarrito(): Regenera el HTML del carrito
   * actualizarBotonCarrito(): Actualiza contador en navegación
   */
  mostrarCarrito();
  actualizarBotonCarrito();
}

/**
 * 🗑️ FUNCIÓN: quitarDelCarrito(productoId)
 * 
 * EXPLICACIÓN DIDÁCTICA:
 * Función complementaria que permite eliminar productos del carrito.
 * Implementa el patrón "find-and-remove" muy común en programación.
 * 
 * CONCEPTOS CLAVE:
 * - findIndex() vs find(): Index nos permite eliminar por posición
 * - splice() modifica el array original (mutating method)
 * - Validación de existencia antes de eliminar
 * 
 * FLUJO DE EJECUCIÓN:
 * 1. Buscar producto en carrito por ID
 * 2. Si existe, eliminarlo del array
 * 3. Actualizar interfaz para reflejar cambio
 * 
 * @param {number} productoId - ID del producto a eliminar
 */
function quitarDelCarrito(productoId) {
  // Buscar posición del producto en el carrito
  const index = estado.carrito.findIndex(item => item.id === productoId);
  
  if (index !== -1) {
    // Guardar referencia para logging antes de eliminar
    const producto = estado.carrito[index];
    console.log(`🗑️ Producto quitado del carrito: ${producto.nombre}`);
    
    // splice(posición, cantidad) elimina elementos del array
    estado.carrito.splice(index, 1);
    
    // Actualizar interfaz para mostrar cambios
    mostrarCarrito();
    actualizarBotonCarrito();
  }
}

/**
 * ⚖️ FUNCIÓN: cambiarCantidad(productoId, nuevaCantidad)
 * 
 * EXPLICACIÓN DIDÁCTICA:
 * Permite al usuario modificar la cantidad de un producto ya en el carrito.
 * Implementa lógica especial: si cantidad llega a 0, elimina el producto.
 * 
 * VALIDACIONES IMPLEMENTADAS:
 * - Cantidad mínima: 1 (si es menor, elimina producto)
 * - Cantidad máxima: Stock disponible
 * - Existencia del producto en carrito
 * 
 * PATRÓN DE DISEÑO:
 * Delega en quitarDelCarrito() para cantidad 0 (DRY principle)
 * 
 * @param {number} productoId - ID del producto a modificar
 * @param {number} nuevaCantidad - Nueva cantidad deseada
 */
function cambiarCantidad(productoId, nuevaCantidad) {
  // Si cantidad es menor a 1, eliminar producto completamente
  if (nuevaCantidad < 1) {
    quitarDelCarrito(productoId);
    return;
  }
  
  // Buscar producto en carrito
  const productoEnCarrito = estado.carrito.find(item => item.id === productoId);
  if (productoEnCarrito) {
    // Verificar que no exceda stock disponible
    if (nuevaCantidad > productoEnCarrito.stock) {
      alert(`❌ Stock máximo: ${productoEnCarrito.stock}`);
      return;
    }
    
    // Actualizar cantidad y refrescar interfaz
    productoEnCarrito.cantidad = nuevaCantidad;
    mostrarCarrito();
    actualizarBotonCarrito();
  }
}

/**
 * 💰 FUNCIÓN: calcularTotal()
 * 
 * EXPLICACIÓN DIDÁCTICA:
 * Función pura que calcula el precio total del carrito.
 * Excelente ejemplo del método reduce() para sumar arrays.
 * 
 * MÉTODO reduce() EXPLICADO:
 * - Itera sobre cada elemento del array
 * - Ejecuta función acumuladora en cada iteración
 * - Mantiene resultado acumulado entre iteraciones
 * - Devuelve valor final acumulado
 * 
 * FÓRMULA: total = Σ(precio × cantidad) para cada producto
 * 
 * @returns {number} Precio total del carrito
 */
function calcularTotal() {
  return estado.carrito.reduce((total, item) => {
    return total + (item.precio * item.cantidad);
  }, 0); // 0 es el valor inicial del acumulador
}

/**
 * 🧹 FUNCIÓN: vaciarCarrito()
 * 
 * EXPLICACIÓN DIDÁCTICA:
 * Función de utilidad que elimina todos los productos del carrito.
 * Se usa después de crear un pedido exitoso.
 * 
 * OPERACIÓN ATÓMICA:
 * - Reinicia el array a vacío
 * - Actualiza toda la interfaz relacionada
 * - Registra la acción en console para debugging
 */
function vaciarCarrito() {
  estado.carrito = [];
  mostrarCarrito();
  actualizarBotonCarrito();
  console.log('🗑️ Carrito vaciado');
}

// ==============================================
// � GESTIÓN DE PEDIDOS
// ==============================================

/**
 * 📋 FUNCIÓN: crearPedido()
 * 
 * EXPLICACIÓN DIDÁCTICA AVANZADA:
 * Esta función representa el "corazón" de cualquier e-commerce. Convierte
 * un carrito de compras en un pedido real que se guarda en la base de datos.
 * Es un excelente ejemplo de comunicación frontend-backend completa.
 * 
 * ARQUITECTURA DE LA OPERACIÓN:
 * 
 * 1. FRONTEND: Valida y prepara datos
 * 2. HTTP REQUEST: Envía datos al backend
 * 3. BACKEND: Procesa y guarda en MySQL
 * 4. HTTP RESPONSE: Confirma resultado
 * 5. FRONTEND: Actualiza interfaz según resultado
 * 
 * RELACIÓN COMPLETA CON BACKEND:
 * 
 * 📡 ENDPOINT: POST /api/pedidos
 * 📁 CONTROLADOR: pedidos.controller.js → crearPedido()
 * 📊 MODELO: pedidos.model.js → crear()
 * 💾 BASE DE DATOS: Tablas 'pedidos' y 'pedidos_productos'
 * 🛡️ MIDDLEWARE: auth.middleware.js (verificación JWT)
 * 
 * FLUJO DE DATOS COMPLETO:
 * 
 * Frontend                Backend               Base de Datos
 * --------                -------               -------------
 * carrito[] ──────────→ req.body.productos ──→ INSERT pedidos
 *     │                       │                      │
 *     │                       ▼                      ▼
 *     │               Loop por productos ────→ INSERT pedidos_productos
 *     │                       │                      │
 *     │                       ▼                      ▼
 *     │               Calcular total ←─────── SELECT productos
 *     │                       │                      │
 *     ▼                       ▼                      │
 * Mostrar éxito ←───── Response JSON ←───────────────┘
 * 
 * CONCEPTOS TÉCNICOS AVANZADOS:
 * - Async/Await para manejar operaciones asíncronas
 * - Try/Catch para manejo robusto de errores
 * - Transformación de datos (map) antes de envío
 * - Validación en múltiples capas (frontend + backend)
 * - Actualización optimista de UI tras éxito
 * 
 * PATRONES DE DISEÑO APLICADOS:
 * - Command Pattern: Encapsula una operación completa
 * - Observer Pattern: Actualiza UI cuando cambia estado
 * - Error Handling Pattern: Manejo centralizado de errores
 */
async function crearPedido() {
  // ============================================
  // 🔒 CAPA DE SEGURIDAD: VERIFICACIONES PREVIAS
  // ============================================
  
  /**
   * VERIFICACIÓN 1: Autenticación
   * 
   * ¿Por qué verificar aquí si el backend también lo hace?
   * - Feedback inmediato al usuario (mejor UX)
   * - Evita peticiones destinadas a fallar
   * - Principio de "fail fast" en programación
   */
  if (!estaLogueado()) {
    alert('⚠️ Debes iniciar sesión para crear pedidos');
    return;
  }
  
  /**
   * VERIFICACIÓN 2: Carrito no vacío
   * 
   * Validación de negocio: No tiene sentido crear un pedido sin productos
   * El backend también validará esto, pero aquí damos feedback inmediato
   */
  if (estado.carrito.length === 0) {
    alert('⚠️ Tu carrito está vacío');
    return;
  }
  
  try {
    console.log('🛍️ Creando pedido...');
    
    // ========================================
    // 📦 TRANSFORMACIÓN DE DATOS PARA BACKEND
    // ========================================
    
    /**
     * EXPLICACIÓN: ¿Por qué transformar los datos?
     * 
     * El carrito frontend tiene estructura diferente a lo que espera el backend:
     * 
     * CARRITO FRONTEND:
     * [{ id: 1, nombre: "Producto", precio: 29.99, cantidad: 2, stock: 10 }]
     * 
     * FORMATO BACKEND ESPERADO:
     * [{ producto_id: 1, cantidad: 2 }]
     * 
     * El backend no necesita nombre, precio ni stock porque los consulta
     * directamente de la base de datos para mayor seguridad.
     */
    const productosParaPedido = estado.carrito.map(item => ({
      producto_id: item.id,    // Renombrar id → producto_id
      cantidad: item.cantidad  // Mantener solo cantidad
      // No enviamos precio, nombre, stock por seguridad
      // El backend los obtendrá de la BD para evitar manipulación
    }));
    
    console.log('📋 Productos a enviar:', productosParaPedido);
    
    // ========================================
    // 🌐 PETICIÓN HTTP AL BACKEND
    // ========================================
    
    /**
     * ESTRUCTURA DE LA PETICIÓN:
     * 
     * URL: http://localhost:3000/api/pedidos
     * MÉTODO: POST (crear recurso nuevo)
     * HEADERS: 
     *   - Content-Type: application/json (tipo de datos)
     *   - Authorization: Bearer <token> (autenticación JWT)
     * BODY: { productos: [...] } (datos del pedido)
     * 
     * RELACIÓN CON BACKEND:
     * Esta petición llega al controlador pedidos.controller.js
     * que valida el token JWT y procesa los datos.
     */
    const respuesta = await fetch(`${URL_API}/pedidos`, {
      method: 'POST',
      headers: getAuthHeaders(), // Incluye Authorization + Content-Type
      body: JSON.stringify({
        productos: productosParaPedido
      })
    });
    
    /**
     * CONVERSIÓN DE RESPUESTA:
     * fetch() devuelve un Response object
     * .json() lo convierte en objeto JavaScript
     * await espera a que termine la conversión
     */
    const datos = await respuesta.json();
    console.log('📥 Respuesta del servidor:', datos);
    
    // ========================================
    // ✅ MANEJO DE RESPUESTA EXITOSA
    // ========================================
    
    if (respuesta.ok) { // Status 200-299
      /**
       * ESTRUCTURA DE RESPUESTA EXITOSA DEL BACKEND:
       * {
       *   success: true,
       *   message: "Pedido creado exitosamente",
       *   data: {
       *     id: 123,
       *     cliente_id: 45,
       *     estado: "pendiente",
       *     productos: [...],
       *     total_productos: 5
       *   }
       * }
       */
      alert(`✅ ¡Pedido creado exitosamente! 
      Número de pedido: ${datos.data.id}
      Total de productos: ${datos.data.total_productos}`);
      
      // 🧹 LIMPIAR ESTADO TRAS ÉXITO
      vaciarCarrito(); // Carrito se vacía porque ya se convirtió en pedido
      
      // 🔄 ACTUALIZAR LISTA DE PEDIDOS
      cargarMisPedidos(); // Recarga la lista para mostrar el nuevo pedido
      
    } else {
      // ========================================
      // ❌ MANEJO DE ERRORES DEL SERVIDOR
      // ========================================
      
      /**
       * CÓDIGOS DE ERROR POSIBLES DEL BACKEND:
       * - 401: Token inválido o expirado
       * - 400: Datos inválidos (productos vacíos, etc.)
       * - 500: Error interno del servidor
       * 
       * Mostramos el mensaje del backend o un mensaje genérico
       */
      alert(datos.message || 'Error al crear el pedido');
    }
    
  } catch (error) {
    // ========================================
    // 🚨 MANEJO DE ERRORES DE RED/CÓDIGO
    // ========================================
    
    /**
     * TIPOS DE ERRORES QUE SE CAPTURAN AQUÍ:
     * - Error de red (servidor apagado, sin internet)
     * - Error de parsing JSON (respuesta malformada)
     * - Errores de JavaScript en el código
     */
    console.error('❌ Error al crear pedido:', error);
    alert('Error de conexión al crear el pedido');
  }
}

/**
 * 📋 FUNCIÓN: cargarMisPedidos()
 * 
 * EXPLICACIÓN DIDÁCTICA:
 * Función que obtiene el historial de pedidos del usuario autenticado.
 * Demuestra cómo hacer peticiones GET autenticadas al backend.
 * 
 * RELACIÓN CON BACKEND:
 * 📡 ENDPOINT: GET /api/pedidos/mis-pedidos
 * 📁 CONTROLADOR: pedidos.controller.js → getMisPedidos()
 * 📊 MODELO: pedidos.model.js → obtenerPorCliente()
 * 💾 CONSULTA SQL: JOIN entre pedidos, pedidos_productos y productos
 * 
 * FLUJO DE DATOS:
 * 1. Frontend envía GET con JWT token
 * 2. Backend extrae cliente_id del token
 * 3. Backend consulta pedidos de ese cliente
 * 4. Backend envía lista completa con productos
 * 5. Frontend muestra pedidos en interfaz
 * 
 * CONCEPTOS CLAVE:
 * - Petición GET autenticada (solo headers, sin body)
 * - Validación de sesión antes de hacer petición
 * - Manejo de respuesta con múltiples niveles de datos
 */
async function cargarMisPedidos() {
  // Solo ejecutar si el usuario está autenticado
  if (!estaLogueado()) {
    return;
  }
  
  try {
    console.log('📋 Cargando mis pedidos...');
    
    /**
     * PETICIÓN GET AUTENTICADA:
     * - No lleva body (las peticiones GET no tienen cuerpo)
     * - Headers incluyen Authorization con JWT token
     * - Backend usa token para identificar al cliente
     */
    const respuesta = await fetch(`${URL_API}/pedidos/mis-pedidos`, {
      headers: getAuthHeaders() // Solo headers, no method ni body
    });
    
    const datos = await respuesta.json();
    console.log('📥 Mis pedidos:', datos);
    
    if (respuesta.ok) {
      /**
       * ESTRUCTURA DE RESPUESTA DE PEDIDOS:
       * {
       *   success: true,
       *   message: "Se encontraron X pedidos",
       *   data: [
       *     {
       *       id: 123,
       *       cliente_id: 45,
       *       estado: "pendiente",
       *       fecha: "2023-12-04T...",
       *       productos: [
       *         { producto_id: 1, producto_nombre: "...", cantidad: 2, producto_precio: 29.99 }
       *       ]
       *     }
       *   ]
       * }
       */
      mostrarPedidos(datos.data); // Delegar visualización a función especializada
    } else {
      console.error('Error al cargar pedidos:', datos.message);
    }
    
  } catch (error) {
    console.error('❌ Error al cargar pedidos:', error);
  }
}
// ==============================================
// 🎨 FUNCIONES DE INTERFAZ VISUAL
// ==============================================

/**
 * 📦 FUNCIÓN: cargarProductos()
 * 
 * EXPLICACIÓN DIDÁCTICA:
 * Función fundamental que obtiene el catálogo de productos del backend.
 * Es una de las primeras funciones que se ejecutan al cargar la aplicación.
 * 
 * RELACIÓN CON BACKEND:
 * 📡 ENDPOINT: GET /api/productos (público, no requiere autenticación)
 * 📁 CONTROLADOR: productos.controller.js → obtenerTodos()
 * 📊 MODELO: productos.model.js → obtenerTodos()
 * 💾 CONSULTA SQL: SELECT * FROM productos
 * 
 * FLUJO DE DATOS:
 * 1. Frontend solicita catálogo al backend
 * 2. Backend consulta tabla productos en MySQL
 * 3. Backend devuelve lista completa de productos
 * 4. Frontend almacena productos en estado global
 * 5. Frontend muestra productos en interfaz
 * 
 * CONCEPTOS TÉCNICOS:
 * - Petición GET sin autenticación (endpoint público)
 * - Manejo de respuestas asíncronas con async/await
 * - Actualización de estado global tras obtener datos
 * - Separación entre obtener datos y mostrar interfaz
 */
async function cargarProductos() {
  try {
    console.log('� Cargando productos del catálogo...');
    
    const respuesta = await fetch(`${URL_API}/productos`);
    const datos = await respuesta.json();
    
    if (respuesta.ok) {
      estado.productos = datos.data || datos;
      mostrarProductos(estado.productos);
      console.log(`✅ ${estado.productos.length} productos cargados`);
    } else {
      console.error("❌ Error al cargar productos:", datos.message);
    }
  } catch (error) {
    console.error("❌ Error de conexión:", error);
    alert('Error de conexión con el servidor');
  }
}

/**
 * Mostrar productos en el HTML
 * ==========================================
 * 
 * PROPÓSITO:
 * Genera el HTML para mostrar todos los productos del catálogo.
 * Si el usuario está logueado, muestra botón "Agregar al carrito"
 * Si no está logueado, muestra botón "Inicia sesión"
 * 
 * PARÁMETROS:
 * @param {Array} productos - Lista de productos a mostrar
 */
function mostrarProductos(productos) {
  const contenedor = document.getElementById("productsGrid");
  const logueado = estaLogueado();
  
  if (!productos || productos.length === 0) {
    contenedor.innerHTML = '<p>No hay productos disponibles</p>';
    return;
  }
  
  contenedor.innerHTML = productos.map(producto => `
    <div class="product-card">
      <img src="foto.png" class="product-image" alt="${producto.nombre}">
      <h3>${producto.nombre}</h3>
      <p>${producto.descripcion}</p>
      <p class="product-price"><strong>€${producto.precio}</strong></p>
      <p class="product-stock">Stock: ${producto.stock}</p>
      
      ${logueado ? 
        // Usuario logueado: puede agregar al carrito
        `<div class="product-actions">
          <input type="number" id="cantidad-${producto.id}" min="1" max="${producto.stock}" value="1" class="cantidad-input">
          <button onclick="agregarAlCarrito(${producto.id}, parseInt(document.getElementById('cantidad-${producto.id}').value))" 
                  class="btn btn-primary" 
                  ${producto.stock === 0 ? 'disabled' : ''}>
            ${producto.stock === 0 ? '❌ Sin Stock' : '🛒 Agregar'}
          </button>
        </div>` 
        : 
        // Usuario NO logueado: debe iniciar sesión
        `<div class="product-actions">
          <button class="btn btn-warning" onclick="scrollToLogin()">
            🔒 Inicia Sesión para Comprar
          </button>
        </div>`
      }
    </div>
  `).join('');
}

/**
 * Mostrar carrito en el HTML
 * ==========================================
 */
function mostrarCarrito() {
  const carritoVacio = document.getElementById('carritoVacio');
  const carritoProductos = document.getElementById('carritoProductos');
  const carritoTotal = document.getElementById('carritoTotal');
  const totalAmount = document.getElementById('totalAmount');
  
  if (estado.carrito.length === 0) {
    // Carrito vacío
    carritoVacio.classList.remove('hidden');
    carritoProductos.classList.add('hidden');
    carritoTotal.classList.add('hidden');
  } else {
    // Carrito con productos
    carritoVacio.classList.add('hidden');
    carritoProductos.classList.remove('hidden');
    carritoTotal.classList.remove('hidden');
    
    // Generar HTML de productos en carrito
    carritoProductos.innerHTML = estado.carrito.map(item => `
      <div class="carrito-item">
        <div class="item-info">
          <h4>${item.nombre}</h4>
          <p class="item-price">€${item.precio} c/u</p>
        </div>
        <div class="item-controls">
          <button onclick="cambiarCantidad(${item.id}, ${item.cantidad - 1})" class="btn btn-small">-</button>
          <span class="item-quantity">${item.cantidad}</span>
          <button onclick="cambiarCantidad(${item.id}, ${item.cantidad + 1})" class="btn btn-small">+</button>
          <button onclick="quitarDelCarrito(${item.id})" class="btn btn-danger btn-small">🗑️</button>
        </div>
        <div class="item-total">
          €${(item.precio * item.cantidad).toFixed(2)}
        </div>
      </div>
    `).join('');
    
    // Actualizar total
    totalAmount.textContent = `€${calcularTotal().toFixed(2)}`;
  }
}

/**
 * Mostrar pedidos en el HTML
 * ==========================================
 */
function mostrarPedidos(pedidos) {
  const pedidosVacio = document.getElementById('pedidosVacio');
  const pedidosList = document.getElementById('pedidosList');
  
  if (!pedidos || pedidos.length === 0) {
    pedidosVacio.classList.remove('hidden');
    pedidosList.classList.add('hidden');
  } else {
    pedidosVacio.classList.add('hidden');
    pedidosList.classList.remove('hidden');
    
    pedidosList.innerHTML = pedidos.map(pedido => {
      const totalPedido = pedido.productos.reduce((total, prod) => {
        return total + (prod.producto_precio * prod.cantidad);
      }, 0);
      
      return `
        <div class="pedido-card">
          <div class="pedido-header">
            <h4>Pedido #${pedido.id}</h4>
            <span class="pedido-estado estado-${pedido.estado}">${pedido.estado}</span>
          </div>
          <div class="pedido-info">
            <p><strong>Fecha:</strong> ${new Date(pedido.fecha).toLocaleDateString()}</p>
            <p><strong>Total:</strong> €${totalPedido.toFixed(2)}</p>
          </div>
          <div class="pedido-productos">
            <h5>Productos:</h5>
            ${pedido.productos.map(prod => `
              <div class="pedido-producto">
                <span>${prod.producto_nombre}</span>
                <span>x${prod.cantidad}</span>
                <span>€${(prod.producto_precio * prod.cantidad).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  }
}

/**
 * Actualizar navegación según estado de autenticación
 * ==========================================
 */
function actualizarNavegacion() {
  const authNav = document.getElementById('authNav');
  const logueado = estaLogueado();
  
  if (authNav) {
    if (logueado) {
      authNav.innerHTML = `
        <span class="user-info">
          👤 Bienvenido, ${estado.usuario.nombre}
        </span>
        <span class="carrito-info" id="carritoInfo">
          🛒 Carrito (0)
        </span>
        <button id="logoutButton" class="btn btn-outline">Cerrar sesión</button>
      `;
      
      // Configurar evento de logout
      document.getElementById('logoutButton').addEventListener('click', cerrarSesion);
      
    } else {
      authNav.innerHTML = `<span class="login-prompt">🔒 Inicia sesión para poder comprar</span>`;
    }
  }
  
  // Actualizar botón del carrito
  actualizarBotonCarrito();
}

/**
 * Actualizar información del carrito en la navegación
 * ==========================================
 */
function actualizarBotonCarrito() {
  const carritoInfo = document.getElementById('carritoInfo');
  if (carritoInfo && estaLogueado()) {
    const totalItems = estado.carrito.reduce((total, item) => total + item.cantidad, 0);
    carritoInfo.textContent = `🛒 Carrito (${totalItems})`;
  }
}

/**
 * Scroll automático al formulario de login
 * ==========================================
 */
function scrollToLogin() {
  const authSection = document.getElementById('authSection');
  if (authSection) {
    authSection.scrollIntoView({ behavior: 'smooth' });
    alert('👆 Inicia sesión o regístrate para poder agregar productos al carrito');
  }
}
// ==============================================
// 🔐 AUTENTICACIÓN DE USUARIOS
// ==============================================

/**
 * Guardar sesión en memoria + localStorage
 * ==========================================
 */
function guardarSesion(token, usuario) {
  estado.token = token;
  estado.usuario = usuario;

  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(usuario));

  console.log('💾 Sesión guardada para:', usuario.nombre);
}

/**
 * Cerrar sesión
 * ==========================================
 */
function cerrarSesion() {
  estado.token = null;
  estado.usuario = null;

  localStorage.removeItem('token');
  localStorage.removeItem('user');

  // Limpiar carrito al cerrar sesión
  estado.carrito = [];

  console.log('👋 Sesión cerrada');
  mostrarInterfaz();
}

/**
 * Cargar sesión guardada del navegador
 * ==========================================
 */
function cargarSesionGuardada() {
  const tokenGuardado = localStorage.getItem('token');
  const usuarioGuardado = localStorage.getItem('user');

  if (tokenGuardado && usuarioGuardado) {
    try {
      estado.token = tokenGuardado;
      estado.usuario = JSON.parse(usuarioGuardado);
      console.log('👤 Sesión restaurada:', estado.usuario.nombre);
    } catch (err) {
      console.error('❌ Sesión corrupta, limpiando...', err);
      cerrarSesion();
    }
  }
}

/**
 * Iniciar sesión (LOGIN)
 * ==========================================
 */
async function iniciarSesion(email, password) {
  try {
    console.log('🔑 Intentando iniciar sesión...');
    
    const respuesta = await fetch(`${URL_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const datos = await respuesta.json();
    console.log('📥 Respuesta login:', respuesta.status, datos);

    if (respuesta.ok) {
      guardarSesion(datos.token, datos.usuario);
      mostrarInterfaz();
      alert(`✅ ¡Bienvenido, ${datos.usuario.nombre}! Ya puedes agregar productos al carrito.`);
    } else {
      alert(`❌ ${datos.message || 'Error al iniciar sesión'}`);
    }
  } catch (error) {
    console.error('❌ Error login:', error);
    alert('❌ No se pudo conectar con el servidor');
  }
}

/**
 * Registrar nuevo usuario
 * ==========================================
 */
async function registrarUsuario(nombre, email, password) {
  try {
    console.log('📝 Registrando nuevo usuario...');
    
    const respuesta = await fetch(`${URL_API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });

    const datos = await respuesta.json();
    console.log('📥 Respuesta registro:', respuesta.status, datos);

    if (respuesta.ok) {
      guardarSesion(datos.token, datos.usuario);
      mostrarInterfaz();
      alert(`✅ ¡Cuenta creada exitosamente! Bienvenido, ${datos.usuario.nombre}`);
    } else {
      alert(`❌ ${datos.message || 'Error al registrarse'}`);
    }
  } catch (error) {
    console.error('❌ Error registro:', error);
    alert('❌ No se pudo conectar con el servidor');
  }
}

/**
 * Mostrar/ocultar secciones según autenticación
 * ==========================================
 */
function mostrarInterfaz() {
  const authSection = document.getElementById('authSection');
  const carritoSection = document.getElementById('carritoSection');
  const pedidosSection = document.getElementById('pedidosSection');
  
  const logueado = estaLogueado();

  // Formulario login/registro
  if (authSection) {
    if (logueado) {
      authSection.classList.add('hidden');
    } else {
      authSection.classList.remove('hidden');
    }
  }
  
  // Sección del carrito
  if (carritoSection) {
    if (logueado) {
      carritoSection.classList.remove('hidden');
    } else {
      carritoSection.classList.add('hidden');
    }
  }
  
  // Sección de pedidos
  if (pedidosSection) {
    if (logueado) {
      pedidosSection.classList.remove('hidden');
      // Cargar pedidos automáticamente
      cargarMisPedidos();
    } else {
      pedidosSection.classList.add('hidden');
    }
  }

  // Actualizar navegación
  actualizarNavegacion();
  
  // Actualizar productos (para mostrar botones correctos)
  if (estado.productos.length > 0) {
    mostrarProductos(estado.productos);
  }
  
  // Mostrar carrito actual
  mostrarCarrito();
}

/**
 * Configurar eventos de formularios
 * ==========================================
 */
function configurarEventos() {
  const loginForm = document.getElementById('loginFormElement');
  const registerForm = document.getElementById('registerFormElement');
  const showRegister = document.getElementById('showRegister');
  const showLogin = document.getElementById('showLogin');
  const crearPedidoBtn = document.getElementById('crearPedidoBtn');

  // 🔑 FORMULARIO DE LOGIN
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      await iniciarSesion(email, password);
      loginForm.reset();
    });
  }

  // 📝 FORMULARIO DE REGISTRO
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nombre = document.getElementById('registerNombre').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      await registrarUsuario(nombre, email, password);
      registerForm.reset();
    });
  }

  // 🔄 CAMBIAR ENTRE LOGIN Y REGISTRO
  if (showRegister) {
    showRegister.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('loginForm').classList.add('hidden');
      document.getElementById('registerForm').classList.remove('hidden');
    });
  }

  if (showLogin) {
    showLogin.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('registerForm').classList.add('hidden');
      document.getElementById('loginForm').classList.remove('hidden');
    });
  }
  
  // 🛍️ BOTÓN CREAR PEDIDO
  if (crearPedidoBtn) {
    crearPedidoBtn.addEventListener('click', crearPedido);
  }
}

// ==============================================
// 🚀 INICIALIZACIÓN DE LA APLICACIÓN
// ==============================================

/**
 * Función principal que se ejecuta al cargar la página
 * ==========================================
 * 
 * ORDEN DE INICIALIZACIÓN:
 * 1. Cargar sesión guardada (si existe)
 * 2. Configurar eventos de formularios
 * 3. Cargar productos del catálogo
 * 4. Mostrar interfaz según estado de autenticación
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Iniciando aplicación Tienda Online...');
  
  try {
    // 1. 👤 Restaurar sesión del usuario si existe
    cargarSesionGuardada();
    console.log('✅ Sesión verificada');
    
    // 2. 🎛️ Configurar eventos de formularios y botones
    configurarEventos();
    console.log('✅ Eventos configurados');
    
    // 3. 📦 Cargar productos del catálogo
    await cargarProductos();
    console.log('✅ Productos cargados');
    
    // 4. 🎨 Actualizar interfaz según estado de autenticación
    mostrarInterfaz();
    console.log('✅ Interfaz actualizada');
    
    console.log('🎉 ¡Aplicación lista para usar!');
    console.log('📊 Estado inicial:', {
      productos: estado.productos.length,
      usuario: estado.usuario ? estado.usuario.nombre : 'No logueado',
      carrito: estado.carrito.length
    });
    
  } catch (error) {
    console.error('❌ Error al inicializar aplicación:', error);
    alert('Error al cargar la aplicación. Por favor, recarga la página.');
  }
});

// ==============================================
// 🛠️ FUNCIONES DE UTILIDAD PARA DEBUG
// ==============================================

/**
 * Funciones útiles para debugging desde la consola del navegador
 * ==========================================
 * 
 * EJEMPLOS DE USO:
 * - debug.estado() → Ver estado completo de la aplicación
 * - debug.carrito() → Ver contenido del carrito
 * - debug.login('test@example.com', '123456') → Login rápido
 */
window.debug = {
  estado: () => {
    console.table(estado);
    return estado;
  },
  
  carrito: () => {
    console.table(estado.carrito);
    return estado.carrito;
  },
  
  productos: () => {
    console.table(estado.productos);
    return estado.productos;
  },
  
  login: (email = 'test@example.com', password = '123456') => {
    return iniciarSesion(email, password);
  },
  
  logout: () => {
    cerrarSesion();
  },
  
  agregarProducto: (id = 1, cantidad = 1) => {
    agregarAlCarrito(id, cantidad);
  },
  
  crearPedidoPrueba: () => {
    if (estado.carrito.length === 0) {
      console.log('Agregando productos de prueba al carrito...');
      agregarAlCarrito(1, 2);
      agregarAlCarrito(2, 1);
    }
    return crearPedido();
  }
};

console.log('🧪 Funciones de debug disponibles en window.debug');
console.log('💡 Ejemplo: debug.estado() para ver el estado de la app');
