import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  Users, UserCheck, UserX, TrendingUp, Activity, AlertCircle, CheckCircle2
} from 'lucide-react';
import '../style/DashboardCuentas.css';
import { Link } from "react-router-dom";

const DashboardCuentas = () => {
  const [totalCuentas, setTotalCuentas] = useState(0);
  const [estadoUsuarios, setEstadoUsuarios] = useState({ activos: 0, inactivos: 0 });
  const [usuarios, setUsuarios] = useState([]);
  const [tendenciaRegistros, setTendenciaRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usuariosData = response.data;
      setUsuarios(usuariosData);

      const activos = usuariosData.filter(u => u.estado === 'habilitado').length;
      const inactivos = usuariosData.filter(u => u.estado === 'deshabilitado').length;
      const total = usuariosData.length;

      setEstadoUsuarios({ activos, inactivos });
      setTotalCuentas(total);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      setError('Error al cargar usuarios');
      setLoading(false);
    }
  };

  const fetchTendencia = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users/tendencia-registros', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTendenciaRegistros(response.data);
    } catch (error) {
      console.error('Error al obtener tendencia de registros:', error);
    }
  };

  const toggleEstadoUsuario = async (id_usuario) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/api/users/${id_usuario}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        console.log('Estado actualizado:', response.data.message);
        await fetchUsuarios(); // Recargar la lista de usuarios
      }
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      setError(error.response?.data?.message || 'Error al cambiar estado del usuario');
      setTimeout(() => setError(null), 3000); // Limpiar el error después de 3 segundos
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchTendencia();
  }, []);

  const dataBarChart = [
    { estado: 'Activos', cantidad: estadoUsuarios.activos },
    { estado: 'Inactivos', cantidad: estadoUsuarios.inactivos },
  ];

  const dataPieChart = [
    { name: 'Activos', value: estadoUsuarios.activos, color: '#22C55E' },
    { name: 'Inactivos', value: estadoUsuarios.inactivos, color: '#EF4444' },
  ];

  const porcentajeActivos = totalCuentas > 0 ? ((estadoUsuarios.activos / totalCuentas) * 100).toFixed(1) : 0;
  const porcentajeInactivos = totalCuentas > 0 ? ((estadoUsuarios.inactivos / totalCuentas) * 100).toFixed(1) : 0;

  // 👉 Render label para mostrar porcentaje en la PieChart
  const renderLabel = ({ percent }) => `${(percent * 100).toFixed(0)}%`;

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="card-stats">
      <div className="stats-header">
        <div className={`icon-container ${color.bg}`}>
          <Icon className={`icon ${color.text}`} />
        </div>
        {trend !== undefined && (
          <div className={`trend-tag ${trend >= 0 ? 'trend-up' : 'trend-down'}`}>
            {trend >= 0 ? '+' : '-'}{Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <h3 className={`stat-value ${color.text}`}>{loading ? '...' : value}</h3>
        <p className="stat-title">{title}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <h2 className="dashboard1-title">Dashboard de Cuentas</h2>

        {error && (
          <div className="error-alert">
            <AlertCircle className="icon-error" />
            {error}
          </div>
        )}

        <div className="stats-grid">
          <StatCard title="Total Cuentas" value={totalCuentas} icon={Users} color={{ bg: 'bg-blue', text: 'text-blue' }} subtitle="Registradas" trend={8} />
          <StatCard title="Activas" value={estadoUsuarios.activos} icon={UserCheck} color={{ bg: 'bg-green', text: 'text-green' }} subtitle={`${porcentajeActivos}% del total`} trend={5} />
          <StatCard title="Inactivas" value={estadoUsuarios.inactivos} icon={UserX} color={{ bg: 'bg-red', text: 'text-red' }} subtitle={`${porcentajeInactivos}% del total`} trend={-2} />
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-header"><Activity className="icon-title" />Distribución de Cuentas</div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dataBarChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="estado" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cantidad" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <div className="chart-header"><CheckCircle2 className="icon-title" />Estado de Cuentas</div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={dataPieChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={renderLabel}
                >
                  {dataPieChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card full">
          <div className="chart-header"><TrendingUp className="icon-title" />Tendencia de Registros</div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={tendenciaRegistros}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="registros" stroke="#8B5CF6" fill="#DDD6FE" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card full">
          <div className="chart-header"><Users className="icon-title" />Listado de Usuarios</div>
          <div className="table-responsive">
            <table className="table-usuarios">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Celular</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id_usuario}>
                    <td>{usuario.id_usuario}</td>
                    <td>{usuario.nombre} {usuario.apellido}</td>
                    <td>{usuario.email}</td>
                    <td>{usuario.celular}</td>
                    <td>{usuario.estado}</td>
                    <td>
                     <div className="acciones">
                        <button
                            className={`btn-estado ${usuario.estado === 'habilitado' ? 'btn-inactivo' : 'btn-activo'}`}
                            onClick={() => toggleEstadoUsuario(usuario.id_usuario)}
                            title={usuario.estado === 'habilitado' ? 'Deshabilitar usuario' : 'Habilitar usuario'}
                        >
                            {usuario.estado === 'habilitado' ? 'Deshabilitar' : 'Habilitar'}
                        </button>
                     </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
        {/* 🔹 Botón para volver */}
    <div className="back-to-dashboard4">
<Link to="/dashboardadmi">← Volver a mi cuenta</Link>
    </div>
  </div>

  );
};

export default DashboardCuentas;
