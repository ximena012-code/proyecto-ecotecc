import {
  getCartByUserId,
  findCartItem,
  addProductToCart,
  updateCartItemQuantity,
  removeFromCart as removeCartItem,
  clearUserCart,
  getCartItemWithStock,
  verifyCartItemOwnership,
  updateCartItemById,
  removeCartItemById,
  getCartSummary as getCartSummaryModel
} from "../models/cartModel.js";
import { getProductById, checkProductStock } from "../models/productModel.js";

// Helper function para obtener el ID del usuario
const getUserId = (req) => {
  return req.user?.id_usuario || req.user?.id;
};

//  Obtener carrito de un usuario
export const getCart = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado"
      });
    }

    const rows = await getCartByUserId(userId);

    // Calcular total del carrito
    const total = rows.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

    res.json({
      success: true,
      items: rows,
      total: total.toFixed(2),
      count: rows.length
    });
  } catch (error) {
    console.error("Error al obtener carrito:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener carrito",
      error: error.message
    });
  }
};


//  Agregar producto al carrito con validación de stock
export const addToCart = async (req, res) => {
  const { id_producto, cantidad = 1 } = req.body;


  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado"
      });
    }

    // Verificar si el producto existe y obtener stock
    const producto = await getProductById(id_producto);

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado"
      });
    }

    // ¿Ya existe este producto en el carrito?
    const existingItem = await findCartItem(userId, id_producto);

    if (existingItem) {
      // Si existe → aumentar cantidad
      const newQuantity = existingItem.cantidad + cantidad;

      if (newQuantity > producto.cantidad) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente. Solo hay ${producto.cantidad} unidades disponibles`
        });
      }

      await updateCartItemQuantity(userId, id_producto, newQuantity);

      res.json({
        success: true,
        message: "Cantidad actualizada en el carrito",
        action: "updated",
        new_quantity: newQuantity
      });
    } else {
      // Si no existe → insertar
      if (cantidad > producto.cantidad) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente. Solo hay ${producto.cantidad} unidades disponibles`
        });
      }

      await addProductToCart(userId, id_producto, cantidad);

      res.json({
        success: true,
        message: "Producto agregado al carrito",
        action: "added",
        quantity: cantidad
      });
    }
  } catch (error) {
    console.error("Error al agregar producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al agregar producto",
      error: error.message
    });
  }
};


//  Actualizar cantidad con validación de stock
export const updateCartItem = async (req, res) => {
  const { id_carrito } = req.params;
  const { cantidad } = req.body;

  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado"
      });
    }

    // Verificar que el item pertenece al usuario y obtener producto
    const item = await getCartItemWithStock(id_carrito, userId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item del carrito no encontrado"
      });
    }

    if (cantidad > item.stock) {
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente. Solo hay ${item.stock} unidades disponibles`
      });
    }

    await updateCartItemById(id_carrito, userId, cantidad);

    res.json({
      success: true,
      message: "Cantidad actualizada",
      new_quantity: cantidad
    });
  } catch (error) {
    console.error("Error al actualizar cantidad:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar cantidad",
      error: error.message
    });
  }
};


//  Eliminar un producto
export const removeFromCart = async (req, res) => {
  const { id_carrito } = req.params;

  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado"
      });
    }

    // Verificar que el item existe y pertenece al usuario
    const itemExists = await verifyCartItemOwnership(id_carrito, userId);

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: "Item del carrito no encontrado"
      });
    }

    await removeCartItemById(id_carrito, userId);

    res.json({
      success: true,
      message: "Producto eliminado del carrito"
    });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar producto",
      error: error.message
    });
  }
};

//  Vaciar carrito
export const clearCart = async (req, res) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado"
      });
    }

    const result = await clearUserCart(userId);

    res.json({
      success: true,
      message: "Carrito vaciado",
      deleted_items: result.affectedRows
    });
  } catch (error) {
    console.error("Error al vaciar carrito:", error);
    res.status(500).json({
      success: false,
      message: "Error al vaciar carrito",
      error: error.message
    });
  }
};

//  Nueva función: Obtener resumen del carrito (solo totales)
export const getCartSummary = async (req, res) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado"
      });
    }

    const summary = await getCartSummaryModel(userId);

    res.json({
      success: true,
      summary: {
        total_items: parseInt(summary.total_items) || 0,
        total_quantity: parseInt(summary.total_quantity) || 0,
        total_amount: parseFloat(summary.total_amount) || 0
      }
    });
  } catch (error) {
    console.error("Error al obtener resumen:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener resumen del carrito",
      error: error.message
    });
  }
};