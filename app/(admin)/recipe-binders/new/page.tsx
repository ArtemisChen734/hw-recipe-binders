import { createRecipeBinder } from '@/app/db/actions/recipe';
import { auth } from "@/app/auth";

export default async function NewRecipeBinderPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return <div>请先登录</div>;
  }

  const userId = session.user.id;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">添加新食谱夹</h1>
      <form action={async (formData: FormData) => {
        "use server";
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        
        await createRecipeBinder(userId, name, description);
      }}>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              食谱夹名称
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