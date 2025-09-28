// db.js
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// Configuración para Railway
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

const db = mysql.createConnection(dbConfig);

// Función para conectar con manejo de errores mejorado
db.connect((err) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err.message);
    console.error('Verifica las credenciales y la conexión a Railway');
    return;
  }
  console.log('✅ Conectado a la base de datos EcoTec en Railway');
});

export default db;