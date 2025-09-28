import React, { useState, useEffect } from 'react';
import { Bell, User, ChevronDown, X, Gift, ShoppingCart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CalificacionProductos from '../components/CalificacionProductos';
import '../style/Notificaciones.css';

const NotificacionesUsuario = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarCalificacion, setMostrarCalificacion] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const fetchNotificaciones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/notificaciones', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filtra las notificaciones para usuarios (excluyendo las de admin, incluyendo promociones)
      setNotificaciones(response.data.filter(n =>
        !['venta', 'reparacion'].includes(n.tipo)
      ));
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      setError('Error al cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLeida = async (idNotificacion) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/notificaciones/${idNotificacion}/leida`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotificaciones(prev => 
        prev.map(notif => 
          notif.id_notificaciones === idNotificacion ? { ...notif, leida: true } : notif
        )
      );
      // Opcionalmente, emitir evento para actualizar el badge en el navbar
      window.dispatchEvent(new CustomEvent('notificacionLeida'));
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const getIconByType = (tipo) => {
    switch (tipo) {
      case 'reparacion_actualizada':
        return <Bell className="notification-icon reparacion-actualizada" />;
      case 'promocion':
        return <Gift className="notification-icon promocion" />;
      case 'compra_exitosa':
        return <ShoppingCart className="notification-icon compra-exitosa" />;
      default:
        return <User className="notification-icon default" />;
    }
  };

  const handleNotificationClick = async (notificacion) => {
    if (!notificacion.leida) {
      await marcarComoLeida(notificacion.id_notificaciones);
    }

    if (notificacion.tipo === 'compra_exitosa' && notificacion.pedido_id) {
      // Redirigir al historial de facturas para ver el pedido específico
      navigate('/historial-facturas');
    } else if (notificacion.tipo === 'reparacion_actualizada') {
      navigate('/servicios/ver-estado');
    } else if (notificacion.tipo === 'promocion') {
      navigate('/productos/promociones');
    }
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
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Hoy';
    if (diffDays === 2) return 'Ayer';
    if (diffDays <= 7) return `Hace ${diffDays - 1} días`;
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="notificaciones-container">
      <h2 className="notificaciones-titulo">Mis Notificaciones</h2>
      
      <div className="notificaciones-header">
        <div className="header-content">
          <Bell className="header-icon" />
          <div>
            <h2>Actualizaciones sobre tus servicios y promociones</h2>
          </div>
        </div>
        <div className="stats">
          <span className="stat-item">
            {notificaciones.filter(n => !n.leida).length} sin leer
          </span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <div className="notificaciones-content">
        {loading ? (
          <div className="empty-state">
            <Bell className="empty-icon" />
            <h3>Cargando...</h3>
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="empty-state">
            <Bell className="empty-icon" />
            <h3>No hay notificaciones</h3>
            <p>Cuando haya actualizaciones sobre tus servicios, aparecerán aquí</p>
          </div>
        ) : (
          <div className="notificaciones-list">
            {notificaciones.map((notificacion) => (
              <div
                key={notificacion.id_notificaciones}
                className={`notification-card ${!notificacion.leida ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notificacion)}
              >
                <div className="notification-icon-container">
                  {getIconByType(notificacion.tipo)}
                </div>
                <div className="notification-content">
                  <div className="notification-header">
                    <h4 className="notification-title">
                      {notificacion.tipo === 'reparacion_actualizada' ? 'Actualización de reparación' :
                       notificacion.tipo === 'compra_exitosa' ? 'Compra exitosa' :
                       notificacion.tipo === 'promocion' ? 'Nueva promoción' :
                       'Notificación del sistema'}
                    </h4>
                    <span className="notification-time">
                      {formatFecha(notificacion.fecha)}
                    </span>
                  </div>
                  <p className="notification-message">
                    {notificacion.mensaje}
                  </p>
                  <div className="notification-footer">
                    <div className="notification-badges">
                      <span className={`type-badge ${notificacion.tipo}`}>
                        {notificacion.tipo === 'reparacion_actualizada' ? 'Estado Actualizado' :
                         notificacion.tipo === 'compra_exitosa' ? 'Compra' :
                         notificacion.tipo === 'promocion' ? 'Promoción' :
                         'Notificación'}
                      </span>
                      {notificacion.tipo === 'compra_exitosa' && notificacion.pedido_id && (
                        <button 
                          className="calificar-btn"
                          onClick={(e) => handleCalificarProducto(e, notificacion.pedido_id)}
                          title="Calificar productos"
                        >
                          <Star size={14} />
                          Calificar Producto
                        </button>
                      )}
                    </div>
                    {!notificacion.leida && (
                      <span className="unread-dot"></span>
                    )}
                  </div>
                </div>
                <ChevronDown className="notification-arrow" />
              </div>
            ))}
          </div>
        )}
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
    </div>
  );
};

export default NotificacionesUsuario;