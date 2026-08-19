# GCAA Attendance System - Quick Start Guide

## 🚀 Start the Application (Choose One Method)

### Method 1: Docker (Recommended - Fastest)
```bash
# Make sure Docker is installed and running
docker-compose up --build

# Access the application:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api/health
```

### Method 2: Manual Setup (Windows PowerShell)

#### Step 1: Setup Database
```powershell
# Option A: Using PostgreSQL (if installed)
# 1. Open PostgreSQL and create database
# 2. Run: 
psql -U postgres -d gcaa_attendance -f database\schema.sql
```

#### Step 2: Start Backend (Terminal 1)
```powershell
cd backend
npm install
# Update .env with your DB credentials
npm run dev
# Expected: "Server running on port 5000"
```

#### Step 3: Start Frontend (Terminal 2)
```powershell
cd frontend
npm install
npm start
# Expected: Opens http://localhost:3000
```

### Method 3: Manual Setup (Linux/Mac)

```bash
# Setup Database
psql -U postgres
CREATE DATABASE gcaa_attendance;
\q
psql -U postgres -d gcaa_attendance -f database/schema.sql

# Terminal 1: Backend
cd backend && npm install && npm run dev &

# Terminal 2: Frontend
cd frontend && npm install && npm start
```

---

## 📝 First Time Setup Checklist

- [ ] Database created and schema loaded
- [ ] Backend server running on http://localhost:5000
- [ ] Frontend application running on http://localhost:3000
- [ ] Can access login page
- [ ] Created a test account

---

## ✅ Verify Everything Works

### 1. Check Backend Health
```bash
curl http://localhost:5000/api/health
# Response: {"message":"Server is running"}
```

### 2. Register Test Account
- Go to: http://localhost:3000/register
- Fill in form with test data
- Click Register

### 3. Login
- Use credentials from registration
- Should see Dashboard

### 4. Test Check-In
- Click "Check In" tab
- Enter location: "Main Office"
- Click "Check In"
- Should see success message

---

## 📊 Quick Test Sequence

1. **Register**: Create test account
2. **Login**: Use test account
3. **Check-In**: Mark yourself as present
4. **Check-Out**: Mark yourself as done
5. **View Records**: See attendance history
6. **Daily Report**: View team attendance

---

## 🆘 Common Issues & Solutions

### Issue: "Can't connect to PostgreSQL"
```powershell
# Solution 1: Start PostgreSQL service (Windows)
pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start

# Solution 2: Check if running
netstat -ano | findstr :5432

# Solution 3: Use Docker instead
docker-compose up psql
```

### Issue: "Port 5000/3000 already in use"
```powershell
# Find what's using the port
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F

# Or change port in .env
# Change PORT=5000 to PORT=5001
```

### Issue: "npm command not found"
```powershell
# Install Node.js from https://nodejs.org/
# Then restart terminal
```

### Issue: "Cannot find module"
```powershell
# In the affected folder (backend or frontend)
npm install
```

---

## 🔐 Security Note (Development Only)
The `.env` files contain test credentials. For production:
- Change all passwords
- Use strong JWT secret
- Set NODE_ENV=production
- Use environment variables from deployment platform

---

## 📚 Full Documentation
- Setup: See `docs/SETUP_GUIDE.md`
- API: See `docs/API_DOCUMENTATION.md`
- Requirements: See `docs/REQUIREMENTS.md`

---

## 🎯 Next Steps After Setup

1. **Explore the UI**: Try all buttons and features
2. **Test Check-in/Out**: Verify attendance recording
3. **View Reports**: Check daily attendance report
4. **Read Documentation**: Review API docs
5. **Customize**: Modify colors, texts, or features
6. **Deploy**: Move to production when ready

---

## 📞 Support
For issues or questions, check the docs or review application logs:
- Backend logs: Terminal running `npm run dev`
- Frontend logs: Browser console (F12)
- Database logs: PostgreSQL service logs

---

**You're all set! 🎉 Start using the attendance system!**
