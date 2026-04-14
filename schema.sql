-- RoomView Snowflake Schema
-- Run this in your Snowflake worksheet to set up the schema

CREATE SCHEMA IF NOT EXISTS DATAOPS_PROD.ROOMVIEW;

USE SCHEMA DATAOPS_PROD.ROOMVIEW;

CREATE TABLE IF NOT EXISTS SITES (
    id VARCHAR(36) DEFAULT UUID_STRING() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    logo_url VARCHAR(500),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS ROOMS (
    id VARCHAR(36) DEFAULT UUID_STRING() PRIMARY KEY,
    site_id VARCHAR(36) NOT NULL REFERENCES SITES(id),
    room_number VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    notes TEXT,
    is_occupied BOOLEAN DEFAULT FALSE,
    current_patient_name VARCHAR(255),
    admitted_at TIMESTAMP_NTZ,
    pin VARCHAR(4) NOT NULL,
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS SCREENS (
    id VARCHAR(36) DEFAULT UUID_STRING() PRIMARY KEY,
    room_id VARCHAR(36) NOT NULL REFERENCES ROOMS(id) UNIQUE,
    welcome_message TEXT,
    concierge_message TEXT,
    activities TEXT,
    last_updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS SITE_BROADCAST (
    id VARCHAR(36) DEFAULT UUID_STRING() PRIMARY KEY,
    site_id VARCHAR(36) NOT NULL REFERENCES SITES(id),
    concierge_message TEXT,
    activities TEXT,
    pushed_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- Example: insert your first site (replace values as needed, use bcrypt hash for password)
-- INSERT INTO SITES (name, slug, email, password_hash)
-- VALUES ('ACG Site Name', 'acg-site', 'admin@example.com', '$2b$10$...');
