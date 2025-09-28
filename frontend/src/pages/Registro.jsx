import React, { useState } from 'react';
import '../style/Registro.css';
import axios from 'axios';
import logoCirculo from '../assets/mi-logo.png';

const Registro = () => {
  const [formValues, setFormValues] = useState({
    nombre: '',
    apellido: '',
    email: '',
    celular: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => setTermsAccepted(e.target.checked);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formValues.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    else if (/^\s/.test(formValues.nombre)) newErrors.nombre = 'El nombre no debe iniciar con espacios';

    if (!formValues.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
    else if (/^\s/.test(formValues.apellido)) newErrors.apellido = 'El apellido no debe iniciar con espacios';

    if (!formValues.email.trim()) newErrors.email = 'El correo es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(formValues.email))
      newErrors.email = 'El correo debe tener un formato válido y terminar con al menos dos letras';

    if (!formValues.celular.trim()) newErrors.celular = 'El teléfono es requerido';
    else if (/\s/.test(formValues.celular)) newErrors.celular = 'El número de celular no puede contener espacios';
    else if (!/^3\d{9}$/.test(formValues.celular)) newErrors.celular = 'Debe tener 10 dígitos y comenzar con 3';

    const tildesYÑ = /[ñÑáéíóúÁÉÍÓÚ]/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!-/:-@[-`{-~])[A-Za-z\d!-/:-@[-`{-~]{8,}$/;
    const hasXSSAttempt = (input) => /[<>'"&\\/]/.test(input);

    if (!formValues.password) newErrors.password = 'La contraseña es requerida';
    else if (formValues.password.length < 8) newErrors.password = 'La contraseña debe tener mínimo 8 caracteres.';
    else if (/\s/.test(formValues.password)) newErrors.password = 'La contraseña no puede contener espacios.';
    else if (tildesYÑ.test(formValues.password)) newErrors.password = 'La contraseña no debe contener tildes ni la letra ñ.';
    else if (hasXSSAttempt(formValues.password)) newErrors.password = 'La contraseña contiene caracteres no permitidos: < > " \' & /';
    else if (!passwordRegex.test(formValues.password)) newErrors.password = 'Debe contener mayúscula, minúscula, número y símbolo.';

    if (formValues.password !== formValues.confirmPassword)
      newErrors.confirmPassword = 'Las contraseñas no coinciden';

    if (!termsAccepted) newErrors.termsAccepted = 'Debe aceptar los términos y condiciones';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const userData = {
        nombre: formValues.nombre.trim(),
        apellido: formValues.apellido.trim(),
        email: formValues.email.trim(),
        celular: formValues.celular.trim(),
        password: formValues.password
      };

      await axios.post('http://localhost:5000/api/auth/register', userData);

      setSuccessMessage('¡Registro exitoso! Ahora debes iniciar sesión.');
      setFormValues({ nombre: '', apellido: '', email: '', celular: '', password: '', confirmPassword: '' });
      setErrors({});
      setTermsAccepted(false);
    } catch (error) {
      const mensaje = error.response?.data?.message || 'Hubo un problema al registrar. Intente nuevamente.';
      if (mensaje.toLowerCase().includes('correo')) setErrors({ email: mensaje });
      else if (mensaje.toLowerCase().includes('celular')) setErrors({ celular: mensaje });
      else if (mensaje.toLowerCase().includes('contraseña')) setErrors({ password: mensaje });
      else setErrors({ submit: mensaje });
    }
  };

  return (
    <div className="registro-fondo">
      <div className="circulo-principal" />
      <div className="circulo-secundario" />

      <div className="contenedor-principal">
        <div className="panel-izquierdo">
          <div className="contenido-info">
           <h1 className="titulo-principal">
              <img src={logoCirculo} alt="Logo Círculo" className="logo-principal" />
            </h1>
            <h2 className="subtitulo-principal">¡Bienvenido a nuestra plataforma!</h2>
            <p className="descripcion">
             En ECOTEC movemos tecnología y conciencia. Cada dispositivo recuperado es un paso hacia un mundo más limpio.
            Únete, conecta, aprende y ayuda al planeta..
            </p>
            <div className="iconos-container">
              <div className="icono icono-1">✓</div>
              <div className="icono icono-2">🔒</div>
              <div className="icono icono-3">👥</div>
            </div>
           
          </div>
        </div>

        <div className="panel-derecho">
          <div className="formulario-header">
            <h2>Registrate</h2>
            <p className="subtitulo">Completa los siguientes campos para registrarte</p>
          </div>

          <form onSubmit={handleSubmit} className="formulario" noValidate>
            <div className="fila-inputs">
              <div className="input-group">
                <label className="label-moderno" htmlFor="nombre">Nombre</label>
                <input
                  id="nombre"
                  type="text"
                  name="nombre"
                  placeholder="Tu nombre"
                  value={formValues.nombre}
                  onChange={handleChange}
                  className="input-moderno"
                  autoComplete="given-name"
                  aria-invalid={!!errors.nombre}
                />
                {errors.nombre && <span className="error-text">{errors.nombre}</span>}
              </div>

              <div className="input-group">
                <label className="label-moderno" htmlFor="apellido">Apellido</label>
                <input
                  id="apellido"
                  type="text"
                  name="apellido"
                  placeholder="Tu apellido"
                  value={formValues.apellido}
                  onChange={handleChange}
                  className="input-moderno"
                  autoComplete="family-name"
                  aria-invalid={!!errors.apellido}
                />
                {errors.apellido && <span className="error-text">{errors.apellido}</span>}
              </div>
            </div>

            <div className="input-group-full">
              <label className="label-moderno" htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="tu@email.com"
                value={formValues.email}
                onChange={handleChange}
                className="input-moderno-full"
                autoComplete="email"
                aria-invalid={!!errors.email}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="input-group-full">
              <label className="label-moderno" htmlFor="celular">Celular</label>
              <input
                id="celular"
                type="tel"
                name="celular"
                placeholder="3001234567"
                value={formValues.celular}
                onChange={handleChange}
                className="input-moderno-full"
                inputMode="numeric"
                autoComplete="tel"
                aria-invalid={!!errors.celular}
              />
              {errors.celular && <span className="error-text">{errors.celular}</span>}
            </div>

            <div className="fila-inputs">
              <div className="input-group">
                <label className="label-moderno" htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Tu contraseña"
                  value={formValues.password}
                  onChange={handleChange}
                  className="input-moderno"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="input-group">
                <label className="label-moderno" htmlFor="confirmPassword">Confirmar contraseña</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Repite tu contraseña"
                  value={formValues.confirmPassword}
                  onChange={handleChange}
                  className="input-moderno"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className="checkbox-moderno">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                checked={termsAccepted}
                onChange={handleCheckboxChange}
                className="checkbox-input"
              />
              <label htmlFor="terms" className="checkbox-label">
                Acepto los términos y condiciones de uso y política de privacidad
              </label>
            </div>
            {errors.termsAccepted && <span className="error-text">{errors.termsAccepted}</span>}

            <button type="submit" className="btn-registro">
              Crear cuenta
            </button>

            {errors.submit && <div className="error-message" role="alert">{errors.submit}</div>}
            {successMessage && <div className="success-message" role="status" aria-live="polite">{successMessage}</div>}

            <div className="login-link">
              <p>¿Ya tienes cuenta? <a href="/login">Inicia sesión</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registro;
