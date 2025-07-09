import { pgTable, uuid, text, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';

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
  createdAt: timestamp('created_at').defaultNow(),
});

export const Waitlist = pgTable('waitlist', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  source: text('source').default('landing_page'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
