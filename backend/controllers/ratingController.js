import { getProductRatingAverage, getProductReviews } from '../models/pedidoModel.js';

// Obtener el promedio de calificaciones y reseñas de un producto
export const getProductRatings = async (req, res) => {
  const { productId } = req.params;
  const { limit = 5, offset = 0 } = req.query;

  try {
    // Obtener promedio de calificaciones
    const ratingData = await getProductRatingAverage(productId);
    
    // Obtener reseñas con comentarios
    const reviews = await getProductReviews(productId, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      rating: {
        promedio: ratingData.promedio,
        total_calificaciones: ratingData.total_calificaciones,
        usuarios_calificaron: ratingData.usuarios_calificaron
      },
      reviews: reviews
    });

  } catch (error) {
    console.error('Error al obtener calificaciones del producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener calificaciones del producto'
    });
  }
};

// Obtener solo el promedio de calificaciones de un producto (más rápido)
export const getProductRatingOnly = async (req, res) => {
  const { productId } = req.params;

  try {
    const ratingData = await getProductRatingAverage(productId);
    
    res.json({
      success: true,
      promedio: ratingData.promedio,
      total_calificaciones: ratingData.total_calificaciones,
      usuarios_calificaron: ratingData.usuarios_calificaron
    });

  } catch (error) {
    console.error('Error al obtener promedio del producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener promedio del producto'
    });
  }
};