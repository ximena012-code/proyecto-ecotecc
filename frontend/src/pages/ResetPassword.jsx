// src/pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/Carrito.css';
import '../style/ResetPassword.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}:;<>,.?~\-=/\\|[\]]).+$/;
  const tildesYÑ = /[áéíóúÁÉÍÓÚñÑ]/;
  const hasXSSAttempt = (str) => /[<>"'&/]/.test(str);

  const validate = () => {
    const newErrors = {};

    if (!formValues.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formValues.password.length < 8) {
      newErrors.password = 'La contraseña debe tener mínimo 8 caracteres.';
    } else if (/\s/.test(formValues.password)) {
      newErrors.password = 'La contraseña no puede contener espacios.';
    } else if (tildesYÑ.test(formValues.password)) {
      newErrors.password = 'La contraseña no debe contener tildes ni la letra ñ.';
    } else if (hasXSSAttempt(formValues.password)) {
      newErrors.password = 'La contraseña contiene caracteres no permitidos: < > " \' & /';
    } else if (!passwordRegex.test(formValues.password)) {
      newErrors.password = 'Debe contener mayúscula, minúscula, número y símbolo.';
    }

    if (formValues.password !== formValues.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setMessage('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/reset-password', {
        token,
        nuevaPassword: formValues.password
      });

      setMessage(res.data.message);

      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error al restablecer la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Fondo y burbujas animadas */}
      <div className="reset-password-background" />
      <div className="reset-password-circle-1" />
      <div className="reset-password-circle-2" />
      <div className="reset-password-circle-3" />

      <h2 className="reset-password-title">Restablecer contraseña</h2>
      <div className="reset-password-container">
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <form
            onSubmit={handleSubmit}
            style={{
              background: 'rgba(255,255,255,0.85)',
              padding: '2.5rem',
              borderRadius: '24px',
              boxShadow: '0 8px 32px rgba(30,58,95,0.08)',
              border: '1px solid rgba(255,255,255,0.4)',
              width: '100%',
              maxWidth: '380px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.2rem',
            }}
          >
            <input
              type="password"
              name="password"
              placeholder="Nueva contraseña"
              value={formValues.password}
              onChange={handleChange}
              className="carritoX-item-info"
              style={{
                width: '100%',
                padding: '0.875rem 1.25rem',
                border: '1.5px solid #d1f2f0',
                borderRadius: '16px',
                fontSize: '0.95rem',
                color: '#1e3a5f',
                backgroundColor: 'rgba(240,253,252,0.8)',
                fontWeight: 400,
              }}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar nueva contraseña"
              value={formValues.confirmPassword}
              onChange={handleChange}
              className="carritoX-item-info"
              style={{
                width: '100%',
                padding: '0.875rem 1.25rem',
                border: '1.5px solid #d1f2f0',
                borderRadius: '16px',
                fontSize: '0.95rem',
                color: '#1e3a5f',
                backgroundColor: 'rgba(240,253,252,0.8)',
                fontWeight: 400,
              }}
            />
            <button
              type="submit"
              className="carritoX-btn-comprar"
              disabled={isLoading}
              style={{ marginTop: '0.5rem' }}
            >
              {isLoading ? 'Procesando...' : 'Actualizar contraseña'}
            </button>
          </form>
        </div>

        {/* Mensajes de validación */}
        {errors.password && (
          <div className="carritoX-carrito-error">
            {errors.password}
          </div>
        )}
        {errors.confirmPassword && (
          <div className="carritoX-carrito-error">
            {errors.confirmPassword}
          </div>
        )}

        {/* Mensaje de respuesta del servidor */}
        {message && (
          <div className={
            message.includes('actualizado') || message.includes('exitosamente') || message.includes('éxito') || message.includes('correctamente')
              ? 'carritoX-resumen'
              : 'carritoX-carrito-error'
          } style={{ maxWidth: 380, margin: '1.25rem auto 0', width: '100%' }}>
            {message}
          </div>
        )}
      </div>
    </>
  );
};

export default ResetPassword;