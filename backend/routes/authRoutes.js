import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { solicitarReset, resetearPassword } from '../controllers/authController.js';


const router = express.Router();

// Rutas de autenticación
router.post('/register', registerUser);
router.post('/login', loginUser);

// Solicitar correo de recuperación
router.post('/forgot-password', solicitarReset);
// Resetear contraseña
router.post('/reset-password', resetearPassword);

export default router;
