# GCAA Attendance System - Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Git

---

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Database Setup

#### Option A: Using PostgreSQL Directly
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE gcaa_attendance;

# Exit psql
\q

# Run schema
psql -U postgres -d gcaa_attendance -f ..\database\schema.sql
```

#### Option B: Using Docker
```bash
# Run PostgreSQL in Docker
docker run --name gcaa-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=gcaa_attendance \
  -p 5432:5432 \
  -d postgres:15

# Create tables
docker exec -i gcaa-postgres psql -U postgres -d gcaa_attendance < database\schema.sql
```

### 3. Configure Environment Variables
Create `.env` file in the backend folder:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gcaa_attendance
DB_USER=postgres
DB_PASSWORD=password
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### 4. Start Backend Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server runs on `http://localhost:5000`

---

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configuration
Create `.env` file in the frontend folder:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start Frontend Server
```bash
npm start
```

Frontend runs on `http://localhost:3000`

---

## Full System Setup (Both Frontend & Backend)

### Windows PowerShell
```powershell
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

### Linux/Mac
```bash
# Terminal 1 - Backend
cd backend && npm install && npm run dev &

# Terminal 2 - Frontend
cd frontend && npm install && npm start
```

---

## Initial Setup Walkthrough

1. **Backend is running** ✓ (http://localhost:5000/api/health)
2. **Frontend is running** ✓ (http://localhost:3000)
3. **Database is populated** ✓ (Check PostgreSQL)

### First Steps:
1. Register a new account (http://localhost:3000/register)
2. Use credentials to login (http://localhost:3000/login)
3. Try check-in/check-out functionality
4. View daily reports

---

## Testing the API

### Using cURL
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "employee_id": "TEST001",
    "email": "test@gcaa.gov.gh",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gcaa.gov.gh",
    "password": "password123"
  }'
```

### Using Postman
1. Import the API routes
2. Set up environment variables for token
3. Test each endpoint

---

## Troubleshooting

### Issue: Database Connection Error
**Solution:**
- Verify PostgreSQL is running
- Check DB credentials in `.env`
- Ensure database exists
```bash
psql -U postgres -l  # List all databases
```

### Issue: CORS Error
**Solution:**
- Verify `CORS_ORIGIN` in backend `.env` matches frontend URL
- Default: `http://localhost:3000`

### Issue: Port Already in Use
**Solution:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (Windows)
taskkill /PID <PID> /F

# Or use different port
# Modify PORT in .env to 5001
```

### Issue: Module Not Found
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Production Deployment

### Environment Variables (Production)
```env
NODE_ENV=production
DB_HOST=prod-db-host.com
DB_USER=prod_user
DB_PASSWORD=strong_password_here
JWT_SECRET=very_long_randomstrong_secret_here
CORS_ORIGIN=https://yourdomain.com
```

### Backend Deployment
```bash
# Build
npm run build

# Deploy to AWS/Heroku/Azure/etc.
```

### Frontend Deployment
```bash
# Build
npm run build

# Deploy to Netlify/Vercel/AWS S3/etc.
```

---

## Database Backup

### Manual Backup
```bash
# Backup
pg_dump -U postgres gcaa_attendance > backup.sql

# Restore
psql -U postgres gcaa_attendance < backup.sql
```

### Automated Backup (Linux cron)
```bash
# Add to crontab
0 2 * * * /usr/bin/pg_dump -U postgres gcaa_attendance > /backups/gcaa_$(date +\%Y\%m\%d).sql
```

---

## Support & Documentation
- API Docs: See `docs/API_DOCUMENTATION.md`
- Requirements: See `docs/REQUIREMENTS.md`
- Code: Check individual component files for inline comments
