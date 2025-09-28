import axios from "axios";

const API_URL = "http://localhost:5000/api/pedidos";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const createOrder = async (direccionData) => {
  const res = await axios.post(`${API_URL}/crear`, direccionData, getAuthHeader());
  return res.data;
};
