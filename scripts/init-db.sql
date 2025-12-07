-- =============================================================================
-- Database Initialization Script
-- This script runs automatically when the database container starts
-- =============================================================================

-- Set character set and collation
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Create database if not exists (already created by MYSQL_DATABASE env var)
-- This is just for reference
-- CREATE DATABASE IF NOT EXISTS texttile CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant privileges (already handled by MYSQL_USER env var)
-- This is just for reference
-- GRANT ALL PRIVILEGES ON texttile.* TO 'user'@'%';
-- FLUSH PRIVILEGES;

-- Log initialization
SELECT 'Database initialized successfully' AS status;
