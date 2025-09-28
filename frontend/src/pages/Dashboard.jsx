import React from 'react';
import { Link } from 'react-router-dom';
import '../style/Dashboard.css';
import CerrarSesion from '../components/CerrarSesion';

const UserDashboard = () => {
  return (
    <div className="accountdash-container">
      <div className="accountdash-wrapper">
        {/* Header */}
        <div className="accountdash-header">
          <h2 className="accountdash-title">SU CUENTA</h2>
          <div className="accountdash-divider"></div>
        </div>

        {/* Grid de Cards */}
        <div className="accountdash-grid">
          <Link to="/mi-informacion" className="accountdash-card">
            <div className="accountdash-card-icon">
              <i className="bi bi-person-gear"></i>
            </div>
            <h5 className="accountdash-card-title">Mi información</h5>
            <p className="accountdash-card-description">Gestiona tus datos personales</p>
          </Link>

          <Link to="/detalle-pedido" className="accountdash-card">
            <div className="accountdash-card-icon">
              <i className="bi bi-calendar-week"></i>
            </div>
            <h5 className="accountdash-card-title">Detalles de pedido</h5>
            <p className="accountdash-card-description">Consulta el estado de tus compras</p>
          </Link>

          <Link to="/favoritos" className="accountdash-card">
            <div className="accountdash-card-icon">
              <i className="bi bi-star"></i>
            </div>
            <h5 className="accountdash-card-title">Mis favoritos</h5>
            <p className="accountdash-card-description">Accede a tus productos guardados</p>
          </Link>

          <Link to="/historial-facturas" className="accountdash-card">
            <div className="accountdash-card-icon">
              <i className="bi bi-receipt-cutoff"></i>
            </div>
            <h5 className="accountdash-card-title">Historial de facturas</h5>
            <p className="accountdash-card-description">Revisa tus facturas anteriores</p>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default UserDashboard;