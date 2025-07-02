CREATE TABLE "resume_subsections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"embedding" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "resume_subsections" ADD CONSTRAINT "resume_subsections_section_id_resume_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."resume_sections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_sections" ADD CONSTRAINT "resume_sections_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_sections" DROP COLUMN "content";--> statement-breakpoint
ALTER TABLE "resume_sections" DROP COLUMN "embedding";