import { 
  addToFavorites, 
  getFavoritesByUserId, 
  removeFromFavorites 
} from '../models/favoritosModel.js'; 

// Agregar producto a favoritos
export const agregarFavorito = async (req, res) => {
  const { productoId } = req.params;
  const usuarioId = req.user.id_usuario; //  viene del token

  try {
    await addToFavorites(usuarioId, productoId);
    res.json({ message: "✅ Producto agregado a favoritos" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ message: "⚠️ Este producto ya está en favoritos" });
    } else {
      console.error("Error al agregar favorito:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
};

// Obtener favoritos del usuario autenticado
export const obtenerFavoritos = async (req, res) => {
  const usuarioId = req.user.id_usuario; 

  try {
    const rows = await getFavoritesByUserId(usuarioId);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Eliminar producto de favoritos
export const eliminarFavorito = async (req, res) => {
  const { productoId } = req.params;
  const usuarioId = req.user.id_usuario; //  del token

  try {
    await removeFromFavorites(usuarioId, productoId);
    res.json({ message: "🗑️ Producto eliminado de favoritos" });
  } catch (error) {
    console.error("Error al eliminar favorito:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
