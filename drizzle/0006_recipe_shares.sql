CREATE TABLE IF NOT EXISTS "recipe_shares" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "binder_id" uuid NOT NULL REFERENCES "recipe_binders"("id") ON DELETE CASCADE,
  "share_link" text NOT NULL,
  "require_login" boolean DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
); 