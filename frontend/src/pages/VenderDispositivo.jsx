import React, { useState } from 'react';
import { Smartphone, Camera, Upload, CheckCircle, AlertCircle, DollarSign, Shield, Clock } from 'lucide-react';
import '../style/VenderDispositivo.css';
import { useAuth } from "../context/AuthContext";

const VenderDispositivo = () => {
  const { user } = useAuth(); 
  const [formData, setFormData] = useState({
    nombreDispositivo: '',
    marca: '',
    modelo: '',
    estado: '',
    descripcion: '',
    contacto: '',
    imagen: null
  });
  
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

    // 🔒 Bloquear a los admins
  if (user?.rol === "admin") {
    return (
      <div className="vender-container">
        <div className="vender-auth-warning">
          <AlertCircle className="vender-error-icon" />
          <p>
            Los administradores no pueden vender dispositivos.  
            Este servicio está habilitado solo para usuarios registrados.
          </p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imagen: file
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombreDispositivo.trim()) {
      newErrors.nombreDispositivo = 'El nombre del dispositivo es requerido';
    }
    
    if (!formData.marca.trim()) {
      newErrors.marca = 'La marca es requerida';
    }
    
    if (!formData.modelo.trim()) {
      newErrors.modelo = 'El modelo es requerido';
    }
    
    if (!formData.estado) {
      newErrors.estado = 'Selecciona el estado del dispositivo';
    }
    
    if (!formData.contacto.trim()) {
      newErrors.contacto = 'El contacto es requerido';
    }
    
    return newErrors;
  };

  const isAuthenticated = !!localStorage.getItem("token"); // O usa tu contexto de auth

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setFormData({
        nombreDispositivo: '',
        marca: '',
        modelo: '',
        estado: '',
        descripcion: '',
        contacto: '',
        imagen: null
      });
      setErrors({});
      return;
    }
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true); // <-- Mostrar spinner
      const formDataToSend = new FormData();
      formDataToSend.append('nombreDispositivo', formData.nombreDispositivo);
      formDataToSend.append('marca', formData.marca);
      formDataToSend.append('modelo', formData.modelo);
      formDataToSend.append('estado', formData.estado);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('contacto', formData.contacto);
      if (formData.imagen) {
        formDataToSend.append('imagen', formData.imagen);
      }

      try {
        await fetch('http://localhost:5000/api/ventas/vender', {
          method: 'POST',
          body: formDataToSend,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            nombreDispositivo: '',
            marca: '',
            modelo: '',
            estado: '',
            descripcion: '',
            contacto: '',
            imagen: null
          });
        }, 3000);
      } catch (error) {
        alert('Error enviando el formulario');
      } finally {
        setIsLoading(false); // <-- Ocultar spinner
      }
    } else {
      setErrors(newErrors);
    }
  };

  if (submitted) {
    return (
      <div className="vender-container">
        <div className="vender-success-container">
          <CheckCircle className="vender-success-icon" />
          <h2 className="vender-success-title">¡Formulario enviado exitosamente!</h2>
          <p className="vender-success-message">
            Hemos recibido la información de tu dispositivo. Nos pondremos en contacto contigo pronto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="vender-page-container">
      {/* Hero Section */}
      <div className="vender-hero-section">
        <div className="vender-hero-overlay"></div>
        <div className="vender-hero-content">

          <h1 className="vender-hero-title">
            Vende tu <span className="vender-gradient-text">Dispositivo</span>
          </h1>
          <p className="vender-hero-subtitle">
            ¿Tienes un dispositivo que ya no usas? ¡Véndelo con nosotros y dale una segunda vida!
            Proceso rápido, seguro y con la mejor valoración del mercado.
          </p>
          <div className="vender-hero-badge">
            <DollarSign className="vender-badge-icon" />
            <span>Obtén dinero por tu dispositivo</span>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="vender-benefits-section">
        <div className="vender-container">
          <div className="vender-benefits-grid">
            <div className="vender-benefit-card">
              <Shield className="vender-benefit-icon" />
              <h3>Proceso Seguro</h3>
              <p>Transacciones 100% seguras con garantía</p>
            </div>
            <div className="vender-benefit-card">
              <Clock className="vender-benefit-icon" />
              <h3>Respuesta Rápida</h3>
              <p>Te contactamos en menos de 24 horas</p>
            </div>
            <div className="vender-benefit-card">
              <DollarSign className="vender-benefit-icon" />
              <h3>Mejor Precio</h3>
              <p>Valoración justa según el estado del dispositivo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="vender-form-section">
        <div className="vender-container">
          <div className="vender-section-header">
            <h2 className="vender-section-title">Información del Dispositivo</h2>
            <p className="vender-section-subtitle">
              Llena el siguiente formulario con los datos de tu dispositivo
            </p>
          </div>

          <div className="vender-form">
            <div className="vender-form-grid">
              {/* Nombre del dispositivo */}
              <div className="vender-form-group">
                <label className="vender-label">Nombre del dispositivo *</label>
                <input
                  type="text"
                  name="nombreDispositivo"
                  value={formData.nombreDispositivo}
                  onChange={handleInputChange}
                  placeholder="Ej: iPhone 14 Pro Max"
                  className={`vender-input ${errors.nombreDispositivo ? 'vender-input-error' : ''}`}
                />
                {errors.nombreDispositivo && (
                  <span className="vender-error-text">
                    <AlertCircle className="vender-error-icon" />
                    {errors.nombreDispositivo}
                  </span>
                )}
              </div>

              {/* Marca */}
              <div className="vender-form-group">
                <label className="vender-label">Marca *</label>
                <select
                  name="marca"
                  value={formData.marca}
                  onChange={handleInputChange}
                  className={`vender-input ${errors.marca ? 'vender-input-error' : ''}`}
                >
                  <option value="">Seleccionar marca</option>
                  <option value="Apple">Apple</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Huawei">Huawei</option>
                  <option value="Xiaomi">Xiaomi</option>
                  <option value="OnePlus">OnePlus</option>
                  <option value="Google">Google</option>
                  <option value="Otra">Otra</option>
                </select>
                {errors.marca && (
                  <span className="vender-error-text">
                    <AlertCircle className="vender-error-icon" />
                    {errors.marca}
                  </span>
                )}
              </div>

              {/* Modelo */}
              <div className="vender-form-group">
                <label className="vender-label">Modelo *</label>
                <input
                  type="text"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleInputChange}
                  placeholder="Ej: A2894"
                  className={`vender-input ${errors.modelo ? 'vender-input-error' : ''}`}
                />
                {errors.modelo && (
                  <span className="vender-error-text">
                    <AlertCircle className="vender-error-icon" />
                    {errors.modelo}
                  </span>
                )}
              </div>

              {/* Estado */}
              <div className="vender-form-group">
                <label className="vender-label">Estado del dispositivo *</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  className={`vender-input ${errors.estado ? 'vender-input-error' : ''}`}
                >
                  <option value="">Seleccionar estado</option>
                  <option value="Nuevo">Nuevo (sin usar)</option>
                  <option value="Excelente">Excelente (mínimas señales de uso)</option>
                  <option value="Bueno">Bueno (ligeras marcas de uso)</option>
                  <option value="Regular">Regular (marcas visibles pero funcional)</option>
                  <option value="Para repuestos">Para repuestos</option>
                </select>
                {errors.estado && (
                  <span className="vender-error-text">
                    <AlertCircle className="vender-error-icon" />
                    {errors.estado}
                  </span>
                )}
              </div>

              {/* Contacto */}
              <div className="vender-form-group">
                <label className="vender-label">Contacto *</label>
                <input
                  type="text"
                  name="contacto"
                  value={formData.contacto}
                  onChange={handleInputChange}
                  placeholder="Teléfono o email"
                  className={`vender-input ${errors.contacto ? 'vender-input-error' : ''}`}
                />
                {errors.contacto && (
                  <span className="vender-error-text">
                    <AlertCircle className="vender-error-icon" />
                    {errors.contacto}
                  </span>
                )}
              </div>

              {/* Imagen */}
              <div className="vender-form-group">
                <label className="vender-label">Imagen del dispositivo</label>
                <div className="vender-upload-container">
                  <input
                    type="file"
                    id="imagen"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="vender-file-input"
                  />
                  <label htmlFor="imagen" className="vender-upload-label">
                    <Upload className="vender-upload-icon" />
                    <span>
                      {formData.imagen ? formData.imagen.name : 'Subir imagen'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Descripción - ancho completo */}
            <div className="vender-form-group">
              <label className="vender-label">Descripción adicional</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Describe el estado general, incluye accesorios originales, etc."
                rows={4}
                className="vender-textarea"
              />
            </div>

            <button type="button" onClick={handleSubmit} className="vender-submit-button" disabled={isLoading}>
              {isLoading ? "Enviando..." : <>
                <Smartphone className="vender-button-icon" />
                Enviar información
              </>}
            </button>

            {!isAuthenticated && (
              <div className="vender-auth-warning">
                <AlertCircle className="vender-error-icon" />
                <span>Debes iniciar sesión para enviar la solicitud.</span>
                <a href="/login" className="vender-login-link">Iniciar sesión</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenderDispositivo;