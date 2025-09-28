import axios from "axios";

const API_URL = "http://localhost:5000/api/carrito";

// Helper para obtener el token del localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Obtener carrito completo
export const getCart = async () => {
  const res = await axios.get(API_URL, getAuthHeader());
  return res.data;
};

// Resumen del carrito (totales)
export const getCartSummary = async () => {
  const res = await axios.get(`${API_URL}/summary`, getAuthHeader());
  return res.data;
};

// Agregar producto
export const addToCart = async (id_producto, cantidad = 1) => {
  const res = await axios.post(
    `${API_URL}/add`,
    { id_producto, cantidad },
    getAuthHeader()
  );
  return res.data;
};

// Actualizar cantidad
export const updateCartItem = async (id_carrito, cantidad) => {
  const res = await axios.put(
    `${API_URL}/update/${id_carrito}`,
    { cantidad },
    getAuthHeader()
  );
  return res.data;
};

// Eliminar producto
export const removeFromCart = async (id_carrito) => {
  const res = await axios.delete(
    `${API_URL}/remove/${id_carrito}`,
    getAuthHeader()
  );
  return res.data;
};

// Vaciar carrito
export const clearCart = async () => {
  const res = await axios.delete(`${API_URL}/clear`, getAuthHeader());
  return res.data;
};
