ALTER TABLE "Documents" ADD COLUMN "s3_url" text;--> statement-breakpoint
ALTER TABLE "Documents" ADD COLUMN "file_name" text;--> statement-breakpoint
ALTER TABLE "Documents" DROP COLUMN "original_file_name";--> statement-breakpoint
ALTER TABLE "Documents" DROP COLUMN "original_file_key";