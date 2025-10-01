import { useState } from "react";
import { useCart } from "../context/CartContext";
import { createOrder } from "../api/pedidoService";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import "../style/Pedido.css";

const Pedido = () => {
  const { cart, total } = useCart();
  const navigate = useNavigate();
  const [direccion, setDireccion] = useState({
    direccion: "",
    direccion_complementaria: "",
    codigo_postal: "",
    ciudad: "",
    pais: "Colombia"
  });

  const [useForBilling, setUseForBilling] = useState(false);
  const [pedidoId, setPedidoId] = useState(null);
  
  // Estado para las notificaciones
  const [notification, setNotification] = useState({
    show: false,
    type: '', // 'success' o 'error'
    message: ''
  });

  const handleChange = (e) => {
    setDireccion({ ...direccion, [e.target.name]: e.target.value });
  };

  // Función para mostrar notificaciones---
  const showNotification = (type, message) => {
    setNotification({
      show: true,
      type,
      message
    });

    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Función para cerrar notificación manualmente
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };


  const handleConfirm = async () => {
    if (!direccion.direccion || !direccion.codigo_postal || !direccion.ciudad || !direccion.pais) {
      showNotification('error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      // 1. Crear el pedido en tu backend (esto no cambia)
      const orderResponse = await createOrder({
        ...direccion,
        usar_para_facturas: useForBilling
      });

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || "Error al crear el pedido");
      }

      const { pedidoId, total } = orderResponse;

      // 2. Redirigir a la nueva página de pago de Stripe
      // Pasamos el ID del pedido y el total para usarlos en la siguiente página
      navigate('/pagar', {
        state: {
          pedidoId,
          total
        }
      });

    } catch (error) {
      console.error("Error al procesar el pedido:", error);
      const serverMsg = error.response?.data?.message;
      showNotification('error', serverMsg || error.message || "Error al procesar el pedido");
    }
  };



  const envio = 15000;
  const totalConEnvio = total + envio;

  return (
    <div className="checkout-container">
      {/* Notificación emergente */}
      {notification.show && (
        <div className={`toast-notification ${notification.type}`}>
          <div className="toast-content">
            <div className="toast-icon">
              {notification.type === 'success' ? (
                <i className="bi bi-check-circle-fill"></i>
              ) : (
                <i className="bi bi-exclamation-triangle-fill"></i>
              )}
            </div>
            <div className="toast-message">
              {notification.message}
            </div>
            <button 
              className="toast-close" 
              onClick={closeNotification}
              aria-label="Cerrar notificación"
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
        </div>
      )}

      <div className="checkout-wrapper">
        
        {/* Lado izquierdo */}
        <div className="checkout-left">
          
          {/* Datos personales */}
          <div className="checkout-datos-personales">
            <div className="checkout-datos-personales-header">
                <h2>1. Datos personales</h2>
                <Link to="/mi-informacion">
                    <i className="bi bi-pencil-square checkout-edit-icon"></i>
                </Link>
            </div>
          </div>

          {/* Direcciones */}
          <div className="checkout-direcciones">
            <h2>2. Direcciones</h2>
            
            <div className="checkout-form">
              <div className="checkout-form-row">
                <label className="checkout-form-label">Dirección *</label>
                <input 
                  type="text"
                  name="direccion"
                  placeholder="Calle 35a #42 - 110"
                  value={direccion.direccion}
                  onChange={handleChange}
                  className="checkout-form-input"
                  required
                />
              </div>

              <div className="checkout-form-row">
                <label className="checkout-form-label">
                  Dirección complementaria
                </label>
                <input 
                  type="text"
                  name="direccion_complementaria"
                  placeholder="Segundo piso"
                  value={direccion.direccion_complementaria}
                  onChange={handleChange}
                  className="checkout-form-input"
                />
              </div>

              <div className="checkout-form-row">
                <label className="checkout-form-label">Código postal *</label>
                <input 
                  type="text"
                  name="codigo_postal"
                  placeholder="050023"
                  value={direccion.codigo_postal}
                  onChange={handleChange}
                  className="checkout-form-input"
                  required
                />
              </div>

              <div className="checkout-form-row">
                <label className="checkout-form-label">Ciudad *</label>
                <input 
                  type="text"
                  name="ciudad"
                  placeholder="Medellín"
                  value={direccion.ciudad}
                  onChange={handleChange}
                  className="checkout-form-input"
                  required
                />
              </div>

              <div className="checkout-form-row">
                <label className="checkout-form-label">País *</label>
                <input 
                  type="text"
                  name="pais"
                  value={direccion.pais}
                  onChange={handleChange}
                  className="checkout-form-input"
                  required
                />
              </div>

              <div className="checkout-checkbox-row">
                <input 
                  type="checkbox" 
                  checked={useForBilling}
                  onChange={(e) => setUseForBilling(e.target.checked)}
                  className="checkout-checkbox"
                />
                <label className="checkout-checkbox-label">
                  Utilizar esta dirección para facturas
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="checkout-resumen">
          <div className="checkout-resumen-header">
            <h2>Tu pedido</h2>
          </div>

          <div className="checkout-productos">
            {cart && cart.length > 0 ? cart.map((item) => (
              <div key={item.id_carrito} className="checkout-producto-item">
                <img 
                  src={`https://ecotec-backend.onrender.com/uploads/${item.foto}`}
                  alt={item.nombre}
                  className="checkout-producto-imagen"
                />

                <div className="checkout-producto-info">
                  <p className="checkout-producto-nombre">
                    {item.nombre}
                  </p>
                  <p className="checkout-producto-precio">
                    ${(item.precio * item.cantidad).toLocaleString()}
                  </p>
                </div>
              </div>
            )) : (
              <p>No hay productos en el carrito</p>
            )}
          </div>

          <div className="checkout-totales">
            <div className="checkout-total-row">
              <span className="checkout-total-label">Total de envío</span>
              <span className="checkout-total-value">
                ${envio.toLocaleString()}
              </span>
            </div>

            <div className="checkout-total-final">
              <span className="checkout-total-final-label">Total</span>
              <span className="checkout-total-final-value">
                ${totalConEnvio.toLocaleString()}
              </span>
            </div>

            <button 
              onClick={handleConfirm}
              className="checkout-confirm-button"
              disabled={!cart || cart.length === 0}
            >
              Continuar al pago
            </button>

            <p className="checkout-disclaimer">
              Tu pedido llega en 15 días hábiles, no te olvides de calificar los productos cuando los tengas en tus manos!
            </p>
          </div>
        </div>
        
        {/* Botón volver */}
        <button className="checkout-back-buttons" onClick={() => window.history.back()}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0L6.59 1.41L12.17 7H0v2h12.17l-5.58 5.59L8 16l8-8z" transform="rotate(180 8 8)"/>
          </svg>
          Volver 
        </button>
      </div>
    </div>
  );
};

export default Pedido;