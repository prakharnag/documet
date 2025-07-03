ALTER TABLE "resumes" ADD COLUMN "s3_url" text;--> statement-breakpoint
ALTER TABLE "resumes" ADD COLUMN "file_name" text;--> statement-breakpoint
ALTER TABLE "resumes" DROP COLUMN "original_file_name";--> statement-breakpoint
ALTER TABLE "resumes" DROP COLUMN "original_file_key";