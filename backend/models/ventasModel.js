import db from '../config/db.js';

// Obtener ventas por periodo

export const getVentasPorPeriodo = async (periodo) => {
  let query = '';
  
  switch (periodo) {
    case 'dia':
      query = `
        SELECT 
          -- La clave ya se genera correctamente, no hay que cambiarla.
          CONCAT(YEAR(fecha_pedido), '-', MONTH(fecha_pedido), '-', DAY(fecha_pedido), '-', HOUR(fecha_pedido)) as periodo,
          SUM(total) as ventas,
          SUM(
            (SELECT SUM(cantidad) 
             FROM detalle_pedidos 
             WHERE id_pedido = pedidos.id_pedido)
          ) as cantidad
        FROM pedidos
        WHERE 
          -- Corregido: Obtiene datos de las últimas 24 horas desde este momento.
          fecha_pedido >= NOW() - INTERVAL 24 HOUR
          AND estado = 'pagado'
        GROUP BY periodo
        ORDER BY periodo;
      `;
      break;

    case 'semana':
      query = `
        SELECT 
          DATE(fecha_pedido) as periodo,
          SUM(total) as ventas,
          SUM(
            (SELECT SUM(cantidad) 
             FROM detalle_pedidos 
             WHERE id_pedido = pedidos.id_pedido)
          ) as cantidad
        FROM pedidos
        WHERE 
          -- Corregido: Obtiene datos de los últimos 7 días.
          fecha_pedido >= NOW() - INTERVAL 7 DAY
          AND estado = 'pagado'
        GROUP BY DATE(fecha_pedido)
        ORDER BY periodo;
      `;
      break;

    case 'mes':
      query = `
        SELECT 
          DATE(fecha_pedido) as periodo,
          SUM(total) as ventas,
          SUM(
            (SELECT SUM(cantidad) 
             FROM detalle_pedidos 
             WHERE id_pedido = pedidos.id_pedido)
          ) as cantidad
        FROM pedidos
        WHERE 
          -- Corregido: Obtiene datos de los últimos 30 días.
          fecha_pedido >= NOW() - INTERVAL 30 DAY
          AND estado = 'pagado'
        GROUP BY DATE(fecha_pedido)
        ORDER BY periodo;
      `;
      break;

    case 'año':
      query = `
        SELECT 
          CONCAT(YEAR(fecha_pedido), '-', MONTH(fecha_pedido)) as periodo,
          SUM(total) as ventas,
          SUM(
            (SELECT SUM(cantidad) 
             FROM detalle_pedidos 
             WHERE id_pedido = pedidos.id_pedido)
          ) as cantidad
        FROM pedidos
        WHERE 
          -- Corregido: Obtiene datos de los últimos 12 meses.
          fecha_pedido >= NOW() - INTERVAL 12 MONTH
          AND estado = 'pagado'
        GROUP BY periodo
        ORDER BY periodo;
      `;
      break;

    default:
      throw new Error('Periodo no válido');
  }

  const [rows] = await db.promise().query(query);
  return rows;
};

// Obtener resumen de ventas por periodo
export const getResumenVentasPorPeriodo = async (periodo) => {
  let dateCondition = '';

  switch (periodo) {
    case 'dia':
      dateCondition = 'DATE(fecha_pedido) = CURDATE()';
      break;
    case 'semana':
      dateCondition = 'fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)';
      break;
    case 'mes':
      dateCondition = 'fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)';
      break;
    case 'año':
      dateCondition = 'fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)';
      break;
    default:
      throw new Error('Periodo no válido');
  }

  const query = `
    SELECT 
      SUM(total) as totalVentas,
      SUM(
        (SELECT SUM(cantidad) 
         FROM detalle_pedidos 
         WHERE id_pedido = pedidos.id_pedido)
      ) as totalUnidades,
      COUNT(DISTINCT DATE(fecha_pedido)) as numeroPeriodos
    FROM pedidos
    WHERE ${dateCondition} AND estado = 'pagado';
  `;

  const [rows] = await db.promise().query(query);
  return rows[0];
};

// Crear venta de dispositivo
export const createDeviceSale = async (saleData) => {
  const { nombre, contacto, dispositivo, marca, modelo, problema, precio_ofrecido, imagen } = saleData;
  const [result] = await db.promise().query(
    `INSERT INTO ventas_dispositivos (nombre, contacto, dispositivo, marca, modelo, problema, precio_ofrecido, imagen, estado) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
    [nombre, contacto, dispositivo, marca, modelo, problema, precio_ofrecido, imagen]
  );
  return result;
};

// Obtener ventas de dispositivos por usuario
export const getDeviceSalesByUser = async (email) => {
  const [rows] = await db.promise().query(
    'SELECT * FROM ventas_dispositivos WHERE contacto = ? ORDER BY fecha_solicitud DESC',
    [email]
  );
  return rows;
};

// Obtener todas las ventas de dispositivos
export const getAllDeviceSales = async () => {
  const [rows] = await db.promise().query(
    'SELECT * FROM ventas_dispositivos ORDER BY fecha_solicitud DESC'
  );
  return rows;
};

// Actualizar estado de venta de dispositivo
export const updateDeviceSaleStatus = async (id, estado, precio_final = null) => {
  let query = 'UPDATE ventas_dispositivos SET estado = ?';
  let params = [estado];
  
  if (precio_final !== null) {
    query += ', precio_final = ?';
    params.push(precio_final);
  }
  
  query += ' WHERE id_venta = ?';
  params.push(id);
  
  const [result] = await db.promise().query(query, params);
  return result;
};

// Obtener venta de dispositivo por ID
export const getDeviceSaleById = async (id) => {
  const [rows] = await db.promise().query(
    'SELECT * FROM ventas_dispositivos WHERE id_venta = ?',
    [id]
  );
  return rows[0] || null;
};

// Obtener estadísticas de ventas
export const getSalesStats = async () => {
  const [rows] = await db.promise().query(`
    SELECT 
      COUNT(*) as total_pedidos,
      SUM(CASE WHEN estado = 'pagado' THEN total ELSE 0 END) as ingresos_totales,
      SUM(CASE WHEN estado = 'pagado' THEN 1 ELSE 0 END) as pedidos_completados,
      AVG(CASE WHEN estado = 'pagado' THEN total ELSE NULL END) as ticket_promedio
    FROM pedidos
    WHERE YEAR(fecha_pedido) = YEAR(CURDATE())
  `);
  return rows[0] || null;
};

// Obtener productos más vendidos
export const getTopSellingProducts = async (limit = 10) => {
  const [rows] = await db.promise().query(`
    SELECT 
      p.nombre,
      p.precio,
      SUM(dp.cantidad) as total_vendido,
      SUM(dp.cantidad * dp.precio_unitario) as ingresos
    FROM productos p
    JOIN detalle_pedidos dp ON p.id_producto = dp.producto_id
    JOIN pedidos pe ON dp.id_pedido = pe.id_pedido
    WHERE pe.estado = 'pagado'
    GROUP BY p.id_producto
    ORDER BY total_vendido DESC
    LIMIT ?
  `, [limit]);
  return rows;
};

// Obtener ventas por fecha específica (usado por getSalesData)
export const getVentasPorFechaModel = async (query) => {
  const [rows] = await db.promise().query(query);
  return rows;
};

// Obtener resumen de ventas por periodo
export const getResumenVentasModel = async (query) => {
  const [rows] = await db.promise().query(query);
  return rows[0];
};

// Crear solicitud de venta de dispositivo  
export const createVentaDispositivoModel = async (ventaData) => {
  const { id_usuario, nombreDispositivo, marca, modelo, estado, descripcion, contacto, imagen } = ventaData;
  const [result] = await db.promise().execute(
    `INSERT INTO dispositivos_en_venta 
      (id_usuario, nombre_dispositivo, marca, modelo, estado, descripcion, contacto, imagen) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id_usuario, nombreDispositivo, marca, modelo, estado, descripcion, contacto, imagen]
  );
  return result;
};

// Obtener ID del administrador
export const getAdminIdModel = async () => {
  const [rows] = await db.promise().query(
    'SELECT id_usuario FROM usuarios WHERE rol = "admin" LIMIT 1'
  );
  return rows[0] || null;
};

// Obtener dispositivos en venta por usuario
export const getDispositivosByUserModel = async (userId) => {
  const [rows] = await db.promise().query(
    `SELECT * FROM dispositivos_en_venta WHERE id_usuario = ? ORDER BY fecha_creacion DESC`,
    [userId]
  );
  return rows;
};

// Obtener todos los dispositivos en venta (admin)
export const getAllDispositivosModel = async () => {
  const [rows] = await db.promise().query(
    `SELECT vd.*, u.nombre, u.apellido, u.email 
     FROM dispositivos_en_venta vd 
     LEFT JOIN usuarios u ON vd.id_usuario = u.id_usuario 
     ORDER BY vd.fecha_creacion DESC`
  );
  return rows;
};

// Obtener último dispositivo de un usuario
export const getDispositivoDetalleModel = async (userId) => {
  const [rows] = await db.promise().query(
    `SELECT * FROM dispositivos_en_venta 
     WHERE id_usuario = ? 
     ORDER BY fecha_publicacion DESC 
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
};

// Obtener dispositivo por ID con datos del usuario
export const getDispositivoPorIdModel = async (dispositivoId) => {
  const [rows] = await db.promise().query(
    `SELECT dv.*, u.nombre, u.email 
     FROM dispositivos_en_venta dv 
     LEFT JOIN usuarios u ON dv.id_usuario = u.id_usuario 
     WHERE dv.id_dispositivo = ?`,
    [dispositivoId]
  );
  return rows[0] || null;
};