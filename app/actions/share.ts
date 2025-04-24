"use server";

import { db } from "@/app/db";
import { recipeShares } from "@/app/db/schema/recipe";
import { eq } from "drizzle-orm";

export async function shareRecipeBinder(binderId: string) {
  // Generate share ID
  const shareId = crypto.randomUUID();
  const sharePath = `/recipe-binders/${binderId}?shareid=${shareId}`;

  // Check if share record already exists
  const existingShare = await db.query.recipeShares.findFirst({
    where: eq(recipeShares.binderId, binderId),
  });

  if (existingShare) {
    // Update existing share record's shareId
    await db
      .update(recipeShares)
      .set({
        id: shareId,
        shareLink: sharePath,
      })
      .where(eq(recipeShares.binderId, binderId));

    return {
      success: true,
      shareLink: `${process.env.NEXT_PUBLIC_APP_URL}${sharePath}`,
    };
  }

  // Create new share record
  const [share] = await db
    .insert(recipeShares)
    .values({
      id: shareId,
      binderId,
      shareLink: sharePath,
      requireLogin: false,
    })
    .returning();

  return {
    success: true,
    shareLink: `${process.env.NEXT_PUBLIC_APP_URL}${sharePath}`,
  };
} 