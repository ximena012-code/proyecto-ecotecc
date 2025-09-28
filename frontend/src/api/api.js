
// frontend/src/config/api.js
import axios from "axios";

// URL base de la API, usa variable de entorno en producción o localhost en desarrollo
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? "https://ecotec-backend.onrender.com/api"
    : "http://localhost:5000/api");

// Clave de Stripe (si aplica)
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Exporta la URL para reutilizar en otras partes de la app
export default API_BASE_URL;

// Función para obtener los productos más vistos del mes
export const obtenerProductosMasVistos = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/productos/mas-vistos-mes`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener productos más vistos:", error);
    return [];
  }
};
