-- RoomView Snowflake Schema
-- Database/schema must match SNOWFLAKE_DATABASE / SNOWFLAKE_SCHEMA in .env.local.
-- The app connects with these already set, so it queries the tables unqualified.

USE SCHEMA APP_BACKEND_PROD.COLLECTION;

CREATE TABLE IF NOT EXISTS APP_BACKEND_PROD.COLLECTION.SITES (
    id VARCHAR(36) DEFAULT UUID_STRING() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    logo_url VARCHAR(500),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    theme VARCHAR(50) DEFAULT 'neuro',
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS APP_BACKEND_PROD.COLLECTION.ROOMS (
    id VARCHAR(36) DEFAULT UUID_STRING() PRIMARY KEY,
    site_id VARCHAR(36) NOT NULL REFERENCES APP_BACKEND_PROD.COLLECTION.SITES(id),
    room_number VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    notes TEXT,
    is_occupied BOOLEAN DEFAULT FALSE,
    current_patient_name VARCHAR(255),
    admitted_at TIMESTAMP_NTZ,
    pin VARCHAR(4) NOT NULL,
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS APP_BACKEND_PROD.COLLECTION.SCREENS (
    id VARCHAR(36) DEFAULT UUID_STRING() PRIMARY KEY,
    room_id VARCHAR(36) NOT NULL REFERENCES APP_BACKEND_PROD.COLLECTION.ROOMS(id) UNIQUE,
    welcome_message TEXT,
    concierge_message TEXT,
    activities TEXT,
    last_updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS APP_BACKEND_PROD.COLLECTION.SITE_BROADCAST (
    id VARCHAR(36) DEFAULT UUID_STRING() PRIMARY KEY,
    site_id VARCHAR(36) NOT NULL REFERENCES APP_BACKEND_PROD.COLLECTION.SITES(id),
    concierge_message TEXT,
    activities TEXT,
    pushed_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);


-- ── Migration: per-site TV theme ─────────────────────────────────────────────
-- Run this on the existing deployment BEFORE deploying the theming code —
-- /api/screens/[room_id] selects si.theme, and every TV screen errors without it.
-- theme picks the welcome-screen template in lib/themes.ts: 'neuro' or 'acg'.

ALTER TABLE APP_BACKEND_PROD.COLLECTION.SITES
    ADD COLUMN theme VARCHAR(50) DEFAULT 'neuro';


-- ── Adding a site ────────────────────────────────────────────────────────────
-- Generate the hash first:
--   node -e "const b=require('bcryptjs'); b.hash('yourpassword',10).then(h=>console.log(h))"
-- Check no existing slug shares the new one's first 4 characters — the TV short
-- URL /s/<first 4>/<room> resolves by prefix with LIMIT 1:
--   SELECT name, slug, LEFT(slug,4) AS short
--   FROM APP_BACKEND_PROD.COLLECTION.SITES ORDER BY slug;

-- INSERT INTO APP_BACKEND_PROD.COLLECTION.SITES (name, slug, email, password_hash, theme)
-- VALUES ('Holybourne', 'holybourne', 'admin@holybourne.example', '$2b$10$...', 'acg');
