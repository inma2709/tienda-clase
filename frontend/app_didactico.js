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
 * 
 * ESTRUCTURA DEL MANUAL:
 * ========================
 * 1. Configuración y Estado Global
 * 2. Funciones Auxiliares para Backend
 * 3. Sistema de Carrito de Compras
 * 4. Sistema de Gestión de Pedidos
 * 5. Funciones de Interfaz Visual
 * 6. Sistema de Autenticación
 * 7. Inicialización y Debug
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
 * 
 * ENDPOINTS DISPONIBLES EN NUESTRO BACKEND:
 * - GET  /api/productos          (público - obtener catálogo)
 * - POST /api/auth/register      (público - crear cuenta)
 * - POST /api/auth/login         (público - iniciar sesión)
 * - POST /api/pedidos            (privado - crear pedido)
 * - GET  /api/pedidos/mis-pedidos (privado - obtener mis pedidos)
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
 * - "Single Source of Truth" para toda la aplicación
 * 
 * SINCRONIZACIÓN CON BACKEND:
 * - usuario/token: Vienen del endpoint POST /api/auth/login
 * - productos: Vienen del endpoint GET /api/productos  
 * - carrito: Se sincroniza con POST /api/pedidos cuando se crea un pedido
 * 
 * PERSISTENCIA:
 * - usuario/token se guardan en localStorage para mantener sesión
 * - productos se recargan en cada sesión desde el servidor
 * - carrito se mantiene solo en memoria (se pierde al recargar)
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
  // Estructura: [{ id: 1, nombre: "Producto", precio: 29.99, stock: 10, descripcion: "..." }]
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
 * En nuestro backend (middlewares/auth.middleware.js) tenemos un middleware que verifica:
 * 1. Que existe la cabecera Authorization
 * 2. Que tiene el formato "Bearer <token>"
 * 3. Que el token es válido y no ha expirado
 * 4. Extrae la información del usuario del token
 * 
 * FLUJO DE AUTENTICACIÓN COMPLETO:
 * 
 * 1. 🔑 INICIO DE SESIÓN:
 *    Usuario → POST /api/auth/login → Backend genera JWT → Frontend guarda token
 * 
 * 2. 📡 PETICIONES AUTENTICADAS:
 *    Frontend usa getAuthHeaders() → Envía token en peticiones protegidas
 * 
 * 3. 🛡️ VERIFICACIÓN:
 *    Backend middleware verifica token → Permite o rechaza la petición
 * 
 * 4. 📤 RESPUESTA:
 *    Si token válido → Procesa petición | Si inválido → Error 401
 * 
 * CONCEPTOS TÉCNICOS:
 * - JWT (JSON Web Token): Estándar para autenticación sin estado
 * - Bearer Token: Esquema estándar para enviar tokens en HTTP
 * - Content-Type: Le dice al servidor qué tipo de datos enviamos
 * - Authorization Header: Cabecera estándar para autenticación HTTP
 * 
 * ENDPOINTS QUE REQUIEREN AUTENTICACIÓN EN NUESTRO BACKEND:
 * - POST /api/pedidos (crear pedido) → requiere usuario autenticado
 * - GET /api/pedidos/mis-pedidos (obtener mis pedidos) → requiere usuario autenticado
 * 
 * ENDPOINTS PÚBLICOS (no requieren token):
 * - GET /api/productos → cualquiera puede ver el catálogo
 * - POST /api/auth/register → crear cuenta nueva
 * - POST /api/auth/login → iniciar sesión
 * 
 * @returns {Object} Objeto con cabeceras HTTP listas para fetch()
 * 
 * EJEMPLO DE USO PRÁCTICO:
 * ```javascript
 * // Crear un pedido (requiere autenticación)
 * const respuesta = await fetch('/api/pedidos', {
 *   method: 'POST',
 *   headers: getAuthHeaders(), // ← Aquí se usa nuestra función
 *   body: JSON.stringify({ productos: [...] })
 * });
 * 
 * // Si no estuviéramos autenticados, el backend devolvería error 401
 * ```
 */
function getAuthHeaders() {
  // Cabeceras base que siempre necesitamos para enviar JSON
  const headers = {
    // Le dice al servidor que estamos enviando datos en formato JSON
    // Sin esto, el servidor no sabría cómo interpretar el body
    'Content-Type': 'application/json'
  };
  
  // Si el usuario está autenticado, agregar token JWT
  if (estado.token) {
    // Formato estándar RFC 6750: "Bearer <token>"
    // Este es exactamente el formato que espera nuestro auth.middleware.js
    headers.Authorization = `Bearer ${estado.token}`;
  }
  
  return headers;
}

/**
 * 🔍 FUNCIÓN: estaLogueado()
 * 
 * PROPÓSITO EDUCATIVO:
 * Función de utilidad que verifica si el usuario tiene una sesión válida.
 * Es un ejemplo perfecto de cómo crear funciones pequeñas y reutilizables
 * que encapsulen lógica de negocio importante.
 * 
 * LÓGICA DE VERIFICACIÓN:
 * Para considerar a un usuario autenticado necesitamos DOS cosas:
 * - Debe existir información del usuario (estado.usuario)
 * - Debe existir un token válido (estado.token)
 * - Ambas condiciones son necesarias (operador &&)
 * 
 * CASOS DE USO EN LA APLICACIÓN:
 * - Mostrar/ocultar botones de "Agregar al carrito"
 * - Proteger funciones como crearPedido()
 * - Determinar qué secciones de la interfaz mostrar
 * - Mostrar mensaje de "Inicia sesión" vs datos del usuario
 * 
 * PATRÓN DE DISEÑO:
 * Esta es una "función pura" que:
 * - No modifica ningún estado externo
 * - Siempre devuelve el mismo resultado para el mismo estado
 * - Facilita el testing y la comprensión del código
 * - Es predecible y sin efectos secundarios
 * 
 * NOTA TÉCNICA:
 * Usamos !! (doble negación) para convertir explícitamente a boolean:
 * - null && null = null → !!null = false
 * - objeto && string = string → !!string = true
 * - undefined && "token" = undefined → !!undefined = false
 * 
 * @returns {boolean} true si está autenticado, false si no
 */
function estaLogueado() {
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
 * - Los productos vienen del endpoint GET /api/productos (tabla productos)
 * - La validación de stock se hace en frontend Y backend (doble validación)
 * - Cuando se crea el pedido, el backend vuelve a verificar stock actualizado
 * - El carrito completo se envía al endpoint POST /api/pedidos
 * 
 * ¿POR QUÉ DOBLE VALIDACIÓN?
 * - Frontend: Feedback inmediato, mejor UX, menos carga en servidor
 * - Backend: Seguridad real, datos pueden cambiar, consistencia en BD
 * 
 * PATRÓN DE DISEÑO UTILIZADO:
 * "Command Pattern" - Una función que encapsula una acción completa
 * con todas sus validaciones y efectos secundarios.
 * 
 * CONCEPTOS DE PROGRAMACIÓN AVANZADOS:
 * - Validación temprana (early return) para evitar código anidado
 * - Inmutabilidad parcial (no modifica arrays originales)
 * - Separación de responsabilidades (lógica + interfaz)
 * - Manejo de estado centralizado
 * 
 * @param {number} productoId - ID del producto a agregar (debe existir en estado.productos)
 * @param {number} cantidad - Cantidad a agregar (por defecto 1, debe ser > 0)
 */
function agregarAlCarrito(productoId, cantidad = 1) {
  // ============================================
  // 🔒 CAPA 1: VERIFICACIÓN DE AUTENTICACIÓN
  // ============================================
  
  /**
   * EXPLICACIÓN: ¿Por qué verificar autenticación aquí?
   * 
   * En una tienda real, solo los usuarios registrados pueden comprar porque:
   * - Necesitamos datos de contacto para envío
   * - Necesitamos datos de facturación
   * - Queremos evitar pedidos "fantasma"
   * - Queremos ofrecer historial de compras
   * 
   * RELACIÓN CON BACKEND:
   * El backend también valida esto en auth.middleware.js cuando
   * se intenta crear un pedido. Esta es "validación por capas":
   * - Frontend: Previene peticiones innecesarias
   * - Backend: Garantiza seguridad real
   * 
   * ALTERNATIVAS DE DISEÑO:
   * Algunas tiendas permiten carrito sin registro pero requieren
   * datos al momento del checkout. Nosotros elegimos registro
   * obligatorio para simplificar el flujo.
   */
  if (!estaLogueado()) {
    alert('⚠️ Debes iniciar sesión para agregar productos al carrito');
    return; // Termina la función inmediatamente (early return pattern)
  }
  
  // ============================================
  // 🔍 CAPA 2: VERIFICACIÓN DE DATOS
  // ============================================
  
  /**
   * EXPLICACIÓN: Búsqueda del producto en el catálogo local
   * 
   * ¿Por qué buscar en estado.productos y no hacer fetch al servidor?
   * - ✅ Los productos ya están cargados en memoria (más rápido)
   * - ✅ Evitamos peticiones innecesarias al servidor (mejor performance)
   * - ✅ Garantizamos que trabajamos con datos consistentes
   * - ✅ Mejor experiencia de usuario (sin esperas)
   * 
   * MÉTODO find() EXPLICADO:
   * - Itera sobre el array hasta encontrar el primer elemento que cumple la condición
   * - Devuelve el objeto completo si lo encuentra
   * - Devuelve undefined si no encuentra nada
   * - Se detiene en la primera coincidencia (más eficiente que filter)
   * 
   * COMPARACIÓN CON OTROS MÉTODOS:
   * - findIndex(): Devuelve la posición, no el objeto
   * - filter(): Devuelve array con todos los que coinciden
   * - some(): Devuelve solo true/false si existe
   * - includes(): Para valores primitivos, no objetos
   */
  const producto = estado.productos.find(p => p.id === productoId);
  if (!producto) {
    alert('❌ Producto no encontrado');
    console.error('Producto no encontrado:', productoId, 'en catálogo:', estado.productos);
    return;
  }
  
  // ============================================
  // ✅ CAPA 3: VERIFICACIÓN DE STOCK DISPONIBLE
  // ============================================
  
  /**
   * EXPLICACIÓN: Validación de stock disponible
   * 
   * ¿Por qué validar stock en frontend?
   * - ✅ Feedback inmediato al usuario (mejor UX)
   * - ✅ Evitamos peticiones destinadas a fallar
   * - ✅ Reducimos carga innecesaria del servidor
   * - ✅ Prevenimos frustración del usuario
   * 
   * IMPORTANTE - VALIDACIÓN DOBLE:
   * Esta validación también se hace en backend porque:
   * - El stock puede cambiar entre que el usuario ve el producto y lo compra
   * - Otros usuarios pueden comprar mientras este navega
   * - Los datos frontend pueden estar desactualizados
   * - La seguridad real siempre debe estar en backend
   * 
   * FLUJO COMPLETO DE STOCK:
   * 1. Frontend carga productos con stock actual
   * 2. Frontend valida stock antes de agregar al carrito
   * 3. Usuario navega (stock puede cambiar en servidor)
   * 4. Usuario crea pedido
   * 5. Backend valida stock actualizado en tiempo real
   * 6. Backend procesa o rechaza según stock disponible
   */
  if (producto.stock < cantidad) {
    alert(`❌ Solo hay ${producto.stock} unidades disponibles`);
    console.warn('Stock insuficiente:', { disponible: producto.stock, solicitado: cantidad });
    return;
  }
  
  // ============================================
  // 🔍 CAPA 4: VERIFICACIÓN DE DUPLICADOS EN CARRITO
  // ============================================
  
  /**
   * EXPLICACIÓN: ¿El producto ya está en el carrito?
   * 
   * Dos comportamientos posibles en e-commerce:
   * 1. SUMAR cantidades (más común y elegido aquí)
   * 2. Reemplazar cantidad (menos común)
   * 3. Crear líneas separadas (muy raro)
   * 
   * Elegimos SUMAR porque:
   * - Es más intuitivo para el usuario
   * - Evita duplicados confusos en la vista
   * - Es el comportamiento esperado en la mayoría de tiendas
   * - Facilita el cálculo de totales
   * 
   * MÉTODO find() vs findIndex():
   * - find(): Devuelve el objeto (lo necesitamos para modificarlo)
   * - findIndex(): Devuelve posición (útil para eliminar)
   */
  const productoEnCarrito = estado.carrito.find(item => item.id === productoId);
  
  if (productoEnCarrito) {
    // ========================================
    // 📈 ESCENARIO: PRODUCTO YA EN CARRITO - SUMAR CANTIDAD
    // ========================================
    
    /**
     * Calcular nueva cantidad total y verificar límites
     * 
     * VALIDACIÓN CRÍTICA:
     * No podemos simplemente sumar sin verificar stock porque
     * el usuario podría intentar agregar más de lo disponible.
     */
    const nuevaCantidad = productoEnCarrito.cantidad + cantidad;
    
    // Verificar que la nueva cantidad no exceda stock disponible
    if (nuevaCantidad > producto.stock) {
      alert(`❌ No hay suficiente stock. Máximo: ${producto.stock}`);
      console.warn('Límite de stock alcanzado:', { 
        cantidadEnCarrito: productoEnCarrito.cantidad,
        cantidadAAgregar: cantidad,
        stockDisponible: producto.stock 
      });
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
     * ¿Qué datos copiamos del producto y por qué?
     * 
     * COPIAMOS:
     * - id: Para identificar el producto de manera única
     * - nombre: Para mostrar en la interfaz del carrito
     * - precio: Para calcular totales (aunque el backend re-validará)
     * - stock: Para validaciones futuras sin consultar catálogo
     * 
     * AGREGAMOS:
     * - cantidad: Nueva propiedad que indica cuántas unidades quiere el usuario
     * 
     * NO COPIAMOS:
     * - descripcion: No es necesaria en el carrito
     * - imagen: Podríamos, pero no la usamos en la vista de carrito
     * 
     * PATRÓN DE DISEÑO:
     * No guardamos referencia al objeto original del catálogo,
     * creamos un nuevo objeto con solo los datos que necesitamos.
     * Esto evita efectos secundarios y hace el código más predecible.
     */
    estado.carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: cantidad,
      stock: producto.stock // Para validaciones futuras
    });
    console.log(`➕ Producto agregado al carrito: ${producto.nombre} x${cantidad}`);
  }
  
  // ============================================
  // 🎨 CAPA 5: ACTUALIZACIÓN DE INTERFAZ
  // ============================================
  
  /**
   * EXPLICACIÓN: Patrón de actualización reactiva
   * 
   * Principio fundamental: Cuando el estado cambia → la interfaz debe reflejarlo
   * Este es el principio básico de frameworks como React/Vue/Angular
   * 
   * FUNCIONES LLAMADAS:
   * - mostrarCarrito(): Regenera completamente el HTML del carrito
   * - actualizarBotonCarrito(): Actualiza contador en la navegación
   * 
   * ¿POR QUÉ NO SOLO ACTUALIZAR EL ELEMENTO ESPECÍFICO?
   * Porque es más complejo y propenso a errores. Elegimos simplicidad:
   * - Regenerar todo es más predecible
   * - Menos bugs por estados inconsistentes
   * - Código más fácil de mantener
   * - Performance suficientemente buena para nuestros casos
   */
  mostrarCarrito();
  actualizarBotonCarrito();
}

/**
 * 🗑️ FUNCIÓN: quitarDelCarrito(productoId)
 * 
 * EXPLICACIÓN DIDÁCTICA:
 * Función complementaria que permite eliminar productos completamente del carrito.
 * Implementa el patrón "find-and-remove" muy común en programación.
 * 
 * CASOS DE USO:
 * - Usuario hace clic en el botón 🗑️ de eliminar
 * - Usuario reduce cantidad a 0 (llamado desde cambiarCantidad)
 * - Limpiar productos específicos programáticamente
 * 
 * CONCEPTOS TÉCNICOS CLAVE:
 * - findIndex() vs find(): Index nos permite eliminar por posición
 * - splice() modifica el array original (mutating method)
 * - Validación de existencia antes de eliminar (defensive programming)
 * 
 * FLUJO DE EJECUCIÓN:
 * 1. Buscar producto en carrito por ID
 * 2. Si existe, guardamos referencia para logging
 * 3. Eliminamos del array usando splice
 * 4. Actualizamos interfaz para reflejar cambio
 * 
 * @param {number} productoId - ID del producto a eliminar del carrito
 */
function quitarDelCarrito(productoId) {
  // Buscar posición del producto en el carrito
  // findIndex devuelve -1 si no encuentra el elemento
  const index = estado.carrito.findIndex(item => item.id === productoId);
  
  if (index !== -1) {
    // Guardar referencia para logging antes de eliminar
    // (después de splice ya no tendremos acceso al objeto)
    const producto = estado.carrito[index];
    console.log(`🗑️ Producto quitado del carrito: ${producto.nombre}`);
    
    // splice(posición, cantidad) elimina elementos del array
    // splice modifica el array original (método mutating)
    estado.carrito.splice(index, 1);
    
    // Actualizar interfaz para mostrar cambios
    mostrarCarrito();
    actualizarBotonCarrito();
  } else {
    // Caso edge: intentan eliminar producto que no existe
    console.warn(`⚠️ Intento de eliminar producto inexistente: ${productoId}`);
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
 * PATRÓN DE DISEÑO - DRY (Don't Repeat Yourself):
 * Delega en quitarDelCarrito() para cantidad 0 en lugar de
 * duplicar la lógica de eliminación.
 * 
 * CASOS DE USO:
 * - Usuario hace clic en botones +/-
 * - Usuario edita directamente el campo de cantidad
 * - Funciones programáticas de ajuste
 * 
 * @param {number} productoId - ID del producto a modificar
 * @param {number} nuevaCantidad - Nueva cantidad deseada (0 = eliminar)
 */
function cambiarCantidad(productoId, nuevaCantidad) {
  // Si cantidad es menor a 1, eliminar producto completamente
  if (nuevaCantidad < 1) {
    quitarDelCarrito(productoId); // Delegar en función especializada
    return;
  }
  
  // Buscar producto en carrito
  const productoEnCarrito = estado.carrito.find(item => item.id === productoId);
  
  if (productoEnCarrito) {
    // Verificar que no exceda stock disponible
    if (nuevaCantidad > productoEnCarrito.stock) {
      alert(`❌ Stock máximo: ${productoEnCarrito.stock}`);
      console.warn('Intento de exceder stock:', { 
        producto: productoEnCarrito.nombre,
        cantidadSolicitada: nuevaCantidad,
        stockDisponible: productoEnCarrito.stock 
      });
      return;
    }
    
    // Actualizar cantidad y refrescar interfaz
    productoEnCarrito.cantidad = nuevaCantidad;
    console.log(`🔄 Cantidad modificada: ${productoEnCarrito.nombre} → ${nuevaCantidad}`);
    
    mostrarCarrito();
    actualizarBotonCarrito();
  } else {
    console.error(`❌ Producto no encontrado en carrito: ${productoId}`);
  }
}

/**
 * 💰 FUNCIÓN: calcularTotal()
 * 
 * EXPLICACIÓN DIDÁCTICA:
 * Función pura que calcula el precio total del carrito.
 * Excelente ejemplo del método reduce() para operaciones de agregación.
 * 
 * MÉTODO reduce() EXPLICADO PASO A PASO:
 * 
 * ¿Cómo funciona reduce?
 * reduce(función, valorInicial) → valorFinal
 * 
 * La función recibe:
 * - total: Acumulador (resultado parcial)
 * - item: Elemento actual del array
 * 
 * En cada iteración:
 * 1. Calcula precio × cantidad para el item actual
 * 2. Lo suma al total acumulado
 * 3. Devuelve el nuevo total
 * 4. Este nuevo total se pasa como 'total' en la siguiente iteración
 * 
 * EJEMPLO PASO A PASO:
 * Carrito: [
 *   { precio: 10, cantidad: 2 },  // 10 × 2 = 20
 *   { precio: 15, cantidad: 1 },  // 15 × 1 = 15
 *   { precio: 5, cantidad: 3 }    // 5 × 3 = 15
 * ]
 * 
 * Iteración 1: total=0 + (10×2) = 20
 * Iteración 2: total=20 + (15×1) = 35
 * Iteración 3: total=35 + (5×3) = 50
 * Resultado final: 50
 * 
 * FÓRMULA MATEMÁTICA: 
 * Total = Σ(precio_i × cantidad_i) para i = 1 hasta n productos
 * 
 * ¿POR QUÉ ES UNA FUNCIÓN PURA?
 * - No modifica ningún estado externo
 * - Siempre devuelve el mismo resultado para el mismo input
 * - No tiene efectos secundarios
 * - Fácil de testear y debuggear
 * 
 * @returns {number} Precio total del carrito en euros
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
 * Se usa principalmente después de crear un pedido exitoso.
 * 
 * CASOS DE USO:
 * - Después de completar una compra exitosa
 * - Botón "Vaciar carrito" (si decidimos agregarlo)
 * - Al cerrar sesión (opcional, según UX deseado)
 * - Reset programático del carrito
 * 
 * OPERACIÓN ATÓMICA:
 * Todas las acciones se ejecutan como una unidad:
 * - Reinicia el array a vacío
 * - Actualiza toda la interfaz relacionada
 * - Registra la acción en console para debugging
 * 
 * ALTERNATIVAS DE IMPLEMENTACIÓN:
 * - estado.carrito.length = 0 (también vacía el array)
 * - estado.carrito.splice(0) (elimina todos los elementos)
 * - Elegimos asignación directa por claridad
 */
function vaciarCarrito() {
  estado.carrito = []; // Reemplazar con array vacío
  mostrarCarrito();    // Actualizar vista del carrito
  actualizarBotonCarrito(); // Actualizar contador en navegación
  console.log('🗑️ Carrito vaciado'); // Log para debugging
}
