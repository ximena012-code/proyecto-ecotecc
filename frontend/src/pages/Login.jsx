import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/Login.css';
import logoecotec2 from '../assets/image.png';
import { useAuth } from '../context/AuthContext'; // 👈 importar contexto

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // 👈 usar función login del contexto

  const [formValues, setFormValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [isLoadingForgotPassword, setIsLoadingForgotPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formValues.email) newErrors.email = 'El email es requerido';
    if (!formValues.password) newErrors.password = 'La contraseña es requerida';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await axios.post('https://ecotec-backend.onrender.com/api/auth/login', {
        email: formValues.email,
        password: formValues.password
      });

      const { token, usuario } = response.data;

      // ✅ Guardamos en el contexto y en localStorage
      login(token, usuario);

      setSuccessMessage('¡Inicio de sesión exitoso!');
      setFormValues({ email: '', password: '' });
      setErrors({});

      // Redirección según rol
      if (usuario.rol === 'admin') {
        navigate('/dashboardadmi');
      } else {
        navigate('/dashboard');
      }

    } catch (error) {
      if (error.response?.data?.message) {
        const message = error.response.data.message;
        if (message === 'Correo o contraseña incorrectos') {
          setErrors({ email: message, password: message });
        } else if (message === 'Tu cuenta está inhabilitada. Contacta al administrador.') {
          setErrors({ general: message });
        } else {
          setErrors({ general: 'Error inesperado al iniciar sesión' });
        }
      } else {
        setErrors({ general: 'Error de red o del servidor' });
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      setForgotPasswordMessage('Por favor ingresa tu email');
      return;
    }

    setIsLoadingForgotPassword(true);
    setForgotPasswordMessage('');

    try {
      await axios.post('https://ecotec-backend.onrender.com/api/auth/forgot-password', {
        email: forgotPasswordEmail
      });

      setForgotPasswordMessage('Se ha enviado un enlace de recuperación a tu email');
      setForgotPasswordEmail('');

      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotPasswordMessage('');
      }, 3000);

    } catch (error) {
      if (error.response?.data?.message) {
        setForgotPasswordMessage(error.response.data.message);
      } else {
        setForgotPasswordMessage('Error al enviar el enlace de recuperación');
      }
    } finally {
      setIsLoadingForgotPassword(false);
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail('');
    setForgotPasswordMessage('');
  };

  return (
    <>
      {/* Fondo moderno con elementos decorativos */}
      <div className="auth-login-background-modern">
        <div className="auth-login-circle-1"></div>
        <div className="auth-login-circle-2"></div>
        <div className="auth-login-circle-3"></div>
        <div className="auth-login-wave-decoration"></div>
      </div>

      <div className="auth-login-container">
        {/* Panel Izquierdo */}
        <div className="auth-login-left-panel">
          <div className="auth-login-logo-container">
            <img src={logoecotec2} alt="Logo ECOTEC" className="auth-login-logo" />
            <h1>¡Bienvenido de nuevo!</h1>
            <p>Conéctate, aprende y cuida el planeta</p>
          </div>
        </div>

        {/* Panel Derecho */}
        <div className="auth-login-right-panel">
          <form className="auth-login-form" onSubmit={handleSubmit}>
            <h2>Iniciar Sesión</h2>

            <div className="auth-login-input-group">
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={formValues.email}
                onChange={handleChange}
              />
              {errors.email && <span className="auth-login-error">{errors.email}</span>}
            </div>

            <div className="auth-login-input-group">
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formValues.password}
                onChange={handleChange}
              />
              {errors.password && <span className="auth-login-error">{errors.password}</span>}
            </div>

            <button type="submit" className="auth-login-btn">Entrar</button>

            <button
              type="button"
              className="auth-login-forgot-link"
              onClick={() => setShowForgotPassword(true)}
            >
              Olvidaste tu contraseña
            </button>

            {errors.general && <div className="auth-login-error-message">{errors.general}</div>}
            {successMessage && <div className="auth-login-success-message">{successMessage}</div>}

            <div className="auth-login-register-link">
              <p>¿No tienes cuenta? <a href="/registro">Regístrate</a></p>
            </div>
          </form>
        </div>

        {/* Modal recuperar contraseña */}
        {showForgotPassword && (
          <div className="auth-login-modal-overlay">
            <div className="auth-login-modal-content">
              <button
                onClick={closeForgotPasswordModal}
                className="auth-login-modal-close-btn"
              >
                ×
              </button>
              <h3>Recuperar contraseña</h3>
              <p>Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.</p>

              <form onSubmit={handleForgotPassword}>
                <div className="auth-login-input-group">
                  <input
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="Ingresa tu email"
                  />
                </div>

                {forgotPasswordMessage && (
                  <div
                    className={
                      forgotPasswordMessage.includes('enlace')
                        ? 'auth-login-success-message'
                        : 'auth-login-error-message'
                    }
                  >
                    {forgotPasswordMessage}
                  </div>
                )}

                <div className="auth-login-modal-buttons">
                  <button
                    type="button"
                    onClick={closeForgotPasswordModal}
                    className="auth-login-modal-button-cancel"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoadingForgotPassword}
                    className="auth-login-modal-button-submit"
                  >
                    {isLoadingForgotPassword ? 'Enviando...' : 'Enviar enlace'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Login;