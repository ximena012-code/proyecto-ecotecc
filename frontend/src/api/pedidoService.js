import axios from "axios";

const API_URL = "https://ecotec-backend.onrender.com/api/pedidos";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const createOrder = async (direccionData) => {
  const res = await axios.post(`${API_URL}/crear`, direccionData, getAuthHeader());
  return res.data;
};
