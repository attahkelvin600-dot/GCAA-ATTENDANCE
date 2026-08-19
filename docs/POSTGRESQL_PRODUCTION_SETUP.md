# PostgreSQL Production Setup Guide

## Prerequisites
- PostgreSQL 12+ installed
- Windows, macOS, or Linux

---

## 1. Download & Install PostgreSQL

### Windows
1. Download from: https://www.postgresql.org/download/windows/
2. Run installer
3. Choose default PostgreSQL port: **5432**
4. Remember the **postgres** superuser password (you'll need it)
5. Check "Launch Stack Builder at exit" (optional)

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

## 2. Create Database & User

### Option A: Using pgAdmin (GUI)
1. Open pgAdmin (installed with PostgreSQL on Windows)
2. Right-click "Databases" → Create → Database
3. Name: `gcaa_attendance`
4. Click "Save"

### Option B: Using Command Line (All Platforms)

**Windows PowerShell:**
```powershell
# Connect to PostgreSQL
psql -U postgres

# You'll be prompted for the password you set during installation
```

**macOS/Linux Terminal:**
```bash
psql -U postgres
```

**In the psql prompt, run these commands:**
```sql
-- Create database
CREATE DATABASE gcaa_attendance;

-- Connect to the database
\c gcaa_attendance

-- Run the schema
\i 'c:/workspace/gcaa-attendance-system/database/schema.sql'

-- Exit
\q
```

---

## 3. Verify Database Setup

```bash
# Connect to the new database
psql -U postgres -d gcaa_attendance

# Inside psql, list tables
\dt

# Should show:
#  public | attendance      | table
#  public | personnel       | table

# Exit
\q
```

---

## 4. Configure Backend Environment

Update [backend/.env](file://backend/.env) with your PostgreSQL credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gcaa_attendance
DB_USER=postgres
DB_PASSWORD=<your_postgres_password>

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your_very_long_random_secret_key_change_this_in_production_12345
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=https://yourdomain.com
```

---

## 5. Test Database Connection

```powershell
# From backend directory
cd c:\workspace\gcaa-attendance-system\backend

# Start the server
node src/server.js
```

**Expected output:**
```
✅ Server running on port 5000
📍 API: http://localhost:5000/api/health
🌍 Frontend: http://localhost:3000
```

---

## 6. Create Initial Admin User

Use the API to register an admin account:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "employee_id": "ADMIN001",
    "email": "admin@gcaa.gov.gh",
    "password": "SecurePassword123",
    "role": "admin"
  }'
```

Or visit the frontend registration page at http://localhost:3000

---

## 7. Database Backup & Maintenance

### Automated Daily Backup (Windows Task Scheduler)

1. Create a batch file `backup.bat`:
```batch
@echo off
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
pg_dump -U postgres gcaa_attendance > C:\backups\gcaa_attendance_%mydate%.sql
```

2. Open Task Scheduler
3. Create Basic Task → Set trigger to Daily at 2 AM
4. Set action to run `backup.bat`

### Automated Backup (Linux/macOS)

Add to crontab:
```bash
crontab -e

# Add this line:
0 2 * * * /usr/bin/pg_dump -U postgres gcaa_attendance > /backups/gcaa_attendance_$(date +\%Y\%m\%d).sql
```

### Manual Backup
```bash
pg_dump -U postgres gcaa_attendance > backup.sql
```

### Restore from Backup
```bash
psql -U postgres -d gcaa_attendance -f backup.sql
```

---

## 8. Production Deployment

### On Cloud (AWS RDS/Azure Database/Heroku)

1. Create managed PostgreSQL instance
2. Update `.env` with cloud database credentials:
   ```env
   DB_HOST=my-db.region.rds.amazonaws.com
   DB_PORT=5432
   DB_NAME=gcaa_attendance
   DB_USER=postgres
   DB_PASSWORD=cloud_password
   ```
3. Run schema on cloud database:
   ```bash
   psql -h my-db.region.rds.amazonaws.com -U postgres -d gcaa_attendance -f database/schema.sql
   ```
4. Deploy backend to your cloud platform

---

## 9. Troubleshooting

| Issue | Solution |
|-------|----------|
| "Connection refused" | Check PostgreSQL service is running: `sudo systemctl status postgresql` |
| "database does not exist" | Run schema.sql on the gcaa_attendance database |
| "password authentication failed" | Verify DB_PASSWORD in .env matches postgres password |
| "port 5432 already in use" | Change DB_PORT in .env or stop conflicting service |
| "permission denied for schema public" | Ensure postgres user has permissions: `GRANT ALL ON SCHEMA public TO postgres` |

---

## 10. Security Best Practices

✅ **Do:**
- Use strong, random passwords
- Set `NODE_ENV=production`
- Use HTTPS in production
- Regularly backup data
- Update PostgreSQL regularly
- Use environment variables for secrets

❌ **Don't:**
- Commit `.env` file to Git
- Use default passwords
- Expose database credentials in code
- Allow direct database access from internet
- Skip backups

---

## 11. Performance Tuning

For large deployments, optimize PostgreSQL:

```sql
-- Check slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC LIMIT 10;

-- Create indexes (already in schema.sql)
CREATE INDEX idx_attendance_personnel_id ON attendance(personnel_id);
CREATE INDEX idx_attendance_check_in_date ON attendance(DATE(check_in_time));

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM attendance WHERE personnel_id = 1;
```

---

## 12. Monitoring & Alerts

### PostgreSQL Status (Linux/macOS)
```bash
psql -U postgres -d gcaa_attendance -c "SELECT version();"
```

### Check Database Size
```sql
SELECT pg_database.datname, 
       pg_size_pretty(pg_database_size(pg_database.datname)) 
FROM pg_database 
ORDER BY pg_database_size(pg_database.datname) DESC;
```

### Connection Information
```sql
SELECT count(*) as connection_count FROM pg_stat_activity;
```

---

**Production system ready! 🚀 Your GCAA Attendance System now uses PostgreSQL.**

For additional help, see:
- [PostgreSQL Official Docs](https://www.postgresql.org/docs/)
- [Backend Setup Guide](docs/SETUP_GUIDE.md)
