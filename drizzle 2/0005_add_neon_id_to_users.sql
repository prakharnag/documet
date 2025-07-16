-- Add neon_id column to users table for Neon Auth integration
ALTER TABLE users ADD COLUMN neon_id TEXT UNIQUE; 