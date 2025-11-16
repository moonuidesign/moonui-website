CREATE TYPE "public"."content_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."type" AS ENUM('figma', 'framer');--> statement-breakpoint
ALTER TABLE "content_components" ADD COLUMN "type" "type" NOT NULL;--> statement-breakpoint
ALTER TABLE "content_components" ADD COLUMN "status" "content_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "content_templates" ADD COLUMN "type" "type" NOT NULL;--> statement-breakpoint
ALTER TABLE "content_templates" ADD COLUMN "status" "content_status" DEFAULT 'draft' NOT NULL;