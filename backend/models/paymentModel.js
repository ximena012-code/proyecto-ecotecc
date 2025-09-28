import db from '../config/db.js';

// Obtener total del pedido
export const getOrderTotal = async (pedidoId) => {
  const [rows] = await db.promise().query(
    'SELECT total FROM pedidos WHERE id_pedido = ?',
    [pedidoId]
  );
  return rows[0] || null;
};

// Actualizar estado del pedido
export const updateOrderStatus = async (pedidoId, estado) => {
  const [result] = await db.promise().query(
    'UPDATE pedidos SET estado = ? WHERE id_pedido = ?',
    [estado, pedidoId]
  );
  return result;
};

// Obtener información del pedido con detalles
export const getOrderWithDetails = async (pedidoId) => {
  const [orderRows] = await db.promise().query(
    `SELECT p.*, u.email, u.nombre, u.apellido 
     FROM pedidos p 
     JOIN usuarios u ON p.id_usuario = u.id_usuario 
     WHERE p.id_pedido = ?`,
    [pedidoId]
  );

  if (orderRows.length === 0) return null;

  const [detailRows] = await db.promise().query(
    `SELECT dp.*, pr.nombre as producto_nombre 
     FROM detalle_pedidos dp 
     JOIN productos pr ON dp.producto_id = pr.id_producto 
     WHERE dp.id_pedido = ?`,
    [pedidoId]
  );

  return {
    ...orderRows[0],
    detalles: detailRows
  };
};

// Actualizar detalles adicionales del pago
export const updateOrderPaymentDetails = async (pedidoId, paymentId, cardBrand, cardLast4) => {
  const [result] = await db.promise().query(
    `UPDATE pedidos 
     SET 
       payment_id = ?,
       payment_status = 'approved', 
       payment_method = 'stripe', 
       fecha_pago = NOW(),
       card_brand = ?, 
       card_last4 = ? 
     WHERE id_pedido = ?`,
    [paymentId, cardBrand, cardLast4, pedidoId]
  );
  return result;
};

// Actualizar stock del producto
export const updateProductStock = async (productId, cantidad) => {
  const [result] = await db.promise().query(
    'UPDATE productos SET cantidad = cantidad - ? WHERE id_producto = ?',
    [cantidad, productId]
  );
  return result;
};