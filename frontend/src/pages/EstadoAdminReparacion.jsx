import React, { useEffect, useState } from "react";
import "../style/EstadoAdminReparacion.css";
import { Link } from "react-router-dom";
import ExpandableText from '../components/TextoExpandible';

const EstadoAdminReparacion = () => {
  const [reparaciones, setReparaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Obtener reparaciones al cargar
  useEffect(() => {
    fetchReparaciones();
  }, []);

  const fetchReparaciones = async () => {
    try {
      const res = await fetch("https://ecotec-backend.onrender.com/api/reparaciones");
      const data = await res.json();
      setReparaciones(data);
    } catch (error) {
      console.error("Error cargando reparaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado de reparación
  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      await fetch(`https://ecotec-backend.onrender.com/api/reparaciones/${id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      // Refrescar lista después de actualizar
      fetchReparaciones();
    } catch (error) {
      console.error("Error actualizando estado:", error);
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-container">
          <p>Cargando reparaciones...</p>
        </div>
      </div>
    );
  }

return (
  <div className="Dashboard-wrapper">
    <div className="admin-container">
      <h1 className="admin-title">Estado de Reparaciones</h1>

      {reparaciones.length === 0 ? (
        <div className="no-data">
          <p>No hay solicitudes de reparación.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Nombre</th>
              <th>Dispositivo</th>
              <th>Problema</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reparaciones.map((rep) => (
              <tr key={rep.id_reparacion}>
                <td>#{rep.ticket}</td>
                <td>{rep.nombre}</td>
                <td>{rep.dispositivo}</td>
                <td>
                  <ExpandableText text={rep.problema} maxLines={2} />
                </td>
                <td>
                  <span
                    className={`estado-badge ${
                      rep.estado === "pendiente"
                        ? "estado-pendiente"
                        : rep.estado === "en_proceso"
                        ? "estado-proceso"
                        : "estado-finalizado"
                    }`}
                  >
                    {rep.estado.replace("_", " ")}
                  </span>
                </td>
                <td>
                  <select
                    value={rep.estado}
                    onChange={(e) =>
                      actualizarEstado(rep.id_reparacion, e.target.value)
                    }
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
     {/* 🔹 Botón para volver */}
    <div className="back-to-dashboard6">
<Link to="/dashboardadmi">← Volver a mi cuenta</Link>
    </div>
  </div>
);
};

export default EstadoAdminReparacion;