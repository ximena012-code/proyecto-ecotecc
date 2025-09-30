import db from '../config/db.js';

// Obtener carrito de usuario
export const getCartByUserId = async (userId) => {
  const [rows] = await db.promise().query(
    `SELECT c.id_carrito, c.cantidad,
        p.id_producto, p.nombre, p.precio,
        p.foto,                                                
        (c.cantidad * p.precio) as subtotal
    FROM carrito c
     JOIN productos p ON c.id_producto = p.id_producto
     WHERE c.id_usuario = ?
     ORDER BY c.id_carrito DESC`,
    [userId]
  );
  return rows;
};

// Verificar si producto ya está en carrito
export const findCartItem = async (userId, productId) => {
  const [rows] = await db.promise().query(
    'SELECT * FROM carrito WHERE id_usuario = ? AND id_producto = ?',
    [userId, productId]
  );
  return rows[0] || null;
};

// Agregar producto al carrito
export const addProductToCart = async (userId, productId, cantidad) => {
  const [result] = await db.promise().query(
    'INSERT INTO carrito (id_usuario, id_producto, cantidad) VALUES (?, ?, ?)',
    [userId, productId, cantidad]
  );
  return result;
};

// Actualizar cantidad en carrito
export const updateCartItemQuantity = async (userId, productId, cantidad) => {
  const [result] = await db.promise().query(
    'UPDATE carrito SET cantidad = ? WHERE id_usuario = ? AND id_producto = ?',
    [cantidad, userId, productId]
  );
  return result;
};

// Eliminar producto del carrito
export const removeFromCart = async (userId, productId) => {
  const [result] = await db.promise().query(
    'DELETE FROM carrito WHERE id_usuario = ? AND id_producto = ?',
    [userId, productId]
  );
  return result;
};

// Limpiar carrito completo
export const clearUserCart = async (userId) => {
  const [result] = await db.promise().query(
    'DELETE FROM carrito WHERE id_usuario = ?',
    [userId]
  );
  return result;
};

// Verificar stock disponible para carrito
export const checkCartStock = async (userId) => {
  const [rows] = await db.promise().query(
    `SELECT c.id_producto, p.cantidad as stock, c.cantidad as solicitado
     FROM carrito c
     JOIN productos p ON c.id_producto = p.id_producto
     WHERE c.id_usuario = ? AND c.cantidad > p.cantidad`,
    [userId]
  );
  return rows;
};

// Obtener carrito con información de productos para pedido
export const getCartForOrder = async (userId) => {
  const [rows] = await db.promise().query(
    `SELECT c.id_carrito, c.cantidad,
            p.id_producto, p.nombre, p.precio
     FROM carrito c
     JOIN productos p ON c.id_producto = p.id_producto
     WHERE c.id_usuario = ?`,
    [userId]
  );
  return rows;
};

// Obtener item del carrito con información de stock
export const getCartItemWithStock = async (cartId, userId) => {
  const [rows] = await db.promise().query(
    `SELECT c.id_carrito, c.id_producto, p.cantidad AS stock 
     FROM carrito c
     JOIN productos p ON c.id_producto = p.id_producto
     WHERE c.id_carrito = ? AND c.id_usuario = ?`,
    [cartId, userId]
  );
  return rows[0] || null;
};

// Verificar si item pertenece al usuario
export const verifyCartItemOwnership = async (cartId, userId) => {
  const [rows] = await db.promise().query(
    'SELECT id_carrito FROM carrito WHERE id_carrito = ? AND id_usuario = ?',
    [cartId, userId]
  );
  return rows.length > 0;
};

// Actualizar cantidad por ID de carrito
export const updateCartItemById = async (cartId, userId, cantidad) => {
  const [result] = await db.promise().query(
    'UPDATE carrito SET cantidad = ? WHERE id_carrito = ? AND id_usuario = ?',
    [cantidad, cartId, userId]
  );
  return result;
};

// Eliminar item por ID de carrito
export const removeCartItemById = async (cartId, userId) => {
  const [result] = await db.promise().query(
    'DELETE FROM carrito WHERE id_carrito = ? AND id_usuario = ?',
    [cartId, userId]
  );
  return result;
};

// Obtener resumen del carrito
export const getCartSummary = async (userId) => {
  const [rows] = await db.promise().query(
    `SELECT 
      COUNT(*) as total_items,
      SUM(c.cantidad) as total_quantity,
      SUM(c.cantidad * p.precio) as total_amount
     FROM carrito c
     JOIN productos p ON c.id_producto = p.id_producto
     WHERE c.id_usuario = ?`,
    [userId]
  );
  return rows[0] || null;
};