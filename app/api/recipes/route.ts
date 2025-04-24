import { NextResponse } from "next/server";
import { db } from "@/app/db";
import { recipes, recipeIngredients, recipeSteps, recipeBinders } from "@/app/db/schema/recipe";
import { auth } from "@/app/auth";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { binderId, name, description, ingredients, steps } = await request.json();

    // 验证食谱夹是否存在且属于当前用户
    const [binder] = await db
      .select()
      .from(recipeBinders)
      .where(eq(recipeBinders.id, binderId))
      .limit(1);

    if (!binder) {
      return NextResponse.json({ error: "食谱夹不存在" }, { status: 404 });
    }

    if (binder.userId !== session.user.id) {
      return NextResponse.json({ error: "无权访问此食谱夹" }, { status: 403 });
    }

    // 创建食谱
    const [recipe] = await db
      .insert(recipes)
      .values({
        binderId,
        name,
        description,
      })
      .returning();

    // 创建食材
    if (ingredients.length > 0) {
      await db.insert(recipeIngredients).values(
        ingredients.map((ingredient: any) => ({
          recipeId: recipe.id,
          name: ingredient.name,
          amount: ingredient.amount,
          unit: ingredient.unit,
        }))
      );
    }

    // 创建步骤
    if (steps.length > 0) {
      await db.insert(recipeSteps).values(
        steps.map((step: any, index: number) => ({
          recipeId: recipe.id,
          stepNumber: index + 1,
          description: step.description,
        }))
      );
    }

    return NextResponse.json({ success: true, recipe });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json(
      { error: "创建食谱失败" },
      { status: 500 }
    );
  }
} 