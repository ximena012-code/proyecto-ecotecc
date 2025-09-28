import db from '../config/db.js';

// Agregar producto a favoritos
export const addToFavorites = async (usuarioId, productoId) => {
  const [result] = await db.promise().query(
    "INSERT INTO favoritos (id_usuario, id_producto) VALUES (?, ?)",
    [usuarioId, productoId]
  );
  return result;
};

// Obtener favoritos del usuario
export const getFavoritesByUserId = async (usuarioId) => {
  const [rows] = await db.promise().query(
    `SELECT p.* 
     FROM productos p
     INNER JOIN favoritos f ON p.id_producto = f.id_producto
     WHERE f.id_usuario = ?`,
    [usuarioId]
  );
  return rows;
};

// Eliminar producto de favoritos
export const removeFromFavorites = async (usuarioId, productoId) => {
  const [result] = await db.promise().query(
    "DELETE FROM favoritos WHERE id_usuario = ? AND id_producto = ?",
    [usuarioId, productoId]
  );
  return result;
};

// Verificar si un producto está en favoritos
export const isFavorite = async (usuarioId, productoId) => {
  const [rows] = await db.promise().query(
    "SELECT 1 FROM favoritos WHERE id_usuario = ? AND id_producto = ?",
    [usuarioId, productoId]
  );
  return rows.length > 0;
};