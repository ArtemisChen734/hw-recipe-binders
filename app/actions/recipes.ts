"use server"

import { db } from "@/app/db"
import { recipes, recipeIngredients, recipeSteps, recipeBinders } from "@/app/db/schema/recipe"
import { auth } from "@/app/auth"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

interface FormState {
  success?: boolean;
  error?: string;
  redirectUrl?: string;
}

export async function createRecipe({
  binderId,
  name,
  description,
  ingredients,
  steps,
}: {
  binderId: string;
  name: string;
  description?: string;
  ingredients: { name: string; amount: string; unit: string }[];
  steps: { stepNumber: number; description: string }[];
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Please log in to create a recipe",
    };
  }

  try {
    // Verify recipe binder exists and belongs to current user
    const binder = await db.query.recipeBinders.findFirst({
      where: eq(recipeBinders.id, binderId),
    });

    if (!binder || binder.userId !== session.user.id) {
      return {
        success: false,
        error: "You don't have permission to create a recipe in this binder",
      };
    }

    // Create recipe
    const [recipe] = await db
      .insert(recipes)
      .values({
        name,
        description: description || null,
        binderId,
      })
      .returning();

    // Create ingredients
    if (ingredients.length > 0) {
      await db.insert(recipeIngredients).values(
        ingredients.map((ingredient) => ({
          recipeId: recipe.id,
          name: ingredient.name,
          amount: ingredient.amount,
          unit: ingredient.unit,
        }))
      );
    }

    // Create steps
    if (steps.length > 0) {
      await db.insert(recipeSteps).values(
        steps.map((step) => ({
          recipeId: recipe.id,
          stepNumber: step.stepNumber,
          description: step.description,
        }))
      );
    }

    revalidatePath(`/recipe-binders/${binderId}`);
    return {
      success: true,
      recipe,
    };
  } catch (error) {
    console.error("Failed to create recipe", error);
    return {
      success: false,
      error: "Failed to create recipe",
    };
  }
}

export async function deleteRecipe(recipeId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Please log in to delete a recipe",
    };
  }

  try {
    // Check if recipe belongs to current user
    const recipe = await db.query.recipes.findFirst({
      where: eq(recipes.id, recipeId),
      with: {
        binder: true,
      },
    });

    if (!recipe || recipe.binder.userId !== session.user.id) {
      return {
        success: false,
        error: "You don't have permission to delete this recipe",
      };
    }

    // Delete all data related to the recipe
    await db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, recipeId));
    await db.delete(recipeSteps).where(eq(recipeSteps.recipeId, recipeId));
    await db.delete(recipes).where(eq(recipes.id, recipeId));

    revalidatePath(`/recipe-binders/${recipe.binderId}`);
    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to delete recipe", error);
    return {
      success: false,
      error: "Failed to delete recipe",
    };
  }
}

export async function updateRecipe(prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Please log in to update a recipe",
    };
  }

  const recipeId = formData.get("recipeId") as string;
  const binderId = formData.get("binderId") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  try {
    // Check if recipe belongs to current user
    const recipe = await db.query.recipes.findFirst({
      where: eq(recipes.id, recipeId),
      with: {
        binder: true,
      },
    });

    if (!recipe || recipe.binder.userId !== session.user.id) {
      return {
        success: false,
        error: "You don't have permission to update this recipe",
      };
    }

    // Update recipe
    await db
      .update(recipes)
      .set({
        name,
        description: description || null,
      })
      .where(eq(recipes.id, recipeId));

    // Delete all existing ingredients and steps
    await db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, recipeId));
    await db.delete(recipeSteps).where(eq(recipeSteps.recipeId, recipeId));

    // Create new ingredients
    const ingredients: { name: string; amount: string; unit: string }[] = [];
    let index = 0;
    while (formData.get(`ingredients[${index}][name]`)) {
      ingredients.push({
        name: formData.get(`ingredients[${index}][name]`) as string,
        amount: formData.get(`ingredients[${index}][amount]`) as string,
        unit: formData.get(`ingredients[${index}][unit]`) as string,
      });
      index++;
    }

    if (ingredients.length > 0) {
      await db.insert(recipeIngredients).values(
        ingredients.map((ingredient) => ({
          recipeId,
          name: ingredient.name,
          amount: ingredient.amount,
          unit: ingredient.unit,
        }))
      );
    }

    // Create new steps
    const steps: { stepNumber: number; description: string }[] = [];
    index = 0;
    while (formData.get(`steps[${index}][stepNumber]`)) {
      steps.push({
        stepNumber: parseInt(formData.get(`steps[${index}][stepNumber]`) as string),
        description: formData.get(`steps[${index}][description]`) as string,
      });
      index++;
    }

    if (steps.length > 0) {
      await db.insert(recipeSteps).values(
        steps.map((step) => ({
          recipeId,
          stepNumber: step.stepNumber,
          description: step.description,
        }))
      );
    }

    revalidatePath(`/recipe-binders/${binderId}`);
    return {
      success: true,
      redirectUrl: `/recipe-binders/${binderId}`,
    };
  } catch (error) {
    console.error("Failed to update recipe", error);
    return {
      success: false,
      error: "Failed to update recipe",
    };
  }
} 