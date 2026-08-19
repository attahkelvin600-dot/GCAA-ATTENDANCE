# PostgreSQL Production Implementation - Complete Guide

## 📌 Overview

Your GCAA Attendance System has been **fully converted to PostgreSQL for production use**.

### What Was Changed
✅ Auth controller → PostgreSQL  
✅ Attendance controller → PostgreSQL  
✅ Personnel controller → PostgreSQL  
✅ Added production documentation  
✅ Added setup scripts  

### What Was Kept
✅ In-memory database option (for development/testing)  
✅ All API endpoints unchanged  
✅ Frontend unchanged  
✅ Security features intact  

---

## 🗄️ PostgreSQL Installation

### Windows
1. Download: https://www.postgresql.org/download/windows/
2. Run installer
3. Remember the **postgres** password you set
4. Default port: **5432**

### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

---

## ⚡ Quick Start (Windows PowerShell)

### Option 1: Automated Setup (Easiest)
```powershell
cd c:\workspace\gcaa-attendance-system
.\setup-postgres.ps1
```

This script automatically:
- ✅ Creates database `gcaa_attendance`
- ✅ Loads the schema
- ✅ Configures `.env` file
- ✅ Displays verification results

### Option 2: Manual Setup

**Step 1: Create Database**
```powershell
psql -U postgres

# In psql prompt:
CREATE DATABASE gcaa_attendance;
\c gcaa_attendance
\i 'c:/workspace/gcaa-attendance-system/database/schema.sql'
\q
```

**Step 2: Configure Environment**
Edit `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gcaa_attendance
DB_USER=postgres
DB_PASSWORD=your_postgres_password
PORT=5000
NODE_ENV=production
JWT_SECRET=generate_long_random_string_here
CORS_ORIGIN=http://localhost:3000
```

**Step 3: Start Backend**
```powershell
cd backend
npm install
node src/server.js
```

Expected output:
```
✅ Server running on port 5000
📍 API: http://localhost:5000/api/health
🌍 Frontend: http://localhost:3000
```

**Step 4: Start Frontend** (New Terminal)
```powershell
cd frontend
npm install
npm start
```

Visit: http://localhost:3000 ✅

---

## 📂 File Structure

```
gcaa-attendance-system/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js        ← PostgreSQL
│   │   │   ├── attendanceController.js  ← PostgreSQL
│   │   │   └── personnelController.js   ← PostgreSQL
│   │   ├── config/
│   │   │   ├── database.js              ← PostgreSQL connection
│   │   │   └── memoryDb.js              ← For development
│   │   └── server.js
│   └── .env                             ← Configure here!
├── database/
│   └── schema.sql                       ← Tables & indexes
├── docs/
│   ├── POSTGRESQL_PRODUCTION_SETUP.md   ← Comprehensive guide
│   ├── POSTGRESQL_SETUP_SUMMARY.md      ← Quick reference
│   ├── PRODUCTION_DEPLOYMENT.md         ← Deployment checklist
│   └── API_DOCUMENTATION.md
├── setup-postgres.ps1                   ← Windows setup script
└── README.md
```

---

## 🧪 Verify Installation

### Check PostgreSQL Running
```bash
psql -U postgres -c "SELECT version();"
# Should return PostgreSQL version info
```

### Check Database Created
```bash
psql -U postgres -l | grep gcaa_attendance
# Should show: gcaa_attendance | postgres | UTF8 | ...
```

### Verify Tables
```bash
psql -U postgres -d gcaa_attendance -c "\dt"
# Should show:
#  public | attendance | table
#  public | personnel  | table
```

### Test Backend Connection
```bash
cd backend
node src/server.js
# Check for "Server running on port 5000"
```

### Test API Health
```bash
curl http://localhost:5000/api/health
# Response: {"message":"Server is running"}
```

---

## 🔐 Production Best Practices

### 1. Strong Credentials
```env
# ❌ Don't use
DB_PASSWORD=password123

# ✅ Do use
DB_PASSWORD=$(openssl rand -base64 24)  # Generate strong password
JWT_SECRET=$(openssl rand -base64 32)   # Generate JWT secret
```

### 2. Environment-Specific Config
```
Development:  backend/.env (use localhost)
Production:   Set via cloud dashboard (never commit)
```

### 3. Secure .env File
```bash
# Make .env readable only by owner
chmod 600 backend/.env
```

### 4. Database Backups
```bash
# Daily backup at 2 AM
0 2 * * * pg_dump -U postgres gcaa_attendance > /backups/gcaa_$(date +%Y%m%d).sql
```

### 5. Monitor Logs
```bash
# View error logs
tail -f /var/log/postgresql/postgresql-12-main.log
```

---

## 🚀 Deployment to Cloud

### Environment Variables (Must Set)
```
DB_HOST         → Your database host
DB_PORT         → Usually 5432
DB_NAME         → gcaa_attendance
DB_USER         → Your database user
DB_PASSWORD     → Strong password (never in code!)
JWT_SECRET      → Long random string
NODE_ENV        → "production"
CORS_ORIGIN     → Your domain
```

### Recommended Platforms
- **AWS RDS**: Managed PostgreSQL database
- **AWS EC2**: Full server control
- **Azure Database**: Managed PostgreSQL
- **Heroku**: Easy deployment (includes PostgreSQL)
- **DigitalOcean**: Affordable cloud VPS

### Example: Deploy to Heroku

```bash
# 1. Install Heroku CLI
nodejs -v  # Ensure Node.js installed
npm install -g heroku

# 2. Login to Heroku
heroku login

# 3. Create app
heroku create gcaa-attendance-api

# 4. Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# 5. Set environment variables
heroku config:set JWT_SECRET=your_secret_here
heroku config:set NODE_ENV=production

# 6. Deploy
git push heroku main

# 7. Initialize database
heroku run "psql -f database/schema.sql"
```

---

## 📊 Database Queries

### Useful Commands

```sql
-- View all personnel
SELECT id, name, email, role FROM personnel;

-- View today's attendance
SELECT p.name, a.check_in_time, a.check_out_time 
FROM attendance a 
JOIN personnel p ON a.personnel_id = p.id 
WHERE DATE(a.check_in_time) = CURRENT_DATE
ORDER BY a.check_in_time DESC;

-- Count check-ins today
SELECT COUNT(*) FROM attendance WHERE DATE(check_in_time) = CURRENT_DATE;

-- Average work hours
SELECT p.name, 
       AVG(EXTRACT(EPOCH FROM (a.check_out_time - a.check_in_time))/3600) as avg_hours
FROM attendance a
JOIN personnel p ON a.personnel_id = p.id
GROUP BY p.id, p.name;
```

---

## 🐛 Troubleshooting

### Issue: "Connection refused"
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql          # Linux
brew services list | grep postgresql     # macOS
# Windows: Services → PostgreSQL service
```

### Issue: "Database does not exist"
```bash
# Recreate database
psql -U postgres -d gcaa_attendance -f database/schema.sql
```

### Issue: "Password authentication failed"
```bash
# Verify credentials in .env match what you set
# Reset postgres password (if needed)
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'newpassword';"
```

### Issue: "Port 5432 already in use"
```bash
# Find what's using port 5432
netstat -ano | findstr :5432
# Or use different port in .env
DB_PORT=5433
```

---

## 📈 Performance Optimization

### Enable Query Logging
```sql
-- In PostgreSQL
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();
```

### Check Slow Queries
```sql
SELECT query, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

### Optimize Indexes
```sql
-- Already included in schema.sql, but verify
SELECT * FROM pg_stat_user_indexes;

-- Reindex if needed
REINDEX DATABASE gcaa_attendance;
```

---

## 🔄 Migration from Development

If you were using the in-memory database:

### 1. Export Development Data (if needed)
```bash
# Existing in-memory data is lost (not persistent)
# Start fresh with PostgreSQL
```

### 2. Import Sample Data
```sql
-- Add sample personnel
INSERT INTO personnel (name, employee_id, email, password, role, created_at)
VALUES (
    'John Doe',
    'NSS001',
    'john@gcaa.gov.gh',
    '$2a$10$...',  -- Bcrypt hashed password
    'personnel',
    NOW()
);
```

### 3. Test Features
- ✅ Register new account
- ✅ Login with account
- ✅ Check-in/out
- ✅ View attendance records

---

## 📋 Pre-Production Checklist

### Database
- [ ] PostgreSQL installed and running
- [ ] Database `gcaa_attendance` created
- [ ] Schema loaded (all tables exist)
- [ ] Backups configured
- [ ] Passwords secured

### Backend
- [ ] All dependencies installed (`npm install`)
- [ ] `.env` file configured with strong credentials
- [ ] Backend starts without errors
- [ ] API health check passes
- [ ] Data persists after restart

### Frontend
- [ ] Built for production (`npm run build`)
- [ ] CORS_ORIGIN configured correctly
- [ ] API endpoints verified
- [ ] Can register and login

### Security
- [ ] NODE_ENV set to "production"
- [ ] JWT_SECRET changed from default
- [ ] Passwords meet complexity requirements
- [ ] HTTPS enabled
- [ ] Firewall configured

---

## 🎯 Success Criteria

Your production setup is complete when:

✅ PostgreSQL is installed and database created  
✅ Backend connects to PostgreSQL without errors  
✅ Data persists after server restart  
✅ User can register and login  
✅ Check-in/check-out functionality works  
✅ Attendance records are saved in database  
✅ Daily reports display correct data  
✅ Backups are configured  
✅ Security best practices implemented  

---

## 📞 Support Resources

### Documentation
- [PostgreSQL Manual](https://www.postgresql.org/docs/15/)
- [Node.js Guide](https://nodejs.org/en/docs/)
- [React Production Build](https://create-react-app.dev/docs/production-build/)

### Problem Solving
1. Check logs: `backend/logs/` or PostgreSQL service logs
2. Review configuration: `backend/.env`
3. Test database: `psql -U postgres -d gcaa_attendance`
4. Test API: `curl http://localhost:5000/api/health`

### Contact
Development Team: dev@gcaa.gov.gh

---

## 🎉 Congratulations!

Your GCAA Attendance System is now **production-ready with PostgreSQL**!

**Next Steps:**
1. Install PostgreSQL
2. Run setup script or follow manual steps
3. Start backend and frontend
4. Test all features
5. Deploy to production

**Questions? See:**
- [POSTGRESQL_PRODUCTION_SETUP.md](POSTGRESQL_PRODUCTION_SETUP.md)
- [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

---

**Status**: ✅ Production Ready  
**Database**: ✅ PostgreSQL Configured  
**Security**: ✅ Best Practices Documented  
**Backup**: ✅ Strategy Provided  

**Version**: 1.0.0  
**Last Updated**: February 2026
