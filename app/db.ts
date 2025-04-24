import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import { eq } from 'drizzle-orm';

import { users } from "./db/schema/auth";
import * as schema from "./db/schema";
import { recipeShares } from "./db/schema/recipe";
import { genSaltSync, hashSync } from "bcrypt-ts";


export const db = drizzle(sql, { schema: { ...schema, recipeShares } });

export async function getUser(email: string) {
	return await db.select().from(users).where(eq(users.email, email));
}

export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  return await db.insert(users).values({ email: email, password: hash });
}