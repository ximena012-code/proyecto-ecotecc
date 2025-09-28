import React, { useState, useEffect } from 'react';
import { Star, X, CheckCircle } from 'lucide-react';
import axios from 'axios';
import '../style/CalificacionProductos.css';

const CalificacionProductos = ({ pedidoId, onClose, onSuccess }) => {
  const [productos, setProductos] = useState([]);
  const [calificaciones, setCalificaciones] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [yaCalificado, setYaCalificado] = useState(false);

  useEffect(() => {
    fetchProductosPedido();
  }, [pedidoId]);

  const fetchProductosPedido = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Cargar detalles del pedido
      const response = await axios.get(`https://ecotec-backend.onrender.com/api/pedidos/${pedidoId}/detalle`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setProductos(response.data.detalle);
        
        // Verificar si ya existen calificaciones de productos para este pedido
        try {
          const ratingsResponse = await axios.get(`https://ecotec-backend.onrender.com/api/pedidos/${pedidoId}/calificaciones-productos`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (ratingsResponse.data.success && ratingsResponse.data.ratings.length > 0) {
            setYaCalificado(true);
            
            // Cargar calificaciones existentes
            const calificacionesExistentes = {};
            ratingsResponse.data.ratings.forEach(rating => {
              calificacionesExistentes[rating.producto_id] = {
                puntuacion: rating.puntuacion,
                comentario: rating.comentario || ''
              };
            });
            setCalificaciones(calificacionesExistentes);
          } else {
            // Inicializar calificaciones vacías
            const calificacionesIniciales = {};
            response.data.detalle.forEach(producto => {
              calificacionesIniciales[producto.producto_id] = {
                puntuacion: 0,
                comentario: ''
              };
            });
            setCalificaciones(calificacionesIniciales);
          }
        } catch (ratingsError) {
          // Si no hay calificaciones previas, inicializar vacías
          const calificacionesIniciales = {};
          response.data.detalle.forEach(producto => {
            calificacionesIniciales[producto.producto_id] = {
              puntuacion: 0,
              comentario: ''
            };
          });
          setCalificaciones(calificacionesIniciales);
        }
      }
    } catch (error) {
      console.error('Error al obtener productos del pedido:', error);
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleCalificacionChange = (productoId, puntuacion) => {
    setCalificaciones(prev => ({
      ...prev,
      [productoId]: {
        ...prev[productoId],
        puntuacion
      }
    }));
  };

  const handleComentarioChange = (productoId, comentario) => {
    setCalificaciones(prev => ({
      ...prev,
      [productoId]: {
        ...prev[productoId],
        comentario
      }
    }));
  };

  const enviarCalificaciones = async () => {
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Filtrar calificaciones válidas (con puntuación > 0)
      const calificacionesValidas = Object.entries(calificaciones)
        .filter(([_, cal]) => cal.puntuacion > 0)
        .map(([productoId, cal]) => ({
          productId: parseInt(productoId),
          rating: cal.puntuacion,
          comentario: cal.comentario.trim() || ''
        }));
      
      if (calificacionesValidas.length === 0) {
        setError('Por favor, califica al menos un producto');
        setSubmitting(false);
        return;
      }

      // Enviar calificaciones de productos usando la nueva API
      await axios.post('https://ecotec-backend.onrender.com/api/pedidos/calificar-productos', {
        id_pedido: pedidoId,
        product_ratings: calificacionesValidas
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Error al enviar calificaciones:', error);
      
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Ya has calificado')) {
        setError('Ya has calificado los productos de este pedido');
        setYaCalificado(true);
      } else {
        setError(error.response?.data?.message || 'Error al enviar las calificaciones');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderEstrellas = (productoId, puntuacionActual) => {
    return (
      <div className="estrellas-container">
        {[1, 2, 3, 4, 5].map((estrella) => (
          <span
            key={estrella}
            className={`estrella-calificar ${estrella <= puntuacionActual ? 'filled' : ''}`}
            onClick={() => handleCalificacionChange(productoId, estrella)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="calificacion-modal">
        <div className="calificacion-overlay" onClick={onClose}></div>
        <div className="calificacion-content">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando productos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (yaCalificado) {
    return (
      <div className="calificacion-modal">
        <div className="calificacion-overlay" onClick={onClose}></div>
        <div className="calificacion-content">
          <div className="ya-calificado-container">
            <CheckCircle className="success-icon" size={48} />
            <h3>Ya calificaste este pedido</h3>
            <p>Solo puedes calificar cada pedido una vez</p>
            <button className="btn-cerrar" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="calificacion-modal">
        <div className="calificacion-overlay" onClick={onClose}></div>
        <div className="calificacion-content">
          <div className="success-container">
            <CheckCircle className="success-icon" size={48} />
            <h3>¡Calificación enviada!</h3>
            <p>Gracias por tu opinión</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="calificacion-modal">
      <div className="calificacion-overlay" onClick={onClose}></div>
      <div className="calificacion-content">
        <div className="calificacion-header">
          <h2>Calificar Productos</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="productos-calificacion">
          {productos.map((producto) => (
            <div key={producto.producto_id} className="producto-calificacion-item">
              <div className="producto-info">
                <img 
                  src={`https://ecotec-backend.onrender.com/uploads/${producto.foto}`} 
                  alt={producto.nombre}
                  className="producto-imagen"
                />
                <div className="producto-detalles">
                  <h4>{producto.nombre}</h4>
                  <p>Cantidad: {producto.cantidad}</p>
                  <p>Precio: ${Number(producto.precio_unitario).toLocaleString('es-CO')}</p>
                </div>
              </div>
              
              <div className="calificacion-controls">
                <div className="estrellas-section">
                  <label>Tu calificación:</label>
                  {renderEstrellas(producto.producto_id, calificaciones[producto.producto_id]?.puntuacion || 0)}
                  <span className="puntuacion-texto">
                    {calificaciones[producto.producto_id]?.puntuacion > 0 
                      ? `${calificaciones[producto.producto_id].puntuacion} de 5 estrellas`
                      : 'Sin calificar'
                    }
                  </span>
                </div>
                
                <div className="comentario-section">
                  <label>Comentario (opcional):</label>
                  <textarea
                    value={calificaciones[producto.producto_id]?.comentario || ''}
                    onChange={(e) => handleComentarioChange(producto.producto_id, e.target.value)}
                    placeholder="Cuéntanos tu experiencia con este producto..."
                    rows="3"
                    maxLength="255"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="calificacion-footer">
          <button className="btn-cancelar" onClick={onClose} disabled={submitting}>
            Cancelar
          </button>
          <button 
            className="btn-enviar" 
            onClick={enviarCalificaciones}
            disabled={submitting || Object.values(calificaciones).every(cal => cal.puntuacion === 0)}
          >
            {submitting ? 'Enviando...' : 'Enviar Calificaciones'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalificacionProductos;