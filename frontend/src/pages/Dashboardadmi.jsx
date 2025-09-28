// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Link } from 'react-router-dom';
import '../style/Dashboardadmi.css';
import CerrarSesion from '../components/CerrarSesion';

const Dashboardadmi = () => {
  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-wrapper">
        {/* Header */}
        <div className="admin-dashboard-header">
          <h2 className="admin-dashboard-title">ADMINISTRADOR</h2>
          <div className="admin-dashboard-divider"></div>
        </div>

        {/* Grid de Cards */}
        <div className="admin-dashboard-grid">
          <Link to="/productos" className="admin-dashboard-card">
            <div className="admin-dashboard-card-icon">
              <i className="bi bi-laptop"></i>
            </div>
            <h5 className="admin-dashboard-card-title">Productos</h5>
            <p className="admin-dashboard-card-description">
              Gestiona tus productos
            </p>
          </Link>

          <Link to="/cuentas-registradas" className="admin-dashboard-card">
            <div className="admin-dashboard-card-icon">
              <i className="bi bi-people-fill"></i>
            </div>
            <h5 className="admin-dashboard-card-title">Cuentas Registradas</h5>
            <p className="admin-dashboard-card-description">
              Administra usuarios
            </p>
          </Link>

          <Link to="/ventas" className="admin-dashboard-card">
            <div className="admin-dashboard-card-icon">
              <i className="bi bi-database-fill-up"></i>
            </div>
            <h5 className="admin-dashboard-card-title">Ventas del Mes</h5>
            <p className="admin-dashboard-card-description">
              Consulta reportes de ventas
            </p>
          </Link>

          <Link to="/estado-reparacion" className="admin-dashboard-card">
            <div className="admin-dashboard-card-icon">
              <i className="bi bi-house-gear-fill"></i>
            </div>
            <h5 className="admin-dashboard-card-title">Estado de Reparaciones</h5>
            <p className="admin-dashboard-card-description">
              Monitorea reparaciones
            </p>
          </Link>

          <Link to="/calificaciones" className="admin-dashboard-card">
            <div className="admin-dashboard-card-icon">
              <i className="bi bi-star-fill"></i>
            </div>
            <h5 className="admin-dashboard-card-title">Calificaciones</h5>
            <p className="admin-dashboard-card-description">
              Revisa opiniones
            </p>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Dashboardadmi;