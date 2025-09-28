import React, { useState, useEffect } from 'react';
import { Bell, Package, Clock, ChevronDown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/Notificaciones.css';

const NotificacionesAdmin = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [dispositivoDetalle, setDispositivoDetalle] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const fetchNotificaciones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://ecotec-backend.onrender.com/api/notificaciones', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filtra solo las notificaciones relevantes para admin
      setNotificaciones(response.data.filter(n =>
        ['venta', 'reparacion', 'reparacion_actualizada'].includes(n.tipo)
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
      await axios.put(`https://ecotec-backend.onrender.com/api/notificaciones/${idNotificacion}/leida`, {}, {
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
      case 'venta':
        return <Package className="notification-icon venta" />;
      case 'reparacion':
        return <Bell className="notification-icon reparacion" />;
      case 'reparacion_actualizada':
        return <Clock className="notification-icon reparacion-actualizada" />;
      default:
        return <Bell className="notification-icon default" />;
    }
  };

  const handleNotificationClick = async (notificacion) => {
    if (!notificacion.leida) {
      await marcarComoLeida(notificacion.id_notificaciones);
    }
    
    if (notificacion.tipo === 'reparacion' || notificacion.tipo === 'reparacion_actualizada') {
      navigate('/estado-reparacion');
    } else if (notificacion.tipo === 'venta') {
      setSelectedNotification(notificacion);
      setLoadingDetalle(true);
      
      try {
        const token = localStorage.getItem('token');
        
        const endpoint = notificacion.dispositivo_id 
          ? `https://ecotec-backend.onrender.com/api/ventas/dispositivo-por-id/${notificacion.dispositivo_id}`
          : `https://ecotec-backend.onrender.com/api/ventas/dispositivo/${notificacion.usuario_solicitante || notificacion.id_usuario}`;
        
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setDispositivoDetalle(response.data);
      } catch (error) {
        console.error('Error al obtener detalles del dispositivo:', error);
        setDispositivoDetalle(null);
      } finally {
        setLoadingDetalle(false);
      }
    }
  };

  const closeModal = () => {
    setSelectedNotification(null);
    setDispositivoDetalle(null);
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
      <h2 className="notificaciones-titulo">Notificaciones de Administrador</h2>
      
      <div className="notificaciones-header">
        <div className="header-content">
          <Bell className="header-icon" />
          <div>
            <h2>Gestión de ventas y reparaciones</h2>
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
            <p>Cuando haya actividad en el sistema, aparecerá aquí</p>
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
                      {notificacion.tipo === 'venta' ? 'Nueva solicitud de venta' : 
                       notificacion.tipo === 'reparacion' ? 'Nueva reparación' :
                       notificacion.tipo === 'reparacion_actualizada' ? 'Actualización de reparación' :
                       'Notificación'}
                    </h4>
                    <span className="notification-time">
                      {formatFecha(notificacion.fecha)}
                    </span>
                  </div>
                  
                  <p className="notification-message">
                    {notificacion.mensaje}
                  </p>
                  
                  <div className="notification-footer">
                    <span className={`type-badge ${notificacion.tipo}`}>
                      {notificacion.tipo === 'venta' ? 'Venta' : 
                       notificacion.tipo === 'reparacion' ? 'Reparación' :
                       notificacion.tipo === 'reparacion_actualizada' ? 'Estado Actualizado' :
                       'Notificación'}
                    </span>
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

      {/* Modal de detalles */}
      {selectedNotification && (
        <div className="pieza-modal-fondo" onClick={closeModal}>
          <div className="pieza-modal-caja" onClick={e => e.stopPropagation()}>
            <div className="pieza-modal-encabezado">
              <div style={{display:'flex', flexDirection:'column', gap:'0.2em'}}>
                <h3 style={{margin:0, fontWeight:800, fontSize:'1.18em'}}>Detalles de la solicitud</h3>
              </div>
              <button className="pieza-modal-cerrar" title="Cerrar" onClick={closeModal}>
                <X />
              </button>
            </div>
            <div className="pieza-modal-cuerpo">
              {loadingDetalle ? (
                <div className="pieza-modal-cargando">
                  <div className="pieza-modal-spinner"></div>
                  <p>Cargando detalles...</p>
                </div>
              ) : dispositivoDetalle ? (
                <div className="pieza-dispositivo-detalles">
                  <div className="pieza-detalle-seccion">
                    <h4>Información del usuario</h4>
                    <p><strong>Email:</strong> {selectedNotification.email_solicitante || selectedNotification.email}</p>
                    <p><strong>Nombre:</strong> {selectedNotification.nombre_solicitante || selectedNotification.nombre}</p>
                  </div>
                  <div className="pieza-detalle-seccion">
                    <h4>Información del dispositivo</h4>
                    <div className="pieza-info-dispositivo-grid">
                      <div className="pieza-info-item">
                        <span className="pieza-label">Dispositivo:</span>
                        <span className="pieza-valor">{dispositivoDetalle.nombre_dispositivo}</span>
                      </div>
                      <div className="pieza-info-item">
                        <span className="pieza-label">Marca:</span>
                        <span className="pieza-valor">{dispositivoDetalle.marca}</span>
                      </div>
                      <div className="pieza-info-item">
                        <span className="pieza-label">Modelo:</span>
                        <span className="pieza-valor">{dispositivoDetalle.modelo}</span>
                      </div>
                      <div className="pieza-info-item">
                        <span className="pieza-label">Estado:</span>
                        <span className={`pieza-valor pieza-estado-${dispositivoDetalle.estado.toLowerCase().replace(' ', '-')}`}>
                          {dispositivoDetalle.estado}
                        </span>
                      </div>
                      <div className="pieza-info-item">
                        <span className="pieza-label">Contacto:</span>
                        <span className="pieza-valor">{dispositivoDetalle.contacto}</span>
                      </div>
                    </div>
                  </div>
                  {dispositivoDetalle.descripcion && (
                    <div className="pieza-detalle-seccion">
                      <h4>Descripción</h4>
                      <p className="pieza-descripcion-texto">{dispositivoDetalle.descripcion}</p>
                    </div>
                  )}
                  {dispositivoDetalle.imagen && (
                    <div className="pieza-detalle-seccion">
                      <h4>Imagen del dispositivo</h4>
                      <div className="pieza-imagen-contenedor">
                        <img 
                          src={`https://ecotec-backend.onrender.com/uploads/${dispositivoDetalle.imagen}`} 
                          alt="Dispositivo"
                          className="pieza-dispositivo-imagen"
                        />
                      </div>
                    </div>
                  )}
                  <div className="pieza-detalle-seccion">
                    <h4>Fecha de solicitud</h4>
                    <p>{new Date(dispositivoDetalle.fecha_publicacion).toLocaleString('es-ES')}</p>
                  </div>
                </div>
              ) : (
                <div className="pieza-modal-error">
                  <p>No se pudieron cargar los detalles del dispositivo</p>
                </div>
              )}
            </div>
            {dispositivoDetalle && (
              <div className="pieza-modal-acciones">
                <a 
                  href={`mailto:${selectedNotification.email}`}
                  className="pieza-btn-contactar"
                  title="Enviar correo al usuario"
                  style={{display:'flex',alignItems:'center',gap:'0.5em'}}
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></svg>
                  Contactar Usuario
                </a>
                <button className="pieza-btn-cerrar" onClick={closeModal} title="Cerrar modal">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificacionesAdmin;