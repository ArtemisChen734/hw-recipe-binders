CREATE TABLE IF NOT EXISTS "ingredient" (
	"id" text PRIMARY KEY NOT NULL,
	"recipeId" text NOT NULL,
	"name" text NOT NULL,
	"amount" text NOT NULL,
	"unit" text NOT NULL,
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recipe_binder" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"userId" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recipe" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"binderId" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shared_binder" (
	"id" text PRIMARY KEY NOT NULL,
	"binderId" text NOT NULL,
	"sharedWithUserId" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shared_recipe" (
	"id" text PRIMARY KEY NOT NULL,
	"recipeId" text NOT NULL,
	"sharedWithUserId" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "step" (
	"id" text PRIMARY KEY NOT NULL,
	"recipeId" text NOT NULL,
	"description" text NOT NULL,
	"order" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ingredient" ADD CONSTRAINT "ingredient_recipeId_recipe_id_fk" FOREIGN KEY ("recipeId") REFERENCES "public"."recipe"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipe_binder" ADD CONSTRAINT "recipe_binder_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipe" ADD CONSTRAINT "recipe_binderId_recipe_binder_id_fk" FOREIGN KEY ("binderId") REFERENCES "public"."recipe_binder"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shared_binder" ADD CONSTRAINT "shared_binder_binderId_recipe_binder_id_fk" FOREIGN KEY ("binderId") REFERENCES "public"."recipe_binder"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shared_binder" ADD CONSTRAINT "shared_binder_sharedWithUserId_user_id_fk" FOREIGN KEY ("sharedWithUserId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shared_recipe" ADD CONSTRAINT "shared_recipe_recipeId_recipe_id_fk" FOREIGN KEY ("recipeId") REFERENCES "public"."recipe"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shared_recipe" ADD CONSTRAINT "shared_recipe_sharedWithUserId_user_id_fk" FOREIGN KEY ("sharedWithUserId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "step" ADD CONSTRAINT "step_recipeId_recipe_id_fk" FOREIGN KEY ("recipeId") REFERENCES "public"."recipe"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
