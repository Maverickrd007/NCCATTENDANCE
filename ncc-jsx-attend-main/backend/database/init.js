const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Database file path
const dbPath = path.join(__dirname, 'ncc_attendance.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Initialize database tables
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create cadets table
      db.run(`
        CREATE TABLE IF NOT EXISTS cadets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          reg_number TEXT UNIQUE NOT NULL,
          rank TEXT DEFAULT 'Cadet',
          company TEXT NOT NULL,
          phone TEXT,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create attendance table
      db.run(`
        CREATE TABLE IF NOT EXISTS attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cadet_id INTEGER NOT NULL,
          date DATE NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'leave')),
          marked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (cadet_id) REFERENCES cadets (id),
          UNIQUE(cadet_id, date)
        )
      `);

      // Create sessions table for JWT token management
      db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cadet_id INTEGER NOT NULL,
          token_hash TEXT NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (cadet_id) REFERENCES cadets (id)
        )
      `);

      // Create indexes for better performance
      db.run(`CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_attendance_cadet_id ON attendance(cadet_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_cadets_reg_number ON cadets(reg_number)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_cadets_company ON cadets(company)`);

      console.log('✅ Database tables created successfully');
      resolve();
    });
  });
};

// Seed initial data
const seedDatabase = async () => {
  try {
    // Check if we already have cadets
    const count = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM cadets', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    if (count > 0) {
      console.log('📊 Database already has data, skipping seed');
      return;
    }

    // Create sample cadets
    const sampleCadets = [
      {
        name: 'Cadet Sharma, Rajesh',
        regNumber: 'NCC/2024/001',
        rank: 'Sergeant',
        company: 'A Company',
        phone: '+91 9876543210',
        password: 'password123'
      },
      {
        name: 'Cadet Singh, Priya',
        regNumber: 'NCC/2024/002',
        rank: 'Corporal',
        company: 'B Company',
        phone: '+91 9876543211',
        password: 'password123'
      },
      {
        name: 'Cadet Kumar, Arjun',
        regNumber: 'NCC/2024/003',
        rank: 'Lance Corporal',
        company: 'A Company',
        phone: '+91 9876543212',
        password: 'password123'
      },
      {
        name: 'Cadet Patel, Meera',
        regNumber: 'NCC/2024/004',
        rank: 'Cadet',
        company: 'C Company',
        phone: '+91 9876543213',
        password: 'password123'
      },
      {
        name: 'Cadet Gupta, Vikram',
        regNumber: 'NCC/2024/005',
        rank: 'Sergeant',
        company: 'B Company',
        phone: '+91 9876543214',
        password: 'password123'
      },
      {
        name: 'Cadet Joshi, Anita',
        regNumber: 'NCC/2024/006',
        rank: 'Corporal',
        company: 'A Company',
        phone: '+91 9876543215',
        password: 'password123'
      },
      {
        name: 'Cadet Reddy, Suresh',
        regNumber: 'NCC/2024/007',
        rank: 'Cadet',
        company: 'C Company',
        phone: '+91 9876543216',
        password: 'password123'
      },
      {
        name: 'Cadet Nair, Kavya',
        regNumber: 'NCC/2024/008',
        rank: 'Lance Corporal',
        company: 'B Company',
        phone: '+91 9876543217',
        password: 'password123'
      }
    ];

    for (const cadet of sampleCadets) {
      const hashedPassword = await bcrypt.hash(cadet.password, 10);
      
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO cadets (name, reg_number, rank, company, phone, password_hash) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [cadet.name, cadet.regNumber, cadet.rank, cadet.company, cadet.phone, hashedPassword],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    }

    console.log('🌱 Sample cadets created successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Initialize database
const initializeDatabase = async () => {
  try {
    await initDatabase();
    await seedDatabase();
    console.log('🎉 Database initialization completed');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
};

module.exports = { db, initializeDatabase };
