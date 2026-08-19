# PostgreSQL Setup Script for Windows
# This script helps set up PostgreSQL database for GCAA Attendance System
# Run as Administrator in PowerShell

$PostgresPassword = "password"  # Change this to your secure password!
$DatabaseName = "gcaa_attendance"
$SchemaPath = ".\database\schema.sql"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GCAA Attendance System - PostgreSQL Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if PostgreSQL is installed
Write-Host "`nChecking PostgreSQL installation..." -ForegroundColor Yellow

$PgPath = "C:\Program Files\PostgreSQL\15\bin\psql.exe"
if (-Not (Test-Path $PgPath)) {
    $PgPath = "C:\Program Files\PostgreSQL\14\bin\psql.exe"
}
if (-Not (Test-Path $PgPath)) {
    $PgPath = "C:\Program Files\PostgreSQL\13\bin\psql.exe"
}

if (-Not (Test-Path $PgPath)) {
    Write-Host "❌ PostgreSQL not found!" -ForegroundColor Red
    Write-Host "Please install PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit
}

Write-Host "✅ PostgreSQL found at: $PgPath" -ForegroundColor Green

# Create database
Write-Host "`nCreating database: $DatabaseName" -ForegroundColor Yellow

$CreateDbCmd = @"
CREATE DATABASE $DatabaseName;
"@

$CreateDbCmd | & "$PgPath" -U postgres -h localhost

if ($LASTEXITCODE -ne 0) {
    Write-Host "Database may already exist (this is OK)" -ForegroundColor Yellow
}

# Wait a moment
Start-Sleep -Seconds 2

# Run schema
Write-Host "`nApplying database schema..." -ForegroundColor Yellow

if (-Not (Test-Path $SchemaPath)) {
    Write-Host "❌ Schema file not found: $SchemaPath" -ForegroundColor Red
    exit
}

& "$PgPath" -U postgres -d $DatabaseName -f $SchemaPath

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database schema applied successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Error applying schema" -ForegroundColor Red
    exit
}

# Verify tables
Write-Host "`nVerifying tables..." -ForegroundColor Yellow

$VerifyCmd = @"
\dt
"@

$VerifyCmd | & "$PgPath" -U postgres -d $DatabaseName

# Update .env file
Write-Host "`nUpdating .env file..." -ForegroundColor Yellow

$EnvPath = ".\backend\.env"
$EnvContent = @"
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DatabaseName
DB_USER=postgres
DB_PASSWORD=$PostgresPassword

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_$(Get-Random)
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=https://yourdomain.com
"@

Set-Content -Path $EnvPath -Value $EnvContent

Write-Host "✅ .env file updated" -ForegroundColor Green

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "PostgreSQL Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host @"
✅ Database created: $DatabaseName
✅ Tables created from schema
✅ .env file configured

Next steps:
1. Update DB_PASSWORD in backend\.env with your postgres password
2. Start PostgreSQL service: net start postgresql-x64-15
3. Start backend: cd backend && node src/server.js
4. Start frontend: cd frontend && npm start

To verify connection:
psql -U postgres -d $DatabaseName
"@ -ForegroundColor Green

Write-Host "`nPress any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
