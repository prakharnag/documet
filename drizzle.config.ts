import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config();
console.log("process.env.NEON_DB_HOST: ", process.env.NEON_DB_HOST);
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.NEON_DB_HOST!,
    port: Number(process.env.NEON_DB_PORT!),
    user: process.env.NEON_DB_USER!,
    password: process.env.NEON_DB_PASSWORD!,
    database: process.env.NEON_DB_NAME!,
  },
});
