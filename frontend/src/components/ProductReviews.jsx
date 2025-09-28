import React, { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';
import EstrellaRating from './EstrellaRating';
import axios from 'axios';
import '../style/ProductReviews.css';

// Componente Stars con el mismo estilo que DetallePedido
const Stars = ({ rating }) => {
  const totalStars = 5;
  return (
    <span className="stars">
      {[...Array(totalStars)].map((_, index) => (
        <span
          key={index}
          className={index < rating ? "star filled" : "star"}
        >
          ★
        </span>
      ))}
    </span>
  );
};

const ProductReviews = ({ productId, className = "" }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/ratings/producto/${productId}?limit=5`);
      
      if (response.data.success) {
        setRating(response.data.rating);
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error('Error al obtener reseñas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`product-reviews ${className}`}>
        <div className="reviews-loading">
          <p>Cargando reseñas...</p>
        </div>
      </div>
    );
  }

  if (!rating || rating.total_calificaciones === 0) {
    return (
      <div className={`product-reviews ${className}`}>
        <div className="no-reviews">
          <Star size={32} className="no-reviews-icon" />
          <h3>Sin reseñas aún</h3>
          <p>Sé el primero en calificar este producto</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`product-reviews ${className}`}>
      <div className="reviews-header">
        <h3>Reseñas de clientes</h3>
        <EstrellaRating 
          rating={rating.promedio}
          totalReviews={rating.total_calificaciones}
          size={20}
          className="large"
        />
      </div>

      {reviews.length > 0 && (
        <div className="reviews-list">
          {reviews.slice(0, showAll ? reviews.length : 2).map((review, index) => (
            <div key={index} className="review-item">
              <div className="review-header">
                <div className="reviewer-info">
                  <User size={16} className="reviewer-icon" />
                  <span className="reviewer-name">
                    {review.nombre} {review.apellido?.charAt(0)}.
                  </span>
                </div>
                <div className="review-rating">
                  <Stars rating={review.puntuacion} />
                  <span className="review-date">
                    {formatDate(review.fecha_calificacion)}
                  </span>
                </div>
              </div>
              
              {review.comentario && (
                <div className="review-comment">
                  <p>"{review.comentario}"</p>
                </div>
              )}
            </div>
          ))}

          {reviews.length > 2 && (
            <button 
              className="show-more-btn"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Ver menos reseñas' : `Ver más reseñas (${reviews.length - 2} restantes)`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;