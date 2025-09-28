import React, { useState } from "react";
import { Search, AlertCircle, CheckCircle, Clock, Wrench, Smartphone, User, Phone } from "lucide-react";
import "../style/EstadoReparacion.css";

const EstadoReparacion = () => {
  const [ticket, setTicket] = useState("");
  const [reparacion, setReparacion] = useState(null); // ✅ Cambio: ahora guarda toda la info
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Función para obtener el icono según el estado
  const getEstadoIcon = (estado) => {
    switch (estado) {
      case "finalizado":
        return <CheckCircle className="estado-icon estado-finalizado" />;
      case "en_proceso":
        return <Wrench className="estado-icon estado-proceso" />;
      case "pendiente":
      default:
        return <Clock className="estado-icon estado-pendiente" />;
    }
  };

  // ✅ Función para obtener el texto del estado
  const getEstadoTexto = (estado) => {
    switch (estado) {
      case "finalizado":
        return "Finalizado";
      case "en_proceso":
        return "En Proceso";
      case "pendiente":
      default:
        return "Pendiente";
    }
  };

  // ✅ Función para obtener el color del estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case "finalizado":
        return "#10b981"; // Verde
      case "en_proceso":
        return "#f59e0b"; // Amarillo
      case "pendiente":
      default:
        return "#6b7280"; // Gris
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setReparacion(null);
    setLoading(true);

    if (!ticket.trim()) {
      setError("Por favor ingresa un número de ticket.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/reparaciones/ticket/${ticket}`);
      const data = await res.json();

      if (res.ok) {
        setReparacion(data); // ✅ Cambio: guarda toda la información
      } else {
        setError(data.message || "No se encontró el ticket.");
      }
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="reparacion-page-container">
        {/* Hero */}
        <div className="reparacion-hero-section">
        <div className="reparacion-hero-overlay"></div>
        <div className="reparacion-hero-content">
          <h1 className="reparacion-hero-title">
            Consulta el <span className="reparacion-gradient-text">Estado</span> de tu Reparación
          </h1>
          <p className="reparacion-hero-subtitle">
            Ingresa tu número de ticket para conocer el progreso de tu solicitud.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="reparacion-form-section">
        <div className="reparacion-container">
          <div className="reparacion-section-header">
            <h2 className="reparacion-section-title">Verifica tu Ticket</h2>
            <p className="reparacion-section-subtitle">
              Introduce el código de ticket que recibiste por correo electrónico.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="reparacion-form">
            <div className="reparacion-form-group">
              <label className="reparacion-label">Número de Ticket *</label>
              <input
                type="text"
                value={ticket}
                onChange={(e) => setTicket(e.target.value)}
                placeholder="Ej: TCK-000001"
                className="reparacion-input"
              />
              {error && (
                <span className="reparacion-error-text">
                  <AlertCircle className="reparacion-error-icon" /> {error}
                </span>
              )}
            </div>

            <button type="submit" className="reparacion-submit-button" disabled={loading}>
              <Search className="reparacion-button-icon" />
              {loading ? "Consultando..." : "Consultar Estado"}
            </button>
          </form>

          {/* ✅ Modal emergente con la información */}
          {reparacion && (
            <div className="modal-overlay" onClick={() => setReparacion(null)}>
              <div className="modal-tarjeta-info" onClick={e => e.stopPropagation()}>
                <div className="modal-tarjeta-header">
                  <div>
                    <h3 className="modal-tarjeta-title">Información de Reparación</h3>
                    <div className="modal-tarjeta-ticket">Ticket: <span>{reparacion.ticket}</span></div>
                  </div>
                  <button className="modal-tarjeta-close" onClick={() => setReparacion(null)} aria-label="Cerrar modal">✕</button>
                </div>
                <div className="modal-tarjeta-body">
                  <div className="modal-tarjeta-section usuario-section">
                    <div className="modal-tarjeta-row">
                      <div className="modal-tarjeta-label">Nombre:</div>
                      <div className="modal-tarjeta-value">{reparacion.nombre}</div>
                    </div>
                  </div>
                  <div className="modal-tarjeta-section dispositivo-section">
                    <div className="modal-tarjeta-row">
                      <div className="modal-tarjeta-label">Tipo:</div>
                      <div className="modal-tarjeta-value">{reparacion.dispositivo}</div>
                    </div>
                    <div className="modal-tarjeta-row">
                      <div className="modal-tarjeta-label">Marca:</div>
                      <div className="modal-tarjeta-value">{reparacion.marca}</div>
                    </div>
                    <div className="modal-tarjeta-row">
                      <div className="modal-tarjeta-label">Modelo:</div>
                      <div className="modal-tarjeta-value">{reparacion.modelo}</div>
                    </div>
                    {reparacion.numero_serie && (
                      <div className="modal-tarjeta-row">
                        <div className="modal-tarjeta-label">N° Serie:</div>
                        <div className="modal-tarjeta-value">{reparacion.numero_serie}</div>
                      </div>
                    )}
                  </div>
                  <div className="modal-tarjeta-section estado-section">
                    <div className="modal-stepper">
                      <div className={`modal-step ${reparacion.estado === 'pendiente' ? 'active' : ''}`}>En espera</div>
                      <div className={`modal-step ${reparacion.estado === 'en_proceso' ? 'active' : ''}`}>En proceso</div>
                      <div className={`modal-step ${reparacion.estado === 'finalizado' ? 'active' : ''}`}>Finalizado</div>
                    </div>
                  </div>
                  {reparacion.problema && (
                    <div className="modal-tarjeta-section problema-section">
                      <div className="modal-tarjeta-row">
                        <div className="modal-tarjeta-label">Problema:</div>
                        <div className="modal-tarjeta-value">{reparacion.problema}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EstadoReparacion;