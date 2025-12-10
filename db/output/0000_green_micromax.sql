CREATE TABLE "accounts" (
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "category_components" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"description" text,
	"parent_id" text,
	"user_id" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "category_components_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "category_gradients" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"parent_id" text,
	"user_id" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "category_gradients_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "category_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"description" text,
	"parent_id" text,
	"user_id" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "category_templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "content_components" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"image_url" text,
	"copy_component_html" jsonb NOT NULL,
	"copy_component_plain" jsonb NOT NULL,
	"type" text NOT NULL,
	"status_content" text DEFAULT 'draft' NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"copy_count" integer DEFAULT 0 NOT NULL,
	"user_id" text NOT NULL,
	"category_components_id" text,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_gradients" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"colors" jsonb NOT NULL,
	"link_download" text NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"user_id" text NOT NULL,
	"category_gradients_id" text,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"asset_url" jsonb NOT NULL,
	"url_preview" text,
	"type" text NOT NULL,
	"link_template" text,
	"link_download" text NOT NULL,
	"status_content" text DEFAULT 'draft' NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"download_count" integer DEFAULT 0,
	"user_id" text NOT NULL,
	"category_templates_id" text,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "licenses" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"license_key" text NOT NULL,
	"status" varchar(50) DEFAULT 'inactive' NOT NULL,
	"expires_at" timestamp with time zone,
	"activated_at" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "licenses_license_key_unique" UNIQUE("license_key")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"password" text,
	"roleUser" varchar(50) DEFAULT 'user' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_components" ADD CONSTRAINT "category_components_parent_id_category_components_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."category_components"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_components" ADD CONSTRAINT "category_components_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_gradients" ADD CONSTRAINT "category_gradients_parent_id_category_gradients_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."category_gradients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_gradients" ADD CONSTRAINT "category_gradients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_templates" ADD CONSTRAINT "category_templates_parent_id_category_templates_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."category_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_templates" ADD CONSTRAINT "category_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_components" ADD CONSTRAINT "content_components_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_components" ADD CONSTRAINT "content_components_category_components_id_category_components_id_fk" FOREIGN KEY ("category_components_id") REFERENCES "public"."category_components"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_gradients" ADD CONSTRAINT "content_gradients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_gradients" ADD CONSTRAINT "content_gradients_category_gradients_id_category_gradients_id_fk" FOREIGN KEY ("category_gradients_id") REFERENCES "public"."category_gradients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_templates" ADD CONSTRAINT "content_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_templates" ADD CONSTRAINT "content_templates_category_templates_id_category_templates_id_fk" FOREIGN KEY ("category_templates_id") REFERENCES "public"."category_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "license_key_index" ON "licenses" USING btree ("license_key");--> statement-breakpoint
CREATE INDEX "user_id_index" ON "licenses" USING btree ("user_id");