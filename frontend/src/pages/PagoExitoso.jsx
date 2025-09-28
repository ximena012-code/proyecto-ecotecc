import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStripe } from '@stripe/react-stripe-js';
import axios from 'axios';
import Estrellas from "../components/Estrellas";
import '../style/PagoExitoso.css';

const API_BASE_URL = 'http://localhost:5000';

const PagoExitoso = () => {
  const stripe = useStripe();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [pedidoId, setPedidoId] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const pedidoIdFromUrl = searchParams.get('pedido_id');
    const clientSecret = searchParams.get('payment_intent_client_secret');

    if (!clientSecret || !pedidoIdFromUrl) {
      setStatus('error');
      setMessage('URL de confirmación inválida. Faltan datos.');
      return;
    }

    setPedidoId(pedidoIdFromUrl);

    if (!stripe) return;

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (paymentIntent.status === 'succeeded') {
        setStatus('success');
        setMessage('¡Tu pago fue exitoso!');
        
        // Disparar evento para actualizar notificaciones inmediatamente
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('notificacionLeida'));
        }, 2000); // Pequeño delay para permitir que el webhook procese la notificación
        
      } else {
        setStatus('error');
        setMessage('El estado del pago no es exitoso.');
      }
    });
  }, [stripe, searchParams]);

  const handleDownloadInvoice = async () => {
    if (!pedidoId) return;
    setIsDownloading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/pedidos/factura/${pedidoId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          responseType: 'blob',
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factura-pedido-${pedidoId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error al descargar factura:", error);
      alert("Error al descargar la factura.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="payment-status-container">
        <div className="payment-status-card">
          <div className="loading-spinner"><i className="bi bi-arrow-repeat spin"></i></div>
          <h2>Verificando tu pago...</h2>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
        <div className="payment-status-container">
            <div className="payment-status-card success">
                <div className="status-icon-wrapper"><i className="bi bi-check-circle-fill"></i></div>
                <h1>¡Pago Exitoso!</h1>
                <p>Tu pedido <strong>#{pedidoId}</strong> ha sido procesado correctamente.</p>

                {pedidoId && <Estrellas idPedido={pedidoId} />}

                <div className="payment-details">
                    <p><strong>ID del pedido:</strong> #{pedidoId}</p>
                    <p><strong>Estado:</strong> Confirmado</p>
                    <p><strong>Tiempo estimado de entrega:</strong> 15 días hábiles</p>
                </div>

                <div className="info-box success">
                    <i className="bi bi-info-circle-fill"></i>
                    <div>
                        <p><strong>¡Gracias por tu compra!</strong></p>
                        <ul>
                            <li>Recibirás un correo de confirmación</li>
                            <li>Tu pedido se procesará en 24-48 horas</li>
                            <li>Podrás hacer seguimiento desde tu cuenta</li>
                        </ul>
                    </div>
                </div>

                {pedidoId && (
                    <div className="invoice-section">
                        <button onClick={handleDownloadInvoice} disabled={isDownloading} className="btn-invoice">
                            {isDownloading ? 'Generando...' : 'Descargar Factura'}
                        </button>
                    </div>
                )}

                <div className="action-buttons">
                    <button onClick={() => navigate('/historial-facturas')} className="btn1-primary">Ver mis pedidos</button>
                    <button onClick={() => navigate('/')} className="btn-secondary">Seguir comprando</button>
                </div>
            </div>
        </div>
    );
  }

  // Si el status es 'error'
  return (
    <div className="payment-status-container">
      <div className="payment-status-card error">
        <div className="status-icon-wrapper"><i className="bi bi-x-circle-fill"></i></div>
        <h1>Pago Fallido</h1>
        <p>{message || "No pudimos procesar tu pago."}</p>
        <div className="action-buttons">
          <button onClick={() => navigate('/carrito')} className="btn-primary">Volver al carrito</button>
        </div>
      </div>
    </div>
  );
};

export default PagoExitoso;