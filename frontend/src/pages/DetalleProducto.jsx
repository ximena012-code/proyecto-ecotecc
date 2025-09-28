import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; 
import EstrellaRating from '../components/EstrellaRating';
import ProductReviews from '../components/ProductReviews';
import { agregarFavorito, eliminarFavorito, obtenerFavoritos } from '../api/favoritosApi';
import axios from 'axios';
import '../style/DetalleProducto.css';

const DetalleProducto = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [rating, setRating] = useState(null);
  const [loadingRating, setLoadingRating] = useState(true);
  const [favorito, setFavorito] = useState(false);
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();


  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const res = await axios.get(`https://ecotec-backend.onrender.com/api/productos/id/${id}`);
        setProducto(res.data);
        await axios.post(`https://ecotec-backend.onrender.com/api/productos/${id}/vista`);
      } catch (error) {
        console.error('Error al obtener producto o registrar vista:', error);
      }
    };

    const fetchRating = async () => {
      try {
        const res = await axios.get(`https://ecotec-backend.onrender.com/api/ratings/producto/${id}/promedio`);
        if (res.data.success) setRating(res.data);
      } catch (error) {
        console.error('Error al obtener calificaciones:', error);
      } finally {
        setLoadingRating(false);
      }
    };

    const checkFavorito = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await obtenerFavoritos();
        const existe = res.data.some(fav => fav.id_producto === parseInt(id));
        setFavorito(existe);
      } catch (error) {
        console.error("Error al verificar favoritos:", error);
      }
    };

    fetchProducto();
    fetchRating();
    checkFavorito();
  }, [id]);

  const handleAgregarCarrito = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMensaje("⚠️ Necesitas iniciar sesión para agregar al carrito");
      setTimeout(() => { setMensaje(""); navigate("/login"); }, 1500);
      return;
    }

     if (user?.rol === "admin") {
      setMensaje("⚠️ El administrador no puede agregar productos al carrito");
      setTimeout(() => setMensaje(""), 2000);
      return;
    }

    if (producto.cantidad <= 0) {
      setMensaje("⚠️ Producto sin stock disponible");
      setTimeout(() => setMensaje(""), 2000);
      return;
    }

    try {
      await addItem(producto.id_producto, 1);
      setMensaje("✅ Producto agregado al carrito");
      setTimeout(() => setMensaje(""), 2000);
    } catch {
      setMensaje("⚠️ No se pudo agregar al carrito");
      setTimeout(() => setMensaje(""), 2000);
    }
  };

  const handleToggleFavorito = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMensaje("⚠️ Necesitas iniciar sesión para usar favoritos");
      setTimeout(() => { setMensaje(""); navigate("/login"); }, 1500);
      return;
    }

    if (user?.rol === "admin") {
      setMensaje("⚠️ El administrador no puede usar favoritos");
      setTimeout(() => setMensaje(""), 2000);
      return;
    }

    try {
      if (favorito) {
        await eliminarFavorito(producto.id_producto);
        setFavorito(false);
        setMensaje("❌ Producto eliminado de favoritos");
      } else {
        await agregarFavorito(producto.id_producto);
        setFavorito(true);
        setMensaje("⭐ Producto agregado a favoritos");
      }
      setTimeout(() => setMensaje(""), 2000);
    } catch {
      setMensaje("⚠️ No se pudo actualizar favoritos");
      setTimeout(() => setMensaje(""), 2000);
    }
  };

  if (!producto) return <p>Cargando...</p>;

  return (
    <div className="detalle-container">
      {mensaje && <div className="mensaje-flotante">{mensaje}</div>}

      {/* Columna izquierda */}
      <div className="detalle-columna-izquierda">
        <div className="detalle-imagen-container">
          <img src={`https://ecotec-backend.onrender.com/uploads/${producto.foto}`} alt={producto.nombre} />
        </div>
        <div className="detalle-reviews-below-image">
          <ProductReviews productId={id} className="detalle-reviews" />
        </div>
      </div>

      {/* Información */}
      <div
        className={`detalle-info ${
          producto.cantidad <= 0
            ? 'agotado'
            : (producto.categoria && producto.categoria.trim().toLowerCase() === 'promociones')
            ? 'promocion'
            : producto.tipo_producto === 'reacondicionado'
            ? 'reacondicionado'
            : 'nuevo'
        }`}
      >
        <h2>{producto.nombre}</h2>

        {/* Precio */}
        <div>
          {producto.precioAnterior && (
            <span className="precio-anterior">
              ${Number(producto.precioAnterior).toLocaleString('es-CO')}
            </span>
          )}
          <span className="precio">${Number(producto.precio).toLocaleString('es-CO')}</span>
          {producto.descuento && <span className="descuento">-{producto.descuento}%</span>}
        </div>

        {/* Botones */}
        <div className="detalle-botones">
          <button
            className={`btn-agregar ${producto.cantidad <= 0 ? 'disabled' : ''}`}
            onClick={producto.cantidad > 0 ? handleAgregarCarrito : undefined}
            disabled={producto.cantidad <= 0}
          >
            {producto.cantidad <= 0 ? 'Producto Agotado' : 'Añadir al carrito'}
          </button>
          <button className="btn-favorito" onClick={handleToggleFavorito}>
            {favorito ? "★ En favoritos" : "☆ Favorito"}
          </button>
        </div>

          {/* Especificaciones */}
          <div className="detalle-especificaciones">
            <h4>Especificaciones</h4>
            <p>{producto.descripcion || "Sin especificaciones adicionales"}</p>
          </div>

          {/* Calificación */}
          <div className="detalle-calificacion">
            {loadingRating ? (
              <div
                className="rating-loading"
                style={{ textAlign: 'center', color: '#666' }}
              >
                <span>Cargando calificaciones...</span>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <EstrellaRating
                  rating={rating?.promedio || 0}
                  totalReviews={rating?.total_calificaciones || 0}
                  size={24}
                  className="destacado"
                />
                {rating?.total_calificaciones > 0 && (
                  <p className="calificacion-texto">
                    {rating.promedio}/5.0 basado en {rating.total_calificaciones}{' '}
                    {rating.total_calificaciones === 1 ? 'reseña' : 'reseñas'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Extras */}
          <div className="detalle-extras">
            <div className="detalle-extra-item">
              <i className="bi bi-truck"></i>
              <h5>Envío Gratis</h5>
              <p>A partir de $100.000</p>
            </div>
            <div className="detalle-extra-item">
              <i className="bi bi-shield-check"></i>
              <h5>Garantía</h5>
              <p>12 meses de cobertura</p>
            </div>
          </div>

          {/* Volver */}
          <a className="volver" href="/">Devolver</a>
        </div>
      </div>
    
  );
};

export default DetalleProducto;
