import validator from 'validator';
import bcrypt from 'bcrypt';
import db from '../config/db.js';

// Sanitizar datos de usuario
export const sanitizeUserInput = ({ nombre, apellido, email, celular }) => {
  return {
    nombre: validator.escape(nombre || '').trim(),
    apellido: validator.escape(apellido || '').trim(),
    email: validator.normalizeEmail(email || ''),
    celular: validator.blacklist(celular || '', '<>"\'/ ').trim()
  };
};

// Validar contraseña
export const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[\x20-\x7E]{8,}$/;
  const forbiddenCharsRegex = /[ñáéíóúÑÁÉÍÓÚ]/;
  const hasXSSAttempt = /[<>'"&\\/]/;

  if (!password) return { valid: false, message: 'La contraseña es obligatoria' };
  if (forbiddenCharsRegex.test(password)) return { valid: false, message: 'La contraseña no puede contener tildes ni la letra ñ.' };
  if (hasXSSAttempt.test(password)) return { valid: false, message: 'La contraseña contiene caracteres no permitidos: < > " \' & /' };
  if (!passwordRegex.test(password)) return { valid: false, message: 'La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula, número, símbolo y no tener espacios.' };

  return { valid: true };
};

// Obtener usuario por ID desde DB
export const getUserByIdDB = async (id) => {
  const [rows] = await db.promise().query(
    `SELECT id_usuario, nombre, apellido, email, celular, estado, rol, created_at, updated_at 
     FROM usuarios 
     WHERE id_usuario = ?`,
    [id]
  );
  return rows[0] || null;
};
