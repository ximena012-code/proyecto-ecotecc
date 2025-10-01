import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Calendar, Star, Users, ThumbsUp } from 'lucide-react';
import '../style/Calificaciones.css';
import { Link } from "react-router-dom";

const Calificaciones = () => {
  const [timeFilter, setTimeFilter] = useState('dia');
  const [ratingsData, setRatingsData] = useState([]);
  const [summary, setSummary] = useState({
    totalRatings: 0,
    avgRating: 0,
    excellenceRate: 0
  });
  const [loading, setLoading] = useState(true);

  // Genera los labels según el filtro
  const getLabels = () => {
    const labels = [];
    const now = new Date();
    if (timeFilter === 'dia') {
      for (let h = 0; h < 24; h++) {
        labels.push(`${h.toString().padStart(2, '0')}:00`);
      }
    } else if (timeFilter === 'semana') {
      // Últimos 7 días
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        labels.push(d.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: '2-digit' }));
      }
    } else if (timeFilter === 'mes') {
      // Últimos 30 días
      for (let i = 30; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        labels.push(d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }));
      }
    } else if (timeFilter === 'año') {
      // Últimos 12 meses
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(now.getMonth() - i);
        labels.push(d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }));
      }
    }
    return labels;
  };

  // Combina los datos recibidos con los labels generados
  const mergeDataWithLabels = (labels, data) => {
    const dataMap = {};
    data.forEach(item => {
      dataMap[item.period] = item;
    });
    return labels.map(label => ({
      period: label,
      avgRating: dataMap[label]?.avgRating || 0,
      count: dataMap[label]?.count || 0
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsResponse, summaryResponse] = await Promise.all([
          axios.get(`https://ecotec-backend.onrender.com/api/pedidos/ratings-stats?periodo=${timeFilter}`),
          axios.get(`https://ecotec-backend.onrender.com/api/pedidos/ratings-summary?periodo=${timeFilter}`)
        ]);

        const processedData = statsResponse.data.map(item => ({
          period: formatPeriod(item.periodo, timeFilter),
          avgRating: Number(item.avgRating).toFixed(2),
          count: item.count
        }));

        // Genera los labels y combina
        const labels = getLabels();
        const mergedData = mergeDataWithLabels(labels, processedData);

        setRatingsData(mergedData);
        setSummary({
          totalRatings: summaryResponse.data.totalRatings || 0,
          avgRating: Number(summaryResponse.data.avgRating || 0).toFixed(2),
          excellenceRate: Number(summaryResponse.data.excellenceRate || 0).toFixed(1)
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line
  }, [timeFilter]);

 const formatPeriod = (periodo, filter) => {
    // Si el periodo es inválido, no hagas nada.
    if (!periodo) return '';

    // Convertimos el 'periodo' que viene del backend a un objeto Date.
    const date = new Date(periodo);

    // Si la fecha no es válida, devolvemos un string vacío.
    if (isNaN(date.getTime())) {
      return '';
    }

    // AHORA SÍ, formateamos según el filtro.
    switch (filter) {
      case 'dia':
        // Extrae la hora y la formatea como "HH:00".
        const hour = date.getHours();
        return `${String(hour).padStart(2, '0')}:00`;
      
      case 'semana':
        return date.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: '2-digit' });
      
      case 'mes':
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      
      case 'año':
        // Para 'año', el backend envía 'YYYY-MM', necesitamos ajustarlo para que Date lo entienda.
        { const [year, month] = String(periodo).split('-');
        const yearDate = new Date(year, month - 1);
        return yearDate.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }); }
      
      default:
        return periodo;
    }
  };

  const getTitle = () => {
    switch (timeFilter) {
      case 'dia': return 'Calificaciones por Hora (Hoy)';
      case 'semana': return 'Calificaciones por Día (Última Semana)';
      case 'mes': return 'Calificaciones por Día (Último Mes)';
      case 'año': return 'Calificaciones por Mes (Último Año)';
      default: return 'Calificaciones';
    }
  };

  const getPeriodInfo = () => {
    switch (timeFilter) {
      case 'dia': return '24 horas';
      case 'semana': return '7 días';
      case 'mes': return '30 días';
      case 'año': return '12 meses';
      default: return '';
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#10B981';
    if (rating >= 4.0) return '#3B82F6';
    if (rating >= 3.5) return '#F59E0B';
    if (rating >= 3.0) return '#EF4444';
    return '#6B7280';
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <h1 className="dashboard-title">
          
          Dashboard de Calificaciones
        </h1>

        <div className="period-filter">
          <Calendar style={{ width: '1.5rem', height: '1.5rem', color: '#003366' }} />
          <span style={{ color: '#003366' }}>Periodo:</span>
          {['dia', 'semana', 'mes', 'año'].map((key) => (
            <button
              key={key}
              className={`period-button ${timeFilter === key ? 'active' : ''}`}
              onClick={() => setTimeFilter(key)}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>

        <div className="stats-grid">
          <div className="card1-stats">
            <div className="stats-header">
              <Star style={{ color: '#003366' }} />
            </div>
            <div>
              <h2 className="stat-value">{summary.avgRating}/5.0</h2>
              <p className="stat-label">Calificación Promedio</p>
              <small className="stat-period">{getPeriodInfo()}</small>
            </div>
          </div>

          <div className="card1-stats">
            <div className="stats-header">
              <Users style={{ color: '#003366' }} />
            </div>
            <div>
              <h2 className="stat-value">{summary.totalRatings.toLocaleString()}</h2>
              <p className="stat-label">Total Evaluaciones</p>
              <small className="stat-period">{getPeriodInfo()}</small>
            </div>
          </div>

          <div className="card1-stats">
            <div className="stats-header">
              <ThumbsUp style={{ color: '#003366' }} />
            </div>
            <div>
              <h2 className="stat-value">{summary.excellenceRate}%</h2>
              <p className="stat-label">Índice de Excelencia</p>
              <small className="stat-period">{getPeriodInfo()}</small>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">{getTitle()}</h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={ratingsData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <defs>
                <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#003366" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#003366" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="period" 
                fontSize={12} 
                angle={timeFilter === 'mes' ? -45 : 0} 
                textAnchor={timeFilter === 'mes' ? 'end' : 'middle'} 
                height={timeFilter === 'mes' ? 80 : 60} 
                stroke="#6b7280" 
              />
              <YAxis 
                fontSize={12} 
                domain={[0, 5]}
                tickFormatter={(value) => `${value.toFixed(1)}`}
                stroke="#6b7280" 
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Area 
                type="monotone"
                dataKey="avgRating" 
                stroke="#003366"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRating)"
                name="Calificación Promedio"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
        {/* 🔹 Botón para volver */}
    <div className="back-to-dashboard7">
<Link to="/dashboardadmi">← Volver a mi cuenta</Link>
    </div>
    </div>
  );
};

export default Calificaciones;