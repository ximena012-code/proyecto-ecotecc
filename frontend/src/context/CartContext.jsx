// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../api/cartService";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Cargar carrito desde el backend cuando hay un usuario autenticado
  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (user) {
          const data = await getCart();
          setCart(data.items || []);
        } else {
          // Si no hay usuario, limpiamos el carrito
          setCart([]);
        }
      } catch (error) {
        console.error("Error al cargar carrito:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [user]); // Se ejecuta cuando cambia el estado de autenticación

  // Agregar producto
  const addItem = async (id_producto, cantidad = 1) => {
    if (!user) return; // No hacer nada si no hay usuario
    try {
      await addToCart(id_producto, cantidad);
      const data = await getCart();
      setCart(data.items);
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      throw error;
    }
  };

  // Actualizar cantidad
  const updateItem = async (id_carrito, cantidad) => {
    if (!user) return; // No hacer nada si no hay usuario
    try {
      await updateCartItem(id_carrito, cantidad);
      const data = await getCart();
      setCart(data.items);
    } catch (error) {
      console.error("Error al actualizar carrito:", error);
      throw error; // Re-lanzar el error para manejarlo en el componente
    }
  };

  // Eliminar item
  const removeItem = async (id_carrito) => {
    if (!user) return; // No hacer nada si no hay usuario
    try {
      await removeFromCart(id_carrito);
      const data = await getCart();
      setCart(data.items);
    } catch (error) {
      console.error("Error al eliminar del carrito:", error);
    }
  };

  // Vaciar carrito
  const clear = async () => {
    if (!user) return; // No hacer nada si no hay usuario
    try {
      await clearCart();
      setCart([]);
    } catch (error) {
      console.error("Error al limpiar el carrito:", error);
    }
  };

// Calcular el total y asegurarse de que sea número bien formateado
const total = cart.reduce((acc, item) => acc + Number(item.subtotal || 0), 0);
const totalItems = cart.reduce((acc, item) => acc + Number(item.cantidad || 0), 0);



  return (
    <CartContext.Provider
      value={{ cart, addItem, updateItem, removeItem, clear, total, totalItems, loading }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
