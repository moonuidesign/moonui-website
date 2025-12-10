CREATE TABLE "category_designs" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"parent_id" text,
	"user_id" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_designs" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" jsonb NOT NULL,
	"description" text,
	"asset_url" jsonb NOT NULL,
	"url_preview" text,
	"type" text NOT NULL,
	"link_template" text,
	"link_download" text NOT NULL,
	"tier" varchar(50) DEFAULT 'free' NOT NULL,
	"number" integer,
	"platform" varchar(50) DEFAULT 'web' NOT NULL,
	"status_content" text DEFAULT 'draft' NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"download_count" integer DEFAULT 0,
	"user_id" text NOT NULL,
	"category_designs_id" text,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "license_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"license_id" text,
	"transaction_type" varchar(50) DEFAULT 'activation' NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"status" varchar(50) DEFAULT 'success' NOT NULL,
	"metadata" jsonb,
	"createdAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "category_components" DROP CONSTRAINT "category_components_slug_unique";--> statement-breakpoint
ALTER TABLE "category_gradients" DROP CONSTRAINT "category_gradients_slug_unique";--> statement-breakpoint
ALTER TABLE "category_templates" DROP CONSTRAINT "category_templates_slug_unique";--> statement-breakpoint
ALTER TABLE "content_components" ADD COLUMN "slug" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "content_gradients" ADD COLUMN "slug" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "content_templates" ADD COLUMN "slug" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "licenses" ADD COLUMN "plan_type" varchar(50) DEFAULT 'subscribe' NOT NULL;--> statement-breakpoint
ALTER TABLE "licenses" ADD COLUMN "tier" varchar(50) DEFAULT 'pro' NOT NULL;--> statement-breakpoint
ALTER TABLE "category_designs" ADD CONSTRAINT "category_designs_parent_id_category_designs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."category_designs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_designs" ADD CONSTRAINT "category_designs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_designs" ADD CONSTRAINT "content_designs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_designs" ADD CONSTRAINT "content_designs_category_designs_id_category_designs_id_fk" FOREIGN KEY ("category_designs_id") REFERENCES "public"."category_designs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_transactions" ADD CONSTRAINT "license_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_transactions" ADD CONSTRAINT "license_transactions_license_id_licenses_id_fk" FOREIGN KEY ("license_id") REFERENCES "public"."licenses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_components" DROP COLUMN "slug";--> statement-breakpoint
ALTER TABLE "category_gradients" DROP COLUMN "slug";--> statement-breakpoint
ALTER TABLE "category_templates" DROP COLUMN "slug";