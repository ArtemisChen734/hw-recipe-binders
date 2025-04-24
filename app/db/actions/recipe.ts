import { db } from '@/app/db';
import { recipeBinders, recipes, recipeIngredients, recipeSteps } from '@/app/db/schema/recipe';
import { eq } from "drizzle-orm";

export async function createRecipeBinder(userId: string, name: string, description?: string) {
  const [binder] = await db
    .insert(recipeBinders)
    .values({
      name,
      description,
      userId,
    })
    .returning();

  return binder;
}

export async function createRecipe(binderId: string, name: string, description?: string) {
  const [recipe] = await db
    .insert(recipes)
    .values({
      name,
      description,
      binderId,
    })
    .returning();

  return recipe;
}

export async function addIngredient(recipeId: string, name: string, amount: string, unit: string) {
  const [ingredient] = await db
    .insert(recipeIngredients)
    .values({
      recipeId,
      name,
      amount,
      unit,
    })
    .returning();

  return ingredient;
}

export async function addStep(recipeId: string, stepNumber: number, description: string) {
  const [step] = await db
    .insert(recipeSteps)
    .values({
      recipeId,
      stepNumber,
      description,
    })
    .returning();

  return step;
}

export async function getRecipeBinder(id: string) {
  const result = await db
    .select({
      binder: recipeBinders,
      recipe: recipes,
    })
    .from(recipeBinders)
    .leftJoin(recipes, eq(recipes.binderId, recipeBinders.id))
    .where(eq(recipeBinders.id, id));

  if (!result.length) {
    return null;
  }

  return {
    ...result[0].binder,
    recipes: result.map(r => r.recipe).filter(Boolean),
  };
}

export async function getRecipe(id: string) {
  const result = await db
    .select({
      recipe: recipes,
      ingredients: recipeIngredients,
      steps: recipeSteps,
    })
    .from(recipes)
    .leftJoin(recipeIngredients, eq(recipeIngredients.recipeId, recipes.id))
    .leftJoin(recipeSteps, eq(recipeSteps.recipeId, recipes.id))
    .where(eq(recipes.id, id));

  if (!result.length) {
    return null;
  }

  return {
    ...result[0].recipe,
    ingredients: result.map(r => r.ingredients).filter(Boolean),
    steps: result.map(r => r.steps).filter(Boolean),
  };
} 