ALTER TABLE "content_components" ADD COLUMN "size" text;--> statement-breakpoint
ALTER TABLE "content_components" ADD COLUMN "format" text;--> statement-breakpoint
ALTER TABLE "content_components" ADD CONSTRAINT "content_components_number_unique" UNIQUE("number");--> statement-breakpoint
ALTER TABLE "content_templates" ADD CONSTRAINT "content_templates_number_unique" UNIQUE("number");--> statement-breakpoint
ALTER TABLE "content_gradients" ADD CONSTRAINT "content_gradients_number_unique" UNIQUE("number");--> statement-breakpoint
ALTER TABLE "content_designs" ADD CONSTRAINT "content_designs_number_unique" UNIQUE("number");