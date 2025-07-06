-- Drop existing tables and recreate with new schema
DROP TABLE IF EXISTS "Document_subsections" CASCADE;
DROP TABLE IF EXISTS "Document_sections" CASCADE;
DROP TABLE IF EXISTS "Documents" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Create users table
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create Documents table
CREATE TABLE "Documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"Document_text" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create Document_sections table
CREATE TABLE "Document_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"Document_id" uuid NOT NULL,
	"section_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Document_sections_Document_id_Documents_id_fk" FOREIGN KEY ("Document_id") REFERENCES "Documents"("id") ON DELETE CASCADE
);

-- Create Document_subsections table
CREATE TABLE "Document_subsections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"embedding" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Document_subsections_section_id_Document_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "Document_sections"("id") ON DELETE CASCADE
); 