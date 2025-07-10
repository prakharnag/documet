//import { drizzle } from 'drizzle-orm/postgres-js';
import { drizzle } from 'drizzle-orm/node-postgres';
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}
export const db = drizzle(process.env.DATABASE_URL);
//const connectionString = process.env.DATABASE_URL!;
//const sql = postgres(connectionString);
//export const db = drizzle(sql);

export default function main() {
    console.log('Database Connection Successful:');
  }
  main();