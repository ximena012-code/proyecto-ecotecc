import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ Agregar a favoritos (solo se pasa productoId en la URL)
export const agregarFavorito = (productoId) =>
  axios.post(`${API_URL}/favoritos/${productoId}`, {}, { headers: authHeader() });

// ✅ Obtener favoritos del usuario logueado (sin pasar usuarioId)
export const obtenerFavoritos = () =>
  axios.get(`${API_URL}/favoritos`, { headers: authHeader() });

// ✅ Eliminar favorito (solo se pasa productoId en la URL)
export const eliminarFavorito = (productoId) =>
  axios.delete(`${API_URL}/favoritos/${productoId}`, { headers: authHeader() });
