import db from '../config/db.js';

// Buscar usuario por email
export const findUserByEmail = async (email) => {
  const [rows] = await db.promise().execute(
    'SELECT * FROM usuarios WHERE email = ?', 
    [email]
  );
  return rows[0] || null;
};

// Buscar usuario por celular
export const findUserByCelular = async (celular) => {
  const [rows] = await db.promise().execute(
    'SELECT id_usuario FROM usuarios WHERE celular = ?', 
    [celular]
  );
  return rows;
};

// Crear nuevo usuario
export const createUser = async (nombre, apellido, email, hashedPassword, celular) => {
  const [result] = await db.promise().execute(
    'INSERT INTO usuarios (nombre, apellido, email, password, celular) VALUES (?, ?, ?, ?, ?)',
    [nombre, apellido, email, hashedPassword, celular]
  );
  return result;
};

// Buscar usuario por ID
export const findUserById = async (id) => {
  const [rows] = await db.promise().execute(
    'SELECT id_usuario, nombre, apellido, email, celular, rol, created_at FROM usuarios WHERE id_usuario = ?',
    [id]
  );
  return rows[0] || null;
};

// Buscar usuario por ID incluyendo contraseña (para validaciones)
export const findUserByIdWithPassword = async (id) => {
  const [rows] = await db.promise().execute(
    'SELECT id_usuario, nombre, apellido, email, celular, rol, password, created_at FROM usuarios WHERE id_usuario = ?',
    [id]
  );
  return rows[0] || null;
};

// Actualizar información del usuario
export const updateUserInfo = async (id_usuario, nombre, apellido, celular) => {
  const [result] = await db.promise().execute(
    'UPDATE usuarios SET nombre = ?, apellido = ?, celular = ? WHERE id_usuario = ?',
    [nombre, apellido, celular, id_usuario]
  );
  return result;
};

// Actualizar contraseña del usuario
export const updateUserPassword = async (id_usuario, hashedPassword) => {
  const [result] = await db.promise().execute(
    'UPDATE usuarios SET password = ? WHERE id_usuario = ?',
    [hashedPassword, id_usuario]
  );
  return result;
};

// Buscar administrador
export const findAdmin = async () => {
  const [rows] = await db.promise().query(
    'SELECT id_usuario FROM usuarios WHERE rol = "admin" LIMIT 1'
  );
  return rows[0] || null;
};

// Actualizar token de reset de contraseña
export const updateResetToken = async (email, resetToken, resetTokenExpiry) => {
  const [result] = await db.promise().execute(
    'UPDATE usuarios SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
    [resetToken, resetTokenExpiry, email]
  );
  return result;
};

// Verificar token de reset
export const findUserByResetToken = async (token) => {
  const [rows] = await db.promise().execute(
    'SELECT * FROM usuarios WHERE reset_token = ? AND reset_token_expiry > NOW()',
    [token]
  );
  return rows[0] || null;
};

// Buscar usuario por ID para reset
export const findUserByIdForReset = async (id) => {
  const [rows] = await db.promise().execute(
    'SELECT id_usuario FROM usuarios WHERE id_usuario = ?',
    [id]
  );
  return rows[0] || null;
};

// Crear token de reset de contraseña
export const createPasswordReset = async (userId, token, expiresAt) => {
  const [result] = await db.promise().execute(
    'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
    [userId, token, expiresAt]
  );
  return result;
};

// Buscar token de reset válido
export const findValidResetToken = async (token) => {
  const [rows] = await db.promise().execute(
    'SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > NOW()',
    [token]
  );
  return rows[0] || null;
};

// Marcar token de reset como usado
export const markResetTokenAsUsed = async (tokenId) => {
  const [result] = await db.promise().execute(
    'UPDATE password_resets SET used = 1 WHERE id_token = ?',
    [tokenId]
  );
  return result;
};

// Limpiar token de reset
export const clearResetToken = async (id_usuario) => {
  const [result] = await db.promise().execute(
    'UPDATE usuarios SET reset_token = NULL, reset_token_expiry = NULL WHERE id_usuario = ?',
    [id_usuario]
  );
  return result;
};

// Obtener estadísticas de usuarios
export const getUserStatsModel = async () => {
  const [rows] = await db.promise().query(
    'SELECT COUNT(*) AS totalCuentas FROM usuarios'
  );
  return rows[0];
};

// Obtener todos los usuarios (admin)
export const getAllUsersModel = async () => {
  const [rows] = await db.promise().query(
    'SELECT id_usuario, nombre, apellido, email, celular, estado, created_at FROM usuarios'
  );
  return rows;
};

// Obtener estadísticas de estado de usuarios
export const getUserStatusStatsModel = async () => {
  const [rows] = await db.promise().query(`
    SELECT 
      SUM(CASE WHEN estado = 'habilitado' THEN 1 ELSE 0 END) AS habilitados,
      SUM(CASE WHEN estado = 'deshabilitado' THEN 1 ELSE 0 END) AS deshabilitados
    FROM usuarios
  `);
  return rows[0];
};

// Obtener tendencia de registros por mes
export const getRegistroTendenciaModel = async () => {
  const [rows] = await db.promise().query(`
    SELECT MONTHNAME(created_at) AS mes, COUNT(*) AS registros
    FROM usuarios
    GROUP BY MONTH(created_at), MONTHNAME(created_at)
    ORDER BY MONTH(created_at)
  `);
  return rows;
};

// Actualizar estado del usuario (habilitar/deshabilitar)
export const updateUserStatus = async (id_usuario, newStatus) => {
  const [result] = await db.promise().execute(
    'UPDATE usuarios SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id_usuario = ?',
    [newStatus, id_usuario]
  );
  return result;
};