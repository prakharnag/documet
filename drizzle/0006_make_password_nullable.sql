-- Make password column nullable for Neon Auth users
ALTER TABLE users ALTER COLUMN password DROP NOT NULL; 