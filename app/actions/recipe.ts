import { db } from "@/app/db";
import { recipeBinders, recipes, recipeIngredients, recipeSteps, recipeShares } from "@/app/db/schema/recipe";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
// import { db } from "@/app/db";
// import { recipeBinders, recipes, recipeIngredients, recipeSteps, recipeShares } from "@/app/db/schema/recipe";
// import { eq, and } from "drizzle-orm";
// import { revalidatePath } from "next/cache";
import { auth } from "@/app/auth";

// ... existing code ...

export async function shareRecipeBinder(binderId: string, userId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Check if user has permission to share this recipe binder
  const binder = await db.query.recipeBinders.findFirst({
    where: eq(recipeBinders.id, binderId),
  });

  if (!binder || binder.userId !== session.user.id) {
    throw new Error("No permission to share this recipe binder");
  }

  // Check if already shared
  const existingShare = await db.query.recipeShares.findFirst({
    where: and(
      eq(recipeShares.binderId, binderId),
      eq(recipeShares.sharedWithId, userId)
    ),
  });

  if (existingShare) {
    throw new Error("Already shared this recipe binder");
  }

  // Create share record
  await db.insert(recipeShares).values({
    binderId,
    sharedWithId: userId,
    shareLink: `${process.env.NEXT_PUBLIC_APP_URL}/shared/${crypto.randomUUID()}`,
    requireLogin: true,
  });

  revalidatePath(`/recipe-binders/${binderId}`);
  return { success: true };
}

export async function unshareRecipeBinder(binderId: string, userId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Check if user has permission to unshare
  const binder = await db.query.recipeBinders.findFirst({
    where: eq(recipeBinders.id, binderId),
  });

  if (!binder || binder.userId !== session.user.id) {
    throw new Error("No permission to unshare");
  }

  // Delete share record
  await db.delete(recipeShares).where(
    and(
      eq(recipeShares.binderId, binderId),
      eq(recipeShares.sharedWithId, userId)
    )
  );

  revalidatePath(`/recipe-binders/${binderId}`);
  return { success: true };
}

export async function getSharedRecipeBinders() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Get all recipe binders shared with current user
  const sharedBinders = await db.query.recipeShares.findMany({
    where: eq(recipeShares.sharedWithId, session.user.id),
    with: {
      binder: {
        with: {
          recipes: true,
        },
      },
    },
  });

  return sharedBinders.map((share) => share.binder);
} 