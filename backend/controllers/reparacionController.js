import { sendRepairConfirmationEmail, sendAdminRepairNotificationEmail }  from '../helpers/mailer.js';
import { sendRepairStatusUpdateEmail } from '../helpers/mailer.js';
import { registrarNotificacion } from '../helpers/notificaciones.js';
import { findAdmin, findUserByEmail } from '../models/userModel.js';
import {
  createReparation,
  updateReparationTicket,
  getRepairsByUser,
  getAllRepairs,
  getRepairById,
  updateRepairStatus,
  getRepairsByStatus,
  getRepairByTicket,
  updateRepairCost
} from '../models/reparacionModel.js';

// ✅ Crear reparación con ticket incremental

export const crearReparacion = async (req, res) => {
  const { nombre, dispositivo, marca, modelo, problema } = req.body;
  const imagen = req.file ? req.file.filename : null;
  const emailUsuario = req.user.email; // Email del usuario que hace la solicitud
  const idUsuario = req.user.id_usuario;

  try {
    // Crear la reparación en la base de datos
    const result = await createReparation({
      nombre,
      contacto: emailUsuario, // Usamos el email del usuario logueado como contacto
      dispositivo,
      marca,
      modelo,
      problema,
      imagen,
    });

    // Generar el ticket y actualizarlo
    const ticket = "TCK-" + String(result.insertId).padStart(6, "0");
    await updateReparationTicket(result.insertId, ticket);

    // --- NOTIFICACIONES POR CORREO ---

    // 1. Enviar correo de confirmación AL CLIENTE (esto ya lo tenías)
    await sendRepairConfirmationEmail(emailUsuario, ticket);

    // 2. ¡NUEVO! Enviar correo de notificación AL ADMINISTRADOR
    await sendAdminRepairNotificationEmail({
      ticket,
      nombre,
      emailUsuario,
      dispositivo,
      marca,
      modelo,
      problema,
      imagen,
    });

    // --- NOTIFICACIÓN EN LA PLATAFORMA (esto ya lo tenías) ---
    const admin = await findAdmin();
    if (admin) {
      await registrarNotificacion({
        id_usuario: admin.id_usuario,
        tipo: "reparacion",
        mensaje: `Nueva solicitud de reparación de ${nombre}. Ticket: ${ticket}`,
        fecha: new Date(),
        ticket_id: result.insertId,
        usuario_solicitante: idUsuario,
      });
    }

    res.json({
      message: "Reparación registrada correctamente",
      id: result.insertId,
      ticket,
    });
  } catch (error) {
    console.error("Error al crear reparación:", error);
    res.status(500).json({ error: "Error guardando reparación" });
  }
};


// ✅ Obtener todas las reparaciones
export const obtenerReparaciones = async (req, res) => {
  try {
    const results = await getAllRepairs();
    res.json(results);
  } catch (error) {
    console.error("Error obteniendo reparaciones:", error);
    res.status(500).json({ error: "Error obteniendo reparaciones" });
  }
};

// ✅ Actualizar estado
export const actualizarEstado = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!["pendiente", "en_proceso", "finalizado"].includes(estado)) {
    return res.status(400).json({ error: "Estado no válido" });
  }

  try {
    await updateRepairStatus(id, estado);

    // Obtener datos para enviar correo y registrar notificación
    const reparacion = await getRepairById(id);
    if (reparacion) {
      const { contacto, ticket, dispositivo, marca, modelo } = reparacion;
      
      // Enviar correo
      await sendRepairStatusUpdateEmail(contacto, ticket, estado);
      
      // Buscar usuario por email para registrar notificación
      const usuario = await findUserByEmail(contacto);
      if (usuario) {
        await registrarNotificacion({
          id_usuario: usuario.id_usuario,
          tipo: 'reparacion_actualizada',
          mensaje: `El estado de tu reparación ${ticket} (${dispositivo} ${marca} ${modelo}) ha sido actualizado a: ${estado.toUpperCase()}`,
          fecha: new Date(),
          ticket_id: id
        });
      }
    }

    res.json({ message: "Estado actualizado correctamente" });
  } catch (error) {
    console.error("Error actualizando estado:", error);
    res.status(500).json({ error: "Error actualizando estado" });
  }
};

// ✅ Buscar por ticket
export const obtenerReparacionPorTicket = async (req, res) => {
  const { ticket } = req.params;

  try {
    const reparacion = await getRepairByTicket(ticket);
    if (!reparacion) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }
    res.json(reparacion);
  } catch (error) {
    console.error("Error consultando reparación:", error);
    res.status(500).json({ error: "Error consultando reparación" });
  }
};
