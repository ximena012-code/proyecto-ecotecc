// src/components/StarRating.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../style/Estrellas.css";

const Estrellas = ({ idPedido }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [visible, setVisible] = useState(true);

  const handleSubmit = async (value) => {
    try {
      await axios.post(
        "http://localhost:5000/api/pedidos/calificar",
        { id_pedido: idPedido, puntuacion: value },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setSubmitted(true);
      
      // Desaparecer el componente después de 3 segundos
      setTimeout(() => {
        setVisible(false);
      }, 2000);
    } catch (error) {
      console.error("Error guardando calificación:", error);
    }
  };

  // Si el componente no es visible, no renderizar nada
  if (!visible) {
    return null;
  }

  return (
    <div className="rating-container">
      <p className="rating-title">Califica nuestro servicio</p>
      <div className="stars">
        {[...Array(5)].map((_, index) => {
          const value = index + 1;
          return (
            <span
              key={value}
              className={`star ${value <= (hover || rating) ? "filled" : ""}`}
              onClick={() => {
                setRating(value);
                handleSubmit(value);
              }}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(null)}
            >
              ★
            </span>
          );
        })}
      </div>
      {submitted && <p className="thanks-message">¡Gracias por tu calificación!</p>}
    </div>
  );
};

export default Estrellas;