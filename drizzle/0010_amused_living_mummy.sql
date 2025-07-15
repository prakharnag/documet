ALTER TABLE "waitlist" ADD COLUMN "user_type" text DEFAULT 'other' NOT NULL;--> statement-breakpoint
ALTER TABLE "waitlist" ADD COLUMN "user_type_other" text;