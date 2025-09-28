import React, { useState, useEffect } from 'react';
import { Bell, X, Maximize2, Package, Clock, User, ShoppingCart, Gift, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import CalificacionProductos from './CalificacionProductos';
import '../style/NotificacionPanel.css';

const NotificacionPanel = ({ isOpen, onClose, onUpdateUnread }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarCalificacion, setMostrarCalificacion] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchNotificaciones();
    }
  }, [isOpen]);

  const fetchNotificaciones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://ecotec-backend.onrender.com/api/notificaciones', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filtrar según el rol del usuario
      let notificacionesFiltradas;
      if (user?.rol === 'admin') {
        notificacionesFiltradas = response.data.filter(n =>
          ['venta', 'reparacion', 'reparacion_actualizada'].includes(n.tipo)
        );
      } else {
        notificacionesFiltradas = response.data.filter(n =>
          !['venta', 'reparacion'].includes(n.tipo) || n.tipo === 'compra_exitosa' || n.tipo === 'promocion'
        );
      }
      // Mostrar solo las últimas 5 notificaciones en el panel lateral
      setNotificaciones(notificacionesFiltradas.slice(0, 5));
      if (onUpdateUnread) {
        onUpdateUnread();
      }
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLeida = async (idNotificacion) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://ecotec-backend.onrender.com/api/notificaciones/${idNotificacion}/leida`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotificaciones(prev => 
        prev.map(notif => 
          notif.id_notificaciones === idNotificacion ? { ...notif, leida: true } : notif
        )
      );
      if (onUpdateUnread) {
        onUpdateUnread();
      }
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const getIconByType = (tipo) => {
    switch (tipo) {
      case 'venta':
        return <Package size={16} />;
      case 'reparacion':
        return <Bell size={16} />;
      case 'reparacion_actualizada':
        return <Clock size={16} />;
      case 'compra_exitosa':
        return <ShoppingCart size={16} />;
      case 'promocion':
        return <Gift size={16} />;
      default:
        return <User size={16} />;
    }
  };

  const handleNotificationClick = async (notificacion) => {
    if (!notificacion.leida) {
      await marcarComoLeida(notificacion.id_notificaciones);
    }
    
    // Cerrar el panel
    onClose();
    
    // Redirigir según el tipo y rol
    if (user?.rol === 'admin') {
      if (notificacion.tipo === 'reparacion' || notificacion.tipo === 'reparacion_actualizada') {
        navigate('/estado-reparacion');
      } else {
        navigate('/notificaciones');
      }
    } else {
      // Para usuarios normales
      if (notificacion.tipo === 'reparacion_actualizada') {
        navigate('/servicios/ver-estado');
      } else if (notificacion.tipo === 'compra_exitosa') {
        navigate('/historial-facturas');
      } else if (notificacion.tipo === 'promocion') {
        navigate('/productos/promociones');
      } else {
        navigate('/notificaciones');
      }
    }
  };

  const handleMaximize = () => {
    onClose();
    navigate('/notificaciones');
  };

  const handleCalificarProducto = (e, pedidoId) => {
    e.stopPropagation(); // Evitar que se active el click de la notificación
    setPedidoSeleccionado(pedidoId);
    setMostrarCalificacion(true);
  };

  const handleCalificacionSuccess = () => {
    // Actualizar las notificaciones para reflejar que ya se calificó
    fetchNotificaciones();
  };

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Hace unos minutos';
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    });
  };

  const getTitleByRole = () => {
    if (user?.rol === 'admin') {
      return 'Notificaciones Admin';
    }
    return 'Mis Notificaciones';
  };

  const getNotificationTitle = (notificacion) => {
    if (user?.rol === 'admin') {
      return notificacion.tipo === 'venta' ? 'Solicitud de venta' : 
             notificacion.tipo === 'reparacion' ? 'Nueva reparación' :
             notificacion.tipo === 'reparacion_actualizada' ? 'Estado actualizado' :
             'Notificación';
    } else {
      return notificacion.tipo === 'reparacion_actualizada' ? 'Estado actualizado' :
             notificacion.tipo === 'compra_exitosa' ? 'Compra confirmada' :
             notificacion.tipo === 'promocion' ? 'Nueva promoción' :
             'Notificación del sistema';
    }
  };

  const getNotificationBadge = (notificacion) => {
    if (user?.rol === 'admin') {
      return notificacion.tipo === 'venta' ? 'Venta' : 
             notificacion.tipo === 'reparacion' ? 'Reparación' :
             notificacion.tipo === 'reparacion_actualizada' ? 'Actualizado' :
             'Notificación';
    } else {
      return notificacion.tipo === 'reparacion_actualizada' ? 'Actualizado' :
             notificacion.tipo === 'compra_exitosa' ? 'Compra' :
             notificacion.tipo === 'promocion' ? 'Promoción' :
             'Sistema';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="notification-overlay" onClick={onClose}></div>
      
      {/* Panel lateral */}
      <div className={`notification-panel ${isOpen ? 'open' : ''}`}>
        {/* Header del panel */}
        <div className="notification-panel-header">
          <div className="panel-header-content">
            <Bell size={20} />
            <span>{getTitleByRole()}</span>
            <span className="notification-count">
              {notificaciones.filter(n => !n.leida).length}
            </span>
          </div>
          <div className="panel-header-actions">
            <button 
              className="panel-action-btn maximize-btn"
              onClick={handleMaximize}
              title="Ver todas las notificaciones"
            >
              <Maximize2 size={16} />
            </button>
            <button 
              className="panel-action-btn close-btn"
              onClick={onClose}
              title="Cerrar panel"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Contenido del panel */}
        <div className="notification-panel-content">
          {loading ? (
            <div className="panel-loading">
              <div className="panel-spinner"></div>
              <span>Cargando...</span>
            </div>
          ) : notificaciones.length === 0 ? (
            <div className="panel-empty">
              <Bell size={24} />
              <span>No hay notificaciones</span>
            </div>
          ) : (
            <div className="notification-panel-list">
              {notificaciones.map((notificacion) => (
                <div
                  key={notificacion.id_notificaciones}
                  className={`panel-notification-item ${!notificacion.leida ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notificacion)}
                >
                  <div className="panel-notification-icon">
                    <div className={`icon-container ${notificacion.tipo}`}>
                      {getIconByType(notificacion.tipo)}
                    </div>
                  </div>
                  
                  <div className="panel-notification-content">
                    <div className="panel-notification-header">
                      <span className="panel-notification-title">
                        {getNotificationTitle(notificacion)}
                      </span>
                      <span className="panel-notification-time">
                        {formatFecha(notificacion.fecha)}
                      </span>
                    </div>
                    
                    <p className="panel-notification-message">
                      {notificacion.mensaje.length > 60 
                        ? `${notificacion.mensaje.substring(0, 60)}...` 
                        : notificacion.mensaje}
                    </p>
                    
                    <div className="panel-notification-footer">
                      <div className="panel-notification-badges">
                        <span className={`panel-type-badge ${notificacion.tipo}`}>
                          {getNotificationBadge(notificacion)}
                        </span>
                        {notificacion.tipo === 'compra_exitosa' && notificacion.pedido_id && (
                          <button 
                            className="panel-calificar-btn"
                            onClick={(e) => handleCalificarProducto(e, notificacion.pedido_id)}
                            title="Calificar productos"
                          >
                            <Star size={12} />
                            Calificar
                          </button>
                        )}
                      </div>
                      {!notificacion.leida && <span className="panel-unread-dot"></span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {notificaciones.length > 0 && (
            <div className="panel-footer">
              <button 
                className="view-all-btn"
                onClick={handleMaximize}
              >
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de calificación */}
      {mostrarCalificacion && pedidoSeleccionado && (
        <CalificacionProductos
          pedidoId={pedidoSeleccionado}
          onClose={() => {
            setMostrarCalificacion(false);
            setPedidoSeleccionado(null);
          }}
          onSuccess={handleCalificacionSuccess}
        />
      )}
    </>
  );
};

export default NotificacionPanel;