import cron from 'node-cron';
import db from './config/db.js';

// Ejecutar todos los lunes a las 00:00
cron.schedule('0 0 * * 1', async () => {
  try {
    await db.promise().query('UPDATE productos SET visitas = 0');
    console.log('Visitas reiniciadas exitosamente');
  } catch (error) {
    console.error('Error al reiniciar visitas:', error);
  }
});