ALTER TABLE "content_templates" RENAME COLUMN "asset_url" TO "images_url";--> statement-breakpoint
ALTER TABLE "content_designs" RENAME COLUMN "image_url" TO "images_url";--> statement-breakpoint
ALTER TABLE "content_components" ADD COLUMN "url_buy_one_time" text;--> statement-breakpoint
ALTER TABLE "content_templates" ADD COLUMN "url_buy_one_time" text;--> statement-breakpoint
ALTER TABLE "content_gradients" ADD COLUMN "url_buy_one_time" text;--> statement-breakpoint
ALTER TABLE "content_designs" ADD COLUMN "url_buy_one_time" text;--> statement-breakpoint
ALTER TABLE "content_components" DROP COLUMN "platform";--> statement-breakpoint
ALTER TABLE "content_templates" DROP COLUMN "platform";