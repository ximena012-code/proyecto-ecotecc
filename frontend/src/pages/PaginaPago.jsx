import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import { createPaymentIntent } from '../api/paymentService'; // Usamos el nuevo servicio
import '../style/PaginaPago.css'; // Crea un archivo CSS para esta página

// Carga tu clave publicable de Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY); // 👈 Centralizado en .env

const PaginaPago = () => {
  const [clientSecret, setClientSecret] = useState('');
  const location = useLocation();
  const { pedidoId, total } = location.state || {}; // Recibimos los datos de Pedido.jsx

  useEffect(() => {
    if (pedidoId) {
      createPaymentIntent(pedidoId)
        .then(data => setClientSecret(data.clientSecret))
        .catch(error => console.error("Error al obtener la intención de pago", error));
    }
  }, [pedidoId]);

  const appearance = { theme: 'stripe' };
  const options = { clientSecret, appearance };

  if (!pedidoId || !total) {
    return <div>Error: No se ha encontrado información del pedido. Vuelve al carrito.</div>;
  }

  return (
    <div className="payment-container">
      <div className="payment-box">
        <h2>Completa tu pago</h2>
        <p>Total a pagar: <strong>${(total).toLocaleString('es-CO')} COP</strong></p>
        {clientSecret && (
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm pedidoId={pedidoId} />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default PaginaPago;