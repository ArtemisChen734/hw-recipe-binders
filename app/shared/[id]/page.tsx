import { db } from "@/app/db";
import { recipeShares, recipeBinders, recipes, recipeIngredients, recipeSteps } from "@/app/db/schema/recipe";
import { eq } from "drizzle-orm";
import { auth } from "@/app/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SharedRecipePage({ params }: PageProps) {
  const [resolvedParams] = await Promise.all([params]);
  const { id } = resolvedParams;
  
  // Check if share link is valid
  const share = await db.query.recipeShares.findFirst({
    where: eq(recipeShares.id, id),
  });

  if (!share) {
    return <div>Invalid share link</div>;
  }

  // Check if login is required
  if (share.requireLogin) {
    const session = await auth();
    if (!session?.user?.id) {
      redirect("/login");
    }
  }

  // Get recipe binder and recipes information
  const binder = await db.query.recipeBinders.findFirst({
    where: eq(recipeBinders.id, share.binderId),
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

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-6">{binder.name}</h1>
      {binder.description && (
        <p className="text-gray-600 mb-6">{binder.description}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {binder.recipes.map((recipe) => (
          <div key={recipe.id} className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{recipe.name}</h2>
            {recipe.description && (
              <p className="text-gray-600 mb-4">{recipe.description}</p>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
              <ul className="list-disc list-inside space-y-1.5">
                {recipe.ingredients.map((ingredient) => (
                  <li key={ingredient.id} className="text-gray-700">
                    <span className="font-medium">{ingredient.name}</span> - {ingredient.amount} {ingredient.unit}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Steps</h3>
              <ol className="list-decimal list-inside space-y-3">
                {recipe.steps.map((step) => (
                  <li key={step.id} className="text-gray-700">
                    {step.description}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 