ALTER TABLE "users" ADD COLUMN "neon_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_neon_id_unique" UNIQUE("neon_id");