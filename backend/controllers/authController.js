import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import crypto from 'crypto';
import { sendResetPasswordEmail } from '../helpers/mailer.js'; // función para enviar correo
import { sanitizeUserInput, validatePassword } from '../helpers/userHelpers.js';
import { 
  findUserByEmail, 
  findUserByCelular, 
  createUser,
  findUserByIdForReset,
  createPasswordReset,
  findValidResetToken,
  markResetTokenAsUsed,
  updateUserPassword
} from '../models/userModel.js';


const JWT_SECRET = process.env.JWT_SECRET || 'secreto';

// Registrar usuario
export const registerUser = async (req, res) => {
  let { nombre, apellido, email, password, celular } = req.body;
  ({ nombre, apellido, email, celular } = sanitizeUserInput({ nombre, apellido, email, celular }));

  if (!nombre || !apellido || !email || !password || !celular) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  if (!validator.isEmail(email)) return res.status(400).json({ message: 'Correo inválido' });

  // Celular colombiano (10 dígitos, empieza con 3)
  const celularRegex = /^3\d{9}$/;
  if (!celularRegex.test(celular)) return res.status(400).json({ message: 'El número de celular debe tener 10 dígitos y comenzar con 3' });

  // Validación de contraseña
  const { valid, message } = validatePassword(password);
  if (!valid) return res.status(400).json({ message });

  try {
    // Verificar celular único
    const usuariosConCelular = await findUserByCelular(celular);
    if (usuariosConCelular.length > 0) return res.status(409).json({ message: 'El número de celular ya está registrado' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await createUser(nombre, apellido, email, hashedPassword, celular);

    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'El correo ya está registrado' });
    console.error(error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};

// Login usuario
export const loginUser = async (req, res) => {
  const email = validator.normalizeEmail(req.body.email || '');
  const password = req.body.password;

  if (!email || !password) 
    return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });

  try {
    const usuario = await findUserByEmail(email);
    
    if (!usuario) 
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });

    // 🚫 Validar estado del usuario (debe ser 'habilitado' o 'activo')
    if (usuario.estado !== 'habilitado' && usuario.estado !== 'activo') {
      return res.status(403).json({ message: 'Tu cuenta está inhabilitada. Contacta al administrador.' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    
    if (!passwordValida) 
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });

    // CAMBIO AQUÍ: Usar id_usuario en lugar de id
    const token = jwt.sign({ 
      id_usuario: usuario.id_usuario,  
      email: usuario.email, 
      rol: usuario.rol 
    }, JWT_SECRET, { expiresIn: '1h' });

    const { password: _, ...usuarioSinPassword } = usuario;
    
    res.json({ 
      message: 'Inicio de sesión exitoso', 
      token, 
      usuario: usuarioSinPassword 
    });
  } catch (error) {
    console.error('Error en loginUser:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};


/*     Solicitar reset de contraseña     */
export const solicitarReset = async (req, res) => {
  const { email } = req.body;

  try {
    // 1️ Buscar usuario por correo
    const usuario = await findUserByEmail(email);

    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    const userId = usuario.id_usuario;

    // 2️ Generar token seguro
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hora

    // 3️ Guardar token en DB
    await createPasswordReset(userId, token, expiresAt);

    // 4️ Enviar correo con link
    const resetLink = `https://proyecto-ecotecc.onrender.com/reset-password/${token}`;
    await sendResetPasswordEmail(email, resetLink);

    res.json({ message: 'Correo de recuperación enviado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al solicitar recuperación' });
  }
};

/*    Resetear Contraseña    */
export const resetearPassword = async (req, res) => {
  const { token, nuevaPassword } = req.body;

  if (!token || !nuevaPassword)
    return res.status(400).json({ message: 'Token y nueva contraseña son obligatorios' });

  try {
    //  Verificar que el token exista, no esté usado y no haya expirado
    const reset = await findValidResetToken(token);

    if (!reset) return res.status(400).json({ message: 'Token inválido o expirado' });

    // 1 Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

    // 2 Actualizar contraseña del usuario
    await updateUserPassword(reset.user_id, hashedPassword);

    // 3 Marcar token como usado
    await markResetTokenAsUsed(reset.id_token);

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al resetear contraseña' });
  }
};
