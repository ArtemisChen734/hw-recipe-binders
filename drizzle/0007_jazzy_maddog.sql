ALTER TABLE "recipe_binders" DROP CONSTRAINT "recipe_binders_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "recipe_ingredients" DROP CONSTRAINT "recipe_ingredients_recipe_id_recipes_id_fk";
--> statement-breakpoint
ALTER TABLE "recipe_steps" DROP CONSTRAINT "recipe_steps_recipe_id_recipes_id_fk";
--> statement-breakpoint
ALTER TABLE "recipes" DROP CONSTRAINT "recipes_binder_id_recipe_binders_id_fk";
--> statement-breakpoint
ALTER TABLE "recipe_binders" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "recipe_binders" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "recipe_binders" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "recipe_binders" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ALTER COLUMN "recipe_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ALTER COLUMN "amount" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ALTER COLUMN "unit" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "recipe_shares" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "recipe_shares" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "recipe_shares" ALTER COLUMN "binder_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "recipe_shares" ALTER COLUMN "require_login" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "recipe_steps" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "recipe_steps" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "recipe_steps" ALTER COLUMN "recipe_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "recipes" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "recipes" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "recipes" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "recipes" ALTER COLUMN "binder_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "recipe_shares" ADD COLUMN "share_id" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipe_steps" ADD CONSTRAINT "recipe_steps_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipes" ADD CONSTRAINT "recipes_binder_id_recipe_binders_id_fk" FOREIGN KEY ("binder_id") REFERENCES "public"."recipe_binders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
