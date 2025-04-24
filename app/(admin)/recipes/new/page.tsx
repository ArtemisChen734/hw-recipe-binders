import { createRecipe, addIngredient, addStep } from '@/app/db/actions/recipe';
import { auth } from "@/app/auth";

export default async function NewRecipePage() {
  const session = await auth();
  if (!session?.user?.id) {
    return <div>请先登录</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">添加新食谱</h1>
      <form action={async (formData: FormData) => {
        "use server";
        const binderId = formData.get("binderId") as string;
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        
        const recipe = await createRecipe(binderId, name, description);
        
        // 处理食材
        const ingredients = formData.getAll("ingredients") as string[];
        for (const ingredient of ingredients) {
          const [name, amount, unit] = ingredient.split("|");
          await addIngredient(recipe.id, name, amount, unit);
        }
        
        // 处理步骤
        const steps = formData.getAll("steps") as string[];
        for (let i = 0; i < steps.length; i++) {
          await addStep(recipe.id, i + 1, steps[i]);
        }
      }}>
        <div className="space-y-4">
          <div>
            <label htmlFor="binderId" className="block text-sm font-medium text-gray-700">
              食谱夹
            </label>
            <input
              type="text"
              id="binderId"
              name="binderId"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              食谱名称
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              描述
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">食材</label>
            <div id="ingredients" className="mt-2 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  name="ingredients"
                  placeholder="食材名称"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  name="ingredients"
                  placeholder="用量"
                  className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  name="ingredients"
                  placeholder="单位"
                  className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">步骤</label>
            <div id="steps" className="mt-2 space-y-2">
              <textarea
                name="steps"
                placeholder="步骤描述"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              保存
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 