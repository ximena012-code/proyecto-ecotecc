import React, { useEffect, useState } from "react";
import axios from "axios";
import Estrellas from "../components/Estrellas";
import ExpandableText from '../components/TextoExpandible';
import "../style/DetallePedido.css";
import { Link } from "react-router-dom";

const API_BASE_URL = "https://ecotec-backend.onrender.com";

const Stars = ({ rating }) => {
  const totalStars = 5;
  return (
    <span className="stars">
      {[...Array(totalStars)].map((_, index) => (
        <span
          key={index}
          className={index < rating ? "star filled" : "star"}
        >
          ★
        </span>
      ))}
    </span>
  );
};

// Agrupa productos por pedido
const groupByPedido = (productos) => {
  const pedidos = {};
  productos.forEach((producto) => {
    if (!pedidos[producto.id_pedido]) {
      pedidos[producto.id_pedido] = {
        fecha_pedido: producto.fecha_pedido,
        calificacion: producto.calificacion,
        productos: [],
      };
    }
    pedidos[producto.id_pedido].productos.push(producto);
  });
  return pedidos;
};

const DetallePedido = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/pedidos/detalle`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setProductos(res.data.detalle || []);
        setLoading(false);
      } catch (err) {
        setError("No se pudo cargar el detalle de los pedidos");
        setLoading(false);
      }
    };
    fetchProductos();
  }, []);

  if (loading) {
    return (
      <div className="historial-container">
        <div className="historial-card">
          <p>Cargando detalle de pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="historial-container">
        <div className="historial-card">
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  const pedidosAgrupados = groupByPedido(productos);
  // Ordenar los IDs de pedidos por fecha de forma descendente
  const pedidoIds = Object.keys(pedidosAgrupados).sort((a, b) => {
    const fechaA = new Date(pedidosAgrupados[a].fecha_pedido);
    const fechaB = new Date(pedidosAgrupados[b].fecha_pedido);
    return fechaB - fechaA; // Orden descendente (más nuevo primero)
  });

  return (
     <div className="detalle-wrapper">
      <div className="historial-container">
        <div className="historial-card">
          <h2 className="historial-title">Detalle de pedidos</h2>
          <div className="table-container">
            <table className="facturas-table">
              <thead>
                <tr className="table-header">
                  <th>N° Pedido</th>
                  <th>Producto</th>
                  <th>Descripción</th>
                  <th>Fecha</th>
                  <th>Calificación</th>
                </tr>
              </thead>
              {pedidoIds.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={5}>No tienes productos en tus pedidos aún.</td>
                  </tr>
                </tbody>
              ) : (
                pedidoIds.map((id_pedido) => {
                  const pedido = pedidosAgrupados[id_pedido];
                  return (
                    <tbody key={id_pedido} className="pedido-group">
                      {pedido.productos.map((producto, idx) => (
                        <tr key={producto.id_detalle} className="table-row">
                          {idx === 0 && (
                            <>
                              <td 
                                className="pedido-id" 
                                rowSpan={pedido.productos.length}
                              >
                                ET-{id_pedido}
                              </td>
                            </>
                          )}
                          <td>{producto.nombre_producto}</td>
                          <td>
                            <ExpandableText text={producto.descripcion} maxLines={2} />
                          </td>
                          {idx === 0 && (
                            <td rowSpan={pedido.productos.length}>
                              {new Date(producto.fecha_pedido).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric"
                              })}
                            </td>
                          )}
                          {idx === 0 && (
                            <td 
                              className="calificacion-cell" 
                              rowSpan={pedido.productos.length}
                            >
                              {producto.calificacion 
                                ? <Stars rating={producto.calificacion} /> 
                                : "Sin calificar"}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  );
                })
              )}
            </table>
          </div>
          
        </div>
       
      </div>
      
    

     {/* 🔹 Botón para volver */}
    <div className="back-to-dashboard1">
<Link to="/dashboard">← Volver a mi cuenta</Link>
    </div>
  </div>
  );
};

export default DetallePedido;
