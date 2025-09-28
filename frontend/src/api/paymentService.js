import axios from "axios";

const API_URL = "http://localhost:5000/api/payments";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const createPaymentIntent = async (pedidoId) => {
  const res = await axios.post(
    `${API_URL}/create-payment-intent`,
    { pedidoId },
    getAuthHeader()
  );
  return res.data;
};