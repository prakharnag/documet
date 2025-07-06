ALTER TABLE "Document_sections" DROP CONSTRAINT "Document_sections_Document_id_Documents_id_fk";
--> statement-breakpoint
ALTER TABLE "Document_subsections" DROP CONSTRAINT "Document_subsections_section_id_Document_sections_id_fk";
--> statement-breakpoint
ALTER TABLE "Document_sections" ADD CONSTRAINT "Document_sections_Document_id_Documents_id_fk" FOREIGN KEY ("Document_id") REFERENCES "public"."Documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Document_subsections" ADD CONSTRAINT "Document_subsections_section_id_Document_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."Document_sections"("id") ON DELETE cascade ON UPDATE no action;