CREATE TABLE "invites" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"role" varchar(50) NOT NULL,
	"token" text NOT NULL,
	"inviterId" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"expires" timestamp NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "invites_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_inviterId_users_id_fk" FOREIGN KEY ("inviterId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;