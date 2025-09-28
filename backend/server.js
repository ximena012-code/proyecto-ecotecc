import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js'; 
import favoritosRoutes from './routes/favoritosRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import pedidoRoutes from "./routes/pedidoRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { stripeWebhook } from './controllers/paymentController.js';
import reparacionRoutes from "./routes/reparacionRoutes.js";
import ventasRoutes from './routes/ventasRoutes.js';
import notificacionesRoutes from './routes/notificacionesRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import './scheduler.js';

dotenv.config();

const app = express();

// Stripe Webhook debe ir antes de express.json()
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:5173', // Para desarrollo local
    'http://localhost:3000',  // Por si usas Create React App
    'https://frontend-ecotec.onrender.com' // Tu frontend desplegado
  ],
  credentials: true
}));
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);   
app.use('/api/users', userRoutes);  
app.use('/api/productos', productRoutes);
app.use("/api/favoritos", favoritosRoutes);
app.use('/api/carrito', cartRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use('/api/payments', paymentRoutes);
app.use("/api/reparaciones", reparacionRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/ratings', ratingRoutes);



// Archivos estáticos
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
