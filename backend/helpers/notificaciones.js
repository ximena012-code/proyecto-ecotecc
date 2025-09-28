import db from '../config/db.js';

// Registrar notificación de compra exitosa
export const crearNotificacionCompra = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;
    const { tipo, mensaje, pedidoId } = req.body;
    const fecha = new Date();
    await registrarNotificacion({
      id_usuario,
      tipo,
      mensaje,
      fecha,
      dispositivo_id: null,
      ticket_id: null,
      usuario_solicitante: null,
      pedido_id: pedidoId || null
    });
    res.json({ success: true, message: 'Notificación registrada' });
  } catch (error) {
    console.error('Error al registrar notificación de compra:', error);
    res.status(500).json({ success: false, message: 'Error al registrar notificación' });
  }
};

export const registrarNotificacion = async ({ 
  id_usuario, 
  tipo, 
  mensaje, 
  fecha, 
  dispositivo_id = null, 
  ticket_id = null, 
  usuario_solicitante = null,
  pedido_id = null  // <-- Agregamos este campo
}) => {
  try {
    await db.promise().query(
      'INSERT INTO notificaciones (id_usuario, tipo, mensaje, fecha, leida, dispositivo_id, ticket_id, usuario_solicitante, pedido_id) VALUES (?, ?, ?, ?, FALSE, ?, ?, ?, ?)',
      [id_usuario, tipo, mensaje, fecha, dispositivo_id, ticket_id, usuario_solicitante, pedido_id]
    );
  } catch (error) {
    console.error('Error al registrar notificación:', error);
    throw error;
  }
};

export const obtenerNotificaciones = async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const userRole = req.user.rol;
    
    let query;
    let params;
    
    if (userRole === 'admin') {
      // ⭐ Admin ve notificaciones dirigidas a él Y las de actualización de sus acciones
      query = `SELECT n.*, 
                      u.nombre, u.email,
                      us.nombre as nombre_solicitante, us.email as email_solicitante
               FROM notificaciones n 
               LEFT JOIN usuarios u ON n.id_usuario = u.id_usuario 
               LEFT JOIN usuarios us ON n.usuario_solicitante = us.id_usuario
               WHERE n.id_usuario = ? OR n.tipo IN ('reparacion', 'venta')
               ORDER BY n.fecha DESC 
               LIMIT 50`;
      params = [userId];
    } else {
      // ⭐ Usuario normal ve notificaciones dirigidas específicamente a él (incluyendo promociones)
      query = `SELECT n.*, u.nombre, u.email 
               FROM notificaciones n 
               LEFT JOIN usuarios u ON n.id_usuario = u.id_usuario 
               WHERE n.id_usuario = ? 
               ORDER BY n.fecha DESC 
               LIMIT 50`;
      params = [userId];
    }
    
    const [notificaciones] = await db.promise().query(query, params);
    res.json(notificaciones);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ message: 'Error al obtener notificaciones' });
  }
};

export const marcarComoLeida = async (req, res) => {
  try {
    const { id } = req.params;
    await db.promise().query(
      'UPDATE notificaciones SET leida = TRUE WHERE id_notificaciones = ?',
      [id]
    );
    res.json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('Error al marcar notificación:', error);
    res.status(500).json({ message: 'Error al marcar como leída' });
  }
};