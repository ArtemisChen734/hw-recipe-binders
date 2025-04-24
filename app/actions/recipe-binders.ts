"use server";

import { db } from "@/app/db";
import { recipeBinders, recipes, recipeIngredients, recipeSteps, recipeShares } from "@/app/db/schema/recipe";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

export async function createRecipeBinder({
  name,
  description,
}: {
  name: string;
  description?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Please log in to create a recipe binder",
    };
  }

  try {
    const [binder] = await db
      .insert(recipeBinders)
      .values({
        name,
        description: description || null,
        userId: session.user.id,
      })
      .returning();

    return {
      success: true,
      binder,
    };
  } catch (error) {
    console.error("Failed to create recipe binder", error);
    return {
      success: false,
      error: "Failed to create recipe binder",
    };
  }
}

export async function deleteRecipeBinder(binderId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Please log in to delete a recipe binder",
    };
  }

  try {
    // Check if recipe binder belongs to current user
    const binder = await db.query.recipeBinders.findFirst({
      where: eq(recipeBinders.id, binderId),
    });

    if (!binder || binder.userId !== session.user.id) {
      return {
        success: false,
        error: "You don't have permission to delete this recipe binder",
      };
    }

    // If recipe binder has recipes, delete all recipes first
    const binderRecipes = await db.query.recipes.findMany({
      where: eq(recipes.binderId, binderId),
    });

    for (const recipe of binderRecipes) {
      await db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, recipe.id));
      await db.delete(recipeSteps).where(eq(recipeSteps.recipeId, recipe.id));
    }

    // Delete recipe binder
    await db.delete(recipeBinders).where(eq(recipeBinders.id, binderId));

    revalidatePath("/recipe-binders");
    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to delete recipe binder", error);
    return {
      success: false,
      error: "Failed to delete recipe binder",
    };
  }
}

export async function shareRecipeBinder(binderId: string, requireLogin: boolean = false) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Check if recipe binder belongs to current user
  const binder = await db.query.recipeBinders.findFirst({
    where: eq(recipeBinders.id, binderId),
  });

  if (!binder || binder.userId !== session.user.id) {
    throw new Error("Invalid recipe binder");
  }

  // Generate share link
  const shareId = crypto.randomUUID();
  const shareLink = `${process.env.NEXT_PUBLIC_APP_URL}/shared/${shareId}`;

  // Save share information
  await db.insert(recipeShares).values({
    id: shareId,
    binderId,
    shareLink,
    requireLogin,
  });

  return shareLink;
} 