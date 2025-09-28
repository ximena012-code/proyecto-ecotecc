import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'https://ecotec-backend.onrender.com/api/productos';

export const obtenerProductosPorSlug = async (slug) => {
  const { data } = await axios.get(`${API}/categoria/slug/${slug}`);
  return data;
};
