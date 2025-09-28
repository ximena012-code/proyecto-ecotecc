import {
  checkCartStock,
  getCartForOrder,
  clearUserCart
} from "../models/cartModel.js";
import {
  createOrderWithShipping,
  createAddress,
  addOrderDetail,
  updateProductStock,
  getOrdersByUserId,
  getAllOrders,
  getOrderDetails,
  updateOrderStatus as updateOrderStatusModel,
  getOrderById,
  getApprovedOrdersByUserId,
  getOrdersForInvoiceHistory,
  createOrderRating,
  getOrderRating,
  checkUserOrderRating,
  createProductRatings,
  checkUserProductRatings,
  getProductRatingsByOrder,
  getProductRatingAverage,
  getProductReviews,
  getAllOrderDetailsModel,
  getUserOrderDetailsModel,
  getRatingsStatsModel,
  getRatingsSummaryModel
} from "../models/pedidoModel.js";

// ✅ Helper para obtener el ID del usuario autenticado
export const getUserId = (req) => {
  return req.user?.id_usuario || req.user?.id;
};


// ✅ Crear un pedido desde el carrito
export const createOrder = async (req, res) => {
  const userId = getUserId(req);
  const { direccion, direccion_complementaria, codigo_postal, ciudad, pais, usar_para_facturas = false } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Usuario no autenticado" });
  }

  if (!direccion || !codigo_postal || !ciudad || !pais) {
    return res.status(400).json({
      success: false,
      message: "Faltan campos obligatorios: dirección, código postal, ciudad y país"
    });
  }

  try {
    // 1. Verificar stock disponible
    const stockInsuficiente = await checkCartStock(userId);

    if (stockInsuficiente.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente para algunos productos`,
        productos: stockInsuficiente
      });
    }

    // 2. Obtener carrito del usuario
    const cart = await getCartForOrder(userId);

    if (cart.length === 0) {
      return res.status(400).json({ success: false, message: "Carrito vacío" });
    }

    // 3. Guardar dirección
    const addressData = {
      userId,
      direccion,
      direccion_complementaria,
      codigo_postal,
      ciudad,
      pais,
      usar_para_facturas
    };
    const direccionResult = await createAddress(addressData);
    const direccionId = direccionResult.insertId;

    // 4. Calcular totales
    const totalEnvio = 15000;
    const subtotal = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    const total = subtotal + totalEnvio;

    // 5. Insertar pedido con totales
    const pedidoResult = await createOrderWithShipping(userId, totalEnvio, total);
    const pedidoId = pedidoResult.insertId;

    // 6. Insertar detalle de pedido
    for (const item of cart) {
      await addOrderDetail(pedidoId, item.id_producto, item.cantidad, item.precio);
    }

    // 7. Vaciar carrito
    await clearUserCart(userId);

    // ✅ Responder con datos necesarios para Stripe
    res.json({
      success: true,
      message: "Pedido creado exitosamente",
      pedidoId,
      subtotal,
      totalEnvio,
      total,
      direccionId,
      items: cart // 👉 Enviar items al frontend
    });

  } catch (error) {
    console.error("Error inesperado al crear pedido:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al crear pedido",
      error: error.message
    });
  }
};

// ✅ Obtener estado de un pedido
export const getOrderStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const pedido = await getOrderById(id);

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    res.json({
      estado: pedido.estado,
      total: pedido.total,
      total_envio: pedido.total_envio,
      fecha_pedido: pedido.fecha_pedido
    });
  } catch (error) {
    console.error("Error al obtener estado del pedido:", error);
    res.status(500).json({ error: "Error al obtener pedido" });
  }
};

// ✅ Obtener pedidos del usuario autenticado - SOLO APROBADOS (PAGADOS)
export const getOrders = async (req, res) => {
  const userId = getUserId(req);

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "Usuario no autenticado" });
  }

  try {
    const results = await getOrdersForInvoiceHistory(userId);

    res.json({
      success: true,
      pedidos: results,
    });
  } catch (error) {
    console.error("Error inesperado al obtener pedidos:", error);
    res.status(500).json({
      success: false,
      message: "Error interno al obtener pedidos",
    });
  }
};

// ✅ Calificar un pedido
export const rateOrder = async (req, res) => {
  const userId = getUserId(req);
  const { id_pedido, puntuacion, comentario } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Usuario no autenticado" });
  }

  if (!id_pedido || !puntuacion) {
    return res.status(400).json({ success: false, message: "Faltan campos obligatorios" });
  }

  if (puntuacion < 1 || puntuacion > 5) {
    return res.status(400).json({ success: false, message: "La puntuación debe estar entre 1 y 5" });
  }

  try {
    // Verificar si el usuario ya calificó este pedido
    const existingRating = await checkUserOrderRating(id_pedido, userId);
    
    if (existingRating) {
      return res.status(409).json({ 
        success: false, 
        message: "Ya has calificado este pedido anteriormente" 
      });
    }

    // Verificar que el pedido pertenece al usuario
    const pedido = await getOrderById(id_pedido);
    if (!pedido || pedido.id_usuario !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "No tienes permiso para calificar este pedido" 
      });
    }

    // Verificar que el pedido esté pagado/completado
    if (pedido.estado !== 'pagado' && pedido.estado !== 'entregado') {
      return res.status(400).json({ 
        success: false, 
        message: "Solo puedes calificar pedidos pagados o entregados" 
      });
    }

    await createOrderRating({ 
      orderId: id_pedido, 
      userId: userId, 
      rating: puntuacion,
      comentario: comentario || ''
    });
    
    res.json({ success: true, message: "Calificación registrada con éxito" });
  } catch (error) {
    console.error("Error inesperado al calificar pedido:", error);
    
    // Manejar error de clave única duplicada
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        success: false, 
        message: "Ya has calificado este pedido anteriormente" 
      });
    }
    
    res.status(500).json({ success: false, message: "Error interno al calificar pedido" });
  }
};

// ✅ Obtener detalle de un pedido con productos
export const getOrderDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const results = await getOrderDetails(id);

    if (results.length === 0) {
      return res.status(404).json({ error: "Pedido no encontrado o sin productos" });
    }

    // Obtener calificación del pedido
    const calificacion = await getOrderRating(id);
    const puntuacion = calificacion ? calificacion.puntuacion : null;
    
    // Agrega la calificación a cada producto
    results.forEach(r => r.calificacion = puntuacion);
    res.json({ success: true, detalle: results });

  } catch (error) {
    console.error("Error al obtener detalle del pedido:", error);
    res.status(500).json({ error: "Error al obtener detalle del pedido" });
  }
};

// ✅ Obtener todos los detalles de pedidos del usuario autenticado
export const getAllOrderDetails = async (req, res) => {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ success: false, message: "Usuario no autenticado" });
  }

  try {
    const results = await getUserOrderDetailsModel(userId);
    console.log(`📦 Detalles de pedidos encontrados para usuario ${userId}:`, results.length);
    res.json({ success: true, detalle: results });
  } catch (error) {
    console.error("Error al obtener detalles de pedidos:", error);
    res.status(500).json({ error: "Error al obtener detalles de pedidos" });
  }
};

// Obtener estadísticas de calificaciones por periodo
export const getRatingsStats = async (req, res) => {
  const { periodo } = req.query;

  try {
    if (!['dia', 'semana', 'mes', 'año'].includes(periodo)) {
      return res.status(400).json({ message: 'Periodo no válido' });
    }

    const results = await getRatingsStatsModel(periodo);
    res.json(results);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};

// Obtener resumen de calificaciones
export const getRatingsSummary = async (req, res) => {
  const { periodo } = req.query;

  try {
    if (!['dia', 'semana', 'mes', 'año'].includes(periodo)) {
      return res.status(400).json({ message: 'Periodo no válido' });
    }

    const result = await getRatingsSummaryModel(periodo);
    res.json(result);
  } catch (error) {
    console.error('Error al obtener resumen:', error);
    res.status(500).json({ message: 'Error al obtener resumen' });
  }
};

// ===== CALIFICACIONES DE PRODUCTOS =====

// Calificar productos individuales de un pedido
export const rateProducts = async (req, res) => {
  const userId = getUserId(req);
  const { id_pedido, product_ratings } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Usuario no autenticado" });
  }

  try {
    // Verificar que el pedido existe y pertenece al usuario
    const pedido = await getOrderById(id_pedido);
    if (!pedido) {
      return res.status(404).json({ 
        success: false, 
        message: "Pedido no encontrado" 
      });
    }

    if (pedido.id_usuario !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "No tienes permisos para calificar este pedido" 
      });
    }

    // Verificar que el pedido esté pagado/completado
    if (pedido.estado !== 'pagado' && pedido.estado !== 'entregado') {
      return res.status(400).json({ 
        success: false, 
        message: "Solo puedes calificar productos de pedidos pagados o entregados" 
      });
    }

    // Verificar si ya hay calificaciones de productos para este pedido
    const existingRatings = await checkUserProductRatings(id_pedido, userId);
    if (existingRatings.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Ya has calificado los productos de este pedido" 
      });
    }

    // Validar que product_ratings sea un array válido
    if (!Array.isArray(product_ratings) || product_ratings.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Debes proporcionar calificaciones para al menos un producto" 
      });
    }

    // Validar cada calificación
    for (const rating of product_ratings) {
      if (!rating.productId || !rating.rating || rating.rating < 1 || rating.rating > 5) {
        return res.status(400).json({ 
          success: false, 
          message: "Cada calificación debe tener productId y rating válido (1-5)" 
        });
      }
    }

    // Crear las calificaciones
    await createProductRatings({
      orderId: id_pedido,
      userId: userId,
      productRatings: product_ratings
    });

    res.json({ 
      success: true, 
      message: "Calificaciones de productos registradas con éxito" 
    });

  } catch (error) {
    console.error("Error al calificar productos:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error interno del servidor al calificar productos" 
    });
  }
};

// Obtener calificaciones de productos de un pedido
export const getProductRatings = async (req, res) => {
  const userId = getUserId(req);
  const { id_pedido } = req.params;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Usuario no autenticado" });
  }

  try {
    const ratings = await getProductRatingsByOrder(id_pedido, userId);
    res.json({ success: true, ratings });
  } catch (error) {
    console.error("Error al obtener calificaciones de productos:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al obtener calificaciones de productos" 
    });
  }
};

// Obtener promedio de calificaciones de un producto
export const getProductAvgRating = async (req, res) => {
  const { productId } = req.params;

  try {
    const avgRating = await getProductRatingAverage(productId);
    res.json({ success: true, ...avgRating });
  } catch (error) {
    console.error("Error al obtener promedio de calificaciones:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al obtener promedio de calificaciones" 
    });
  }
};

// Obtener reseñas de un producto
export const getProductReviewsController = async (req, res) => {
  const { productId } = req.params;
  const { limit = 10, offset = 0 } = req.query;

  try {
    const reviews = await getProductReviews(productId, parseInt(limit), parseInt(offset));
    res.json({ success: true, reviews });
  } catch (error) {
    console.error("Error al obtener reseñas de producto:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al obtener reseñas de producto" 
    });
  }
};


