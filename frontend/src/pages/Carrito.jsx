import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "../style/Carrito.css";

const Carrito = () => {
  const { cart, updateItem, removeItem, clear, total, loading } = useCart();
  const { user } = useAuth();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [errorMsg, setErrorMsg] = useState(""); 
  const navigate = useNavigate();

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowConfirmDialog(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      removeItem(itemToDelete.id_carrito);
    }
    setShowConfirmDialog(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false);
    setItemToDelete(null);
  };

  const handleUpdate = async (id_carrito, cantidad) => {
    try {
      await updateItem(id_carrito, cantidad);
      setErrorMsg("");
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Error al actualizar cantidad");
    }
  };

  if (loading) return <p>Cargando carrito...</p>;

  return (
    <div className="carritoX-container">
      <h2 className="carritoX-titulo">Carrito de compras</h2>

      {!user ? (
        <div className="carritoX-warning">
          <p>⚠️ Debes iniciar sesión para acceder a tu carrito de compras</p>
        </div>
      ) : cart.length === 0 ? (
        <p>Tu carrito está vacío</p>
      ) : (
        <div className="carritoX-contenido">
          {/* 🛍️ Productos */}
          <div className="carritoX-items">
            <h3 className="carritoX-subtitulo">Productos</h3>
            {cart.map((item) => (
              <div key={item.id_carrito} className="carritoX-item">
                {/* Izquierda */}
                <div className="carritoX-izquierda">
                  <img
                    src={item.foto}
                    alt={item.nombre}
                    className="carritoX-item-img"
                  />
                  <div className="carritoX-item-info">
                    <h4>{item.nombre}</h4>
                    <span>${Number(item.precio).toLocaleString("es-CO")}</span>
                  </div>
                </div>

                {/* Derecha */}
                <div className="carritoX-derecha">
                  <div className="carritoX-cantidad">
                    <button
                      onClick={() => handleUpdate(item.id_carrito, item.cantidad - 1)}
                      disabled={item.cantidad <= 1}
                    >
                      –
                    </button>
                    <span>{item.cantidad}</span>
                    <button
                      onClick={() => handleUpdate(item.id_carrito, item.cantidad + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="carritoX-btn-eliminar"
                    onClick={() => handleDeleteClick(item)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            {errorMsg && <p className="carritoX-error">{errorMsg}</p>}
          </div>

          {/* 📊 Resumen */}
          <div className="carritoX-resumen">
            <h3>Resumen de compra</h3>
            <table className="carritoX-resumen-tabla">
              <thead>
                <tr>
                  <th>Cantidad</th>
                  <th>Producto</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id_carrito}>
                    <td>{item.cantidad}</td>
                    <td>{item.nombre}</td>
                    <td>${(item.precio * item.cantidad).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="carritoX-total">
              <h3>Subtotal:</h3>
              <span>${total.toLocaleString()}</span>
            </div>

            <button
              className="carritoX-btn-comprar"
              onClick={() => navigate("/pedido")}
            >
              Continuar compra
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showConfirmDialog && (
        <div className="carritoX-modal-overlay">
          <div className="carritoX-modal-content">
            <h3>Confirmar eliminación</h3>
            <p>
              ¿Estás seguro de que deseas eliminar{" "}
              <strong>{itemToDelete?.nombre}</strong> del carrito?
            </p>
            <div className="carritoX-modal-buttons">
              <button className="carritoX-btn-cancelar" onClick={cancelDelete}>
                Cancelar
              </button>
              <button className="carritoX-btn-confirmar" onClick={confirmDelete}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carrito;
