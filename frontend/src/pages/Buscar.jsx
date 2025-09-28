import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";
import { useCart } from "../context/CartContext";
import { obtenerFavoritos, agregarFavorito, eliminarFavorito } from "../api/favoritosApi";

const Buscar = () => {
  const { search } = useLocation();
  const query = new URLSearchParams(search).get("query");
  const [resultados, setResultados] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const navigate = useNavigate();
  const { addItem } = useCart();

  useEffect(() => {
    if (query) {
      axios.get(`http://localhost:5000/api/productos/buscar?query=${query}`)
        .then(res => setResultados(res.data))
        .catch(() => setResultados([]));
    }
  }, [query]);

  // Cargar favoritos si hay token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    obtenerFavoritos()
      .then((res) => setFavoritos(res.data.map((f) => f.id_producto)))
      .catch(() => setFavoritos([]));
  }, []);

  // Mensaje flotante
  const mostrarMensaje = (msg) => {
    const id = Date.now();
    setMensajes((prev) => [...prev, { id, text: msg }]);
    setTimeout(() => {
      setMensajes((prev) => prev.filter((m) => m.id !== id));
    }, 1500);
  };

  // Agregar al carrito
  const handleAgregarCarrito = async (productoId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      mostrarMensaje("⚠️ Necesitas iniciar sesión para agregar al carrito");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }
    try {
      await addItem(productoId, 1);
      mostrarMensaje("✅ Producto agregado al carrito");
    } catch (err) {
      mostrarMensaje("⚠️ No se pudo agregar al carrito");
    }
  };

  // Favoritos
  const toggleFavorito = async (productoId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      mostrarMensaje("⚠️ Necesitas iniciar sesión antes de guardar un producto en favoritos.");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }
    try {
      if (favoritos.includes(productoId)) {
        await eliminarFavorito(productoId);
        setFavoritos(favoritos.filter((id) => id !== productoId));
        mostrarMensaje("❌ Producto eliminado de favoritos");
      } else {
        await agregarFavorito(productoId);
        setFavoritos([...favoritos, productoId]);
        mostrarMensaje("✅ Producto agregado a favoritos");
      }
    } catch (error) {
      mostrarMensaje("⚠️ Ocurrió un error al actualizar favoritos");
    }
  };

  return (
    <>
      {/* Mensajes flotantes fuera de cat-wrap para stacking context global */}
      <div className="mensajes-container">
        {mensajes.map((m) => (
          <div key={m.id} className="mensaje-flotante">
            {m.text}
          </div>
        ))}
      </div>
      <div className="cat-wrap">
        <h2>Resultados para: "{query}"</h2>
        <div className="products-grid">
          {resultados.length === 0 ? (
            <p>No se encontraron productos.</p>
          ) : (
            resultados.map((p) => (
              <div key={p.id_producto} className={`featured-card ${p.cantidad <= 0 ? 'card-out-of-stock' : ''}`}>
              {/* Badge de estado agotado */}
              {p.cantidad <= 0 && (
                <div className="out-of-stock-badge">
                  AGOTADO
                </div>
              )}
              
              <div className="card-header">
                <span
                  className="favorite-icon"
                  onClick={() => toggleFavorito(p.id_producto)}
                  style={{ cursor: "pointer" }}
                >
                  {favoritos.includes(p.id_producto) ? "★" : "☆"}
                </span>
              </div>
              <Link
                to={`/producto/${p.id_producto}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <img
                  src={
                    p.foto
                      ? `http://localhost:5000/uploads/${p.foto}`
                      : "/placeholder.png"
                  }
                  alt={p.nombre}
                  className="card-img-top"
                />
                <div className="card-body">
                  <p className="card-text">{p.nombre}</p>
                  <h5 className="price">
                    ${Number(p.precio).toLocaleString("es-CO")}
                  </h5>
                </div>
              </Link>
              <button
                className={`btn ${p.cantidad <= 0 ? 'disabled' : ''}`}
                onClick={() => p.cantidad > 0 && handleAgregarCarrito(p.id_producto)}
                disabled={p.cantidad <= 0}
              >
                {p.cantidad <= 0 ? 'Agotado' : 'Agregar'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
    </>
  );
};

export default Buscar;