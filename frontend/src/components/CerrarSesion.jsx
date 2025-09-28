import React from 'react';
import { useNavigate } from 'react-router-dom';

const CerrarSesion = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <button onClick={handleLogout} className="btn-cerrar-sesion">
      Cerrar sesión
    </button>
  );
};

export default CerrarSesion;
