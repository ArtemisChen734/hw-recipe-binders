"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createRecipe } from "@/app/actions/recipes";
import { Plus, Trash2 } from "lucide-react";

interface NewRecipeFormProps {
  binderId: string;
}

export function NewRecipeForm({ binderId }: NewRecipeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<{ name: string; amount: string; unit: string }[]>([
    { name: "", amount: "", unit: "" }
  ]);
  const [steps, setSteps] = useState<{ description: string; stepNumber: number }[]>([
    { description: "", stepNumber: 1 }
  ]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    try {
      await createRecipe({
        name,
        description,
        binderId,
        ingredients,
        steps,
      });
      router.push(`/recipe-binders/${binderId}`);
    } catch (err) {
      setError("Failed to create recipe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "", unit: "" }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: "name" | "amount" | "unit", value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const addStep = () => {
    setSteps([...steps, { description: "", stepNumber: steps.length + 1 }]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index).map((step, i) => ({ ...step, stepNumber: i + 1 })));
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], description: value };
    setSteps(newSteps);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Enter recipe name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Enter recipe description"
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Ingredients</Label>
          <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
            <Plus className="h-4 w-4 mr-2" />
            Add Ingredient
          </Button>
        </div>
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex gap-4">
            <Input
              placeholder="Ingredient name"
              value={ingredient.name}
              onChange={(e) => updateIngredient(index, "name", e.target.value)}
              required
            />
            <Input
              placeholder="Amount"
              value={ingredient.amount}
              onChange={(e) => updateIngredient(index, "amount", e.target.value)}
              required
            />
            <Input
              placeholder="Unit (e.g. g, ml, pcs)"
              value={ingredient.unit}
              onChange={(e) => updateIngredient(index, "unit", e.target.value)}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeIngredient(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Steps</Label>
          <Button type="button" variant="outline" size="sm" onClick={addStep}>
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
        </div>
        {steps.map((step, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder={`Step ${step.stepNumber}`}
                value={step.description}
                onChange={(e) => updateStep(index, e.target.value)}
                required
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeStep(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Recipe"}
      </Button>
    </form>
  );
} 