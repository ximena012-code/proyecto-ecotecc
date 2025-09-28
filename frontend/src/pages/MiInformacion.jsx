import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../style/Informacion.css';
import { Link } from "react-router-dom";
const MiInformacion = () => {
  const [userInfo, setUserInfo] = useState({
    nombre: '',
    apellido: '',
    email: '',
    celular: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Información de sesión no disponible. Inicia sesión nuevamente.');
        setLoading(false);
        return;
      }

      const response = await axios.get('https://ecotec-backend.onrender.com/api/users/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setUserInfo(response.data);
      setEditForm(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error al cargar los datos del usuario.');
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditForm({ ...userInfo });
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setError('');
    setSuccessMessage('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setError('');
    setSuccessMessage('');

    const token = localStorage.getItem('token');
    const newErrors = [];

    // Validaciones
    if (/^\s/.test(editForm.nombre)) {
      newErrors.push('El nombre no debe comenzar con espacios.');
    }

    if (/^\s/.test(editForm.apellido)) {
      newErrors.push('El apellido no debe comenzar con espacios.');
    }

    const tildesYñ = /[ñÑáéíóúÁÉÍÓÚ]/;
    const caracteresProhibidos = /[<>'"&\\/]/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[\x20-\x7E]{8,}$/;

    if (passwords.newPassword || passwords.confirmPassword || passwords.currentPassword) {
      if (passwords.newPassword !== passwords.confirmPassword) {
        newErrors.push('La nueva contraseña y su confirmación no coinciden.');
      }

      if (/\s/.test(passwords.newPassword)) {
        newErrors.push('La contraseña no puede contener espacios.');
      }

      if (tildesYñ.test(passwords.newPassword)) {
        newErrors.push('La contraseña no debe contener tildes ni la letra ñ.');
      }

      if (caracteresProhibidos.test(passwords.newPassword)) {
        newErrors.push('La contraseña contiene caracteres no permitidos: < > " \' & /');
      }

      if (!passwordRegex.test(passwords.newPassword)) {
        newErrors.push('La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo.');
      }
    }

    if (newErrors.length > 0) {
      setError(newErrors.join(' '));
      return;
    }

    try {
      await axios.put('https://ecotec-backend.onrender.com/api/users/update', editForm, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (passwords.currentPassword && passwords.newPassword) {
        await axios.put('https://ecotec-backend.onrender.com/api/users/update-password', {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      setUserInfo(editForm);
      setIsEditing(false);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccessMessage('Información actualizada correctamente');
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al guardar la información';
      setError(msg);
    }
  };

  const handleCancel = () => {
    setEditForm({ ...userInfo });
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsEditing(false);
    setError('');
    setSuccessMessage('');
  };

  if (loading) return <div className="loading">Cargando información...</div>;

    return (
      <div className="informacion-wrapper">
      <div className="mi-informacion-container">
        <div className="mi-informacion-card">
          <h2>Mi Información</h2>

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <div className="info-section">
            {[
              { label: 'Nombre', name: 'nombre' },
              { label: 'Apellido', name: 'apellido' },
              { label: 'Correo', name: 'email' },
              { label: 'Celular', name: 'celular' },
            ].map(({ label, name }) => (
              <div className="info-field" key={name}>
                <label>{label}:</label>
                <div className="field-value">
                  {isEditing && name === 'email' ? (
                    <input type="email" name="email" value={editForm.email || ''} disabled />
                  ) : isEditing && name === 'celular' ? (
                    <input type="tel" name="celular" value={editForm.celular || ''} disabled />
                  ) : isEditing ? (
                    <input
                      type="text"
                      name={name}
                      value={editForm[name] || ''}
                      onChange={handleInputChange}
                      placeholder={`Ingresa tu ${label.toLowerCase()}`}
                    />
                  ) : (
                    <span>{userInfo[name] || 'No especificado'}</span>
                  )}
                </div>
              </div>
            ))}

            {!isEditing && (
              <div className="info-field">
                <label>Contraseña:</label>
                <div className="field-value"><span>*************</span></div>
              </div>
            )}

            {isEditing && (
              <>
                <div className="info-field">
                  <label>Contraseña actual:</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Contraseña actual"
                  />
                </div>

                <div className="info-field">
                  <label>Nueva contraseña:</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nueva contraseña"
                  />
                </div>

                <div className="info-field">
                  <label>Confirmar nueva contraseña:</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirmar contraseña"
                  />
                </div>
              </>
            )}
          </div>

          <div className="button-container">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="save-btn">Guardar</button>
                <button onClick={handleCancel} className="cancel-btn">Cancelar</button>
              </>
            ) : (
              <button onClick={handleEditToggle} className="edit-btn">Actualizar</button>
            )}
          </div>
        </div>
        <div className="back-to-dashboard">
          <Link to="/dashboard">← Volver a mi cuenta</Link>
        </div>
      </div>
    </div>
    );
};

export default MiInformacion;
