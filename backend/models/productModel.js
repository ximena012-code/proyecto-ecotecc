import db from '../config/db.js';

// Buscar productos por nombre, descripción o categoría
export const searchProducts = async (searchTerm) => {
  const search = `%${searchTerm.trim().toLowerCase()}%`;
  
  // Mapeo de términos comunes a categorías exactas
  const categoryMappings = {
    'celular': 'Celulares',
    'celulares': 'Celulares',
    'movil': 'Celulares',
    'moviles': 'Celulares',
    'telefono': 'Celulares',
    'telefonos': 'Celulares',
    'tablet': 'Tablets',
    'tablets': 'Tablets',
    'computador': 'Computadores',
    'computadora': 'Computadores',
    'computadoras': 'Computadores',
    'computadores': 'Computadores',
    'pc': 'Computadores',
    'laptop': 'Computadores',
    'portatil': 'Computadores',
    'reloj': 'Relojes Inteligentes',
    'relojes': 'Relojes Inteligentes',
    'smartwatch': 'Relojes Inteligentes',
    'audio': 'Audio',
    'audifonos': 'Audio',
    'auriculares': 'Audio',
    'parlante': 'Audio',
    'parlantes': 'Audio',
    'promocion': 'Promociones',
    'promociones': 'Promociones',
    'oferta': 'Promociones',
    'ofertas': 'Promociones',
    'reacondicionado': 'Reacondicionados',
    'reacondicionados': 'Reacondicionados',
    'usado': 'Reacondicionados',
    'usados': 'Reacondicionados'
  };

  // Verificar si el término de búsqueda corresponde a una categoría específica
  const exactCategory = categoryMappings[searchTerm.trim().toLowerCase()];
  
  let query, params;
  
  if (exactCategory) {
    // Si es una categoría exacta, buscar por esa categoría específica
    query = `SELECT * FROM productos WHERE 
             categoria = ? OR
             LOWER(TRIM(nombre)) LIKE ? OR 
             LOWER(TRIM(descripcion)) LIKE ?
             ORDER BY id_producto DESC`;
    params = [exactCategory, search, search];
  } else {
    // Búsqueda general por nombre, descripción o categoría
    query = `SELECT * FROM productos WHERE 
             LOWER(TRIM(nombre)) LIKE ? OR 
             LOWER(TRIM(descripcion)) LIKE ? OR 
             LOWER(TRIM(categoria)) LIKE ? 
             ORDER BY id_producto DESC`;
    params = [search, search, search];
  }
  
  const [rows] = await db.promise().query(query, params);
  return rows;
};

// Obtener todos los productos
export const getAllProducts = async () => {
  const [rows] = await db.promise().query('SELECT * FROM productos ORDER BY id_producto DESC');
  return rows;
};

// Obtener producto por ID
export const getProductById = async (id) => {
  const [rows] = await db.promise().query(
    'SELECT * FROM productos WHERE id_producto = ?',
    [id]
  );
  return rows[0] || null;
};

// Crear nuevo producto
export const createProduct = async (nombre, descripcion, cantidad, precio, codigo, categoria, foto, tipo_producto) => {
  const [result] = await db.promise().query(
    'INSERT INTO productos (nombre, descripcion, cantidad, precio, codigo, categoria, foto, tipo_producto) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [nombre, descripcion, cantidad, precio, codigo, categoria, foto, tipo_producto]
  );
  return result;
};

// Actualizar producto
export const updateProduct = async (id, productData) => {
  const { nombre, descripcion, precio, cantidad, categoria } = productData;
  const [result] = await db.promise().query(
    'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, cantidad = ?, categoria = ? WHERE id_producto = ?',
    [nombre, descripcion, precio, cantidad, categoria, id]
  );
  return result;
};

// Actualizar foto del producto
export const updateProductPhoto = async (id, foto) => {
  const [result] = await db.promise().query(
    'UPDATE productos SET foto = ? WHERE id_producto = ?',
    [foto, id]
  );
  return result;
};

// Eliminar producto
export const deleteProduct = async (id) => {
  const [result] = await db.promise().query(
    'DELETE FROM productos WHERE id_producto = ?',
    [id]
  );
  return result;
};

// Obtener productos por categoría
export const getProductsByCategory = async (categoria) => {
  const [rows] = await db.promise().query(
    'SELECT * FROM productos WHERE categoria = ? ORDER BY id_producto DESC',
    [categoria]
  );
  return rows;
};

// Verificar stock del producto
export const checkProductStock = async (id, cantidad) => {
  const [rows] = await db.promise().query(
    'SELECT cantidad FROM productos WHERE id_producto = ?',
    [id]
  );
  if (rows.length === 0) return false;
  return rows[0].cantidad >= cantidad;
};

// Actualizar stock del producto
export const updateProductStock = async (id, newStock) => {
  const [result] = await db.promise().query(
    'UPDATE productos SET cantidad = ? WHERE id_producto = ?',
    [newStock, id]
  );
  return result;
};

// Obtener productos con bajo stock
export const getLowStockProducts = async (minStock = 5) => {
  const [rows] = await db.promise().query(
    'SELECT * FROM productos WHERE cantidad <= ? ORDER BY cantidad ASC',
    [minStock]
  );
  return rows;
};

// Obtener todos los usuarios (excluyendo admins)
export const getAllUsers = async () => {
  const [rows] = await db.promise().query(
    'SELECT id_usuario FROM usuarios WHERE rol = "usuario"'
  );
  return rows;
};

// Obtener estadísticas de productos
export const getProductStatsModel = async () => {
  const [totalProductos] = await db.promise().query('SELECT SUM(cantidad) as total FROM productos');
  const [stockBajo] = await db.promise().query('SELECT COUNT(*) as bajoStock FROM productos WHERE cantidad < 5');
  const [productoCostoso] = await db.promise().query('SELECT nombre, precio FROM productos ORDER BY precio DESC LIMIT 1');
  const [valorInventario] = await db.promise().query('SELECT SUM(cantidad * precio) as totalValor FROM productos');
  const [productosPorCategoria] = await db.promise().query(`
    SELECT 
      categoria, 
      SUM(cantidad) as total, 
      SUM(cantidad * precio) as valorTotal 
    FROM productos 
    GROUP BY categoria
  `);

  return {
    totalProductos: totalProductos[0],
    stockBajo: stockBajo[0],
    productoCostoso: productoCostoso[0],
    valorInventario: valorInventario[0],
    productosPorCategoria
  };
};

// Obtener productos reacondicionados
export const getReacondicionadosModel = async () => {
  const [rows] = await db.promise().query(`SELECT * FROM productos WHERE tipo_producto = 'reacondicionado'`);
  return rows;
};

// Registrar visita a producto
export const registrarVisitaModel = async (id) => {
  const [result] = await db.promise().query(`
    UPDATE productos 
    SET visitas = COALESCE(visitas, 0) + 1, ultima_visita = NOW() 
    WHERE id_producto = ?
  `, [id]);
  return result;
};

// Registrar visita con control de tiempo
export const registrarVisitaConTiempoModel = async (id) => {
  const [result] = await db.promise().execute(`
    UPDATE productos 
    SET visitas = visitas + 1, ultima_visita = CURRENT_TIMESTAMP 
    WHERE id_producto = ?
      AND (ultima_visita IS NULL OR ultima_visita < NOW() - INTERVAL 5 SECOND)
  `, [id]);
  return result;
};

// Obtener productos más vistos del mes
export const getMasVistosMesModel = async () => {
  // Primero buscar los más vistos en el último mes
  const [rows] = await db.promise().query(`
    SELECT * 
    FROM productos 
    WHERE ultima_visita >= NOW() - INTERVAL 1 MONTH
    ORDER BY visitas DESC 
    LIMIT 6
  `);

  if (rows.length > 0) {
    return rows;
  }

  // Si no hay visitas, devolver los últimos 6 productos registrados
  const [fallback] = await db.promise().query(`
    SELECT * 
    FROM productos 
    ORDER BY id_producto DESC 
    LIMIT 6
  `);

  return fallback;
};

// Obtener productos por categoría
export const getProductsByCategoryModel = async (categoria) => {
  const [rows] = await db.promise().query(
    `SELECT * FROM productos WHERE categoria = ? ORDER BY id_producto DESC`,
    [categoria]
  );
  return rows;
};

// Obtener productos reacondicionados por tipo
export const getReacondicionadosByTypeModel = async () => {
  const [rows] = await db.promise().query(
    `SELECT * FROM productos WHERE tipo_producto = 'reacondicionado' ORDER BY id_producto DESC`
  );
  return rows;
};

// Actualizar producto completo (función específica para el controlador)
export const updateProductComplete = async (id, nombre, descripcion, cantidad, precio, codigo, categoria) => {
  const [result] = await db.promise().execute(
    'UPDATE productos SET nombre=?, descripcion=?, cantidad=?, precio=?, codigo=?, categoria=?, updated_at=CURRENT_TIMESTAMP WHERE id_producto=?',
    [nombre, descripcion, cantidad, precio, codigo, categoria, id]
  );
  return result;
};

// Eliminar producto
export const deleteProductModel = async (id) => {
  const [result] = await db.promise().execute('DELETE FROM productos WHERE id_producto = ?', [id]);
  return result;
};
