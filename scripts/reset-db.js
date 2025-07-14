const { Pool } = require('pg');

async function resetDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Dropping existing tables...');
    
    // Drop tables in correct order (reverse of dependencies)
    await pool.query('DROP TABLE IF EXISTS "Document_subsections"');
    await pool.query('DROP TABLE IF EXISTS "Document_sections"');
    await pool.query('DROP TABLE IF EXISTS "Documents"');
    await pool.query('DROP TABLE IF EXISTS "waitlist"');
    await pool.query('DROP TABLE IF EXISTS "__drizzle_migrations"');
    
    console.log('Tables dropped successfully');
  } catch (error) {
    console.error('Error dropping tables:', error);
  } finally {
    await pool.end();
  }
}

resetDatabase();