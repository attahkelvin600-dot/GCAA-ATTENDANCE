const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Try to load routes
try {
  const authRoutes = require('./routes/authRoutes');
  const attendanceRoutes = require('./routes/attendanceRoutes');
  const personnelRoutes = require('./routes/personnelRoutes');
  
  app.use('/api/auth', authRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/personnel', personnelRoutes);
} catch (err) {
  console.warn('⚠️  Database routes not available yet:', err.message);
}

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'GCAA Attendance API',
    status: 'running',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Frontend: http://localhost:3000`);
  console.log(`📚 Docs: Check QUICK_START.md for setup instructions`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
