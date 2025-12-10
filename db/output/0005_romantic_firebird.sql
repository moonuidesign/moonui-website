ALTER TABLE "content_designs" RENAME COLUMN "asset_url" TO "image_url";--> statement-breakpoint
ALTER TABLE "category_components" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "category_designs" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "category_gradients" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "category_templates" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "content_designs" DROP COLUMN "url_preview";--> statement-breakpoint
ALTER TABLE "content_designs" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "content_designs" DROP COLUMN "link_template";--> statement-breakpoint
ALTER TABLE "content_designs" DROP COLUMN "platform";