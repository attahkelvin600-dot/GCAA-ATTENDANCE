# GCAA Attendance System - Production Deployment Checklist

## Pre-Deployment (Development Phase)

### Backend Setup
- [ ] PostgreSQL 12+ installed and running
- [ ] Database `gcaa_attendance` created
- [ ] Schema loaded from `database/schema.sql`
- [ ] Backend `.env` configured with PostgreSQL credentials
- [ ] All npm packages installed: `npm install`
- [ ] Backend starts without errors: `node src/server.js`
- [ ] Health check passes: `http://localhost:5000/api/health`

### Frontend Setup
- [ ] Frontend npm packages installed: `npm install`
- [ ] Frontend environment configured
- [ ] Frontend builds successfully: `npm run build`
- [ ] Frontend starts without errors: `npm start`
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Can perform check-in/check-out

### Testing
- [ ] User registration works
- [ ] Login/logout works
- [ ] Check-in functionality works
- [ ] Check-out functionality works
- [ ] Attendance records display correctly
- [ ] Location metadata persists (`location_name`, `latitude`, `longitude`)
- [ ] Records show location details and map link correctly
- [ ] Daily reports generate correctly
- [ ] Admin functions work (if applicable)

---

## Database Configuration for Production

### 1. PostgreSQL Setup

```bash
# Create database
createdb -U postgres gcaa_attendance

# Apply schema
psql -U postgres -d gcaa_attendance -f database/schema.sql

# Verify
psql -U postgres -d gcaa_attendance
\dt  # Should show personnel and attendance tables
```

### 2. Create Production User (Optional)
```sql
-- Create dedicated production user (instead of using 'postgres')
CREATE USER gcaa_prod WITH PASSWORD 'strong_password_here';
CREATE DATABASE gcaa_attendance_prod OWNER gcaa_prod;

-- Apply schema to production database
psql -U gcaa_prod -d gcaa_attendance_prod -f database/schema.sql
```

### 3. Update .env for Production
```env
# Database
DB_HOST=your_db_host.com  # Or localhost for local production
DB_PORT=5432
DB_NAME=gcaa_attendance
DB_USER=postgres  # or gcaa_prod
DB_PASSWORD=your_strong_password

# Server
PORT=5000
NODE_ENV=production

# Security
JWT_SECRET=generate_a_very_long_random_string_here_minimum_32_characters
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=https://your-domain.com
```

---

## Backend Deployment

### Local/On-Premise Deployment

1. **Environment Setup**
   - [ ] Node.js v14+ installed
   - [ ] PostgreSQL running and accessible
   - [ ] All .env variables set correctly

2. **Start Backend**
   ```bash
   cd backend
   npm install
   node src/server.js
   ```

3. **Verify Running**
   ```bash
   curl http://your_server:5000/api/health
   # Should return: {"message":"Server is running"}
   ```

### Cloud Deployment (AWS/Azure/Heroku)

#### AWS EC2
1. Create EC2 instance (t2.micro or larger)
2. Install Node.js and PostgreSQL
3. Clone repository
4. Configure .env
5. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name "gcaa-backend"
   pm2 startup
   pm2 save
   ```
6. Setup Nginx as reverse proxy
7. Enable SSL with Let's Encrypt

#### Heroku
1. Install Heroku CLI
2. Create app: `heroku create gcaa-attendance`
3. Add PostgreSQL addon: `heroku addons:create heroku-postgresql:hobby-dev`
4. Set environment variables: `heroku config:set JWT_SECRET=xxx`
5. Deploy: `git push heroku main`

#### Azure App Service
1. Create App Service + PostgreSQL
2. Upload code or connect GitHub
3. Configure Connection strings in Application settings
4. Deploy from portal or CI/CD pipeline

---

## Frontend Deployment

### Build for Production
```bash
cd frontend
npm run build
# Creates optimized build in build/ folder
```

### Local Hosting
```bash
# Use http-server or similar
npx serve -s build -l 3000
```

### Cloud Hosting Options

#### AWS S3 + CloudFront
```bash
aws s3 sync build/ s3://my-bucket/
aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"
```

#### Vercel (Recommended for React)
```bash
npm install -g vercel
vercel
# Follow prompts to deploy
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

#### GitHub Pages
```bash
npm run build
# Configure GitHub Actions to deploy build/ folder
```

---

## Security Configuration

### Environment Variables
```env
# ❌ NEVER commit these:
JWT_SECRET=xxxx
DB_PASSWORD=xxxx

# ✅ Use environment-specific configuration:
# Development: .env.local (gitignored)
# Production: Set via cloud platform dashboard
```

### HTTPS/SSL
- [ ] Install SSL certificate (Let's Encrypt is free)
- [ ] Configure backend for HTTPS
- [ ] Update frontend to use https:// URLs
- [ ] Enable HSTS headers

### Database Security
- [ ] Change default postgres password
- [ ] Use strong passwords (20+ characters)
- [ ] Enable database backups
- [ ] Restrict database access to backend only
- [ ] Use database encryption if available

### API Security
- [ ] Enable CORS only for your domain
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Enable authentication on all protected endpoints
- [ ] Log all API requests

---

## Monitoring & Maintenance

### Health Monitoring
```bash
# Check backend health
curl https://your-domain.com/api/health

# Monitor logs
tail -f backend/logs/app.log

# Check database
psql -U postgres -d gcaa_attendance -c "SELECT count(*) FROM personnel;"
```

### Automated Backups
```bash
# Daily backup at 2 AM
0 2 * * * pg_dump -U postgres gcaa_attendance > /backups/gcaa_$(date +%Y%m%d).sql
```

### Performance Monitoring
- [ ] Set up application monitoring (New Relic, DataDog)
- [ ] Monitor database performance
- [ ] Track API response times
- [ ] Monitor disk space
- [ ] Track error rates

---

## Backup & Recovery Plan

### Database Backups
```bash
# Full backup
pg_dump -U postgres gcaa_attendance > gcaa_attendance_$(date +%Y%m%d).sql

# Compressed backup
pg_dump -U postgres gcaa_attendance | gzip > gcaa_attendance_$(date +%Y%m%d).sql.gz

# Restore
psql -U postgres gcaa_attendance < gcaa_attendance_20260212.sql
```

### Backup Storage
- [ ] Store backups on separate server/cloud
- [ ] Keep multiple versions (daily, weekly, monthly)
- [ ] Test restore process monthly
- [ ] Document recovery procedure

---

## Performance Optimization

### Database Optimization
```sql
-- Analyze queries
EXPLAIN ANALYZE SELECT * FROM attendance;

-- Vacuum and analyze
VACUUM ANALYZE;

-- Check indexes
SELECT * FROM pg_stat_user_indexes;
```

### Frontend Optimization
- [ ] Minify CSS/JavaScript
- [ ] Optimize images
- [ ] Enable gzip compression
- [ ] Use CDN for static assets
- [ ] Cache static content

### Backend Optimization
- [ ] Use connection pooling
- [ ] Cache frequently accessed data
- [ ] Compress API responses
- [ ] Optimize database queries
- [ ] Use indexes on frequently queried columns

---

## Post-Deployment

### Day 1
- [ ] Test all core features
- [ ] Verify backups are working
- [ ] Check error logs
- [ ] Monitor performance metrics
- [ ] Test with sample users

### Week 1
- [ ] Monitor for bugs/errors
- [ ] Check database growth rate
- [ ] Verify backup restoration works
- [ ] Get user feedback
- [ ] Document any issues

### Ongoing
- [ ] Daily: Monitor logs and alerts
- [ ] Weekly: Review performance metrics
- [ ] Monthly: Security updates and patches
- [ ] Quarterly: Disaster recovery drill
- [ ] Annually: Full security audit

---

## Rollback Plan

If issues occur in production:

1. **Immediate Actions**
   - [ ] Stop accepting new requests (if needed)
   - [ ] Switch to rollback version
   - [ ] Notify users

2. **Communication**
   - [ ] Post status update
   - [ ] Provide estimated timeline
   - [ ] Keep users informed

3. **Investigation**
   - [ ] Check logs for errors
   - [ ] Identify root cause
   - [ ] Review recent changes

4. **Fix & Redeploy**
   - [ ] Apply fix to code
   - [ ] Test thoroughly
   - [ ] Deploy to production
   - [ ] Verify fix works

---

## Contact & Support

**Production Support Contacts:**
- System Admin: admin@gcaa.gov.gh
- Database Admin: dbadmin@gcaa.gov.gh
- Development Lead: dev.lead@gcaa.gov.gh

**On-Call Number:** +233 XXX XXX XXXX
**Status Page:** https://status.gcaa.gov.gh

---

**Last Updated:** February 2026  
**Next Review:** May 2026
