ALTER TABLE "content_designs" 
ALTER COLUMN "image_url" SET DATA TYPE jsonb 
USING CASE 
    WHEN image_url IS NULL THEN '[]'::jsonb 
    ELSE jsonb_build_array(image_url) 
END;
ALTER TABLE "content_components" ADD COLUMN "size" text;--> statement-breakpoint
ALTER TABLE "content_components" ADD COLUMN "format" text;--> statement-breakpoint
ALTER TABLE "content_designs" ADD COLUMN "size" text;--> statement-breakpoint
ALTER TABLE "content_designs" ADD COLUMN "format" text;--> statement-breakpoint
ALTER TABLE "content_gradients" ADD COLUMN "size" text;--> statement-breakpoint
ALTER TABLE "content_gradients" ADD COLUMN "format" text;--> statement-breakpoint
ALTER TABLE "content_templates" ADD COLUMN "size" text;--> statement-breakpoint
ALTER TABLE "content_templates" ADD COLUMN "format" text;--> statement-breakpoint
ALTER TABLE "content_templates" DROP COLUMN "link_template";