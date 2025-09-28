import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const obtenerProductosMasVistos = async () => {
  try {
    const response = await axios.get(`${API_URL}/productos/mas-vistos-mes`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener productos más vistos:', error);
    return [];
  }
};