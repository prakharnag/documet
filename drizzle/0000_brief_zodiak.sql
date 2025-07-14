CREATE TABLE "Document_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"Document_id" uuid NOT NULL,
	"section_name" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Document_subsections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"Document_text" text NOT NULL,
	"slug" text NOT NULL,
	"s3_url" text,
	"file_name" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "Documents_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"source" text DEFAULT 'landing_page',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "waitlist_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "Document_sections" ADD CONSTRAINT "Document_sections_Document_id_Documents_id_fk" FOREIGN KEY ("Document_id") REFERENCES "public"."Documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Document_subsections" ADD CONSTRAINT "Document_subsections_section_id_Document_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."Document_sections"("id") ON DELETE cascade ON UPDATE no action;