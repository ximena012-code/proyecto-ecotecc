import React from 'react';
import { Star } from 'lucide-react';
import '../style/EstrellaRating.css';

const EstrellaRating = ({ 
  rating, 
  totalReviews = 0, 
  size = 20, 
  showText = true, 
  className = "" 
}) => {
  const numericRating = parseFloat(rating) || 0;
  const fullStars = Math.floor(numericRating);
  const hasHalfStar = numericRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  if (numericRating === 0) {
    return (
      <div className={`estrella-rating ${className}`}>
        <div className="estrellas-container">
          {[...Array(5)].map((_, index) => (
            <Star 
              key={index} 
              size={size} 
              className="estrella-vacia"
            />
          ))}
        </div>
        {showText && (
          <span className="rating-text">
            Sin calificaciones
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`estrella-rating ${className}`}>
      <div className="estrellas-container">
        {/* Estrellas llenas */}
        {[...Array(fullStars)].map((_, index) => (
          <Star 
            key={`full-${index}`} 
            size={size} 
            className="estrella-llena"
          />
        ))}
        
        {/* Media estrella */}
        {hasHalfStar && (
          <div className="estrella-media-container">
            <Star size={size} className="estrella-vacia" />
            <Star size={size} className="estrella-media" />
          </div>
        )}
        
        {/* Estrellas vacías */}
        {[...Array(emptyStars)].map((_, index) => (
          <Star 
            key={`empty-${index}`} 
            size={size} 
            className="estrella-vacia"
          />
        ))}
      </div>
      
      {showText && (
        <span className="rating-text">
          <span className="rating-number">{numericRating.toFixed(1)}</span>
          {totalReviews > 0 && (
            <span className="total-reviews">
              ({totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'})
            </span>
          )}
        </span>
      )}
    </div>
  );
};

export default EstrellaRating;