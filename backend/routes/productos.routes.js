// routes/productos.routes.js
import { Router } from 'express';
import * as productosController from '../controllers/productos.controller.js';

const router = Router();

/**
 * ==========================================
 * 📦 RUTAS DE PRODUCTOS
 * ==========================================
 */

// Obtener todos los productos
router.get('/', productosController.getProductos);



export default router;
