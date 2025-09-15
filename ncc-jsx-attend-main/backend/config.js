module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Frontend URL for CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // JWT Secret (change this in production)
  JWT_SECRET: process.env.JWT_SECRET || 'ncc-attendance-secret-key-2024-change-in-production',
  
  // Database Configuration
  DB_PATH: process.env.DB_PATH || './database/ncc_attendance.db'
};
