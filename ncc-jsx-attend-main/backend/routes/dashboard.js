const express = require('express');
const { db } = require('../database/init');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get dashboard overview statistics
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Total cadets
    const totalCadets = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as total FROM cadets', (err, row) => {
        if (err) reject(err);
        else resolve(row.total);
      });
    });

    // Today's attendance statistics
    const todayStats = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          status,
          COUNT(*) as count
         FROM attendance 
         WHERE date = ?
         GROUP BY status`,
        [today],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Process today's stats
    const stats = {
      present: 0,
      absent: 0,
      leave: 0,
      unmarked: 0
    };

    todayStats.forEach(stat => {
      stats[stat.status] = stat.count;
    });

    stats.unmarked = totalCadets - (stats.present + stats.absent + stats.leave);

    // Calculate attendance rate
    const attendanceRate = totalCadets > 0 ? 
      Math.round(((stats.present + stats.absent + stats.leave) / totalCadets) * 100) : 0;

    res.json({
      date: today,
      totalCadets,
      attendance: {
        present: stats.present,
        absent: stats.absent,
        leave: stats.leave,
        unmarked: stats.unmarked,
        attendanceRate
      }
    });

  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get company-wise statistics
router.get('/company-stats', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get cadets by company
    const cadetsByCompany = await new Promise((resolve, reject) => {
      db.all(
        'SELECT company, COUNT(*) as total FROM cadets GROUP BY company ORDER BY company',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Get attendance by company for today
    const attendanceByCompany = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          c.company,
          a.status,
          COUNT(*) as count
         FROM cadets c
         LEFT JOIN attendance a ON c.id = a.cadet_id AND a.date = ?
         GROUP BY c.company, a.status
         ORDER BY c.company`,
        [today],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Process company statistics
    const companyStats = {};
    
    cadetsByCompany.forEach(company => {
      companyStats[company.company] = {
        company: company.company,
        total: company.total,
        present: 0,
        absent: 0,
        leave: 0,
        unmarked: company.total
      };
    });

    attendanceByCompany.forEach(attendance => {
      if (attendance.status) {
        companyStats[attendance.company][attendance.status] = attendance.count;
        companyStats[attendance.company].unmarked -= attendance.count;
      }
    });

    res.json({
      date: today,
      companies: Object.values(companyStats)
    });

  } catch (error) {
    console.error('Get company stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent attendance activity
router.get('/recent-activity', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentActivity = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          a.marked_at,
          a.status,
          c.name,
          c.reg_number,
          c.company,
          c.rank
         FROM attendance a
         JOIN cadets c ON a.cadet_id = c.id
         ORDER BY a.marked_at DESC
         LIMIT ?`,
        [parseInt(limit)],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    res.json({
      recentActivity: recentActivity.map(activity => ({
        markedAt: activity.marked_at,
        status: activity.status,
        cadet: {
          name: activity.name,
          regNumber: activity.reg_number,
          company: activity.company,
          rank: activity.rank
        }
      }))
    });

  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get attendance trends (last 7 days)
router.get('/trends', authenticateToken, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(days));

    const trends = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          a.date,
          a.status,
          COUNT(*) as count
         FROM attendance a
         WHERE a.date BETWEEN ? AND ?
         GROUP BY a.date, a.status
         ORDER BY a.date DESC, a.status`,
        [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Get total cadets for unmarked calculation
    const totalCadets = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as total FROM cadets', (err, row) => {
        if (err) reject(err);
        else resolve(row.total);
      });
    });

    // Process trends by date
    const trendsByDate = {};
    
    // Initialize all dates in range
    for (let i = 0; i < parseInt(days); i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      trendsByDate[dateStr] = {
        date: dateStr,
        present: 0,
        absent: 0,
        leave: 0,
        unmarked: totalCadets
      };
    }

    // Fill in actual data
    trends.forEach(trend => {
      if (trendsByDate[trend.date]) {
        trendsByDate[trend.date][trend.status] = trend.count;
        trendsByDate[trend.date].unmarked -= trend.count;
      }
    });

    res.json({
      period: `${days} days`,
      trends: Object.values(trendsByDate).sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      )
    });

  } catch (error) {
    console.error('Get attendance trends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get cadet's personal dashboard data
router.get('/personal', authenticateToken, async (req, res) => {
  try {
    const cadetId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Get cadet info
    const cadet = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, name, reg_number, rank, company FROM cadets WHERE id = ?',
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

    // Get today's attendance status
    const todayAttendance = await new Promise((resolve, reject) => {
      db.get(
        'SELECT status, marked_at FROM attendance WHERE cadet_id = ? AND date = ?',
        [cadetId, today],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    // Get attendance history (last 30 days)
    const attendanceHistory = await new Promise((resolve, reject) => {
      db.all(
        `SELECT date, status 
         FROM attendance 
         WHERE cadet_id = ? 
         ORDER BY date DESC 
         LIMIT 30`,
        [cadetId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Calculate attendance statistics
    const totalDays = 30;
    const presentDays = attendanceHistory.filter(a => a.status === 'present').length;
    const attendancePercentage = totalDays > 0 ? 
      Math.round((presentDays / totalDays) * 100) : 0;

    // Get company attendance for today
    const companyAttendance = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          a.status,
          COUNT(*) as count
         FROM attendance a
         JOIN cadets c ON a.cadet_id = c.id
         WHERE c.company = ? AND a.date = ?
         GROUP BY a.status`,
        [cadet.company, today],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Process company stats
    const companyStats = {
      present: 0,
      absent: 0,
      leave: 0
    };

    companyAttendance.forEach(stat => {
      companyStats[stat.status] = stat.count;
    });

    res.json({
      cadet: {
        id: cadet.id,
        name: cadet.name,
        regNumber: cadet.reg_number,
        rank: cadet.rank,
        company: cadet.company
      },
      todayAttendance: {
        status: todayAttendance ? todayAttendance.status : 'unmarked',
        markedAt: todayAttendance ? todayAttendance.marked_at : null
      },
      statistics: {
        attendancePercentage,
        presentDays,
        totalDays,
        companyStats
      },
      recentHistory: attendanceHistory.slice(0, 7) // Last 7 days
    });

  } catch (error) {
    console.error('Get personal dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
