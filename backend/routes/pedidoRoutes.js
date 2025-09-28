import express from "express";
import { 
  createOrder, 
  getOrders, 
  rateOrder, 
  getOrderStatus, 
  getOrderDetail, 
  getAllOrderDetails, 
  getRatingsStats, 
  getRatingsSummary,
  rateProducts,
  getProductRatings,
  getProductAvgRating,
  getProductReviewsController
} from "../controllers/pedidoController.js";
import { generateInvoicePDF } from "../facturasPdf/facturaUsuario.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/crear", authenticateToken, createOrder);

router.get("/:id/estado", getOrderStatus);
router.get("/:id/detalle", authenticateToken, getOrderDetail);
router.get("/detalle", authenticateToken, getAllOrderDetails);
router.get("/", authenticateToken, getOrders);

// Rutas de calificaciones de pedidos (orden completa)
router.post("/calificar", authenticateToken, rateOrder);

// Rutas de calificaciones de productos individuales
router.post("/calificar-productos", authenticateToken, rateProducts);
router.get("/:id_pedido/calificaciones-productos", authenticateToken, getProductRatings);

// Rutas de información de calificaciones de productos
router.get("/producto/:productId/promedio", getProductAvgRating);
router.get("/producto/:productId/reseñas", getProductReviewsController);

router.get('/factura/:id_pedido', authenticateToken, generateInvoicePDF);
router.get('/ratings-stats', getRatingsStats);
router.get('/ratings-summary', getRatingsSummary);

export default router;