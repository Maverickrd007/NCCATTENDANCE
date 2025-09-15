const express = require('express');
const { db } = require('../database/init');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Mark attendance for a cadet
router.post('/mark', authenticateToken, async (req, res) => {
  try {
    const { status, date } = req.body;
    const cadetId = req.user.id;

    // Validation
    if (!status || !['present', 'absent', 'leave'].includes(status)) {
      return res.status(400).json({ 
        error: 'Valid status is required (present, absent, or leave)' 
      });
    }

    const attendanceDate = date || new Date().toISOString().split('T')[0];

    // Check if attendance already marked for this date
    const existingAttendance = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, status FROM attendance WHERE cadet_id = ? AND date = ?',
        [cadetId, attendanceDate],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existingAttendance) {
      // Update existing attendance
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE attendance SET status = ?, marked_at = CURRENT_TIMESTAMP WHERE id = ?',
          [status, existingAttendance.id],
          function(err) {
            if (err) reject(err);
            else resolve(this.changes);
          }
        );
      });
    } else {
      // Create new attendance record
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO attendance (cadet_id, date, status) VALUES (?, ?, ?)',
          [cadetId, attendanceDate, status],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    }

    res.json({
      message: 'Attendance marked successfully',
      attendance: {
        cadetId,
        date: attendanceDate,
        status
      }
    });

  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get attendance for a specific date
router.get('/date/:date', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params;
    const { company } = req.query;

    let query = `
      SELECT 
        a.id,
        a.cadet_id,
        a.date,
        a.status,
        a.marked_at,
        c.name,
        c.reg_number,
        c.rank,
        c.company
      FROM attendance a
      JOIN cadets c ON a.cadet_id = c.id
      WHERE a.date = ?
    `;
    const params = [date];

    if (company && company !== 'all') {
      query += ' AND c.company = ?';
      params.push(company);
    }

    query += ' ORDER BY c.name';

    const attendance = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({
      date,
      attendance: attendance.map(record => ({
        id: record.id,
        cadetId: record.cadet_id,
        name: record.name,
        regNumber: record.reg_number,
        rank: record.rank,
        company: record.company,
        status: record.status,
        markedAt: record.marked_at
      }))
    });

  } catch (error) {
    console.error('Get attendance by date error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get today's attendance
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { company } = req.query;

    let query = `
      SELECT 
        a.id,
        a.cadet_id,
        a.date,
        a.status,
        a.marked_at,
        c.name,
        c.reg_number,
        c.rank,
        c.company
      FROM attendance a
      JOIN cadets c ON a.cadet_id = c.id
      WHERE a.date = ?
    `;
    const params = [today];

    if (company && company !== 'all') {
      query += ' AND c.company = ?';
      params.push(company);
    }

    query += ' ORDER BY a.marked_at DESC';

    const attendance = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({
      date: today,
      attendance: attendance.map(record => ({
        id: record.id,
        cadetId: record.cadet_id,
        name: record.name,
        regNumber: record.reg_number,
        rank: record.rank,
        company: record.company,
        status: record.status,
        markedAt: record.marked_at
      }))
    });

  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get attendance history for a cadet
router.get('/history/:cadetId', authenticateToken, async (req, res) => {
  try {
    const { cadetId } = req.params;
    const { limit = 30, offset = 0 } = req.query;

    // Verify cadet exists
    const cadet = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, name, reg_number FROM cadets WHERE id = ?',
        [cadetId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!cadet) {
      return res.status(404).json({ error: 'Cadet not found' });
    }

    // Get attendance history
    const history = await new Promise((resolve, reject) => {
      db.all(
        `SELECT date, status, marked_at 
         FROM attendance 
         WHERE cadet_id = ? 
         ORDER BY date DESC 
         LIMIT ? OFFSET ?`,
        [cadetId, parseInt(limit), parseInt(offset)],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Get total count
    const totalCount = await new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as total FROM attendance WHERE cadet_id = ?',
        [cadetId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.total);
        }
      );
    });

    res.json({
      cadet: {
        id: cadet.id,
        name: cadet.name,
        regNumber: cadet.reg_number
      },
      history: history.map(record => ({
        date: record.date,
        status: record.status,
        markedAt: record.marked_at
      })),
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
      }
    });

  } catch (error) {
    console.error('Get attendance history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get attendance statistics for a date range
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, company } = req.query;
    
    const start = startDate || new Date().toISOString().split('T')[0];
    const end = endDate || start;

    let query = `
      SELECT 
        a.date,
        a.status,
        COUNT(*) as count
      FROM attendance a
      JOIN cadets c ON a.cadet_id = c.id
      WHERE a.date BETWEEN ? AND ?
    `;
    const params = [start, end];

    if (company && company !== 'all') {
      query += ' AND c.company = ?';
      params.push(company);
    }

    query += ' GROUP BY a.date, a.status ORDER BY a.date DESC, a.status';

    const stats = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Get total cadets count
    let totalQuery = 'SELECT COUNT(*) as total FROM cadets';
    const totalParams = [];

    if (company && company !== 'all') {
      totalQuery += ' WHERE company = ?';
      totalParams.push(company);
    }

    const totalCadets = await new Promise((resolve, reject) => {
      db.get(totalQuery, totalParams, (err, row) => {
        if (err) reject(err);
        else resolve(row.total);
      });
    });

    // Process stats by date
    const statsByDate = {};
    stats.forEach(stat => {
      if (!statsByDate[stat.date]) {
        statsByDate[stat.date] = {
          date: stat.date,
          present: 0,
          absent: 0,
          leave: 0,
          total: 0
        };
      }
      statsByDate[stat.date][stat.status] = stat.count;
      statsByDate[stat.date].total += stat.count;
    });

    res.json({
      dateRange: { start, end },
      totalCadets,
      stats: Object.values(statsByDate)
    });

  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk mark attendance (for admin use)
router.post('/bulk', authenticateToken, async (req, res) => {
  try {
    const { date, attendanceRecords } = req.body;

    if (!date || !Array.isArray(attendanceRecords)) {
      return res.status(400).json({ 
        error: 'Date and attendance records array are required' 
      });
    }

    const results = [];

    for (const record of attendanceRecords) {
      const { cadetId, status } = record;

      if (!cadetId || !['present', 'absent', 'leave'].includes(status)) {
        results.push({
          cadetId,
          success: false,
          error: 'Invalid cadet ID or status'
        });
        continue;
      }

      try {
        // Check if attendance already exists
        const existing = await new Promise((resolve, reject) => {
          db.get(
            'SELECT id FROM attendance WHERE cadet_id = ? AND date = ?',
            [cadetId, date],
            (err, row) => {
              if (err) reject(err);
              else resolve(row);
            }
          );
        });

        if (existing) {
          // Update existing
          await new Promise((resolve, reject) => {
            db.run(
              'UPDATE attendance SET status = ?, marked_at = CURRENT_TIMESTAMP WHERE id = ?',
              [status, existing.id],
              function(err) {
                if (err) reject(err);
                else resolve(this.changes);
              }
            );
          });
        } else {
          // Insert new
          await new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO attendance (cadet_id, date, status) VALUES (?, ?, ?)',
              [cadetId, date, status],
              function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
              }
            );
          });
        }

        results.push({
          cadetId,
          success: true
        });

      } catch (error) {
        results.push({
          cadetId,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      message: 'Bulk attendance marking completed',
      date,
      results
    });

  } catch (error) {
    console.error('Bulk mark attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
