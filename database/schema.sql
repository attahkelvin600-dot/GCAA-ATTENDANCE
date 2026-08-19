-- GCAA Attendance System Database Schema
-- PostgreSQL

-- Create database (if not exists)
-- CREATE DATABASE gcaa_attendance;

-- Personnel Table
CREATE TABLE IF NOT EXISTS personnel (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verification_token VARCHAR(64),
    email_verification_expires_at TIMESTAMP,
    role VARCHAR(50) DEFAULT 'personnel', -- 'personnel', 'supervisor', 'admin'
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    personnel_id INTEGER NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP NOT NULL,
    check_out_time TIMESTAMP,
    location VARCHAR(255),
    location_name VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    notes TEXT,
    checkout_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure new location metadata columns exist on already-created databases
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS location_name VARCHAR(255);
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Ensure email verification columns exist on already-created databases
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(64);
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_personnel_email ON personnel(email);
CREATE INDEX IF NOT EXISTS idx_personnel_employee_id ON personnel(employee_id);
CREATE INDEX IF NOT EXISTS idx_personnel_verification_token ON personnel(email_verification_token);
CREATE INDEX IF NOT EXISTS idx_attendance_personnel_id ON attendance(personnel_id);
CREATE INDEX IF NOT EXISTS idx_attendance_check_in_date ON attendance(DATE(check_in_time));

-- Create View for Daily Reports
CREATE OR REPLACE VIEW daily_attendance_report AS
SELECT 
    p.id,
    p.name,
    p.employee_id,
    COALESCE(a.check_in_time, NULL) AS check_in,
    COALESCE(a.check_out_time, NULL) AS check_out,
    CASE 
        WHEN a.check_in_time IS NULL THEN 'Absent'
        WHEN a.check_out_time IS NULL THEN 'Still In'
        ELSE 'Present'
    END AS status
FROM personnel p
LEFT JOIN attendance a ON p.id = a.personnel_id AND DATE(a.check_in_time) = CURRENT_DATE
WHERE p.status = 'active'
ORDER BY p.name;
