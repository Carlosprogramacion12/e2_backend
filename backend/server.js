const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
// Importar modelos y asociaciones
require('./models');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const juezRoutes = require('./routes/juez');
const participanteRoutes = require('./routes/participante');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware Global ───
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Rutas ───
app.get('/api', (req, res) => {
  res.json({
    message: 'API Gestor de Proyectos Académicos',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      juez: '/api/juez',
      participante: '/api/participante'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/juez', juezRoutes);
app.use('/api/participante', participanteRoutes);

// ─── Manejo de errores global ───
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  });
});

// ─── Iniciar servidor ───
async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL exitosa');
    // Sincronizar modelos con la BD (crear tablas si no existen)
    await sequelize.sync({ alter: true });
    console.log('✅ Tablas sincronizadas');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📡 API disponible en http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Error al conectar a MySQL:', error.message);
    process.exit(1);
  }
}

start();
