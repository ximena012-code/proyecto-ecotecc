import express from "express";
import { authenticateToken } from '../middleware/auth.js';
import {
  agregarFavorito,
  obtenerFavoritos,
  eliminarFavorito
} from "../controllers/favoritosController.js";

const router = express.Router();

// POST -> Agregar a favoritos
router.post("/:productoId", authenticateToken, agregarFavorito);

// GET -> Obtener todos los favoritos de un usuario
router.get("/", authenticateToken, obtenerFavoritos);

// DELETE -> Eliminar producto de favoritos
router.delete("/:productoId",authenticateToken, eliminarFavorito);

export default router;
