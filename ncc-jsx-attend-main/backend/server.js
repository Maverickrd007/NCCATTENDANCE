const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initializeDatabase } = require('./database/init');
const config = require('./config');

const app = express();
const PORT = config.PORT;

// Middleware
// Allow localhost on any port during development (and 127.0.0.1)
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (no origin) like curl/Postman
    if (!origin) return callback(null, true);

    const isLocalhost = /^https?:\/\/localhost(:\d+)?$/.test(origin);
    const isLoopback = /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);

    if (isLocalhost || isLoopback) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  

// Import routes
const { router: authRoutes } = require('./routes/auth');
const cadetRoutes = require('./routes/cadets');
const attendanceRoutes = require('./routes/attendance');
const dashboardRoutes = require('./routes/dashboard');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cadets', cadetRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'NCC Attendance API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 NCC Attendance API server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌐 Frontend URL: ${config.FRONTEND_URL}`);
      console.log(`🔧 Environment: ${config.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
