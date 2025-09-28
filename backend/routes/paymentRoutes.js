import express from 'express';
import { createPaymentIntent } from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/payments/create-payment-intent
router.post('/create-payment-intent', authenticateToken, createPaymentIntent);

export default router;