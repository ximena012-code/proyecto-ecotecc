import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { obtenerFavoritos, eliminarFavorito } from "../api/favoritosApi";
import { useCart } from "../context/CartContext"; 
import "../style/Favoritos.css"; // CSS completo con tarjetas y fondo blanco



export default function Favoritos() {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const { addItem } = useCart();

  // 📌 Mostrar mensajes flotantes
  const mostrarMensaje = (msg) => {
    setMensaje(msg);
    setTimeout(() => setMensaje(""), 3000);
  };

  // 📌 Cargar favoritos
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setErr("⚠️ Debes iniciar sesión para ver tus favoritos");
      setLoading(false);
      return;
    }

    obtenerFavoritos()
      .then((res) => setFavoritos(res.data))
      .catch(() => setErr("❌ Error al cargar favoritos"))
      .finally(() => setLoading(false));
  }, []);

  // 📌 Quitar de favoritos
  const quitarFavorito = async (idProducto) => {
    try {
      await eliminarFavorito(idProducto);
      setFavoritos(favoritos.filter((f) => f.id_producto !== idProducto));
      mostrarMensaje("❌ Producto eliminado de favoritos");
    } catch {
      mostrarMensaje("⚠️ No se pudo eliminar de favoritos");
    }
  };

  // 📌 Agregar al carrito
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
      console.error("❌ Error al agregar al carrito:", err);
      mostrarMensaje("⚠️ No se pudo agregar al carrito");
    }
  };

  // 📌 Estados de carga y error
  if (loading) {
    return (
      <div className="fav-container">
        <h2>Mis Favoritos</h2>
        <p>Cargando favoritos...</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="fav-container">
        <h2 className="dashboard3-title">Mis Favoritos</h2>
        <p className="error">{err}</p>
      </div>
    );
  }

  if (favoritos.length === 0) {
    return (
      <div className="fav-container">
        <h2 className="dashboard3-title">Mis Favoritos</h2>
        <p>No tienes productos en favoritos todavía.</p>
      </div>
    );
  }

  return (
      <div className="fav-container"> {/* Clase personalizada para fondo blanco */}
        <h2 className= 'dashboard3-title'>Mis Favoritos</h2>

        {/* 👇 Mensaje temporal */}
        {mensaje && <div className="mensaje-flotante">{mensaje}</div>}

        {/* 📌 Grid usando las mismas clases de tarjetas que Categoría */}
        <div className="products-grid">
          {favoritos.map((p) => (
            <div key={p.id_producto} className="featured-card">
              <div className="card-header">
                <span
                  className="favorite-icon"
                  onClick={() => quitarFavorito(p.id_producto)}
                  style={{ cursor: "pointer" }}
                >
                  ★
                </span>
              </div>

              <Link
                to={`/producto/${p.id_producto}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <img
                  src={
                    p.foto
                      ? `${
                          import.meta.env.VITE_API_URL || "https://ecotec-backend.onrender.com"
                        }/uploads/${p.foto}`
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
                className="btn"
                onClick={() => handleAgregarCarrito(p.id_producto)}
              >
                Agregar
              </button>
            </div>
          ))}
        </div>
      </div>
    
    );
}