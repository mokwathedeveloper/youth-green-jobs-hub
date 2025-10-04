-- Setup script for Youth Green Jobs PostgreSQL database
-- Run this as postgres user: sudo -u postgres psql -f setup_database.sql

-- Create user
CREATE USER youth_green_jobs_user WITH PASSWORD 'password123';

-- Create database
CREATE DATABASE youth_green_jobs_db OWNER youth_green_jobs_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE youth_green_jobs_db TO youth_green_jobs_user;

-- Connect to the database and grant schema privileges
\c youth_green_jobs_db;
GRANT ALL ON SCHEMA public TO youth_green_jobs_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO youth_green_jobs_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO youth_green_jobs_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO youth_green_jobs_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO youth_green_jobs_user;

\q
