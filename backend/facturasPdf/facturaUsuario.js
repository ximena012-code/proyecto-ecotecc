import db from "../config/db.js"; import { getUserId } from "../controllers/pedidoController.js";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';


// 🆕 NUEVO: Generar y descargar factura en PDF
export const generateInvoicePDF = async (req, res) => {
  const { id_pedido } = req.params;
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ success: false, message: "Usuario no autenticado" });
  }

  try {
    // Obtener datos del pedido con detalles
    db.query(
      `SELECT p.id_pedido, p.total, p.total_envio, p.fecha_pedido, p.card_brand,
          u.nombre, u.email, u.celular,
          d.direccion, d.direccion_complementaria, d.ciudad, d.codigo_postal, d.pais
       FROM pedidos p
       JOIN usuarios u ON p.id_usuario = u.id_usuario
       LEFT JOIN direcciones d ON u.id_usuario = d.id_usuario
       WHERE p.id_pedido = ? AND p.id_usuario = ? AND p.payment_status = 'approved'
       ORDER BY d.id_direccion DESC LIMIT 1`,
      [id_pedido, userId],
      (err, pedidoData) => {
        if (err) {
          console.error("Error al obtener datos del pedido:", err);
          return res.status(500).json({ success: false, message: "Error al obtener datos del pedido" });
        }

        if (pedidoData.length === 0) {
          return res.status(404).json({ success: false, message: "Pedido no encontrado o no autorizado" });
        }

        const pedido = pedidoData[0];

        // Obtener detalles de productos del pedido
        db.query(
          `SELECT dp.cantidad, dp.precio_unitario,
                  pr.nombre, pr.descripcion
           FROM detalle_pedidos dp
           JOIN productos pr ON dp.producto_id = pr.id_producto
           WHERE dp.id_pedido = ?`,
          [id_pedido],
          (err, productos) => {
            if (err) {
              console.error("Error al obtener productos del pedido:", err);
              return res.status(500).json({ success: false, message: "Error al obtener productos del pedido" });
            }

            const facturaPath = path.join(process.cwd(), 'facturas', `factura-pedido-${id_pedido}.pdf`);
            const doc = new PDFDocument({ margin: 50 });
            const writeStream = fs.createWriteStream(facturaPath);
            doc.pipe(writeStream);

            writeStream.on('finish', () => {
              res.download(facturaPath, err => {
                if (err) {
                  console.error("Error al enviar factura:", err);
                  res.status(500).json({ success: false, message: "Error al enviar factura" });
                }
                // Opcional: eliminar el archivo después de enviarlo
                // fs.unlinkSync(facturaPath);
              });
            });

            // HEADER - Logo y datos de la empresa con diseño corporativo
            // Fondo del header con gradiente corporativo
            doc.rect(0, 0, 612, 130).fill('#1e3a5f');
            
            // Logo y nombre de la empresa
            doc.fontSize(28).fillColor('#ffffff').text('ECOTEC', 50, 40, { characterSpacing: 2 });
            doc.fontSize(10).fillColor('#e8f4f8')
               .text('Tecnología Sostenible para el Futuro', 50, 70)
               .text('EcoTec@dispositivos.com  |  +57 123 456 7890  |  www.EcoTec.com', 50, 85);

            // Marco decorativo con color corporativo
            doc.rect(40, 30, 532, 80).stroke('#00b3b3').lineWidth(2);

            // TÍTULO FACTURA con diseño corporativo
            // Fondo para el título
            doc.rect(400, 30, 150, 80).fill('#00b3b3');
            doc.fontSize(24).fillColor('#ffffff').text('FACTURA', 415, 50);
            
            // Información del pedido en una caja elegante
            doc.rect(400, 115, 150, 50).fill('#f8f9fa').stroke('#00b3b3');
            doc.fontSize(11).fillColor('#002366')
               .text(`Pedido #: ${pedido.id_pedido}`, 410, 125)
               .text(`Fecha: ${new Date(pedido.fecha_pedido).toLocaleDateString('es-CO')}`, 410, 140)
               .text('Estado: PAGADO', 410, 155);

            // LÍNEA SEPARADORA decorativa con colores corporativos
            doc.strokeColor('#00b3b3').lineWidth(3)
               .moveTo(50, 180).lineTo(550, 180).stroke();
            doc.strokeColor('#f58c0b').lineWidth(1)
               .moveTo(50, 185).lineTo(550, 185).stroke();

            // DATOS DEL CLIENTE con diseño mejorado
            let yPosition = 200;
            
            // Caja para datos del cliente
            doc.rect(50, yPosition, 250, 120).fill('#f8f9fa').stroke('#dee2e6');
            
            doc.fontSize(14).fillColor('#002366').text('DATOS DEL CLIENTE', 60, yPosition + 10);
            yPosition += 35;
            
            doc.fontSize(10).fillColor('#333333')
               .text(`Nombre: ${pedido.nombre}`, 60, yPosition)
               .text(`Email: ${pedido.email}`, 60, yPosition + 15)
               .text(`Celular: ${pedido.celular || 'No especificado'}`, 60, yPosition + 30);

            if (pedido.direccion) {
              doc.text(`Dirección: ${pedido.direccion}`, 60, yPosition + 45);
              if (pedido.direccion_complementaria) {
                doc.text(`${pedido.direccion_complementaria}`, 60, yPosition + 60);
                yPosition += 15;
              }
              doc.text(`${pedido.ciudad}, ${pedido.codigo_postal}, ${pedido.pais}`, 60, yPosition + 60);
              yPosition += 30;
            }

            yPosition = 330; // Ajustar posición para la siguiente sección

            // TABLA DE PRODUCTOS con diseño corporativo
            doc.fontSize(14).fillColor('#002366').text('DETALLES DEL PEDIDO', 50, yPosition);
            yPosition += 30;

            // Headers de la tabla con colores corporativos
            doc.rect(50, yPosition, 500, 30).fill('#1e3a5f');
            doc.rect(50, yPosition, 500, 3).fill('#00b3b3'); // Línea turquesa superior
            
            doc.fillColor('#ffffff').fontSize(11)
               .text('Producto', 60, yPosition + 10)
               .text('Cant.', 300, yPosition + 10)
               .text('Precio Unit.', 380, yPosition + 10)
               .text('Subtotal', 460, yPosition + 10);

            yPosition += 30;

            // Filas de productos con mejor diseño
            let subtotalPedido = 0;
            productos.forEach((producto, index) => {
              const subtotalProducto = producto.cantidad * producto.precio_unitario;
              subtotalPedido += subtotalProducto;

              const bgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
              doc.rect(50, yPosition, 500, 25).fill(bgColor).stroke('#e9ecef');

              doc.fillColor('#333333').fontSize(10)
                .text(producto.nombre, 60, yPosition + 8, { width: 230 })
                .text(producto.cantidad.toString(), 300, yPosition + 8)
                .text(`$${Number(producto.precio_unitario).toLocaleString('es-CO')}`, 380, yPosition + 8)
                .fillColor('#00b3b3').fontSize(10)
                .text(`$${subtotalProducto.toLocaleString('es-CO')}`, 460, yPosition + 8);

              yPosition += 25;
            });

            // TOTALES con diseño corporativo
            yPosition += 20;
            
            // Caja para totales
            doc.rect(320, yPosition, 230, 90).fill('#f8f9fa').stroke('#00b3b3');
            
            doc.fontSize(11).fillColor('#002366')
               .text(`Subtotal:`, 330, yPosition + 15)
               .text(`$${Number(subtotalPedido).toLocaleString('es-CO')} COP`, 450, yPosition + 15)
               .text(`Envío:`, 330, yPosition + 35)
               .text(`$${Number(pedido.total_envio).toLocaleString('es-CO')} COP`, 450, yPosition + 35);
               
            // Línea separadora
            doc.strokeColor('#00b3b3').lineWidth(1)
               .moveTo(330, yPosition + 55).lineTo(540, yPosition + 55).stroke();
               
            doc.fontSize(14).fillColor('#002366')
               .text(`TOTAL:`, 330, yPosition + 65)
               .fontSize(16).fillColor('#00b3b3')
               .text(`$${Number(pedido.total).toLocaleString('es-CO')} COP`, 450, yPosition + 65);

            // MÉTODO DE PAGO con diseño corporativo
            yPosition += 110;
            
            // Caja para método de pago
            doc.rect(50, yPosition, 200, 35).fill('#e8f7f7').stroke('#00b3b3');
            doc.fontSize(10).fillColor('#002366')
               .text('Método de pago:', 60, yPosition + 8)
               .fontSize(12).fillColor('#00b3b3')
               .text(`${pedido.card_brand ? pedido.card_brand.charAt(0).toUpperCase() + pedido.card_brand.slice(1) : 'No especificado'}`, 60, yPosition + 20);

            // FOOTER con diseño corporativo
            yPosition += 50;
            
            // Línea decorativa
            doc.strokeColor('#00b3b3').lineWidth(2)
               .moveTo(50, yPosition).lineTo(550, yPosition).stroke();
            
            // Fondo del footer
            doc.rect(0, yPosition + 10, 612, 60).fill('#1e3a5f');
            
            doc.fontSize(9).fillColor('#e8f4f8')
               .text('¡Gracias por elegir ECOTEC! Tu confianza impulsa nuestro compromiso con la sostenibilidad.', 50, yPosition + 25)
               .text('Este documento es una factura válida y cumple con todos los requisitos legales.', 50, yPosition + 40)
               .text('Soporte: +57 123 456 7890  |  soporte@ecotec.com  |  www.ecotec.com', 50, yPosition + 55);

            // Finalizar el documento
            doc.end();
          }
        );
      }
    );
  } catch (error) {
    console.error("Error inesperado al generar factura:", error);
    res.status(500).json({ success: false, message: "Error interno al generar factura" });
  }
};