# NCC Attendance Portal - Full Stack Application

A comprehensive attendance management system for the National Cadet Corps (NCC) built with React, TypeScript, Node.js, and SQLite.

## 🚀 Features

### Frontend (React + TypeScript)
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Authentication**: Login and signup with JWT token management
- **Cadet Dashboard**: Personal attendance tracking and statistics
- **Real-time Updates**: Live attendance data and statistics
- **Responsive Design**: Works on desktop and mobile devices
- **Toast Notifications**: User feedback for all actions

### Backend (Node.js + Express)
- **RESTful API**: Complete CRUD operations for all entities
- **JWT Authentication**: Secure token-based authentication
- **SQLite Database**: Lightweight, file-based database
- **CORS Support**: Configured for frontend integration
- **Error Handling**: Comprehensive error handling and logging
- **Data Validation**: Input validation and sanitization

### Database Schema
- **Cadets Table**: User information and authentication
- **Attendance Table**: Daily attendance records
- **Sessions Table**: JWT token management
- **Indexes**: Optimized for performance

## 📁 Project Structure

```
ncc-jsx-attend-main/
├── backend/                    # Backend API server
│   ├── database/              # Database files and initialization
│   ├── routes/                # API route handlers
│   │   ├── auth.js           # Authentication endpoints
│   │   ├── cadets.js         # Cadet management
│   │   ├── attendance.js     # Attendance tracking
│   │   └── dashboard.js      # Dashboard statistics
│   ├── config.js             # Configuration settings
│   ├── server.js             # Main server file
│   ├── package.json          # Backend dependencies
│   └── README.md             # Backend documentation
├── src/                       # Frontend React application
│   ├── components/           # React components
│   │   ├── auth/            # Authentication components
│   │   ├── cadet/           # Cadet dashboard components
│   │   └── ui/              # Reusable UI components
│   ├── services/            # API service layer
│   │   └── api.ts           # API client
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   └── pages/               # Page components
├── package.json              # Frontend dependencies
└── PROJECT_README.md         # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

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

The backend will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to the project root:
   ```bash
   cd ncc-jsx-attend-main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will start on `http://localhost:5173`

## 🔧 Configuration

### Backend Configuration
Edit `backend/config.js` to modify:
- Server port (default: 5000)
- Frontend URL for CORS
- JWT secret key
- Database path

### Environment Variables
Create a `.env` file in the backend directory:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key-here
DB_PATH=./database/ncc_attendance.db
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - Login cadet
- `POST /api/auth/signup` - Register new cadet
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Logout cadet

### Cadets
- `GET /api/cadets` - Get all cadets (with filtering)
- `GET /api/cadets/:id` - Get cadet by ID
- `GET /api/cadets/company/:company` - Get cadets by company
- `PUT /api/cadets/profile` - Update own profile

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/today` - Get today's attendance
- `GET /api/attendance/date/:date` - Get attendance by date
- `GET /api/attendance/history/:cadetId` - Get attendance history
- `GET /api/attendance/stats` - Get attendance statistics

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard overview
- `GET /api/dashboard/company-stats` - Get company statistics
- `GET /api/dashboard/recent-activity` - Get recent activity
- `GET /api/dashboard/trends` - Get attendance trends
- `GET /api/dashboard/personal` - Get personal dashboard

## 🧪 Testing the Application

### Sample Data
The database comes pre-populated with sample cadets:
- **Registration Numbers**: NCC/2024/001 to NCC/2024/008
- **Default Password**: `password123`
- **Companies**: A Company, B Company, C Company

### Test Login
1. Open the application in your browser
2. Use any of the sample registration numbers
3. Use password: `password123`
4. You should be logged in successfully

### Test Features
- ✅ Login/Logout functionality
- ✅ Mark attendance (Present/Absent/Leave)
- ✅ View dashboard statistics
- ✅ See other cadets' attendance
- ✅ Real-time data updates

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **CORS Configuration**: Proper cross-origin resource sharing
- **Input Validation**: Server-side validation for all inputs
- **Error Handling**: Secure error messages without sensitive data

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in environment variables
2. Use a production database (PostgreSQL, MySQL)
3. Set a strong JWT secret
4. Use a process manager like PM2

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Update the API base URL in `src/services/api.ts`

## 📱 Usage

### For Cadets
1. **Login**: Use your registration number and password
2. **Mark Attendance**: Click Present/Absent/Leave buttons
3. **View Dashboard**: See your attendance statistics
4. **Check Others**: View who else is present today

### For Administrators
- Access all API endpoints for comprehensive data
- Use the dashboard endpoints for analytics
- Monitor attendance trends and statistics

## 🛠️ Development

### Adding New Features
1. **Backend**: Add new routes in the `routes/` directory
2. **Frontend**: Add new components in the `components/` directory
3. **API Integration**: Update `src/services/api.ts` for new endpoints

### Database Modifications
1. Update the schema in `backend/database/init.js`
2. Add migration scripts if needed
3. Update the API endpoints accordingly

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support or questions, please refer to the documentation or create an issue in the repository.

---

**Built with ❤️ for the National Cadet Corps**
