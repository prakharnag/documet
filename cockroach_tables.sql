-- Create Documents table
CREATE TABLE IF NOT EXISTS "Documents" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "Document_text" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "s3_url" TEXT,
  "file_name" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Create Document_sections table
CREATE TABLE IF NOT EXISTS "Document_sections" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "Document_id" UUID NOT NULL REFERENCES "Documents"("id") ON DELETE CASCADE,
  "section_name" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Create Document_subsections table
CREATE TABLE IF NOT EXISTS "Document_subsections" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "section_id" UUID NOT NULL REFERENCES "Document_sections"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Create waitlist table
CREATE TABLE IF NOT EXISTS "waitlist" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT,
  "source" TEXT DEFAULT 'landing_page',
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);