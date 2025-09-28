import nodemailer from 'nodemailer';

// Configuración del transporte de correos
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'camilatoro137@gmail.com',   // tu correo
    pass: 'wifr opev tlpu bczm'        // tu contraseña de aplicación
  }
});

// Función para enviar el correo
export const sendResetPasswordEmail = async (to, resetLink) => {
  try {
    await transporter.sendMail({
      from: '"EcoTec" <camilatoro137@gmail.com>',
      to,
      subject: '🔑 Recuperación de contraseña - EcoTec',
      html: `
        <div style="background: linear-gradient(135deg, #e0f7fa 0%, #f9f9f9 100%); font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 18px; box-shadow: 0 4px 24px rgba(3,70,110,0.08); overflow: hidden;">
          <!-- Header -->
          <div style="background: #03466e; padding: 32px 0 16px 0; text-align: center;">
            <h2 style="color: #fff; margin: 0; font-size: 2rem; letter-spacing: 2px;">EcoTec</h2>
            <p style="color: #b3e5fc; margin: 8px 0 0 0; font-size: 1.1rem;">Tecnología Sustentable</p>
          </div>
          <!-- Main Content -->
          <div style="padding: 32px 24px 24px 24px; background: #fff;">
            <div style="text-align: center;">
              <span style="font-size: 48px;">🔑</span>
              <h3 style="color: #03466e; margin: 16px 0 8px 0; font-size: 1.5rem;">Recupera tu contraseña</h3>
            </div>
            <p style="font-size: 17px; color: #333; margin-bottom: 18px; text-align: center;">Hola, Sr Usuario 👋</p>
            <p style="font-size: 16px; color: #555; text-align: center;">Has solicitado <b>restablecer tu contraseña</b>.<br>Para continuar, haz clic en el siguiente botón seguro:</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetLink}" target="_blank" style="background: linear-gradient(90deg, #03466e 60%, #00bcd4 100%); color: #fff; text-decoration: none; padding: 16px 36px; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 0 2px 8px rgba(3,70,110,0.12); transition: background 0.3s; display: inline-block;">Cambiar contraseña</a>
            </div>
            <p style="font-size: 15px; color: #888; text-align: center; margin-bottom: 0;">Si no solicitaste este cambio, ignora este correo.<br>Por tu seguridad, este enlace caduca en <b>1 hora</b>.</p>
          </div>
          <!-- Footer -->
          <div style="background: #f1f8e9; padding: 18px 0; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="font-size: 13px; color: #999; margin: 0;">© ${new Date().getFullYear()} EcoTec - Todos los derechos reservados</p>
            <small style="color: #bdbdbd;">Este es un correo automático, por favor no responder.</small>
          </div>
        </div>
      `
    });

    console.log("✅ Correo enviado correctamente a:", to);
  } catch (error) {
    console.error("❌ Error enviando correo:", error);
    throw error;
  }
};

export const sendRepairConfirmationEmail = async (to, ticket) => {
  try {
    await transporter.sendMail({
      from: '"EcoTec" <camilatoro137@gmail.com>',
      to,
      subject: '🔧 Confirmación de Solicitud de Reparación - EcoTec',
      html: `
        <div style="background: linear-gradient(135deg, #e0f7fa 0%, #f9f9f9 100%); font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 18px; box-shadow: 0 4px 24px rgba(3,70,110,0.08); overflow: hidden;">
          <!-- Header -->
          <div style="background: #03466e; padding: 32px 0 16px 0; text-align: center;">
            <img src="https://img.icons8.com/color/96/000000/maintenance.png" alt="EcoTec" style="width: 64px; margin-bottom: 8px;" />
            <h2 style="color: #fff; margin: 0; font-size: 2rem; letter-spacing: 2px;">EcoTec</h2>
            <p style="color: #b3e5fc; margin: 8px 0 0 0; font-size: 1.1rem;">¡Gracias por confiar en nosotros!</p>
          </div>
          <!-- Main Content -->
          <div style="padding: 32px 24px 24px 24px; background: #fff;">
            <div style="text-align: center;">
              <span style="font-size: 48px;">🔧</span>
              <h3 style="color: #03466e; margin: 16px 0 8px 0; font-size: 1.5rem;">Solicitud de reparación recibida</h3>
            </div>
            <p style="font-size: 17px; color: #333; margin-bottom: 18px; text-align: center;">Hemos recibido tu <b>solicitud de reparación</b> correctamente.</p>
            <div style="text-align: center; margin: 32px 0;">
              <div style="display: inline-block; background: linear-gradient(90deg, #03466e 60%, #00bcd4 100%); color: #fff; padding: 18px 36px; border-radius: 10px; font-size: 22px; font-weight: bold; box-shadow: 0 2px 8px rgba(3,70,110,0.12); margin-bottom: 8px;">Ticket: ${ticket}</div>
              <p style="font-size: 15px; color: #888; margin: 8px 0 0 0;">Guarda este número para dar seguimiento a tu reparación</p>
            </div>
            <div style="background: #e8f4ff; padding: 20px; border-radius: 10px; margin: 24px 0;">
              <h4 style="color: #03466e; margin: 0 0 12px 0; font-size: 1.1rem;">Próximos pasos</h4>
              <ul style="color: #555; font-size: 15px; margin: 0; padding-left: 20px;">
                <li>Te contactaremos pronto para confirmar la recepción de tu dispositivo</li>
                <li>Realizaremos un diagnóstico detallado</li>
                <li>Te enviaremos una cotización para tu aprobación</li>
              </ul>
            </div>
            <p style="font-size: 15px; color: #555; text-align: center;">Si tienes alguna duda, puedes responder a este correo o contactarnos directamente.</p>
          </div>
          <!-- Footer -->
          <div style="background: #f1f8e9; padding: 18px 0; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="font-size: 13px; color: #999; margin: 0;">© ${new Date().getFullYear()} EcoTec - Todos los derechos reservados</p>
            <small style="color: #bdbdbd;">Este es un correo automático, por favor no responder.</small>
          </div>
        </div>
      `
    });
    console.log("✅ Correo de reparación enviado a:", to);
  } catch (error) {
    console.error("❌ Error enviando correo de reparación:", error);
  }
};

export const sendRepairStatusUpdateEmail = async (to, ticket, estado) => {
  // Función para obtener el emoji según el estado
  const getStatusEmoji = (status) => {
    switch(status) {
      case 'pendiente': return '⏳';
      case 'en_proceso': return '🔧';
      case 'finalizado': return '✅';
      default: return '📋';
    }
  };

  // Función para obtener mensaje según estado
  const getStatusMessage = (status) => {
    switch(status) {
      case 'pendiente': 
        return 'Tu dispositivo está en cola para ser revisado por nuestros técnicos.';
      case 'en_proceso': 
        return 'Nuestros técnicos están trabajando en tu dispositivo en este momento.';
      case 'finalizado': 
        return '¡Tu dispositivo está listo para ser retirado!';
      default: 
        return 'Estado actualizado.';
    }
  };

  try {
    await transporter.sendMail({
      from: '"EcoTec" <camilatoro137@gmail.com>',
      to,
      subject: `${getStatusEmoji(estado)} Actualización de tu reparación en EcoTec`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <!-- Header -->
          <div style="text-align: center; background-color: #03466e; padding: 20px; border-radius: 10px 10px 0 0;">
            <h2 style="color: #ffffff; margin: 0;">EcoTec</h2>
            <p style="color: #ffffff; margin: 10px 0 0;">Centro de Reparación Tecnológica</p>
          </div>

          <!-- Contenido Principal -->
          <div style="padding: 30px; background-color: #ffffff; border-radius: 0 0 10px 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <span style="font-size: 40px;">${getStatusEmoji(estado)}</span>
              <h3 style="color: #03466e; margin: 10px 0;">Actualización de Estado</h3>
            </div>

            <!-- Ticket Info Box -->
            <div style="background-color: #f5f9ff; padding: 20px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #d1e3ff;">
              <p style="font-size: 16px; color: #333; margin: 0;">
                Ticket: <strong>${ticket}</strong>
              </p>
              <p style="font-size: 16px; color: #333; margin: 10px 0 0;">
                Estado actual: <strong style="color: #03466e;">${estado.toUpperCase()}</strong>
              </p>
            </div>

            <!-- Status Message -->
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              ${getStatusMessage(estado)}
            </p>

            <!-- Información Adicional -->
            <div style="background-color: #fff8e6; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #ffe5b4;">
              <h4 style="color: #b38600; margin: 0 0 15px;">Información Importante</h4>
              <ul style="color: #666; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Puedes consultar el estado de tu reparación en cualquier momento ingresando tu número de ticket en nuestra página web.</li>
                <li>Si tienes alguna pregunta, no dudes en contactarnos.</li>
                <li>Te mantendremos informado sobre cualquier novedad en tu reparación.</li>
              </ul>
            </div>


            <!-- Contact Info -->
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; margin: 0 0 10px;">¿Necesitas ayuda?</p>
              <p style="color: #666; margin: 0;">
                Contáctanos al: <a href="tel:+593984870784" style="color: #03466e; text-decoration: none;">098-487-0784</a><br>
                Email: <a href="mailto:camilatoro137@gmail.com" style="color: #03466e; text-decoration: none;">ecotec@gmail.com</a>
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 20px;">
            <p style="font-size: 12px; color: #999;">
              © ${new Date().getFullYear()} EcoTec - Todos los derechos reservados<br>
              <small>Este es un correo automático, por favor no responder.</small>
            </p>
          </div>
        </div>
      `
    });
    console.log("✅ Correo de actualización de estado enviado a:", to);
  } catch (error) {
    console.error("❌ Error enviando correo de actualización de estado:", error);
  }
};

export const sendDeviceSaleEmail = async (data) => {
  try {
    const mailOptions = {
      from: '"EcoTec" <camilatoro137@gmail.com>',
      to: 'camilatoro137@gmail.com',
      replyTo: data.usuarioEmail,
      subject: '🛒 Nueva solicitud de venta de dispositivo - EcoTec',
      html: `
        <div style="background: linear-gradient(135deg, #e0f7fa 0%, #f9f9f9 100%); font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 18px; box-shadow: 0 4px 24px rgba(3,70,110,0.08); overflow: hidden;">
          <!-- Header -->
          <div style="background: #03466e; padding: 32px 0 16px 0; text-align: center;">
            <img src="https://img.icons8.com/color/96/000000/sell.png" alt="EcoTec" style="width: 64px; margin-bottom: 8px;" />
            <h2 style="color: #fff; margin: 0; font-size: 2rem; letter-spacing: 2px;">EcoTec</h2>
            <p style="color: #b3e5fc; margin: 8px 0 0 0; font-size: 1.1rem;">Nueva Solicitud de Venta</p>
          </div>
          <!-- Main Content -->
          <div style="padding: 32px 24px 24px 24px; background: #fff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <span style="font-size: 48px;">�</span>
              <h3 style="color: #03466e; margin: 16px 0 8px 0; font-size: 1.5rem;">Dispositivo en Venta</h3>
              <p style="color: #666; margin: 0; font-size: 16px;">Un usuario quiere vender su dispositivo</p>
            </div>
            <!-- Información del Usuario -->
            <div style="background: #e8f4ff; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
              <h4 style="color: #03466e; margin: 0 0 12px 0; font-size: 1.1rem; display: flex; align-items: center;">
                <span style="margin-right: 8px;">👤</span> Información del Usuario
              </h4>
              <p style="margin: 8px 0; color: #333; font-size: 15px;">
                <strong>Email:</strong> <a href="mailto:${data.usuarioEmail}" style="color: #03466e; text-decoration: none;">${data.usuarioEmail}</a>
              </p>
              <p style="margin: 8px 0; color: #333; font-size: 15px;">
                <strong>Contacto:</strong> ${data.contacto}
              </p>
            </div>
            <!-- Detalles del Dispositivo -->
            <div style="background: #fff8e6; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
              <h4 style="color: #b38600; margin: 0 0 12px 0; font-size: 1.1rem; display: flex; align-items: center;">
                <span style="margin-right: 8px;">📱</span> Detalles del Dispositivo
              </h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <p style="margin: 8px 0; color: #333; font-size: 15px;">
                  <strong>Nombre:</strong> ${data.nombreDispositivo}
                </p>
                <p style="margin: 8px 0; color: #333; font-size: 15px;">
                  <strong>Marca:</strong> ${data.marca}
                </p>
                <p style="margin: 8px 0; color: #333; font-size: 15px;">
                  <strong>Modelo:</strong> ${data.modelo}
                </p>
                <p style="margin: 8px 0; color: #333; font-size: 15px;">
                  <strong>Estado:</strong> <span style="background-color: #e8f5e8; padding: 2px 8px; border-radius: 4px; color: #2d7d32;">${data.estado}</span>
                </p>
              </div>
            </div>
            ${data.descripcion ? `
            <!-- Descripción -->
            <div style="background: #f0f7ff; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
              <h4 style="color: #1565c0; margin: 0 0 12px 0; font-size: 1.1rem; display: flex; align-items: center;">
                <span style="margin-right: 8px;">📝</span> Descripción Adicional
              </h4>
              <p style="margin: 0; color: #333; line-height: 1.6; font-style: italic; font-size: 15px;">
                "${data.descripcion}"
              </p>
            </div>
            ` : ''}
            ${data.imagen ? `
            <!-- Imagen del Dispositivo -->
            <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin-bottom: 25px; text-align: center;">
              <h4 style="color: #666; margin: 0 0 12px 0; font-size: 1.1rem; display: flex; align-items: center;">
                <span style="margin-right: 8px;">📷</span> Imagen del Dispositivo
              </h4>
              <img src="cid:deviceImage" alt="Imagen del dispositivo" style="max-width: 100%; height: auto; border-radius: 8px; border: 2px solid #ddd; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <p style="margin: 15px 0 0; color: #666; font-size: 14px; text-align: center;">
                Imagen del dispositivo: <strong>${data.imagen}</strong>
              </p>
            </div>
            ` : ''}
            <!-- Acciones Recomendadas -->
            <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
              <h4 style="color: #2d7d32; margin: 0 0 12px 0; font-size: 1.1rem; display: flex; align-items: center;">
                <span style="margin-right: 8px;">✅</span> Próximos Pasos
              </h4>
              <ul style="color: #333; margin: 0; padding-left: 20px; line-height: 1.6; font-size: 15px;">
                <li>Revisar la información del dispositivo</li>
                <li>Contactar al usuario para coordinar la evaluación</li>
                <li>Realizar una tasación del dispositivo</li>
                <li>Enviar la propuesta de compra al usuario</li>
              </ul>
            </div>
            <!-- Información de Contacto Rápido -->
            <div style="text-align: center; background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px; color: #333; font-weight: bold; font-size: 15px;">Responder directamente al usuario:</p>
              <a href="mailto:${data.usuarioEmail}" 
                 style="background: linear-gradient(90deg, #03466e 60%, #00bcd4 100%); color: #fff; text-decoration: none; padding: 12px 25px; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">📧 Contactar Usuario</a>
            </div>
            <!-- Fecha y Hora -->
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; margin: 0; font-size: 14px;">
                📅 Solicitud recibida el: ${new Date().toLocaleString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          <!-- Footer -->
          <div style="background: #f1f8e9; padding: 18px 0; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="font-size: 13px; color: #999; margin: 0;">© ${new Date().getFullYear()} EcoTec - Panel de Administración</p>
            <small style="color: #bdbdbd;">Sistema automático de notificaciones</small>
          </div>
        </div>
      `
    };

    // Si hay imagen, agregarla como adjunto
    if (data.imagen) {
      mailOptions.attachments = [
        {
          filename: data.imagen,
          path: `uploads/${data.imagen}`,
          cid: 'deviceImage' // Content-ID para referenciar en el HTML
        }
      ];
    }

    await transporter.sendMail(mailOptions);
    console.log("✅ Correo de venta enviado correctamente a admin");
  } catch (error) {
    console.error("❌ Error enviando correo de venta:", error);
    throw error;
  }
};
