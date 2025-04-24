import { db } from "@/app/db";
import { recipeBinders } from "@/app/db/schema/recipe";
import { auth } from "@/app/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { NewRecipeForm } from "@/components/new-recipe-form";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function NewRecipePage({ params }: PageProps) {
  const [resolvedParams] = await Promise.all([params]);
  const { id } = resolvedParams;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const binder = await db.query.recipeBinders.findFirst({
    where: eq(recipeBinders.id, id),
  });

  if (!binder || binder.userId !== session.user.id) {
    redirect("/recipe-binders");
  }

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/recipe-binders" className="hover:text-gray-700">
          Recipe Binders
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href={`/recipe-binders/${id}`} className="hover:text-gray-700">
          {binder.name}
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-gray-900">New Recipe</span>
      </div>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Recipe</h1>
        <NewRecipeForm binderId={id} />
      </div>
    </div>
  );
} 