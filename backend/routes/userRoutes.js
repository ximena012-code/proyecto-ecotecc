import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getUserStats,
  getAllUsers,
  getUserStatusStats,
  toggleUserStatus,
  getUserById,
  getMyProfile,
  updateUserInfo,
  updatePassword,
  getRegistroTendencia
} from '../controllers/userController.js';

const router = express.Router();

// Tendencia de registros (importante que esté ANTES de /:id)
router.get('/tendencia-registros', authenticateToken, getRegistroTendencia);

// Perfil del usuario actual
router.get('/profile', authenticateToken, getMyProfile);

// Obtener usuario por ID
router.get('/:id', authenticateToken, getUserById);

// Actualización de datos
router.put('/update', authenticateToken, updateUserInfo);
router.put('/update-password', authenticateToken, updatePassword);

// Estadísticas generales de usuarios
router.get('/stats', authenticateToken, getUserStats);
router.get('/stats/status', authenticateToken, getUserStatusStats);

// Obtener todos los usuarios (admin)
router.get('/', authenticateToken, getAllUsers);

// Cambiar estado (activar/desactivar)
router.put('/:id_usuario/toggle-status', authenticateToken, toggleUserStatus);


export default router;
