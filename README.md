# GCAA Attendance Management System

## 📋 Overview
A comprehensive web-based attendance tracking system for NSS (National Service Scheme) personnel at the Ghana Civil Aviation Authority (GCAA). Built with React, Node.js/Express, and PostgreSQL.

## ✨ Key Features

### For Personnel
- 🔐 Secure login and registration
- ✅ Easy check-in/check-out with location tracking
- 📊 View personal attendance history
- 📱 Responsive mobile-friendly interface

### For Administrators
- 👥 Manage personnel database
- 📈 Generate daily/monthly attendance reports
- 🔍 Monitor team attendance in real-time
- 📋 Export reports to CSV/Excel

### For Supervisors
- 👀 View team attendance records
- 📊 Generate team-specific reports
- 🔔 Flag or approve attendance records

## 🛠️ Technology Stack
- **Frontend**: React 18, React Router, Axios, CSS3
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (production) / In-Memory (development)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs password hashing, HTTPS

## 🚀 Quick Start

### For Development (In-Memory Database - No Setup Required)
```bash
# Terminal 1: Backend
cd backend
npm install
node src/server.js

# Terminal 2: Frontend  
cd frontend
npm install
npm start
```

**Visit**: http://localhost:3000 ✅ Ready to test immediately!

### For Production (PostgreSQL Database)

#### Step 1: Install PostgreSQL
- **Windows**: Download from https://www.postgresql.org/download/windows/
- **macOS**: `brew install postgresql@15`
- **Linux**: `sudo apt-get install postgresql`

#### Step 2: Set Up Database
```bash
# Windows PowerShell (Run as Administrator):
cd <project-root>
.\setup-postgres.ps1

# Or manually:
psql -U postgres
CREATE DATABASE gcaa_attendance;
\c gcaa_attendance
\i 'database/schema.sql'
\q
```

#### Step 3: Configure Backend
Update `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gcaa_attendance
DB_USER=postgres
DB_PASSWORD=your_password
NODE_ENV=production
JWT_SECRET=your_long_secret_key
```

#### Step 4: Start Production
```bash
cd backend
npm install
node src/server.js

cd frontend
npm install
npm run build
npm start
```

#### Two-Step Login

After the password is accepted, the system sends a six-digit one-time login code to the account email address. The code expires after 10 minutes and must be entered before access is granted.

For local testing, add this to `backend/.env`:

```env
FRONTEND_URL=http://localhost:3000
EMAIL_PREVIEW=true
```

The backend will print login codes in its terminal. For real email delivery, set `EMAIL_PREVIEW=false` and configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `EMAIL_FROM`. See `backend/.env.example` for the full template.

---

## 📚 Documentation

- **[Quick Start Guide](QUICK_START.md)** - Get running in 5 minutes
- **[Setup Guide](docs/SETUP_GUIDE.md)** - Detailed installation
- **[API Documentation](docs/API_DOCUMENTATION.md)** - Complete API reference
- **[PostgreSQL Production Setup](docs/POSTGRESQL_PRODUCTION_SETUP.md)** - Production database
- **[Production Deployment](docs/PRODUCTION_DEPLOYMENT.md)** - Deploy to cloud
- **[Requirements](docs/REQUIREMENTS.md)** - System specifications

## 📁 Project Structure

```
gcaa-attendance-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/      # Business logic
│   │   ├── middleware/       # Auth, validation
│   │   ├── models/           # Data models
│   │   ├── routes/           # API routes
│   │   └── server.js         # Entry point
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service
│   │   ├── styles/           # CSS files
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   └── package.json
├── database/
│   └── schema.sql            # Database schema
└── docs/
    ├── SETUP_GUIDE.md
    ├── API_DOCUMENTATION.md
    └── REQUIREMENTS.md
```

## 🔑 Default Login Credentials
After setup, register a new account or use:
- **Email**: admin@gcaa.gov.gh (after registration)
- **Password**: Your chosen password

## 🔒 Security Features
- ✅ JWT-based authentication
- ✅ Bcrypt password hashing
- ✅ Role-based access control (RBAC)
- ✅ HTTPS support
- ✅ Input validation and sanitization
- ✅ CORS protection

## 📊 System Architecture

```
┌─────────────────────────────────────────┐
│         React Frontend (Port 3000)      │
│  ├─ Login/Register Components           │
│  ├─ Dashboard (Check-in/Out)            │
│  ├─ Attendance Records View             │
│  └─ Admin Panel                         │
└────────────────┬────────────────────────┘
                 │ HTTPS/REST API
┌────────────────▼────────────────────────┐
│    Backend API (Node.js, Port 5000)     │
│  ├─ Auth Routes (Login/Register)        │
│  ├─ Attendance Routes (Check-in/Out)    │
│  ├─ Personnel Routes (CRUD)             │
│  └─ Middleware (Auth, Validation)       │
└────────────────┬────────────────────────┘
                 │ SQL Queries
┌────────────────▼────────────────────────┐
│     PostgreSQL Database                 │
│  ├─ personnel (Users/Staff)             │
│  ├─ attendance (Check-in/Out logs)      │
│  └─ Views (Daily Reports)               │
└─────────────────────────────────────────┘
```

## 📋 API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new personnel
- `POST /api/auth/login` - Login with credentials

### Attendance
- `POST /api/attendance/check-in` - Mark check-in
- `POST /api/attendance/check-out` - Mark check-out
- `GET /api/attendance/records` - Get attendance history
- `GET /api/attendance/daily-report` - Get daily report

### Personnel (Admin)
- `GET /api/personnel` - Get all personnel
- `GET /api/personnel/:id` - Get single personnel
- `PUT /api/personnel/:id` - Update personnel
- `DELETE /api/personnel/:id` - Delete personnel

## 🧪 Testing

### Manual Testing
1. Register a test account
2. Login with test account
3. Perform check-in/check-out
4. View attendance records
5. Check daily reports

### API Testing with cURL
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","employee_id":"TST001","email":"test@gcaa.gov.gh","password":"pass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gcaa.gov.gh","password":"pass123"}'
```

## 🚢 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Cloud Deployment
- **AWS**: EC2 + RDS + Elastic IP
- **Heroku**: Backend deployment ready
- **Vercel**: Frontend deployment ready
- **Azure**: App Service + SQL Database

See `docs/SETUP_GUIDE.md` for detailed deployment instructions.

## 📈 Performance Features
- Database query optimization with indexes
- JWT caching
- CORS performance headers
- Responsive UI with optimized CSS

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection error | Check PostgreSQL is running and .env credentials |
| CORS error | Verify CORS_ORIGIN in .env matches frontend URL |
| Port in use | Change PORT in .env or kill existing process |
| Missing modules | Run `npm install` again |

For more help, see `docs/SETUP_GUIDE.md`

## 📝 Future Enhancements
- 📱 Mobile app with offline support
- 🗺️ GPS location tracking
- 🔐 Biometric integration
- 📧 Email/SMS notifications
- 📊 Advanced analytics dashboard
- 🔄 Integration with payroll systems

## 📄 License
MIT License - Use freely with attribution

## 👥 Support & Contact
For support and issues, contact: admin@gcaa.gov.gh

## 🎯 Roadmap

### Phase 1 (Current) - MVP ✅
- User authentication
- Basic check-in/out
- Attendance records
- Daily reports

### Phase 2 (Next)
- Admin dashboard
- Advanced reporting
- Export to Excel
- Mobile responsiveness

### Phase 3 (Future)
- GPS tracking
- Biometrics
- Notifications
- Analytics

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Status**: Development
