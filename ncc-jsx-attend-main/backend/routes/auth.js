const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database/init');

const router = express.Router();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'ncc-attendance-secret-key-2024';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Register new cadet
router.post('/signup', async (req, res) => {
  try {
    const { name, regNumber, company, phone, password } = req.body;

    // Validation
    if (!name || !regNumber || !company || !phone || !password) {
      return res.status(400).json({ 
        error: 'All fields are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if cadet already exists
    const existingCadet = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM cadets WHERE reg_number = ?',
        [regNumber],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existingCadet) {
      return res.status(409).json({ 
        error: 'Cadet with this registration number already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new cadet
    const cadetId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO cadets (name, reg_number, rank, company, phone, password_hash) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, regNumber, 'Cadet', company, phone, hashedPassword],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: cadetId, 
        regNumber, 
        name, 
        company 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Get created cadet data
    const newCadet = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, name, reg_number, rank, company, phone, created_at FROM cadets WHERE id = ?',
        [cadetId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    res.status(201).json({
      message: 'Cadet registered successfully',
      token,
      cadet: {
        id: newCadet.id,
        name: newCadet.name,
        regNumber: newCadet.reg_number,
        rank: newCadet.rank,
        company: newCadet.company,
        phone: newCadet.phone,
        attendanceStatus: 'unmarked'
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login cadet
router.post('/login', async (req, res) => {
  try {
    const { regNumber, password } = req.body;

    // Validation
    if (!regNumber || !password) {
      return res.status(400).json({ 
        error: 'Registration number and password are required' 
      });
    }

    // Find cadet
    const cadet = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM cadets WHERE reg_number = ?',
        [regNumber],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!cadet) {
      return res.status(401).json({ 
        error: 'Invalid registration number or password' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, cadet.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid registration number or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: cadet.id, 
        regNumber: cadet.reg_number, 
        name: cadet.name, 
        company: cadet.company 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Check today's attendance status
    const today = new Date().toISOString().split('T')[0];
    const attendance = await new Promise((resolve, reject) => {
      db.get(
        'SELECT status FROM attendance WHERE cadet_id = ? AND date = ?',
        [cadet.id, today],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    res.json({
      message: 'Login successful',
      token,
      cadet: {
        id: cadet.id,
        name: cadet.name,
        regNumber: cadet.reg_number,
        rank: cadet.rank,
        company: cadet.company,
        phone: cadet.phone,
        attendanceStatus: attendance ? attendance.status : 'unmarked'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    // Get cadet data
    const cadet = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, name, reg_number, rank, company, phone FROM cadets WHERE id = ?',
        [req.user.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!cadet) {
      return res.status(404).json({ error: 'Cadet not found' });
    }

    // Check today's attendance status
    const today = new Date().toISOString().split('T')[0];
    const attendance = await new Promise((resolve, reject) => {
      db.get(
        'SELECT status FROM attendance WHERE cadet_id = ? AND date = ?',
        [cadet.id, today],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    res.json({
      cadet: {
        id: cadet.id,
        name: cadet.name,
        regNumber: cadet.reg_number,
        rank: cadet.rank,
        company: cadet.company,
        phone: cadet.phone,
        attendanceStatus: attendance ? attendance.status : 'unmarked'
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout (client-side token removal, but we can track it server-side if needed)
router.post('/logout', authenticateToken, (req, res) => {
  // In a more sophisticated setup, you might want to blacklist the token
  // For now, we'll just return success as the client will remove the token
  res.json({ message: 'Logged out successfully' });
});

module.exports = { router, authenticateToken };
