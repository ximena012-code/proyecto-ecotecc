import React, { useEffect, useState } from "react";
import axios from "axios";
import '../style/HistorialFacturas.css';
import { Link } from "react-router-dom";

const API_BASE_URL = "https://ecotec-backend.onrender.com";

const HistorialFacturas = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // 🆕 Estados para el modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPedidoId, setSelectedPedidoId] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/pedidos`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setPedidos(res.data.pedidos);
        setError(null);
      } catch (err) {
        console.error("Error al obtener pedidos:", err);
        setError("Error al cargar el historial de facturas");
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  // 🆕 Función para mostrar el modal de confirmación
  const handleDownloadClick = (pedidoId) => {
    setSelectedPedidoId(pedidoId);
    setShowConfirmModal(true);
  };

  // 🆕 Función para cancelar la descarga
  const cancelDownload = () => {
    setShowConfirmModal(false);
    setSelectedPedidoId(null);
  };

  // 🆕 Función para confirmar y proceder con la descarga
  const confirmDownload = async () => {
    if (!selectedPedidoId) return;
    
    try {
      setIsDownloading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/pedidos/factura/${selectedPedidoId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          responseType: "blob"
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `factura-pedido-${selectedPedidoId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar factura:", error);
      alert("Error al descargar la factura. Por favor, inténtalo de nuevo.");
    } finally {
      setIsDownloading(false);
      setShowConfirmModal(false);
      setSelectedPedidoId(null);
    }
  };

  if (loading) {
    return (
      <div className="historial-container">
        <div className="historial-card">
          <p>Cargando historial de facturas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="historial-container">
        <div className="historial-card">
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="historial-wrapper">
      <div className="historial-container">
        <div className="historial-card">
          <h2 className="historial-title">Historial de facturas</h2>
          
          {pedidos.length === 0 ? (
            <div className="no-pedidos">
              <p>No tienes compras pagadas aún.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="facturas-table">
                <thead>
                  <tr className="table-header">
                    <th>N°</th>
                    <th>Factura</th>
                    <th>Nombre</th>
                    <th>Cantidad</th>
                    <th>Fecha de creación</th>
                    <th>Total</th>
                    <th>Forma de pago</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((pedido, index) => (
                    <tr
                      key={pedido.id_pedido}
                      className="table-row"
                      onClick={() => handleDownloadClick(pedido.id_pedido)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{pedidos.length - index}</td>
                      <td>ET-{pedido.id_pedido}</td>
                      <td>{pedido.nombre_usuario}</td>
                      <td>{pedido.cantidad_total}</td>
                      <td>
                        {new Date(pedido.fecha_pedido).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        })}
                      </td>
                      <td>
                        {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                          minimumFractionDigits: 0
                        }).format(pedido.total)}
                      </td>
                      <td>
                        {pedido.card_brand ? (
                          <span 
                            className="payment-method" 
                            data-brand={pedido.card_brand.toLowerCase()}
                          >
                            {pedido.card_brand.charAt(0).toUpperCase() + pedido.card_brand.slice(1)}
                            {pedido.card_last4 && ` ****${pedido.card_last4}`}
                          </span>
                        ) : (
                          <span className="payment-method-fallback">
                            {pedido.payment_method || 'No especificado'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
         {/* 🔹 Botón para volver */}
      <div className="back-to-dashboard2">
        <Link to="/dashboard">← Volver a mi cuenta</Link>
      </div>
    </div>
 
        {/* 🆕 Modal de confirmación personalizado */}
        {showConfirmModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Descargar Factura</h3>
              </div>
              <div className="modal-body">
                <div className="modal-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#495057" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2V8H20" stroke="#495057" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 13H8" stroke="#495057" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 17H8" stroke="#495057" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 9H9H8" stroke="#495057" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p>¿Deseas descargar la factura <strong>ET-{selectedPedidoId}</strong>?</p>
                <p className="modal-subtitle">Se descargará un archivo PDF con los detalles de tu compra.</p>
              </div>
              <div className="modal-actions">
                <button 
                  className="btn-cancel" 
                  onClick={cancelDownload}
                  disabled={isDownloading}
                >
                  Cancelar
                </button>
                <button 
                  className="btn-confirm" 
                  onClick={confirmDownload}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <>
                      <span className="spinner-download"></span>
                      Descargando...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Descargar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
  );
};

export default HistorialFacturas;