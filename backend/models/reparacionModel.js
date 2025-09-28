import db from '../config/db.js';

// Crear nueva reparación
export const createReparation = async (reparationData) => {
  const { nombre, contacto, dispositivo, marca, modelo, problema, imagen } = reparationData;
  const [result] = await db.promise().query(
    `INSERT INTO reparaciones (nombre, contacto, dispositivo, marca, modelo, problema, imagen, estado) 
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
    [nombre, contacto, dispositivo, marca, modelo, problema, imagen]
  );
  return result;
};

// Actualizar ticket de reparación
export const updateReparationTicket = async (id, ticket) => {
  const [result] = await db.promise().query(
    'UPDATE reparaciones SET ticket = ? WHERE id_reparacion = ?',
    [ticket, id]
  );
  return result;
};

// Obtener reparaciones por usuario
export const getRepairsByUser = async (email) => {
  const [rows] = await db.promise().query(
    'SELECT * FROM reparaciones WHERE contacto = ? ORDER BY id_reparacion DESC',
    [email]
  );
  return rows;
};

// Obtener todas las reparaciones (admin)
export const getAllRepairs = async () => {
  const [rows] = await db.promise().query(
    'SELECT * FROM reparaciones ORDER BY id_reparacion DESC'
  );
  return rows;
};

// Obtener reparación por ID
export const getRepairById = async (id) => {
  const [rows] = await db.promise().query(
    'SELECT * FROM reparaciones WHERE id_reparacion = ?',
    [id]
  );
  return rows[0] || null;
};

// Actualizar estado de reparación
export const updateRepairStatus = async (id, estado, notas = null) => {
  let query = 'UPDATE reparaciones SET estado = ?';
  let params = [estado];
  
  if (notas) {
    query += ', notas = ?';
    params.push(notas);
  }
  
  query += ' WHERE id_reparacion = ?';
  params.push(id);
  
  const [result] = await db.promise().query(query, params);
  return result;
};

// Obtener reparaciones por estado
export const getRepairsByStatus = async (estado) => {
  const [rows] = await db.promise().query(
    'SELECT * FROM reparaciones WHERE estado = ? ORDER BY id_reparacion DESC',
    [estado]
  );
  return rows;
};

// Buscar reparación por ticket
export const getRepairByTicket = async (ticket) => {
  const [rows] = await db.promise().query(
    'SELECT * FROM reparaciones WHERE ticket = ?',
    [ticket]
  );
  return rows[0] || null;
};

// Actualizar costo de reparación
export const updateRepairCost = async (id, costo) => {
  const [result] = await db.promise().query(
    'UPDATE reparaciones SET costo = ? WHERE id_reparacion = ?',
    [costo, id]
  );
  return result;
};