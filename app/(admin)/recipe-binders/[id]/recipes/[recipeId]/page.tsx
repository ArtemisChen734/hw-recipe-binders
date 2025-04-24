import { db } from '@/app/db';
import { recipes, recipeIngredients, recipeSteps } from '@/app/db/schema/recipe';
import { auth } from "@/app/auth";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { RecipeForm } from "@/components/recipe-form";

type PageProps = {
  params: Promise<{ id: string; recipeId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function EditRecipePage({ params }: PageProps) {
  const [resolvedParams] = await Promise.all([params]);
  const { id, recipeId } = resolvedParams;

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const recipe = await db.query.recipes.findFirst({
    where: eq(recipes.id, recipeId),
    with: {
      ingredients: true,
      steps: {
        orderBy: (steps, { asc }) => [asc(steps.stepNumber)],
      },
    },
  });

  if (!recipe) {
    return <div>Recipe not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/recipe-binders/${id}`} className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recipe Binder
          </Link>
        </Button>
      </div>

      <RecipeForm
        initialData={{
          name: recipe.name,
          description: recipe.description || "",
          ingredients: recipe.ingredients,
          steps: recipe.steps,
        }}
        recipeId={recipeId}
        binderId={id}
      />
    </div>
  );
} 