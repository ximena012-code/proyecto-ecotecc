import express from 'express';
import { obtenerNotificaciones, marcarComoLeida, crearNotificacionCompra } from '../helpers/notificaciones.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();


router.get('/', authenticateToken, obtenerNotificaciones);
router.put('/:id/leida', authenticateToken, marcarComoLeida);

// Endpoint para registrar notificación de compra exitosa
router.post('/', authenticateToken, crearNotificacionCompra);

export default router;