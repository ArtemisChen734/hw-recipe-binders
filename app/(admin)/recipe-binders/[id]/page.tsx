import { db } from "@/app/db";
import { recipeBinders, recipes, recipeIngredients, recipeSteps, recipeShares } from "@/app/db/schema/recipe";
import { auth } from "@/app/auth";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { InferSelectModel } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { PlusCircle, ChevronRight, BookOpen, Utensils, Clock, User } from "lucide-react";
import { ShareButton } from "@/components/share-button";
import { users } from "@/app/db/schema/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteRecipeDialog } from "@/components/delete-recipe-dialog";

type Recipe = InferSelectModel<typeof recipes> & {
  ingredients: InferSelectModel<typeof recipeIngredients>[];
  steps: InferSelectModel<typeof recipeSteps>[];
};

type RecipeBinder = InferSelectModel<typeof recipeBinders> & {
  recipes: Recipe[];
  user: InferSelectModel<typeof users>;
};

export const metadata = {
  title: "Recipe Binder - Recipes",
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function RecipeBinderPage({ params, searchParams }: PageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  
  const session = await auth();
  const { id } = resolvedParams;
  const shareId = resolvedSearchParams.shareid;

  // If it's a share link, check share status
  if (shareId) {
    const share = await db.query.recipeShares.findFirst({
      where: eq(recipeShares.id, shareId as string),
    });

    if (!share) {
      return <div>Invalid share link</div>;
    }
  }

  const binder = await db.query.recipeBinders.findFirst({
    where: eq(recipeBinders.id, id),
    with: {
      recipes: {
        with: {
          ingredients: true,
          steps: {
            orderBy: (steps, { asc }) => [asc(steps.stepNumber)],
          },
        },
      },
    },
  });

  if (!binder) {
    return <div>Recipe binder not found</div>;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, binder.userId),
  });

  if (!user) {
    return <div>User not found</div>;
  }

  // Check if current user is the owner
  const isOwner = session?.user?.id === binder.userId;

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/recipe-binders" className="hover:text-gray-700">
          Recipe Binders
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-gray-900">{binder.name}</span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            {binder.name}
          </h1>
          {binder.description && (
            <p className="text-gray-600 mt-2">{binder.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <User className="h-4 w-4" />
            Created by {user.name || user.email || 'Unknown User'}
          </p>
        </div>
        {isOwner && (
          <div className="flex gap-4">
            <ShareButton binderId={id} />
            <Button asChild>
              <Link href={`/recipe-binders/${id}/recipes/new`}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Recipe
              </Link>
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {binder.recipes.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No recipes found. Click the button above to create your first recipe!</p>
          </div>
        ) : (
          binder.recipes.map((recipe) => (
            <Card key={recipe.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="relative">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Utensils className="h-5 w-5" />
                      {recipe.name}
                    </CardTitle>
                    {recipe.description && (
                      <CardDescription>{recipe.description}</CardDescription>
                    )}
                  </div>
                  {isOwner && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/recipe-binders/${id}/recipes/${recipe.id}`}>
                          Edit
                        </Link>
                      </Button>
                      <DeleteRecipeDialog
                        recipeId={recipe.id}
                        recipeName={recipe.name}
                      />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-2 text-gray-900">Ingredients</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {recipe.ingredients.map((ingredient) => (
                        <li key={ingredient.id}>
                          {ingredient.name} - {ingredient.amount} {ingredient.unit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2 text-gray-900">Steps</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                      {recipe.steps.map((step) => (
                        <li key={step.id}>{step.description}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 