# NCC Attendance Backend API

A Node.js/Express backend API for the NCC Attendance Portal that provides authentication, cadet management, and attendance tracking functionality.

## Features

- **Authentication**: JWT-based authentication with login/signup
- **Cadet Management**: CRUD operations for cadet profiles
- **Attendance Tracking**: Mark and retrieve attendance records
- **Dashboard Analytics**: Statistics and trends for attendance data
- **SQLite Database**: Lightweight database for data persistence

## API Endpoints

### Authentication (`/api/auth`)
- `POST /signup` - Register new cadet
- `POST /login` - Login cadet
- `GET /verify` - Verify JWT token
- `POST /logout` - Logout cadet

### Cadets (`/api/cadets`)
- `GET /` - Get all cadets (with filtering and pagination)
- `GET /:id` - Get cadet by ID
- `GET /company/:company` - Get cadets by company
- `GET /stats/overview` - Get cadet statistics
- `PUT /profile` - Update own profile

### Attendance (`/api/attendance`)
- `POST /mark` - Mark attendance for a cadet
- `GET /date/:date` - Get attendance for specific date
- `GET /today` - Get today's attendance
- `GET /history/:cadetId` - Get attendance history for a cadet
- `GET /stats` - Get attendance statistics
- `POST /bulk` - Bulk mark attendance

### Dashboard (`/api/dashboard`)
- `GET /overview` - Get dashboard overview statistics
- `GET /company-stats` - Get company-wise statistics
- `GET /recent-activity` - Get recent attendance activity
- `GET /trends` - Get attendance trends
- `GET /personal` - Get personal dashboard data

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Or start the production server:
   ```bash
   npm start
   ```

## Configuration

The server can be configured using environment variables or by modifying `config.js`:

- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:5173)
- `JWT_SECRET`: Secret key for JWT tokens
- `DB_PATH`: SQLite database file path

## Database

The application uses SQLite database with the following tables:

- **cadets**: Cadet information and authentication
- **attendance**: Daily attendance records
- **sessions**: JWT token management (optional)

The database is automatically initialized with sample data on first run.

## Sample Data

The database comes pre-populated with sample cadets:
- Registration numbers: NCC/2024/001 to NCC/2024/008
- Default password: `password123`
- Companies: A Company, B Company, C Company

## API Usage Examples

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"regNumber": "NCC/2024/001", "password": "password123"}'
```

### Mark Attendance
```bash
curl -X POST http://localhost:5000/api/attendance/mark \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"status": "present"}'
```

### Get Today's Attendance
```bash
curl -X GET http://localhost:5000/api/attendance/today \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Development

The server uses nodemon for development with auto-restart on file changes. The API includes comprehensive error handling and logging.

## Security

- JWT tokens for authentication
- Password hashing with bcrypt
- CORS configuration for frontend integration
- Input validation and sanitization

## License

ISC
