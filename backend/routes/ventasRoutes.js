import express from 'express';
import multer from 'multer';
import { obtenerVentasPorPeriodo, obtenerResumenVentas, venderDispositivo, getDispositivoDetalle,
  getDispositivoPorId } from '../controllers/ventasController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/por-periodo', authenticateToken, obtenerVentasPorPeriodo);
router.get('/resumen', authenticateToken, obtenerResumenVentas);
router.post('/vender', authenticateToken, upload.single('imagen'), venderDispositivo);
router.get('/dispositivo/:userId', authenticateToken, getDispositivoDetalle);
router.get('/dispositivo-por-id/:dispositivoId', authenticateToken, getDispositivoPorId);

export default router;
