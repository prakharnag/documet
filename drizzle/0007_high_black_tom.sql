ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
-- ALTER TABLE "Documents" DROP CONSTRAINT "Documents_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "Documents" ALTER COLUMN "user_id" SET DATA TYPE text;