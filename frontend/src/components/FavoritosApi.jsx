import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://ecotec-backend.onrender.com";

export const obtenerFavoritos = () => {
  return axios.get(`${API_URL}/api/favoritos`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
};

export const agregarFavorito = (idProducto) => {
  return axios.post(`${API_URL}/api/favoritos`, 
    { id_producto: idProducto },
    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
  );
};

export const eliminarFavorito = (idProducto) => {
  return axios.delete(`${API_URL}/api/favoritos/${idProducto}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
};
