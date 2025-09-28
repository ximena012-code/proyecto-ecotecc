import multer from 'multer';
import path from 'path';
import { registrarNotificacion } from '../helpers/notificaciones.js'; // 👈 Importar helper de notificaciones
import {
  searchProducts,
  getAllProducts as getAllProductsModel,
  getProductById as getProductByIdModel,
  createProduct,
  updateProduct as updateProductModel,
  updateProductComplete,
  updateProductPhoto,
  deleteProductModel,
  getProductsByCategoryModel,
  getLowStockProducts,
  getAllUsers,
  getProductStatsModel,
  getReacondicionadosModel,
  registrarVisitaModel,
  registrarVisitaConTiempoModel,
  getMasVistosMesModel,
  getReacondicionadosByTypeModel
} from '../models/productModel.js';

// Buscar productos por nombre, descripción o categoría
export const buscarProductos = async (req, res) => {
  const { query } = req.query;
  if (!query || !query.trim()) {
    return res.status(400).json({ message: 'Debes ingresar un término de búsqueda.' });
  }
  try {
    const rows = await searchProducts(query);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al buscar productos.' });
  }
};


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

export const upload = multer({ storage });

// Obtener producto por ID
export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await getProductByIdModel(id);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el producto' });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const rows = await getAllProductsModel();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { categoria } = req.params;
  try {
    const rows = await getProductsByCategoryModel(categoria);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos por categoría' });
  }
};

// Agregar producto
export const addProduct = async (req, res) => {
  const { nombre, descripcion, cantidad, precio, codigo, categoria } = req.body;
  const foto = req.file ? req.file.filename : null;

  // Validaciones
  if (!nombre || !descripcion || !cantidad || !precio || !codigo || !categoria || !foto) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  if (isNaN(cantidad) || cantidad < 0) {
    return res.status(400).json({ message: 'Cantidad debe ser un número positivo.' });
  }

  if (isNaN(precio) || precio < 0) {
    return res.status(400).json({ message: 'Precio debe ser un número positivo.' });
  }

  // 🟡 Incluir también "Reacondicionados" en las categorías válidas
  const categoriasValidas = ['Celulares', 'Tablets', 'Computadores', 'Relojes Inteligentes', 'Audio', 'Promociones', 'Reacondicionados'];
  if (!categoriasValidas.includes(categoria)) {
    return res.status(400).json({ message: 'Categoría no válida.' });
  }

  // 🟢 Determinar tipo de producto según categoría
  const tipo_producto = (categoria === 'Reacondicionados') ? 'reacondicionado' : 'nuevo';

  try {
    const result = await createProduct(nombre, descripcion, cantidad, precio, codigo, categoria, foto, tipo_producto);

    // 🚀 NUEVA FUNCIONALIDAD: Si es una promoción, notificar a todos los usuarios
    if (categoria === 'Promociones') {
      try {
        // Obtener todos los usuarios registrados (excluyendo admins)
        const usuarios = await getAllUsers();

        // Crear notificaciones para todos los usuarios
        const notificacionPromises = usuarios.map(usuario => {
          return registrarNotificacion({
            id_usuario: usuario.id_usuario,
            tipo: 'promocion',
            mensaje: `¡Nueva promoción disponible! 🎉 ${nombre} - ${descripcion}. ¡No te la pierdas!`,
            fecha: new Date()
          });
        });

        // Ejecutar todas las notificaciones
        await Promise.all(notificacionPromises);
        console.log(`✅ Notificaciones de promoción enviadas a ${usuarios.length} usuarios`);
      } catch (notificationError) {
        console.error('❌ Error al enviar notificaciones de promoción:', notificationError);
        // No devolver error porque el producto se creó correctamente
      }
    }

    res.status(201).json({ message: 'Producto agregado correctamente' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: 'Código de producto ya registrado' });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Error al agregar producto' });
    }
  }
};


// Actualizar producto
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, cantidad, precio, codigo, categoria } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'ID del producto es obligatorio.' });
  }

  if (!nombre || !descripcion || !cantidad || !precio || !codigo || !categoria) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  if (isNaN(cantidad) || cantidad < 0) {
    return res.status(400).json({ message: 'Cantidad debe ser un número positivo.' });
  }

  if (isNaN(precio) || precio < 0) {
    return res.status(400).json({ message: 'Precio debe ser un número positivo.' });
  }

  const categoriasValidas = ['Celulares', 'Tablets', 'Computadores', 'Relojes Inteligentes', 'Audio','Promociones', 'Reacondicionados'];
  if (!categoriasValidas.includes(categoria)) {
    return res.status(400).json({ message: 'Categoría no válida.' });
  }

  try {
    const result = await updateProductComplete(id, nombre, descripcion, cantidad, precio, codigo, categoria);

    // Validar si se actualizó algo
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }

    res.json({ message: 'Producto actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
};

// Eliminar producto
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await deleteProductModel(id);
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
};

export const getProductStats = async (req, res) => {
  try {
    const stats = await getProductStatsModel();

    // Responder con todos los datos organizados
    res.json({
      totalProductos: stats.totalProductos.total,
      stockBajo: stats.stockBajo.bajoStock,
      productoCostoso: stats.productoCostoso,
      valorInventario: stats.valorInventario.totalValor,
      productosPorCategoria: stats.productosPorCategoria
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener estadísticas de productos' });
  }
};

//Consultar productos reacondicionados
export const getReacondicionados = async (req, res) => {
  try {
    const rows = await getReacondicionadosModel();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos reacondicionados' });
  }
};


// Vistas
export const registrarVisita = async (req, res) => { 
  const { id } = req.params;

  try {
    // Actualiza solo si la última visita fue hace más de 5 segundos
    const result = await registrarVisitaConTiempoModel(id);

    if (result.affectedRows === 0) {
      return res.json({ message: 'Visita ya registrada recientemente' });
    }

    res.json({ message: 'Vista registrada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar visita' });
  }
};

// Si no hay visitas, devuelve los últimos 6 productos registrados
export const getMasVistosMes = async (req, res) => {
  try {
    const rows = await getMasVistosMesModel();
    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos más vistos del mes' });
  }
};

// Categorizar los productos

const slugToCategoria = {
  celulares: 'Celulares',
  portatiles: 'Computadores',
  tablets: 'Tablets',
  relojes: 'Relojes Inteligentes',
  audio: 'Audio',
  promociones: 'Promociones',
  reacondicionados: 'Reacondicionados',
};

export const getProductsBySlug = async (req, res) => {
  try {
    const slug = (req.params.slug || '').toLowerCase();
    const categoria = slugToCategoria[slug];

    if (!categoria) {
      return res.status(400).json({ message: 'Categoría no válida.' });
    }

    // Para reacondicionados preferimos el campo tipo_producto (más semántico)
    if (slug === 'reacondicionados') {
      const rows = await getReacondicionadosByTypeModel();
      return res.json(rows);
    }

    const rows = await getProductsByCategoryModel(categoria);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos por categoría' });
  }
};
