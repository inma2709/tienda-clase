// backend-bazar/middlewares/auth.middleware.js
import jwt from "jsonwebtoken";

/**
 * ==========================================
 * MIDDLEWARE DE AUTENTICACIÓN JWT
 * ==========================================
 * 
 * PROPÓSITO:
 * Este middleware protege las rutas que requieren autenticación.
 * Verifica que el usuario haya enviado un token JWT válido
 * en la cabecera Authorization de la petición.
 * 
 * FLUJO DE AUTENTICACIÓN:
 * 1. El usuario hace login → recibe un token JWT
 * 2. Para acceder a rutas protegidas, incluye el token en la cabecera:
 *    Authorization: Bearer <token>
 * 3. Este middleware verifica que el token sea válido
 * 4. Si es válido, extrae los datos del usuario y continúa
 * 5. Si no es válido, devuelve error 401 (No autorizado)
 * 
 * USO:
 * import { verificarToken } from '../middlewares/auth.middleware.js';
 * router.get('/ruta-protegida', verificarToken, controlador);
 */

/**
 * Middleware para verificar token JWT
 * ==========================================
 * 
 * PARÁMETROS:
 * @param {Object} req - Objeto de petición de Express
 * @param {Object} res - Objeto de respuesta de Express  
 * @param {Function} next - Función para continuar al siguiente middleware
 * 
 * COMPORTAMIENTO:
 * - Si el token es válido: añade req.user con los datos del usuario y llama next()
 * - Si el token es inválido: devuelve error 401 y no llama next()
 * 
 * ESTRUCTURA DE req.user (después de verificación exitosa):
 * {
 *   id: number,        // ID del usuario en la base de datos
 *   email: string,     // Email del usuario
 *   nombre: string     // Nombre del usuario
 * }
 * 
 * ERRORES POSIBLES:
 * - 401: Falta cabecera Authorization
 * - 401: Formato de token no válido (debe ser "Bearer <token>")
 * - 401: Token JWT no válido o expirado
 */
export function verificarToken(req, res, next) {
  // ==========================================
  // PASO 1: Extraer token de la cabecera
  // ==========================================
  
  // Leer la cabecera Authorization
  const authHeader = req.headers.authorization;

  // Verificar que la cabecera existe
  if (!authHeader) {
    return res.status(401).json({ 
      mensaje: "Falta cabecera Authorization",
      detalle: "Debes incluir 'Authorization: Bearer <token>' en la petición"
    });
  }

  // ==========================================
  // PASO 2: Validar formato del token
  // ==========================================
  
  // Esperamos formato: "Bearer <token_jwt>"
  const [bearer, token] = authHeader.split(" ");

  // Verificar que tiene el formato correcto
  if (bearer !== "Bearer" || !token) {
    return res.status(401).json({ 
      mensaje: "Formato de token no válido",
      detalle: "El formato debe ser: 'Bearer <token>'"
    });
  }

  // ==========================================
  // PASO 3: Verificar y decodificar el token
  // ==========================================
  
  try {
    // Verificar el token con la clave secreta del entorno
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ==========================================
    // PASO 4: Preparar datos del usuario
    // ==========================================
    
    // Guardar los datos del usuario decodificado en req.user
    // Estos datos estarán disponibles en todos los controladores
    // que usen este middleware
    req.user = {
      cliente_id: decoded.cliente_id, // ID del cliente en la base de datos
      id: decoded.cliente_id,         // Alias para compatibilidad
      email: decoded.email,           // Email del usuario (si está en el token)
      nombre: decoded.nombre          // Nombre del usuario (si está en el token)
    };

    // ==========================================
    // PASO 5: Continuar con el siguiente middleware/controlador
    // ==========================================
    
    // El token es válido, continuar con la siguiente función
    next();

  } catch (error) {
    // ==========================================
    // MANEJO DE ERRORES DE JWT
    // ==========================================
    
    console.error("Error al verificar token:", error.message);
    
    // Determinar el tipo de error específico
    let mensaje = "Token no válido";
    
    if (error.name === "TokenExpiredError") {
      mensaje = "Token expirado";
    } else if (error.name === "JsonWebTokenError") {
      mensaje = "Token malformado";
    } else if (error.name === "NotBeforeError") {
      mensaje = "Token no es válido todavía";
    }

    return res.status(401).json({ 
      mensaje: mensaje,
      detalle: "Por favor, inicia sesión nuevamente"
    });
  }
}

/**
 * ALIAS para compatibilidad
 * ==========================================
 * Algunos archivos pueden usar el nombre verifyToken en lugar de verificarToken
 */
export const verifyToken = verificarToken;