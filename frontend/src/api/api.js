// frontend/src/config/api.js

import axios from "axios";

// URL del backend asignada directamente en el código.
const API_BASE_URL = "https://ecotec-backend.onrender.com/api";

export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export default API_BASE_URL;

export const obtenerProductosMasVistos = async () => {
  const url = `${API_BASE_URL}/productos/mas-vistos-mes`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error al obtener productos más vistos:", error);
    console.error(`Petición fallida a la URL: ${url}`);
    return [];
  }
};
