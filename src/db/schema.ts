import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Users table for authentication
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const resumes = pgTable('resumes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  resumeText: text('resume_text').notNull(),
  slug: text('slug').unique().notNull(),
  s3Url: text('s3_url'),
  fileName: text('file_name'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const resumeSections = pgTable('resume_sections', {
  id: uuid('id').defaultRandom().primaryKey(),
  resumeId: uuid('resume_id').notNull().references(() => resumes.id, { onDelete: 'cascade' }),
  sectionName: text('section_name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const resumeSubsections = pgTable('resume_subsections', {
  id: uuid('id').defaultRandom().primaryKey(),
  sectionId: uuid('section_id').notNull().references(() => resumeSections.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  embedding: jsonb('embedding').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
