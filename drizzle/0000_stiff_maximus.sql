CREATE TABLE "resume_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resume_id" uuid NOT NULL,
	"section_name" text NOT NULL,
	"content" text NOT NULL,
	"embedding" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "resumes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"resume_text" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "resumes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "neon_auth.users_sync" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text,
	"raw_user_meta_data" text
);
