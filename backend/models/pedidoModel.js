import db from '../config/db.js';

// Obtener pedidos por ID de usuario
export const getUserOrders = async (userId) => {
  const [rows] = await db.promise().query(
    `SELECT p.*, 
            COUNT(dp.id_detalle) as total_productos,
            GROUP_CONCAT(CONCAT(pr.nombre, ' (x', dp.cantidad, ')') SEPARATOR ', ') as productos
     FROM pedidos p
     LEFT JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
     LEFT JOIN productos pr ON dp.producto_id = pr.id_producto
     WHERE p.id_usuario = ?
     GROUP BY p.id_pedido
     ORDER BY p.fecha_pedido DESC`,
    [userId]
  );
  return rows;
};

// Crear nuevo pedido
export const createOrder = async (orderData) => {
  const { userId, total, direccion, direccion_complementaria, codigo_postal, ciudad, pais, usar_para_facturas } = orderData;
  
  const [result] = await db.promise().query(
    `INSERT INTO pedidos (id_usuario, total, direccion, direccion_complementaria, codigo_postal, ciudad, pais, usar_para_facturas, estado, fecha_pedido) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', NOW())`,
    [userId, total, direccion, direccion_complementaria, codigo_postal, ciudad, pais, usar_para_facturas]
  );
  return result;
};

// Crear nuevo pedido con totales de envío
export const createOrderWithShipping = async (userId, totalEnvio, total) => {
  const [result] = await db.promise().query(
    `INSERT INTO pedidos (id_usuario, total_envio, total) VALUES (?, ?, ?)`,
    [userId, totalEnvio, total]
  );
  return result;
};

// Agregar detalle del pedido
export const addOrderDetail = async (orderId, productId, cantidad, precio) => {
  const [result] = await db.promise().query(
    'INSERT INTO detalle_pedidos (id_pedido, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
    [orderId, productId, cantidad, precio]
  );
  return result;
};

// Actualizar stock del producto
export const updateProductStock = async (productId, newStock) => {
  const [result] = await db.promise().query(
    'UPDATE productos SET stock = ? WHERE id_producto = ?',
    [newStock, productId]
  );
  return result;
};

// Obtener todos los pedidos (admin)
export const getAllOrders = async () => {
  const [rows] = await db.promise().query(
    `SELECT p.*, u.nombre as usuario_nombre, u.apellido as usuario_apellido, u.email as usuario_email,
            COUNT(dp.id_detalle) as total_productos
     FROM pedidos p
     JOIN usuarios u ON p.id_usuario = u.id_usuario
     LEFT JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
     GROUP BY p.id_pedido
     ORDER BY p.fecha_pedido DESC`
  );
  return rows;
};

// Obtener detalles de un pedido específico
export const getOrderDetails = async (orderId) => {
  const [rows] = await db.promise().query(
    `SELECT dp.*, p.nombre, p.precio as precio_actual, p.foto
     FROM detalle_pedidos dp
     JOIN productos p ON dp.producto_id = p.id_producto
     WHERE dp.id_pedido = ?`,
    [orderId]
  );
  return rows;
};

// Actualizar estado del pedido
export const updateOrderStatus = async (orderId, status) => {
  const [result] = await db.promise().query(
    'UPDATE pedidos SET estado = ? WHERE id_pedido = ?',
    [status, orderId]
  );
  return result;
};

// Obtener pedido por ID
export const getOrderById = async (orderId) => {
  const [rows] = await db.promise().query(
    'SELECT * FROM pedidos WHERE id_pedido = ?',
    [orderId]
  );
  return rows[0];
};

// Eliminar pedido
export const deleteOrder = async (orderId) => {
  const [result] = await db.promise().query(
    'DELETE FROM pedidos WHERE id_pedido = ?',
    [orderId]
  );
  return result;
};

// Obtener estadísticas de pedidos
export const getOrderStats = async () => {
  const [rows] = await db.promise().query(
    `SELECT 
       COUNT(*) as total_pedidos,
       SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
       SUM(CASE WHEN estado = 'pagado' THEN 1 ELSE 0 END) as pagados,
       SUM(CASE WHEN estado = 'enviado' THEN 1 ELSE 0 END) as enviados,
       SUM(CASE WHEN estado = 'entregado' THEN 1 ELSE 0 END) as entregados,
       SUM(CASE WHEN estado = 'cancelado' THEN 1 ELSE 0 END) as cancelados
     FROM pedidos`
  );
  return rows[0];
};

// Obtener productos más vendidos
export const getTopSellingProducts = async (limit = 10) => {
  const [rows] = await db.promise().query(
    `SELECT p.id_producto, p.nombre, p.precio, p.foto,
            SUM(dp.cantidad) as total_vendido,
            COUNT(DISTINCT dp.id_pedido) as num_pedidos
     FROM productos p
     JOIN detalle_pedidos dp ON p.id_producto = dp.producto_id
     JOIN pedidos pe ON dp.id_pedido = pe.id_pedido
     WHERE pe.estado = 'pagado'
     GROUP BY p.id_producto
     ORDER BY total_vendido DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
};

// Obtener ventas por período
export const getSalesByPeriod = async (startDate, endDate) => {
  const [rows] = await db.promise().query(
    `SELECT DATE(p.fecha_pedido) as fecha,
            COUNT(p.id_pedido) as num_pedidos,
            SUM(p.total) as total_ventas
     FROM pedidos p
     WHERE p.estado = 'pagado' 
       AND DATE(p.fecha_pedido) BETWEEN ? AND ?
     GROUP BY DATE(p.fecha_pedido)
     ORDER BY fecha ASC`,
    [startDate, endDate]
  );
  return rows;
};

// Obtener detalles completos del pedido con información del producto
export const getFullOrderDetails = async (orderId) => {
  const [rows] = await db.promise().query(
    `SELECT d.id_detalle, d.id_pedido, d.producto_id, d.cantidad, d.precio_unitario,
            p.nombre, p.descripcion, p.precio as precio_actual, p.foto,
            (d.cantidad * d.precio_unitario) as subtotal
     FROM detalle_pedidos d
     JOIN productos p ON d.producto_id = p.id_producto
     WHERE d.id_pedido = ?
     ORDER BY d.id_detalle`,
    [orderId]
  );
  return rows;
};

// Obtener información completa del pedido con usuario
export const getOrderWithUser = async (orderId) => {
  const [rows] = await db.promise().query(
    `SELECT p.*, u.nombre, u.apellido, u.email, u.telefono
     FROM pedidos p
     JOIN usuarios u ON p.id_usuario = u.id_usuario
     WHERE p.id_pedido = ?`,
    [orderId]
  );
  return rows[0];
};

// Actualizar información de pago
export const updatePaymentInfo = async (orderId, paymentData) => {
  const { payment_id, payment_status, payment_method, fecha_pago, card_brand, card_last4 } = paymentData;
  
  const [result] = await db.promise().query(
    `UPDATE pedidos 
     SET payment_id = ?, payment_status = ?, payment_method = ?, 
         fecha_pago = ?, card_brand = ?, card_last4 = ?
     WHERE id_pedido = ?`,
    [payment_id, payment_status, payment_method, fecha_pago, card_brand, card_last4, orderId]
  );
  return result;
};

// Buscar pedidos por criterios
export const searchOrders = async (criteria) => {
  let query = `
    SELECT p.*, u.nombre, u.apellido, u.email,
           COUNT(dp.id_detalle) as total_productos,
           SUM(dp.cantidad * dp.precio_unitario) as total_calculado
    FROM pedidos p
    JOIN usuarios u ON p.id_usuario = u.id_usuario
    LEFT JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
    WHERE 1=1
  `;
  
  const params = [];
  
  if (criteria.estado) {
    query += ' AND p.estado = ?';
    params.push(criteria.estado);
  }
  
  if (criteria.fecha_inicio) {
    query += ' AND DATE(p.fecha_pedido) >= ?';
    params.push(criteria.fecha_inicio);
  }
  
  if (criteria.fecha_fin) {
    query += ' AND DATE(p.fecha_pedido) <= ?';
    params.push(criteria.fecha_fin);
  }
  
  if (criteria.usuario_email) {
    query += ' AND u.email LIKE ?';
    params.push(`%${criteria.usuario_email}%`);
  }
  
  query += ' GROUP BY p.id_pedido ORDER BY p.fecha_pedido DESC';
  
  const [rows] = await db.promise().query(query, params);
  return rows;
};

// Crear dirección de entrega
export const createAddress = async (addressData) => {
  const { userId, direccion, direccion_complementaria, codigo_postal, ciudad, pais } = addressData;
  
  const [result] = await db.promise().query(
    `INSERT INTO direcciones (id_usuario, direccion, direccion_complementaria, codigo_postal, ciudad, pais) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, direccion, direccion_complementaria, codigo_postal, ciudad, pais]
  );
  return result;
};

// Obtener pedidos aprobados por usuario
export const getApprovedOrdersByUserId = async (userId) => {
  const [rows] = await db.promise().query(
    `SELECT p.*, 
            COUNT(dp.id_detalle) as total_productos
     FROM pedidos p
     LEFT JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
     WHERE p.id_usuario = ? AND p.estado IN ('pagado', 'enviado', 'entregado')
     GROUP BY p.id_pedido
     ORDER BY p.fecha_pedido DESC`,
    [userId]
  );
  return rows;
};

// Obtener pedidos para historial de facturas con información completa
export const getOrdersForInvoiceHistory = async (userId) => {
  const [rows] = await db.promise().query(
    `SELECT p.id_pedido, p.total, p.estado, p.fecha_pedido, p.payment_method, p.card_brand, p.card_last4,
            CONCAT(u.nombre, ' ', u.apellido) as nombre_usuario,
            COUNT(dp.id_detalle) as total_productos,
            SUM(dp.cantidad) as cantidad_total
     FROM pedidos p
     JOIN usuarios u ON p.id_usuario = u.id_usuario
     LEFT JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
     WHERE p.id_usuario = ? AND p.estado IN ('pagado', 'enviado', 'entregado')
     GROUP BY p.id_pedido
     ORDER BY p.fecha_pedido DESC`,
    [userId]
  );
  return rows;
};

// ===== CALIFICACIONES DE PEDIDOS =====

// Crear calificación para un pedido completo
export const createOrderRating = async (ratingData) => {
  const { orderId, userId, rating, comentario } = ratingData;
  
  const [result] = await db.promise().query(
    `INSERT INTO calificaciones_pedidos (id_pedido, id_usuario, puntuacion, comentario, fecha_calificacion) 
     VALUES (?, ?, ?, ?, NOW())`,
    [orderId, userId, rating, comentario || '']
  );
  return result;
};

// Verificar si un usuario ya calificó un pedido
export const checkUserOrderRating = async (orderId, userId) => {
  const [rows] = await db.promise().query(
    `SELECT id_calificacion_pedido FROM calificaciones_pedidos WHERE id_pedido = ? AND id_usuario = ?`,
    [orderId, userId]
  );
  return rows[0];
};

// Obtener calificación de un pedido
export const getOrderRating = async (orderId) => {
  const [rows] = await db.promise().query(
    `SELECT * FROM calificaciones_pedidos WHERE id_pedido = ?`,
    [orderId]
  );
  return rows[0];
};

// ===== CALIFICACIONES DE PRODUCTOS =====

// Crear calificaciones para productos individuales
export const createProductRatings = async (ratingsData) => {
  const { orderId, userId, productRatings } = ratingsData;
  
  const insertPromises = productRatings.map(({ productId, rating, comentario }) => {
    return db.promise().query(
      `INSERT INTO calificaciones_productos (id_pedido, id_usuario, producto_id, puntuacion, comentario, fecha_calificacion) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [orderId, userId, productId, rating, comentario || '']
    );
  });
  
  const results = await Promise.all(insertPromises);
  return results;
};

// Verificar si un usuario ya calificó los productos de un pedido
export const checkUserProductRatings = async (orderId, userId) => {
  const [rows] = await db.promise().query(
    `SELECT producto_id FROM calificaciones_productos WHERE id_pedido = ? AND id_usuario = ?`,
    [orderId, userId]
  );
  return rows;
};

// Obtener calificaciones de productos de un pedido
export const getProductRatingsByOrder = async (orderId, userId) => {
  const [rows] = await db.promise().query(
    `SELECT cp.*, p.nombre as producto_nombre 
     FROM calificaciones_productos cp
     JOIN productos p ON cp.producto_id = p.id_producto
     WHERE cp.id_pedido = ? AND cp.id_usuario = ?`,
    [orderId, userId]
  );
  return rows;
};

// Obtener promedio de calificaciones de un producto específico
export const getProductRatingAverage = async (productId) => {
  const [rows] = await db.promise().query(
    `SELECT 
       AVG(cp.puntuacion) as promedio_calificacion,
       COUNT(cp.puntuacion) as total_calificaciones,
       COUNT(DISTINCT cp.id_usuario) as usuarios_calificaron
     FROM calificaciones_productos cp
     WHERE cp.producto_id = ? AND cp.puntuacion IS NOT NULL`,
    [productId]
  );
  
  const resultado = rows[0];
  return {
    promedio: resultado.promedio_calificacion ? parseFloat(resultado.promedio_calificacion).toFixed(1) : null,
    total_calificaciones: parseInt(resultado.total_calificaciones) || 0,
    usuarios_calificaron: parseInt(resultado.usuarios_calificaron) || 0
  };
};

// Obtener todas las calificaciones de un producto con comentarios
export const getProductReviews = async (productId, limit = 10, offset = 0) => {
  const [rows] = await db.promise().query(
    `SELECT 
       cp.puntuacion,
       cp.comentario,
       cp.fecha_calificacion,
       u.nombre,
       u.apellido,
       p.fecha_pedido
     FROM calificaciones_productos cp
     INNER JOIN usuarios u ON cp.id_usuario = u.id_usuario
     INNER JOIN pedidos p ON cp.id_pedido = p.id_pedido
     WHERE cp.producto_id = ? 
     AND cp.puntuacion IS NOT NULL
     AND cp.comentario IS NOT NULL 
     AND cp.comentario != ''
     ORDER BY cp.fecha_calificacion DESC
     LIMIT ? OFFSET ?`,
    [productId, limit, offset]
  );
  return rows;
};

// Obtener todos los detalles de pedidos (para admin)
export const getAllOrderDetailsModel = async () => {
  const [rows] = await db.promise().query(
    `SELECT p.id_pedido, p.total, p.estado, p.fecha_pedido,
            u.nombre, u.apellido, u.email,
            COUNT(dp.id_detalle) as total_productos,
            SUM(dp.cantidad * dp.precio_unitario) as total_calculado
     FROM pedidos p
     JOIN usuarios u ON p.id_usuario = u.id_usuario
     LEFT JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
     GROUP BY p.id_pedido
     ORDER BY p.fecha_pedido DESC`
  );
  return rows;
};

// Obtener detalles de pedidos del usuario específico (para frontend DetallePedido)
export const getUserOrderDetailsModel = async (userId) => {
  const [rows] = await db.promise().query(
    `SELECT p.id_pedido, p.total, p.estado, p.fecha_pedido,
            dp.id_detalle, dp.cantidad, dp.precio_unitario,
            pr.nombre as nombre_producto, pr.descripcion, pr.foto,
            COALESCE(cp.puntuacion, NULL) as calificacion
     FROM pedidos p
     JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
     JOIN productos pr ON dp.producto_id = pr.id_producto
     LEFT JOIN calificaciones_pedidos cp ON cp.id_pedido = p.id_pedido AND cp.id_usuario = ?
     WHERE p.id_usuario = ? AND p.estado IN ('pagado', 'enviado', 'entregado')
     ORDER BY p.fecha_pedido DESC, dp.id_detalle`,
    [userId, userId]
  );
  return rows;
};

// Obtener estadísticas de calificaciones por periodo

export const getRatingsStatsModel = async (periodo) => {
  let query = '';
  const fromClause = `
    FROM (
      SELECT puntuacion, fecha_calificacion FROM calificaciones_pedidos
      UNION ALL
      SELECT puntuacion, fecha_calificacion FROM calificaciones_productos
    ) as todas_calificaciones
  `;

  switch (periodo) {
    case 'dia':
      query = `
        SELECT 
          -- Corregido: Genera una clave de periodo completa y sin ambigüedad.
          CONCAT(YEAR(fecha_calificacion), '-', MONTH(fecha_calificacion), '-', DAY(fecha_calificacion), '-', HOUR(fecha_calificacion)) as periodo,
          AVG(puntuacion) as avgRating,
          COUNT(*) as count
        ${fromClause}
        -- Corregido: Filtra por las últimas 24 horas.
        WHERE fecha_calificacion >= NOW() - INTERVAL 24 HOUR
        GROUP BY periodo
        ORDER BY periodo`;
      break;

    case 'semana':
      query = `
        SELECT 
          DATE_FORMAT(fecha_calificacion, '%Y-%m-%d') as periodo,
          AVG(puntuacion) as avgRating,
          COUNT(*) as count
        ${fromClause}
        -- Corregido: Filtra por los últimos 7 días.
        WHERE fecha_calificacion >= NOW() - INTERVAL 7 DAY
        GROUP BY periodo
        ORDER BY periodo`;
      break;

    case 'mes':
      query = `
        SELECT 
          DATE_FORMAT(fecha_calificacion, '%Y-%m-%d') as periodo,
          AVG(puntuacion) as avgRating,
          COUNT(*) as count
        ${fromClause}
        -- Corregido: Filtra por los últimos 30 días.
        WHERE fecha_calificacion >= NOW() - INTERVAL 30 DAY
        GROUP BY periodo
        ORDER BY periodo`;
      break;

    case 'año':
      query = `
        SELECT 
          DATE_FORMAT(fecha_calificacion, '%Y-%m') as periodo,
          AVG(puntuacion) as avgRating,
          COUNT(*) as count
        ${fromClause}
        -- Corregido: Filtra por los últimos 12 meses.
        WHERE fecha_calificacion >= NOW() - INTERVAL 12 MONTH
        GROUP BY periodo
        ORDER BY periodo`;
      break;

    default:
      throw new Error('Periodo no válido');
  }

  const [rows] = await db.promise().query(query);
  return rows;
};

// Obtener resumen de calificaciones por periodo
export const getRatingsSummaryModel = async (periodo) => {
  let dateCondition = '';

  switch (periodo) {
    case 'dia':
      dateCondition = 'DATE(fecha_calificacion) = CURDATE()';
      break;
    case 'semana':
      dateCondition = 'fecha_calificacion >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)';
      break;
    case 'mes':
      dateCondition = 'fecha_calificacion >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)';
      break;
    case 'año':
      dateCondition = 'fecha_calificacion >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)';
      break;
    default:
      throw new Error('Periodo no válido');
  }

  const query = `
    SELECT 
      COUNT(*) as totalRatings,
      AVG(puntuacion) as avgRating,
      COUNT(CASE WHEN puntuacion >= 4 THEN 1 END) * 100.0 / COUNT(*) as excellenceRate
    FROM (
      SELECT puntuacion, fecha_calificacion FROM calificaciones_pedidos
      UNION ALL
      SELECT puntuacion, fecha_calificacion FROM calificaciones_productos
    ) as todas_calificaciones
    WHERE ${dateCondition}`;

  const [rows] = await db.promise().query(query);
  return rows[0];
};

// Alias para compatibilidad con controlador existente
export const getOrdersByUserId = getUserOrders;