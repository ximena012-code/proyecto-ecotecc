import express from 'express';
import { getProductRatings, getProductRatingOnly } from '../controllers/ratingController.js';

const router = express.Router();

// Obtener calificaciones completas de un producto (promedio + reseñas)
router.get('/producto/:productId', getProductRatings);

// Obtener solo el promedio de calificaciones de un producto
router.get('/producto/:productId/promedio', getProductRatingOnly);

export default router;