const express = require('express');
const { db } = require('../database/init');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get all cadets (with optional filtering)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { company, search, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT id, name, reg_number, rank, company, phone, created_at 
      FROM cadets 
      WHERE 1=1
    `;
    const params = [];

    // Filter by company
    if (company && company !== 'all') {
      query += ' AND company = ?';
      params.push(company);
    }

    // Search functionality
    if (search) {
      query += ' AND (name LIKE ? OR reg_number LIKE ? OR rank LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const cadets = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM cadets WHERE 1=1';
    const countParams = [];

    if (company && company !== 'all') {
      countQuery += ' AND company = ?';
      countParams.push(company);
    }

    if (search) {
      countQuery += ' AND (name LIKE ? OR reg_number LIKE ? OR rank LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const totalCount = await new Promise((resolve, reject) => {
      db.get(countQuery, countParams, (err, row) => {
        if (err) reject(err);
        else resolve(row.total);
      });
    });

    res.json({
      cadets: cadets.map(cadet => ({
        id: cadet.id,
        name: cadet.name,
        regNumber: cadet.reg_number,
        rank: cadet.rank,
        company: cadet.company,
        phone: cadet.phone,
        createdAt: cadet.created_at
      })),
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
      }
    });

  } catch (error) {
    console.error('Get cadets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get cadet by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const cadet = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, name, reg_number, rank, company, phone, created_at FROM cadets WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!cadet) {
      return res.status(404).json({ error: 'Cadet not found' });
    }

    res.json({
      id: cadet.id,
      name: cadet.name,
      regNumber: cadet.reg_number,
      rank: cadet.rank,
      company: cadet.company,
      phone: cadet.phone,
      createdAt: cadet.created_at
    });

  } catch (error) {
    console.error('Get cadet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get cadets by company
router.get('/company/:company', authenticateToken, async (req, res) => {
  try {
    const { company } = req.params;

    const cadets = await new Promise((resolve, reject) => {
      db.all(
        'SELECT id, name, reg_number, rank, company, phone FROM cadets WHERE company = ? ORDER BY name',
        [company],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    res.json({
      company,
      cadets: cadets.map(cadet => ({
        id: cadet.id,
        name: cadet.name,
        regNumber: cadet.reg_number,
        rank: cadet.rank,
        company: cadet.company,
        phone: cadet.phone
      }))
    });

  } catch (error) {
    console.error('Get cadets by company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get cadet statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    // Total cadets
    const totalCadets = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as total FROM cadets', (err, row) => {
        if (err) reject(err);
        else resolve(row.total);
      });
    });

    // Cadets by company
    const cadetsByCompany = await new Promise((resolve, reject) => {
      db.all(
        'SELECT company, COUNT(*) as count FROM cadets GROUP BY company ORDER BY company',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Cadets by rank
    const cadetsByRank = await new Promise((resolve, reject) => {
      db.all(
        'SELECT rank, COUNT(*) as count FROM cadets GROUP BY rank ORDER BY count DESC',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    res.json({
      totalCadets,
      cadetsByCompany: cadetsByCompany.map(item => ({
        company: item.company,
        count: item.count
      })),
      cadetsByRank: cadetsByRank.map(item => ({
        rank: item.rank,
        count: item.count
      }))
    });

  } catch (error) {
    console.error('Get cadet stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update cadet profile (only own profile)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const cadetId = req.user.id;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE cadets SET name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, phone, cadetId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    // Get updated cadet data
    const updatedCadet = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, name, reg_number, rank, company, phone FROM cadets WHERE id = ?',
        [cadetId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    res.json({
      message: 'Profile updated successfully',
      cadet: {
        id: updatedCadet.id,
        name: updatedCadet.name,
        regNumber: updatedCadet.reg_number,
        rank: updatedCadet.rank,
        company: updatedCadet.company,
        phone: updatedCadet.phone
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
