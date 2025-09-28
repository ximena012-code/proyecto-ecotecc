import { sendDeviceSaleEmail } from '../helpers/mailer.js';
import { registrarNotificacion } from '../helpers/notificaciones.js'; // Debes crear este helper
import {
  getVentasPorPeriodo,
  getResumenVentasPorPeriodo,
  createVentaDispositivoModel,
  getAdminIdModel,
  getDispositivosByUserModel,
  getAllDispositivosModel,
  getDispositivoDetalleModel,
  getDispositivoPorIdModel
} from '../models/ventasModel.js';

// Obtener ventas por periodo (día, semana, mes, año)
export const obtenerVentasPorPeriodo = async (req, res) => {
  const { periodo } = req.query;

  try {
    if (!['dia', 'semana', 'mes', 'año'].includes(periodo)) {
      return res.status(400).json({ message: 'Periodo no válido' });
    }

    const results = await getVentasPorPeriodo(periodo);
    res.json(results);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ message: 'Error al obtener las ventas' });
  }
};

// Obtener resumen de ventas (totales y promedios)
export const obtenerResumenVentas = async (req, res) => {
  const { periodo } = req.query;

  try {
    if (!['dia', 'semana', 'mes', 'año'].includes(periodo)) {
      return res.status(400).json({ message: 'Periodo no válido' });
    }

    const result = await getResumenVentasPorPeriodo(periodo);
    res.json(result);
  } catch (error) {
    console.error('Error al obtener resumen de ventas:', error);
    res.status(500).json({ message: 'Error al obtener el resumen de ventas' });
  }
};

export const venderDispositivo = async (req, res) => {
  const { nombreDispositivo, marca, modelo, estado, descripcion, contacto } = req.body;
  const imagen = req.file ? req.file.filename : null;
  const usuarioEmail = req.user.email;
  const id_usuario = req.user.id_usuario;

  try {
    // Guardar en la base de datos
    const result = await createVentaDispositivoModel({
      id_usuario,
      nombreDispositivo,
      marca,
      modelo,
      estado,
      descripcion,
      contacto,
      imagen
    });

    const dispositivoId = result.insertId;

    // Enviar correo
    await sendDeviceSaleEmail({
      nombreDispositivo,
      marca,
      modelo,
      estado,
      descripcion,
      contacto,
      imagen,
      usuarioEmail
    });

    // ⭐ CAMBIO: Obtener el ID del administrador y crear la notificación para él
    const admin = await getAdminIdModel();

    if (admin) {
      const adminId = admin.id_usuario;
      
      await registrarNotificacion({
        id_usuario: adminId, // ⭐ Notificación para el admin
        tipo: 'venta',
        mensaje: `El usuario ${usuarioEmail} ha solicitado la venta de un dispositivo: ${nombreDispositivo} ${marca} ${modelo}`,
        fecha: new Date(),
        dispositivo_id: dispositivoId,
        usuario_solicitante: id_usuario // ⭐ Referencia al usuario que hizo la solicitud
      });
    }

    res.json({ success: true, message: 'Formulario enviado correctamente' });
  } catch (error) {
    console.error('Error en venderDispositivo:', error);
    res.status(500).json({ success: false, message: 'Error enviando el formulario' });
  }
};

export const getDispositivoDetalle = async (req, res) => {
  const { userId } = req.params;

  try {
    const dispositivo = await getDispositivoDetalleModel(userId);

    if (!dispositivo) {
      return res.status(404).json({ message: 'No se encontró información del dispositivo' });
    }

    res.json(dispositivo);
  } catch (error) {
    console.error('Error al obtener detalles del dispositivo:', error);
    res.status(500).json({ message: 'Error al obtener detalles del dispositivo' });
  }
};

export const getDispositivoPorId = async (req, res) => {
  const { dispositivoId } = req.params;

  try {
    const dispositivo = await getDispositivoPorIdModel(dispositivoId);

    if (!dispositivo) {
      return res.status(404).json({ message: 'No se encontró el dispositivo' });
    }

    res.json(dispositivo);
  } catch (error) {
    console.error('Error al obtener dispositivo por ID:', error);
    res.status(500).json({ message: 'Error al obtener dispositivo' });
  }
};
