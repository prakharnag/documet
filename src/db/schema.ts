import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const Documents = pgTable('Documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  DocumentText: text('Document_text').notNull(),
  slug: text('slug').unique().notNull(),
  s3Url: text('s3_url'),
  fileName: text('file_name'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const DocumentSections = pgTable('Document_sections', {
  id: uuid('id').defaultRandom().primaryKey(),
  DocumentId: uuid('Document_id').notNull().references(() => Documents.id, { onDelete: 'cascade' }),
  sectionName: text('section_name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const DocumentSubsections = pgTable('Document_subsections', {
  id: uuid('id').defaultRandom().primaryKey(),
  sectionId: uuid('section_id').notNull().references(() => DocumentSections.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  embedding: jsonb('embedding').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
