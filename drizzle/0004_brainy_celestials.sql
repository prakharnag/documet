ALTER TABLE "resume_sections" DROP CONSTRAINT "resume_sections_resume_id_resumes_id_fk";
--> statement-breakpoint
ALTER TABLE "resume_subsections" DROP CONSTRAINT "resume_subsections_section_id_resume_sections_id_fk";
--> statement-breakpoint
ALTER TABLE "resume_sections" ADD CONSTRAINT "resume_sections_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_subsections" ADD CONSTRAINT "resume_subsections_section_id_resume_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."resume_sections"("id") ON DELETE cascade ON UPDATE no action;