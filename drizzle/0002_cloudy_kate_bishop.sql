ALTER TABLE "resumes" ADD COLUMN "original_file_name" text;--> statement-breakpoint
ALTER TABLE "resumes" ADD COLUMN "original_file_key" text;--> statement-breakpoint
ALTER TABLE "resumes" DROP COLUMN "s3_url";--> statement-breakpoint
ALTER TABLE "resumes" DROP COLUMN "file_name";