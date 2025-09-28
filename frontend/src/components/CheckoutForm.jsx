import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import '../style/CheckoutForm.css';

const CheckoutForm = ({ pedidoId }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Detectar si estamos en desarrollo o producción
  const getBaseUrl = () => {
    if (import.meta.env.PROD) {
      return 'https://proyecto-ecotecc.onrender.com';
    }
    return 'http://localhost:5173';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Usar la URL correcta según el entorno
        return_url: `${getBaseUrl()}/pago-exitoso?pedido_id=${pedidoId}`,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message);
    } else {
      setMessage("Ocurrió un error inesperado.");
    }
    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />
      <button disabled={isLoading || !stripe || !elements} id="submit" className="pay-button">
        <span id="button-text">
          {isLoading ? <div className="spinner"></div> : "Pagar ahora"}
        </span>
      </button>
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
};

export default CheckoutForm;