import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary
} from "../controllers/cartController.js";
import { authenticateToken } from '../middleware/auth.js';
import {
  validateNumericParam,
  validateAddToCart,
  validateUpdateCart,
  sanitizeCartData,
  logCartAction,
  cartRateLimit,
  handleCartSuccess
} from '../middleware/cart.js';

const router = express.Router();

// Aplicar middlewares globales para todas las rutas del carrito
router.use(authenticateToken);
router.use(cartRateLimit);
router.use(handleCartSuccess);

// Rutas del carrito
router.get("/", 
  logCartAction('get'), 
  getCart
);

router.get("/summary", 
  logCartAction('summary'), 
  getCartSummary
);

router.post("/add", 
  logCartAction('add'),
  sanitizeCartData,
  validateAddToCart, 
  addToCart
);

router.put("/update/:id_carrito", 
  logCartAction('update'),
  validateNumericParam('id_carrito'),
  sanitizeCartData,
  validateUpdateCart,
  updateCartItem
);

router.delete("/remove/:id_carrito", 
  logCartAction('remove'),
  validateNumericParam('id_carrito'), 
  removeFromCart
);

router.delete("/clear", 
  logCartAction('clear'),
  clearCart
);

export default router;