import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.NEON_DB_URL!);
export const db = drizzle({ client: sql });

export default function main() {
    console.log('Database Connection Successful:');
  }
  main();