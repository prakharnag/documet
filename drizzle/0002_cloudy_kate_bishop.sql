ALTER TABLE "Documents" ADD COLUMN "original_file_name" text;--> statement-breakpoint
ALTER TABLE "Documents" ADD COLUMN "original_file_key" text;--> statement-breakpoint
ALTER TABLE "Documents" DROP COLUMN "s3_url";--> statement-breakpoint
ALTER TABLE "Documents" DROP COLUMN "file_name";