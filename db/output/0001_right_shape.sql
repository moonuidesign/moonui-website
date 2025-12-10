ALTER TABLE "content_components" ADD COLUMN "platform" varchar(50);--> statement-breakpoint
ALTER TABLE "content_components" ADD COLUMN "tier" varchar(50) DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "content_components" ADD COLUMN "number" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "content_gradients" ADD COLUMN "number" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "content_gradients" ADD COLUMN "type_gradient" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "content_gradients" ADD COLUMN "image" text NOT NULL;--> statement-breakpoint
ALTER TABLE "content_gradients" ADD COLUMN "tier" varchar(50) DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "content_templates" ADD COLUMN "tier" varchar(50) DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "content_templates" ADD COLUMN "number" integer;--> statement-breakpoint
ALTER TABLE "content_templates" ADD COLUMN "platform" varchar(50) DEFAULT 'web' NOT NULL;