import db from '../config/db.js';

// Obtener notificaciones del usuario con información de calificación
export const getNotificationsWithRatingStatus = async (userId) => {
  const [rows] = await db.promise().query(
    `SELECT n.*, 
            CASE 
              WHEN n.pedido_id IS NOT NULL AND c.id_calificacion IS NOT NULL 
              THEN 1 
              ELSE 0 
            END as ya_calificado
     FROM notificaciones n
     LEFT JOIN calificaciones c ON n.pedido_id = c.id_pedido AND c.id_usuario = ?
     WHERE n.id_usuario = ? OR n.id_usuario IS NULL
     ORDER BY n.fecha DESC`,
    [userId, userId]
  );
  return rows;
};

export default {
  getNotificationsWithRatingStatus
};