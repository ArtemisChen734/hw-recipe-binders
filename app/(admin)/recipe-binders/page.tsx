import { db } from '@/app/db';
import { recipeBinders } from '@/app/db/schema/recipe';
import { auth } from "@/app/auth";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { PlusCircle, BookOpen, ChevronRight, User, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { users } from "@/app/db/schema/auth";
import { NewBinderDialog } from "@/components/new-binder-dialog";
import { DeleteBinderDialog } from "@/components/delete-binder-dialog";

export const metadata = {
  title: "Recipe Binders",
};

export default async function RecipeBindersPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Please Login
            </CardTitle>
            <CardDescription>
              You need to log in to view and manage your recipe binders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/login">
                Go to Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const binders = await db.query.recipeBinders.findMany({
    where: eq(recipeBinders.userId, userId),
  });

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          My Recipe Binders
        </h1>
        <NewBinderDialog />
      </div>

      {binders.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              No Recipe Binders Yet
            </CardTitle>
            <CardDescription>
              Create your first recipe binder to start organizing your recipes!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewBinderDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {binders.map((binder) => (
            <Card key={binder.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {binder.name}
                    </CardTitle>
                    {binder.description && (
                      <CardDescription>{binder.description}</CardDescription>
                    )}
                  </div>
                  <DeleteBinderDialog binderId={binder.id} binderName={binder.name} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <User className="h-4 w-4" />
                    {user?.name || user?.email || 'You'}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/recipe-binders/${binder.id}`}>
                      View Recipes
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 