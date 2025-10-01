import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, Package, DollarSign } from 'lucide-react';
import { format, subDays, subMonths, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { format as formatTZ } from 'date-fns-tz';
import '../style/Ventas.css';

const Ventas = () => {
  const [timeFilter, setTimeFilter] = useState('dia');
  const [ventasData, setVentasData] = useState([]);
  const [resumenVentas, setResumenVentas] = useState({
    totalVentas: 0,
    totalUnidades: 0,
    promedioPeriodo: 0,
    numeroPeriodos: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para generar todos los períodos necesarios
  const generateCompletePeriods = (filter) => {
    const periods = [];
    const now = new Date();
    const timeZone = 'America/Bogota';
    
    switch (filter) {
      case 'dia': {
        // Generar las últimas 24 horas
        for (let i = 23; i >= 0; i--) {
          const date = new Date(now);
          date.setHours(now.getHours() - i, 0, 0, 0);
          periods.push({
            date: date,
            label: formatTZ(date, 'HH:mm', { timeZone })
          });
        }
        break;
      }
      case 'semana': {
        // Generar los últimos 7 días
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          date.setHours(0, 0, 0, 0);
          periods.push({
            date: date,
            label: formatTZ(date, 'EEE d', { locale: es, timeZone })
          });
        }
        break;
      }
      case 'mes': {
        // Generar los últimos 30 días
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          date.setHours(0, 0, 0, 0);
          periods.push({
            date: date,
            label: formatTZ(date, 'd MMM', { locale: es, timeZone })
          });
        }
        break;
      }
      case 'año': {
        // Generar los últimos 12 meses
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(now.getMonth() - i);
          date.setDate(1);
          date.setHours(0, 0, 0, 0);
          periods.push({
            date: date,
            label: formatTZ(date, 'MMM yyyy', { locale: es, timeZone })
          });
        }
        break;
      }
      default:
        break;
    }
    
    return periods;
  };

  // Función auxiliar para obtener la clave de datos según el período
  const getDataKey = (dateInput, filter) => {
    if (!dateInput) return null;
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(date.getTime())) return null;
    switch (filter) {
      case 'dia':
        // año-mes-día-hora (mes desde 1, sin ceros a la izquierda)
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}`;
      case 'semana':
      case 'mes':
        // año-mes-día (mes desde 1)
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      case 'año':
        // año-mes (mes desde 1)
        return `${date.getFullYear()}-${date.getMonth() + 1}`;
      default:
        return null;
    }
  };

  // Normaliza la clave de periodo según el filtro
  const normalizePeriodoKey = (periodo, filter) => {
   if (!periodo) return null;
   switch (filter) {
     case 'dia': {
       // Si ya viene en formato año-mes-día-hora, úsalo tal cual
       if (typeof periodo === 'string' && /^\d{4}-\d{1,2}-\d{1,2}-\d{1,2}$/.test(periodo)) {
         return periodo;
       }
       
       // Lógica corregida para determinar si la hora es de hoy o de ayer
       const now = new Date();
       const currentHour = now.getHours();
       const periodoHour = parseInt(periodo, 10);
       
       // Si la hora del periodo es mayor que la hora actual, asumimos que es de ayer
       const targetDate = periodoHour > currentHour ? subDays(now, 1) : now;
       
       return `${targetDate.getFullYear()}-${targetDate.getMonth() + 1}-${targetDate.getDate()}-${periodoHour}`;
     }
     case 'semana':
     case 'mes':
       // periodo es la fecha (ej: 2024-06-10)
       try {
         const d = typeof periodo === 'string' ? parseISO(periodo) : periodo;
         return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
       } catch {
         return periodo;
       }
     case 'año':
       // periodo es el mes (ej: 2024-06)
       if (typeof periodo === 'string' && /^\d{4}-\d{1,2}$/.test(periodo)) {
         const [year, month] = periodo.split('-');
         return `${year}-${parseInt(month)}`;
       }
       return periodo;
     default:
       return periodo;
   }
 };

  // Combinar datos reales con períodos completos
  const processedData = useMemo(() => {
    const completePeriods = generateCompletePeriods(timeFilter);

    // Crear un mapa de los datos de ventas existentes
    const ventasMap = new Map();
    ventasData.forEach(venta => {
      const key = normalizePeriodoKey(venta.periodo, timeFilter);
      ventasMap.set(key, {
        sales: Number(venta.ventas) || 0,
        quantity: Number(venta.cantidad) || 0
      });
    });

    // Combinar períodos completos con datos de ventas
    return completePeriods.map(period => {
      const key = getDataKey(period.date, timeFilter);
      const ventaData = ventasMap.get(key) || { sales: 0, quantity: 0 };
      return {
        period: period.label,
        sales: ventaData.sales,
        quantity: ventaData.quantity,
        isEmpty: ventaData.sales === 0 && ventaData.quantity === 0
      };
    });
  }, [ventasData, timeFilter]);

  // Calcular totales usando los datos reales del backend
  const totalSales = ventasData.reduce((sum, item) => sum + Number(item.ventas || 0), 0);
  const totalQuantity = ventasData.reduce((sum, item) => sum + Number(item.cantidad || 0), 0);
  const periodsWithSales = processedData.filter(item => !item.isEmpty).length;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Obtener datos del servidor
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [ventasResponse, resumenResponse] = await Promise.all([
          axios.get(`https://ecotec-backend.onrender.com/api/ventas/por-periodo?periodo=${timeFilter}`, { headers }),
          axios.get(`https://ecotec-backend.onrender.com/api/ventas/resumen?periodo=${timeFilter}`, { headers })
        ]);

        setVentasData(ventasResponse.data);
        setResumenVentas(resumenResponse.data);
        setError(null);
      } catch (error) {
        console.error('Error al obtener datos:', error);
        setError('Error al cargar los datos de ventas');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeFilter]);

  const getDateRange = () => {
    const timeZone = 'America/Bogota';
    const now = new Date();
    
    const formatDateTZ = (date, formatStr) => {
      return formatTZ(date, formatStr, { locale: es, timeZone });
    };

    switch (timeFilter) {
      case 'dia': {
        const end = now;
        const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        return `${formatDateTZ(start, 'HH:mm d MMM')} - ${formatDateTZ(end, 'HH:mm d MMM yyyy')}`;
      }
      case 'semana': {
        const startDate = subDays(now, 6);
        return `${formatDateTZ(startDate, 'd MMM')} - ${formatDateTZ(now, 'd MMM yyyy')}`;
      }
      case 'mes': {
        const startDate = subDays(now, 29);
        return `${formatDateTZ(startDate, 'd MMM')} - ${formatDateTZ(now, 'd MMM yyyy')}`;
      }
      case 'año': {
        const startDate = subMonths(now, 11);
        return `${formatDateTZ(startDate, 'MMM yyyy')} - ${formatDateTZ(now, 'MMM yyyy')}`;
      }
      default:
        return '';
    }
  };

  const getTitle = () => {
    const dateRange = getDateRange();
    switch (timeFilter) {
      case 'dia': return `Ventas por Hora (${dateRange})`;
      case 'semana': return `Ventas Diarias (${dateRange})`;
      case 'mes': return `Ventas Diarias (${dateRange})`;
      case 'año': return `Ventas Mensuales (${dateRange})`;
      default: return 'Ventas';
    }
  };

  const getPeriodInfo = () => {
    const now = new Date();
    switch (timeFilter) {
      case 'dia': return `Datos de ${format(now, 'd MMM yyyy', { locale: es })}`;
      case 'semana': return `Últimos 7 días`;
      case 'mes': return `Últimos 30 días`;
      case 'año': return `Últimos 12 meses`;
      default: return '';
    }
  };

  if (loading) return <div className="loading">Cargando datos de ventas...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="ventas-wrapper">
        <div className="ventas-container">
          <h2 className="dashboard2-title">
            
            Dashboard de Ventas
          </h2>

          <div className="ventas-filtros">
            <Calendar className="icon" />
            <span>Periodo:</span>
            {['dia', 'semana', 'mes', 'año'].map((key) => (
              <button
                key={key}
                className={`filtro-btn ${timeFilter === key ? 'filtro-btn-activo' : ''}`}
                onClick={() => setTimeFilter(key)}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>

          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="icon-wrapper blue">
                <DollarSign className="icon" />
              </div>
              <div>
                <p>Ventas Totales</p>
                <h2>{formatCurrency(totalSales)}</h2>
                <small>{getPeriodInfo()}</small>
                <small style={{ display: 'block', marginTop: '4px', color: '#9ca3af' }}>
                  {periodsWithSales} de {processedData.length} períodos con ventas
                </small>
              </div>
            </div>
            <div className="kpi-card">
              <div className="icon-wrapper green">
                <Package className="icon" />
              </div>
              <div>
                <p>Unidades Vendidas</p>
                <h2>{totalQuantity.toLocaleString()}</h2>
                <small>{getPeriodInfo()}</small>
                <small style={{ display: 'block', marginTop: '4px', color: '#9ca3af' }}>
                  Promedio: {Math.round(totalQuantity / (processedData.length || 1))} por período
                </small>
              </div>
            </div>
            <div className="kpi-card">
              <div className="icon-wrapper purple">
                <TrendingUp className="icon" />
              </div>
              <div>
                <p>Promedio por Período</p>
                <h2>{formatCurrency(totalSales / (processedData.length || 1))}</h2>
                <small>{Math.round(totalQuantity / (processedData.length || 1))} unidades promedio</small>
                <small style={{ display: 'block', marginTop: '4px', color: '#9ca3af' }}>
                  Tasa de ocupación: {Math.round((periodsWithSales / processedData.length) * 100)}%
                </small>
              </div>
            </div>
          </div>

          <div className="ventas-chart">
            <h3 className="chart-title">{getTitle()}</h3>
            {processedData.length === 0 ? (
              <div className="no-data">
                <Package className="icon" />
                <p>No hay datos de ventas para este período</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={500}>
                <BarChart 
                  data={processedData} 
                  margin={{ top: 20, right: 30, left: 20, bottom: timeFilter === 'mes' ? 100 : 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="period" 
                    fontSize={12} 
                    angle={timeFilter === 'mes' ? -45 : 0} 
                    textAnchor={timeFilter === 'mes' ? 'end' : 'middle'} 
                    height={timeFilter === 'mes' ? 100 : 60} 
                    stroke="#6b7280" 
                  />
                  <YAxis 
                    yAxisId="sales" 
                    orientation="left" 
                    fontSize={12} 
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} 
                    stroke="#6b7280" 
                  />
                  <YAxis 
                    yAxisId="quantity" 
                    orientation="right" 
                    fontSize={12} 
                    stroke="#6b7280" 
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const ventas = payload.find(p => p.dataKey === 'sales')?.value || 0;
                        const cantidad = payload.find(p => p.dataKey === 'quantity')?.value || 0;
                        return (
                          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                            <div style={{ fontWeight: 600, color: '#03466e', marginBottom: 4 }}>{label}</div>
                            <div style={{ color: '#374151', fontSize: 15 }}>
                              <span style={{ fontWeight: 500 }}>Cantidad:</span> {cantidad.toLocaleString('es-CO')}
                            </div>
                            <div style={{ color: '#374151', fontSize: 15 }}>
                              <span style={{ fontWeight: 500 }}>Ventas:</span> {Number(ventas).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="square" />
                  <Bar 
                    yAxisId="sales" 
                    dataKey="sales" 
                    fill="#4F46E5"
                    name="Ventas" 
                    radius={[6, 6, 0, 0]} 
                    barSize={30} 
                  />
                  <Bar 
                    yAxisId="quantity" 
                    dataKey="quantity" 
                    fill="#14B8A6"
                    name="Cantidad" 
                    radius={[6, 6, 0, 0]} 
                    barSize={30} 
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
            
            {/* Leyenda adicional */}
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <div style={{ color: '#6b7280' }}>
                  <span style={{ fontWeight: '600' }}>Total de períodos:</span> {processedData.length}
                </div>
                <div style={{ color: '#6b7280' }}>
                  <span style={{ fontWeight: '600' }}>Períodos con ventas:</span> {periodsWithSales}
                </div>
                <div style={{ color: '#6b7280' }}>
                  <span style={{ fontWeight: '600' }}>Períodos sin ventas:</span> {processedData.length - periodsWithSales}
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Ventas;